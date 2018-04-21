/**
 * Created by Akshay on 4/17/2018.
 */
module.exports = function (app) {

    <!-- Models -->
    var models = require('./model/models.server')();

    <!-- Services -->
    require('./services/user.service.server.js')(app, models.userModel);
    require('./services/chat.service.server.js')(app, models.chatModel);
    require('./services/message.service.server')(app, models.messageModel);
};