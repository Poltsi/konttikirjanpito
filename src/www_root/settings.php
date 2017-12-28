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

include_once('../lib/init.php');
include_once('Kontti/User.php');

header("Content-Type: application/json");
/* Default response is only plain ok */
$response[KEY_STATUS] = STATUS_OK;
// build a PHP variable from JSON sent using POST method
$data = json_decode(stripslashes(file_get_contents("php://input")), true);

// Check the user uid
if (!array_key_exists('uid', $_SESSION)) {
	$audit->log(-1, 'session-fail', 'Client tries to add fill without a session');
	$response[KEY_STATUS] = STATUS_NOK;
	$response[KEY_REASON] = 'User session has expired';
} else {
	$user = new \Kontti\User($db);
	$user->setUid($_SESSION['uid']);

	if (!$user->getDataFromDB()) {
		$response[KEY_STATUS] = STATUS_NOK;
		$response[KEY_REASON] = 'Failed to retrieve user data';
	} else {
		switch ($data['action']) {
			case 'get':
				$response['data'] = $user->getSettings();
				break;
			case 'set':
				if ($user->setSettings($data['data'], $response)) {
					$response[KEY_REASON] = 'Stored user information';
				} else {
					$response[KEY_STATUS] = STATUS_NOK;
					$response[KEY_REASON] = 'Failed to store user information';
				}
				break;
		}
	}
}

$db->close();
print(json_encode($response));