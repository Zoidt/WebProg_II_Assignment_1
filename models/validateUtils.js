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
 * Validate if pokemon data is valid by checking.
 * Check if name contains only letters and is not empty.
 * Check if type is within accepted types.
 * @param {*} name of pokemon name to validate.
 * @param {*} type of pokemon type to validate.
 * @returns True if data is valid
 * @throws InvalidInputError if pokemon Name or Type is invalid.
 */
 function isValid2(name, type) {
    // TODO: Validate if user is atleast 3 characters long 
    // check if name contains only letters
    if(!validator.isAlpha(name)){
        throw new InvalidInputError("\nINVALID NAME: Name must contain only letters. It cannot be empty or contain numbers.\nName passed in: " + name);
    }
    // TODO: Check if password is minimum length (6) and has 1 number
    // name valid, check type
    if(type == "Normal" || type == "Grass" || type =="Fire" || type == "Water" || type == "Electric" || type == "Psychic") 
        return true;
    
    let acceptedTypes = "\nAccepted types: Normal, Grass, Fire, Water, Electric, Psychic"
    throw new InvalidInputError("\nINVALID TYPE. Type must be within accepted types.\nType passed in: " + type + acceptedTypes) ;
}

module.exports ={
    isValid2
}