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

class DBTest extends \PHPUnit\Framework\TestCase {
	/**
	 * @var DB
	 */
	protected $object;

	/**
	 * @covers Kontti\DB::getState
	 * @todo   Implement testGetState().
	 */
	public function testGetState() {
		// Remove the following lines when you implement this test.
		$this->markTestIncomplete(
			'This test has not been implemented yet.'
		);
	}

	/**
	 * @covers Kontti\DB::addAudit
	 * @todo   Implement testAddAudit().
	 */
	public function testAddAudit() {
		// Remove the following lines when you implement this test.
		$this->markTestIncomplete(
			'This test has not been implemented yet.'
		);
	}

	/**
	 * @covers Kontti\DB::authenticate
	 * @todo   Implement testAuthenticate().
	 */
	public function testAuthenticate() {
		// Remove the following lines when you implement this test.
		$this->markTestIncomplete(
			'This test has not been implemented yet.'
		);
	}

	/**
	 * @covers Kontti\DB::getUserDataByUID
	 * @todo   Implement testGetUserDataByUID().
	 */
	public function testGetUserDataByUID() {
		// Remove the following lines when you implement this test.
		$this->markTestIncomplete(
			'This test has not been implemented yet.'
		);
	}

	/**
	 * @covers Kontti\DB::getMinGasLevelAndID
	 * @todo   Implement testGetMinGasLevelAndID().
	 */
	public function testGetMinGasLevelAndID() {
		// Remove the following lines when you implement this test.
		$this->markTestIncomplete(
			'This test has not been implemented yet.'
		);
	}

	/**
	 * @covers Kontti\DB::addFill
	 * @todo   Implement testAddFill().
	 */
	public function testAddFill() {
		// Remove the following lines when you implement this test.
		$this->markTestIncomplete(
			'This test has not been implemented yet.'
		);
	}

	/**
	 * @covers Kontti\DB::getAllUserID
	 * @todo   Implement testGetAllUserID().
	 */
	public function testGetAllUserID() {
		// Remove the following lines when you implement this test.
		$this->markTestIncomplete(
			'This test has not been implemented yet.'
		);
	}

	/**
	 * @covers Kontti\DB::close
	 * @todo   Implement testClose().
	 */
	public function testClose() {
		// Remove the following lines when you implement this test.
		$this->markTestIncomplete(
			'This test has not been implemented yet.'
		);
	}

	/**
	 * @covers Kontti\DB::getGasPerUser
	 * @todo   Implement testGetGasPerUser().
	 */
	public function testGetGasPerUser() {
		// Remove the following lines when you implement this test.
		$this->markTestIncomplete(
			'This test has not been implemented yet.'
		);
	}

	/**
	 * @covers Kontti\DB::getUnpaidGasPerUser
	 * @todo   Implement testGetUnpaidGasPerUser().
	 */
	public function testGetUnpaidGasPerUser() {
		// Remove the following lines when you implement this test.
		$this->markTestIncomplete(
			'This test has not been implemented yet.'
		);
	}

	/**
	 * @covers Kontti\DB::getFillCountPerUser
	 * @todo   Implement testGetFillCountPerUser().
	 */
	public function testGetFillCountPerUser() {
		// Remove the following lines when you implement this test.
		$this->markTestIncomplete(
			'This test has not been implemented yet.'
		);
	}

	/**
	 * @covers Kontti\DB::getFillIDFromKey
	 * @todo   Implement testGetFillIDFromKey().
	 */
	public function testGetFillIDFromKey() {
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
		$this->object = new DB;
	}

	/**
	 * Tears down the fixture, for example, closes a network connection.
	 * This method is called after a test is executed.
	 */
	protected function tearDown() {
	}
}
