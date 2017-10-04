<?php
/**
 * Created by PhpStorm.
 * User: poltsi
 * Date: 10/3/17
 * Time: 11:38 PM
 */

namespace Kontti\Audit;


/**
 * Class Audit
 * @package Kontti\Audit
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