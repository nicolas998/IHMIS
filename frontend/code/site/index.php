<?php
    if(isset($_GET['sc']) && ($_GET['sc'] == 'open')){

		if ($_SERVER['SERVER_NAME']=='s-iihr50.iihr.uiowa.edu') {
			// for local development
			include_once "/local/iihr/ifis.iowawis.org/sc/inc_config.php";
			IFIS_Init(1, 'IFIS MODEL 3.2', 'test1/ihmis/dev/frontend/code/site/viewer_3_2', 1); 
		} else {
			// for release
			include_once "../inc_config.php"; 
			IFIS_Init(1, 'IFIS MODEL 3.2', 'modelplus/viewer_3_2', 1);
		}

	} else {
?>

<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="user-scalable=no, width=960" />
    <meta charset="UTF-8" />
    <title>IFC MODEL PLUS - IFIS SPECIAL CASE</title>
    
    <script type="text/javascript" src="common/vendor/jquery-3.1.1.min.js"></script>
	<script type="text/javascript" src="index_3_2/scripts/modelplus.url.js"></script>
    <script type="text/javascript" src="index_3_2/base_lib.js"></script>
    
	<link rel="stylesheet" href="index_3_2/main.css" media="screen" />
	
  </head>
  <body id="central">
    <div id="wrapper">
      <div id="doc">
		<div id="header">
		  <!-- keep empty -->
		</div>
	    <div id="main-feature">
		  <div id="launchifis">
            <img src="index_3_2/imgs/launchviewer.png" alt="Map of Iowa-USA" style="display:block" />
            <br />
			<a href="index.php?sc=open" class="btnmain btnwht">
			  &nbsp;&nbsp;&nbsp;Viewer&nbsp;&nbsp;&nbsp;
			</a>
          </div>
		  <div id="slogan">
		    ModelPlus is a web tool for observing, comparing and evaluating hidrological models outputs for the State of Iowa.<br />
		    It is originally designed for HLM-Asynch (Hillslope-Link Model) results, but can be easily extended to accept results from other models when conversion of outputs into hillslope-scale segmentation is feasible.<br />
		    The main tool is the <strong>Viewer</strong>, in which real-time simulations and forecasts can be observed, as do as results from isolated events runs.<br />
		    To request a new model run, a different interface was provided named <strong>Requester</strong>.
		  </div>
          <div id="banner" style="width:100%; height:200px; display:block" >
			<div style="width:900px; display:block-inline; text-align:left">
				<img src="index_3_2/imgs/img_request.png" style="width:128px; height:128px; padding-left:60px" />
				<img src="index_3_2/imgs/img_question.png" style="width:128px; height:128px; padding-left:100px" />
				<img src="index_3_2/imgs/img_config.png" style="width:128px; height:128px; padding-left:90px" />
				<img src="index_3_2/imgs/img_report.png" style="width:128px; height:128px; padding-left:90px" />
			</div>
			<div style="width:900px; display:block-inline; text-align:left">
				<div class="video" onclick="location.href='index_3_2/requester.html'">
					Requester
				</div>
				<div class="video" onclick="location.href='index_3_2/about.html';">
					About
				</div>
				<div class="video" onclick="location.href='index_3_2/settings.php';">
					Settings
				</div>
				<div class="video" onclick="location.href='index_3_2/report.html'">
					Report
				</div>
			</div>
		  </div>
		</div>
        <div id="footer">
          <!-- keep empty -->
        </div>
	  </div> <!-- doc -->
	</div>   <!-- wrapper -->
  </body>
</html>

<?php
	}
?>
