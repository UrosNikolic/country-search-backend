const createError = require('http-errors')
const middy = require('@middy/core')
const httpErrorHandler = require('@middy/http-error-handler')
const httpJsonBodyParser = require('@middy/http-json-body-parser')
const { buildResponse } = require('../helpers/build-response')
const { call } = require('../helpers/dynamodb')

async function createListItem(item) {
  const name = item.name.toLowerCase().replace(/\s/g, "")
  const params = {
    TableName: process.env.countryListTable,
    Item: {
      PK: 'COUNTRY',
      SK: `CREATED_AT#${(new Date()).toISOString()}`,
      GSI1PK: 'COUNTRY',
      GSI1SK: `NAME#${name}`,
      name: item.name,
      flag: item.flag
    }
  }

  await call('put', params)
}

async function getListItem(name) {
  const parsedName = name.toLowerCase().replace(/\s/g, '')

  const queryParams = {
    TableName : process.env.countryListTable,
    KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
    ExpressionAttributeValues: {
      ':pk': 'COUNTRY',
      ':sk': `NAME#${parsedName}`,
    }
  }

  const { Items } = await call('query', queryParams)

  return Items[0]
}

async function validatePayload({ name, flag }) {
  if (!name || !flag) {
    throw new createError.UnprocessableEntity('Required keys missing')
  }

  const listItem = await getListItem(name)

  if(listItem) {
    throw new createError.UnprocessableEntity('Item already added')
  }
}

module.exports.handler = middy(async (event) => {
  const country = event.body

  await validatePayload(country)

  await createListItem(country)

  return buildResponse({ message: 'success'}, 201)
})
  .use(httpJsonBodyParser())
  .use(httpErrorHandler())
