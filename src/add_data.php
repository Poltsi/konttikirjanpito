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

header("Content-Type: application/json");
/* Default response is only plain ok */
$response['status'] = 'OK';
// build a PHP variable from JSON sent using POST method
$data = json_decode(stripslashes(file_get_contents("php://input")));
$db_conn = pg_connect("host=localhost port=5432 dbname=kontti user=kontti password=konttipassu");

// TODO: Get the user uid
// TODO: Check that the user is not locked

$i = 0;

$sql_string = 'INSERT INTO fills (uid, fill_datetime, gas_type, fill_type, cyl_type, cyl_count, cyl_size, start_pressure, end_pressure, o2_start, o2_end, he_start, he_end, o2_vol, he_vol, counted) VALUES ';
$sql_parts = array();

while (array_key_exists($i, $data)) {
    $sql_parts[] = "(1, " .
            "now(), " .
            "'" . pg_escape_string( $db_conn, $data[$i][0]) . "'," .
            "'" . pg_escape_string( $db_conn, $data[$i][1]) . "'," .
            "'" . pg_escape_string( $db_conn, $data[$i][2]) . "', " .
            intval($data[$i][3]) . ", " .
            floatval($data[$i][4]) . ", " .
            intval($data[$i][5]) . ", " .
            intval($data[$i][6]) . ", " .
            intval($data[$i][7]) . ", " .
            intval($data[$i][8]) . ", " .
            intval($data[$i][9]) . ", " .
            intval($data[$i][10]) . ", " .
            intval($data[$i][11]) . ", " .
            intval($data[$i][12]) . ", false)";
    $i++;
}

$sql_string .= implode(',', $sql_parts);

pg_query($db_conn, $sql_string);
pg_close($db_conn);
// print_r($response);
print(json_encode($response));