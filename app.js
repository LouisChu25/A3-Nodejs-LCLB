const express = require('express');
const userRoutes = require('./routes/user');

const app = express();
app.use(express.json());

app.use((req, res, next) => {  // Pour éviter les erreurs de CORS 
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

  app.use(userRoutes);

module.exports = app;
