/**
 * Created by Akshay on 4/17/2018.
 */
module.exports = function () {

    var model;
    var mongoose = require('mongoose');
    var bcrypt = require("bcrypt-nodejs");
    var q = require('q');
    var userSchema = require('./user.schema.server.js')();
    var userModel = mongoose.model('UserModel', userSchema);

    // CRUD ops

    var api = {
        "setModel": setModel,
        "createUser": createUser,
        "findUserById": findUserById,
        "findUserByUsername": findUserByUsername,
        "findUsersByUsername": findUsersByUsername,
        "findUserByCredentials": findUserByCredentials,
        "updateUser": updateUser,
        "deleteUser": deleteUser,
        "findUserByGoogleId": findUserByGoogleId,
        "findUserByFacebookId": findUserByFacebookId,
        "findAllUsers": findAllUsers,
        "addFriend": addFriend,
        "removeFriend": removeFriend,
        "findAllFriendsForUser": findAllFriendsForUser,
        "deleteChatForUser": deleteChatForUser
    };

    return api;


    function findUserByGoogleId(googleId) {
        return userModel.findOne({'google.id': googleId});
    }

    function findUserByFacebookId(facebookId) {
        return userModel.findOne({'facebook.id': facebookId});
    }

    function findAllUsers() {
        return userModel.find();
    }

    function createUser(user) {
        var deferred = q.defer();
        user.password = bcrypt.hashSync(user.password);
        userModel.create(user, function (err, u) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(u);
            }
        });
        return deferred.promise;
    }


    function addFriend(userId, friend) {
        var d = q.defer();
        userModel.findById(userId)
            .then(function (user) {
                var index = user.friends.indexOf(friend._id);
                if (index > -1)
                    return;
                userModel
                    .findOneAndUpdate({"_id": userId}, {$push: {friends: friend}}, function (err, updatedUser) {
                        if (err) {
                            d.reject();
                        } else {
                            userModel
                                .findOneAndUpdate({"_id": friend._id}, {$push: {friends: user}}, function (err, updatedUser) {
                                    if (err) {
                                        d.reject(err);
                                    } else {
                                        d.resolve(updatedUser);
                                    }
                                });
                        }
                    });

            }, function (err) {
                d.reject(err);
            });
        return d.promise;
    }

    function removeFriend(userId, friend) {
        var d = q.defer();
        userModel
            .findOneAndUpdate({"_id": userId}, {$pull: {friends: friend._id}}, function (err, updatedUser) {
                if (err) {
                    d.reject();
                } else {
                    userModel
                        .findOneAndUpdate({"_id": friend._id}, {$pull: {friends: userId}}, function (err, updatedUser) {
                            if (err) {
                                d.reject(err);
                            } else {
                                d.resolve(updatedUser);
                            }
                        });
                }
            });
        return d.promise;
    }

    function findAllFriendsForUser(userId) {
        var d = q.defer();
        userModel
            .find({"_user": userId}, function (err, chats) {
                if (err) {
                    d.reject(err);
                } else {
                    d.resolve(chats);
                }
            });
        return d.promise;
    }

    function updateUser(userId, user) {
        var d = q.defer();
        userModel
            .findOneAndUpdate({"_id": userId}, {$set: user}, function (err, updatedUser) {
                if (err) {
                    d.reject();
                } else {
                    d.resolve(updatedUser);
                }
            });

        return d.promise;
    }


    function deleteUser(userId) {
        var d = q.defer();
        findUserById(userId)
            .then(function (user) {
                user.chats.forEach(function (chat) {
                    model.chatModel
                        .removeParticipant(chat, userId)
                        .then(function () {
                            //d.resolve();
                        }, function (err) {
                            d.reject(err);
                        });
                });
                d.resolve(user);
                return d.promise;
            })
            .then(function (user) {
                user.friends.forEach(function (friend) {
                    var friendJson = {
                        _id: friend
                    };
                    removeFriend(userId, friendJson)
                        .then(function (res) {

                        }, function (err) {
                            d.reject(err);
                        });
                });
                d.resolve();
                return d.promise;
            })
            .then(function () {
                userModel
                    .remove({_id: userId})
                    .then(function () {
                        d.resolve();
                    }, function (err) {
                        d.reject(err);
                    });
            }, function (err) {
                d.reject(err);
            });
        return d.promise;
    }


    function deleteUserChats(userId) {
        var deferred = q.defer();
        model.chatModel
            .findAllChatsForUser(userId)
            .then(function (chats) {
                chats.forEach(function (chat) {
                    model.chatModel
                        .deleteChat(chat._id)
                        .then(function(res) {
                            model.chatModel
                                .removeParticipant(chat._id, userId)
                                .then(function () {

                                });
                        }, function(err) {
                            deferred.reject(err);
                        });
                });
                deferred.resolve();
            }, function (err) {
                deferred.reject(err);
            });
        return deferred.promise;
    }

    function deleteChatForUser(userId, chatId) {
        var deferred = q.defer();
        userModel
            .findOneAndUpdate({"_id": userId}, {$pull: {chats: chatId}}, function (err, updatedUser) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(updatedUser);
                }
            });
        return deferred.promise;
    }


    function findUserById(userId) {
        var d = q.defer();
        userModel
            .findById(userId, function (err, user) {
                if(err) {
                    d.reject(err);
                } else {
                    d.resolve(user);
                }
            });

        return d.promise;
    }

    function findUserByUsername(username) {
        return userModel.findOne({username: username});
    }

    function findUsersByUsername(username) {
        return userModel.find({username: new RegExp(username, 'i')});
    }

    function findUserByCredentials(credentials) {
        return userModel.findOne({username: credentials.username, password: credentials.password});
    }

    function setModel(_model) {
        model = _model;
    }

};