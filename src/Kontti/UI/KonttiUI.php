<?php
/**
 * Created by PhpStorm.
 * User: poltsi
 * Date: 9/14/17
 * Time: 6:36 PM
 */

namespace Kontti\UI;


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

    public function show() {
        readfile("resources/base_page.html");
    }
}