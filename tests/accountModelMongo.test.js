const { InvalidInputError } = require('../models/InvalidInputError');
const { DatabaseError } = require('../models/DatabaseError');
const { MongoMemoryServer} = require('mongodb-memory-server');
// TODO: Require Faker JS

const model = require('../models/accountModelMongoDb'); // TODO: Change file names to reflect users
const utils = require('../models/validateUtils');
require("dotenv").config();
jest.setTimeout(100000);
// TODO: Change DB names to reflect users and not pokemons 
let client;
let pokemonsCollection;
let db = "user_account_test"; // collection name

// TODO: Use fakeJS To generate user data when adding or manually make stuff up
const pokemonData = [
    {name: 'Bulbasaur' , type: 'Grass'},
    {name: 'Charamander' , type: 'Fire'},
    {name: 'Squirtle' , type: 'Water'},
    {name: 'Pikachu' , type: 'Electric'},
    {name: 'Pidgeotto' , type: 'Psychic'},
    {name: 'Chancey' , type: 'Normal'},
    {name: 'Raichu' , type: 'Electric'},
    {name: 'Venausaur' , type: 'Grass'},
    {name: 'Ivysaur' , type: 'Grass'},
    {name: 'Wartortle' , type: 'Water'},
    {name: 'Blastoise' , type: 'Water'},
    {name: 'Charmeleon' , type: 'Fire'},
    {name: 'Charizard' , type: 'Fire'},
    {name: 'Greninja' , type: 'Water'},
    {name: 'Darkrai' , type: 'Normal'},
    {name: 'Alakazam' , type: 'Psychic'},
    {name: 'Snorlax' , type: 'Normal'}
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


// Test Units


// Add test 
test("Can add pokemon to DB", async () => {
    const { name, type } = generatePokemonData();
    await model.addAccount(name,type) // add pokemon to database 
    
    // Query database
    const cursor = await model.getCollection();
    let results = await cursor.find().toArray();// Convert query to array
   
    // Check Array 
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);

    // Check Pokemon Object from Database 
    expect(results[0].name.toLowerCase() == name.toLowerCase()).toBe(true);
    expect(results[0].type.toLowerCase() == type.toLowerCase()).toBe(true);
 
});

// Read one

// Read many 

// Update

// Delete