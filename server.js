const express = require('express')
const mongoose = require('mongoose')
const fs= require('fs')
var util = require('./util');

const bodyParser = require("body-parser");  //body-parser를 express에 붙여서 사용하기 위해 코드를 추가
//인증모듈 require
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Session = require('express-session');

var MongoDBStore = require('connect-mongodb-session')(Session);
const flash = require('connect-flash');
//  추가
const PORT= process.env.PORT || 3000;

// routes  추가
const memberRoute = require("./routes/member");

const articleRouter = require('./routes/articles')
const Article = require('./models/article')
const User  = require('./models/article');
const { session } = require('passport');
const app = express()

//body-parser를 express에 붙여서 사용하기 위해 코드를 추가
app.use(bodyParser.urlencoded({extended: true}));
//passport를 require 하고, 로그인에 성공할 시 정보를 세션에 저장하는 코드와 인증 후에 페이지 이동등의 요청이 있을 때마다 호출하는 코드를 추가
app.use(flash());
app.use(Session({
  secret:'jaeyoung0509', //세션 암호화 key
  resave:false,//세션 재저장 여부
  saveUninitialized:true,
  rolling:false,//로그인 상태에서 페이지 이동 시마다 세션값 변경 여부
  cookie:{maxAge:1000*60*60},//유효시간
  store: store
}));
// DB연결
mongoose.connect('mongodb://developer:developer@207.148.99.250:27017/article_service' ,{
  useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false})
app.set('view engine' , 'ejs')
//app.use(express.unlencoded({ extended : false }))

//세션
var store = new MongoDBStore({//세션을 저장할 공간
  uri: 'mongodb://developer:developer@207.148.99.250:27017/article_service', //db url
  collection: 'Member'//콜렉션 이름
});

store.on('error', function(error) {//에러처리
  console.log(error);
});
app.use(passport.initialize());
app.use(passport.session());

//index
app.get('/', async (req, res) => {
  var searchQuery = createSearchQuery(req.query);
  // await req.session.displayname
  if(req.session.passport != null){
    const articles = await Article.find(searchQuery).sort({ upload_day: 'desc' })  
    console.log(1)
    email = await req.session.passport.user.email
    console.log(email)
    res.render('articles/index', { email :email, passport : req.session.passport , articles: articles })
  }
  else {
    const articles = await Article.find(searchQuery).sort({ upload_day: 'desc' })  
    var email = null
    console.log(email)
    console.log(2)
    res.render('articles/index', { email : null , articles: articles })
  }
})




app.get('/imgs', function(req ,res) {
   const readFile = fs.readFile;
    readFile('main2.gif' ,function(error , data){
    res.writeHead(200 , {'Content-Type' : 'text/tml'});
    res.end(data);
});  
});

  
// searchQuery <<<
function createSearchQuery(queries){ // 4
  var searchQuery = {};
  if(queries.searchText && queries.searchText.length >= 2){ // 검색 글자 수 몇개 이상인지
    var postQueries = [];
      postQueries.push({ body: { $regex: new RegExp(queries.searchText, 'i') } });
    if(postQueries.length > 0) searchQuery = {$or:postQueries};
  }
  return searchQuery;
}

// Routers
app.use('/articles',util.getPostQueryString, articleRouter)


// app.listen(3000)

// 뷰엔진 설정  추가
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + "/public"));

// use routes  추가
app.use("/member", memberRoute);

//  추가
app.listen(PORT, function () {
  console.log('Example app listening on port',PORT);
});