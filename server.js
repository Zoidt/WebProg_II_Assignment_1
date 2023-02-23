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
    // Valid usernames
    response.write(await handleReadAccount("eevee"));
    response.write(await handleReadAccount("Pikachu"));

    // Invalid usernames
    response.write(await handleReadAccount("DarkLord1"));
    console.table(await model.getAllAccounts()); // internal 

    // =================================================================
    // Update
    // =================================================================
    // valid username
    response.write(await handleUpdateUsername("Pikachu","newPikachu"));
    response.write(await handleUpdateUsername("Darklord","newDarkLord"));
    response.write(await handleUpdateUsername("Pikachu","newDarkLord"));

    //invalid username
    response.write(await handleUpdateUsername("newPikachu", "new12 123"));




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
        let account = await model.addAccount(username, password);
        
        // Check edge cases where pokemon returns null
        if(account == null)
            throw new Error(`ERROR Got null result when adding. Should never happen. \nFailed Data: "${username}", "${password}" \n==============\n`)
        else return `Creating account successful, \nUsername: ${account.username} \nPassword: ${account.password} \n==============\n`;

    } catch (err) {
        // Various Error Messages
        if ( err instanceof InvalidInputError){
            return `Adding Account Failed: ${err.message}\nFailed Data: "${username}", "${password}" \n==============\n`;
         }
         else if( err instanceof DatabaseError){
            return `Adding Account Failed: ${err.message}\n==============\n`;
         }else{
             return "****** Unexpected error, check logs:  " + err;
         }
    }
}

/**
 * Helper function for reading account data from a mongoDB database.
 * @param {*} username we want to find in database.
 * @returns string with success or error message.
 */
async function handleReadAccount(username){
    try {
        // Create pokemon object
        let account = await model.getSingleAccount(username);
        
        // Check edge case where pokemon returns null
        if(account == null)
            return `Read Account failed \nAccount with name: "${username}", was not found\n==============\n`;
        else return `Read Account successful, \nUsername: ${account.username} \nPassword: ${account.password} \n==============\n`;

    } catch (err) {
        // Various Error Messages
         if( err instanceof DatabaseError){
            return `Reading Account Failed: ${err.message}\n==============\n`;
         }else{
             return `****** Unexpected error, check logs:\n${err.message}\n==============\n`;
         }
    }
}

/**
 * Helper function for updating account username inside a database.
 * @param {*} username original username of the account you want to update.
 * @param {*} newUsername new username of the account you want to update.
 * @returns success or error message.
 */
async function handleUpdateUsername(username,newUsername){
    try {
        // Create pokemon object
        let account = await model.updateOneUsername(username,newUsername);
        
        // Success or failure messages
        if(!account)
            return `Update account failed \nAccount with name: "${username}", was not found\n==============\n`;
        else return `Update account successful, \nOld Username: ${username} \nNew Username: ${newUsername} \n==============\n`;

    } catch (err) {
        // Various Error Messages
         if( err instanceof DatabaseError){
            return `Update account failed: ${err.message}\n==============\n`;
         }
         else if(err instanceof InvalidInputError){
            return `Update account failed: ${err.message}\n==============\n`;
         }else{
             return `****** Unexpected error, check logs:\n${err.message}\n==============\n`;
         }
    }
}