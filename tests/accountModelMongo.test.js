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

/** Since a  pokemon can only be added to the DB once, we have to splice from the array. */
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


// Create Pokemon
// ----------------------------------------------------------------

// Add test 
test("Can add pokemon to DB", async () => {
    const { username, password: password } = generatePokemonData();
    await model.addAccount(username,password) // add pokemon to database 
    
    // Query database
    const cursor = await model.getCollection();
    let results = await cursor.find().toArray();// Convert query to array
   
    // Check Array 
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);

    // Check Pokemon Object from Database 
    expect(results[0].username.toLowerCase() == username.toLowerCase()).toBe(true);
    expect(results[0].password.toLowerCase() == password.toLowerCase()).toBe(true);
 
});

test("Cannot add pokemon with an empty name", async () => {
    const { name, password } = genereatePokemonData();
    const emptyName = "";

    // Check Pokemon TODO: Update expect
    await expect(()=> model.createPokemon(emptyName,password)).rejects.toThrow(InvalidInputError);
});


test("Cannot add pokemon with a number in name.", async () => {
    const { name, password } = genereatePokemonData();
    const nameWithNumber = "Pikachu1";

    // Check PokemonTODO: Update expect
    await expect(()=> model.createPokemon(nameWithNumber,password)).rejects.toThrow(InvalidInputError);
});

test("Cannot add pokemon with invalid password", async () => {
    const { name, password } = genereatePokemonData();
    const  invalidType = "Pikachu1";

    // Check PokemonTODO: Update expect
    await expect(()=> model.createPokemon(name,invalidType)).rejects.toThrow(InvalidInputError);
});


test("Can add two pokemon with valid inputs without overwriting", async () => {
    
    const { name, password } = genereatePokemonData();
    console.log("Inside test: Pokemon Info: " +  name +  password);

    //const { secondName, secondType } = genereatePokemonData();
    //console.log("Inside test: Pokemon Info: " +  secondName +  secondType);

    let pokemon = await model.createPokemon(name,password);
    let pokemon2 = await model.createPokemon(name,password);

    let database = await utils.readFromJsonFile(dbFile);

    // Check Array 
    expect(Array.isArray(database)).toBe(true);
    expect(database.length).toBe(2);

    // Check First Pokemon Object
   await expect(database[0].name.toLowerCase() == pokemon.name.toLowerCase()).toBe(true);
   await expect(database[0].password.toLowerCase() == pokemon.password.toLowerCase()).toBe(true);

   // Check second pokemon object
   await expect(database[1].name.toLowerCase() == pokemon2.name.toLowerCase()).toBe(true);
   await expect(database[1].password.toLowerCase() == pokemon2.password.toLowerCase()).toBe(true);
});
// Read one

// Read many 

// Update

// Delete

