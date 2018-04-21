/**
 * Created by Akshay on 4/17/2018.
 */

module.exports = function (app, messageModel) {
    app.post("/api/chat/:cid/message", createMessage);
    app.get("/api/chat/:cid/messages", findAllMessagesForChat);
    app.get("/api/message/:mid", findMessageById);
    app.put("/api/message/:mid", updateMessage);
    app.delete("/api/message/:mid", deleteMessage);

    var multer = require('multer'); // npm install multer --save
    var upload = multer({ dest: __dirname+'/../../public/uploads' });
    var fs = require('fs');

    app.post ("/api/upload", upload.single('myFile'), uploadImage);


    function uploadImage(req, res) {
        var chatId   = req.body.cid;
        var width         = req.body.width;
        var height        = req.body.height;
        var myFile        = req.file;

        if(myFile) {

            var newMessage = {
                _chat: chatId,
                type: "IMAGE",
                width: width,
                height: height,
                url: req.protocol + '://' + req.get('host') + "/uploads/" + myFile.filename
            };

            messageModel
                .createMessage(chatId, newMessage)
                .then(function (response) {
                    res.redirect("/#/editor/" + chatId);
                }, function (err) {
                    res.sendStatus(404);
                });
            return;
        }
        res.sendStatus(404);
    }

    function findMessageById(req, res) {
        var messageId = req.params['messageId'];
        messageModel
            .findMessageById(messageId)
            .then(function (message) {
                res.json(message);
            }, function (err) {
                res.sendStatus(404).send(err);
            });
    }

    function findAllMessagesForChat(req, res){
        var chatId = req.params['cid'];
        messageModel
            .findAllMessagesForChat(chatId)
            .then(function (messages) {
                res.json(messages);
            }, function(err) {
                res.sendStatus(404).send(err);
            });
    }


    function deleteMessage(req, res) {
        var messageId = req.params.mid;
        messageModel
            .findMessageById(messageId)
            .then(function(message) {
                if(message.type == "IMAGE") {  //delete image
                    var fileName = message.url.split('//').pop().split("/").pop();
                    if(fileName) {
                        var path = __dirname + '/../../public/uploads/' + fileName;
                        if (fs.existsSync(path)) {  //delete if uploaded file
                            fs.unlinkSync(path);
                        }
                    }
                }
                message.msg = "[deleted]";
                messageModel
                    .updateMessage(messageId, message)
                    .then(function () {
                        res.sendStatus(200);
                    }, function(err) {
                        res.sendStatus(err);
                    });

                res.sendStatus(200);
            });
    }


    function createMessage(req, res) {
        var newMessage= req.body;
        var chatId = req.params.cid;
        messageModel
            .createMessage(chatId, newMessage)
            .then(function (message) {
                res.json(message);
            }, function (err) {
                res.sendStatus(404);
            });
    }

    function updateMessage(req, res) {
        var messageId = req.params['mid'];
        messageModel
            .findMessageById(messageId)
            .then(function(message) {
                var newMessage = req.body;
                messageModel
                    .updateMessage(messageId, newMessage)
                    .then(function(w){
                        res.json(w);
                    }, function(err) {
                        res.send(err);
                    });
            }, function(err) {
                res.sendStatus(404);
            });
    }
};