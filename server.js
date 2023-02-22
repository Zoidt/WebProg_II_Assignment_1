const http = require('http');
const { DatabaseError } = require('./models/DatabaseError');
const { InvalidInputError } = require('./models/InvalidInputError');
require('dotenv').config();
const port = 1339;
const model = require("./models/accountModelMongoDb");
const userAccountCollectionName = "user_account";
require('dotenv').config();

const url = process.env.URL_PRE + process.env.MONGODB_PWD + process.env.URL_POST;

let initialized = model.initialize(userAccountCollectionName, false, url); // false doesnt reset database


http.createServer(async function (request,response) {
    await initialized;
    response.writeHead(200, {'Content-Type': 'text/plain'});
    // =================================================================
    // Create
    // =================================================================

    // TODO: Static normal names/usernames, then fakerJS
    response.write(await handleAddAccount("Pikachu","Electric"))

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
 * Helper function when creating and validation user objects to be added to mongodb database
 * @param {*} username to add to database
 * @param {*} password to add to database
 * @returns String containing success or failure messages
 */
async function handleAddAccount(username, password){
    try {
        // Create pokemon object
        let account = await model.addPokemon(username, password);
        
        // Check edge cases where pokemon returns null
        if(account == null)
            throw new Error(`ERROR Got null result when adding. Should never happen. \nFailed Data: "${username}", "${password}" \n==============\n`)
        else return `Creating account successful, \nUsername: ${account.username} \nPassword: ${account.password} \n==============\n`;

    } catch (err) {
        // Various Error Messages
        if ( error instanceof InvalidInputError){
            return `Adding Pokemon Failed: ${err.message}\nFailed Data: "${username}", "${password}" \n==============\n`;
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