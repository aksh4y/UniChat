/**
 * Created by Akshay on 4/18/2017.
 */
(function () {
    angular
        .module('UniChat')
        .controller('AdminController', AdminController);

    function AdminController(UserService, ChatService, $location) {
        var vm = this;

        vm.deleteUser = deleteUser;
        vm.updateUser = updateUser;
        vm.createUser = createUser;

        function init() {
            findAllUsers();
            findAllChats();
        }
        init();

        function updateUser(user) {
            UserService
                .updateUser(user)
                .then(function () {
                    vm.message = "Updated";
                })
                .then(findAllUsers);
        }

        function findAllChats() {
            ChatService.findAllChats()
                .then(function (chats) {
                    vm.chats = chats.data;
                })
        }

        function createUser(user) {
            if (user === null          ||
                user.username === null ||
                user.password === null ||
                user.username === ""   ||
                user.password === ""   ||
                user.email === null    ||
                user.email === ""      ||
                user.phone === null    ||
                user.phone === ""){
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
                role: user.role,
                language: user.language,
                language_model: model
            };
            UserService.register(newUser)
                .then(function(user) {
                    $location.url("/admin/users");
                }, function(err) {
                    vm.error = "Username taken.";
                });
        }

        function findAllUsers() {
            UserService.
            findAllUsers()
                .then(renderUsers);
        }

        function deleteUser(user) {
            UserService
                .deleteUser(user._id)
                .then(findAllUsers);
        }

        function renderUsers(users) {
            vm.users = users;
        }
    }
})();