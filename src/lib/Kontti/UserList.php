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
include_once ('User.php');
include_once ('DB.php');

class UserList {
    private $user_list = null;
    private $db = null;

    /**
     * UserList constructor.
     * @param DB $db
     */
    public function __construct(DB $db) {
        $this->user_list = array();
        $this->db = $db;
        $this->populateList();
    }

    /**
     * populateList: Fetches all the users from database to internal array
     * @return void
     */
    private function populateList(): void {
        $result = $this->db->getAllUserID();

        if (!count($result)) {
            return;
        } else {
            for ($i = 0; $i < count($result); $i++) {
            	$user = new User($this->db);
	            $user->setUid($result[$i]['uid']);
	            $user->getDataFromDB();
	            $this->add($user);
            }
        }
    }

	/**
	 * add: Adds an existing user object to the internal array
	 * @param User $user
	 * @return void
	 */
	public function add(User $user): void {
        array_push($this->user_list, $user);
    }

	/**
	 * @return array|null
	 */
	public function getUserList()
	{
		return $this->user_list;
	}
	/**
	 * @return array|null
	 */
	public function getUserListAsArray()
	{
		$arr = array();

		foreach ($this->user_list as $user) {
			$arr[] = array(
				'uid' => $user->getUid(),
				'gid' => $user->getGid(),
				'login' => $user->getLogin(),
				'level' => $user->getLevel(),
				'name' => $user->getName(),
				'enabled' => $user->enabled());
		}

		return $arr;
	}
}