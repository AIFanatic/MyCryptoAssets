<?php
	$url = "https://etherscan.io/searchHandler?t=t&term=";
	
	function filter_etherscan($str){
		$str = str_replace("ERC20", "", $str);
		$str = substr($str, 0, strpos($str, "TOKEN"));
		$str = str_replace("	", ",", $str);
		$str = str_replace(" ", "", $str);
		
		return $str;
	}
	
	function filter_term($str){
		$str = str_replace("-", "", $str);
		
		return $str;
	}
	
	function Ret($status, $msg){
		echo json_encode( array("status" => $status, "msg" => $msg) );
		die();
	}
	
	if(!isset($_GET["action"]) || !isset($_GET["term"])){
		Ret("error", "invalid parameters");
	}
	
	$action = $_GET["action"];
	$term = filter_term($_GET["term"]);
	
	if($action=="getAddressByName"){
		$json = json_decode(file_get_contents($url.$term), true);
		
		$ret = array();
		
		foreach($json as $entry){
			$data = filter_etherscan($entry);
			
			$data_array = explode(",", $data);
			
			if(isset($data_array[1])){
				array_push($ret, array("name" => $data_array[0], "address" => $data_array[1]));
			}
		
		}
		Ret("ok", $ret);
	}
?>