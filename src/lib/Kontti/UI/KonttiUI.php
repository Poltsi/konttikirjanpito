<?php
/**
 * Copyright (c) Paul-Erik Törrönen 2017.
 *  This program is free software; you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation version 2 of the License and provided
 *  that the above copyright and permission notice is included with all
 *  distributed copies of this or derived software.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 */

/**
 * Created by PhpStorm.
 * User: poltsi
 * Date: 9/14/17
 * Time: 6:36 PM
 */

namespace Kontti\UI;


/**
 * Class KonttiUI
 * @package Kontti\UI
 */

class KonttiUI
{

	/**
	 * KonttiUI constructor.
	 */
	public function __construct()
	{
	}

	/**
	 * show: Display the frontend
	 *
	 * @return void
	 */

	public function show()
	{
		readfile("../resources/base_page.html");
	}
}