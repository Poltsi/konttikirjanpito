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
include_once('PHPUnit6/autoload.php');
include_once('db_init.php');
include_once('Kontti/Fill.php');

class FillTest extends \PHPUnit\Framework\TestCase {
	/**
	 * @var Fill
	 */
	protected $object;
	protected $db;
	protected $fill_arr = array();
	protected $uid = 50000;

	/**
	 * Sets up the fixture, for example, opens a network connection.
	 * This method is called before a test is executed.
	 */
	protected function setUp() {
		$this->db = get_for_test_DB();
		$this->object = new Fill($this->db, $this->uid, $this->fill_arr);
	}

	/**
	 * Tears down the fixture, for example, closes a network connection.
	 * This method is called after a test is executed.
	 */
	protected function tearDown() {
		$this->db->close();
	}
}
