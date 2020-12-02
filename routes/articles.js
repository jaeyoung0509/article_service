const express = require('express')
const Article = require('./../models/article')
const router = express.Router()

router.get('/new' ,(req , res) => {
  res.send('articles/new')
})

module.exports = router