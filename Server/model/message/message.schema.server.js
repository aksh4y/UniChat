/**
 * Created by Akshay on 4/17/2018.
 */

module.exports = function() {
    var mongoose = require("mongoose");
    var MessageSchema = mongoose.Schema({
        _user: ({type: mongoose.Schema.Types.ObjectId, ref: 'UserModel'}),
        _chat: {type: mongoose.Schema.Types.ObjectId, ref: 'ChatModel'},
        read: {type:Boolean, default: false},
        msg: String,
        deleted: {type:Boolean, default: false},
        emotion: String,
        sentiment: String,
        dateCreated: {type: Date, default: Date.now()}
    }, {collection: "unichat.messages"});
    return MessageSchema;
};