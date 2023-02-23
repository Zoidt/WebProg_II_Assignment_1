const { MongoClient, ListCollectionsCursor } = require("mongodb");
const { DatabaseError } = require("./DatabaseError");
const { InvalidInputError } = require("./InvalidInputError");
const validateUtils = require("./validateUtils");
const dbName = "user_account_db"; // Main: user_account_db, Test: user_account_db_test

let client;
let accountCollection;

// =================================================================
// Database connection 
// =================================================================

/**
 * Connect up to the online MongoDb Database with the name stored in dbName.
 * Use the database with the name stored in dbName and the collection passed in.
 * Creates Database with dbName if it doesn't already exist.
 * Create the collection with the name passed in  if it doesn't exist.
 * @param {*} accountCollectionName Name of collection to create or connect to 
 * @param {*} reset If true new collection will be created after deleted old. Otherwise connect to existing collection
 * @param {*} url MongoDB login URL 
 */
async function initialize(accountCollectionName, reset, url){
    try {
        client = new MongoClient(url); // store connected client for use while the app is running
        await client.connect();
        console.log("Connected to MongoDb");
        db = client.db(dbName);

        // Check to see if the collection passed in exists
        collectionCursor = await db.listCollections({name: accountCollectionName});
        collectionArray = await collectionCursor.toArray();

        if (collectionArray.length == 0){
            // collation specifying case sensitive collection
            const collation = { locale: "en", strength: 3 };
            // No match was found so create new collection
            await db.createCollection(accountCollectionName, {collation: collation});
        }
        accountCollection = db.collection(accountCollectionName); // convenient access to collection

        // if reset is true, drop database and create new one
        // TODO: Add following code as else in the first if statement?, this avoids some repeating code 
        if (reset == true){
            // drop collection and create new one 
            accountCollection.drop();
            // collation specifying case-insensitive collection
            const collation = { locale: "en", strength: 1 };
            // Create new collection since old was dropped
            await db.createCollection(accountCollectionName, {collation: collation});

            accountCollection = db.collection(accountCollectionName); // convenient access to collection
        }
    } catch (err) {
        console.log(err.message);
        throw new DatabaseError(err.message);
    }
}

/**
 * Close connection to database with name stored in dbName
 * Logs if closing connection was successful, otherwise logs error message
 */
async function close() {
    try {
        await client.close();
        console.log("MongoDb connection closed");
    } catch (error) {
        console.log(error.message);
    }
}
// =================================================================
// CRUD 
// =================================================================
/**
 * Method creates an account object and adds it to the MongoDB specified collection.
 * @param {*} username of account to create.
 * @param {*} password of account to create.
 * @returns pokemon object if successful.
 * @throws InvalidInputError if the password or username is invalid.
 */
async function addAccount(username, password){
    try {
        // check for valid username and password
        if(validateUtils.isValid2(username,password)){

            // check if account already exists by querying database
            let account = await getSingleAccount(username);
            if(account != null)
                throw new DatabaseError(`Error while creating account. Username "${username}" already exists.`);
            
            // if account with username does not exist, create one 
            // creates and returns new account object if successful
            if(await !accountCollection.insertOne( { username: username, password: password } ))
                throw new DatabaseError(`Error while inserting account into db: ${username}, ${password}`);
            
            // Return account object
            return { username: username, password: password };
        }
        
    } catch (err) { 
        if(err instanceof InvalidInputError){
            console.log("Input Error while adding account: " + err.message);
        }
        if(err instanceof DatabaseError){
            console.log("Database Error while adding account: " + err.message);
        }else{
            console.log("Unexpected error while adding account: " + err.message);
        }
        throw err;
    }
    // Validate Name and Type

}
/**
 * Queries database for a single instance of an account with the username
 * that was passed in.
 * @param {*} username to find in database.
 * @returns Pokemon object or Undefined if pokemon was not found.
 * @throws DatabaseError if fails to read from database.
 */
async function getSingleAccount(username){
    // Try reading from database
    let account;
    try {
        // Query database
        account = await accountCollection.findOne({username: username});

    } catch (error) {
        throw new DatabaseError("Error while reading account data from database: " + error.message)
    }

    return account;
}
/**
 * Query all account objects inside a MongoDb collection.
 * Collection specified by accountCollection.
 * @returns array containing account objects.
 * @throws DatabaseError if query is unsuccessful.
 */
async function getAllAccounts(){
    let accountsArray;
    // Try reading from database and converting result to an array
    try {
        accountsArray = await accountCollection.find().toArray();
       return accountsArray;

    } catch (error) {
        throw new DatabaseError("Error while reading account data from database: " + error.message);
    }
}
/**
 * Helper function to manipulate the current collection
 * @returns accountCollection
 */
async function getCollection(){
    return await accountCollection;
}

// TODO: updateOne
/**
 * Updates account username in database with new username that is passed in.
 * @param {*} currentUsername of account we want to update.
 * @param {*} newUsername newUsername of account we want to update.
 * @returns booleans, true if update was successful, false otherwise.
 * @throws InvalidInputError if username is invalid.
 */
async function updateOneUsername(currentUsername, newUsername){

    try {        
        // Query to see if new username is already taken
        let account = await getSingleAccount(newUsername);
        if(account != null)
            throw new DatabaseError(`\n"${newUsername}" is already taken.`);
        // Validate new username (Valid state)
        if(validateUtils.isUsernameValid(newUsername)){
            // filter for account
            const filter = {username: currentUsername};
            // information we want to change
            const updateDoc = {
                $set: {username: newUsername}
            }

            // Update only the username if it exists, where account currentUsername matches in database
            const result = await accountCollection.updateOne(filter, updateDoc);
        
            // check if document was updated or not, return accordingly
            if(result.modifiedCount > 0)
                return true;
            return false;
        }

    } catch (error) {
        if(error instanceof DatabaseError)
            console.log("Error while updating account data to database:" + error.message);
        if(error instanceof InvalidInputError)
            console.log("Error with input when updating account data: " + error.message);
        else 
            console.log("Unexpected error: " + error.message);

        throw error;
    }
}
async function updateOnePassword(){

}

// TODO: updateMany

// TODO: replaceOne (optional?)

// TODO: deleteOne
async function deleteOneAccount(){

    try {
        
    } catch (error) {
        
    }
}

// TODO: deleteMany

// TODO: isExists (validation for adding/update/delete)
module.exports = {
    initialize,
    close,
    addAccount,
    getSingleAccount,
    getAllAccounts,
    getCollection,
    updateOneUsername
}
