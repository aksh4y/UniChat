/**
 * Created by Akshay on 4/17/2018.
 */
(function() {
    angular
        .module("UniChat")
        .controller("LoginController", LoginController)
        .controller("ProfileController", ProfileController)
        .controller("RegisterController", RegisterController);

    function LoginController(UserService, $location) {
        var vm = this;
        vm.login = login;

        function login(user) {
            if (user === null          ||
                user.username === ""   ||
                user.password === null ||
                user.password === ""){
                vm.error = "Please enter your credentials!";
                return;
            }
            UserService
                .login(user)
                .then(function (user) {
                    if(user) {
                        if(user === "bad pwd")
                            vm.error = 'Please enter correct username and password';
                        else
                            $location.url('/profile')
                    } else {
                        vm.error = 'Please enter correct username and password';
                    }
                });
        }
    }

    function ProfileController(currentUser, UserService, $location) {
        var vm = this;
        vm.user = currentUser;
        vm.logout = function() {
            UserService
                .logout()
                .then(function (reponse) {
                    $location.url('/login');
                });
        };


        vm.update = function (newUser) {
            var model = 'en';
            switch(newUser.language) {
                case 'English': model =  'en';
                    break;
                case 'Chinese': model = 'zh';
                    break;
                case 'Traditional Chinese': model = 'zht';
                    break;
                case 'Korean': model = 'ko';
                    break;
                case 'Arabic': model = 'ar';
                    break;
                case 'French': model = 'fr';
                    break;
                case 'Portuguese': model = 'pt';
                    break;
                case 'Spanish': model = 'es';
                    break;
                case 'Dutch': model = 'nl';
                    break;
                case 'Italian': model = 'it';
                    break;
                case 'German': model = 'de';
                    break;
                case 'Japanese': model = 'ja';
                    break;
                case 'Turkish': model = 'tr';
                    break;
                case 'Polish': model = 'pl';
                    break;
                case 'Russian': model = 'ru';
                    break;
            }

            newUser.language_model = model;
            UserService
                .updateUser(newUser)
                .success(function () {
                    vm.message = "User successfully updated"
                })
                .error(function() {
                    vm.error = "Unable to update user";
                })

        };

        vm.delete = function (userId) {
            var answer = confirm("Are you sure?");
            if(answer) {
                UserService
                    .deleteUser(userId)
                    .success(function() {
                        $location.url("/login");
                    })
                    .error(function() {
                        vm.error = "Some error occurred.";
                    });
            }
        };
    }

    function RegisterController($location, UserService) {
        var vm = this;

        vm.recover = function recover(user) {
            if (user == null          ||
                user.username == null ||
                user.phone == null    ||
                user.username == ""   ||
                user.phone == ""){
                vm.error = "Please enter your username and phone number";
            }
            else {
                UserService.recover(user)
                    .then(function (u) {
                        vm.success = "OTP Sent!";
                    }, function (err) {
                        vm.error = "Incorrect username and/or mobile number. Contact administrator.";
                    });
            }

        };

        vm.register = function register(user) {
            if (user === null          ||
                user.username === null ||
                user.password === null ||
                user.username === ""   ||
                user.password === ""   ||
                user.email === null    ||
                user.email === ""      ||
                user.phone === null    ||
                user.phone === ""      ||
                user.verifypassword === null ||
                user.verifypassword === ""){
                vm.error = "Please enter all your details!";
                return;
            }
            if (user.password !== user.verifypassword) {
                vm.error = "Password mismatch";
                return;
            }

            var model = 'en';
            switch(user.language) {
                case 'English': model =  'en';
                break;
                case 'Chinese': model = 'zh';
                break;
                case 'Traditional Chinese': model = 'zht';
                    break;
                case 'Korean': model = 'ko';
                    break;
                case 'Arabic': model = 'ar';
                    break;
                case 'French': model = 'fr';
                    break;
                case 'Portuguese': model = 'pt';
                    break;
                case 'Spanish': model = 'es';
                    break;
                case 'Dutch': model = 'nl';
                    break;
                case 'Italian': model = 'it';
                    break;
                case 'German': model = 'de';
                    break;
                case 'Japanese': model = 'ja';
                    break;
                case 'Turkish': model = 'tr';
                    break;
                case 'Polish': model = 'pl';
                    break;
                case 'Russian': model = 'ru';
                    break;
            }


            var newUser = {
                username: user.username,
                password: user.password,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                language: user.language,
                language_model: model
            };
            UserService.register(newUser)
                .then(function(user) {
                    $location.url("/profile");
                }, function(err) {
                    vm.error = "Username taken.";
                });
        }
    }
})();