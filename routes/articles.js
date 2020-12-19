const mongoose = require("mongoose");
const express = require('express')
const Article = require('./../models/article')
const Comment = require('./../models/comment')
const router = express.Router()
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { session } = require('passport');
//const MemberRouter =  require('member')


// 기사 자세히보기
router.get('/:id', async(req, res) => {
  const article = await Article.findById(req.params.id)
  const comments = await Comment.find({"article_id" : req.params.id})  
  //댓글
  if(article == null)
   res.redirect('/')
  else{
      res.render('articles/show' , {comments: comments ,article : article} ) 
  } 
})

// 기사 자세히보기 댓글
router.post('/:id', async(req, res) => {
  if(req.session.passport != null){
    console.log("yesssssssssssssssssss")
    const article = await Article.findById(req.params.id)
    if(req.body.comment != null){
      console.log(req.session.passport)
      const comment = new Comment({
      _id: new mongoose.Types.ObjectId(),
      article_id : req.params.id,
      comment : req.body.comment,
      user_email : req.session.passport.user.email
      });
      comment
      .save()
      .then   ( async result => {
        const comments =   await Comment.find({"article_id" : req.params.id})  
          res.render('articles/show', { comments: comments ,article : article });
      })
      .catch(err => {
          console.log(err);
      });
      console.log(comment)
    }

    else {
      //comment is null
    }
  }else {
    res.render('member/login')
    //not login
  }
})

// 검색 눌렀을 때 이걸로 실행되는 듯
router.get('/', async (req, res) => {
  // passport 검사
  if(req.session.passport != null){
    console.log('zzzzzzzzzzzzz')
    console.log(req.user.email)
    var searchQuery = createSearchQuery(req.query);
      const articles = await Article.find(searchQuery).sort({ upload_day: 'desc' }) // 검색한 글자가 포함된 기사들만 articles에 저장
      res.render('articles/index', { passport: req.session.passport , email:req.user.email ,articles: articles })  // 화면 표출
  }
  else {
    console.log(req)
    //촤용범학생
    var searchQuery = createSearchQuery(req.query);
    const articles = await Article.find(searchQuery).sort({ upload_day: 'desc' }) // 검색한 글자가 포함된 기사들만 articles에 저장
    res.render('articles/index', {  email : '' ,articles: articles })  // 화면 표출
    //최용범학생
  }
})
//최용범학생
function createSearchQuery(queries){ // 4
  var searchQuery = {};
  
  if(queries.searchText && queries.searchText.length >= 2){ // 검색 글자 수 몇개 이상인지
    var postQueries = []; 
    postQueries.push({ summary_kor: { $regex: new RegExp(queries.searchText, 'i') } });
      postQueries.push({ keyword_kor: { $regex: new RegExp(queries.searchText, 'i') } });
      postQueries.push({ title: { $regex: new RegExp(queries.searchText, 'i') } }); // 검색글자를 title_kor : 검색글자 식으로 저장
      postQueries.push({ summary: { $regex: new RegExp(queries.searchText, 'i') } }); // 검색글자를 title_kor : 검색글자 식으로 저장
      postQueries.push({ keyword: { $regex: new RegExp(queries.searchText, 'i') } }); // 검색글자를 title_kor : 검색글자 식으로 저장
      postQueries.push({ plain_text: { $regex: new RegExp(queries.searchText, 'i') } }); // 검색글자를 title_kor : 검색글자 식으로 저장
    if(postQueries.length > 0) searchQuery = {$or:postQueries};
  }
  return searchQuery;
}
//최용범학생
module.exports = router
