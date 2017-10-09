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
 * Class Fill
 * @package Kontti
 */
class Fill {
	private $uid;
	private $gas_level_id;
	private $fill_type;
	private $cyl_type;
	private $cyl_count;
	private $cyl_size;
	private $start_pressure;
	private $end_pressure;
	private $o2_start;
	private $o2_end;
	private $he_start;
	private $he_end;
	private $o2_vol;
	private $he_vol;

	private $db;

	/**
	 * Fill constructor.
	 * @param DB $db
	 * @param int $uid
	 * @param array $struct
	 */
	public function __construct(DB $db, int $uid, array $struct) {
		$this->db = $db;

		$this->uid = $uid;
		$this->gas_level_id = $this->getFillType($struct[0]);
		$this->fill_type = $struct[1];
		$this->cyl_type = intval($struct[2]);
		$this->cyl_count = intval($struct[3]);
		$this->cyl_size = floatval($struct[4]);
		$this->start_pressure = intval($struct[5]);
		$this->end_pressure = intval($struct[6]);
		$this->o2_start = intval($struct[7]);
		$this->o2_end = intval($struct[8]);
		$this->he_start = intval($struct[9]);
		$this->he_end = intval($struct[10]);
		$this->o2_vol = intval($struct[11]);
		$this->he_vol = intval($struct[12]);
	}

	private function getFillType(string $key): int {
		return $this->db->getFillIDFromKey($key);
	}
}