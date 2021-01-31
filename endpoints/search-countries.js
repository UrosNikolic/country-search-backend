const axios = require('axios')
const { buildResponse } = require('../helpers/build-response')
const { customCountries } = require('../helpers/custom-countries')

const COUNTRIES_API_URL = process.env.COUNTRIES_API_URL

function removeDuplicates(countriesApiData, customCountriesData) {
  return countriesApiData.filter((country) => {
    return !customCountriesData.some((customCountry) => customCountry.name === country.name)
  })
}

async function searchCountriesApi(name) {
  try {
    const { data } = await axios.get(`${COUNTRIES_API_URL}/rest/v2/name/${name}?fields=name;flag`)

    return data
  } catch (err) {
    console.warn(`Error finding country ${name}`, err)
    return []
  }
}

function searchCustomCountries(name) {
  return customCountries.filter((country) => country.name.toLowerCase().includes(name))
}

async function getCountries(name) {
  let countriesData = []
  const customCountriesData = searchCustomCountries(name)

  if (customCountriesData.length < 5) {
    const response = await searchCountriesApi(name)
    const filteredResponse = removeDuplicates(response, customCountriesData)
    countriesData = filteredResponse.slice(0, 5 - customCountriesData.length)
  }

  return [
    ...customCountriesData,
    ...countriesData
  ]
}

module.exports.handler = async (event) => {
    const name = decodeURI(event.pathParameters.name).trim()

    const countries = await getCountries(name)

    return buildResponse(countries)
};
