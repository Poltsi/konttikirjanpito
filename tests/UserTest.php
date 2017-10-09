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

class UserTest extends \PHPUnit\Framework\TestCase {
	/**
	 * @var User
	 */
	protected $object;

	/**
	 * @covers Kontti\User::setUserLogin
	 * @todo   Implement testSetUserLogin().
	 */
	public function testSetUserLogin() {
		// Remove the following lines when you implement this test.
		$this->markTestIncomplete(
			'This test has not been implemented yet.'
		);
	}

	/**
	 * @covers Kontti\User::authenticate
	 * @todo   Implement testAuthenticate().
	 */
	public function testAuthenticate() {
		// Remove the following lines when you implement this test.
		$this->markTestIncomplete(
			'This test has not been implemented yet.'
		);
	}

	/**
	 * @covers Kontti\User::getDataFromDB
	 * @todo   Implement testGetDataFromDB().
	 */
	public function testGetDataFromDB() {
		// Remove the following lines when you implement this test.
		$this->markTestIncomplete(
			'This test has not been implemented yet.'
		);
	}

	/**
	 * @covers Kontti\User::getUserAuthenticated
	 * @todo   Implement testGetUserAuthenticated().
	 */
	public function testGetUserAuthenticated() {
		// Remove the following lines when you implement this test.
		$this->markTestIncomplete(
			'This test has not been implemented yet.'
		);
	}

	/**
	 * @covers Kontti\User::setUid
	 * @todo   Implement testSetUid().
	 */
	public function testSetUid() {
		// Remove the following lines when you implement this test.
		$this->markTestIncomplete(
			'This test has not been implemented yet.'
		);
	}

	/**
	 * @covers Kontti\User::getUid
	 * @todo   Implement testGetUid().
	 */
	public function testGetUid() {
		// Remove the following lines when you implement this test.
		$this->markTestIncomplete(
			'This test has not been implemented yet.'
		);
	}

	/**
	 * @covers Kontti\User::getGid
	 * @todo   Implement testGetGid().
	 */
	public function testGetGid() {
		// Remove the following lines when you implement this test.
		$this->markTestIncomplete(
			'This test has not been implemented yet.'
		);
	}

	/**
	 * @covers Kontti\User::getLogin
	 * @todo   Implement testGetLogin().
	 */
	public function testGetLogin() {
		// Remove the following lines when you implement this test.
		$this->markTestIncomplete(
			'This test has not been implemented yet.'
		);
	}

	/**
	 * @covers Kontti\User::getLevel
	 * @todo   Implement testGetLevel().
	 */
	public function testGetLevel() {
		// Remove the following lines when you implement this test.
		$this->markTestIncomplete(
			'This test has not been implemented yet.'
		);
	}

	/**
	 * @covers Kontti\User::getName
	 * @todo   Implement testGetName().
	 */
	public function testGetName() {
		// Remove the following lines when you implement this test.
		$this->markTestIncomplete(
			'This test has not been implemented yet.'
		);
	}

	/**
	 * @covers Kontti\User::enabled
	 * @todo   Implement testEnabled().
	 */
	public function testEnabled() {
		// Remove the following lines when you implement this test.
		$this->markTestIncomplete(
			'This test has not been implemented yet.'
		);
	}

	/**
	 * @covers Kontti\User::hasPermission
	 * @todo   Implement testHasPermission().
	 */
	public function testHasPermission() {
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
		$this->object = new User($db);
	}

	/**
	 * Tears down the fixture, for example, closes a network connection.
	 * This method is called after a test is executed.
	 */
	protected function tearDown() {
	}
}
