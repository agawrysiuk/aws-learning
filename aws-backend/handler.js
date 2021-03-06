"use strict";

const AWS = require("aws-sdk");
const DDB = new AWS.DynamoDB({ apiVersion: "2012-10-08" });
const jose = require("node-jose");
const fetch = require("node-fetch");
const KEYS_URL = `https://cognito-idp.eu-west-1.amazonaws.com/eu-west-1_OV4db5SvL/.well-known/jwks.json`;
const successfullResponse = {
  statusCode: 200,
  body: "Connected",
};

module.exports.connectionManager = async (event, context, callback) => {
  if (event.requestContext.eventType === "CONNECT") {
    try {
      await addConnection(
        event.requestContext.connectionId,
        event.queryStringParameters.username
      );
      callback(null, successfullResponse);
    } catch (error) {
      callback(null, JSON.stringify(error));
    }
  } else if (event.requestContext.eventType === "DISCONNECT") {
    try {
      await deleteConnection(event.requestContext.connectionId);
      await this.getConnectedList(event, context, callback);
      callback(null, successfullResponse);
    } catch (error) {
      callback(null, {
        statusCode: 500,
        body: "Failed to connect: " + JSON.stringify(err),
      });
    }
  }
};

module.exports.defaultMessage = (event, context, callback) => {
  callback(null);
};

module.exports.sendMessage = async (event, context, callback) => {
  console.log("sendMessage start with event: " + JSON.stringify(event));
  let connectionData;
  try {
    const { body } = event;
    const messageBodyObj = JSON.parse(body);
    const params = {
      IndexName: "userid_index",
      KeyConditionExpression: "userid = :u",
      ExpressionAttributeValues: {
        ":u": {
          S: JSON.parse(messageBodyObj.data).to || "Arek",
        },
      },
      TableName: process.env.CHATCONNECTION_TABLE,
    };
    connectionData = await DDB.query(params).promise();
  } catch (err) {
    console.log(err);
    return { statusCode: 500 };
  }

  await storeMessage(JSON.parse(JSON.parse(event.body).data), event.requestContext.requestId);

  const postCalls = createPostCalls(event, connectionData.Items, JSON.parse(event.body).data);

  try {
    await Promise.all(postCalls);
  } catch (err) {
    console.log(err);
    callback(null, JSON.stringify(err));
  }
  callback(null, successfullResponse);
};

const storeMessage = async (data, requestId) => {
  const putParams = {
    TableName: process.env.CHATHISTORY_TABLE,
    Item: {
      requestId: { S: requestId },
      message: { S: data.message },
      date: { S: data.date },
      from: { S: data.from },
      to: { S: data.to },
    },
  };

  return DDB.putItem(putParams).promise();
}

module.exports.getConnectedList = async (event, context, callback) => {
  try {
    const allConnected = await getAllConnected();
    const dataString = {online: allConnected.Items.map(conn => conn.userid.S)};
    const postCalls = createPostCalls(event, allConnected.Items, JSON.stringify(dataString));
    await Promise.all(postCalls);
  } catch (err) {
    console.log(err);
    callback(null, JSON.stringify(err));
  }
  callback(null, successfullResponse);
}

const createPostCalls = (event, list, data) => {
  return list.map(async ({ connectionId }) => {
    try {
      return await send(event, connectionId.S, data);
    } catch (err) {
      if (err.statusCode === 410) {
        return await deleteConnection(connectionId.S);
      }
      console.log(JSON.stringify(err));
      throw err;
    }
  });
}

const send = (event, connectionId, postData) => {
  const apigwManagementApi = new AWS.ApiGatewayManagementApi({
    apiVersion: "2018-11-29",
    endpoint:
      event.requestContext.domainName + "/" + event.requestContext.stage,
  });
  return apigwManagementApi
    .postToConnection({ ConnectionId: connectionId, Data: postData })
    .promise();
};

const addConnection = (connectionId, userid) => {
  const putParams = {
    TableName: process.env.CHATCONNECTION_TABLE,
    Item: {
      connectionId: { S: connectionId },
      userid: { S: userid },
    },
  };

  return DDB.putItem(putParams).promise();
};

const deleteConnection = (connectionId) => {
  const deleteParams = {
    TableName: process.env.CHATCONNECTION_TABLE,
    Key: {
      connectionId: { S: connectionId },
    },
  };

  return DDB.deleteItem(deleteParams).promise();
};

const getAllConnected = () => {
  const connectedParams = {
    TableName: process.env.CHATCONNECTION_TABLE
  };

  return DDB.scan(connectedParams).promise();
}

module.exports.chatHistory = async (event, context, callback) => {
  console.log(event);
  console.log(context);
  let chatHistory;

  const params = {
    TableName: process.env.CHATHISTORY_TABLE,
    FilterExpression: "(#from = :xx AND #to = :yy) OR (#from = :yy AND #to = :xx)",
    ExpressionAttributeNames: {
      "#from": "from",
      "#to": "to"
    },
    ExpressionAttributeValues: {
      ":xx": {
        S: event.queryStringParameters.from
      },
      ":yy": {
        S: event.queryStringParameters.to
      }
    }
  };

  try {
    chatHistory = await DDB.scan(params).promise();
    console.log("chat history:");
    console.log(chatHistory);
  } catch (error) {
    console.log(error);
    return {statusCode: 500};
  }

  chatHistory = chatHistory.Items.map(item => {
    return {
      message: item.message.S,
      date: item.date.S,
      from: item.from.S,
      to: item.to.S
    };
  });

  const response = {
    statusCode: 200,
    body: JSON.stringify({
      messages: chatHistory,
    }),
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    }
  };

  callback(null, response);
};

module.exports.authFunc = async (event, context, callback) => {
  const {
    queryStringParameters: { token },
    methodArn,
  } = event;

  let policy;

  try {
    policy = await authCognitoToken(token, methodArn);
    callback(null, policy);
  } catch (error) {
    console.log(error);
    callback("Signature verification failed");
  }
};

const authCognitoToken = async (token, methodArn) => {
  if (!token) throw new Error("Unauthorized");
  const app_client_id = '7e4gp9lh414sg0qjaavh9pvhoo';
  const sections = token.split(".");
  let authHeader = jose.util.base64url.decode(sections[0]);
  authHeader = JSON.parse(authHeader);
  const kid = authHeader.kid;
  const rawRes = await fetch(KEYS_URL);
  const response = await rawRes.json();
  if (rawRes.ok) {
    const keys = response["keys"];
    let key_index = -1;
    keys.some((key, index) => {
      if (kid == key.kid) {
        key_index = index;
      }
    });
    const foundKey = keys.find((key) => {
      return kid === key.kid;
    });

    if (!foundKey) {
      callback("Public key not found in jwks.json");
    }

    const jwkRes = await jose.JWK.asKey(foundKey);
    const verifyRes = await jose.JWS.createVerify(jwkRes).verify(token);
    const claims = JSON.parse(verifyRes.payload);

    const current_ts = Math.floor(new Date() / 1000);
    if (current_ts > claims.exp) {
      throw new Error("Token is expired");
    }

    if (claims.client_id != app_client_id) {
      throw new Error("Token was not issued for this audience");
    } else {
      return generatePolicy("me", "Allow", methodArn);
    }
  }
  throw new Error("Keys url is invalid");
};

const generatePolicy = function (principalId, effect, resource) {
  var authResponse = {};
  authResponse.principalId = principalId;
  if (effect && resource) {
    var policyDocument = {};
    policyDocument.Version = "2012-10-17";
    policyDocument.Statement = [];
    var statementOne = {};
    statementOne.Action = "execute-api:Invoke";
    statementOne.Effect = effect;
    statementOne.Resource = resource;
    policyDocument.Statement[0] = statementOne;
    authResponse.policyDocument = policyDocument;
  }
  return authResponse;
};

const generateAllow = function (principalId, resource) {
  return generatePolicy(principalId, "Allow", resource);
};

const generateDeny = function (principalId, resource) {
  return generatePolicy(principalId, "Deny", resource);
};
