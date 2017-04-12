// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
var app = angular.module('starter', ['ionic',
 'starter.controllers', 'starter.login','starter.GroupDetailCtrl','angularMoment','starter.chatDetail','starter.groupsChat',
 'starter.chats'])

app.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})
app.run(function($rootScope, $location,$ionicLoading,$window,$location){
  $rootScope.init = function() {
    var user = Parse.User.current();
    console.log(user);
    if (user){
      $rootScope.loggedIn = true;
      $rootScope.currentUser = user;
    } 
  };
    $rootScope.init();

  $rootScope.logOut = function() {
    $ionicLoading.show({
      template: '<ion-spinner icon="dots" class="spinner-dark"></ion-spinner>'
    });
    setTimeout(function(){
      Parse.User.logOut().then(function() {
        console.log("logOut done");
        $rootScope.$apply(function () {
          $ionicLoading.hide();
          window.location.reload()
          $rootScope.loggedIn = false;
        })
        $location.path('/login').replace();
        var currentUser = Parse.User.current();
      });
    },500)
    
  };
})


app.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:

  .state('tab.group', {
    url: '/group',
    views: {
      'tab-group': {
        templateUrl: 'templates/tab-group.html',
        controller: 'GroupCtrl'
      }
    }
  })

  .state('tab.chats', {
      url: '/chats',
      views: {
        'tab-chats': {
          templateUrl: 'templates/tab-chats.html',
          controller: 'ChatsCtrl'
        }
      }
    })
    .state('tab.chat-detail', {
      url: '/chats/:chatReceiver',
      views: {
        'tab-chats': {
          templateUrl: 'templates/chat-detail.html',
          controller: 'ChatDetailCtrl'
        }
      }
    })
  .state('tab.group-detail', {
      url: '/group/:groupId',
      views: {
        'tab-group': {
          templateUrl: 'templates/group-detail.html',
          controller: 'GroupDetailCtrl'
        }
      }
    })

  .state('tab.account', {
    url: '/account',
    views: {
      'tab-account': {
        templateUrl: 'templates/tab-account.html',
        controller: 'AccountCtrl'
      }
    }
  })
  .state('tab.login', {
      url: '/login',
      views: {
          templateUrl: 'templates/login.html',
          controller: 'login'
      }
    });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/login');

});

