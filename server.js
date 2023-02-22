const http = require('http');
const { DatabaseError } = require('./models/DatabaseError');
const { InvalidInputError } = require('./models/InvalidInputError');
require('dotenv').config();
const port = 1339;
const model = require("./models/userAccountModelMongoDb");
const pokemonsCollectionName = "user_account";
require('dotenv').config();

const url = process.env.URL_PRE + process.env.MONGODB_PWD + process.env.URL_POST;

let initialized = model.initialize(pokemonsCollectionName, false, url); // false doesnt reset database


http.createServer(async function (request,response) {
    await initialized;
    response.writeHead(200, {'Content-Type': 'text/plain'});
    // =================================================================
    // Create
    // =================================================================
    response.write(await handleAddPokemon("Pikachu","Electric"))

    // =================================================================
    // Read
    // =================================================================
    // Valid names
    response.write(await handleReadPokemon("eevee"));
    response.write(await handleReadPokemon("Pikachu"));

    // Invalid Names
    response.write(await handleReadPokemon("DarkLord1"));
    console.table(await model.getAllPokemon());
    response.end('Hello World!'); 
    
}).listen(port);

/**
 * Helper function when creating and validation pokemon objects to be added to mongodb database
 * @param {*} pokemonName to add to database
 * @param {*} pokemonType to add to database
 * @returns String containing success or failure messages
 */
async function handleAddPokemon(pokemonName, pokemonType){
    try {
        // Create pokemon object
        let pokemon = await model.addPokemon(pokemonName, pokemonType);
        
        // Check edgecase where pokemon returns null
        if(pokemon == null)
            throw new Error(`ERROR Got null result when adding. Should never happen. \nFailed Data: "${pokemonName}", "${pokemonType}" \n==============\n`)
        else return `Adding pokemon successful, \nName: ${pokemon.name} \nType: ${pokemon.type} \n==============\n`;

    } catch (err) {
        // Various Error Messages
        if ( error instanceof InvalidInputError){
            return `Adding Pokemon Failed: ${err.message}\nFailed Data: "${pokemonName}", "${pokemonType}" \n==============\n`;
         }
         else if( error instanceof DatabaseError){
            return `Adding Pokemon Failed: ${err.message}\n==============\n`;
         }else{
             return "****** Unexpected error, check logs:  " + err;
         }
    }
}

async function handleReadPokemon(pokemonName){
    try {
        // Create pokemon object
        let pokemon = await model.getSinglePokemon(pokemonName);
        
        // Check edgecase where pokemon returns null
        if(pokemon == undefined)
            return `Read pokemon failed \nPokemon with name: "${pokemonName}", was not found\n==============\n`;
        else return `Read pokemon successful, \nName: ${pokemon.name} \nType: ${pokemon.type} \n==============\n`;

    } catch (err) {
        // Various Error Messages
         if( err instanceof DatabaseError){
            return `Adding Pokemon Failed: ${err.message}\n==============\n`;
         }else{
             return `****** Unexpected error, check logs:\n${err.message}\n==============\n`;
         }
    }
}