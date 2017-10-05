<?php
/**
 * Copyright (c) Paul-Erik Törrönen 2017.
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation version 2 of the License and provided
 * that the above copyright and permission notice is included with all
 * distributed copies of this or derived software.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 */

session_start();

header("Content-Type: application/json");

include_once('../lib/Kontti/Audit.php');
include_once('../lib/Kontti/Admin.php');

$data = json_decode(stripslashes(file_get_contents("php://input")), true);
/* Default response is only plain ok */
$response['status'] = 'OK';

$db_conn = pg_connect("host=localhost port=5432 dbname=kontti user=kontti password=konttipassu");

$audit = new \Kontti\Audit\Audit($db_conn, 'audit');
$admin = new \Kontti\Admin\Admin($db_conn, $audit, $data);

/* Check first if we're admins */
if (!array_key_exists('uid', $_SESSION)) {
    $audit->log(-1,'admin-fail', 'Client tries to call admin functions without session');
    $response['status'] = 'NOK';
    $response['reason'] = 'Session expired, please log in again with admin credentials';
} else {
    if (!array_key_exists('level', $_SESSION) &&
        $_SESSION['level'] <= 40) {
        $audit->log($_SESSION['uid'], 'admin-fail', 'User tries to access admin functionality without proper permissions');
        $response['status'] = 'NOK';
        $response['reason'] = 'You are not allowed to use these functions';
    } else {
        $response['status'] = 'OK';

        switch ($data['action']) {
            case 'get':
                $audit->log($_SESSION['uid'], 'admin-ok', 'User will get data');
                break;
            case 'set':
                $audit->log($_SESSION['uid'], 'admin-ok', 'User will set data');
                break;
            default:
                $audit->log($_SESSION['uid'], 'admin-fail', 'User sent unknown action: ' . $data['action']);
                break;
        }
    }
}

pg_close($db_conn);

print(json_encode($response));