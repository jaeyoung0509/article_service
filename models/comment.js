const { ObjectID } = require("mongodb");
const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
    comment : { type: String , required: true },
    article_id : { type: ObjectID , required : true}, 
    user_email : {type : String, required : true}

});

module.exports = mongoose.model("Comment", CommentSchema, 'Comment');