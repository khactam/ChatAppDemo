var scope
angular.module('starter.chats', [])

.controller('ChatsCtrl', function($scope, $rootScope,$ionicLoading,$ionicModal,moment) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});
  scope = $scope
  $scope.chats = [];
  $scope.chatReceivers = []
  $scope.member = undefined;
  $scope.membersToChat = []
  $scope.memberToChat = undefined
  $scope.usersToChat = []
   $ionicModal.fromTemplateUrl('templates/addReceiver.html', {
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
  var loadCurrentMember = function(callback){
  	console.log("loadCurrentMember")
    var query = new Parse.Query('chatUsers')
    query.equalTo('user',$rootScope.currentUser)
    query.first().then(function(reply){
      $scope.member = reply
      $scope.$apply();
      if (typeof callback === "function") callback();
    })
  }
  $scope.memberToChatFromRatio
  $scope.memberToChatObject = new Object() 
  $scope.addMemberToChat = function(valueMember){
  	$scope.memberToChatFromRatio = valueMember
  	console.log($scope.memberToChatFromRatio)

  }
  $scope.saveMemberToChat = function(){
  	$scope.memberToChatFromRatio
  	var ChatGroupData = Parse.Object.extend('chatGroups')
  	var chatGroupData = new ChatGroupData()
  	var chatGroupDataRelation = chatGroupData.relation('users')
  	chatGroupDataRelation.add($scope.member)
  	chatGroupDataRelation.add($scope.memberToChatFromRatio.object)
  	var nameChat = $scope.member.get('nick')+$scope.memberToChatFromRatio.object.get('nick')
  	chatGroupData.set('name',nameChat)
  	chatGroupData.save().then(function(){
  	  console.log("successful")
  	  $scope.chatReceivers.push({groupFor2:nameChat,lastText:"no message yet",nick:$scope.memberToChatFromRatio.object.get('nick')})
  	  $scope.$apply()
  	},function(error){
  	   console.log('error: '+ error.code + ' '+ error.message);
  	})
  }
  var count
  $scope.loadChatReceiversFunc = function(callback){
  	console.log("loadChatReceiversFunc")
  	var query = new Parse.Query('chatGroups')
  	query.doesNotExist('anonymousUsersCanJoin')
  	query.containedIn('users',[$scope.member])
  	query.find().then(function(reply){
  	  for (var i = 0; i < reply.length; i++) {
  	  	$scope.usersToChat[i] = new Object()
  	  	$scope.usersToChat[i].object = reply[i]
  	  	$scope.usersToChat[i].id = $scope.usersToChat[i].object.id
  	  }
  	  callback()
  	},function(error){
  	   console.log('error: '+ error.code + ' '+ error.message);
  	})
  }
  $scope.receiverArr = []
  $scope.lastTextAndTimeArr = []
  $scope.loadReceiver = function(callback){
  	console.log("loadReceiver")
  	for (var i = 0; i < $scope.usersToChat.length; i++) {
  		count = i
  	  	var queryRelation = $scope.usersToChat[i].object.relation('users')
  	  	queryRelation.query().find().then(function(reply){
  	  	  count = undefined
  	  	  for (var j = 0; j < reply.length; j++) {
  	  	  	if(reply[j].id !== $scope.member.id){
  	  	  		console.log(reply[j])
  	  	  		$scope.receiverArr.push(reply[j])
  	  	  	} 
  	  	  }
  	  	 callback()
  	  	},function(error){
  	  	   console.log('error: '+ error.code + ' '+ error.message);
  	  	})
  	}
  }
  $scope.loadReceiverToChat = function(callback){
  	for (var i = 0; i < $scope.usersToChat.length; i++) {
  		$scope.usersToChat[i].receiver = $scope.receiverArr[i]
  	}
  	callback()
  }
  $scope.loadLastTextAndTime = function(callback){
  	for (var i = 0; i < $scope.usersToChat.length; i++) {
  		var query = new Parse.Query('chatMessages')
  		query.descending('updatedAt')
  		query.equalTo('groupFor2',$scope.usersToChat[i].object)
  		query.include(['groupFor2','sender','receiver'])
  		query.first().then(function(reply){
  		$scope.lastTextAndTimeArr.push({object:reply,groupFor2:reply.get('groupFor2').get('name'),lastText:reply.get('content'),time:reply.get('updatedAt')})
  		$scope.$apply()
  		},function(error){
  		   console.log('error: '+ error.code + ' '+ error.message);
  		})
  	}
  }
  $scope.finalizeReceiversToShow = function(){
  	console.log("finalizeReceiversToShow")
  	console.log($scope.lastTextAndTimeArr)
  	// for (var i = 0; i < $scope.usersToChat.length; i++) {
  	// 	$scope.usersToChat[i].lastText = $scope.lastTextAndTimeArr[i].lastText
  	// 	$scope.usersToChat[i].time = $scope.lastTextAndTimeArr[i].time
  	// }
  }
  var loadChatReceivers = function(callback){
    console.log("loadChatReceivers")
    var userAsSenderQuery = new Parse.Query('chatMessages')
    userAsSenderQuery.equalTo('sender',$scope.member)
    var userAsReceiverQuery = new Parse.Query('chatMessages')
    userAsReceiverQuery.equalTo('receiver',$scope.member)
    var query = Parse.Query.or(userAsSenderQuery,userAsReceiverQuery)
    console.log($scope.member)
    query.limit(10000)
    query.ascending('updatedAt')
    query.exists("receiver")
    query.exists("groupFor2")
    query.include(['receiver','sender','groupFor2','groupFor2.name'])
    query.find().then(function(reply){
   	// console.log(reply)
    if(reply.length !== 0){
        for (var i = 0; i < reply.length; i++) {
    		$scope.chatReceivers[i] = new Object()
    		if(reply[i].get('receiver').get('nick') == $scope.member.get('nick'))
      		$scope.chatReceivers[i].nick = reply[i].get('sender').get('nick')
      		else $scope.chatReceivers[i].nick = reply[i].get('receiver').get('nick')
      		$scope.chatReceivers[i].lastText = reply[i].get('content')
      		$scope.chatReceivers[i].groupFor2 = reply[i].get('groupFor2').get('name')
      		$scope.chatReceivers[i].time = reply[i].get('updatedAt')
      		$scope.$apply();   
        }
      }
      if (typeof callback === "function") callback();
    },function(error){
      console.log('error: '+ error.code + ' '+ error.message);
    })
  }
  $scope.humanize = function(timestamp){
            return moment(timestamp).fromNow();
    };
  // var validateReceiver = function(callback){
  //  $scope.chatReceivers = $scope.chatReceivers.filter( function( item, index,  chatReceivers ) {
  //     return chatReceivers.indexOf(item) == index;
  //   });
  //  if (typeof callback === "function") callback();
  // }
	function removeDuplicates(arr, prop) {
	 var new_arr = [];
	 var lookup  = {};
		for (var i in arr) {
		 lookup[arr[i][prop]] = arr[i];
		}

		for (i in lookup) {
		 new_arr.push(lookup[i]);
		}

		return new_arr;
		}
  $scope.loadMemberToChat = function(callback){
  	console.log("loadMemberToChat")
  	var query = new Parse.Query('chatUsers')
  	query.notEqualTo('user',$rootScope.currentUser)
  	// for (var i = 0; i < $scope.chatReceivers.length; i++) {
  	// 	query.notEqualTo('user',$scope.chatReceivers[i].object)
  	// }
  	query.find().then(function(reply){
  		console.log(reply)
  	  for (var i = 0; i < reply.length; i++) {
  	  	$scope.membersToChat[i] = new Object()
  	  	$scope.membersToChat[i].nick = reply[i].get('nick')
  	  	$scope.membersToChat[i].object = reply[i]
  	  }
  	  if (typeof callback === "function") callback();
  	},function(error){
  	   console.log('error: '+ error.code + ' '+ error.message);
  	})
  }
  var loadAll = function(){
    console.log("loadAll")
    $ionicLoading.show({
          template: '<ion-spinner icon="ios"></ion-spinner>'
        });
    setTimeout(function(){
      loadCurrentMember(function(){
      	$ionicLoading.hide();
      	$scope.loadChatReceiversFunc(function(){
      		$scope.loadReceiver(function(){
	      		$scope.loadLastTextAndTime()
      			$scope.loadReceiverToChat(function(){
      					$scope.finalizeReceiversToShow()
      			})
      		})
      	})
        loadChatReceivers(function(){
	      	$scope.loadMemberToChat(function(){
	      		$scope.$apply(function(){
		      		$scope.chatReceivers = removeDuplicates($scope.chatReceivers,'nick')
	      			$scope.chatReceivers = removeDuplicates($scope.chatReceivers,'groupFor2')
	      		})


	      		
          });   
        });
      })
    },1000)
    
  }

  loadAll();
})