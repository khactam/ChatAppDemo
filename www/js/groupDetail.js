var scope
angular.module('starter.GroupDetailCtrl', [])
.controller('GroupDetailCtrl', function($scope, $stateParams, $rootScope, moment,$ionicScrollDelegate,$timeout) {
	scope = $scope
  	$scope.groupId = $stateParams.groupId;
    $scope.messages = []
  	$scope.groupInfo = new Object()
  	$scope.member
  	var current_user 
  	$scope.loadGroupInfo = function(callback){
    var query = new Parse.Query('chatGroups')
    query.equalTo('objectId', $scope.groupId)
    query.first().then(function(reply){
	    $scope.groupInfo.name = reply.get('name')
	    $scope.groupInfo.anonymous = reply.get('anonymousUserCanJoin')
	    $scope.groupInfo.object = reply
	    callback()
		$scope.$apply()
    },function(error){
      console.log('error: '+ error.code + ' '+ error.message);
    })
  }
  	$scope.loadCurrentMember = function(callback){
	  console.log("loadCurrentMember")
	  var query = new Parse.Query('chatUsers')
	    query.equalTo('user',$rootScope.currentUser)
	    query.first().then(function(reply){
	      $scope.member = reply
	      current_user = $scope.member.get('nick')
	      $scope.$apply();
	      if (typeof callback === "function") callback($scope.member);
	    },function(error){
	      console.log('error: '+ error.code + ' '+ error.message);
	    })
	  }
  	$scope.humanize = function(timestamp){
        return moment(timestamp).fromNow();
    };
  	$scope.loadMessages = function(){
      var query = new Parse.Query('chatMessages')
      query.equalTo('group', $scope.groupInfo.object)
      query.descending("createdAt")
      query.limit(5)
      query.include('sender')
      query.find().then(function(reply){
        for (var i = 0; i < reply.length; i++) {
        	$scope.messages[i] = new Object()
        	$scope.messages[i].object = reply[i]
        	$scope.messages[i].text = $scope.messages[i].object.get('content')
        	$scope.messages[i].user = $scope.messages[i].object.get('sender').get('nick')
        	$scope.messages[i].time = $scope.messages[i].object.get('createdAt')
        }
        $scope.$apply()
      },function(error){
         console.log('error: '+ error.code + ' '+ error.message);
      })
    }
    $scope.isNotCurrentUser = function(user){
            if(current_user != user){
                return 'not-current-user';
            }
            return 'current-user';
        };
  	$scope.sendTextMessage = function(){
  		var DataMessage = Parse.Object.extend('chatMessages')
  		var dataMessage = new DataMessage()
  		dataMessage.set('group',$scope.groupInfo.object)
  		dataMessage.set('sender',$scope.member)
  		dataMessage.set('content',$scope.message)
  		var messageObject = dataMessage
  		dataMessage.save().then(function(){
  			$scope.messages.push({text:$scope.message,time:messageObject.get('createdAt'),user:$scope.member.get('nick'),object:messageObject})
  			$scope.message = undefined
  			$scope.$apply()
  			$ionicScrollDelegate.scrollBottom();
  		},function(error){
  		   console.log('error: '+ error.code + ' '+ error.message);
  		})
    }
  	$scope.loadMoreMessages = function(skip){
  		$scope.skip = $scope.messages.length
  		var toCount = $scope.skip - 1
      var query = new Parse.Query('chatMessages')
      query.equalTo('group', $scope.groupInfo.object)
      query.descending("createdAt")
      query.skip($scope.skip)
      query.limit(10)
      query.include('sender')
      query.find().then(function(reply){
      	console.log(reply)
        for (var i = 0; i < reply.length; i++) {
        	$scope.messages[$scope.skip+i] = new Object()
        	$scope.messages[$scope.skip+i].object = reply[i]
        	$scope.messages[$scope.skip+i].text = $scope.messages[$scope.skip+i].object.get('content')
        	$scope.messages[$scope.skip+i].user = $scope.messages[$scope.skip+i].object.get('sender').get('nick')
        	$scope.messages[$scope.skip+i].time = $scope.messages[$scope.skip+i].object.get('createdAt')
        }
        $scope.$apply()
      },function(error){
         console.log('error: '+ error.code + ' '+ error.message);
      })
    }
    $scope.skip
	$scope.doRefresh = function() {
	    console.log('Refreshing!');
	    $timeout( function() {

	      //simulate async response
	      
	      $scope.loadMoreMessages()


	      //Stop the ion-refresher from spinning
	      $scope.$broadcast('scroll.refreshComplete');
	    
	    }, 1000);
	      
	  };
    $scope.loadAll = function(){
    	$scope.loadCurrentMember()
    	$scope.loadGroupInfo(function(){
	  		$scope.loadMessages()
	  });
    }
    $scope.loadAll()
  
})