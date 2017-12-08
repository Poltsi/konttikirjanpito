<?php

// Set the PHP-library path to where the init file is first
set_include_path(dirname(__FILE__) . PATH_SEPARATOR . get_include_path());

session_start();


// Include the constants
include_once('constants.php');

include_once('Kontti/Audit.php');
include_once('Kontti/DB.php');

// TODO: This should use some configuration file values
$db = new \Kontti\DB('localhost', 5432, 'kontti', 'kontti', 'konttipassu');
$audit = new \Kontti\Audit($db);

