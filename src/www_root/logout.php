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

include_once('../lib/constants.php');
include_once('../lib/Kontti/DB.php');
include_once('../lib/Kontti/Audit.php');

session_start();

header("Content-Type: application/json");
/* Default response is only plain ok */
$response[KEY_STATUS] = STATUS_OK;
// build a PHP variable from JSON sent using POST method
$data = json_decode(stripslashes(file_get_contents("php://input")), true);
$db = new \Kontti\DB('localhost', 5432, 'kontti', 'kontti', 'konttipassu');
$audit = new \Kontti\Audit($db);

if (array_key_exists('type', $data) &&
	$data['type'] == 'logout') {
	if (isset($_SESSION) &&
		array_key_exists('uid', $_SESSION)) {
		$audit->log($_SESSION['uid'], 'logout-ok', 'User logged out successfully');
		session_destroy();
	} else {
		$response[KEY_STATUS] = STATUS_NOK;
		$audit->log(-1, 'logout-fail', 'No session data found');
	}
} else {
	$response[KEY_REASON] = 'Missing action';
	$audit->log(-1, 'logout-fail', 'Request had no type defined, or it was not logout');
}

$db->close();
print(json_encode($response));