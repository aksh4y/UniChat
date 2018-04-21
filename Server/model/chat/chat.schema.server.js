/**
 * Created by Akshay on 4/17/2018.
 */

module.exports = function() {
    var mongoose = require("mongoose");
    var ChatSchema = mongoose.Schema({
        _user: {type: mongoose.Schema.Types.ObjectId, ref: 'UserModel'},
        name: String,
        background_color: String,
        background_url: String,
        emotion: String,
        sentiment: String,
        private: Boolean,
        messages: [{type: mongoose.Schema.Types.ObjectId, ref:'MessageModel'}],
        participants: [{type: mongoose.Schema.Types.ObjectId, ref:'UserModel'}],
        dateCreated: {type: Date, default: Date.now()}
    }, {collection: "unichat.chats"});

    return ChatSchema;
};
