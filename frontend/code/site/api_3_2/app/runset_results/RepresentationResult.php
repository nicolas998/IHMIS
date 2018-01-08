<?php

  namespace Results;
  
  use Results\MetaFile as MetaFile;
  
  class RepresentationResult extends MetaFile{

    const ROOT_ATTR = "sc_representation";              // must-have
    const SUB_META_FOLDER_NAME = "sc_representations";  // must-have
    
    // //////////////////// INTERFACE //////////////////// //
    
    /**
     * List all models from Runset
     */
    public static function all($runset_id){
      // basic check
      if(!isset(MetaFile::$app)) return(array("Error" => "No app set."));
      
      $return_array = Array();
      
      $folder_path = MetaFile::get_folder_path($runset_id, static::SUB_META_FOLDER_NAME);
      $all_files = scandir($folder_path);

      foreach($all_files as $cur_file){
        if(($cur_file == ".") || ($cur_file == "..")){ continue; }
        try{
          $cur_eval_id = basename($cur_file, ModelResult::SUB_FILE_EXT);
          $cur_obj = static::withId($cur_eval_id, $runset_id);
          array_push($return_array, $cur_obj);
        } catch (Exception $e) {
          
        }
      }
      return($return_array);
    }
    
    /**
     * Create an object from the root folder path
     */
    public static function withId($evaluation_id, $runset_id){
      // define file path
      $folder_path = MetaFile::get_folder_path($runset_id, static::SUB_META_FOLDER_NAME);
      $file_name = $evaluation_id . MetaFile::FILE_EXT;
      $file_path = $folder_path.$file_name;
      
      // read file content
      $return_obj = static::from_file($file_path);
      return($return_obj);
    }
	
  }

?>