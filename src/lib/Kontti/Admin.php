<?php
/**
 * Created by PhpStorm.
 * User: poltsi
 * Date: 10/3/17
 * Time: 11:26 PM
 */

namespace Kontti\Admin;


/**
 * Class Admin
 * @package lib\Kontti\Admin
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