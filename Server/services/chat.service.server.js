/**
 * Created by Akshay on 4/17/2018.
 */

module.exports = function (app, chatModel) {

    app.put("/api/chat/:cid", updateChat);
    app.delete("/api/chat/:cid", deleteChat);
    app.get("/api/chats/:userId", findAllChatsForUser);
    app.get("/api/chat/:cid", findChatById);
    app.post("/api/chat", createChat);


    function findChatById(req, res) {
        var chatId = req.params['cid'];
        chatModel
            .findChatById(chatId)
            .then(function (chat) {
                res.json(chat);
            }, function (err) {
                res.sendStatus(404).send(err);
            });
    }

    function findAllChatsForUser(req, res){
        var userId = req.params['userId'];
        chatModel
            .findAllChatsForUser(userId)
            .then(function (chats) {
                res.json(chats);
            }, function(err) {
                res.sendStatus(404).send(err);
            });
    }

    function createChat(req, res) {
        var userId = req.query.uid;
        var friendId = req.query.fid;
        console.log("server side fn");
        chatModel
            .createChat(userId, friendId)
            .then(function (chat) {
                    res.json(chat);
                },
                function () {
                    res.sendStatus(500);
                });
    }

    function deleteChat(req, res) {
        var chatId = req.params.cid;
        chatModel
            .deleteChat(chatId)
            .then(function () {
                res.sendStatus(200);
            },function () {
                res.sendStatus(404);
            });
    }



    function updateChat(req, res) {
        var chatId = req.params['cid'];
        chatModel
            .findChatById(chatId)
            .then(function (response) {
                var newChat = req.body;
                chatModel
                    .updateChat(chatId, newChat)
                    .then(function (response) {
                        res.json(response);
                    }, function () {
                        res.sendStatus(500);
                    });
            }, function () {
                res.sendStatus(404);
            });
    }
};