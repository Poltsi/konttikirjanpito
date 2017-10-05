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
 * Class Admin
 * @package Kontti
 */
class Admin
{
    private $data;
    private $dbcon;
    /**
     * Admin constructor.
     */
    public function __construct($dbcon, $data)
    {
        $this->dbcon = $dbcon;
        $this->data = $data;
    }
}