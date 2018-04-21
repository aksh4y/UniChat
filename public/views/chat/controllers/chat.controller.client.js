/**
 * Created by Akshay on 4/15/2017.
 */

(function() {
    angular
        .module("UniChat")
        .controller("ChatNewController", ChatNewController)
        .controller("ChatEditController", ChatEditController)
        .controller("ChatViewController", ChatViewController);

    function ChatViewController(MessageService, UserService, $routeParams, ChatService, $location) {
        var vm = this;
        vm.infographId = $routeParams.cid;
        vm.user = "no";
        vm.logout = logout;
        function init() {
            ChatService
                .findChatById(vm.infographId)
                .success(function (response) {
                    vm.chat = response[0];
                    UserService
                        .loggedIn()
                        .then(function (user) {
                            if(user != '0') {
                                vm.user = "yes";
                            } else {
                                vm.user = "no";
                            }
                        });
                    MessageService
                        .findAllMessagesForChat(vm.infographId)
                        .success(function (response) {
                            vm.messages = response;
                        });
                })
                .error(function () {
                    vm.error("An error has occurred!");
                });
        }
        init();

        function logout() {
            UserService
                .logout()
                .then(function (reponse) {
                    $location.url('/login');
                });
        }
    }

    function ChatNewController(currentUser, $routeParams, UserService, ChatService, $location) {
        var vm = this;
        vm.user = currentUser;
        vm.friendId = $routeParams.fid;
        function init() {
            ChatService
                .createChat(vm.user._id, vm.friendId)
                .success(function(i) {
                    console.log(i);
                    $location.url("/chat/"+i._id);
                })
                .error(function () {
                    vm.error = "An error has occurred.";
                });
        }
        init();
    }

    function ChatEditController
    (currentUser, $routeParams, MessageService, UserService, ChatService, $location) {
        var vm = this;
        vm.user = currentUser;
        vm.chatId = $routeParams.cid;
        /*vm.updateInfograph = updateInfograph;
        vm.deleteInfograph = deleteInfograph;
        vm.createTextMessage = createTextMessage;
        vm.createShapeMessage = createShapeMessage;
        vm.createImageMessage = createImageMessage;
        vm.deleteMessage = deleteMessage;
        vm.logout = logout;
        vm.searchPhotos = searchPhotos;
        vm.selectPhoto = selectPhoto;*/
        function init() {
            ChatService.findChatById(vm.chatId)
                .then(function (chat) {
                    vm.chat = chat.data[0];
                    
                });

            /*UserService.findUserById(vm.friendId)
                .then(function (response) {
                    vm.friend = response.data;

                });*/

           /* ChatService
                .findChatById(vm.infographId)
                .success(function (response) {
                    vm.chat = response[0];
                    $('#page-content-wrapper').css('background-image', 'url(' + vm.chat.background_url + ')');
                    $('#page-content-wrapper').css('background-color', vm.chat.background_color);

                    MessageService
                        .findAllMessagesForChat(vm.infographId)
                        .success(function (response) {
                            vm.messages = response;
                        });
                })
                .error(function () {
                    vm.error ="An error has occurred!";
                });*/
        }
        init();

        function deleteInfograph() {
            ChatService
                .deleteChat(vm.infographId)
                .success(function () {
                    $location.url('/dashboard');
                })
                .error(function () {
                    console.log("error");
                    vm.error = "An error has occurred";
                });
        }

        function logout() {
            UserService
                .logout()
                .then(function (reponse) {
                    $location.url('/login');
                });
        }

        function updateInfograph () {
            var infoTitle = $('#infoTitle').text();
            if(infoTitle == null ||
                infoTitle == "") {
                vm.error = "Please do not leave chat name blank";
                $('#infoTitle').text("Enter Chat Title");
                return;
            }
            var background_Url = $('#page-content-wrapper').css('background-image');
            background_Url = background_Url.replace('url(','').replace(')','').replace(/\"/gi, "");
            var background_color = $('#page-content-wrapper').css('background-color');

            var newInfograph = {
                name: infoTitle,
                background_color: background_color,
                background_url: background_Url
            };
            ChatService
                .updateChat(vm.infographId, newInfograph)
                .success(function(i) {
                    updateMessages();
                    updateMessagesPositions();
                    vm.message = "Successfully saved!";
                })
                .error(function () {
                    vm.error = "An error has occurred.";
                });
        }

        /* Messages */

        // Delete message
        function deleteMessage(id) {
            MessageService
                .deleteMessage(id)
                .success(function(){
                    location.reload();
                })
                .error(function () {
                    vm.error = "Unable to delete message";
                });
        }

        // Save the current positions of the messages
        function updateMessagesPositions() {

            for (var c in vm.messages) {
                var d = $(document.getElementById(vm.messages[c]._id));
                var newPos = {
                    left: d.css('left'),
                    top: d.css('top')
                };
                MessageService
                    .updateMessage(vm.messages[c]._id, newPos)
                    .success(function() {
                    })
                    .error(function(err) {
                        vm.error = "Something went wrong!";
                    });
            }
        }

        // Update all messages
        function  updateMessages() {
            var txt = "";
            var heading = "";
            for(var c in vm.messages) {
                switch (vm.messages[c].type) {
                    case 'TEXT':
                        txt = $(document.getElementById(vm.messages[c]._id +'div')).text();
                        break;
                    case 'JUMBO':
                        heading = $(document.getElementById(vm.messages[c]._id +'jHeader')).text();
                        txt = $(document.getElementById(vm.messages[c]._id +'jTxt')).text();
                        break;
                    case 'ANCHOR':
                        heading = $(document.getElementById(vm.messages[c]._id +'aLegend')).text();
                        txt = $(document.getElementById(vm.messages[c]._id +'aTxt')).text();
                        break;
                }
                var updatedMessage = {
                    text: txt,
                    heading: heading
                };
                MessageService
                    .updateMessage(vm.messages[c]._id, updatedMessage)
                    .success(function(){
                        return;
                    })
                    .error(function () {
                        vm.error = "Unable to update message";
                    });
            }
        }

        function createImageMessage(_message) {
            _message.type = "IMAGE";
            MessageService
                .createMessage(vm.infographId, _message)
                .success(function () {
                    location.reload();
                })
                .error(function () {
                    vm.error = "Unable to create message";
                });
        }

        function createTextMessage() {

            var txtType = ($( "#textOptions option:selected").text());
            var font = "";
            var type = "";
            var txt = "";
            var heading = "";
            var top = "50%";
            var left = "50%";
            switch (txtType) {
                case 'Heading':
                    type = 'TEXT';
                    font = 'Times New Roman';
                    txt = $('#text1').text();
                    break;
                case 'Text':
                    type = 'TEXT';
                    font = 'Amatic SC';
                    txt = $('#text2').text();
                    break;
                case 'Jumbotron':
                    type = 'JUMBO';
                    heading = $('#jHeader').text();
                    txt = $('#jTxt').text();
                    break;
                case 'Anchor':
                    type = 'ANCHOR';
                    heading = $('#aLegend').text();
                    txt = $('#aTxt').text();
                    break;
            }

            var newMessage = {
                type: type,
                font: font,
                text: txt,
                heading: heading,
                top: top,
                left: left};
            updateInfograph();
            MessageService
                .createMessage(vm.infographId, newMessage)
                .success(function (message) {
                    location.reload();
                })
                .error(function () {
                    vm.error = "Could not create message";
                });
        }

        function createShapeMessage(ele) {

            var newMessage = {
                type: "SHAPE",
                font: ele
            };
            updateInfograph();
            MessageService
                .createMessage(vm.infographId, newMessage)
                .success(function (message) {
                    location.reload();
                })
                .error(function () {
                    vm.error = "Could not create message";
                });
        }

        /* Flickr Services */
        function searchPhotos(searchTerm) {
            FlickrService
                .searchPhotos(searchTerm)
                .then(function(response) {
                    data = response.data.replace("jsonFlickrApi(","");
                    data = data.substring(0,data.length - 1);
                    data = JSON.parse(data);
                    vm.photos = data.photos;
                });
        }

        function selectPhoto(photo, width, height) {
            var url = "https://farm" + photo.farm + ".staticflickr.com/" + photo.server;
            url += "/" + photo.id + "_" + photo.secret + "_b.jpg";
            var message = {
                type: "IMAGE",
                url: url,
                width: width,
                height: height
            };
            MessageService
                .createMessage(vm.infographId, message)
                .then(function (response) {
                    location.reload();
                }, function (err) {
                    vm.error = "Creation error";
                });
        }
    }

})();