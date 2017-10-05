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
 * Date: 9/22/17
 * Time: 6:36 PM
 */

include_once('../lib/Kontti/Audit.php');

session_start();
header("Content-Type: application/json");
/* Default response is only plain ok */
$response['status'] = 'OK';
// build a PHP variable from JSON sent using POST method
$data = json_decode(stripslashes(file_get_contents("php://input")), true);
$db_conn = pg_connect("host=localhost port=5432 dbname=kontti user=kontti password=konttipassu");

$audit = new \Kontti\Audit\Audit($db_conn, 'audit');

// Check the user uid
if (!array_key_exists('uid', $_SESSION)) {
    $audit->log(-1,'session-fail', 'Client tries to add fill without session');
    $response['status'] = 'NOK';
    $response['reason'] = 'User session has expired';
} else {
    // Check that the user is not locked
    if (!array_key_exists('enabled', $_SESSION) ||
        $_SESSION['enabled'] == 0) {
        $audit->log($_SESSION['uid'], 'session-fail', 'User is locked');
        $response['status'] = 'NOK';
        $response['reason'] = 'User account is locked';
    } else {
        $sql_string = "SELECT min_fill_level, gas_id FROM gas_level WHERE gas_key = $1";
        $result = pg_prepare($db_conn, 'getgasid', $sql_string);

        $i = 0;

        $sql_string = 'INSERT INTO fills (uid, fill_datetime, gas_level_id, fill_type, cyl_type, cyl_count, cyl_size, start_pressure, end_pressure, o2_start, o2_end, he_start, he_end, o2_vol, he_vol, counted) ' .
            'VALUES ($1, now(), $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, false)';
        $result = pg_prepare($db_conn, 'addfill', $sql_string);
        $sql_parts = array();

        while (array_key_exists($i, $data)) {
            // Get the min fill_level and gas_level_id for the given fill
            $result = pg_execute($db_conn, 'getgasid', array($data[$i][0]));
            $rs_array = pg_fetch_row($result);

            // TODO: Check that the user is allowed to do the fill
            if ($rs_array[1] > $_SESSION['level']) {
                $response['status'] = 'NOK';
                $response['reason'] .= $data[$i][0] . ' fill was rejected as user is not permitted to do such fill';
                $audit->log($_SESSION['uid'], 'fill-fail', 'User attempted to submit a fill above his permission');
            } else {
                $result = pg_execute($db_conn, 'addfill',
                    array($_SESSION['uid'], $rs_array[1], $data[$i][1], $data[$i][2], intval($data[$i][3]), floatval($data[$i][4]), intval($data[$i][5]), intval($data[$i][6]), intval($data[$i][7]), intval($data[$i][8]), intval($data[$i][9]), intval($data[$i][10]), intval($data[$i][11]), intval($data[$i][12])));
                $audit->log($_SESSION['uid'], 'fill-ok', 'User added a ' . $data[$i][2] . ' fill');
                // TODO: Check whether the insert worked
            }

            $i++;
        }
    }
}

pg_close($db_conn);
// print_r($response);
print(json_encode($response));