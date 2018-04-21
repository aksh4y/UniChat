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

    var api = {
        "createMessage": createMessage,
        "findAllMessagesForChat": findAllMessagesForChat,
        "findMessageById": findMessageById,
        "updateMessage": updateMessage,
        "deleteMessage": deleteMessage,
        "setModel": setModel
    };

    return api;


    function createMessage(chatId, newMessage) {
        var d = q.defer();
        newMessage._chat = chatId;
        messageModel
            .create(newMessage, function (err, c) {
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
    }

    function findAllMessagesForChat(chatId){
        return model.chatModel
            .findChatById(chatId)
            .then(function (chat) {
                //console.log(chat);
                var messagesOfChat = chat[0].messages;
                var numberOfMessages = messagesOfChat.length;
                var messageCollectionForChat = [];

                return getMessagesRecursively(numberOfMessages, messagesOfChat, messageCollectionForChat);
            }, function (error) {
                return error;
            });
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