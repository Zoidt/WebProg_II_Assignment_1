const { MongoClient, ListCollectionsCursor } = require("mongodb");
const { DatabaseError } = require("./DatabaseError");
const { InvalidInputError } = require("./InvalidInputError");
const validateUtils = require("./validateUtils");
const dbName = "user_account_db_tests"; // OG : pokemon_db, Test: pokemon_db_tests

let client;
let pokemonsCollection;

// =================================================================
// Database connection 
// =================================================================

/**
 * Connect up to the online MongoDb Database with the name stord in dbName
 * Use the database with the name stored in dbName and the collection "pokemons"
 * Will create the "pokemons" collection if it doesn't exist.
 * @param {*} pokemonsCollectionName Name of collection to create or connect to 
 * @param {*} reset If true new collection will be created after deelted old. Otherwise connect to existing collection
 * @param {*} url MongoDB login URL 
 */
async function initialize(pokemonsCollectionName, reset, url){
    try {
        client = new MongoClient(url); // store connected client for use while the app is running
        await client.connect();
        console.log("Connected to MongoDb");
        db = client.db(dbName);

        // Check to see if the pokemons collection exists
        collectionCursor = await db.listCollections({name: pokemonsCollectionName});
        collectionArray = await collectionCursor.toArray();

        if (collectionArray.length == 0){
            // collation specifying case-insensitive collection
            const collation = { locale: "en", strength: 1 };
            // No match was found so create new collection
            await db.createCollection(pokemonsCollectionName, {collation: collation});
        }
        pokemonsCollection = db.collection(pokemonsCollectionName); // convenient access to collection

        // if reset is true, drop database and create new one
        if (reset == true){
            // drop collection and create new one 
            pokemonsCollection.drop();
            // collation specifying case-insensitive collection
            const collation = { locale: "en", strength: 1 };
            // Create new collection since old was dropped
            await db.createCollection(pokemonsCollectionName, {collation: collation});

            pokemonsCollection = db.collection(pokemonsCollectionName); // convenient access to collection
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
 * @param {*} pokemonName of pokemon to create.
 * @param {*} pokemonType of pokemon to create.
 * @returns pokemon object if successful.
 * @throws InvalidInputError if the type or name of pokemon is invalid.
 */
async function addPokemon(pokemonName, pokemonType){
    try {
        // check for valid name and type
        if(validateUtils.isValid2(pokemonName,pokemonType)){
            // creates and returns new pokemon object
            if(await !pokemonsCollection.insertOne( { name: pokemonName, type: pokemonType } ))
                throw new DatabaseError(`Error while inserting pokemon: ${pokemonName}, ${pokemonType}`);
            
            return { name: pokemonName, type: pokemonType };
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
        pokemon = await pokemonsCollection.findOne({name: pokemonName});

    } catch (error) {
        throw new DatabaseError("Error while reading pokemon data from database: " + error.message)
    }

    return pokemon;
}
/**
 * Query all pokemon objects inside a MongoDb collection.
 * Collection specified by pokemonsCollection.
 * @returns array containing pokemon objects.
 * @throws DatabaseError if query is unsuccessful.
 */
async function getAllPokemon(){
    let pokemonsArray;
    // Try reading from database and converting result to an array
    try {
        pokemonsArray = await pokemonsCollection.find().toArray();
       return pokemonsArray;

    } catch (error) {
        throw new DatabaseError("Error while reading pokemon data from database: " + error.message);
    }
}
/**
 * Helper function to manipulate the current collection
 * @returns pokemonsCollection
 */
async function getCollection(){
    return await pokemonsCollection;
}
module.exports = {
    initialize,
    close,
    addPokemon,
    getSinglePokemon,
    getAllPokemon,
    getCollection
}
