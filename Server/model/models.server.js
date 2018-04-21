/**
 * Created by Akshay on 3/20/2017.
 */

module.exports = function () {

    var userModel    = require("./user/user.model.server")();
    var chatModel = require("./chat/chat.model.server")();
    var messageModel = require("./message/message.model.server")();

    var model = {
        userModel    : userModel,
        chatModel : chatModel,
        messageModel: messageModel
    };
    userModel.setModel(model);
    chatModel.setModel(model);
    messageModel.setModel(model);
    return model;
};