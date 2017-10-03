<?php
/**
 * Created by PhpStorm.
 * User: poltsi
 * Date: 10/3/17
 * Time: 8:16 PM
 */

session_start();

header("Content-Type: application/json");

$data = json_decode(stripslashes(file_get_contents("php://input")), true);
/* Default response is only plain ok */
$response['status'] = 'OK';

$db_conn = pg_connect("host=localhost port=5432 dbname=kontti user=kontti password=konttipassu");
$sql_string = "INSERT INTO audit VALUES (NOW(), $1 , $2, $3, $4)";
$result = pg_prepare($db_conn, 'audit', $sql_string);

/* Check first if we're admins */
if (!array_key_exists('uid', $_SESSION)) {
    pg_execute($db_conn, 'audit', array(-1, $_SERVER['REMOTE_ADDR'], 'admin-fail', 'Client tries to call admin functions without session'));
    $response['status'] = 'NOK';
    $response['reason'] = 'Session expired, please log in again with admin credentials';
} else {
    if (!array_key_exists('level', $_SESSION) &&
        $_SESSION['level'] <= 40) {
        pg_execute($db_conn, 'audit', array($_SESSION['uid'], $_SERVER['REMOTE_ADDR'], 'admin-fail', 'User tries to access admin functionality without proper permissions'));
        $response['status'] = 'NOK';
        $response['reason'] = 'You are not allowed to use these functions';
    } else {
        $response['status'] = 'OK';

        switch ($data['action']) {
            case 'get':
                pg_execute($db_conn, 'audit', array($_SESSION['uid'], $_SERVER['REMOTE_ADDR'], 'admin-ok', 'User will get data'));
                break;
            case 'set':
                pg_execute($db_conn, 'audit', array($_SESSION['uid'], $_SERVER['REMOTE_ADDR'], 'admin-ok', 'User will set data'));
                break;
            default:
                pg_execute($db_conn, 'audit', array($_SESSION['uid'], $_SERVER['REMOTE_ADDR'], 'admin-fail', 'User sent unknown action: ' . $data['action']));
                break;
        }
    }
}


print(json_encode($response));