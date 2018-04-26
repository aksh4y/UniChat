/**
 * Created by Akshay on 4/17/2018.
 */

module.exports = function () {
    var model;
    var mongoose = require("mongoose");
    var q = require('q');
    var messageSchema = require('./message.schema.server')();
    var messageModel = mongoose.model('messageModel', messageSchema);
    var fs = require("fs");
    var publicDirectory =__dirname+"/../../../public";
    var LanguageTranslatorV2 = require('watson-developer-cloud/language-translator/v2');
    var languageTranslator = new LanguageTranslatorV2({
        username: process.env.IBM_WATSON_USERNAME,
        password: process.env.IBM_WATSON_PASSWORD,
        headers: {
            'X-Watson-Technology-Preview': '2017-07-01',
            'X-Watson-Learning-Opt-Out': true
        }
    });
    var NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');
    var natural_language_understanding = new NaturalLanguageUnderstandingV1({
        'username': process.env.IBM_WATSON_NLU_USERNAME,
        'password': process.env.IBM_WATSON_NLU_PASSWORD,
        'version': '2018-03-16'
    });

    var api = {
        "createMessage": createMessage,
        "findAllMessagesForChat": findAllMessagesForChat,
        "findMessageById": findMessageById,
        "updateMessage": updateMessage,
        "deleteMessage": deleteMessage,
        "translateMessage": translateMessage,
        "getMessageFeels": getMessageFeels,
        "setModel": setModel
    };
    return api;

    function createMessage(chatId, userId, message) {
        var d = q.defer();
        messageModel
            .create(message, function (err, c) {
                if (err) {
                    d.reject(err);
                } else {
                    model.chatModel
                        .findChatById(chatId)
                        .then(function (chat) {
                            chat[0].messages.push(c._id);
                            chat[0].save();
                            d.resolve(c);
                        }, function (err) {
                            d.reject(err);
                        });
                }
            });
        return d.promise;
        /*var d = q.defer();
        messageModel
            .create(message, function (err, c) {
                if (err) {
                    d.reject(err);
                }
                else {
                    d.resolve(c);
                }
                return d.promise;
            })
            .then(function (c) {
                c.source = c.language_model;
                c.destination = "en";
                translateMessage(c)
                    .then(function (translatedMsg) {
                        console.log("translation");
                        delete c.destination;
                        delete c.source;
                        var msg = {
                            msg: translatedMsg.data.response.translations[0].translation,
                            c: c
                        };
                        d.resolve(msg);
                    }, function (err) {
                        d.reject(err);
                    });
                return d.promise;
            })
            .then(function (msg) {
                getMessageFeels(msg)
                    .then(function (feel) {
                        var c = msg.c;
                        c.sentiment = feel;
                        feel.extra = msg;
                        console.log("update msg");
                        console.log(c);
                        model.messageModel.updateMessage(c._id, c)
                            .then(function (newMsg) {
                                d.resolve(newMsg)
                            }, function (err) {
                                d.reject(err);
                            });
                        return d.promise();
                    })
                    .then(function (c) {
                        console.log("final stage");
                        console.log(c);
                        model.chatModel
                            .findChatById(c._chat)
                            .then(function (chat) {
                                console.log("push msg");
                                chat[0].messages.push(c._id);
                                chat[0].save();
                                d.resolve(c);
                            }, function (err) {
                                d.reject(err);
                            });
                        return d.promise;
                    });
                return d.promise;
            });
        return d.promise;*/
    }

    function findAllMessagesForChat(chatId){
        return model.chatModel
            .findChatById(chatId)
            .then(function (chat){
                var messagesOfChat = chat[0].messages;
                var numberOfMessages = messagesOfChat.length;
                var messageCollectionForChat = [];

                return getMessagesRecursively(numberOfMessages, messagesOfChat, messageCollectionForChat);
            }, function (error) {
                return error;
            });
    }

    function getMessageFeels(messagePackage) {
        var d = q.defer();

        var parameters = {
            "text": messagePackage.msg,
            "features": {
                "sentiment": {}
            }
        };


        natural_language_understanding.analyze(parameters, function(err, response) {
            if (err)
                d.resolve("Neutral");
            else
                d.resolve(response.sentiment.document.label);
        });

        return d.promise;
    }

    function translateMessage(messagePackage) {
        var d = q.defer();

        var model = messagePackage.source + "-" + messagePackage.destination;
        var parameters = {
            text: messagePackage.msg,
            model_id: model
        };
        languageTranslator.translate(parameters, function (error, response) {
            if (error) {
                model = messagePackage.source + "-en";
                parameters = {
                    text: messagePackage.msg,
                    model_id: model
                };
                languageTranslator.translate(parameters, function (error, response) {
                    if (error) {
                        console.log(error);
                        d.reject(error);
                    }
                    else {
                        model = "en-" + messagePackage.destination;
                        parameters = {
                            text: response.translations[0].translation,
                            model_id: model
                        };
                        languageTranslator.translate(parameters, function (error, response) {
                            if (error) {
                                console.log(error);
                                d.reject(error);
                            }
                            else {
                                messagePackage.response = response;
                                d.resolve(messagePackage);
                            }
                        });
                    }
                });
            }
            else {
                messagePackage.response = response;
                d.resolve(messagePackage);
            }
        });
        return d.promise;
    }

    function getMessagesRecursively(count, messagesOfChat, messageCollectionForChat) {
        if(count == 0){
            return messageCollectionForChat;
        }

        return messageModel.findById(messagesOfChat.shift()).select('-__v')
            .then(function (message) {
                messageCollectionForChat.push(message);
                return getMessagesRecursively(--count, messagesOfChat, messageCollectionForChat);
            }, function (error) {
                return error;
            });
    }

    function findMessageById(messageId){
        var d = q.defer();
        messageModel
            .findById(messageId)
            .then(function(message) {
                d.resolve(message);
            }, function(err) {
                d.reject(err);
            });
        return d.promise;
    }

    function updateMessage(messageId, updatedMessage){
        var d = q.defer();
        messageModel
            .findOneAndUpdate({_id: messageId}, {$set: updatedMessage}, function (err, updatedMessage) {
                if (err) {
                    d.reject(err);
                } else {
                    d.resolve(updatedMessage);
                }
            });
        return d.promise;
    }
    function deleteMessage(messageId){
        var d = q.defer();
        messageModel
            .findById(messageId).populate('_chat')
            .then(function (message) {
                message._chat.messages.splice(message._chat.messages.indexOf(messageId),1);
                message._chat.save();
                if(message.type == "IMAGE"){
                    deleteUploadedImage(message.url);
                }
                messageModel
                    .remove({_id:messageId})
                    .then(function() {
                        d.resolve();
                    }, function (err) {
                        d.reject(err);
                    });
            }, function (err) {
                d.reject(err);
            });
        return d.promise;
    }

    function deleteUploadedImage(imageUrl) {
        // Local helper function
        if(imageUrl && imageUrl.search('http') == -1){
            fs.unlink(publicDirectory+imageUrl, function (err) {
                if(err){
                    console.log(err);
                    return;
                }
            });
        }
    }

    function setModel(_model) {
        model = _model;
    }
};