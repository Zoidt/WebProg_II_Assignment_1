const { InvalidInputError } = require('../models/InvalidInputError');
const { DatabaseError } = require('../models/DatabaseError');
const { MongoMemoryServer} = require('mongodb-memory-server');
// TODO: Require Faker JS

const model = require('../models/accountModelMongoDb');
const utils = require('../models/validateUtils');
require("dotenv").config();
jest.setTimeout(100000);
let client;
let pokemonsCollection;
let db = "user_account_test"; // collection name

// TODO: Use fakeJS To generate user data when adding or manually make stuff up
const pokemonData = [
    {username: 'Bulbasaur' , password: 'Grass'},
    {username: 'Charamander' , password: 'Fire'},
    {username: 'Squirtle' , password: 'Water'},
    {username: 'Pikachu' , password: 'Electric'},
    {username: 'Pidgeotto' , password: 'Psychic'},
    {username: 'Chancey' , password: 'Normal'},
    {username: 'Raichu' , password: 'Electric'},
    {username: 'Venausaur' , password: 'Grass'},
    {username:'Ivysaur' , password: 'Grass'},
    {username:'Wartortle' , password: 'Water'},
    {username: 'Blastoise' , password: 'Water'},
    {username: 'Charmeleon' , password: 'Fire'},
    {username: 'Charizard' , password: 'Fire'},
    {username: 'Greninja' , password: 'Water'},
    {username: 'Darkrai' , password: 'Normal'},
    {username: 'Alakazam' , password: 'Psychic'},
    {username: 'Snorlax' , password: 'Normal'}
]

/** Since a  account can only be added to the DB once, we have to splice from the array. */
const generatePokemonData = () => pokemonData.splice(Math.floor((Math.random() * pokemonData.length)), 1)[0];

// Prep mock database
let mongod;

beforeAll(async () => {
    // This will create a  new instance of "MongoMemoryServer" and automatically start it
    mongod = await MongoMemoryServer.create();
    console.log("Mock Database started");
});

afterAll(async () => {
    await mongod.stop(); // Stop the MongoMemoryServer
    console.log("Mock Database stopped");
});

// initialize a connection to a database before each test

beforeEach(async () => {
    try {
        // Get URL for mock database
        const url = mongod.getUri();

        // Initialize mock database
        await model.initialize(db, true, url) // True deletes old if exists and creates new database

    } catch (error) {
        console.log(error.message);
    }
})

// Close database connection after each test run
afterEach(async () => {
    await model.close();
});

// =================================================================
// Test Units
// =================================================================


// --------- 
// Create
// ---------

// Add test 
/**Investigate issue where querying database when adding causes this test to fail */
test("Can add account to DB", async () => {
    const { username, password } = generatePokemonData();
    await model.addAccount(username,password) // add account to database  

    // Query database
    const cursor = await model.getCollection();
    let results = await cursor.find({username: username}).toArray();// Convert query to array
    console.log("Inside of test, results values is: " + results[0].username)
    // Check Array 
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);

    // Check Pokemon Object from Database 
    expect(results[0].username.toLowerCase() == username.toLowerCase()).toBe(true);
    expect(results[0].password.toLowerCase() == password.toLowerCase()).toBe(true);
 
});

test("Cannot add account with an empty username", async () => {
    const { username, password } = generatePokemonData();
    const emptyName = "";

    // Check Pokemon TODO: Update expect
    await expect(()=> model.addAccount(emptyName,password)).rejects.toThrow(InvalidInputError);
});


test("Cannot add account with a number non alphabet/number name", async () => {
    const { username, password } = generatePokemonData();
    const nameWithNumber = "Pikachu1-_";

    // Check PokemonTODO: Update expect
    await expect(()=> model.addAccount(nameWithNumber,password)).rejects.toThrow(InvalidInputError);
});

test("Cannot add account with invalid password", async () => {
    const { username, password } = generatePokemonData();
    const  invalidType = "Pikachu1";

    // Check PokemonTODO: Update expect
    await expect(()=> model.addAccount(username,invalidType)).rejects.toThrow(InvalidInputError);
});

// -------------
// Read 
// -------------

// Read one
test("Cannot read account that doesn't exist", async () => {
    const { username, password } = generatePokemonData();
    const  invalidType = "Pikachu1";

    // Check PokemonTODO: Update expect
    await expect(()=> model.addAccount(username,invalidType)).rejects.toThrow(InvalidInputError);
});

// Read many 

// Update

// Delete

