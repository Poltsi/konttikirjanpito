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

include_once('Kontti/Admin.php');
include_once('Kontti/UserManipulator.php');

$admin = new \Kontti\Admin($db);

$data = json_decode(stripslashes(file_get_contents("php://input")), true);
/* Default response is only plain ok */
$response[KEY_STATUS] = STATUS_OK;

/* Check first if we're admins */
if (!array_key_exists('uid', $_SESSION)) {
	$audit->log(-1, 'admin-fail', 'Client tries to call admin functions without session');
	$response[KEY_STATUS] = STATUS_NOK;
	$response[KEY_REASON] = 'Session expired, please log in again with admin credentials';
} else {
	if (!array_key_exists('level', $_SESSION) ||
		$_SESSION['level'] <= 40) {
		$audit->log($_SESSION['uid'], 'admin-fail', 'User tries to access admin functionality without proper permissions');
		$response[KEY_STATUS] = STATUS_NOK;
		$response[KEY_REASON] = 'You are not allowed to use these functions';
	} else {
		switch ($data['object']) {
			case 'user':
				$audit->log($_SESSION['uid'], 'admin-ok', 'User wants to handle user');
				$userManipulator = new Kontti\UserManipulator($db, $data);
				$response['data'] = $userManipulator->action();

				if (count($response['data']) == 0) {
					$response[KEY_REASON] = 'No user data retrieved';
				}

				break;
			case 'self':
				$audit->log($_SESSION['uid'], 'admin-ok', 'User wants to handle self');
				// TODO: Implement manipulating self
				break;
			default:
				$audit->log($_SESSION['uid'], 'admin-fail', 'User sent unknown action: ' . $data['action']);
				break;
		}
	}
}

$db->close();
print(json_encode($response));
