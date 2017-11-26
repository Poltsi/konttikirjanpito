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

include_once('../lib/init.php');
include_once('Kontti/DB.php');
include_once('Kontti/Audit.php');
include_once('Kontti/User.php');

header("Content-Type: application/json");
/* Default response is only plain ok */
$response[KEY_STATUS] = STATUS_OK;
// build a PHP variable from JSON sent using POST method
$data = json_decode(stripslashes(file_get_contents("php://input")), true);

$db = new \Kontti\DB('localhost', 5432, 'kontti', 'kontti', 'konttipassu');
$audit = new \Kontti\Audit($db);

if (array_key_exists('login', $data) &&
	array_key_exists('password', $data)) {

	if (!strlen(trim($data['login'])) || !strlen(trim($data['password']))) {
		$response[KEY_STATUS] = STATUS_NOK;
		$response[KEY_REASON] = 'Missing username or password';
		$audit->log(-1, 'login-fail', 'User did not provide username or password');
	} else {
		$user = new \Kontti\User($db);
		// Get the user uid and whether the account is enabled

		if (!$user->authenticate($data['login'], $data['password'])) {
			$response[KEY_STATUS] = STATUS_NOK;
			$response[KEY_REASON] = 'Username or password incorrect';
			$audit->log(-1, 'login-fail', 'Login failed for user: ' . $data['login']);
		} else {
			session_start();
			$_SESSION['last_time'] = time();
			$_SESSION['login_time'] = time();
			$_SESSION['uid'] = $user->getUid();
			$_SESSION['gid'] = $user->getGid();
			$_SESSION['level'] = $user->getLevel();
			$_SESSION['name'] = $user->getName();
			$_SESSION['enabled'] = $user->enabled() ? 1 : 0;
			// We will allow a locked user to log on, but the user will be unable to make any fills.
			$response['enabled'] = $_SESSION['enabled'];
			$response['level'] = $_SESSION['level'];
			$response['name'] = $_SESSION['name'];

			if (!$response['enabled']) {
				$response[KEY_REASON] = 'Account locked, you can only view your data';
				$audit->log($_SESSION['uid'], 'login-ok', 'Locked account for user: ' . $data['login']);
			} else {
				$audit->log($_SESSION['uid'], 'login-ok', 'Login succeeded for user: ' . $data['login']);
			}
		}
	}
} else {
	$response[KEY_STATUS] = STATUS_NOK;
	$response[KEY_REASON] = 'Missing credentials';
	$audit->log(-1, 'login-fail', 'No credentials were provided');
}

$db->close();
print(json_encode($response));