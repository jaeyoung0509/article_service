const { Int32 } = require('mongodb')
const mongoose = require('mongoose')
const articleSchema = new mongoose.Schema({
  index : {
    type: Number
  },
  title : {
    type: String
  },
  title_kor : {
    type: String
  },
  href : {
    type : String
  },
  upload_day : {
    type: Date,
    default : () => Date.now
  }
})

module.exports = mongoose.model('article',articleSchema , 'Article')