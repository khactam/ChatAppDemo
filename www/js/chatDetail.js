var scope
angular.module('starter.chatDetail', [])

.controller('ChatDetailCtrl', function($scope, $stateParams,$rootScope, moment,$ionicScrollDelegate,$timeout,$interval) {
	scope = $scope
	$scope.chatReceiver = $stateParams.chatReceiver;
	scope = $scope
	$scope.temp1 = []
	$scope.temp2 = []
    $scope.messages = []
  	$scope.chatInfo = new Object()
  	$scope.receiverObject = new Object()
  	$scope.member
  	$scope.leng
  	var current_user 
  	$scope.loadReceiver = function(callback){
  		console.log("loadReceiver")
  		var query = new Parse.Query('chatUsers')
  		query.equalTo('nick',$scope.chatReceiver)
  		query.first().then(function(reply){
  		  console.log(reply)
  		  $scope.receiverObject = reply 
  		  if (typeof callback === "function") callback();
  		},function(error){
  		   console.log('error: '+ error.code + ' '+ error.message);
  		})
  	}
  	$scope.loadInfoIntoTemp1 = function(callback){
	console.log("loadInfoIntoTemp1")
    var query = new Parse.Query('chatGroups')
    query.doesNotExist("anonymousUsersCanJoin");
    query.containedIn('users',[$scope.receiverObject])
    query.find().then(function(reply){
    	console.log(reply)
    	for (var i = 0; i < reply.length; i++) {
    		$scope.temp1[i] = new Object()
    		$scope.temp1[i].object = reply[i]
    		$scope.temp1[i].name = $scope.temp1[i].object.get('name')
    	}
    	if (typeof callback === "function") callback();
    },function(error){
      console.log('error: '+ error.code + ' '+ error.message);
    })
  }
  $scope.loadInfoIntoTemp2 = function(callback){
	console.log("loadInfoIntoTemp2")
    var query = new Parse.Query('chatGroups')
    query.doesNotExist("anonymousUsersCanJoin");
    query.containedIn('users',[$scope.member])
    // query.containedIn('users',[$scope.member])

    query.find().then(function(reply){
    	console.log(reply)
    	for (var i = 0; i < reply.length; i++) {
    		$scope.temp2[i] = new Object()
    		$scope.temp2[i].object = reply[i]
    		$scope.temp2[i].name = $scope.temp2[i].object.get('name')
    	}
    	if (typeof callback === "function") callback();
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
	      console.log($scope.member)
	      if (typeof callback === "function") callback();
	    },function(error){
	      console.log('error: '+ error.code + ' '+ error.message);
	    })
	  }
  	$scope.humanize = function(timestamp){
        return moment(timestamp).fromNow();
    };
  	$scope.loadMessages = function(){
  		console.log("loadMessages")
      var query = new Parse.Query('chatMessages')
      console.log($scope.chatInfo.object)
      query.equalTo('groupFor2', $scope.chatInfo.object)
      query.descending("updatedAt")
      query.limit(5)
      query.include(['sender','receiver'])
      query.find().then(function(reply){
      	console.log(reply)
      	$scope.leng = reply.length
        for (var i = 0; i < reply.length; i++) {
        	$scope.messages[i] = new Object()
        	$scope.messages[i].object = reply[i]
        	$scope.messages[i].text = $scope.messages[i].object.get('content')
        	$scope.messages[i].user = $scope.messages[i].object.get('sender').get('nick')
        	$scope.messages[i].time = $scope.messages[i].object.get('updatedAt')
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
  		dataMessage.set('groupFor2',$scope.chatInfo.object)
  		dataMessage.set('sender',$scope.member)
  		dataMessage.set('receiver',$scope.receiverObject)
  		dataMessage.set('content',$scope.message)
  		var messageObject = dataMessage
  		dataMessage.save().then(function(){
  			$scope.messages.push({text:$scope.message,time:messageObject.get('updatedAt'),user:$scope.member.get('nick'),object:messageObject})
  			$scope.message = undefined
  			$scope.$apply()
  			$scope.messages.splice($scope.leng,1)
  			$ionicScrollDelegate.scrollBottom();
  		},function(error){
  		   console.log('error: '+ error.code + ' '+ error.message);
  		})
    }
  	$scope.loadMoreMessages = function(skip){
  		console.log("loadMessagesMore")
  		$scope.skip = $scope.messages.length
  		var toCount = $scope.skip - 1
      var query = new Parse.Query('chatMessages')
      query.equalTo('groupFor2', $scope.chatInfo.object)
      query.descending("updatedAt")
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
        	$scope.messages[$scope.skip+i].time = $scope.messages[$scope.skip+i].object.get('updatedAt')
        }
        $scope.$apply()
      },function(error){
         console.log('error: '+ error.code + ' '+ error.message);
      })
    }
  	$scope.intervalRefresh = function(){
      var query = new Parse.Query('chatMessages')
      query.equalTo('groupFor2', $scope.chatInfo.object)
      query.descending("updatedAt")
      query.greaterThan("updatedAt", $scope.messages[$scope.leng-1].time)
      query.limit(10)
      query.include('sender')
      query.find().then(function(reply){
      	if(reply.length > 0){
      		for (var i = 0; i < reply.length; i++) {
	        	$scope.messages[i] = new Object()
	        	$scope.messages[i].object = reply[i]
	        	$scope.messages[i].text = $scope.messages[i].object.get('content')
	        	$scope.messages[i].user = $scope.messages[i].object.get('sender').get('nick')
	        	$scope.messages[i].time = $scope.messages[i].object.get('updatedAt')
	        }
	        $scope.$apply()
      		// $ionicScrollDelegate.scrollBottom()

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
	  $scope.loadInfo = function(callback){
	  	console.log("loadInfo")
	  	for (var i = 0; i < $scope.temp1.length; i++) {
	  		for (var j = 0; j < $scope.temp2.length; j++) {
	  			if($scope.temp1[i].name.toLowerCase() == $scope.temp2[j].name.toLowerCase()) {
	  				$scope.chatInfo = $scope.temp1[i]
	  			}
	  		}
	  	}
	  	callback()
	  }
    $scope.loadAll = function(){
    	$scope.loadReceiver(function(){
    		$scope.loadCurrentMember(function(){
    			$scope.loadInfoIntoTemp1(function(){
    				$scope.loadInfoIntoTemp2(function(){   					
    					$scope.loadInfo(function(){
    						$scope.loadMessages()
    					})
    				})
    			});	
    		})
    	})
    }
    $scope.init = function(){
    	$scope.loadAll()
    }
    $scope.init()
    $interval( function() {
    	console.log("refresh")
    	$scope.intervalRefresh()
  },5000);

})