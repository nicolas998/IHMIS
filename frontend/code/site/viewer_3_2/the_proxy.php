<?php

	$raw_url = $_GET['url']; 
	$mime = 'text/plain'; //$_GET['mimetype'];
	header('Content-type: '.$mime);

	$url = trim(str_replace("%e%", "&", str_replace("%i%", "?", $raw_url)));  // ugly way to escape arguments
	
	/**
	 * VERBOSE
	 */
	function post_curl($url){
		$ch = curl_init();
		$proxy = "tcp://datactrproxy.iowa.uiowa.edu:8080";
		
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_POST, count($_POST));
		curl_setopt($ch, CURLOPT_POSTFIELDS, trim(http_build_query($_POST)));
		//curl_setopt($ch, CURLOPT_PROXY, $proxy);
		curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_HEADER, 0); // set 1 for debug
		$curl_scraped_page = curl_exec($ch);
		curl_close($ch);

		echo($curl_scraped_page);
	}
	
	/** 
	 * NOT VERBOSE - terrible for debugging
	 */
	function post_stream($url){
		// build post message
		$data = trim(http_build_query($_POST));
		$dl = (string)strlen($data);
		// "Content-Length: ".$dl,
		$header = implode('\r\n', array(
			"Accept: */*",
			"Host: s-iihr50.iihr.uiowa.edu",
			"X-Requested-With: XMLHttpRequest",
			"Content-type: application/x-www-form-urlencoded; charset=utf-8",
			"Content-Length: ".$dl,
			)).'\r\n';
		$header = "Content-type: application/x-www-form-urlencoded\r\n";
			
		$opts = array(
			'http'=>array(
				'method' => 'POST',
				'content' => $data,
				'header' => $header));
		$context = stream_context_create($opts);
		echo(file_get_contents($url, false, $context));
	}
	
	
	if($_SERVER['REQUEST_METHOD'] === 'POST'){
		post_curl($url);

	} else {
		// build get message
		readfile($url);
		
	}
	

	// if ($_SERVER['HTTP_HOST']=='localhost' OR $_SERVER['HTTP_HOST']=='s-iihr50.....') {
	// 	readfile($url);
	// } else {			
	// 	// DC Proxy
	// 	//$opts = array('http' => array('proxy' => 'tcp://datactrproxy.iowa.uiowa.edu:8080', 'request_fulluri' => true));
	// 	//$context = stream_context_create($opts);
	// 	//echo file_get_contents($url, False, $context);
	// }

?>