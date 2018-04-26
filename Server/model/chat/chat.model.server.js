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
        "findAllChats": findAllChats,
        "findChatById": findChatById,
        "updateChat": updateChat,
        "deleteChat": deleteChat,
        "deleteChatMessages": deleteChatMessages,
        "removeMessage": removeMessage,
        "removeParticipant": removeParticipant,
        "findPublicChats": findPublicChats
    };

    return api;

    function createChat(userId, friendId) {
        var deferred = q.defer();
        model.userModel.findUserById(userId)
            .then(function (user) {
                model.userModel.findUserById(friendId)
                    .then(function (friend) {
                        var chat = {
                            _user: userId,
                            name: "Chat between " + user.firstName + " and " + friend.firstName,
                            private: true,
                            participants: [userId, friendId]
                        };
                        chatModel.create(chat, function (err, i) {
                            if (err) {
                                deferred.reject(err);
                            } else {
                                for(var p = 0; p < chat.participants.length; p++)
                                    addChat(chat.participants[p], i);
                                deferred.resolve(i);
                            }
                        });
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

    function findPublicChats() {
        var d = q.defer();
        chatModel
            .find({"private": false}, function (err, chats) {
                if(err) {
                    d.reject(err);
                }
                else d.resolve(chats);
            });
        return d.promise;
    }

    function findAllChats() {
        return chatModel.find();
    }

    function removeParticipant(chatId, userId) {
        var d = q.defer();
        chatModel.findById(chatId)
            .then(function (chat) {
                chat.participants.splice(chat.participants.indexOf(userId), 1);
                chat.save();
                d.resolve(chat._id);
            })
            .then(function (chatId) {
                model.userModel.findUserById(userId)
                    .then(function (user) {
                        user.chats.splice(user.chats.indexOf(chatId), 1);
                        user.save();
                        d.resolve(user);
                    });
                return d.promise;
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


    function deleteChat(chatId) {
        var d = q.defer();
        chatModel.findById(chatId)
            .then(function (chat) {
                var participants = chat.participants;
                participants.forEach(function(uid) {
                    model.userModel.findUserById(uid)
                        .then(function (user) {
                            user.chats.splice(user.chats.indexOf(chatId), 1);
                            user.save();
                        });
                });
                d.resolve(chat);
                return d.promise;
            })
            .then(function(res) {
                    deleteChatMessages(chatId)
                        .then(function (res) {
                            chatModel.remove({_id: chatId})
                                .then(function(res) {
                                    d.resolve(res);
                                })
                        });
                    return d.promise;
                },
                function (reason) {
                    d.reject(reason);
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
                messages.forEach(function (message) {
                    model.messageModel
                        .deleteMessage(message._id)
                        .then(function(res) {
                            //deferred.resolve();
                        }, function(err) {
                            deferred.reject(err);
                        });
                });
                deferred.resolve(messages);
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