<?php
	$url = "https://coinmarketcap.com/currencies/";
	
	function getContents($str, $startDelimiter, $endDelimiter) {
		$contents = array();
		$startDelimiterLength = strlen($startDelimiter);
		$endDelimiterLength = strlen($endDelimiter);
		$startFrom = $contentStart = $contentEnd = 0;
		while (false !== ($contentStart = strpos($str, $startDelimiter, $startFrom))) {
		  $contentStart += $startDelimiterLength;
		  $contentEnd = strpos($str, $endDelimiter, $contentStart);
		  if (false === $contentEnd) {
			break;
		  }
		  $contents[] = substr($str, $contentStart, $contentEnd - $contentStart);
		  $startFrom = $contentEnd + $endDelimiterLength;
		}
	  
		return $contents;
	}

	function GetUrlLastArg($url){
		$arr = explode("/", $url);

		return $arr[count($arr)-1];
	}

	function Ret($status, $msg){
		echo json_encode( array("status" => $status, "msg" => $msg) );
		die();
	}
	
	if(!isset($_GET["action"]) || !isset($_GET["term"])){
		Ret("error", "invalid parameters");
	}
	
	$action = $_GET["action"];
	$term = $_GET["term"];

	$ret = array();
	
	if($action=="getAddressByName"){
		$html = @file_get_contents($url.$term);
		
		$ret = array();

		$all_explorers = getContents($html, 'title="Explorer"></span> <a href="', '" target="_blank">Explorer');
		
		foreach($all_explorers as $explorer){
			$last_arg = GetUrlLastArg($explorer);
			
			if(strpos($last_arg, "0x")!==false){
				array_push($ret, array("name" => $term, "address" => $last_arg));

				Ret("ok", $ret);
			}
		}

		Ret("error", "Nothing found");
	}
?>