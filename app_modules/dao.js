//MODULE
//GET DATA FROM MYSQL,SEND DATA TO CLIENT-SIDE

//connect to mysql 

//exports.getVMSByDomainName = getVMSByDomainName;
//exports.getDomainName = getDomainName;
//var readXLSX = require('./readXLSX');

var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '12357'
});
connection.connect();
connection.query('use labsInfo;');
connection.query('create table IF NOT EXISTS vmsInfo(ID int(11),SessionID int(3),ComputerName varchar(100),DomainName varchar(100),excepMes varchar(225),State varchar(50),\
		ClientName varchar(50),WindowStationName varchar(50),UserAccount varchar(225),IPAddress varchar(100),LastInputTime varchar(225),LoginTime varchar(225),\
		create_time datetime);',function(err,rows){
	if(err) throw err;
});

exports.getVMSByDomainName = function(res,data){
	console.log(data);
	var jsData = JSON.parse(data);
	console.log(jsData['domainName']);
	connection.query('use labsInfo;');
	connection.query('select ComputerName,ClientName,State,DomainName from vmsInfo a where a.domainName=? and create_time = (\
	select create_time from vmsInfo b where b.domainName=a.domainName order by create_time desc limit 1)',[jsData.domainName],function(err,rows,fields){				
		console.log(rows);			
		var vms = rows;
		addHistoryUsersToVMS(vms,function(results){
			console.log(results);
			res.end(JSON.stringify(results));
		})
		
	});
}

var addHistoryUsersToVMS = function(vms,callback){
	var vmsLen = vms.length;
	var results = [];
	for(var i in vms){
		(function(vm){		
			var cName = vm.ComputerName;
			var sql = "select ClientName,CAST(create_time AS CHAR(30)) create_time from vmsInfo a where a.ComputerName=? and a.ClientName is not NULL and a.ClientName !='' \
			and create_time < (select create_time from vmsInfo b where b.ComputerName=a.ComputerName order by create_time desc limit 1);";
			connection.query(sql,[cName],function(err,rows,fields){
				//console.log(cName);
				vm.historyUsers = rows;
				timeConvertToAgoFormat(rows);
				//console.log(rows);
				results.push(vm);
				//console.log(results);
				if(0 == --vmsLen){					
					callback(results);
				}
			});
		})(vms[i]);	
	}	
}

exports.getDomainName = function(res){
	connection.query('use labsInfo;');
	connection.query('select distinct domainName from vmsInfo;',function(err,rows,fields){
		var retStr = JSON.stringify(rows);
		console.log(retStr);
		res.end(retStr);
	});
};

exports.saveLabsInfo = function(data){
	console.log(data);
	var jsonObj = JSON.parse(data);
	console.log(jsonObj);
	connection.query('use labsInfo;');
	connection.query('select * from userNameMapping',function(err,rows,fields){//first select all then find username;
		var userNameMapping = {};
		for(var i=0;i<rows.length;i++){
			userNameMapping[rows[i].QuestPropertyNO] = String(rows[i].Owner)
		}
		for(var i=0;i < jsonObj.length;i++){
		  console.log(jsonObj[i].ComputerName);
		  connection.query('insert into vmsInfo(SessionID,ComputerName,DomainName,excepMes,State,ClientName,WindowStationName,UserAccount,\
		  IPAddress,LastInputTime,LoginTime,create_time) values(?,?,?,?,?,?,?,?,?,?,?,now())',[jsonObj[i].SessionID,jsonObj[i].ComputerName,jsonObj[i].DomainName,
		  jsonObj[i].excepMes,jsonObj[i].State,userNameMapping[jsonObj[i].ClientName],jsonObj[i].WindowStationName,jsonObj[i].UserAccount,jsonObj[i].IPAddress,jsonObj[i].LastInputTime,
		  jsonObj[i].LoginTime],function(err,rows,fields){
			 if(err) throw err;
				console.log(rows);
		  });		  
		}
	});	
}

var timeConvertToAgoFormat = function(rows){
	for(var i in rows){
		var user = rows[i];
		var create_time = user.create_time;
		if(create_time != null){
			user.timeDifference = timeDifference(new Date(),new Date(create_time));
		}
	}
}
var timeDifference = function(current,previous){
	var msPerMinute = 60 * 1000;
	var msPerHour = msPerMinute * 60;
	var msPerDay = msPerHour * 24;
	var msPerMonth = msPerDay * 30;
	var msPerYear = msPerDay * 365;

	var elapsed = current - previous;

	if (elapsed < msPerMinute) {
		 return Math.round(elapsed/1000) + ' seconds ago';   
	}

	else if (elapsed < msPerHour) {
		 return Math.round(elapsed/msPerMinute) + ' minutes ago';   
	}

	else if (elapsed < msPerDay ) {
		 return Math.round(elapsed/msPerHour ) + ' hours ago';   
	}

	else if (elapsed < msPerMonth) {
		return Math.round(elapsed/msPerDay) + ' days ago';   
	}

	else if (elapsed < msPerYear) {
		return Math.round(elapsed/msPerMonth) + ' months ago';   
	}

	else {
		return Math.round(elapsed/msPerYear ) + ' years ago';   
	}
}
