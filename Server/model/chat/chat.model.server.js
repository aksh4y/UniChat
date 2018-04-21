/**
 * Created by Akshay on 4/17/2018.
 */

module.exports = function () {

    var model;
    var mongoose = require('mongoose');
    var q = require('q');

    var chatSchema = require('./chat.schema.server')();
    var chatModel = mongoose.model('ChatModel', chatSchema);

    var api = {
        "setModel": setModel,
        "createChat": createChat,
        "findAllChatsForUser": findAllChatsForUser,
        "findChatById": findChatById,
        "updateChat": updateChat,
        "deleteChat": deleteChat,
        "deleteChatMessages": deleteChatMessages,
        "removeMessage": removeMessage
    };

    return api;

    function createChat(userId, friendId) {
        console.log("model");
        var deferred = q.defer();
        model.userModel.findUserById(friendId)
            .then(function (friend) {
                console.log(friend);
                var chat = {
                    _user: userId,
                    name: "Chat between " + friend.firstName + " and you",
                    private: true,
                    participants: [userId, friendId]
                };
                chatModel.create(chat, function (err, i) {
                    if (err) {
                        console.log("Error:"+err);
                        deferred.reject(err);
                    } else {
                        addChat(userId, i);
                        deferred.resolve(i);
                    }
                });
            });
        return deferred.promise;
    }

    function addChat(userId, chat) {
        var deferred = q.defer();
        model.userModel
            .findUserById(userId)
            .then(function(user) {
                user.chats.push(chat);
                user.save();
                deferred.resolve(user);
            }, function (err) {
                deferred.reject(err);
            });
        return deferred.promise;
    }

    function findAllChatsForUser(userId) {
        var d = q.defer();
        chatModel
            .find({"_user": userId}, function (err, chats) {
                if (err) {
                    d.reject(err);
                } else {
                    d.resolve(chats);
                }
            });
        return d.promise;
    }

    function findChatById(chatId) {
        var d = q.defer();
        chatModel
            .find({"_id": chatId}, function (err, chat) {
                if (err) {
                    d.reject(err);
                } else {
                    d.resolve(chat);
                }
            });
        return d.promise;
    }

    function updateChat(chatId, chat) {
        var d = q.defer();
        chatModel
            .findOneAndUpdate({"_id": chatId}, {$set: chat}, function (err, updatedChat) {
                if (err) {
                    d.reject(err);
                } else {
                    d.resolve(updatedChat);
                }
            });
        return d.promise;
    }


    function deleteChat(chatId){
        var d = q.defer();
        chatModel
            .findById(chatId).populate('_user')
            .then(function (chat) {
                chat._user.chats.splice(chat._user.chats.indexOf(chatId),1);
                chat._user.save();
                if(chat.messages.length !=0) {
                    deleteChatMessages(chatId)
                        .then(function () {
                            chatModel
                                .remove({_id: chatId})
                                .then(function () {
                                    d.resolve();
                                }, function (err) {
                                    d.reject(err);
                                });
                        }, function (err) {
                            d.reject(err);
                        });
                }
                else {
                    chatModel
                        .remove({_id: chatId})
                        .then(function () {
                            d.resolve();
                        }, function (err) {
                            d.reject(err);
                        });
                }

            }, function (err) {
                d.reject(err);
            });
        return d.promise;
    }

    function setModel(_model) {
        model = _model;
    }


    function deleteChatMessages(chatId) {
        var deferred = q.defer();
        model.messageModel
            .findAllMessagesForChat(chatId)
            .then(function (messages) {
                for(var c in messages) {
                    model.messageModel
                        .deleteMessage(messages[c]._id)
                        .then(function() {
                            deferred.resolve();
                        }, function(err) {
                            deferred.reject(err);
                        });
                }
            }, function (err) {
                deferred.reject(err);
            });
        return deferred.promise;
    }

    function removeMessage(message) {
        var deferred = q.defer();
        findChatById(message[0]._chat)
            .then(function(chat) {
                chat[0].messages.pull(message[0]);
                chat[0].save();
                deferred.resolve();
            },function(err) {
                deferred.reject(err);
            });
        return deferred.promise;
    }
};