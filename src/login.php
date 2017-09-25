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
$data = json_decode(stripslashes(file_get_contents("php://input")));
$db_conn = pg_connect("host=localhost port=5432 dbname=kontti user=kontti password=konttipassu");

// TODO: Get the user uid
// TODO: Check that the user is not locked

$sql_string = "SELECT uid FROM users WHERE login = '" . pg_escape_string( $db_conn, $data['login']) .
            "' AND password = password = crypt('" . pg_escape_string( $db_conn, $data['password']) . "'";

pg_query($db_conn, $sql_string);

// TODO: Get the result set
pg_close($db_conn);
print(json_encode($response));