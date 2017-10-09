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

namespace Kontti;

include_once('DB.php');

/**
 * Class Audit
 * @package Kontti
 */
class Audit {
	private $db;

	/**
	 * Audit constructor.
	 *
	 * @param DB $db The database object
	 */
	public function __construct(DB $db) {
		$this->db = $db;
	}


	/**
	 * log: Add an audit log to the database
	 *
	 * @param integer $uid The uid of the user, -1 if not known
	 * @param string $type Good or bad? Identifier with a -ok or -fail suffix
	 * @param string $message The audit message itself detailing what has passed
	 */
	public function log($uid, $type, $message) {
		if ($this->db->getState()) {
			$this->db->addAudit($uid, $_SERVER['REMOTE_ADDR'], $type, $message);
		}
	}
}

?>