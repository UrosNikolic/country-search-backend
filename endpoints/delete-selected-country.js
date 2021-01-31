const createError = require('http-errors')
const middy = require('@middy/core')
const httpErrorHandler = require('@middy/http-error-handler')
const { buildResponse } = require('../helpers/build-response')
const { call } = require('../helpers/dynamodb')

async function deleteListItem(PK, SK) {
  const deleteParams = {
    TableName: process.env.countryListTable,
    Key: {
      PK,
      SK,
    }
  }

  await call('delete', deleteParams)
}

async function getListItem(name) {
  const parsedName = name.toLowerCase().replace(/\s/g, '')

  const queryParams = {
    TableName : process.env.countryListTable,
    IndexName: 'GSI1',
    KeyConditionExpression: "GSI1PK = :pk AND begins_with(GSI1SK, :sk)",
    ExpressionAttributeValues: {
      ':pk': 'COUNTRY',
      ':sk': `NAME#${parsedName}`,
    }
  }

  const { Items } = await call('query', queryParams)

  return Items[0]
}

module.exports.handler = middy(async (event) => {
  const name = decodeURI(event.pathParameters.name).trim()

  const listItem = await getListItem(name)

  if(!listItem) {
    throw new createError.UnprocessableEntity(`List item ${name} does not exist`)
  }

  await deleteListItem(listItem.PK, listItem.SK)

  return buildResponse({ message: 'success'}, 200)
})
  .use(httpErrorHandler())
