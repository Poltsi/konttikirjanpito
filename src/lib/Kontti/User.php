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
	private $new_password;
	private $old_password;
	private $user_level;
	private $user_name;
	private $user_enabled;
	private $user_authenticated;
	private $dbcon;

	private $cylinders;
	private $certificates;
	private $certificate_org;

	/* TODO: Get this from database and make into an object */
	private $auth_level = array(
		'air'   => 10,
		'nx'    => 20,
		'o2'    => 30,
		'tx'    => 40,
		'admin' => 60);

	/**
	 * User constructor.
	 * @param DB $dbcon
	 */
	public function __construct(DB $dbcon) {
		$this->dbcon = $dbcon;
		$this->cylinders = array();
		$this->certificates = array();
		$this->certificate_org = array();
		$this->new_password = '';
		$this->old_password = '';
	}

	/**
	 * @param string $user_login
	 */
	public function setUserLogin($user_login) {
		$this->user_login = $user_login;
	}

	public function authenticate($login, $password): bool {
		$user_data = $this->dbcon->authenticate($login, $password);

		if (($user_data == NULL) || !count($user_data)) {
			$this->user_authenticated = false;
			return false;
		} else {
			$this->user_login = $login;
			$this->old_password = $password;
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

		$this->cylinders = $this->dbcon->get_user_cylinders($this->user_uid);
		$this->certificates = $this->dbcon->get_user_certificates($this->user_uid);
		$this->certificate_org = $this->dbcon->get_certificate_organization();
		return true;
	}

	private function save(): bool {
		$retval = false;

		if ($retval = $this->dbcon->update_user_settings(
			$this->user_uid,
			$this->user_level,
			$this->user_name,
			$this->user_enabled)) {
			if ($this->new_password != $this->old_password &&
				$this->new_password != '') {
				$retval = $this->dbcon->update_user_password($this->user_uid, $this->new_password);
			}
		}

		return $retval;
	}

	public function getSettings(): array {
		$arr = array();
		$arr['personal']['gid'] = $this->user_gid;
		$arr['personal']['level'] = $this->user_level;
		$arr['personal']['login'] = $this->user_login;
		$arr['personal']['name'] = $this->user_name;
		$arr['personal']['enabled'] = $this->user_enabled;

		$arr['cylinders'] = $this->cylinders;
		$arr['certificates'] = $this->certificates;
		$arr['certificate_org'] = $this->certificate_org;

		return $arr;
	}

	public function setSettings(array $settings, $response): bool {
		$response['data'] = array();
		$response['data']['updated_fields'] = array();

		foreach ($settings as $key => $value) {
			switch ($key) {
				case 'level':
					$this->user_level = $value;
					$response['data']['updated_fields'][] = $key;
					break;
				case 'enabled':
					$this->user_enabled = $value;
					$response['data']['updated_fields'][] = $key;
					break;
				case 'name':
					$this->user_name =  $value;
					$response['data']['updated_fields'][] = $key;
					break;
				case 'login':
					$this->user_login = $value;
					$response['data']['updated_fields'][] = $key;
					break;
				case 'password':
					if (!$this->dbcon->authenticate($this->user_login, $settings['old_password'])) {return false;}
					$this->new_password =  $value;
					$response['data']['updated_fields'][] = $key;
					break;
			}
		}

		return $this->save();
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