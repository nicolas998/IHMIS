<?php

// -----------------------------{ LOAD }------------------------------ //

error_reporting(E_ALL);
ini_set('display_errors', 1);

date_default_timezone_set('America/Chicago');

require '../vendor/autoload.php';
require_once 'util/util.php';
require_once '../app/dbconnection/database.php';
require_once '../app/fsconnection/foldersystem.php';

use Illuminate\Database\Capsule\Manager as Capsule;
use Slim\Http\Response as Response;
use Slim\Http\Request as Request;

// -----------------------------{ SLIM }------------------------------ //

$app = new \Slim\App();
$app->dbs = function(){ return(new Capsule); };
$app->fss = FolderSystemFactory::create(is_sandbox());
$app->log = (object) null;

// ----------------------{ MODELPLUS SPECIFICS }---------------------- //

$app->invalid_argument = array('ERROR' => 'Invalid argument'); 
load_utils($app);

// -----------------------------{ ROUTE }----------------------------- //

// --- Static definitions

// request statical HL-Models
$app->get('/hl_models',
          function(Request $req,  Response $res, $args = []) use ($app){
	require './ws/hl_models.php';
	return(process_get_request($app, $req, $res));
});

// request statical global parameters of HL-Models
$app->get('/hl_models_global_parameters', 
          function(Request $req, Response $res, $args = []) use ($app){
	require './ws/hl_models_global_parameters.php';
	return(process_get_request($app, $req, $res));
});

// request statical SC-References
$app->get('/sc_references', 
          function(Request $req, Response $res, $args = []) use ($app){
	require './ws/sc_references.php';
	return(process_get_request($app, $req, $res));
});

// request statical SC-Representations
$app->get('/sc_representations', 
          function(Request $req, Response $res, $args = []) use ($app){
	require './ws/sc_representations.php';
	return(process_get_request($app, $req, $res));
});

// 
$app->get('/sc_representationscomp', function() use ($app){
	require './ws/sc_representation_compositions.php';
	process_get_request($app);
});

// request statical SC-Evaluations
$app->get('/sc_evaluations', 
          function(Request $req, Response $res, $args = []) use ($app){
	require './ws/sc_evaluations.php';
	return(process_get_request($app, $req, $res));
});

// request forcing types
$app->get('/forcing_types',
    function(Request $req,  Response $res, $args = []) use ($app){
	require './ws/forcing_types.php';
	return(process_get_request($app, $req, $res));
});

// request forcing sources
$app->get('/forcing_sources', 
          function(Request $req, Response $res, $args = []) use ($app){
	require './ws/forcing_sources.php';
	return(process_get_request($app, $req, $res));
});

// request forcing precipitations
// TODO - remove it - replace by generic ForcingSources one
$app->get('/forcing_precipitations', function() use ($app){
	require './ws/forcing_precipitations.php';
	process_get_request($app);
});

// --- Runset Requests

// request runsets requests
$app->get('/sc_runset_requests', function () use ($app) {
	require './ws/sc_runset_requests.php';
	process_get_request($app);
});

// request runset merge requests
$app->get('/sc_runset_merge_requests', function () use ($app) {
	require './ws/sc_runset_merge_requests.php';
	process_get_request($app);
});

// create new runset request
$app->post('/sc_runset_requests/new', function () use ($app) {
	require './ws/sc_runset_requests.php';
	echo("wow");
	process_post_request($app);
});

// delete a runset request
$app->delete('/sc_runset_requests/:file_name', 
             function($file_name) use ($app){
	require './ws/sc_runset_requests.php';
	process_delete_request($app, $file_name);
});

// --- Runset Merge Requests

// create new runset merge request
$app->post('/sc_runset_merge_requests/new', function() use ($app) {
	require './ws/sc_runset_merge_requests.php';
	process_post_request($app);
});

// delete a runset merge request
$app->delete('/sc_runset_merge_requests/:file_name', 
             function($file_name) use ($app){
	require './ws/sc_runset_merge_requests.php';
	process_delete_request($app, $file_name);
});

// --- Runset Results

// creates a new runset result
$app->post('/sc_runset_results/', function () use ($app) {
	require './ws/sc_runset_results.php';
	process_post_request($app);
});

// list all runset results
$app->get('/sc_runset_results',
          function(Request $req,  Response $res, $args = []) use ($app) {
	require './ws/sc_runset_results.php';
	return(process_get_request($app, $req, $res));
});

// delete an specific runset result
$app->delete('/sc_runset_results/:sc_runset_id', 
             function($sc_runset_id) use ($app) {
	require './ws/sc_runset_results.php';
	process_delete_request($app, $sc_runset_id);
});

$app->get('/sc_forecast_set', 
    function(Request $req,  Response $res, $args = []) use ($app) {
	require './ws/sc_forecast_set.php';
	return(process_get_request($app, $req, $res));
});

// --- Runset Model Results
$app->delete('/sc_runset_model_results/:sc_runset_id/:sc_model_id', function($sc_runset_id, $sc_model_id) use ($app) {
	require './ws/sc_runset_model_results.php';
	process_delete_request($app, $sc_runset_id, $sc_model_id);
});


// --- Others

// list all Points Of Interest (POIs)
$app->get('/pois/', function() use ($app) {
	require './ws/pois.php';
	process_get_request($app);
});

// 
$app->get('/sc_runsets/', function() use ($app) {
	require './ws/sc_runsets.php';
	process_get_request($app);
});

//
$app->get('/sc_model_results/', function() use ($app) {
	require './ws/sc_model_results.php';
	process_get_request($app);
});

// add new available initial conditions
$app->post('/initial_condition_available/', function() use ($app) {
	require './ws/initial_condition_availability.php';
	process_post_request($app);
});

// --- a test

$app->get('/test/', function () use ($app) {
	require './ws/_test.php';
	//do_your_job($name);
});

// ------------------------------{ CALL }----------------------------- //

$app->run();

?>
