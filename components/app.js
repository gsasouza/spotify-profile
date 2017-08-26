const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const responseHandler = require('../utils/responseHandler');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res)=> {
  res.send('HelloWorld');
});

app.use((req, res, next) => {
  res.status(404);
  res.send('Not Found!');
  next();
});

module.exports = app;
