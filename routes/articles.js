const express = require('express')
const Article = require('./../models/article')
const router = express.Router()

router.get('/new' ,(req , res) => {
  res.sender('articles/new', {article : new Article()})
})

router.get('/:id', async(req, res) => {
  const article = await Article.findById(req.params.id)
  if(article == null) res.redirect('/')
  res.render('articles/show' , {article : article}) 
})

function saveArticleAndRedirect(path) {
  return async (req, res) => {
    let article = req.article
    article.title = req.body.title
    article.title_kor = req.body.title_kor
    article.href = req.body.href
    article.upload_day = req.body.upload_day
    try {
      article = await article.save()
      res.redirect(`/articles/${article.slug}`)
    } catch (e) {
      res.render(`articles/${path}`, { article: article })
    }
  }
}

module.exports = router