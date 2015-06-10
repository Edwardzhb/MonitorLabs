//read xlsx using xlsx module

if(typeof require !== 'undefined') 
	var XLSX = require('xlsx');
var workbook = XLSX.readFile('../resources/sample.xlsx');
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '12357'
});
connection.connect();
connection.query('use labsInfo;');
connection.query('create table if not exists userNameMapping(id int(11) primary key auto_increment,Owner varchar(100),QuestPropertyNO varchar(100));',function(err,rows){
	if(err) throw err;
}); 

function to_json(workbook) {
    var result = {};
    workbook.SheetNames.forEach(function(sheetName) {
		console.log(sheetName);
        var roa = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
        if(roa.length > 0){
            result[sheetName] = roa;
        }
    });
    return result;
}
function saveUserNamesToDB(workbook){
	connection.query('use labsInfo;');
	connection.query('select count(*) count from userNameMapping;',function(err,rows,fields){
		console.log(rows[0].count);
		if(rows[0].count == 0){
			var userNameJson = to_json(workbook);
			var rows = userNameJson.Sheet1;
			for(var i=0;i < rows.length;i++){
				connection.query('insert into userNameMapping values(?,?);',[rows[i].Owner,rows[i]["Quest Property NO."]],function(err,rows,fields){
					if(err) throw err;
				});
			}
		}
	});
} 
function updateUserNameMapping(workbook){
	connection.query('use labsInfo;');
	connection.query('truncate table userNameMapping')
	var userNameJson = to_json(workbook);
	var rows = userNameJson.Sheet1;
	for(var i=0;i < rows.length;i++){
		connection.query('insert into userNameMapping(Owner,QuestPropertyNO) values(?,?);',[rows[i].Owner,rows[i]["Quest Property NO."]],function(err,rows,fields){
			if(err) throw err;
		});
	}
}
updateUserNameMapping(workbook);