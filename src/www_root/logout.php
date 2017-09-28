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

/**
 * Created by PhpStorm.
 * User: poltsi
 * Date: 9/25/17
 * Time: 8:51 PM
 */
session_start();

header("Content-Type: application/json");
/* Default response is only plain ok */
$response['status'] = 'OK';
// build a PHP variable from JSON sent using POST method
$data = json_decode(stripslashes(file_get_contents("php://input")), true);
$db_conn = pg_connect("host=localhost port=5432 dbname=kontti user=kontti password=konttipassu");
$sql_string = "INSERT INTO audit VALUES (NOW(), $1 , $2, $3, $4)";
$result = pg_prepare($db_conn, 'audit', $sql_string);

if (array_key_exists('type', $data) &&
    $data['type'] == 'logout') {
    if (isset($_SESSION) &&
        array_key_exists('uid', $_SESSION)) {
        $result = pg_execute($db_conn, 'audit', array($_SESSION['uid'], $_SERVER['REMOTE_ADDR'], 'logout-ok', 'User logged out successfully'));
        session_destroy();
    } else {
        $result = pg_execute($db_conn, 'audit', array(-1, $_SERVER['REMOTE_ADDR'], 'logout-failed', 'No session data found'));
    }
} else {
    $response['reason'] = 'Missing action';
    $result = pg_execute($db_conn, 'audit', array(-1, $_SERVER['REMOTE_ADDR'], 'logout-failed', 'Request had no type defined, or it was not logout'));
}

pg_close($db_conn);
print(json_encode($response));