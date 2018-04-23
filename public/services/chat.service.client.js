/**
 * Created by Akshay on 4/17/2018.
 */
(function() {
    angular
        .module("UniChat")
        .factory("ChatService", ChatService);

    function ChatService($http) {

        var api = {
            "createChat": createChat,
            "findChatById": findChatById,
            "findAllChats": findAllChats,
            "deleteChat": deleteChat,
            "updateChat": updateChat,
            "findAllChatsForUser": findAllChatsForUser,
            "deleteChatParticipant": deleteChatParticipant,
            "findPublicChats": findPublicChats
        };
        return api;


        function findChatById(chatId) {
            return $http.get("/api/chat/" + chatId);
        }

        function findPublicChats() {
            return $http.get("/api/chat");
        }

        function findAllChats() {
            return $http.get("/api/admin/chat");
        }

        function createChat(userId, friendId) {
            return $http.post("/api/chat?uid=" + userId + "&fid=" + friendId);
        }

        function deleteChat(chatId) {
            return $http.delete("/api/chat/" + chatId);
        }

        function updateChat(chatId, chat) {
            return $http.put("/api/chat/" + chatId, chat);
        }

        function findAllChatsForUser(userId) {
            return $http.get("/api/chat/" + userId)
                .then(function (response) {
                    return response.data;
                });
        }

        function deleteChatParticipant(chatId, userId) {
            return $http.delete("/api/chat/" + chatId + "/user/" + userId);
        }
    }
})();
