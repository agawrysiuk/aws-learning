# aws-learning
This project was created in 3-9th of August 2021, during my Education Week at
Altkom Software & Consulting.

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
