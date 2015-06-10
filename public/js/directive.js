var dialogInfomationDirective = angular.module('dialogInfomation', []);
dialogInfomationDirective.directive('dialogInfomationDirective', [function () {
	return {
		restrict: 'A',
		scope:{
			remainingHistoryUsers:"="
		},
		link: function (scope, iElement, iAttrs) {
			iElement.html("<a onclick=\"showDialog('#dialog')\" style=\"height:20px;padding:0px; color:white\">   More...</a>");
			/*if(remainingHistoryUsers)
			{
				iElement.innerHtml = 
				"<button onclick=\"showDialog('#dialog')\">Show dialog</button>"+
				"<div data-role=\"dialog\" id=\"dialog\"><h1>Reamining Users:</h1>";
				 iElement.innerHtml += "<p><ul>";
				 for (var i = remainingHistoryUsers.length - 1; i >= 0; i--) {
					iElement.innerHtml += "<li> " + remainingHistoryUsers[i]+" </li>";
				 }
				 iElement.innerHtml +="</ul></p></div>";
			}*/
		}
	};
}])