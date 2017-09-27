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
$sql_string = "INSERT INTO audit VALUES (NOW(), $1 , $2, $3, $4)";
$result = pg_prepare($db_conn, 'audit', $sql_string);

if (array_key_exists('login', $data) &&
    array_key_exists('password', $data)) {
    // Get the user uid and whether the account is enabled

    $sql_string = "SELECT uid, enabled, level FROM users WHERE login = $1 AND password = crypt($2, salt)";
    $result = pg_prepare($db_conn, 'login', $sql_string);
// Get the result set
    $result = pg_execute($db_conn, 'login', array($data['login'], $data['password']));

    if (!$result) {
        $response['status'] = 'NOK';
        $response['reason'] = 'Username or password incorrect';
        pg_execute($db_conn, 'audit', array(-1, $_SERVER['REMOTE_ADDR'], 'login-fail', 'Login failed for user: ' . $data['login']));
    }

// Check that the user is not locked
    $rs_array = pg_fetch_row($result);

    if ($rs_array[1] === 'FALSE') {
        $response['status'] = 'NOK';
        $response['reason'] = 'Account locked, please contact the operator';
        pg_execute($db_conn, 'audit', array(-1, $_SERVER['REMOTE_ADDR'], 'login-fail', 'Locked account for user: ' . $data['login']));
    } else {
        session_start();
        $_SESSION['uid'] = $rs_array[0];
        $_SESSION['login_time'] = time();
        $_SESSION['locked'] = $rs_array[1];
        $_SESSION['level'] = $rs_array[2];
        $_SESSION['last_time'] = time();
        pg_execute($db_conn, 'audit', array($_SESSION['uid'], $_SERVER['REMOTE_ADDR'], 'login-ok', 'Login succeeded for user: ' . $data['login']));
    }

} else {
    $response['status'] = 'NOK';
    $response['reason'] = 'Missing credentials';
    pg_execute($db_conn, 'audit', array(-1, $_SERVER['REMOTE_ADDR'], 'login-fail', 'No credentials were provided'));
}

pg_close($db_conn);
print(json_encode($response));