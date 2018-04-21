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
            "deleteMessage": deleteMessage
        };

        return api;

        function findAllMessagesForChat(chatId) {
            return $http.get("/api/chat/" + chatId + "/message");
        }

        function deleteMessage(messageId) {
            return $http.delete("/api/message/" + messageId);
        }

        function createMessage(chatId, message) {
            return $http.post("/api/chat/" + chatId + "/message", message);
        }

        function updateMessage(messageId, message) {
            return $http.put("/api/message/" + messageId, message);
        }

        function findMessageById(messageId) {
            return $http.get("/api/message/" + messageId);
        }
    }
})();