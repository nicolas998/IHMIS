/**
 * Set of functions for loading stuffs.
 * Some functions depend on the following global variables:
 * - GLB_...
 */
 
/**
 * Acronyms:
 * - sbox: select box
 */
 
/******************************************************* FUNCS *******************************************************/

/**
 * GENERAL FUNCTION
 * boolean_array - 
 * RETURN - Number of 'True' values in given array
 */
function count_true(boolean_array){
	var count_t = 0;
	for(var i=0; i < boolean_array.length; i++){
		if (boolean_array[i]) {count_t = count_t + 1;}
	}
	return(count_t);
}

/**
 * GENERAL FUNCTION
 * boolean_array -
 * RETURN -
 */
function index_true(boolean_array){
	for(var i=0; i < boolean_array.length; i++){
		if (boolean_array[i]) {return(i);}
	}
	return(-1);
}

/**
 * Everything that should occur when the user selects another runset.
 * RETURN - Null. Changes are performed in interface.
 */
function onchange_runset_main_sbox(){
	var main_runset_id, div_main_obj;
	
	main_runset_id = $('#'+modelplus.ids.MENU_RUNSET_SBOX).val();
	
	if(main_runset_id == ''){
		$("#" + modelplus.ids.MENU_RUNSET_ABOUT).hide();
		$("#" + modelplus.ids.MENU_MODEL_ABOUT).hide();
		div_main_obj = $("#" + modelplus.ids.MENU_MAIN_ALERT_DIV);
		div_main_obj.append(modelplus.labels.SELECT_MODEL);
		div_main_obj.show();
	} else {
		// $("#" + modelplus.ids.MENU_RUNSET_ABOUT).show();
		$("#" + modelplus.ids.MENU_RUNSET_ABOUT).hide();
	}
	
	// close dialogues possible (if open)
	modelplus.main.hide_message_block();
	close_model_hidrograph_desc();
	
	// hide current loaded map
	if ($("#np" + GLB_map_type).hasClass("npact")){
		reclick_id = "#np" + GLB_map_type;
		$("#np" + GLB_map_type).click();
		console.log("Done...1");
	} else {
		console.log("Done...2");
	}
	
	// load all models related to selected runset
	the_url = GLB_webservices.prototype.metainfo_load_runset + main_runset_id;
	
	$.ajax({
		url: the_url,
		runset_id: main_runset_id
	}).success(function(data) {
		var div_main_obj;
		
		// parse JSON content
		try{
			parsed_json = JSON.parse(data);
		} catch(err) {
			alert("Unable to parse '"+ data +"'. Error: " + err);
			return;
		}
		
		// set up variables
		GLB_vars.prototype.sc_runset = parsed_json.sc_runset;
		GLB_vars.prototype.sc_models = parsed_json.sc_model;
		GLB_vars.prototype.sc_model_combinations = parsed_json.sc_model_combination;
		GLB_vars.prototype.sc_references = parsed_json.sc_reference;
		GLB_vars.prototype.sc_representation = parsed_json.sc_representation;
		GLB_vars.prototype.sc_evaluation = parsed_json.sc_evaluation;
		GLB_vars.prototype.comparison_matrix = parsed_json.comp_mtx;
		if ((typeof func_to_run !== 'undefined') && (func_to_run != null)){
			func_to_run();
		}
		GLB_vars.prototype.webmenu = parsed_json.web_menu;
		
		// set up functions
		GLB_vars.prototype.get_runset_ini = function(){
			if (GLB_vars.prototype.sc_runset.timestamp_ini !== undefined){
				return(parseInt(GLB_vars.prototype.sc_runset.timestamp_ini));
			} else {
				return(null);
			}
		}
		GLB_vars.prototype.get_runset_end = function(){
			if (GLB_vars.prototype.sc_runset.timestamp_end !== undefined){
				return(parseInt(GLB_vars.prototype.sc_runset.timestamp_end));
			} else {
				return(null);
			}
		}
		GLB_vars.prototype.get_runset_timediff = function(){
			var timestamp_ini, timestamp_end;
			timestamp_ini = GLB_vars.prototype.get_runset_ini();
			timestamp_end = GLB_vars.prototype.get_runset_end();
			if((timestamp_ini != null) && (timestamp_end != null)){
				return(timestamp_end - timestamp_ini);
			} else {
				return(null);
			}
		}
		
		// basic check
		if (Object.keys(GLB_vars.prototype.webmenu).length == 0){
			if ($('#'+modelplus.ids.MENU_RUNSET_SBOX).val() !== ""){
				alert("Missing meta files for menu.");
			}
		}
		
		populate_model_main_sbox();
		
		//
		if (this.runset_id == ''){
			div_main_obj = $("#" + modelplus.ids.MENU_MAIN_ALERT_DIV);
			div_main_obj.append(modelplus.labels.SELECT_RUNSET);
			div_main_obj.show();
		}
	})
}

/**
 * Everything that should occur when the user selects another main model.
 * RETURN - Null. Changes are performed in interface.
 */
function onchange_model_main_sbox(){
	var the_url;
	var main_model_id;
	var cur_splitted_comparison_id, cur_txt, cur_obj;
	var reclick_id, added_comp_models;
	
	main_model_id = $('#'+modelplus.ids.MENU_MODEL_MAIN_SBOX).val();
	runset_id = $('#'+modelplus.ids.MENU_RUNSET_SBOX).val();
	
	reclick_id = null;
	
	// close dialogues possible (if open)
	modelplus.main.hide_message_block();
	close_model_hidrograph_desc();
	
	// hide current loaded map
	if ($("#np" + GLB_map_type).hasClass("npact")){
		reclick_id = "#np" + GLB_map_type;
		$("#np" + GLB_map_type).click();
	}
	
	// load all single representations, comparison representations and evaluations of a model
	the_url = GLB_webservices.prototype.get_metainfo_load_model(runset_id, main_model_id);
	
	$.ajax({
		url: the_url,
		runset_id: runset_id
	}).success(function(data) {
		var cur_html, cur_select_id, cur_select_obj, cur_select_html, cur_a_id, cur_a_obj;
		var cur_parameter_id, cur_parameter_name, cur_par_index;
		var cur_menu_item, cur_menu_repr, cur_repr_array;
		var div_main_obj, div_obj, div_comp_obj, div_eval_obj;
		var sc_model_obj;
		var count_added;
		
		// alert(data);
		sc_model_obj = JSON.parse(data);
		
		// get and clean div containers
		div_main_obj = $("#"+modelplus.ids.MENU_MAIN_ALERT_DIV);
		div_main_obj.empty();
		div_main_obj.hide();
		
		div_obj = $("#"+modelplus.ids.MENU_MODEL_MAIN_SELEC_DIV);
		div_obj.empty();
		div_comp_obj = $("#"+modelplus.ids.MENU_MODEL_COMP_SELEC_DIV);
		div_comp_obj.empty();
		div_eval_obj = $("#"+modelplus.ids.MENU_MODEL_EVAL_SELEC_DIV);
		div_eval_obj.empty();
		div_comb_obj = $("#"+modelplus.ids.MENU_MODEL_COMB_PARAM_DIV);
		div_comb_obj.empty();
		div_hydr_obj = $("#"+modelplus.ids.MENU_MODEL_HYDR_PARAM_DIV);
		div_hydr_obj.empty();
		
		// basic check
		if ((typeof(sc_model_obj) !== 'undefined') && (
			(sc_model_obj.sc_representation != undefined) || (sc_model_obj.sc_evaluation != undefined) ||
			(sc_model_obj.sc_represcomb != undefined))){
			
			$("#" + modelplus.ids.MENU_MODEL_ABOUT).show();
					
			// build single model sub menu
			count_added = 0;
			// iterate over each 'single_model' element of 'web_menu' object
			for(var i = 0; i < GLB_vars.prototype.webmenu.single_model.length; i++){
					
				cur_menu_item = GLB_vars.prototype.webmenu.single_model[i];
				if(cur_menu_item.representation != undefined){
					// alert("Will try to show single '" + cur_menu_item["id"] + "'.");
				} else if(cur_menu_item.representations != undefined){
					// alert("Will try to show select '" + cur_menu_item["id"] + "'.");
					cur_repr_array = new Array();
					for(var j = 0; j < cur_menu_item.representations.length; j++){
						cur_menu_repr = cur_menu_item.representations[j];
						// see if current sc_menu element (var cur_menu_repr) is in the models meta file description (var sc_model_obj)
						if((typeof(sc_model_obj.sc_representation) !== 'undefined') && 
								(sc_model_obj.sc_representation.indexOf(cur_menu_repr) != -1)){
							cur_repr_array.push(cur_menu_repr);
						}
					}
					if (cur_repr_array.length <= 0){
						// alert("ignoring " + cur_menu_item["id"]);
					} else if (cur_repr_array.lenght == 1){
						// alert("radio for " + cur_menu_item["id"]);
					} else {
						// alert("select for " + cur_menu_item["id"] + " ("+cur_repr_array.lenght+", "+cur_repr_array+")");
							
						cur_html = '<div style="display:inline-block; width:100%">';
							
						// build link
						cur_a_id = 'np'+cur_menu_item["id"];
						cur_html += '<a href="#" id="'+cur_a_id+'" class="tabrain" style="width:90px">';
						cur_html += cur_menu_item["call_select"];
						cur_html += '</a >';
							
						// build select box
							
						cur_select_id = 'np'+cur_menu_item["id"]+'_sel';
						cur_html += "<select class='sbox' id='"+cur_select_id+"' onchange='onchange_representation_select_option(\""+cur_a_id+"\")'>";
						for(var j=0; j < cur_repr_array.length; j++){
							cur_html += "<option value='"+cur_repr_array[j]+"'>";
							cur_html += GLB_vars.prototype.get_representation_call_select(cur_repr_array[j]);
							cur_html += "</option>";
						}
						cur_html += "</select>";
						
						cur_html += '<img src="' + GLB_urls.prototype.base_image_folder + 'question_mark3.png" class="qicon" onclick="load_parameter_about(' + cur_menu_item["id"] + ', $(this))" />';
							
						// cur_html += '<input type="hidden" id="npmono'+i+'_sel" value="'+cur_parameter_id+'" />';
						cur_html += '</div>';
						
						div_obj.append(cur_html);
						count_added++;
					}
				} else {
					alert("Unable to determine '" + cur_menu_item["id"] + "'.");
				}
			}
			// add no-available message
			if(count_added == 0){
				div_obj.append(modelplus.labels.NO_REPRESENTATION + "!");
				$("#" + modelplus.ids.MENU_MODEL_MAIN_RADIO_DIV).hide();
				div_obj.hide();
			} else {
				$("#" + modelplus.ids.MENU_MODEL_MAIN_RADIO_DIV).show();
				if($("#" + 'np' + GLB_opt_ids.prototype.mono_group).hasClass("npact")){
					div_obj.show();
				} else {
					div_obj.hide();
				}
			}
			
			// build comparison sub menu
			// TODO - count it properly
			if(count_added == 0){
				$("#" + modelplus.ids.MENU_MODEL_COMP_RADIO_DIV).hide();
				div_comp_obj.hide();
			} else {
				$("#" + modelplus.ids.MENU_MODEL_COMP_RADIO_DIV).show();
				if($("#" + 'np' + GLB_opt_ids.prototype.comp_group).hasClass("npact")){
					div_comp_obj.show();
				} else {
					div_comp_obj.hide();
				}
			}
			
			// build evaluation sub menu
			count_added = 0;
			// alert("Evaluations: " + GLB_vars.prototype.webmenu.evaluation.length);
			for(var i = 0; i < GLB_vars.prototype.webmenu.evaluation.length; i++){
				//alert("XY " + GLB_vars.prototype.webmenu.evaluation[i]);
				cur_menu_item = GLB_vars.prototype.webmenu.evaluation[i];
				if((cur_menu_item.evaluation != undefined) && (typeof(sc_model_obj.sc_evaluation) !== 'undefined')){
					var cur_raw_eval_id;
					for(var j=0; j < sc_model_obj.sc_evaluation.length; j++){
						
						// separates evaluation_id from reference
						cur_raw_eval_id = sc_model_obj.sc_evaluation[j].split("_")[0];
						cur_eval_ref = sc_model_obj.sc_evaluation[j].split("_")[1];
						
						if (cur_raw_eval_id == cur_menu_item.evaluation){
							// alert(cur_raw_eval_id + " == " + cur_menu_item.evaluation);
							
							// search evaluation raw (without related reference)
							cur_html = '<div style="display:inline-block; width:100%">';
							
							// define reference acronym
							cur_reference_json = get_json_reference(cur_eval_ref);
							if (typeof(cur_reference_json["title_acronym"]) !== 'undefined'){
								cur_ref_title = cur_reference_json["title_acronym"];
							} else {
								cur_ref_title = cur_reference_json["title"];
							}
								
							// build link
							cur_a_id = 'np'+cur_menu_item.id + "_" + cur_eval_ref;
							cur_html += '<a href="#" id="'+cur_a_id+'" class="tabrain" style="width:220px">';
							cur_html += cur_menu_item.call_radio + " (" + cur_ref_title + ")";
							cur_html += '</a >';
							cur_html += '<img src="' + GLB_urls.prototype.base_image_folder + 'question_mark3.png" class="qicon" onclick="load_parameter_about(\'' + cur_menu_item.id + '\', $(this))" />';
							cur_html += '</div>';
							
							div_eval_obj.append(cur_html);
							count_added++;
						} else {
							// alert(cur_raw_eval_id + " != " + cur_menu_item.evaluation + " (" + sc_model_obj.sc_evaluation[j] + ")");
						}
					}

				} else if(cur_menu_item.evaluations != undefined){
					// alert("Will try to show multiple for " + cur_menu_item.id);
				} else {
					// alert("Hey");
				}
				 
			}
			// add no-available message
			if(count_added == 0){
				div_eval_obj.append(modelplus.labels.NO_EVALUATIONS);
				$("#" + modelplus.ids.MENU_MODEL_EVAL_RADIO_DIV).hide();
				div_eval_obj.hide();
			} else {
				$("#" + modelplus.ids.MENU_MODEL_EVAL_RADIO_DIV).show();
				if($("#" + 'np' + GLB_opt_ids.prototype.eval_group).hasClass("npact")){
					div_eval_obj.show();
				} else {
					div_eval_obj.hide();
				}
			}
			
			// building hydrograph menu
			if (GLB_vars.prototype.webmenu.hydrograph !== undefined){
				num_radios_added = 0;
				
				for(var i = 0; i < GLB_vars.prototype.webmenu.hydrograph.length; i++){
					
					// build guiding dictionary
					var all_hydrog_options = {};
					cur_menu_item = GLB_vars.prototype.webmenu.hydrograph[i];
					if(cur_menu_item.evaluation != undefined){
						if (typeof(sc_model_obj.sc_evaluation_mdl) !== 'undefined'){
							var eval_options = {};
							for (var i = 0; i < sc_model_obj.sc_evaluation_mdl.length; i++) {
								var the_splitted = sc_model_obj.sc_evaluation_mdl[i].split("_");
								
								// check if it is it
								if(the_splitted[0] != cur_menu_item.evaluation){ continue; }
								console.log("Looking for '"+the_splitted[0]+"' in: " + JSON.stringify(cur_menu_item.evaluation));
								
								// add to dictionary
								if(!(the_splitted[0] in all_hydrog_options)){
									all_hydrog_options[the_splitted[0]] = []; 
								}
								// alert("Pushing "+ the_splitted[1] + "_" + the_splitted[2] +" to " + all_hydrog_options[the_splitted[0]]);
								all_hydrog_options[the_splitted[0]].push(the_splitted[1] + "_" + the_splitted[2]);
							}
						} else {
							
						}
					} else {
						console.log("cur_menu_item["+i+"] has: " + JSON.stringify(cur_menu_item));
					}
				
					// basic check - at least one found
					if (all_hydrog_options.length == 0){
						continue;
					}
				
					for (var cur_eval_id in all_hydrog_options) {
						
						// build link
						cur_a_id = 'np'+cur_menu_item.id;
						cur_html = '<a href="#" id="'+cur_a_id+'" class="tabrain" style="width:105px; margin-right:0px;">';
						cur_html += cur_menu_item.call_modref_radio;
						cur_html += '</a >';
						
						// build select box
						cur_select_id = cur_a_id + "_sel";
						cur_html += "<select class='sbox' id='"+cur_select_id+"' onchange='onchange_representation_select_option(\""+cur_a_id+"\")' style='margin-left:0px; margin-right:0px;'>";
						for(var j=0; j < all_hydrog_options[cur_eval_id].length; j++) {
							cur_splitted = all_hydrog_options[cur_eval_id][j].split("_");
							cur_ref_json_obj = get_json_reference(cur_splitted[0]);
							cur_mdl_json_obj = get_json_model(cur_splitted[1]);
							cur_ref_acronym = cur_ref_json_obj["title_acronym"];
							cur_mdl_acronym = cur_mdl_json_obj["title_acronym"];
							
							cur_html += '<option value="'+all_hydrog_options[cur_eval_id][j]+'">';
							cur_html += cur_mdl_acronym + "/" + cur_ref_acronym;
							cur_html += '</option>';
						}
						cur_html += '</select>';
						
						// build link
						cur_html += '<img src="' + GLB_urls.prototype.base_image_folder + 'question_mark3.png" class="qicon" onclick="load_parameter_about(\'' + cur_menu_item.id + '\', $(this))" />';
						cur_html += '</div>';
						
						// add to HTML
						div_hydr_obj.append(cur_html);
						num_radios_added += 1;
					}
				}
				
				// 
				if(num_radios_added == 0){
					$("#" + modelplus.ids.MENU_MODEL_HYDR_RADIO_DIV).hide();
					$("#" + modelplus.ids.MENU_MODEL_HYDR_PARAM_DIV).hide();				
				} else {
					$("#" + modelplus.ids.MENU_MODEL_HYDR_RADIO_DIV).show();
					if($("#" + 'np' + GLB_opt_ids.prototype.hydr_group).hasClass("npact")){
						$("#" + modelplus.ids.MENU_MODEL_HYDR_PARAM_DIV).hide();
					} else {
						$("#" + modelplus.ids.MENU_MODEL_HYDR_PARAM_DIV).hide();
					}
				}
			} else {
				console.log("GLB_vars.prototype.webmenu.hydrograph is undefined.");
			}
			
			// build combination menu if possible
			var count_reprcomb;
			count_reprcomb = 0;
			
			if ((GLB_vars.prototype.webmenu.combination != undefined) && (sc_model_obj.sc_represcomb != undefined)){
				for(var i = 0; i < GLB_vars.prototype.webmenu.combination.length; i++){
					cur_menu_item = GLB_vars.prototype.webmenu.combination[i];
					if(cur_menu_item.reprcomb != undefined){
						var menu_reprcomb_id = cur_menu_item.reprcomb;
						for(var cur_represcomb in sc_model_obj.sc_represcomb){
							// alert("Comparing '" + menu_reprcomb_id + "' with '" + cur_represcomb + "'.");
							if (menu_reprcomb_id == cur_represcomb){
								
								// search evaluation raw (without related reference)
								cur_html = '<div style="display:inline-block; width:100%">';
									
								// build link
								cur_a_id = 'np'+cur_menu_item.id;
								cur_html += '<a href="#" id="'+cur_a_id+'" class="tabrain" style="width:220px">';
								cur_html += cur_menu_item.call_radio;
								cur_html += '</a >';
								cur_html += '<img src="' + GLB_urls.prototype.base_image_folder + 'question_mark3.png" class="qicon" onclick="load_parameter_about(\'' + cur_menu_item.id + '\', $(this))" />';
								cur_html += '</div>';
								
								// add to menu and count
								div_comb_obj.append(cur_html);
								count_reprcomb = count_reprcomb + 1;
							}
						}
					} else {
						console.log("No 'reprcomb' in " + JSON.stringify(cur_menu_item));
					}
				}
				
				// show hide
				if (count_reprcomb > 0){
					$("#" + modelplus.ids.MENU_MODEL_COMB_RADIO_DIV).show();
				} else {
					$("#" + modelplus.ids.MENU_MODEL_COMB_RADIO_DIV).hide();
				}
			} else {
				$("#" + modelplus.ids.MENU_MODEL_COMB_RADIO_DIV).hide();
			}
			div_comb_obj.hide();
			
			// 
			if(reclick_id != null){
				$(reclick_id).click();
			}
			
			$("#" + modelplus.ids.MENU_MODEL_ABOUT).show();
			
		} else if (sc_model_obj.ERROR !== 'undefined') {
		
			if (this.runset_id == ''){
				div_main_obj.append(modelplus.labels.SELECT_RUNSET);
			} else {
				$("#" + modelplus.ids.MENU_MODEL_ABOUT).hide();
				div_main_obj.append(modelplus.labels.SELECT_MODEL);
			}
			div_main_obj.show();
			
			$("#" + modelplus.ids.MENU_MODEL_MAIN_RADIO_DIV).hide();
			div_obj.hide();
			$("#" + modelplus.ids.MENU_MODEL_COMP_RADIO_DIV).hide();
			div_comp_obj.hide();
			$("#" + modelplus.ids.MENU_MODEL_EVAL_RADIO_DIV).hide();
			div_eval_obj.hide();
			$("#" + modelplus.ids.MENU_MODEL_COMB_RADIO_DIV).hide();
			div_comb_obj.hide();
			$("#" + modelplus.ids.MENU_MODEL_HYDR_RADIO_DIV).hide();
			$("#" + modelplus.ids.MENU_MODEL_HYDR_PARAM_DIV).hide();
			
		} else {
			
			div_main_obj.hide();
			
			$("#" + modelplus.ids.MENU_MODEL_MAIN_RADIO_DIV).hide();
			div_obj.hide();
			$("#" + modelplus.ids.MENU_MODEL_COMP_RADIO_DIV).hide();
			div_comp_obj.hide();
			$("#" + modelplus.ids.MENU_MODEL_EVAL_RADIO_DIV).hide();
			div_eval_obj.hide();
			$("#" + modelplus.ids.MENU_MODEL_COMB_RADIO_DIV).hide();
			div_comb_obj.hide();
			$("#" + modelplus.ids.MENU_MODEL_HYDR_RADIO_DIV).hide();
			$("#" + modelplus.ids.MENU_MODEL_HYDR_PARAM_DIV).hide();
			
			console.log("Hiding 'about model' button.");
			$("#" + modelplus.ids.MENU_MODEL_ABOUT).hide();
		}
	})
	
	cur_obj = $('#'+modelplus.ids.MENU_MODEL_COMP_SBOX);
	
	// clean comparison model select box and add 'empty' model
	cur_obj.find('option').remove().end();
	cur_txt = '<option value="" selected>Select...</option>';
	cur_obj.append(cur_txt);
	
	// list all comparisons of this model and updates comparison model select box
	added_comp_models = 0;
	for (var i = 0; i < GLB_vars.prototype.comparison_matrix.length; i++){
		cur_splitted_comparison_id = GLB_vars.prototype.comparison_matrix[i].id.split("_");
		
		if (cur_splitted_comparison_id.length != 2){ continue; }  // base check
		
		if (cur_splitted_comparison_id[0] == main_model_id){
			cur_txt = '<option value="'+cur_splitted_comparison_id[1]+'">' + 
						GLB_vars.prototype.get_model_name(cur_splitted_comparison_id[1]) + 
					'</option>';
			cur_obj.append(cur_txt);
			added_comp_models = added_comp_models + 1;
		}
	}
	
	// if no comparison was added, hide such options
	if(added_comp_models == 0){
		$("#" + modelplus.ids.MENU_MODEL_MAIN_RADIO_DIV).hide();
		$("#" + modelplus.ids.MENU_MODEL_COMPMST_SELEC_DIV).hide();
	} else {
		$("#" + modelplus.ids.MENU_MODEL_MAIN_RADIO_DIV).show();
		if($("#" + 'np' + GLB_opt_ids.prototype.comp_group).hasClass("npact")){
			$("#" + modelplus.ids.MENU_MODEL_COMPMST_SELEC_DIV).show();
		} else {
			$("#" + modelplus.ids.MENU_MODEL_COMPMST_SELEC_DIV).hide();
		}
	}
	
	// define function to be run on change of comparison select box
	$('#'+modelplus.ids.MENU_MODEL_COMP_SBOX).change();
	
	// show or hide realtime tools
	var usgs_map_id, usgs_map_div_obj;
	usgs_map_id = "div"+opt_tool_us_map;
	usgs_map_div_obj = $("#"+usgs_map_id);
	if ((runset_id == "")||(runset_id == "realtime")){
		usgs_map_div_obj.show();
	} else {
		usgs_map_div_obj.hide();
	}
}

/**
 * Function to be executed when comparison select box is changed.
 * RETURN - null. Changes are performed in interface.
 */
function onchange_model_comp_sbox(){
	var main_model_id, comp_model_id;
	var div_obj, all_params_id, cur_html;
	var cur_par_index;
	var count_added;
	
	// getting html objects references
	main_model_id = $('#'+modelplus.ids.MENU_MODEL_MAIN_SBOX).val();
	comp_model_id = $('#'+modelplus.ids.MENU_MODEL_COMP_SBOX).val();
	div_obj = $('#'+modelplus.ids.MENU_MODEL_COMP_SELEC_DIV);
	
	// close dialogues possible (if open)
	modelplus.main.hide_message_block();
	close_model_hidrograph_desc();
	
	// clean div content and abort if necessary
	div_obj.empty();
	if (comp_model_id == ''){return;}
	
	// fill it with parameters of comparison matrix
	all_representations_id = GLB_vars.prototype.get_comparison_parameters_id(main_model_id, comp_model_id);
	
	// iterate over each 'single_model' element of 'web_menu' object
	count_added = 0;
	for(var i = 0; i < GLB_vars.prototype.webmenu.comparison_model.length; i++){
					
		cur_menu_item = GLB_vars.prototype.webmenu.comparison_model[i];
		// alert("Comparison mdl: " + cur_menu_item);
		
		if(cur_menu_item.representation != undefined){
			// alert("Will try to show single '" + cur_menu_item["id"] + "'.");
		} else if(cur_menu_item.representations != undefined){
			// alert("Will try to show select '" + cur_menu_item["id"] + "'.");
			cur_repr_array = new Array();
			for(var j = 0; j < cur_menu_item.representations.length; j++){
				cur_menu_repr = cur_menu_item.representations[j];
				// see if current sc_menu element (var cur_menu_repr) is in the models meta file description (var sc_model_obj)
				if(all_representations_id.indexOf(cur_menu_repr) != -1){
					cur_repr_array.push(cur_menu_repr);
				}
			}
			
			// if there is something to be presented in that select box, present it
			if (cur_repr_array.length <= 0){
				// alert("ignoring " + cur_menu_item["id"]);
			} else if (cur_repr_array.lenght == 1){
				// alert("radio for " + cur_menu_item["id"]);
			} else {
				// alert("select for " + cur_menu_item["id"] + " ("+cur_repr_array.lenght+", "+cur_repr_array+")");
							
				cur_html = '<div style="display:inline-block; width:100%">';
						
				// build link
				cur_a_id = 'np'+cur_menu_item["id"];
				cur_html += '<a href="#" id="'+cur_a_id+'" class="tabrain" style="width:90px">';
				cur_html += cur_menu_item["call_select"];
				cur_html += '</a >';
							
				// build select box
							
				cur_select_id = 'np'+cur_menu_item["id"]+'_sel';
				cur_html += "<select class='sbox' id='"+cur_select_id+"' onchange='onchange_representation_select_option(\""+cur_a_id+"\")'>";
				for(var j=0; j < cur_repr_array.length; j++){
					cur_html += "<option value='"+cur_repr_array[j]+"'>";
					cur_html += GLB_vars.prototype.get_representation_call_select(cur_repr_array[j]);
					cur_html += "</option>";
				}
				cur_html += "</select>";
						
				cur_html += '<img src="' + GLB_urls.prototype.base_image_folder + 'question_mark3.png" class="qicon" onclick="load_parameter_about(' + cur_menu_item["id"] + ', $(this))" />';
							
				// cur_html += '<input type="hidden" id="npmono'+i+'_sel" value="'+cur_parameter_id+'" />';
				cur_html += '</div>';
						
				div_obj.append(cur_html);
				count_added++;
			}
		} else {
			alert("Unable to determine '" + cur_menu_item["id"] + "'.");
		}		
	
	}
	
	// add no-available message
	if(count_added == 0){
		div_obj.append(modelplus.labels.NO_REPRESENTATION + "|");
	} else {
		div_obj.show();
	}
	
	// debug
	/*
	alert("There are " + all_params_id.length + " comparisons.");
	for(var i=0; i < all_params_id.length; i++){
		alert("Comp. parameter: " + all_params_id[i] + ".");
	}
	*/

	/*
	GLB_menugroup_ids.prototype.clean_flags(GLB_menugroup_ids.prototype.varscomp_flags);
	for(var i = 0; i < all_params_id.length; i++){
		GLB_menugroup_ids.prototype.set_flag(all_params_id[i],
											 GLB_menugroup_ids.prototype.varscomp_flags,
											 GLB_menugroup_ids.prototype.vars_map);
	}
	
	for(var i=0; i < GLB_menugroup_ids.prototype.varscomp_flags.length; i++){
		if (count_true(GLB_menugroup_ids.prototype.varscomp_flags[i]) > 1){
			cur_html = '<div style="display:inline-block; width:100%">';
			cur_html += '<a href="#" id="npcomp'+i+'" class="tabrain" style="width:120px">'+GLB_menugroup_ids.prototype.vars_label[i]+'</a>';
			cur_html += "<select class='sbox'>";
			for(var j=0; j < GLB_menugroup_ids.prototype.varscomp_flags[i].length; j++){
				if (GLB_menugroup_ids.prototype.varscomp_flags[i][j]){
					cur_html = cur_html + "<option>"+GLB_menugroup_ids.prototype.vars_map[i][j]+"</option>";
				}
			}
			cur_html = cur_html + "</select></div>";
			div_obj.html(div_obj.html() + cur_html);
		} else if (count_true(GLB_menugroup_ids.prototype.varscomp_flags[i]) == 1){
			cur_par_index = index_true(GLB_menugroup_ids.prototype.varscomp_flags[i]);
			cur_parameter_name = GLB_vars.prototype.get_parameter_name(GLB_menugroup_ids.prototype.vars_map[i][cur_par_index]);
			cur_html = '<div style="display:inline-block; width:100%">';
			cur_html += '<a href="#" id="npcomp'+i+'" class="tabrain" style="width:120px">'+cur_parameter_name+'</a>';
			cur_html += '</div>';
			div_obj.html(div_obj.html() + cur_html);
		}
	}
	*/
}

/**
 *
 * group_a_id -
 * RETURN -
 */
function onchange_representation_select_option(group_a_id){
	
	GLB_ifisrain_callback.prototype.was_sel_change = true;
	
	if($("#"+group_a_id).hasClass("npact")){
		$("#"+group_a_id).click();
		$("#"+group_a_id).click();
	}
}

/**
 * Verify if, for a given menu id, the interface should load IFIS Rain.
 * type: Menu id
 * RETURN - True if the type is related to a ifis rain map, False otherwise
 */
function is_ifis_rain(type){
	var is_numeric;
	is_numeric = !isNaN(type);
	return(is_numeric);
}

/**
 *
 * type: Menu id
 * RETURN - True if the type is related to an evaluation, False otherwise
 */
function is_evaluation(type){
	var cur_eval_menu_item;
	var type_splitted;
	
	// first check
	if(type.indexOf('_') == -1){ return(false); }
	
	// split and get first
	type_splitted = type.split("_");
	
	// check if selected is in list of evaluations
	for(var i = 0; i < GLB_vars.prototype.webmenu.evaluation.length; i++){
		cur_eval_menu_item = GLB_vars.prototype.webmenu.evaluation[i];
		if(cur_eval_menu_item.evaluation != undefined){
			if(type_splitted[0] == cur_eval_menu_item.evaluation){
				return(true);
			}
		}
	}
	
	return(false);
}

/**
 *
 * type: Menu id
 * RETURN - True if the type is related to an evaluation with select box, False otherwise
 */
function is_hydrograph(type){
	
	// first check
	if(type.indexOf('_') != -1){ return(false); }
	
	// second check
	if (GLB_vars.prototype.webmenu.hydrograph == undefined){ 
		console.log("No entry for hydrograph in menu.");
		return(false);
	}
	
	// check if selected is in list of evaluations
	for(var i = 0; i < GLB_vars.prototype.webmenu.hydrograph.length; i++){
		cur_eval_menu_item = GLB_vars.prototype.webmenu.hydrograph[i];
		if(cur_eval_menu_item.evaluation != undefined){
			if(type == cur_eval_menu_item.evaluation){
				return(true);
			}
		}
	}
	return(false);
}

/**
 *
 * type:
 * RETURN :
 */
function is_comparison_modelcomb(type){
	"use strict";
	
	var checked_obj, grandparent_obj;
	
	// first check
	checked_obj = $("#np"+type);
	grandparent_obj = checked_obj.parent().parent();
	if(grandparent_obj.attr("id") == modelplus.ids.MENU_MODEL_COMB_PARAM_DIV){
		return(true);
	} else {
		return(false);
	}
}

/**
 *
 * type: 
 * RETURN -
 */
function is_representation_combined(type){
	var cur_reprcomb_menu_item;
	
	// is a representation combined if it is not a number and has no underline
	if ((type.indexOf('_') == -1)&&(isNaN(type))){
		return(true);
	} else {
		return(false);
	}
}

/**
 *
 * type: Menu id
 * RETURN - True if the type is related to an evaluation, False otherwise
 */
function uncheck_other_evaluations(type){
	var div_eval_obj, div_eval_children;
	var clicked_element_id;
	var cur_removed_type;
	
	clicked_element_id = "np" + type;
	
	// list all elements inside evaluation div
	div_eval_obj = $("#"+modelplus.ids.MENU_MODEL_EVAL_SELEC_DIV);
	div_eval_children = div_eval_obj.find("a");
	
	displayed = modelplus.main.get_displayed_representation();
	
	// for each listed element uncheck it if it is different from what we have now
	div_eval_children.each(function () {
		if((this.id != clicked_element_id) && ($(this).hasClass("npact"))){
			cur_removed_type = this.id.substring(2);
			hide_custom_display(cur_removed_type);
			$(this).removeClass("npact");
		}
	});
}

/**
 * Removes from exhibition all elements from place calling hide_custom_display.
 * type - Element clicked. Expected to start with 'np'.
 * param_div_id - Id of divi with select boxes. Usually it is in "modelplus.ids.MENU_MODEL_..._PARAM_DIV"
 * RETURN - None. Changes performed in interface.
 */
function uncheck_other_custom_display(clicked_element_id, param_div_id){
	var div_hydr_obj, div_hydr_children;
	
	console.log("Unchecking custom displays other than '" + clicked_element_id + "', '" + param_div_id + "'.");
	
	// list all elements inside param div
	div_hydr_obj = $("#" + param_div_id);
	div_hydr_children = div_hydr_obj.find("a");
	
	// for each listed element uncheck it if it is different from what we have now
	div_hydr_children.each(function () {
		if((this.id != clicked_element_id) && ($(this).hasClass("npact"))){
			cur_removed_type = this.id.substring(2);
			hide_custom_display(cur_removed_type);
			$(this).removeClass("npact");
		}
	});
}

/**
 *
 * type - 
 * RETURN - None. Changes are performed in interface.
 */
function uncheck_all_other_custom_displays(type){
	var clicked_element_id, param_div_idx;
	var cleaned_param_div_ids;
	
	clicked_element_id = 'np' + type;
	
	cleaned_param_div_ids = [modelplus.ids.MENU_MODEL_EVAL_SELEC_DIV,
							 modelplus.ids.MENU_MODEL_COMB_PARAM_DIV,
							 modelplus.ids.MENU_MODEL_HYDR_PARAM_DIV];
							 
	for(param_div_idx=0; param_div_idx < cleaned_param_div_ids.length; param_div_idx++){
		uncheck_other_custom_display(clicked_element_id, cleaned_param_div_ids[param_div_idx]);
	}
}

/**
 * Uses AJAX to retrieve the most recent timestamp available and build arguments for IFIS_Rain object.
 * the_id - Id of clicked element.
 * RETURN - None. Changes are performed on user interface.
 */
function load_ifis_rain(the_id, vis){
	var value_element_id, prefix, sc_runset_id;
	var image_ifisrain_folder_path, image_ifisrain_suffix;
	var sc_model1_id, sc_model2_id, sc_representation_id; 
	var ifis_rain_callback;
	var runset_time_interval;
	var legend_url;
	
	// some constants
	GLB_ifisrain_callback.prototype.design_sc = 11;                                                            // TODO - make it come from meta files
	GLB_ifisrain_callback.prototype.design_rt = 5;                                                             // TODO - make it come from meta files
	
	// get parameter id that is going to be shown
	/*
	value_element_id = "np"+the_id+"_sel";
	sc_representation_id = $("#"+value_element_id).val();
	*/
	sc_representation_id = screpresentationid_from_scmenuid(the_id);
	
	prefix = the_id.substring(0, 2);
	
	sc_runset_id = $('#'+modelplus.ids.MENU_RUNSET_SBOX).val();
	sc_model1_id = $('#'+modelplus.ids.MENU_MODEL_MAIN_SBOX).val();
	
	if(($('#'+modelplus.ids.MENU_MODEL_COMP_SBOX).length) && 
	   ($('#np'+GLB_opt_ids.prototype.comp_group).hasClass("npact"))){
	    sc_model2_id = $('#'+modelplus.ids.MENU_MODEL_COMP_SBOX).val();
		if (sc_model2_id == "") { sc_model2_id = null; }
	} else {
		sc_model2_id = null;
	}
	
	// build arguments object
	GLB_ifisrain_callback.prototype.call = function(last_timestamp){
		var check_before, check_after;
		
		GLB_ifisrain_callback.prototype.ref_timestamp0 = last_timestamp;
		check_before = $("#np" + GLB_ifisrain_callback.prototype.id).hasClass("npact");
		ifis_rain_maps(GLB_ifisrain_callback.prototype.vis, GLB_ifisrain_callback.prototype.type);
		check_after = $("#np" + GLB_ifisrain_callback.prototype.id).hasClass("npact");
		
		if (check_before != check_after){
			$("#np" + GLB_ifisrain_callback.prototype.id).addClass("npact");
		}
	}
	GLB_ifisrain_callback.prototype.url1 = build_folder_path(prefix, sc_representation_id, sc_runset_id);
	GLB_ifisrain_callback.prototype.url2 = sc_representation_id + '.png';
	//GLB_ifisrain_callback.prototype.legend = GLB_urls.prototype.base_image_folder + 'cscale_qindexn.png';  // TODO - make it come from meta files
	
	// get JSON object
	json_repr_obj = get_json_representation(sc_representation_id);
	
	// set up legend
	legend_id = null;
	if(is_menu_id_single_repr(the_id)){
		if ((json_repr_obj.legend_sing != undefined) && (json_repr_obj.legend_sing != null) && (json_repr_obj.legend_sing != "")){
			legend_id = json_repr_obj.legend_sing;
		} else if ((json_repr_obj.legend != undefined) && (json_repr_obj.legend != null) && (json_repr_obj.legend != "")) {
			legend_id = json_repr_obj.legend;
		}
	} else if (is_menu_id_comparison_repr(the_id)) {
		if (json_repr_obj == undefined) {
			legend_id = null;
		} else if ((json_repr_obj.legend_comp != undefined) && (json_repr_obj.legend_comp != null) && (json_repr_obj.legend_comp != "")){
			legend_id = json_repr_obj.legend_comp;
		} else if ((json_repr_obj.legend != undefined) && (json_repr_obj.legend != null) && (json_repr_obj.legend != "")) {
			legend_id = json_repr_obj.legend;
		}
	}
	if(legend_id == null){ legend_id = "nolegend"; }
	GLB_ifisrain_callback.prototype.legend = GLB_urls.prototype.base_legend_image_folder + legend_id + '.png';
	
	// set up calendar type, design, 
	GLB_ifisrain_callback.prototype.id = the_id;
	if (json_repr_obj.calendar_type == "daily"){
		GLB_ifisrain_callback.prototype.type = 10118;
		GLB_ifisrain_callback.prototype.design = null;
	} else {
		GLB_ifisrain_callback.prototype.type = the_id;
		runset_time_interval = GLB_vars.prototype.get_runset_timediff();
		var eval_ini, eval_end;
		eval_ini = 9 * 24 * 60 * 60;   // 10-days min threshold
		eval_end = 11 * 24 * 60 * 60;  // 10-days max threshold
		
		// olds
		/*
		if ((sc_runset_id == 'realtime') || 
			((runset_time_interval != null)&&(runset_time_interval >= eval_ini)&&(runset_time_interval <= eval_end))){
			console.log("  Fits [" + eval_ini + " < " + runset_time_interval + " < " + eval_end + "].");
			GLB_ifisrain_callback.prototype.design = GLB_ifisrain_callback.prototype.design_rt;
			GLB_ifisrain_callback.prototype.array_end = 240;
		} else {
			console.log("  FAIL [" + eval_ini + " < " + runset_time_interval + " < " + eval_end + "].");
			GLB_ifisrain_callback.prototype.design = GLB_ifisrain_callback.prototype.design_sc;
			GLB_ifisrain_callback.prototype.array_end = 480;
		}
		*/

		// news
		// for hourly
		if (GLB_vars.prototype.is_model_combination(sc_model1_id)){
			GLB_ifisrain_callback.prototype.design = GLB_ifisrain_callback.prototype.design_sc;
			GLB_ifisrain_callback.prototype.array_end = 480;
			// GLB_ifisrain_callback.prototype.array_start = 240;
			GLB_ifisrain_callback.prototype.array_init = 240;
		} else {
			// TODO - use another most appropriate condition - based on representation information
			if ((sc_runset_id == 'realtime') || 
				((runset_time_interval != null)&&(runset_time_interval >= eval_ini)&&(runset_time_interval <= eval_end)) ||
				(((sc_model1_id.indexOf('fore') !== -1) || (sc_model1_id.indexOf('past') !== -1)) && (sc_model1_id.indexOf('pastfore') == -1))){
				GLB_ifisrain_callback.prototype.design = GLB_ifisrain_callback.prototype.design_rt;
				GLB_ifisrain_callback.prototype.array_end = 240;
				// GLB_ifisrain_callback.prototype.array_start = 0;
				GLB_ifisrain_callback.prototype.array_init = 0;
			} else {
				console.log("  FAIL [" + eval_ini + " < " + runset_time_interval + " < " + eval_end + "].");
				GLB_ifisrain_callback.prototype.design = GLB_ifisrain_callback.prototype.design_sc;
				GLB_ifisrain_callback.prototype.array_end = 480;
				// GLB_ifisrain_callback.prototype.array_start = 0;
				GLB_ifisrain_callback.prototype.array_init = 0;
			}
		}
		
	}
	
	// set up other variables
	GLB_ifisrain_callback.prototype.vis = vis;
	GLB_ifisrain_callback.prototype.representation_id = sc_representation_id;
	
	// set up total interval
	/*
	if ($('#'+modelplus.ids.MENU_RUNSET_SBOX).val() == 'realtime'){
		GLB_ifisrain_callback.prototype.array_end = 240;
	} else {
		GLB_ifisrain_callback.prototype.array_end = 480;
	}
	*/
	
	// read reference timestamp and load images after returning from AJAX
	read_reference_timestamp0_map(sc_runset_id, sc_model1_id, sc_model2_id, sc_representation_id, GLB_ifisrain_callback.prototype.call);
}


/**
 *
 * sc_runset_id -
 * sc_model1_id -
 * sc_model2_id - String or null (if not a comparison)
 * sc_representation_id -
 * callback_function - function(int timestamp). Function that will be executed after reading the file.
 * RETURN - None.
 */
function read_reference_timestamp0_map(sc_runset_id, sc_model1_id, sc_model2_id, sc_representation_id, callback_function){
	// retrieve the timestamp reference for all models
	// return : Into 'last_timestamps' global variable
	var sc_model_id, ws_url;
	
	// build accessed URL
	if(sc_model2_id == null){
		sc_model_id = sc_model1_id;
	} else {
		sc_model_id = sc_model1_id + "_" + sc_model2_id;
	}
	ws_url = GLB_webservices.prototype.get_representations_ref0_timestamp_url(sc_runset_id, sc_model_id, sc_representation_id);
	
	// 
	$.ajax({
		url: ws_url
	}).success(function(data) {
		// alert("Inside. " + data);
		callback_function(data);
		/*
		all_pairs = data.split(";");
		for(count = 0; count < all_pairs.length; count++){
			cur_pair = all_pairs[count].split(":");
			if (cur_pair.length > 1){
				last_timestamps[cur_pair[0]] = cur_pair[1];
			}
		}
		*/ 
	});
}

/**
 * Creates URL for image maps
 * prefix - Expected '90' for single model repr, '92' for comparison model repr (or 'eval'?)
 * parameter_acronym -
 * runset_id -
 * RETURN - String.
 */
function build_folder_path(prefix, parameter_acronym, runset_id){
	var model1_id, model2_id;
	var models_displayed;
	var cur_http;
	
	// cur_http = "http://s-iihr50.iihr.uiowa.edu/ifis/sc/test1/ssc_model/images_realtime/";
	cur_http = modelplus.url.base_realtime_folder + runset_id + '/repres_displayed/';
	
	model1_id = $("#"+modelplus.ids.MENU_MODEL_MAIN_SBOX).val();
	switch(prefix){
		case "90":
			models_displayed = cur_http + model1_id + "/";
			break;
		case "92":
			model2_id = $("#"+modelplus.ids.MENU_MODEL_COMP_SBOX).val();
			models_displayed = cur_http + model1_id + "_" + model2_id + "/";
			break;
		case "98":
			alert("clicked");
			break;
		default:
			alert("Unexpected value of prefix ('" + prefix + "')");
			return(null);
	}
	
	models_displayed = models_displayed + parameter_acronym + "/";
	
	// alert("Model address: " + models_displayed);
	return (models_displayed);
}

/**
 * Fill main runset select box with the content in 'GLB_vars.prototype.sc_runsets' variable.
 * RETURN - Null. Changes are performed in interface.
 */
function populate_runset_main_sbox(){
	var jquery_runset_sbox, cur_txt;
	var default_runset_id, has_default_runset;
	
	// 
	default_runset_id = 'realtime';
	jquery_runset_sbox = $('#' + modelplus.ids.MENU_RUNSET_SBOX);
	
	// clean previous content
	jquery_runset_sbox.find('option').remove().end();
	
	// populate it
	jquery_runset_sbox.append('<option value="" selected>Select...</option>');
	has_default_runset = false;
	for (var i = 0; i < GLB_vars.prototype.sc_runsets.length; i++){
		
		// ignore hidden runsets
		if(GLB_vars.prototype.sc_runsets[i].show_main == "F"){ continue; }
		
		cur_txt = 	'<option value="'+GLB_vars.prototype.sc_runsets[i].id+'">' + 
						GLB_vars.prototype.sc_runsets[i].title + 
					'</option>';
		jquery_runset_sbox.append(cur_txt);
		if (GLB_vars.prototype.sc_runsets[i].id == default_runset_id){
			has_default_runset = true;
		}
	}
	
	// define function to be run on change
	jquery_runset_sbox.change(onchange_runset_main_sbox);
	
	// select 'realtime' as default, if it exists in the list
	if (has_default_runset){
		jquery_runset_sbox.val('realtime');
		jquery_runset_sbox.change();
	}
}

/**
 * Fill main model select box with the content in 'GLB_vars.prototype.sc_models' variable.
 * RETURN - Null. Changes are performed in interface.
 */
function populate_model_main_sbox(){
	var cur_obj, cur_txt;
	
	// clean previous content
	$('#'+modelplus.ids.MENU_MODEL_MAIN_SBOX).find('option').remove().end();
		
	// populate it with empty option
	cur_obj = $('#'+modelplus.ids.MENU_MODEL_MAIN_SBOX);
	cur_obj.append('<option value="" selected>Select...</option>');
	
	// populate it with models
	for (var i = 0; i < GLB_vars.prototype.sc_models.length; i++){
		// ignore hidden models
		if (GLB_vars.prototype.sc_models[i].show_main == "F"){ continue; }
		
		// add option
		cur_txt = '<option value="'+GLB_vars.prototype.sc_models[i].id+'">' + 
						GLB_vars.prototype.sc_models[i].title + 
					'</option>';
		cur_obj.append(cur_txt);
	}
	
	// populate it with model combinations
	for (var i = 0; i < GLB_vars.prototype.sc_model_combinations.length; i++){
		cur_txt = '<option value="' + GLB_vars.prototype.sc_model_combinations[i].id + '">' + 
						GLB_vars.prototype.sc_model_combinations[i].title + 
					'</option>';
		cur_obj.append(cur_txt);
	}
	
	// define function to be run on change
	$('#'+modelplus.ids.MENU_MODEL_MAIN_SBOX).change(onchange_model_main_sbox);
	$('#'+modelplus.ids.MENU_MODEL_COMP_SBOX).change(onchange_model_comp_sbox);
	$('#'+modelplus.ids.MENU_MODEL_MAIN_SBOX).change();
}

/**
 * Reads web service related to the initial data to be retrieved into global variables
 * func_to_run - Function to be executed after loading data
 * RETURN - None. Changes are performed in GLB_vars prototype
 */
function load_init_data(func_to_run){
	$.ajax({
		url: GLB_webservices.prototype.metainfo_list_runsets
	}).success(function(data) {
		// parse data and build message
		var parsed_json;
		try{
			GLB_vars.prototype.sc_runsets = JSON.parse(data);
			if ((typeof func_to_run !== 'undefined') && (func_to_run != null)){
				func_to_run();
			}
		} catch(err) {
			alert("Error 123: " + err);
			// alert("Unable to parse: " + data);
			// alert("Error: " + err)
		}
		
	})
}

/**
 * Reads web service related to the initial data to be retrieved into global variables
 * func_to_run - Function to be executed after loading data
 * RETURN - None. Changes are performed in GLB_vars prototype
 */
function load_model_data(){
	var runset_id, model_id;
	
	runset_id = $('#'+modelplus.ids.MENU_RUNSET_SBOX).val();
	model_id = $('#'+modelplus.ids.MENU_MODEL_MAIN_SBOX).val();
	
	// alert("From: " + GLB_webservices.prototype.get_metainfo_load_model(runset_id, model_id));
	$.ajax({
		url: GLB_webservices.prototype.get_metainfo_load_model(runset_id, model_id)
	}).success(function(data) {
		// parse data and build message
		var parsed_json;
		try{
			parsed_json = JSON.parse(data);
		} catch(err) {
			alert("Unable to parse: " + data);
			// alert("Error: " + err)
		}
		
		GLB_vars.prototype.sc_references = parsed_json.sc_reference;
		GLB_vars.prototype.sc_representation = parsed_json.sc_representation;
		GLB_vars.prototype.sc_evaluation = parsed_json.sc_evaluation;
		GLB_vars.prototype.comparison_matrix = parsed_json.comp_mtx;
		
		/*
		if ((typeof func_to_run !== 'undefined') && (func_to_run != null)){
			func_to_run();
		}
		*/
		GLB_vars.prototype.webmenu = parsed_json.web_menu;
		onchange_model_main_sbox();
	})
}

/**
 * Check if a np_link is a group label.
 * RETURN - True if given argument is a group, False otherwise.
 */
function is_np_link_group_label(np_link_type){
	var group_labels_ids, i;
	
	group_labels_ids = [GLB_opt_ids.prototype.mono_group, 
						GLB_opt_ids.prototype.comp_group, 
						GLB_opt_ids.prototype.eval_group, 
						GLB_opt_ids.prototype.comb_group,
						GLB_opt_ids.prototype.tool_group,
						GLB_opt_ids.prototype.hydr_group];
	
	for(i in group_labels_ids){
		if(group_labels_ids[i] == np_link_type){
			return(true);
		}
	}
	
	return(false);
}

/**
 *
 * RETURN - The name of the model if it was found, 'null' otherwise.
 */
GLB_vars.prototype.get_model_name = function(model_id){
	for (var i = 0; i < GLB_vars.prototype.sc_models.length; i++){
		if (GLB_vars.prototype.sc_models[i].id == model_id){
			return(GLB_vars.prototype.sc_models[i].title);
		}
	}
	return(null);
}

/**
 *
 * RETURN - The name of the parameter if it was found, 'null' otherwise.
 */
/*
GLB_vars.prototype.get_parameter_name = function(parameter_id){
	for (var i = 0; i < GLB_vars.prototype.sc_parameter.length; i++){
		if (GLB_vars.prototype.sc_parameter[i].id == parameter_id){
			return(GLB_vars.prototype.sc_parameter[i].title);
		}
	}
	return(null);
}
*/

/*
 *
 * RETURN - 
 */
GLB_vars.prototype.get_representation_call_select = function(representation_id){
	for (var i = 0; i < GLB_vars.prototype.sc_representation.length; i++){
		if (GLB_vars.prototype.sc_representation[i].id == representation_id){
			if (GLB_vars.prototype.sc_representation[i].call_select != undefined){
				return(GLB_vars.prototype.sc_representation[i].call_select);
			} else {
				return(null);
			}
		}
	}
	return(null);
}

/**
 *
 * RETURN - The IDs of all parameters
 */
GLB_vars.prototype.get_comparison_parameters_id = function(model1_id, model2_id){
	var comparison_id, comp_i;
	var comparison_params_id;
	
	comparison_id = model1_id + "_" + model2_id;
	comp_i = -1;
	
	// search for comparison index
	for (var i = 0; i < GLB_vars.prototype.comparison_matrix.length; i++){
		if (GLB_vars.prototype.comparison_matrix[i].id == comparison_id){
			comp_i = i;
			break;
		}
	}
	
	// if not found, break the loop
	if (comp_i == -1){
		alert("Not found comparison " + comparison_id); 
		return(null);
	} else {
		return(GLB_vars.prototype.comparison_matrix[i].params);
	}
}

/**
 *
 * evt - Mandatory argumento for onchange() function
 * RETURN - None. Chenges are performed on interface
 */
function onchange_param(evt){
	var sbox_element_id, sbox_value;
	var radio_element_id, radio_element_obj;
	
	sbox_element_id = $(this).attr('id');
	radio_element_id = sbox_element_id.replace("_sel", "");
	radio_element_obj = $("#"+radio_element_id);
	
	// only do something if respective radio button is selected
	if (!radio_element_obj.hasClass("npact")){ 
		return; 
	} else {
		radio_element_obj.click();
		radio_element_obj.click();
	}
}

/**
 *
 * sc_menu_id - A numeric value
 * RETURN - A string if found, null otherwise
 */
function screpresentationid_from_scmenuid(sc_menu_id){
	// TODO - make it flexible for non-select also
	value_element_id = "np"+sc_menu_id+"_sel";
	sc_representation_id = $("#"+value_element_id).val();
	return(sc_representation_id);
}

/**
 *
 * sc_model_id -
 * RETURN -
 */
function get_json_model(sc_model_id){
	for (var i = 0; i < GLB_vars.prototype.sc_models.length; i++){
		if (GLB_vars.prototype.sc_models[i].id == sc_model_id){
			return(GLB_vars.prototype.sc_models[i]);
		}
	}
	return(null);
}

/**
 *
 * sc_reference_id -
 * RETURN -
 */
function get_json_reference(sc_reference_id){
	for (var i = 0; i < GLB_vars.prototype.sc_references.length; i++){
		if (GLB_vars.prototype.sc_references[i].id == sc_reference_id){
			return(GLB_vars.prototype.sc_references[i]);
		}
	}
	return(null);
}

/**
 *
 * sc_repr_id -
 * RETURN -
 */
function get_json_representation(sc_representation_id){
	for (var i = 0; i < GLB_vars.prototype.sc_representation.length; i++){
		if (GLB_vars.prototype.sc_representation[i].id == sc_representation_id){
			return(GLB_vars.prototype.sc_representation[i]);
		}
	}
	return(null);
}

/**
 *
 * sc_evaluation_id -
 * RETURN -
 */
function get_json_evaluation(sc_evaluation_id){
	for (var i = 0; i < GLB_vars.prototype.sc_evaluation.length; i++){
		if (GLB_vars.prototype.sc_evaluation[i].id == sc_evaluation_id){
			return(GLB_vars.prototype.sc_evaluation[i]);
		}
	}
	return(null);
}

/**
 *
 * repr_id -
 * RETURN -
 */
function is_menu_id_single_repr(repr_id){
	var prefix;
	prefix = repr_id.substring(0, 2);
	if(prefix == "90"){ return (true);} else { return (false); }
}

/**
 *
 * repr_id -
 * RETURN -
 */
function is_menu_id_comparison_repr(repr_id){
	var prefix;
	prefix = repr_id.substring(0, 2);
	if(prefix == "92"){ return (true);} else { return (false); }
}

/**
 *
 * sc_representation_id -
 * attribute_id -
 * RETURN -
 */
function get_optional_representation_attribute(sc_representation_id, attribute_id){
	var repr_obj;
	
	repr_obj = get_json_representation(sc_representation_id);
	if(repr_obj == null){return(null);}
	
	// TODO - solve this
	/* 
	if (repr_obj.representation != undefined){
		repres = GLB_vars.prototype.sc_representation[i].representation;
	} else {
		repres = null;
	}
	*/ 
}

/**
 *
 * display_id :
 * RETURN : None. Changes are performed on interface
 */
function load_custom_style(style_id){
	
}

/**
 *
 * display_id :
 * RETURN : None. Changes are performed on interface
 */
function call_custom_display(display_id){
	"use strict";
	var display_address, argument, select_id, splitted_str;
	const stylesheet_link_id = 'custom_display_css';
	
	// check if there is argument and build it
	if(display_id.indexOf('_') > -1){
		splitted_str = display_id.split("_");
		display_id = splitted_str[0];
		argument = splitted_str[1];
	} else {
		select_id = "np" + display_id + "_sel";
		if ($("#" + select_id).val() !== 'undefined'){
			argument = $("#" + select_id).val() + "'";
		} else {
			argument = null;
		}
	}
	
	// call stylesheet
	var css_address = modelplus.url.custom_display_css_folder + display_id + ".css";
	$('link[id='+stylesheet_link_id+']').remove();
	var css_tag = '<link rel="stylesheet" type="text/css" id="'+stylesheet_link_id+'" href="'+css_address+'">';
	$('head').append(css_tag);
	console.log("Appended '"+css_address+"'");

	// call display
	display_address = GLB_urls.prototype.custom_display_folder + display_id + ".js";
	if (typeof custom_display !== 'undefined'){
		// delete custom_display;
		custom_display = null;
	}
	loadScript(display_address, function(){
		if(typeof custom_display !== 'undefined'){
			custom_display(argument);
		} else {
			alert("'custom_display' undefined for '"+display_id+"'");
		}
	});
}

/**
 *
 * display_id :
 * RETURN :
 */
function hide_custom_display(display_id){
	var hidden_value, top_legend_obj;
	
	if ($("#"+modelplus.ids.LEGEND_TOP_HID).length > 0 ){
		hidden_value = $("#"+modelplus.ids.LEGEND_TOP_HID).val();
		if (hidden_value == display_id){
			top_legend_obj = $("#"+modelplus.ids.LEGEND_TOP_DIV);
			top_legend_obj.hide();
			delete top_legend_obj;
		}
	}
	
	// deletes all map polygons attached to the 
	if(typeof(GLB_visual.prototype.polygons[display_id]) !== 'undefined'){
		if(GLB_visual.prototype.polygons[display_id] instanceof Array){
			for(idx = 0; idx < GLB_visual.prototype.polygons[display_id].length; idx++){
				GLB_visual.prototype.polygons[display_id][idx].setMap(null);
				delete GLB_visual.prototype.polygons[display_id][idx];
			}
			delete GLB_visual.prototype.polygons[display_id];
		} else {
			alert("'" + display_id + "' not an array. Is " + typeof GLB_visual.prototype.polygons[display_id]);
		}
	} else {
		if(display_id.indexOf('_') > -1){
			hide_custom_display(display_id.split("_")[0]);
			console.log("Hiding '" + display_id + "'.");
		} else {
			alert("'" + display_id + "' not in global var");
		}
	}
}

/**
 * Hide or display rivers vector representation considering time of parameters displayed
 * sc_menu_id - A 'menu id'
 * RETURN - None. Changes are performed on interface
 */
function toggle_river_map(sc_menu_id){
	var sc_representation_id, repres;
	
	// if it is not selected, just show the stuff
	if ($("#np" + sc_menu_id).hasClass("npact") == false){
		iowadata.network.setMap(map);
		GLB_map_river_zoom = true;
		$("#np"+opt_tool_vec_rivers).addClass("npact");
		return;
	}
	
	// gets "representation attribute" relative to selected sc_representation
	sc_representation_id = screpresentationid_from_scmenuid(sc_menu_id);
	repres = null;
	for (var i = 0; i < GLB_vars.prototype.sc_representation.length; i++){
		if (GLB_vars.prototype.sc_representation[i].id == sc_representation_id){
			if (GLB_vars.prototype.sc_representation[i].representation != undefined){
				repres = GLB_vars.prototype.sc_representation[i].representation;
			} else {
				repres = null;
			}
		}
	}
	
	// display or hide the layer
	switch(repres){
		case "composite": 
		case "links_h5_b":
			iowadata.network.setMap(null);
			GLB_map_river_zoom = false;
			$("#np"+opt_tool_vec_rivers).removeClass("npact");
			break;
		case null:
			// if there is nothing to be said, does nothing
			if (iowadata.network.getMap() == null){
				GLB_map_river_zoom = false;
				$("#np"+opt_tool_vec_rivers).removeClass("npact");
			} else {
				GLB_map_river_zoom = true;
				$("#np"+opt_tool_vec_rivers).addClass("npact");
			}
			break;
		default:
			iowadata.network.setMap(map);
			GLB_map_river_zoom = true;
			$("#np"+opt_tool_vec_rivers).addClass("npact");
	}
	
	return;
}