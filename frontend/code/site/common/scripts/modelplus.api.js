// TODO - learn headers for globals...

/* DEPENDS ON:
 *  ajax
 *  modelplus.url
 */

/**
 * The ModelPlus variables and functions are being moved to this namespace to avoid clutering the global namespace.
 * All functions return the Promise generated by JQuery AJAX getJSON/post calls.
 * @namespace
 */
var modelplus = modelplus || {};

(function () {
  "use strict";
  
  var api_url = modelplus.url.proxy + modelplus.url.api;
  
  modelplus.api = modelplus.api || {};
  
  // 
  // forcing_id : 
  // timestamp_ini : 
  // timestamp_end : 
  modelplus.api.get_forcing_options = function(forcing_id, timestamp_ini, timestamp_end){
    var ws_url;
    ws_url = api_url + "forcing_sources";
    ws_url += "%i%from_type=" + forcing_id;
	ws_url += "%e%timestamp_ini=" + timestamp_ini;
	ws_url += "%e%timestamp_end=" + timestamp_end;
	return ($.getJSON(ws_url));
  }
  
  //
  // hlm_id : expected values such as 190, 254, ...
  modelplus.api.get_forcing_types_for_hlm = function(hlm_id){
    var ws_url;
    ws_url = api_url + 'forcing_types%i%from_hlmodel='+hlm_id;
    return ($.getJSON(ws_url));
  }
  
  //
  // hlm_id : expected values such as 190, 254, ...
  modelplus.api.get_global_parameters_for_models = function(hlm_id){
    var ws_url;
	ws_url = 'hl_models_global_parameters%i%from_hlmodel='+hlm_id;
	return ($.getJSON(ws_url));
  }
  
  // 
  modelplus.api.get_hlm_options = function(timestamp_ini, timestamp_end){
    var ws_url;
    ws_url = api_url +'hl_models';
	ws_url += '%i%timestamp_ini=' + timestamp_ini;
	ws_url += '%e%timestamp_end=' + timestamp_end;
    return ($.getJSON(ws_url));
  }
  
  // 
  // hlm_id : expected values such as 190, 254, ...
  // references_ids : array of reference ids
  modelplus.api.get_evaluations_for_hlm = function(hlm_id, references_ids){
    var ws_url;
    ws_url = api_url + 'sc_evaluations%i%for_hlmodel=' + hlm_id;
	ws_url += '%e%from_references=' + (references_ids.join(","));
	return ($.getJSON(ws_url + ws_url));
  }
  
  // Retrieves all representations that can be obtained from an hlm model
  // hlm_id : expected values such as 190, 254, ...
  modelplus.api.get_representations_for_hlm = function(hlm_id){
    var ws_url;
	ws_url = api_url + "sc_representations";
    ws_url += '%i%from_hlmodel=' + hlm_id;
	return ($.getJSON(ws_url));
  }
  
  // Get all possible combined representations
  // repres_acronym : expected array of Strings
  modelplus.api.get_representations_from_combining = function(repres_acronym){
    var ws_url;
	ws_url = api_url + "sc_representations%i%from_combining=";
	ws_url += repres_acronym.join(",");
	return($.getJSON(ws_url));
  }
  
  // Retrieves all common representations for two hlm models
  // hlm_id_1 : expected values such as 190, 254, ...
  // hlm_id_2 : expected values such as 190, 254, ...
  modelplus.api.get_common_representations_for_hlms = function(hlm_id_1, hlm_id_2){
    var ws_url;
	ws_url = api_url + "sc_representations";
    ws_url += '%i%from_hlmodel=' + hlm_id_1;
	ws_url += '%e%from_hlmodel_compareto=' + hlm_id_2;
	return ($.getJSON(ws_url));
  }
  
  // Retrieves basic information from available Runset Results
  modelplus.api.get_runset_results = function(){
    var ws_url;
	ws_url = api_url + "sc_runset_results";
	return ($.getJSON(ws_url));
  }
  
  // Retrieves information from a specific Runset Result
  modelplus.api.get_runset_result = function(runset_id){
    var ws_url;
    ws_url = api_url + "sc_runset_results%i%id=" + runset_id;
    return ($.getJSON(ws_url));
  }
  
  // Retrieves information from all Runset Result concurrently to another
  modelplus.api.get_concurrently_runset_results = function(runset_id){
    var ws_url;
	ws_url = api_url + "sc_runset_results%i%concurrently_id=" + runset_id;
    return ($.getJSON(ws_url));
  }
  
  // Tries to reserve a runset id
  modelplus.api.reserve_runset_id = function(runset_id){
    var post_url;
    post_url = api_url + "sc_runset_results";
    return($.post(post_url, {"runset_id": runset_id}));
  }
  
  // Retrieves a Runset id that can be used for new Runsets
  modelplus.api.get_auto_runset_id = function(){
	var get_url;
	get_url = api_url + "sc_runsets";
	get_url += "%i%do=get_new_runset_id";
	
    return(
	  $.get(get_url)
	    .then(function(data){
          const PREFIX = "rset";
          var parsed_data, max_num_str, max_num_int, max_num_cnt;
          parsed_data = JSON.parse(data);
		  parsed_data = parsed_data["runset_id"];
		  max_num_str = parsed_data.replace(PREFIX, "");
		  max_num_cnt = max_num_str.length;
		  max_num_int = parseInt(max_num_str) + 1;
		  max_num_str = max_num_int.toString();
		  while(max_num_str.length < max_num_cnt){
            max_num_str = "0" + max_num_str;
          }
          return (PREFIX + max_num_str);
        }));
  }
  
  // Submit a request for new runset
  // post_dictionary : expects dictionary with 'runset_name', 'timestamp_ini', 'reference_ids', ... keys
  modelplus.api.request_new_runset = function(post_dictionary){
    var ws_url;
	ws_url = api_url + "sc_runset_requests/new";
	return ($.post(ws_url, post_dictionary));
  }
  
  // Submit a request for a runset merge
  modelplus.api.request_new_runset_merge = function(post_dictionary){
    var ws_url;
	ws_url = api_url + "sc_runset_merge_requests/new";
	return ($.post(ws_url, post_dictionary));
  }
  
  // 
  modelplus.api.get_runset_merge_in_waiting_room = function(){
    var ws_url;
	ws_url = api_url + "sc_runset_merge_requests";
	ws_url += "%i%from=waitingroom"
	return($.getJSON(ws_url));
  }
  
  //
  // runset_id : String.
  // model_ids : Array of Strings.
  modelplus.api.delete_model_from_runset_result = function(runset_id, model_id){
    var ws_url;
	ws_url = api_url + "sc_runset_model_results";
	ws_url += "/" + runset_id;
	ws_url += "/" + model_id;
	return($.delete(ws_url));
  }

})();

/**
 * Extra helpful functions
 */
(function () {
  "use strict";
  $.delete = function(url, data){
	
	/*
    return $.ajax({
		contentType: "application/x-www-form-urlencoded; charset=utf-8",
		url: url,
		type: 'POST',
		data: {_method: "delete"}
    });
	*/
	var xhr = new XMLHttpRequest();
	xhr.open("DELETE", url, true);
	xhr.onload = function () {
		var users = xhr.responseText;
		if (xhr.readyState == 4 && xhr.status == "200") {
			console.table(users);
		} else {
			console.error(users);
		}
	}
	xhr.send(null);
  }
})();