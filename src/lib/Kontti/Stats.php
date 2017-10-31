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

class Stats {
	private $db;

	/**
	 * Stats constructor.
	 * @param $db
	 */
	public function __construct(DB $db) {
		$this->db = $db;
	}

	public function getUserStats(int $uid): array {
		$arr = array();
		$arr['fill_type'] = $this->db->getFillTypeCountByUser($uid);
		$arr['gas_type'] = $this->db->getGasTypeCountByUser($uid);
		$arr['gas_volume'] = $this->db->getGasVolumeByUser($uid);
		$arr['cyl_type'] = $this->db->getCylTypeByUser($uid);
		return $arr;
	}

	public function getGenericStats(): array {
		$arr = array();
		$arr['fill_type'] = $this->db->getFillTypeCountGeneric();
		$arr['gas_type'] = $this->db->getGasTypeCountGeneric();
		$arr['gas_volume'] = $this->db->getGasVolumeGeneric();
		$arr['cyl_type'] = $this->db->getCylTypeGeneric();
		return $arr;
	}
}