Parse.initialize("de13ae61d9f0d912be00db9dc1d65fd3"); 
Parse.serverURL = 'http://185.26.50.123:1376/parse'
var scope
angular.module('starter.controllers', [])
.controller('AccountCtrl', function($scope,  $ionicModal,$rootScope,$ionicLoading) {
  $scope.settings = {
    enableFriends: true
  };
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });
  $scope.openModal = function() {
    $ionicLoading.show({
          template: '<ion-spinner icon="dots" class="spinner-dark"></ion-spinner>'
        });
    setTimeout(function(){
      $ionicLoading.hide();
      $scope.modal.show();
    },1000)
  }
  $scope.closeModal = function() {
    $scope.modal.hide();
  };
  // Execute action on hide modal
  $scope.$on('modal.hidden', function() {
    // Execute action
  });
    $scope.loginData = new Object;
  $scope.addUsername = function(index){
    $scope.loginData.username = index
  }
  $scope.addPassword = function(index){
    $scope.loginData.password = index
  }
  $scope.doLogin = function() {
    $ionicLoading.show({
          template: '<ion-spinner icon="dots" class="spinner-dark"></ion-spinner>'
        });
    setTimeout(function(){
      console.log('Doing login', $scope.loginData);
      console.log($scope.loginData.username);
      Parse.User.logIn($scope.loginData.username, $scope.loginData.password, {
        success: function(user){
          console.log(user);
          $rootScope.$apply(function(){
            $rootScope.loggedIn = true;
          })
          console.log("Successful");
          window.location.reload();
          setTimeout(function(){
              window.location.replace('#/tab/group')
            },500)
          $ionicLoading.hide();
          
            $scope.$apply();
        },
        error: function(user, error){
          console.log(error);
        }
      })
    },500) 
  }
});
