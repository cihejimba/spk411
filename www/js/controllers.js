angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $firebase, $state, $stateParams, $ionicPlatform) {
    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/modal.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modal = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeLogin = function() {
        $scope.modal.hide();
    };

    // Open the login modal
    $scope.login = function() {
        $scope.modal.show();
    };


    var userKey;
    var userid;
    var havePeriod;
    var dayToday;

    /*$ionicPlatform.ready(function() {
     navigator.splashscreen.hide();
    });*/

    // Check what day it is, and display the appropriate period of the class.
    function checkPeriod(dayToday) {

        if (dayToday == 1) {
            havePeriod = "period 3";
            $scope.havePeriod = havePeriod;
            console.log("period3");
        } else if (dayToday == 2) {
            havePeriod = "period 4";
            $scope.havePeriod = havePeriod;
            console.log("period4");
        } else {
            havePeriod = "not today";
            $scope.havePeriod = havePeriod;
            console.log("not today");
        }

    }
    // User Authentication
    var userRef = new Firebase("https://spkknights.firebaseio.com/");
    var auth = new FirebaseSimpleLogin(userRef, function(error, user) {
        if (error) {
            // an error occurred while attempting login
            console.log(error);
        } else if (user) {
            // user authenticated with Firebase  
            var str = user.email;
            console.log(str)
                //  if (str.search("ocsb") != -1) {
            console.log('User ID: ' + user.uid + ', Provider: ' + user.provider);
         


            $scope.loggeduser = user;
            // Assign the ID of the user to the userid variable
            userid = user.uid;

            var usersRef = new Firebase("https://spkknights.firebaseio.com/users");

            var user = $firebase(usersRef);
            $scope.user = user.$asObject();
            // Function to update the user's schedule from their input
            $scope.submitDay = function(period) {


                user.$update(userid, {
                    period3: period.day
                }).then(function(ref) {
                    ref.key(); // bar

                    userKey = ref.key();
                    console.log(userKey);
                }, function(error) {
                    console.log("Error:", error);
                });



            }

            periodRef = new Firebase("https://spkknights.firebaseio.com/users/" + userid);
            var period = $firebase(periodRef);

            $scope.period = period.$asObject();
            if (window.localStorage['didTutorial'] === "true") {
                $state.go('app.home');
            } else {
                $state.go('app.tutorial');
            }


            // } 

            /*else if (str.search("ocsb") == -1) {

                $scope.user = null;

                 auth.logout();
                 window.cookies.clear(function() {
                     console.log("Cookies cleared!");
                 });

                 $('.footer').append('<button class="button button-full button-assertive">Please login with an @ocsbstudent.ca or @ocsb.ca email.</button>');


             } */




        } else {
            // user is logged out
        }
    });

    $scope.logOut = function() {

        $scope.user = null;

        auth.logout();
        window.cookies.clear(function() {
            console.log("Cookies cleared!");
        });
        $state.go('app.login');

    };

    $scope.twitterLogin = function() {

        auth.login('twitter');
    };

    $scope.facebookLogin = function() {

        auth.login('facebook');
    };

    $scope.googleLogin = function() {

        auth.login('google');
    };

    var gamesRef = new Firebase("https://spkknights.firebaseio.com/sports/games");
    var limited = $firebase(gamesRef);
    $scope.games = limited.$asArray();


    var dayRef = new Firebase("https://spkknights.firebaseio.com/day");

    var sync = $firebase(dayRef);

    $scope.day = sync.$asObject();

    var dayz = sync.$asObject();

    dayz.$loaded().then(function() {

        console.log("day ID:", dayz.day);
        dayToday = dayz.day;

        console.log("Day today " + dayToday)
        checkPeriod(dayToday);

        var unwatch = dayz.$watch(function() {
            dayToday = dayz.day;
            checkPeriod(dayToday);
            console.log("data changed!");
        });

    });




})

.controller('LoginCtrl', function($scope, $firebase, $ionicSideMenuDelegate) {

    $ionicSideMenuDelegate.canDragContent(false)


})

.controller('HomeCtrl', function($scope, $stateParams, $cordovaSocialSharing, $firebase, $timeout, $ionicSideMenuDelegate) {

    $ionicSideMenuDelegate.canDragContent(true);
    var ref = new Firebase("https://spkknights.firebaseio.com/news");
    var limited = $firebase(ref);

    $scope.news = limited.$asArray();



    //Share features
    $scope.shareAnywhere = function(tidbit) {
        $cordovaSocialSharing.share(tidbit);
    }

    $scope.shareViaTwitter = function(tidbit, image, link) {
        $cordovaSocialSharing.canShareVia("twitter", tidbit, image, link).then(function(result) {
            $cordovaSocialSharing.shareViaTwitter(tidbit, image, link);
        }, function(error) {
            alert("Cannot share on Twitter");
        });
    }
    $scope.shareText = function(tidbit) {
        $cordovaSocialSharing.shareViaSMS(tidbit, null);


    }



})

.controller('SearchCtrl', function($scope, $stateParams, $cordovaSocialSharing, $firebase, $ionicPlatform) {

        var news = new Firebase("https://spkknights.firebaseio.com/news");
        var sync = $firebase(news);

        $scope.submitForm = function(news) {

            sync.$push({
                feedpic: news.feedpic,
                tidbit: news.tidbit,
                posted: Firebase.ServerValue.TIMESTAMP

            })

        }




    })

    .controller('StoryCtrl', function($scope, $stateParams, $firebase, $sce) {

        var storyRef = new Firebase("https://spkknights.firebaseio.com/news/" + $stateParams.storyId);
        var limited = $firebase(storyRef);

        $scope.story = limited.$asObject();

        var storyObject = limited.$asObject();
        // Allows HTML from the Firebase to be injected into the page.
        storyObject.$loaded().then(function() {


            var storyString = storyObject.story.toString();

            $scope.html = storyString;
            $scope.trustedHtml = $sce.trustAsHtml($scope.html);

        });

    })

.controller('TutorialCtrl', function($scope, $stateParams, $firebase, $ionicSideMenuDelegate, $state) {

    $ionicSideMenuDelegate.canDragContent(false);

    $scope.doneTutorial = function() {
        window.localStorage.didTutorial = true;
        $state.go('app.home');


    }


})

.controller('FeedbackCtrl', function($scope, $stateParams, $firebase, $ionicSideMenuDelegate, $state) {
    $ionicSideMenuDelegate.canDragContent(true);

    var feedback = new Firebase("https://spkknights.firebaseio.com/feedback");
    var sync = $firebase(feedback);
    var theName = $scope.loggeduser.displayName;

    $scope.submitForm = function(feedback) {

        sync.$push({
            feedback: feedback.feedback,
            name: theName


        })

        var myEl = angular.element(document.querySelector('#feedback'));
        myEl.append('<button class="button button-full button-positive"> Thanks for your feedback!</button>');

    }

})

.controller('AboutCtrl', function($scope, $stateParams, $state, $stateParams, $ionicPlatform) {
    $scope.goToFeedback = function() {



        $state.go('app.feedback');

    }
})



.controller('PlaylistCtrl', function($scope, $stateParams) {});