# aws-learning
This project was created in the 3rd to 9th of August 2021, during my Education Week at the
Altkom Software & Consulting.

Here, you will find some information about what I learned and what difficulties I had
while learning to deploy my application with AWS Services.

## What is this project?

I decided to create a simple web-chat application for everyone with open registration.

When the application is opened, Amplify checks the user's credentials saved in the local storage
against Cognito's data. I created a Cognito User Pool (containing `nickname` as a mandatory registration field)
with a web app (this one) connected to it.
If the user is logged in, he enters the message window. If not, he needs to login or register.

Login needs a username in form of an email, as well as the password. Password policy has been lowered
down due to it being a test application. Registration form adds another field called `nickname` that
prompts the user to enter his name which will be visible in the application. The registration confirmation has not
been implemented (but still exists), and it was done manually with AWS CLI.

The main application consists of the:
- header with simple information
- online list on the left
- chat history on the right (unavailable when you didn't choose the person to talk to)
- writing window on the bottom (unavailable when you didn't choose the person to talk to)

After the user is successfully authenticated, he connects to the websocket which is
guarded with custom JWT authorization (taken in most part from https://github.com/yai333/QuestionAnswerChatbot
to save time and not re-write everything from scratch; you can check my notes about custom authorization
in the section `Writing AWS Lambda function to check if requester is authorized`). In short, lambda function
is a NodeJS application that decodes the sections of JWT and checks them against the Cognito
public information. When everything matches, his connection credentials (connectionId + nickname) are saved
into the DynamoDB table, which can be accessed later to inform the user through WS that there is a new message.
After all of this happens, we come back to user who gets connected to websocket and who sends the info that he is online.
Websocket informs everyone that the online list has been updated and sends the new info that will be displayed
to everyone on the list to the left.

When the user clicks on the recipient on the left, chat history and input field get notified and
are being unblocked. When this happens, user requests the chat-history with a given nickname through
HttpApi endpoint on API Gateway (which is also secured with JWT authorization, but the default one, not a custom one).
Then, the DynamoDB other table with chat history is being scanned for the messages that come out or in
to both people talking to each other. All the chat history is being sent back to the user who immediately
sees it.

When the user writes the message, it's being sent through the websocket with the information about who it
comes from, who it goes to, the message itself and the date of sending. Websocket uses a proper Lambda handler
by the type of message sent in `request.body.action` (e.g. here - `sendMessage`). It gets saved in the database and
then is being sent to the recipient of this message. The handler for this lambda function searches database
for the connectionId associated with the given nicknames and sends the data there through websocket. Both users
on the other ends receives the message and add it to their chat history.

Overall, the backend part was deployed by the tool `serverless` and consists of:
- Two DynamoDB tables (Connection Info and Chat History)
- A NodeJS application as a Lambda function with:
    - Five handlers for five different websocket triggers
    - One handler for one Http Api trigger (chat history)
- S3 bucket with the artifact used in the Lambda function (detailed above)
- An API Gateway with:
    - Websocket
    - HttpApi endpoint with default JWT authorizer
- IAM roles to query DynamoDB, manage websocket connections
- CloudWatch logs for every Lambda function

Also, there was manually added and configured:
- Cognito pool + Cognito app client

To deploy the backend, you need to use the command `sls deploy --stage dev`.

You can open the frontend application directly by calling `ng serve`.

## What more can be done to this project?
For the lack of time, this project is unfinished. There are some things that would be best added here:
- Implement registration confirmation
- Sending new message through regular httpApi, not websocket?
- Instead of sending the information about being online to websocket, it should be automatically handled
  after him being connected (to prevent him from manually spamming users about it), and he should manually
  download the online list by himself.
- Some form of a local storage (e.g. IndexedDB) for saving the messages (as well as saving the
  messages from the not active conversation - right now, if they come through websocket, they
  are just being ignored because we don't have any local storage for messages yet).
- The information about new message from the other person than selected at the given moment.
- For sure, there needs to be some form of checking that the requester is the same person who
wants to get the owner's messages in the REST API (right now, there is a default authorization
  so no one unauthorized will download the chat-history, but it would be best to check the requester
  with his request params, especially 'from' param)
- It would be good to add lazy loading of the messages
- There could be some settings and logout added
- Friend-list, as well as some filter to the online-list
- Read/unread messages
- Sent/unsent messages

## Notes:
### AWS Toolkit for JetBrains
https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html

AWS Toolkit is an open source plugin that helps to create, manage and test different AWS services, e.g. AWS Lambda, Amazon ECS, RDS, S3 etc.

You simply install it from the plugins menu and connect to an AWS account.

Then, follow one of the tutorials on the site to create various services.

### Writing AWS Lambda function to check if requester is authorized
https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-verifying-a-jwt.html

When user sends a request (in this app example, to connect to the websocket, so this authorization only happens once), he should send it with the JSON Web Token he gets after the authorization in Cognito through Amplify (signInUserSession.accessToken.jwtToken).

"The JWT signature is a hashed combination of the header and the payload. Amazon Cognito generates two pairs of RSA cryptographic keys for each user pool. One of the private keys is used to sign the token. "
https://github.com/awslabs/aws-support-tools/tree/master/Cognito/decode-verify-jwt

JWT consists of three sections: header, payload, signature in the form of 11111111111.22222222222.33333333333. First, you should check that the token's pattern.

Then, you should decode the header part of the token (11111111111 in the example above it). The following will be the result:

```
{
  "kid": "abcdefghijklmnopqrsexample=",
  "alg": "RS256"
}
```

'kid' is a key ID which, in the last step, needs to be compared with the public key which is available at an address in this format:

https://cognito-idp.{region}.amazonaws.com/{userPoolId}/.well-known/jwks.json

```
{
    "keys": [{
        "alg": "RS256",
        "e": "AQAB",
        "kid": "abcdefghijklmnopqrsexample=",
        "kty": "RSA",
        "n": "lsjhglskjhgslkjgh43lj5h34lkjh34lkjht3example",
        "use": "sig"
    }, {
        "alg": "RS256",
        "e": "AQAB",
        "kid": "fgjhlkhjlkhexample=",
        "kty": "RSA",
        "n": "sgjhlk6jp98ugp98up34hpexample",
        "use": "sig"
    }]
}
```

To verify the signature of an Amazon Cognito JWT, search for the key with a key ID that matches the key ID of the JWT, then use libraries to decode the token and verify the signature. 

You can also verify the information in the payload. In the above example, after decoding the payload of 22222222222, we should get the object with the following fields:

```
{
  "sub": "aaaaaaaa-bbbb-cccc-dddd-example",
  "aud": "xxxxxxxxxxxxexample",
  "email_verified": true,
  "token_use": "id",
  "auth_time": 1500009400,
  "iss": "https://cognito-idp.ap-southeast-2.amazonaws.com/ap-southeast-2_example",
  "cognito:username": "anaya",
  "exp": 1500013000,
  "given_name": "Anaya",
  "iat": 1500009400,
  "email": "anaya@example.com"
}
```

You can also verify that:

- The token is not expired.
- The audience ("aud") specified in the payload matches the app client ID created in the Amazon Cognito user pool.
- The issuer ("iss") matches the user pool id
- Check the "token_use" claim.
    - If you are only accepting the access token in your web API operations, its value must be access.
    - If you are only using the ID token, its value must be id.
    - If you are using both ID and access tokens, the token_use claim must be either id or access.


### Serverless.com
Serverless is a tool to automatically deploy a defined architecture to cloud. It supports AWS, Azure, Google Cloud, Knative & more. It uses yaml files.

### DynamoDB
DynamoDB is a NoSQL database that supports key-value pairs and documents.

While defining the DynamoDB with serverless, I got the following error:
```
An error occurred: ChatHistoryTable - One or more parameter values were invalid: Some AttributeDefinitions are not used. AttributeDefinitions: [date, from, to, message, requestId], keys used: [requestId, from, to] (Service: AmazonDynamoDBv2; Status Code: 400; Error Code: ValidationException; Request ID: RD0LI6PD5GBSTR0GIVQTI0FBCBVV4KQNSO5AEMVJF66Q9ASUAAJG; Proxy: null).
```
Apparently, while defining the table with Serverless/CloudFormation, we don't have to specify
exact attributes that will be stored in this table. We type out in the `Properties.AttributeDefinitions` only
the ones that will be used as keys/indexes.

The second thing I didn't like is the toned down queries. While the official document says you can use AND and OR queries:

https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GettingStarted.NodeJs.04.html

I got awful time while trying to make it into use. The Internet was certain that it's not possible to use
operators "AND", "OR", or "BETWEEN" in the `KeyConditionExpression` while making API calls. It's worth taking another look at it, because
so far, I got many errors, alongside with `ValidationException: Query key condition not supported` as well
as `ValidationException: Query condition missed key schema element: requestId`. For this issue, I needed
to settled with another method called `scan()` although they say it's not preferable to run with selects.

### Edu log:
03.08.2021
1. Thinking about the application
- Frontend interacts with the user
- User can log-in to the frontend with Amplify and Cognito (four accounts for testing), as well as register
- After logging in, there is a header, a list of users on the left, the chat history on the right and underneath it, the textarea where you write your message
- There is a view of active and inactive chat users
- Clicking on the user gives you the ability to write to him/her
- If there is no chat history, there is an information about the possibility to write to user
- The history of chat is saved into the database
- Lambda waits for the database to update so that it can react to it => send the message to the other player
- Other chat member gets notified asynchronously with Lambda
2. Created frontend application with mocks

04.08.2021
1. Got the access to AWS
2. I learned about "serverless" and setting up API Gateway Websocket with Lambda functions that handle connections and messages.
3. Wrote down information about authorization through AWS Lambda.
4. Learned about AWS Toolkit for JetBrains.

05.08.2021
1. Set up Cognito
  - Created cognito-pool to sign-in and sign-up with nickname required attribute and signing up by email
  - Created the following users:
    - username: Arek@asd.com, nickname: Arek, password: qwer1234
    - username: Konrad@asd.com, nickname: Konrad, password: qwer1234
  - Authorized them with:
  ```
  aws cognito-idp admin-set-user-password \
    --user-pool-id XXX \
    --username Arek@asd.com \
    --password qwer1234 \
    --permanent
  ```
  - For changing attributes manually, I used:
  ```
  aws cognito-idp admin-update-user-attributes \
    --user-pool-id  XXX \
    --username Arek@asd.com \
    --user-attributes Name="nickname",Value="Arek"
  ```
2. Set up AWS services using serverless:
    - API Gateway Websocket
    - S3 bucket with Lambda code handlers
    - Lambda handlers
    - CloudWatch Logs for Lambda handlers
    - IAM roles
    - DynamoDB tables for connections
3. Managed to connect from app to the websocket in API Gateway
4. Managed to successfully implement one-time-only chat

06.08.2021
1. Learned about DynamoDB and JS API query() / scan() methods
2. Wrote lambda functions for returning online / active people
3. Created a DynamoDB table for storing the messages and implemented saving
4. Created httpApi endpoint with a default JWT authorization to get the chat history from DynamoDB table
5. Imported chat history while entering some conversation

09.08.2021
1. Cleaned up the app
2. Implemented registration
3. Created a description for the app
