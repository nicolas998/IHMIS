function custom_display(){
	// alert("Called it here.");
	
	var gages_location_dict = null;
	var sc_runset_id, sc_model_id;
	var all_images_dict = null;
	var sc_evaluation_id;
	
	sc_runset_id = $('#'+ modelplus.ids.MENU_RUNSET_SBOX).val();
	sc_model_id = $('#'+ modelplus.ids.MENU_MODEL_MAIN_SBOX).val();
	sc_evaluation_id = "hydrographqs";
	
	// search reference
	reference_id = "mock";
	$(".npact").each(function() {
		var cur_radio_id, splitted_radio;
		cur_radio_id = $(this).attr('id');
		
		if(cur_radio_id.indexOf('_') > -1){
			splitted_radio = cur_radio_id.split("_");
			if(splitted_radio[0] == "np"+sc_evaluation_id){
				reference_id = splitted_radio[1];
			}
		}
	});
	
	// build relevant http addressees
	icon_address =                modelplus.url.base_frontend_webservices+"imgs/map_icons/hidrog.png";
	ws_all_images_url =           GLB_webservices.prototype.http + "custom_ws/"+sc_evaluation_id+".php%i%sc_runset_id="+sc_runset_id+"%e%sc_model_id="+sc_model_id+"%e%sc_reference_id="+reference_id;
	ws_gages_location_url =       GLB_webservices.prototype.http + "ws_gages_location.php";
	single_image_folder_address = modelplus.url.base_realtime_folder+sc_runset_id+"/repres_displayed/"+sc_model_id+"/"+sc_evaluation_id+"_"+reference_id+"/";
	
	// load all images available
	$.ajax({
		url: ws_all_images_url
	}).success(function(data){
		all_images_dict = JSON.parse(data);
		display_when_possible();
	});
	
	// load all locations
	$.ajax({
		url: ws_gages_location_url
	}).success(function(data){
		gages_location_dict = JSON.parse(data);
		display_when_possible();
	});
	
	/**
	 *
	 * link_id : 
	 * timestamp : 
	 * RETURN :
	 */
	function build_image_name(link_id, timestamp){
		return(timestamp + "_" + link_id + ".png");
	}
	
	/**
	 *
	 * msg_html :
	 * RETURN :
	 */
	function display_hidrograph_block(hidrograph_img_url){
		var div_modal = document.getElementById('modal_hidrograph_div');
		var div_modal_ctt = $('#modal_content_hidrograph_div');
		var inner_html;
	
		div_modal.style.display = "block";
		inner_html = "<p><span id='modal_close_span' onclick='close_model_hidrograph_desc()'>&#10799;</span></p>";
		inner_html += "<img src='" + hidrograph_img_url + "' />";
		div_modal_ctt.html(inner_html);
	}
	
	/**
	 *
	 * RETURN :
	 */
	function close_model_hidrograph_desc(){
		var modal_div;
		modal_div = $("#modal_hidrograph_div").hide();
	}
	
	/**
	 * Function that only works properly when global vars 'all_images_dict' and 'gages_location_dict' are not null
	 * RETURN : None.
	 */
	function display_when_possible(){
		if (all_images_dict == null){
			// alert("Still waiting for imaged JSON.");
		} else if (gages_location_dict == null) {
			// alert("Still waiting for gages JSON.");
		} else {
			// for each gauge, searches if there is an image for it
			json_gage = gages_location_dict["gauge"];
			for(idx=0; idx<json_gage.length; idx++){
				cur_linkid = json_gage[idx]["link_id"];
				if(typeof(all_images_dict[cur_linkid]) !== 'undefined'){
					// define icon, marker and action
					cur_latlng = {lat:parseFloat(json_gage[idx]["lat"]), lng:parseFloat(json_gage[idx]["lng"])};
					cur_icon = new google.maps.MarkerImage(
						icon_address,
						new google.maps.Size(21, 34),
						new google.maps.Point(0,0),
						new google.maps.Point(10, 34));
					cur_marker = new google.maps.Marker({
						position:cur_latlng,
						map:map,
						icon:cur_icon,
						title:json_gage[idx].desc,
						id:json_gage[idx].link_id
					});
					google.maps.event.addListener(cur_marker, "click", function () {
						var img_url = single_image_folder_address + build_image_name(this.id, all_images_dict[this.id]);
						display_hidrograph_block(img_url);
					});
					// create reference list for icon in global var if necessary
					if(typeof(GLB_visual.prototype.polygons[sc_evaluation_id]) === 'undefined'){
						GLB_visual.prototype.polygons[sc_evaluation_id] = [];
					}
					GLB_visual.prototype.polygons[sc_evaluation_id].push(cur_marker);
				}
			}
		}
	}
}