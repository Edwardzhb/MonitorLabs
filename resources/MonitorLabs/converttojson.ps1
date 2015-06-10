

#Extract File
Function Expand-ZIPFile($File, $Destination)
{
    $shell = new-object -com shell.application
    $zip = $shell.NameSpace($file)
    foreach($item in $zip.items())
    {
        $shell.Namespace($destination).copyhere($item)
    }
}

#convertTo-json 2.0
function ConvertTo-Json20([object] $item)
{
    add-type -assembly system.web.extensions
    $ps_js=new-object system.web.script.serialization.javascriptSerializer
    return $ps_js.Serialize($item) 
}

function addToMap($remoteInfo){
    $vmMap = @{}
	$vmMap["ComputerName"] =  "$ComputerName"
    if($remoteInfo -ne $null){
		$sessionid = $remoteInfo.SessionId
		$vmMap["SessionID"] = "$sessionid"
		$state = $remoteInfo.State
		$vmMap["State"] = "$state"      
		$clientname = $remoteInfo.ClientName
		$vmMap["ClientName"] = "$clientname"
		$WindowStationName = $remoteInfo.WindowStationName
		$vmMap.WindowStationName = "$WindowStationName"
		$UserAccount = $remoteInfo.UserAccount
		$vmMap.UserAccount = "$UserAccount"
		$IPAddress = $remoteInfo.IPAddress
		$vmMap.IPAddress = "$IPAddress"
		$LastInputTime = $remoteInfo.LastInputTime
		$vmMap.LastInputTime = "$LastInputTime"
		$LoginTime = $remoteInfo.LoginTime
		$vmMap.LoginTime = "$LoginTime"    
    }else{
		$vmMap.excepMes= "$excepMes"
    }
    return $vmMap
}


#obsulte path
$current_path = Split-Path -Parent $MyInvocation.MyCommand.Definition

#Constant
$PSTERMINALSERVICES_MODULE_PATH = $current_path+"\PSTerminalServices.zip"
$PS_SCRIPT_PATH = $current_path+ "\Scripts"
$LABS_INFO_PATH = $current_path+"\labsInfo\"
$LABS_FILE_PATH = $LABS_INFO_PATH + "*.csv"
$PSTERMINALSERVICES_EXTRACT_PATH = $current_path+ "\Scripts\PSTerminalServices"
$UPLOAD_URL = "http://localhost:41663/VMTSSessions/PostData"
$date = get-date
$date_str = $date.toString().replace("/","-").replace(":","-")

$ZIP_Item = Get-Item -Path $PSTERMINALSERVICES_MODULE_PATH
$Unzip_Exist = Test-Path -Path $PSTERMINALSERVICES_EXTRACT_PATH
if($ZIP_Item -And !$Unzip_Exist)
{
    try
    {
        $Dir_Item = New-Item -ItemType directory -Path $PS_SCRIPT_PATH
        Expand-ZIPFile -File $PSTERMINALSERVICES_MODULE_PATH -Destination $PS_SCRIPT_PATH
    }catch [Exception]{
	    Echo $_.Exception.Message
	}
}


#Import-Module
Import-Module -Name $PSTERMINALSERVICES_EXTRACT_PATH
Import-Module ActiveDirectory

$domainInfo = Get-ADDomain -Current LocalComputer
$DomainComputers = Get-ADComputer -Filter 'Name -like "WM-*"'
$vmInfoArray = @()
ForEach($Computer in $DomainComputers){

    $ComputerName = $Computer.Name
    try{
        $remoteInfo = Get-TSSession -ComputerName $ComputerName -State Active | Select SessionID,DomainName,State,ClientName,WindowStationName,UserAccount,IPAddress,LoginTime,LastInputTime
    }catch [Exception] {
        $excepMes = $_.Exception.Message
        write-output $excepMes
    }
   
    $vmMap = addToMap($remoteInfo)
	$domainName = $domainInfo.DNSRoot
    #$domainName = $domainInfo.Name
	$vmMap["DomainName"] = "$domainName"
	$vmMapJson = ConvertTo-Json20($vmMap)
    $vmInfoArray += $vmMapJson
}
$remoteInfoJson = $vmInfoArray -join ',' | out-string 
$remoteInfoJson = '[' + $remoteInfoJson + ']'
echo $remoteInfoJson
#$remoteInfoJson = ConvertTo-Json20($vmInfoArray)
#echo $remoteInfoJson

#send data to server
$URI = "http://10.30.178.210:3000/saveLabsInfo"
$wpassword = "Dell8866"
$wusername = "hzhou2"
$password = ConvertTo-SecureString $wpassword -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential ($wusername, $password)

$request = [System.Net.WebRequest]::Create($URI)
$request.ContentType = "text/plain"
$request.Method = "POST"
$request.Credentials = $credential

$request.ServicePoint.ConnectionLimit =10;
$conn=$request.ServicePoint.CurrentConnections
if ($conn -ge 8) {
    $request.ServicePoint.CloseConnectionGroup("")
}
# $request | Get-Member  for a list of methods and properties 
try
{
    $requestStream = $request.GetRequestStream()
    $streamWriter = New-Object System.IO.StreamWriter($requestStream)
    $streamWriter.Write($remoteInfoJson)
}
finally
{
    if ($null -ne $streamWriter) { $streamWriter.Dispose() }
    if ($null -ne $requestStream) { $requestStream.Dispose() }
}
$res = $request.GetResponse()
echo $res



