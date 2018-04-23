(function () {
    angular
        .module("UniChat", ['ngRoute'])
        .config(configuration);

    function configuration($routeProvider, $httpProvider) {

        $httpProvider.defaults.headers.post['Content-Type'] = 'application/json;charset=utf-8';
        $httpProvider.defaults.headers.put['Content-Type'] = 'application/json;charset=utf-8';


        $routeProvider
            .when("/", {
                templateUrl: 'views/chat/templates/welcome.html'
            })
            .when("/login", {
                templateUrl: 'views/user/templates/login.view.client.html'
            })
            .when("/login-local", {
                templateUrl: 'views/user/templates/login-local.view.client.html',
                controller: 'LoginController',
                controllerAs: 'model'
            })
            .when("/register", {
                templateUrl: 'views/user/templates/register.view.client.html'
            })
            .when("/register-local", {
                templateUrl: 'views/user/templates/register-local.view.client.html',
                controller: 'RegisterController',
                controllerAs: 'model'
            })
            .when("/recover", {
                templateUrl: 'views/user/templates/forgot-password.view.client.html',
                controller: 'RegisterController',
                controllerAs: 'model'
            })
            .when('/profile', {
                templateUrl: 'views/user/templates/profile.view.client.html',
                controller: 'ProfileController',
                controllerAs: 'model',
                resolve: {
                    currentUser: checkLogin
                }
            })
            .when("/dashboard", {
                templateUrl: 'views/user/templates/dashboard.view.client.html',
                controller: "DashboardController",
                controllerAs: "model",
                resolve: {
                    currentUser: checkLogin
                }
            })
            .when("/admin", {
                templateUrl: 'views/admin/templates/admin.view.html',
                controller: "AdminController",
                controllerAs: "model",
                resolve: {
                    currentUser: checkAdmin
                }
            })
            .when("/admin/users", {
                templateUrl: 'views/admin/templates/admin-users.view.html',
                controller: "AdminController",
                controllerAs: "model",
                resolve: {
                    currentUser: checkAdmin
                }
            })
            .when("/admin/chats", {
                templateUrl: 'views/admin/templates/admin-chats.view.html',
                controller: "AdminController",
                controllerAs: "model",
                resolve: {
                    currentUser: checkAdmin
                }
            })
            .when("/admin/create", {
                templateUrl: 'views/admin/templates/admin-add-user.view.html',
                controller: "AdminController",
                controllerAs: "model",
                resolve: {
                    currentUser: checkAdmin
                }
            })
            .when("/test", {
                templateUrl: 'views/chat/templates/chat-edit.view.client.html'
            })
            .when("/chat", {
                templateUrl: 'views/chat/templates/chat-general.client.html'
            })
            .when("/chat/public",{
                templateUrl: 'views/chat/templates/chat-public.view.client.html',
                controller: "ChatViewController",
                controllerAs: "model"
            })
            .when("/chat/viewer/:cid/public", {
                templateUrl: 'views/chat/templates/chat-public-viewer.view.client.html',
                controller: "ChatViewController",
                controllerAs: "model"
            })
            .when("/friends", {
                templateUrl: 'views/user/templates/friends.view.client.html',
                controller: 'FriendController',
                controllerAs: 'model',
                resolve: {
                    currentUser: checkLogin
                }
            })
            .when("/chat/new", {
                templateUrl: 'views/chat/templates/chat-edit.view.client.html',
                controller: "ChatNewController",
                controllerAs: "model",
                resolve: {
                    currentUser: checkLogin
                }
            })
            .when("/chat/:uid/friend/:fid/new", {
                templateUrl: 'views/chat/templates/chat-edit.view.client.html',
                controller: "ChatNewController",
                controllerAs: "model",
                resolve: {
                    currentUser: checkLogin
                }
            })
            .when("/chat/:cid", {
                templateUrl: 'views/chat/templates/chat-edit.view.client.html',
                controller: "ChatEditController",
                controllerAs: "model",
                resolve: {
                    currentUser: checkLogin
                }
            })
            .when("/chat/:cid/addFriend", {
                templateUrl: 'views/chat/templates/chat-add-friend.view.client.html',
                controller: "FriendsController",
                controllerAs: "model",
                resolve: {
                    currentUser: checkLogin
                }
            })
            .when("/editor/:cid/addtxt", {
                templateUrl: 'views/message/templates/editors/text-new.view.client.html',
                controller: "MessageNewController",
                controllerAs: 'model',
                resolve: {
                    currentUser: checkLogin
                }
            })
            .otherwise({
                redirectTo: "/"
            });
    }

    function checkAdmin($q, UserService, $location) {
        var deferred = $q.defer();
        UserService
            .isAdmin()
            .then(function (user) {
                if(user !== '0' && user.role.indexOf('ADMIN') > -1) {
                    deferred.resolve(user);
                } else {
                    $location.url('/profile');
                    deferred.reject();
                }
            });
        return deferred.promise;
    }

    function checkLogin($q, UserService, $location) {
        var deferred = $q.defer();
        UserService
            .loggedIn()
            .then(function (user) {
                if(user !== '0') {
                    deferred.resolve(user);
                }
                else {
                    $location.url('/login');
                    deferred.reject();
                }
            });
        return deferred.promise;
    }
})();