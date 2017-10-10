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
include_once('/usr/share/php/PHPUnit6/autoload.php');
include_once('db_init.php');
include_once('../src/lib/Kontti/UserManipulator.php');

class UserManipulatorTest extends \PHPUnit\Framework\TestCase {
	/**
	 * @var UserManipulator
	 */
	protected $object;
	protected $db;
	protected $struct = array();

	/**
	 * @covers Kontti\UserManipulator::action
	 * @todo   Implement testAction().
	 */
	public function testAction() {
		// Remove the following lines when you implement this test.
		$this->markTestIncomplete(
			'This test has not been implemented yet.'
		);
	}

	/**
	 * Sets up the fixture, for example, opens a network connection.
	 * This method is called before a test is executed.
	 */
	protected function setUp() {
		$this->db = get_for_test_DB();
		$this->object = new UserManipulator($this->db, $this->struct);
	}

	/**
	 * Tears down the fixture, for example, closes a network connection.
	 * This method is called after a test is executed.
	 */
	protected function tearDown() {
		$this->db->close();
	}
}
