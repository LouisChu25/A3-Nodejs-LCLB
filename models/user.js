const mongoose = require('mongoose'); // On définit les constantes 
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({ // On a un schema user avec un username et password
    username: { type: String, required: true, unique: true},
    password: { type: String, required: true },
  });
  
  userSchema.plugin(uniqueValidator); // Faire en sorte qu’on puisse pas mettre 2 fois le même nom d’utilisateur

  module.exports = mongoose.model('User', userSchema);
