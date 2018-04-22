/**
 * Created by Akshay on 4/17/2017.
 */
(function () {
    angular
        .module("UniChat")
        .service("MessageService", MessageService);

    function MessageService($http) {
        var api = {
            "createMessage": createMessage,
            "findAllMessagesForChat": findAllMessagesForChat,
            "findMessageById": findMessageById,
            "updateMessage": updateMessage,
            "deleteMessage": deleteMessage,
            "translateMessage": translateMessage
        };

        return api;

        function findAllMessagesForChat(chatId) {
            return $http.get("/api/chat/" + chatId + "/messages");
        }

        function deleteMessage(messageId) {
            return $http.delete("/api/message/" + messageId);
        }

        function createMessage(chatId, userId, message) {
            return $http.post("/api/chat/" + chatId + "/user/" + userId + "/message", message);
        }

        function updateMessage(messageId, message) {
            return $http.put("/api/message/" + messageId, message);
        }

        function translateMessage(messagePackage) {
            return $http.post("api/message/translate", messagePackage);
        }

        function findMessageById(messageId) {
            return $http.get("/api/message/" + messageId);
        }
    }
})();