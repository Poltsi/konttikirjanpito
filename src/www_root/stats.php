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

include_once('../lib/init.php');
include_once('Kontti/Audit.php');
include_once('Kontti/DB.php');
include_once('Kontti/Stats.php');

$data = json_decode(stripslashes(file_get_contents("php://input")), true);
/* Default response is only plain ok */
$response = array();
$response[KEY_STATUS] = STATUS_OK;

$db = new \Kontti\DB('localhost', 5432, 'kontti', 'kontti', 'konttipassu');

$audit = new \Kontti\Audit($db);
$stats = new \Kontti\Stats($db);

/* Check first if we're admins */
if (!array_key_exists('uid', $_SESSION)) {
	$audit->log(-1, 'stats-fail', 'Client tries to call stats functions without session');
	$response[KEY_STATUS] = STATUS_NOK;
	$response[KEY_REASON] = 'Session expired, please log in again with user credentials';
} else {
	$response[KEY_STATUS] = STATUS_OK;

	switch ($data['object']) {
		case 'self':
			$audit->log($_SESSION['uid'], 'stats-ok', 'User wants to view own data');
			$response['data'] = $stats->getUserStats($_SESSION['uid']);
			// TODO: Implement retrieving own stats
			break;
		case 'user':
			if (!array_key_exists('level', $_SESSION) ||
				$_SESSION['level'] <= 40) {
				$audit->log($_SESSION['uid'], 'stats-fail', 'User tries to access admin functionality without proper permissions');
				$response[KEY_STATUS] = STATUS_NOK;
				$response[KEY_REASON] = 'You are not allowed to use these functions';
			} else {
				$audit->log($_SESSION['uid'], 'stats-ok', 'User wants to view user stats');
				// TODO: Implement retrieving user stats
				$response['data'] = $stats->getUserStats($data['uid']);
			}
			break;
		case 'generic':
			$audit->log($_SESSION['uid'], 'stats-ok', 'User wants to view generic stats');
			// TODO: Implement retrieving generic stats
			$response['data'] = $stats->getGenericStats();
			break;
		default:
			$audit->log($_SESSION['uid'], 'stats-fail', 'User sent unknown object: ' . $data['object']);
			break;
	}
}

$db->close();
print(json_encode($response));