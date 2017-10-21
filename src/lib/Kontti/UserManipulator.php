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
include_once('UserList.php');

class UserManipulator {
	private $action = null;
	private $target = null;
	private $filter = null;
	private $dbcon = null;
	private $uid = null;

	/**
	 * UserManipulator constructor.
	 * @param DB $dbcon
	 * @param array $struct
	 */
	public function __construct(DB $dbcon, array $struct) {
		$this->dbcon = $dbcon;
		$this->action = $struct['action'];
		$this->target = $struct['target'];

		if (array_key_exists('filter', $struct)) {
			$this->filter = $struct['filter'];
		}

		if (array_key_exists('uid', $struct)) {
			$this->uid = $struct['uid'];
		}
	}

	public function action() {
		switch ($this->action) {
			case 'get':
				return $this->get();
				break;
			case 'set':
				break;
			case 'update':
				break;
			default:
				return false;
				break;
		}

		return true;
	}

	private function get() {
		$arr = array();

		if ($this->filter == null ||
			$this->filter['scope'] == '*') {
			foreach ($this->target as $target) {
				switch ($target) {
					case 'user_all':
						$list = new UserList($this->dbcon);
						$arr = $list->getUserListAsArray();
						break;
					case 'gas_total':
						$arr = $this->getGasTotal($arr);
						break;
					case 'gas_unpaid_l':
						$arr = $this->getGasUnpaidVolume($arr);
						break;
					case 'unpaid_fills':
						$arr = $this->getGasUnpaidFill();
						break;
					case 'fill_total':
						$arr = $this->getFillCountTotal($arr);
						break;
				}
			}
		}

		return $arr;
	}

	private function getGasTotal(array $arr): array {
		for ($i = 0; $i < count($arr); $i++) {
			$arr[$i]['total_o2'] = $this->dbcon->getGasPerUser($arr[$i]['uid'], 'o2');
			$arr[$i]['total_he'] = $this->dbcon->getGasPerUser($arr[$i]['uid'], 'he');
		}

		return $arr;
	}

	private function getGasUnpaidVolume(array $arr): array {
		for ($i = 0; $i < count($arr); $i++) {
			$arr[$i]['unpaid_o2'] = $this->dbcon->getUnpaidGasPerUser($arr[$i]['uid'], 'o2');
			$arr[$i]['unpaid_he'] = $this->dbcon->getUnpaidGasPerUser($arr[$i]['uid'], 'he');
		}

		return $arr;
	}

	private function getFillCountTotal(array $arr): array {
		for ($i = 0; $i < count($arr); $i++) {
			$arr[$i]['count_air'] = $this->dbcon->getFillCountPerUser($arr[$i]['uid'], 'air');
			$arr[$i]['count_nx'] = $this->dbcon->getFillCountPerUser($arr[$i]['uid'], 'nx');
			$arr[$i]['count_o2'] = $this->dbcon->getFillCountPerUser($arr[$i]['uid'], 'o2');
			$arr[$i]['count_tx'] = $this->dbcon->getFillCountPerUser($arr[$i]['uid'], 'tx');
		}

		return $arr;
	}

	private function getGasUnpaidFill(): array {
		return array('uid' => $this->uid, 'fills' => $this->dbcon->get_unused_fill_by_user($this->uid));
	}
}