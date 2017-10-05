<?php
/**
 * Copyright (c) Paul-Erik Törrönen 2017.
 *  This program is free software; you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation version 2 of the License and provided
 *  that the above copyright and permission notice is included with all
 *  distributed copies of this or derived software.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 */

include_once('../lib/Kontti/Audit.php');

header("Content-Type: application/json");
/* Default response is only plain ok */
$response['status'] = 'OK';
// build a PHP variable from JSON sent using POST method
$data = json_decode(stripslashes(file_get_contents("php://input")), true);

$db_conn = pg_connect("host=localhost port=5432 dbname=kontti user=kontti password=konttipassu");
$audit = new \Kontti\Audit\Audit($db_conn, 'audit');

if (array_key_exists('login', $data) &&
    array_key_exists('password', $data)) {

    if (!strlen(trim($data['login'])) ||!strlen(trim($data['password']))) {
        $response['status'] = 'NOK';
        $response['reason'] = 'Missing username or password';
        $audit->log(-1,'login-fail', 'User did not provide username or password');
    } else {
        // Get the user uid and whether the account is enabled

        $sql_string = "SELECT uid, enabled, level FROM users WHERE login = $1 AND password = crypt($2, salt)";
        $result = pg_prepare($db_conn, 'login', $sql_string);
        // Get the result set
        $result = pg_execute($db_conn, 'login', array($data['login'], $data['password']));

        if (!$result) {
            $response['status'] = 'NOK';
            $response['reason'] = 'Username or password incorrect';
            $audit->log(-1,'login-fail', 'Login failed for user: ' . $data['login']);
        }

        // Check whether the user has a locked account. We will allow him to log on, but will be unable to make any fills.
        $rs_array = pg_fetch_row($result);
        $response['enabled'] = $rs_array[1] === 'f' ? 0: 1;
        $response['level'] = $rs_array[2];
        session_start();
        $_SESSION['last_time'] = time();
        $_SESSION['uid'] = $rs_array[0];
        $_SESSION['login_time'] = time();
        $_SESSION['enabled'] = $rs_array[1] === 'f' ? 0: 1;
        $_SESSION['level'] = $rs_array[2];

        if ($rs_array[1] === 'f') {
            $response['reason'] = 'Account locked, you can only view your data';
            $audit->log($_SESSION['uid'], 'login-ok', 'Locked account for user: ' . $data['login']);
        } else {
            $audit->log($_SESSION['uid'], 'login-ok', 'Login succeeded for user: ' . $data['login']);
        }
    }
} else {
    $response['status'] = 'NOK';
    $response['reason'] = 'Missing credentials';
    $audit->log(-1,'login-fail', 'No credentials were provided');
}

pg_close($db_conn);
print(json_encode($response));