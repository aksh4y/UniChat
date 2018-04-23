/**
 * Created by Akshay on 4/17/2018.
 */

module.exports = function (app, chatModel) {

    app.put("/api/chat/:cid", updateChat);
    app.delete("/api/chat/:cid", deleteChat);
    app.get("/api/chats/:userId", findAllChatsForUser);
    app.get("/api/chat/:cid", findChatById);
    app.get("/api/admin/chat", findAllChats);
    app.post("/api/chat", createChat);
    app.delete("/api/chat/:cid/user/:uid", deleteChatParticipant);
    app.get("/api/chat", findPublicChats);


    function findChatById(req, res) {
        var chatId = req.params['cid'];
        chatModel
            .findChatById(chatId)
            .then(function (chat) {
                /*if(req.user._id == chat[0]._user || req.user.role == 'ADMIN') {
                    console.log("found");
                    res.json(chat);
                }
                else
                    res.sendStatus(404).send({msg: 'unauthorized'});*/
                res.json(chat);
            }, function (err) {
                res.sendStatus(404).send(err);
            });
    }

    function findAllChats(req, res) {
        if(req.user && req.user.role==='ADMIN') {
            chatModel
                .findAllChats()
                .then(function (users) {
                    res.json(users);
                });
        } else {
            res.json({});
        }
    }

    function findPublicChats(req, res) {
        chatModel
            .findPublicChats()
            .then(function (chats) {
                res.json(chats);
            }, function (err) {
                res.sendStatus(404).send(err);
            })
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

    function deleteChatParticipant(req, res) {
        var chatId = req.params.cid;
        var userId = req.params.uid;
        chatModel.removeParticipant(chatId, userId)
            .then(function (response) {
                res.json(response);
            }, function (err) {
                res.sendStatus(404).send(err);
            })
    }

    function createChat(req, res) {
        var userId = req.query.uid;
        var friendId = req.query.fid;
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