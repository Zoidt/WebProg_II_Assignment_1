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
 * Connect up to the online MongoDb Database with the name stored in dbName
 * Use the database with the name stored in dbName and the collection passed in.
 * Will create the "pokemons" collection if it doesn't exist.
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
            // collation specifying case-insensitive collection
            const collation = { locale: "en", strength: 1 };
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
 * Method creates a pokemon object and adds it to the MongoDB specified collection.
 * @param {*} username of pokemon to create.
 * @param {*} password of pokemon to create.
 * @returns pokemon object if successful.
 * @throws InvalidInputError if the type or name of pokemon is invalid.
 */
async function addAccount(username, password){
    try {
        // check for valid name and type
        if(validateUtils.isValid2(username,password)){
            // creates and returns new pokemon object
            if(await !accountCollection.insertOne( { name: username, type: password } ))
                throw new DatabaseError(`Error while inserting pokemon: ${username}, ${password}`);
            
            return { name: username, type: password };
        }
        
    } catch (err) {
        if(err instanceof InvalidInputError){
            console.log("Input Error while adding pokemon: " + err.message);
        }
        if(err instanceof DatabaseError){
            console.log("Database Error while adding pokemon: " + err.message);
        }else{
            console.log("Unexpected error while adding pokemon: " + err.message);
        }
        throw err;
    }
    // Validate Name and Type

}
/**
 * Queries database for a single instance of pokemon with the name
 * that was passed in.
 * @param {*} pokemonName to find in database.
 * @returns Pokemon object or Undefined if pokemon was not found.
 * @throws DatabaseError if fails to read from database.
 */
async function getSinglePokemon(pokemonName){
    // Try reading from database
    let pokemon;
    try {
        // Query database
        pokemon = await accountCollection.findOne({name: pokemonName});

    } catch (error) {
        throw new DatabaseError("Error while reading pokemon data from database: " + error.message)
    }

    return pokemon;
}
/**
 * Query all pokemon objects inside a MongoDb collection.
 * Collection specified by accountCollection.
 * @returns array containing pokemon objects.
 * @throws DatabaseError if query is unsuccessful.
 */
async function getAllPokemon(){
    let pokemonsArray;
    // Try reading from database and converting result to an array
    try {
        pokemonsArray = await accountCollection.find().toArray();
       return pokemonsArray;

    } catch (error) {
        throw new DatabaseError("Error while reading pokemon data from database: " + error.message);
    }
}
/**
 * Helper function to manipulate the current collection
 * @returns accountCollection
 */
async function getCollection(){
    return await accountCollection;
}
module.exports = {
    initialize,
    close,
    addAccount,
    getSinglePokemon,
    getAllPokemon,
    getCollection
}
