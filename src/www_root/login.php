<?php
/**
 * Created by PhpStorm.
 * User: poltsi
 * Date: 9/25/17
 * Time: 8:51 PM
 */

header("Content-Type: application/json");
/* Default response is only plain ok */
$response['status'] = 'OK';
// build a PHP variable from JSON sent using POST method
$data = json_decode(stripslashes(file_get_contents("php://input")), true);

$db_conn = pg_connect("host=localhost port=5432 dbname=kontti user=kontti password=konttipassu");

// Get the user uid and whether the account is enabled

$sql_string = "SELECT uid, enabled FROM users WHERE login = $1 AND password = crypt($2, salt)";
$result = pg_prepare($db_conn, 'login', $sql_string);
// Get the result set
$result = pg_execute($db_conn, 'login', array($data['login'], $data['password']));

if (!$result) {
	$response['status'] = 'NOK';
	$response['reason'] = 'Username or password incorrect';
}

// Check that the user is not locked
$rs_array = pg_fetch_row($result);

if ($rs_array[1] === 'FALSE') {
	$response['status'] = 'NOK';
	$response['reason'] = 'Account locked, please contact the operator';
}

// TODO: Add the id to the server-side session

pg_close($db_conn);

print(json_encode($response));