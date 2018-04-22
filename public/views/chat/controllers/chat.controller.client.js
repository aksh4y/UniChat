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
    (currentUser, $routeParams, MessageService, UserService, ChatService, $location, $q) {
        var vm = this;
        vm.user = currentUser;
        vm.chatId = $routeParams.cid;
        vm.removeParticipant = removeParticipant;
        vm.createMessage = createMessage;
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
            var d = $q.defer();
            ChatService.findChatById(vm.chatId)
                .success(function (chat) {
                    vm.chat = chat[0];
                    vm.chatDate = formatDate(vm.chat.dateCreated);
                    var participants = vm.chat.participants;
                    var members = [];
                    for(var p = 0; p < participants.length; p++) {
                        UserService.findUserById(participants[p])
                            .success(function (response) {
                                members.push(response);
                            });
                    }
                    vm.participants = members;
                })
                .then(function () {
                    MessageService
                        .findAllMessagesForChat(vm.chatId)
                        .success(function (response) {
                            vm.messages = response;
                        })
                        .then(function () {
                            var msgs = [];

                            for(i = 0; i < vm.messages.length; i++) {
                                if (vm.messages[i]._user !== vm.user && vm.messages[i].language_model !== vm.user.language_model) {
                                    var message = vm.messages[i];
                                    message.source = vm.messages[i].language_model;
                                    message.destination = vm.user.language_model;
                                    MessageService.translateMessage(message)
                                        .then(function (msg) {
                                            var newMsg = msg.data;
                                            newMsg.msg = msg.data.response.translations[0].translation;
                                            msgs.push(newMsg);
                                            d.resolve(msgs);
                                        });
                                }
                                else {
                                    msgs.push(vm.messages[i]);
                                }
                            }
                            return d.promise;
                        })
                        .then(function (msgs) {
                            /*msgs = [].slice.call(msgs).sort(function(a,b){
                                return Date.parse(a.dateCreated) - Date.parse(b.dateCreated);
                            });*/
                            vm.messages = msgs;

                            /*msgs.sort(function(a, b) {
                                return Date.parse(a.dateCreated) - Date.parse(b.dateCreated);
                            });*/
                            //vm.messages = msgs;
                        });
                });
        }
        init();

        function getArrayWithoutUser(arr) {
            var index = null;
            console.log(arr);
            for(var i = 0; i < arr.length; i++) {
                console.log(arr[i]._id);
                if(arr[i]._id === vm.user._id)
                    index = i;
            }
            if(index !== null)
                arr.splice(index, 1);
            return arr;
        }

        function removeParticipant(user) {
            console.log("remove part");
            var messages = {
                msg: "bla"
            };
            MessageService.translateMessage(messages)
                .then(function (response) {
                    console.log(response);
                }, function (err) {
                    console.log(err);
                })

        }

        function createMessage(text) {
            var msg = {
                _chat: vm.chatId,
                _user: vm.user._id,
                msg: text,
                name: vm.user.firstName,
                language_model: vm.user.language_model,
                dateCreated: Date.now()
            };
            MessageService.createMessage(vm.chatId, vm.user._id, msg)
                .success(function () {
                    location.reload();
                })
                .error(function () {
                    vm.error = "An error has occurred."
                })
        }


        function formatDate(date) {
            var date = new Date(date);
            var hours = date.getHours();
            var minutes = date.getMinutes();
            var ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            minutes = minutes < 10 ? '0'+minutes : minutes;
            var strTime = hours + ':' + minutes + ' ' + ampm;
            return date.getMonth()+1 + "/" + date.getDate() + "/" + date.getFullYear() + "  " + strTime;
        }

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