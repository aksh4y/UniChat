/**
 * Created by Akshay on 4/18/2017.
 */

(function(){
    angular
        .module("UniChat")
        .controller("MessageListController", MessageListController)
        .controller("MessageNewController", MessageNewController)
        .controller("MessageEditController", MessageEditController);


    function MessageListController($routeParams, MessageService, $sce) {
        var vm = this;
        vm.getTrustedHtml = getTrustedHtml;
        vm.userId = $routeParams.uid;
        vm.chatId = $routeParams.cid;
        function init(){
            MessageService
                .findAllMessagesForChat(vm.chatId)
                .success(function (response) {
                    vm.messages = response;
                });
        }
        init();

        function getTrustedHtml(html) {
            return $sce.trustAsHtml(html);
        }
    }

    function MessageEditController($routeParams, MessageService,$location) {
        var vm = this;
        vm.userId = $routeParams.uid;
        vm.chatId = $routeParams.cid;
        vm.updateMessage = updateMessage;
        vm.deleteMessage = deleteMessage;
        function init() {
            MessageService
                .findMessageById(vm.messageId)
                .success(function(response) {
                    console.log("message controller found message to edit:"+response);
                    vm.message=response;
                })
                .error(function(){
                    vm.error = "An error occured";
                });
        }
        init();
        //console.log(vm.message);

        function deleteMessage () {
            MessageService
                .deleteMessage(vm.messageId)
                .success(function(){
                    $location.url("/user/"+vm.userId+"/chat/"+vm.websiteId+"/page/"+vm.pageId+"/message");
                })
                .error(function () {
                    vm.error = "Unable to delete chat";
                });

        }

        function updateMessage(_message) {
            MessageService
                .updateMessage(vm.messageId, _message)
                .success(function () {
                    $location.url("/user/"+vm.userId+"/chat/"+vm.websiteId+"/page/"+vm.pageId+"/message");
                })
                .error(function () {
                    vm.error = "Unable to update message";
                });
        }
    }

    function MessageNewController($routeParams, MessageService, $location) {
        var vm = this;
        vm.chatId = $routeParams.cid;
        vm.createNewMessage = createNewMessage;

        function createNewMessage(msg) {
            var newMessage = {
                msg: msg
            };
            MessageService
                .createMessage(vm.chatId, newMessage)
                .success(function (message) {
                    $location.url("/chat/"+vm.chatId);
                })
                .error(function () {
                    vm.error = "Could not send message";
                });
        }
    }
})();