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

class User {
	private $user_uid;
	private $user_gid;
	private $user_login;
	private $user_level;
	private $user_name;
	private $user_enabled;
	private $user_authenticated;
	private $dbcon;

	/* TODO: Get this from database and make into an object */
	private $auth_level = array(
		'air' => 10,
		'nx' => 20,
		'o2' => 30,
		'tx' => 40,
		'admin' => 60);

	/**
	 * User constructor.
	 * @param DB $dbcon
	 */
	public function __construct(DB $dbcon) {
		$this->dbcon = $dbcon;
	}

	/**
	 * @param string $user_login
	 */
	public function setUserLogin($user_login) {
		$this->user_login = $user_login;
	}

	public function authenticate($login, $password): bool {
		$user_data = $this->dbcon->authenticate($login, $password);

		if (!count($user_data)) {
			$this->user_authenticated = false;
			return false;
		} else {
			$this->user_login = $login;
			$this->user_uid = $user_data[0];
			$this->user_gid = $user_data[1];
			$this->user_level = $user_data[2];
			$this->user_name = $user_data[3];
			$this->user_enabled = $user_data[4] === 'f' ? 0 : 1;
			$this->user_authenticated = true;
		}

		return $this->user_authenticated;
	}

	public function getDataFromDB(): bool {
		$user_data = $this->dbcon->getUserDataByUID($this->user_uid);

		if (!count($user_data)) {
			return false;
		} else {
			$this->user_uid = $user_data[0];
			$this->user_gid = $user_data[1];
			$this->user_login = $user_data[2];
			$this->user_level = $user_data[3];
			$this->user_name = $user_data[4];
			$this->user_enabled = $user_data[5] === 'f' ? 0 : 1;
		}

		return true;
	}

	/**
	 * @return boolean
	 */
	public function getUserAuthenticated(): bool {
		return $this->user_authenticated;
	}

	/**
	 * @param mixed $user_uid
	 */
	public function setUid(int $user_uid): void {
		$this->user_uid = $user_uid;
	}

	/**
	 * @return int
	 */
	public function getUid(): int {
		return $this->user_uid;
	}

	/**
	 * @return int
	 */
	public function getGid(): int {
		return $this->user_gid;
	}

	/**
	 * @return string
	 */
	public function getLogin(): string {
		return $this->user_login;
	}

	/**
	 * @return int
	 */
	public function getLevel(): int {
		return $this->user_level;
	}

	/**
	 * @return string
	 */
	public function getName(): string {
		return $this->user_name;
	}

	/**
	 * @return bool
	 */
	public function enabled(): bool {
		return $this->user_enabled;
	}


	/**
	 * @param string $fill_type
	 * @return bool
	 */
	public function hasPermission($fill_type): bool {
		return ($this->user_level >= $this->auth_level[$fill_type]);
	}
}