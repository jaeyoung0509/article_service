const mongoose = require('mongoose');

mongoose.connect('mongodb://developer:developer@207.148.99.250:27017/article_service', { 
useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false })
  .then(() => console.log('Successfully connected to mongodb!'))
  .catch(e => console.error(e));