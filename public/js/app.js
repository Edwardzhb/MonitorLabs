
var monitorApp = angular.module('monitorApp', ['cui',"ui.router",'appFilter','dialogInfomation']);

monitorApp.config(['$stateProvider','$urlRouterProvider', function ($stateProvider,$urlRouterProvider) {
	$stateProvider.state('/', {
		url:"/",
		templateUrl: '../view/Labs.html'
	})
	.state('labDetails', {
		url:"/labDetails/{domainName}",
		templateUrl:"../view/LabsDetails.html",
		controller: "labsDetailsController"
	});
	$urlRouterProvider.otherwise("/");
}]);

monitorApp.factory('siteMapModel', [function () {
	var items = [];
	items.push({
				icon:"home",
				label:"Home",
				//url:"./",
				id:"Home"		
			});

	return {
		items:items,
		updateSiteMap:function(label,url,id){
			if(id == "Home")
				items.splice(1);
		     else
				items[1] = {label: label, url:url};
		}
	};
}]);

monitorApp.factory('labsInfo', ['$http', function ($http) {
	
	return {
		getAllLabsByDomainName:function(domainName){
		   var method = "POST";
		   var url = "/labsInfo/getVMSByDomainName";
		   var fromData = {'domainName':domainName};
		   var jsonData = JSON.stringify(fromData);
		   
		   return $http({
			   method:method,
			   url:url,	
			   data: jsonData,		   
			   headers: {'Content-Type': 'application/x-www-form-urlencoded'}
		   });
		}
	};
}]);

var timer;
monitorApp.controller('labsDetailsController', ['$scope','$http','$state','$stateParams','$q','cuiDialog','labsInfo','cuiLoading','$interval', function ($scope,$http,$state,$stateParams,$q, cuiDialog,labsInfo,cuiLoading,$interval) {
	//alert("labsDetailsController");
	$scope.orderProp = "ComputerName";
	$scope.available = "all";
	var init =function(stateParams){
		var d = $q.defer();
		d.resolve();
		if(stateParams.domainName == "Home"){
			$state.go("/");
		}
	};
	$scope.getAllLabs = function(stateParams){
		var doaminName = stateParams.domainName;
		cuiLoading(labsInfo.getAllLabsByDomainName(doaminName)
		.success(function(data){
			 $scope.vms = data;
		})
		.error(function(data, status, headers, config) {
	    	$scope.vms = [];
	    }));
	}
	console.log("labsDetailsController");
	init($stateParams);
	//var aInterval;
	if($stateParams.domainName != "Home"){
		$scope.getAllLabs($stateParams);

	    if(angular.isDefined(timer)){
	    	$interval.cancel(timer);
	    }
	    timer = $interval(function(){ $scope.getAllLabs($stateParams);},10000);
	}
	

    $scope.showRemainUsers =  function(vm){
		   	var remainingUsers = vm.historyUsers;

		    var message = "<ul>";
		    for (var i = remainingUsers.length - 1; i >= 0; i--) {
		    	 message += "<li>"+remainingUsers[i].ClientName +" in "+ remainingUsers[i].timeDifference + "</li>";
		    };
		    message += "</ul>";
		    var dialog = cuiDialog({
		    	title: "Recent Users:",
		    	message:message,
		    	iconColor:"white",
		    	button:"ok"
		    });
		    dialog().then(function(){
		    	$scope.status = "resolved";
		    });
	   };

	   $scope.downloadRDPFile = function(vm){
	   		var computerName = vm.ComputerName;
	   		var domainName = vm.DomainName;
	   		var fileName = computerName + "." + domainName + ".rdp";
		    var url = "/labsInfo/downloadRDPFile?fileName=" + fileName;
			var iframe = document.getElementById("downloadFrame");
			iframe.src = url;
	   };
}])

monitorApp.factory('domainServices', ['$http',function ($http) {
	return {
	     getLabs : function(){
		   var url = "/labsInfo/getDomainName";
		   return $http.get(url);
	   }
	};
}])

monitorApp.controller('appController', ['$scope', function ($scope) {
	$scope.productTitle = "Monitor Lab";
}]);

monitorApp.controller('labsNavigation', ['$scope','$state', 'domainServices','siteMapModel','cuiLoading', function ($scope,$state, domainServices,siteMapModel,cuiLoading) {
	//alert("hello");
	var getLabs = domainServices.getLabs();
	cuiLoading(getLabs.success(function(data){
		//data.unshift({domainName:"Home", icon:"mif-home"});
		$scope.labs = data;
		//alert(JSON.stringify($scope.labs));
	}));

	$scope.getLabInfo = function(dn){
		$state.go('labDetails',{domainName: dn});
	};
	$scope.updateSiteMap = siteMapModel.updateSiteMap;
}]);

monitorApp.controller('monitorBannerController', ['$scope','cuiAboutBox', function ($scope, cuiAboutBox) {
		var thirdPartJson = [
		  {
		    "name": "Angular",
		    "version": "v1.3.15",
		    "license": {
		      "name": " MIT"
		    }
		  },
	    {
			"name": "CUI",
		    "version": "v2.6.0",
		    "license": {
		      "name": " Dell Inc."
		    }
	    },
	    {
			"name": "AngularUI Router",
		    "version": "v2.15",
		    "license": {
		      "name": " MIT"
		    }
	    }
	  ];
	 var aboutBox = cuiAboutBox({
	 	applicationName: "Monitor Lab",
	 	thirdParty: thirdPartJson,
	 	varsion: "v1.0",
	 	template:"aboutBox.about"
	 });
	$scope.monitorAbout = aboutBox.modal.show;	
}]);

monitorApp.controller('siteMapController', ['$scope','$location','siteMapModel', function ($scope,$location,siteMapModel) {
	$scope.items =siteMapModel.items;
	

}])



