/**
 * Created by Akshay on 4/15/2017.
 */

(function() {
    angular
        .module("UniChat")
        .controller("ChatNewController", ChatNewController)
        .controller("ChatEditController", ChatEditController)
        .controller("ChatViewController", ChatViewController)
        .controller("FriendsController", FriendsController);

    function ChatViewController(MessageService, UserService, $routeParams, ChatService, $location) {
        var vm = this;
        vm.chatId = null;
        if($routeParams.cid)
            vm.chatId = $routeParams.cid;
        vm.logout = logout;
        function init() {
            ChatService.findPublicChats()
                .success(function (chats) {
                    vm.chats = chats;
                }, function (err) {
                    vm.error = err;
                })
        }
        if(vm.chatId === null)
            init();
        else loadChat();


        function loadChat() {
            ChatService
                .findChatById(vm.chatId)
                .success(function (response) {
                    vm.chat = response[0];
                    MessageService
                        .findAllMessagesForChat(vm.chatId)
                        .success(function (response) {
                            vm.messages = response;
                        });
                    vm.chatDate = formatDate(vm.chat.dateCreated);
                })
                .error(function () {
                    vm.error = "An error has occurred!";
                });
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
        vm.deleteChat = deleteChat;
        vm.toggleChatPrivacy = toggleChatPrivacy;
        vm.updateHeader = updateHeader;
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

        function toggleChatPrivacy() {
            vm.chat.private = !vm.chat.private;
            ChatService.updateChat(vm.chatId, vm.chat)
                .then(function (chat) {
                    //location.reload();
                    vm.chat = chat;
                    location.reload();
                }, function (err) {
                    vm.error = "An error has occurred.";
                });
        }

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
            console.log(user);
            ChatService.deleteChatParticipant(vm.chatId, user._id)
                .success(function () {
                    location.reload();
                })
                .error(function (err) {
                    vm.error = "Oops! An error has occurred.";
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

        function deleteChat() {
            console.log("Delete");
            ChatService
                .deleteChat(vm.chatId)
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

        function updateHeader () {
            console.log("update header");
            var name = $('#header').text();
            if(name === null ||
                name === "") {
                vm.error = "Please do not leave chat name blank";
                $('#header').text("Enter Chat Title");
                return;
            }
            vm.chat.name = name;
            ChatService
                .updateChat(vm.chatId, vm.chat)
                .success(function(i) {
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

    function FriendsController(currentUser, $routeParams, UserService, ChatService, $location, $q) {
        var d = $q.defer();
        var vm = this;
        vm.user = currentUser;
        vm.chatId = $routeParams.cid;
        function init() {
            ChatService.findChatById(vm.chatId)
                .success(function (chat) {
                    vm.chat = chat[0];
                    var participants = chat[0].participants;
                    var members = [];
                    for(var p = 0; p < participants.length; p++) {
                        UserService.findUserById(participants[p])
                            .success(function (response) {
                                members.push(response);
                            });
                    }
                    vm.participants = members;
                })
                .error(function (err) {
                    vm.error = "Oops. An error has occurred";
                });
            var friends2 = [];
            var friends = vm.user.friends;
            for (var i = 0; i < friends.length; i++) {
                UserService.findUserById(friends[i])
                    .then(function (response) {
                        friends2.push(response.data);
                    });
            }
            vm.friends = friends2;
        }
        init();

        vm.addParticipant = function(user) {
            ChatService.findChatById(vm.chatId)
                .success(function (chat) {
                    chat[0].participants.push(user._id);
                    ChatService.updateChat(vm.chatId, chat[0])
                        .success(function (chat) {
                            UserService.findUserById(user._id)
                                .success(function (u) {
                                    console.log(u);
                                    u.chats.push(vm.chatId);
                                    UserService.updateUser(u)
                                        .success(function (res) {
                                            vm.success = u.firstName + " has been added to chat!";
                                            $location.url('#/chat/'+vm.chatId);
                                        })
                                        .error(function (err) {
                                            vm.error = "Oops! An error has occurred."
                                        })
                                });
                        });
                })
        };

        /*vm.searchUsers = function(username) {
            if(username !== null && username !== "") {


                UserService
                    .findUsersByUsername(username)
                    .then(function (response) {
                        vm.friends = getArrayWithoutUser(response.data);
                    });
            }
            else
                vm.friends = {};
        };*/

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
    }

})();