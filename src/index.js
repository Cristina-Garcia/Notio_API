require('dotenv').config()

const axios = require('axios')
const { Client } = require('@notionhq/client')
const notion = new Client({ auth: process.env.NOTION_KEY }) // Initializing a client

console.log(process.env.NOTION_KEY)

const pokeArray = []

//For take the first pokemon data
async function getPokemonData() {
  await axios
    .get(`https://pokeapi.co/api/v2/pokemon/1`)
    .then((poke) => {
      //this code is for get an array for all the types from the pokemon
      const typesArray = []
      for (let t of poke.data.types) {
        const typeObject = {
          name: t.type.name,
        }
        typesArray.push(typeObject)
      }
      const pokeData = {
        name: poke.data.name,
        id: poke.data.id,
        hp: poke.data.stats[0].base_stat,
        types: typesArray,
      }
      pokeArray.push(pokeData)
    })
    .catch((error) => {
      console.log(error)
    })
  createNotionPage()
}
getPokemonData()
async function createNotionPage() {
  for (let pokemon of pokeArray) {
    const response = await notion.pages.create({
      parent: {
        type: 'database_id',
        database_id: process.env.NOTION_DATABASE_ID,
      },
      properties: {
        NAME: {
          title: [
            {
              type: 'text',
              text: { content: pokemon.name },
            },
          ],
        },
        ID: { number: pokemon.id },
        HP: { number: pokemon.hp },
        TYPES: { multi_select: pokemon.types },
      },
    })
  }
}
