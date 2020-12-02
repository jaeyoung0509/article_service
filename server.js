const express = require('express')
  const mongoose = require('mongoose')
  
  const articleRouter = require('./routes/articles')
  const Article = require('./models/article')
  const app = express()
  mongoose.connect('mongodb://developer:developer@207.148.99.250:27017/article_service' ,{
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false})
  app.set('view engine' , 'ejs')
  //app.use(express.unlencoded({ extended : false }))
  
  app.get('/',async (req, res) => {
    const articles = await Article.find().sort({upload_day : 'desc'})
    res.render('articles/index' , { articles: articles})
  })
  
  app.use('/articles',articleRouter)

  app.listen(3000)
