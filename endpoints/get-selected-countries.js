const { call } = require('../helpers/dynamodb')
const { buildResponse } = require('../helpers/build-response')

async function getListItems() {
  const params = {
    TableName : process.env.countryListTable,
    KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
    ExpressionAttributeValues: {
      ':pk': 'COUNTRY',
      ':sk': 'CREATED_AT',
    },
    ProjectionExpression: '#countryName, flag',
    ExpressionAttributeNames: { '#countryName': 'name' },
    ScanIndexForward: true
  }

  const { Items } = await call('query', params)

  return Items
}

module.exports.handler = async () => {
  const countryList = await getListItems()

  return buildResponse(countryList, 200)
};
