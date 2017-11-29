<?php
	header("Content-Type: text/plain");
	
	$sc_representation_id = "disclausgssih";
	
	// read sc_reference_id
	if(isset($_GET['sc_reference_id'])){
		$sc_reference_id = $_GET['sc_reference_id'];
	} else {
		exit();
	}
	
	// read sc_reftime
	if(isset($_GET['ref_time'])){
		$sc_reftime = $_GET['ref_time'];
	} else {
		$sc_reftime = 0;
	}
	
	// read runset id
	if(isset($_GET['sc_runset_id'])){
		$sc_runset_id = $_GET['sc_runset_id'];
	} else {
		$sc_runset_id = null;
	}
	
	// read timestamp
	if(isset($_GET['ref_timestamp'])){
		$sc_reftimestamp = $_GET['ref_timestamp'];
	} else {
		$sc_reftimestamp = null;
	}
	
	/* definitions */
	$root_path = "/local/iihr/andre/model_3_1/".$sc_runset_id;
	$sc_ref0_file_path = $root_path."/txts_timestamp_ref0/".$sc_reference_id."/".$sc_representation_id.".txt";
	$json_folder = $root_path."/repres_displayed/".$sc_reference_id."/".$sc_representation_id."/";
	$json_format = $sc_representation_id.".json";
	
	/*********************************************** DEFS **********************************************/
	
	/**
	 * Reads a JSON file.
	 * $ref_time_arg : 
	 * $json_folder_arg : 
	 * $json_format_arg : 
	 * RETURN : Filled text if file was found, empty text ("") otherwise.
	 */
	function read_file($ref_time_arg, $json_folder_arg, $json_format_arg){
		$file_path = $json_folder_arg.$ref_time_arg.$json_format_arg;
		// echo("Will read <<".$file_path.">>");
		if(file_exists($file_path)){
			return(file_get_contents($file_path));
		} else {
			return("");
		}
	}
	
	/**
	 * Just read the ref0 file content
	 * RETURN : Integer if possible to read file. Null otherwise.
	 */
	function read_ref0_timestamp($file_path){
		if(file_exists($file_path)){
			return((int)trim(file_get_contents($file_path)));
		} else {
			return(null);
		}
	}
	
	/**
	 *
	 * $ref0_timestamp : ref0 timestamp
	 * $ref_timestamp : 
	 * $ref_time : A value starting at 0 for ref0 timestamp
	 * RETURN :
	 */
	function setup_reftime($ref0_timestamp, $ref_timestamp, $ref_time){
		if ($ref_timestamp == null){
			return($ref_time);
		} else {
			return(($ref0_timestamp - $ref_timestamp)/3600);
		}
	}
	
	/**
	 * Define the value of previous daily time available.
	 * $ref0_timestamp : 
	 * $effc_timestamp :
	 * $json_folder :
	 * $json_format :
	 * RETURN : A positive integer if a previous value is expected to be available, '-1' otherwise.
	 */
	function setup_prev_d_timestamp($ref0_timestamp, $effc_timestamp, $json_folder, $json_format){
		$poss_timestamp = $effc_timestamp - (24 * 3600);
		$poss_reftime = setup_reftime($ref0_timestamp, $poss_timestamp, null);
		$poss_file_path = $json_folder.$poss_reftime.$json_format;
		if(!file_exists($poss_file_path)){
			return(-1);
		} else {
			// echo("EXISTS: <<".$poss_file_path.">>");
			return($poss_timestamp);
		}
	}
	
	/**
	 * Define the value of previous hourly time available.
	 * $ref0_timestamp : 
	 * $effc_timestamp :
	 * $json_folder :
	 * $json_format :
	 * RETURN : A positive integer if a previous value is expected to be available, '-1' otherwise.
	 */
	function setup_prev_h_timestamp($ref0_timestamp, $effc_timestamp, $json_folder, $json_format){
		$poss_timestamp = $effc_timestamp - 3600;
		$poss_reftime = setup_reftime($ref0_timestamp, $poss_timestamp, null);
		$poss_file_path = $json_folder.$poss_reftime.$json_format;
		if(!file_exists($poss_file_path)){
			return(-1);
		} else {
			return($poss_timestamp);
		}
	}
	
	/**
	 * Define the value of next hourly time available.
	 * $ref0_timestamp : 
	 * $effc_timestamp :
	 * RETURN : A positive integer if a next value is expected to be available, '-1' otherwise.
	 */
	function setup_next_h_timestamp($ref0_timestamp, $effc_timestamp){
		if ($effc_timestamp > ($ref0_timestamp - 3600)){
			return(-1);
		} else {
			return($effc_timestamp + 3600);
		}
	}
	
	/**
	 * Define the value of next daily time available.
	 * $ref0_timestamp : 
	 * $effc_timestamp :
	 * RETURN : A positive integer if a next value is expected to be available, '-1' otherwise.
	 */
	function setup_next_d_timestamp($ref0_timestamp, $effc_timestamp){
		if ($effc_timestamp > ($ref0_timestamp - (24 * 3600))){
			return(-1);
		} else {
			return($effc_timestamp + 3600);
		}
	}
	
	/*********************************************** CALL **********************************************/
	
	$ref0_timestamp = read_ref0_timestamp($sc_ref0_file_path);
	$sc_reftime = setup_reftime($ref0_timestamp, $sc_reftimestamp, $sc_reftime);
	$effc_timestamp = $ref0_timestamp - ($sc_reftime * 3600);
	$json_content = json_decode(read_file($sc_reftime, $json_folder, $json_format));
	$json_content->timestamp = $effc_timestamp;
	$json_content->timestamp_prev_d = setup_prev_d_timestamp($ref0_timestamp, $effc_timestamp, $json_folder, $json_format);
	$json_content->timestamp_prev_d_time = setup_reftime($ref0_timestamp, $json_content->timestamp_prev_d, null);
	$json_content->timestamp_prev_h = setup_prev_h_timestamp($ref0_timestamp, $effc_timestamp, $json_folder, $json_format);
	$json_content->timestamp_next_h = setup_next_h_timestamp($ref0_timestamp, $effc_timestamp);
	$json_content->timestamp_next_d = setup_next_d_timestamp($ref0_timestamp, $effc_timestamp);
	echo(json_encode($json_content));
?>