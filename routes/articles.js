const express = require('express')
const Article = require('./../models/article')
const router = express.Router()

router.get('/new' ,(req , res) => {
    res.send('hiddd')
  //res.sender('articles/new', {article : new Article()})
})

router.get('/:id', async(req, res) => {
  const article = await Article.findById(req.params.id)
  if(article == null)
   res.redirect('/')
  res.render('articles/show' , {article : article}) 
})
// 검색 눌렀을 때 이걸로 실행되는 듯
router.get('/', async (req, res) => {
  var searchQuery = createSearchQuery(req.query);
    const articles = await Article.find(searchQuery).sort({ upload_day: 'desc' }) // 검색한 글자가 포함된 기사들만 articles에 저장
    res.render('articles/index', { articles: articles })  // 화면 표출
})
// searchQuery <<< 이건 server.js랑 양쪽 둘다 있어야 댈듯 (지우면 실행 안대드라고)
function createSearchQuery(queries){ // 4
  var searchQuery = {};
  
  if(queries.searchText && queries.searchText.length >= 2){ // 검색 글자 수 몇개 이상인지
    var postQueries = []; 
    postQueries.push({ summary_kor: { $regex: new RegExp(queries.searchText, 'i') } });
      postQueries.push({ keyword_kor: { $regex: new RegExp(queries.searchText, 'i') } });
      postQueries.push({ title_kor: { $regex: new RegExp(queries.searchText, 'i') } }); // 검색글자를 title_kor : 검색글자 식으로 저장
    if(postQueries.length > 0) searchQuery = {$or:postQueries};
  }
  return searchQuery;
}

module.exports = router
