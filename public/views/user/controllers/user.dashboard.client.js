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

        function init(){
            ChatService
                .findAllChatsForUser(vm.user._id)
                .then(function (response) {
                    vm.chats = response;
                });

            var friends2 = [];
            var friends = vm.user.friends;
            for(var i = 0; i < friends.length; i++) {
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


        vm.searchUsers = function(username) {
            if(username !== null && username !== "")
                UserService
                    .findUsersByUsername(username)
                    .then(function (response) {
                        var res = response.data;
                        var index = null;
                        for(var i = 0; i < res.length; i++) {
                            if(res[i]._id === vm.user._id)
                                index = i;
                        }
                        if(index !== null)
                            res.splice(index, 1);
                        vm.users = res;

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