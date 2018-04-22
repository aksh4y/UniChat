/**
 * Created by Akshay on 4/17/2018.
 */

(function() {
    angular
        .module("UniChat")
        .controller("DashboardController", DashboardController)
        .controller("FriendController", FriendController);

    function DashboardController(currentUser, ChatService, UserService, $location) {
        var vm = this;
        vm.user = currentUser;

        function getArrayWithoutUser(arr) {
            var index = null;
            for(var i = 0; i < arr.length; i++) {
                if(arr[i]._id === vm.user._id)
                    index = i;
            }
            if(index !== null)
                arr.splice(index, 1);
            return arr;
        }

        function init(){
            var userChats = [];
            for(var i=0; i < vm.user.chats.length; i++) {
                ChatService.findChatById(vm.user.chats[i])
                    .then(function (response) {
                        members = [];
                        for(i=0; i < response.data[0].participants.length; i++) {
                            UserService.findUserById(response.data[0].participants[i])
                                .then(function (response) {
                                    members.push(response.data);
                                });
                        }
                        response.data[0].participants = getArrayWithoutUser(members);
                        userChats.push(response.data[0]);
                    });
            }
            vm.chats = userChats;

            var friends2 = [];
            var friends = vm.user.friends;
            for(i = 0; i < friends.length; i++) {
                UserService.findUserById(friends[i])
                    .then(function (response) {
                        friends2.push(response.data);
                    });
            }
            vm.friends = friends2;
        }
        init();
        vm.searchUsers = function(name) {
            UserService
                .findUserByUsername(name)
                .then(function(response) {
                    vm.results = response.data;
                });
        };

        vm.removeFriend = function (friend) {
            UserService
                .removeFriend(vm.user._id, friend)
                .then(function (response) {
                    location.reload();
                }, function () {
                    vm.error = "Could not remove!"
                })
        }
    }

    function FriendController(currentUser, UserService, $location) {
        var vm = this;
        vm.user = currentUser;

        function init(){

        }
        init();

        function getArrayWithoutUser(arr) {
            var index = null;
            for(var i = 0; i < arr.length; i++) {
                if(arr[i]._id === vm.user._id)
                    index = i;
            }
            if(index !== null)
                arr.splice(index, 1);
            return arr;
        }

        vm.searchUsers = function(username) {
            if(username !== null && username !== "")
                UserService
                    .findUsersByUsername(username)
                    .then(function (response) {
                        vm.users = getArrayWithoutUser(response.data);
                    });
            else
                vm.users = {};
        };


        vm.addFriend = function (friend) {
            UserService.addFriend(vm.user._id, friend)
                .then(function (response) {
                    $location.url("/dashboard");
                }, function (err) {
                    vm.error = "Oops! An error has occurred."
                });
        };
    }
})();