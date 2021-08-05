# aws-backend

To speed up the process with serverless, most of the code was taken from:

https://github.com/yai333/QuestionAnswerChatbot

Author: yai333

Original README.md:

## Deploying WebSocket API in API Gateway to process the question and answer messages

Build a 1) WebSockets API in AWS API Gateway, 2) create lambda functions to manage WebSockets routes ($connect, $disconnect, sendMessage) and 3) create DynamoDb to store WebSockets connectionIds and user name.

### Deploy Serverless Project

```
sls deploy
```
