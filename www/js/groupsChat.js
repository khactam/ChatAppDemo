var scope
angular.module('starter.groupsChat', [])
.controller('GroupCtrl', function($scope, $ionicModal, $rootScope,$ionicLoading) {
  scope=$scope
  $scope.member
  $scope.chatGroups = []
  $scope.anonymous
  $scope.newGroup
  $scope.members = []
  $scope.membersToAdd = []
  $ionicModal.fromTemplateUrl('templates/addGroup.html', {
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
    },1500)
    
  };
  $scope.closeModal = function() {
    $scope.modal.hide();
  };
  $scope.loadCurrentMember = function(callback){
  console.log("loadCurrentMember")
  var query = new Parse.Query('chatUsers')
    query.equalTo('user',$rootScope.currentUser)
    query.first().then(function(reply){
      $scope.member = reply
      $scope.$apply();
      if (typeof callback === "function") callback($scope.member);
    },function(error){
      console.log('error: '+ error.code + ' '+ error.message);
    })
  }
  $scope.getParseObjectArray = function(array){
      return array.map(function(item){
          return item.object;
      });
  }
  $scope.loadGroupChat = function(){
    console.log("loadGroupChat")
    var ChatGroupsData = Parse.Object.extend('chatGroups')
    var query = new Parse.Query(ChatGroupsData)
    query.include('')
    query.exists("anonymousUsersCanJoin");
    query.containedIn('users', [$scope.member])
    query.find().then(function(reply){
      console.log(reply)
      if(reply){
        for (var i = 0; i < reply.length; i++) {
          $scope.chatGroups[i] = new Object()
          $scope.chatGroups[i].object = reply[i]
          $scope.chatGroups[i].name = $scope.chatGroups[i].object.get('name')
          $scope.chatGroups[i].id = $scope.chatGroups[i].object.id
          $scope.chatGroups[i].anonymous = $scope.chatGroups[i].object.get('anonymousUsersCanJoin')
          $scope.$apply();
        }
      }
    },function(error){
      console.log('error: '+ error.code + ' '+ error.message);
    })
  }
  $scope.loadWhenAnonymous = function(){
    console.log("loadWhenAnonymous")
    var ChatGroupsData = Parse.Object.extend('chatGroups')
    var query = new Parse.Query(ChatGroupsData)
    query.exists("anonymousUsersCanJoin");
    query.find().then(function(reply){
      if(reply){
        for (var i = 0; i < reply.length; i++) {   
          console.log(reply[i].get('anonymousUsersCanJoin'))
            $scope.chatGroups[i] = new Object()
            $scope.chatGroups[i].object = reply[i]
            $scope.chatGroups[i].name = $scope.chatGroups[i].object.get('name')
            $scope.chatGroups[i].id = $scope.chatGroups[i].object.id
            $scope.chatGroups[i].anonymous = $scope.chatGroups[i].object.get('anonymousUsersCanJoin')
            $scope.$apply();
          }
        }
      console.log($scope.chatGroups)
    },function(error){
      console.log('error: '+ error.code + ' '+ error.message);
    })
  }
  $scope.loadMembers = function(){
    var query = new Parse.Query('chatUsers')
    // query.equalTo('companyAccount',)
    query.notEqualTo('user',$rootScope.currentUser)
    query.include('user')
    query.find().then(function(reply){
      console.log(reply)
      for (var i = 0; i < reply.length; i++) {
        $scope.members[i] = new Object()
        $scope.members[i].object = reply[i]
        $scope.members[i].nick = $scope.members[i].object.get('nick')
        $scope.members[i].parseObject = $scope.members[i].object.get('user')
      }
    },function(error){
       console.log('error: '+ error.code + ' '+ error.message);
    })
  }
  
  $scope.pushMember = function(trueOrFalse,memberToAdd){
      if(trueOrFalse == true){
        $scope.membersToAdd.push(memberToAdd)
      }
      else{
        var i = $scope.membersToAdd.indexOf(memberToAdd)
        $scope.membersToAdd.splice(i,1)
      }
    }

  $scope.addGroupChat = function(newGroup, anonymous){
    $scope.membersToAdd.push({object:$scope.member})
    console.log("addGroupChat")
    var GroupChatData = Parse.Object.extend('chatGroups')
    var groupChatData = new GroupChatData({});
    var adminsRelation = groupChatData.relation("admins")
    adminsRelation.add($scope.member)
    var groupMembersRelation = groupChatData.relation("users");
    for (var i = 0; i < $scope.membersToAdd.length; i++) {
      var member = $scope.membersToAdd[i].object;
      groupMembersRelation.add(member);
    }
    if(anonymous) groupChatData.set('anonymousUsersCanJoin',anonymous)
    else groupChatData.set('anonymousUsersCanJoin',false)
    groupChatData.set('name', newGroup)
    groupChatData.save(null, {
      success: function(groupChatData){
        $scope.chatGroups.push({
        'anonymous':$scope.anonymous,
        'name':newGroup,
        'object':groupChatData,
        'id':groupChatData.id
      })
      console.log("Success")

      groupChatData.save()
      $scope.$apply();
      },
      error: function(myComment, error) {
        // The save failed.
        // error is a Parse.Error with an error code and description.
      }
    })
  }
  var loadAll = function(){
    $scope.loadCurrentMember(function(){
      $scope.loadMembers()
      if($rootScope.currentUser){
        console.log("load exist member")
        $scope.loadGroupChat();
      }
      else{
        console.log("load when anonymous")
        $scope.loadWhenAnonymous()
      }
      
    })
  }

  loadAll();
})