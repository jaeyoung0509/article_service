const express = require('express');
const app = express();
const mongoose = require('mongoose')
const articleRouter = require('./routes/articles')
app.set('view engine' , 'ejs')
app.use('/articles',articleRouter)
mongoose.connect('mongodb://dong:dong123@localhost:27017' ,{
useNewUrlParser : true , useUnifiedTopology : true})
app.get('/', function (req, res) {
  const articles = [{
    title : 'test article',
    createdAt : new Date() ,
    description : 'Test description'
  }]
  res.render('articles/index' , { articles: articles})
})
app.listen(3000)
