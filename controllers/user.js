const bcrypt = require('bcrypt'); // On définit les constantes 
const User = require('../models/User');



exports.signup = (req, res, next) => { // Fonction pour créer un utilisateur avec un username et un mot de passe haché
    bcrypt.hash(req.body.password, 10)
      .then(hash => {
        const user = new User({
          username: req.body.username,
          password: hash
        });
        user.save()  // Fonction pour sauvegarder un utilisateur
          .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
          .catch(error => res.status(400).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
  };


  exports.login = (req, res, next) => { // Fonction pour retrouver l'utilisateur dans la base de donnés 
    User.findOne({ username: req.body.username })
        .then(user => {
            if (!user) {
                return res.status(401).json({ message: 'Paire login/mot de passe incorrecte'});
            }
            bcrypt.compare(req.body.password, user.password)  // On compare le mot de passe saisi et celui en base de donnée 
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: 'TOKEN'
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
 };
