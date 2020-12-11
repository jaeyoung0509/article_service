const { ObjectID } = require("mongodb");
const articles = require("article")
const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
    comment : { type: String , required: true },
    article_id : [{ type: Schema.Types.ObjectId, ref: 'Atricle'}], 
    user_email : {type : String, required : true}

});

module.exports = mongoose.model("Comment", CommentSchema, 'Comment');