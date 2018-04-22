/**
 * Created by Akshay on 3/3/2017.
 */
module.exports = function () {
    var mongoose = require('mongoose');

    var UserSchema = mongoose.Schema({
        username: {type: String, required: true},
        password: String,
        firstName: String,
        lastName: String,
        email: String,
        phone: String,
        language: {type: String, enum:['English', 'Chinese', 'Traditional Chinese', 'Korean', 'Arabic', 'French', 'Portuguese', 'Spanish', 'Dutch',
            'Italian', 'German', 'Japanese', 'Turkish', 'Polish', 'Russian'], required: true, default: 'English'},
        language_model: {type: String, required: true, default: 'en'},
        google: {
            id: String,
            token: String
        },
        facebook: {
            id: String,
            token: String
        },
        chats: [{type: mongoose.Schema.Types.ObjectId, ref:'ChatModel'}],
        friends: [{type: mongoose.Schema.Types.ObjectId, ref:'UserModel'}],
        role: {type:String, enum:['USER','ADMIN'], required: true, default: 'USER'},
        dateCreated: {type:Date, default: Date.now()}
    }, {collection: 'unichat.users'});

    return UserSchema;
};
