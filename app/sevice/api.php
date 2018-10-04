<?php

header ( "Cache-Control: no-cache, must-revalidate" );
header ( "Pragma: no-cache" );

include('./conn.php');

?>

<?php

$action = isset($_GET['action']) ? $_GET['action'] : "";
if ( $action == "join" ) {
	$id = isset($_GET['id']) ? $_GET['id'] : "";
	$name = isset($_GET['name']) ? $_GET['name'] : "";
	$url = isset($_GET['url']) ? $_GET['url'] : "";
	$pace= isset($_GET['pace']) ? $_GET['pace'] : "";
	$data = array(
		"id" => $id,
		'name' => $name,
		'url' => $url,
		'pace' => $pace,
		'lastdate' =>date("Y-m-d"),
		'donate' =>0,
		'donatetoday' =>0,
	);
	if ( $id == ""||$name == "" ||$url == ""||$pace == "") {
		haltPutout($data);
	}

   $pace = 0;
	 $donate = 0;
	 $donatetoday = 0;
	 $select =  $db->select('run','id','id ="'.$id.'"');
  if ($select){
		  $select = $db->select('run','*','id ="'.$id.'"',true);
			$arr=mysql_fetch_assoc($select);
			if($arr["lastdate"] == $data["lastdate"])
				{

						$pace = $data["pace"]-$arr["pace"];
						$data["donate"] = $arr["donate"] + $pace;
						$donate =  $data["donate"];
						$data["donatetoday"] = $arr["donatetoday"] + $pace;
						$donatetoday = $data["donatetoday"];
				}
			 else {
				 $pace = $data["pace"];
 				 $data["donate"] = $arr["donate"]+$pace;
				 $donate =  $data["donate"];
				 $data["donatetoday"] = $pace;
				 $donatetoday = $data["donatetoday"];
			 }
			$db->update('run',$data,'id ="'.$id.'"');
	}
	else{
		$data["donate"] = $data["pace"];
		$data["donatetoday"] = $data["pace"];
		$pace = $data["pace"];
		$donate = $data["pace"];
		$donatetoday = $data["pace"];
		$db->insert('run', $data);
	}
	class Donate
	{
	public $donatetoday;
	public $donate;
	public $pace;
	}
	$user = new Donate();
	$user->donatetoday = $donatetoday;
	$user->donate = $donate;
	$user->pace = $pace;
	$json = json_encode($user);
	echo "{".'"user"'.":".$json."}";
}
else if ( $action == "find" ) {
	$json = '';
	$data = array();
	$rank = 0;
	$id = isset($_GET['id']) ? $_GET['id'] : "";
	class User
	{
	public $rank;
	public $id;
	public $name;
	public $url;
	public $pace;
	}
	$select =  $db->select('run','*','',true);
	$all = 0;
	$usrrank = 0;
	$donate=0;
	$donatetoday = 0;
	while($arr=mysql_fetch_assoc($select)){
		$rank = $rank + 1;
		if ( $arr["id"] == $id)
		{
			$usrrank = $rank;
			$donate= $arr["donate"];
			if (date("Y-m-d") == $arr["lastdate"]){
				$donatetoday = $arr["donatetoday"];}
			else {
				$donatetoday = 0;
			}
		}
		if ($rank <=50){
		$user = new User();
		$user->id = $arr["id"];
		$user->name =$arr["name"];
		$user->url = $arr["url"];
		$user->pace =$arr["donate"];
		$user->rank = $rank;
		$data[]=$user;
		}
		$all = $all + $arr["donate"];
		}
			$json = json_encode($data);
			echo "{".'"user"'.":".$json.",".'"totaldonate"'.":".$all.",".'"rank"'.":".$usrrank.",".'"donate"'.":".$donate.",".'"donatetoday"'.":".$donatetoday."}";
}
else if ( $action == "session" ) {
	$url = isset($_GET['url']) ? $_GET['url'] : "";
	$html = file_get_contents($url);
	echo $html;
}
/**
	 *
	 * 信息输出
	 *
	 * @param $msg
	 */
	function haltPutout($msg)
	{
		if(isset($_GET['jsonp']) && isset($_GET['callback'])) {
			$msg = json_encode($msg);
			$msg = "{$_GET['callback']}($msg);";
		}
		if(!is_string($msg))
			$msg = json_encode($msg);

		die($msg);
	}
?>
