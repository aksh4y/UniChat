(function(){
    angular
        .module("UniChat")
        .factory('UserService', UserService);
    
    function UserService($http) {

        var api = {
            "register": register,
            "loggedIn": loggedIn,
            "login": login,
            "logout": logout,
            "isAdmin": isAdmin,
            "findAllUsers" : findAllUsers,
            "findUserById": findUserById,
            "findUserByUsername": findUserByUsername,
            "findUsersByUsername": findUsersByUsername,
            "updateUser": updateUser,
            "deleteUser": deleteUser,
            "recover": recover,
            "addFriend": addFriend,
            "removeFriend": removeFriend
        };
        return api;



        function register(user) {
            return $http.post('/api/register', user)
                .then(function (response) {
                    return response.data;
                });
        }

        function recover(user) {
            return $http.post('/api/recover', user)
                .then(function (response) {
                    return response.data;
                })
        }

        function findAllUsers() {
            return $http.get('/api/admin/user')
                .then(function (response) {
                    return response.data;
                });
        }

        function isAdmin() {
            return $http.post('/api/isAdmin')
                .then(function (response) {
                    return response.data;
                });
        }

        function logout() {
            return $http.post('/api/logout')
                .then(function (response) {
                    return response.data;
                });
        }

        function login(user) {
            return $http.post('/api/login', user)
                .then(function (response) {
                    return response.data;
                });
        }

        function  addFriend(userId, friend) {
            return $http.put('/api/user/'+userId+"/friend", friend)
                .then(function (response) {
                    return response.data;
                });
        }

        function removeFriend(userId, friend) {
            console.log("remove friend client");
            return $http.put('/api/user/'+userId+"/friend/remove", friend)
                .then(function (response) {
                    return response.data;
                })
        }

        function loggedIn() {
            return $http.get('/api/loggedIn')
                .then(function (response) {
                    return response.data;
                });
        }

        function updateUser(user) {
            return $http.put("/api/user/"+user._id, user);
        }

        function findUserById(uid) {

            return $http.get("/api/user/"+ uid);
        }

        function findUserByUsername(username) {
            return $http.get("/api/user?username="+username);
        }

        function  findUsersByUsername(username) {
            return $http.get("/api/users?username="+username);
        }

        function deleteUser(userId) {
            return $http.delete("/api/user/"+userId);
        }
    }
})();