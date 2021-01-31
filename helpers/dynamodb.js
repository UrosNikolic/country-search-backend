const { DynamoDB, config } = require('aws-sdk')

function call(action, params) {
  config.update({ region: 'us-east-1' })

  const options = {
    region: 'us-east-1'
  }

  const dynamoDb = new DynamoDB.DocumentClient(options)

  return dynamoDb[action](params).promise()
}

module.exports = { call }
