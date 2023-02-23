const validator = require('validator');
const { InvalidInputError } = require("./InvalidInputError")

/**
 * Validate if pokemon data is valid by checking.
 * if name is not empty and type is within accepted types.
 * @param {*} name of pokemon name to validate.
 * @param {*} type of pokemon type to validate.
 * @returns True if data is valid, false otherwise.
 * @throws InvalidInputError if name or type is invalid
 */
 const validTypes = ["Normal","Grass","Fire","Water","Electric","Psychic"];
 function isValid1(name, type) {
     // if name is valid, check type
     if(!name){
        throw new InvalidInputError("Name is not valid. Name: " + name);
     }
     // if type is valid, return true
     //if(validTypes.includes(type.toLowerCase()))
     if(type == "Normal" || type == "Grass" || type =="Fire" || type == "Water" || type == "Electric" || type == "Psychic") 
         return true;

         throw new InvalidInputError("Type is invalid. Type: " + type);

 }

// TODO: Update variable names and comments
/**
 * Validate if account data is valid by checking the following: 
 * Check if username is atleast 3 characters long.
 * Check if password is atelast 6 characters long and has a number.
 * @param {*} username of pokemon name to validate.
 * @param {*} password of pokemon type to validate.
 * @returns True if data is valid.
 * @throws InvalidInputError if account username or password is invalid.
 */
 function isValid2(username, password) {
    // TODO: Validate if user is atleast 3 characters long 
    // check if name contains only letters and numbers
    if(!validator.isAlphanumeric(username)){
        throw new InvalidInputError("\nINVALID NAME: Name must contain only letters and numbers. It cannot be empty or contain spaces\nName passed in: " + username);
    }
    // TODO: Check if password is minimum length (6) and has 1 number
    // name valid, check type
    if(password == "Normal" || password == "Grass" || password =="Fire" || password == "Water" || password == "Electric" || password == "Psychic") 
        return true;
    
    let acceptedTypes = "\nAccepted types: Normal, Grass, Fire, Water, Electric, Psychic";
    // TODO: Update error message
    throw new InvalidInputError("\nINVALID TYPE. Type must be within accepted types.\nType passed in: " + password + acceptedTypes) ;
}

/**
 * Check if username has only letters and numbers.
 * @param {*} username to validate.
 * @returns true if username is valid.
 * @throws InvalidInputError if username has spaces, is empty or contains illegal characters.
 */
function isUsernameValid(username) {

    if(!validator.isAlphanumeric(username)){
        // TODO: Update error message
        throw new InvalidInputError("\nINVALID NAME: Name must contain only letters and numbers." + 
        " It cannot be empty or contain spaces\nName passed in: " + username);
    }
    return true;
}

module.exports ={
    isValid2,
    isUsernameValid
}