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

session_start();
header("Content-Type: application/json");
/* Default response is only plain ok */
$response[KEY_STATUS] = STATUS_OK;
// build a PHP variable from JSON sent using POST method
$data = json_decode(stripslashes(file_get_contents("php://input")), true);

$db = new \Kontti\DB('localhost', 5432, 'kontti', 'kontti', 'konttipassu');
$audit = new \Kontti\Audit($db);

// Check the user uid
if (!array_key_exists('uid', $_SESSION)) {
	$audit->log(-1, 'session-fail', 'Client tries to add fill without a session');
	$response[KEY_STATUS] = STATUS_NOK;
	$response[KEY_REASON] = 'User session has expired';
} else {
	// Check that the user is not locked
	if (!array_key_exists('enabled', $_SESSION) ||
		!$_SESSION['enabled']) {
		$audit->log($_SESSION['uid'], 'session-fail', 'User is locked');
		$response[KEY_STATUS] = STATUS_NOK;
		$response[KEY_REASON] = 'User account is locked';
	} else {
		$i = 0;

		while (array_key_exists($i, $data)) {
			// Check that the user is allowed to do the fill
			$fill_level = $db->getMinGasLevelAndID($data[$i][0]);

			if ($fill_level[0] > $_SESSION['level']) {
				$response[KEY_STATUS] = STATUS_NOK;
				$response[KEY_REASON] .= $data[$i][0] . ' fill was rejected as user is not permitted to do such fill';
				$audit->log($_SESSION['uid'], 'fill-fail', 'User attempted to submit a fill above his permission');
			} else {
				if ($db->addFill($_SESSION['uid'], $fill_level[1], $data[$i][1], $data[$i][2], intval($data[$i][3]),
					floatval($data[$i][4]), intval($data[$i][5]), intval($data[$i][6]),
					intval($data[$i][7]), intval($data[$i][8]), intval($data[$i][9]),
					intval($data[$i][10]), intval($data[$i][11]), intval($data[$i][12]))) {
					$audit->log($_SESSION['uid'], 'fill-ok', 'User added a ' . $data[$i][2] . ' fill');
				} else {
					$audit->log($_SESSION['uid'], 'fill-fail', 'User failed to add a ' . $data[$i][2] . ' fill');
				}
			}

			$i++;
		}
	}
}

$db->close();
print(json_encode($response));