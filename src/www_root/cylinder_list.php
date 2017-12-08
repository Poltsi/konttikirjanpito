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

header("Content-Type: application/json");

include_once('../lib/init.php');

$data = json_decode(stripslashes(file_get_contents("php://input")), true);
/* Default response is only plain ok */
$response[KEY_STATUS] = STATUS_OK;

/* Check first if we're logged in */
if (!array_key_exists('uid', $_SESSION)) {
	$audit->log(-1, 'cylinder_list-fail', 'Client tries to call functions without session');
	$response[KEY_STATUS] = STATUS_NOK;
	$response[KEY_REASON] = 'Session expired, please log in again';
} else {
	switch ($data['object']) {
		case 'user':
			$audit->log($_SESSION['uid'], 'cylinder_list-ok', 'Fetching cylinders for user: ' .  $_SESSION['uid']);
			$response['data'] = $db->get_user_cylinders($_SESSION['uid']);
			break;
		case 'all':
			$audit->log($_SESSION['uid'], 'cylinder_list-ok', 'Fetching all cylinders');
			$response['data'] = $db->get_all_cylinders($_SESSION['uid']);
			break;
		default:
			$audit->log($_SESSION['uid'], 'cylinder_list-fail', 'Unknown object');
			$response[KEY_STATUS] = STATUS_NOK;
			$response[KEY_REASON] = 'Unknown object defined';
	}
}

$db->close();
print(json_encode($response));