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


/**
 * Class Audit
 * @package Kontti
 */

class Audit
{
    private $dbcon;
    private $sql_string = "INSERT INTO audit VALUES (NOW(), $1 , $2, $3, $4)";
    private $result;
    private $id;
    /**
     * Audit constructor.
     *
     * @param resource $dbcon The database connection
     * @param string $id The unique identifier used to prepare the satement
     */
    public function __construct($dbcon, $id)
    {
        $this->dbcon = $dbcon;
        $this->id = $id;
        $this->result = pg_prepare($this->dbcon, $id, $this->sql_string);
    }


    /**
     * log: Add an audit log to the database
     *
     * @param integer $uid The uid of the user, -1 if not known
     * @param string $type Good or bad? Identifier with a -ok or -fail suffix
     * @param string $message The audit message itself detailing what has passed
     */
    public function log($uid, $type, $message)
    {
        if ($this->result) {
            $result = pg_execute($this->dbcon, $this->id, array($uid, $_SERVER['REMOTE_ADDR'], $type, $message));

            if (!$result) {
                $this->result = $result;
            }
        }
    }
}