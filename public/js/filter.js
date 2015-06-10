
var appFilter = angular.module('appFilter', []);

appFilter.filter('vmsFilter',function(){
	return function(input,fields,available){
		if(input === undefined) {
          return [];
		}
		var availArray = [];
		var excepArray = [];
		var busyArray = [];
		for(var i=0;i<input.length;i++){
			var clientName = input[i][fields[0]];
			var state = input[i][fields[1]];
			if(clientName != "" && clientName != null){
				busyArray.push(input[i]);
			}else if(state != 'Active'){
				excepArray.push(input[i]);
			}else{
				availArray.push(input[i]);
			}
		}		
		if(available == "all"){
			return input;
		}else if(available == "true"){
			return availArray;
		}else if(available == "excep"){
			return excepArray;
		}else if(available == "false" ){
			return busyArray;
		}		
	};	
});