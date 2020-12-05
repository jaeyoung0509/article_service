const express = require("express");
const router = express.Router();
// user model 그리고 mongoose를 require합니다.
const User = require("../models/user");
const mongoose = require("mongoose");

// crypto 모듈을 호출
const crypto = require("crypto");

// passport 모듈을 호출
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

// router.get("/member/login", (req, res) => res.render("login", {page: "login"}));
router.get("/login", (req, res) => res.render("member/login", {page: "login"}));
router.get("/signup", (req, res) => res.render("member/signup", {page: "signup"}));

// 회원가입
// 먼저, email을 기존 DB에서 비교해 중복되면 저장하지 않고, 알림을 띄운 뒤, 회원가입 페이지로 다시 리다이렉트합니다.
// email이 중복되지 않으면, 데이터베이스에 저장한 뒤, 값들을 console에 출력합니다.
// (실수!!!) router.post("/member/signup" => 이렇게 쓰면 멤버안에 멤버 폴더로 감... => cannot POST /member/signup 뜸
router.post("/signup", (req, res, next) => {
  console.log(req.body);
  User.find({ email:req.body.email })
      .exec()
      .then(user => {
          if (user.length >= 1) {
              res.send('<script type="text/javascript">alert("이미 존재하는 이메일입니다."); window.location="/member/signup"; </script>');
          } else {
              const user = new User({
                  _id: new mongoose.Types.ObjectId(),
                  name:req.body.name,
                  email: req.body.email,
                  password: crypto.createHash('sha512').update(req.body.password).digest('base64') //createHash 메소드는 sha512로 정하고, update에 암호화할 password를 넣고, base64로 인코딩하는 코드입니다.
              });
              user
                  .save()
                  .then(result => {
                      console.log(result);
                      res.redirect("/");
                  })
                  .catch(err => {
                      console.log(err);
                  });
                }
      });
});

// 로그인에 성공할 시 정보를 세션에 저장하는 코드와 인증 후에 페이지 이동등의 요청이 있을 때마다 호출하는 코드를 추가합니다.

// 로그인에 성공할 시 serializeUser 메서드를 통해서 사용자 정보를 세션에 저장
passport.serializeUser(function (user, done) {
    done(null, user);
});

// 사용자 인증 후 요청이 있을 때마다 호출
passport.deserializeUser(function (user, done) {
    done(null, user);
});

// 로그인 로직 코드입니다. 주의할 점은 password를 암호화하여 저장하였으므로, 로그인 코드를 작성할 때도 사용자가 입력한 패스워드를 암호화한 값과 DB에 저장된 패스워드와 비교하여야 합니다.
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField : 'password',
    passReqToCallback : true //request callback 여부
},
function (req, email, password, done)
{
    User.findOne({email: email, password: crypto.createHash('sha512').update(password).digest('base64')}, function(err, user){
        if (err) {
            throw err;
        } else if (!user) {
            return done(null, false, req.flash('login_message','이메일 또는 비밀번호를 확인하세요.')); // 로그인 실패
        } else {
            return done(null, user); // 로그인 성공
        }
    });
}
));

router.post('/login', passport.authenticate('local', {failureRedirect: '/login', failureFlash: true}), // 인증 실패 시 '/login'으로 이동
function (req, res) {
    console.log ('Tlqkf');
    res.redirect('/');
    //로그인 성공 시 '/'으로 이동
});

// GET방식으로 /login으로 접속할 때 message를 전달
router.get("/login", (req, res) => res.render("login", {message: req.flash('login_message')}));

module.exports = router;