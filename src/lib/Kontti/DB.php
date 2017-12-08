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

class DB {
	private $hostname;
	private $port;
	private $database;
	private $user;
	private $password;

	private $dbcon;
	private $state;

	private $db_stmt = [
		'put_audit'                        => ['sql' => 'INSERT INTO audit VALUES (NOW(), $1 , $2, $3, $4)'],
		'get_login'                        => ['sql' => 'SELECT uid, enabled, level FROM users WHERE login = $1 AND password = crypt($2, salt)'],
		'get_user_auth'                    => ['sql' => 'SELECT uid, gid, level, name, enabled FROM users WHERE login = $1 AND password = crypt($2, salt)'],
		'get_min_gas_id'                   => ['sql' => 'SELECT min_fill_level, gas_id FROM gas_level WHERE gas_key = $1'],
		'add_fill'                         => ['sql' => 'INSERT INTO fills ' .
			'(uid, fill_datetime, gas_level_id, cylinder_id, fill_type, start_pressure, end_pressure, o2_start, o2_end, he_start, he_end, o2_vol, he_vol, counted) ' .
			'VALUES ($1, now(), $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, FALSE)'],
		'get_all_user_uid'                 => ['sql' => 'SELECT uid FROM users'],
		'get_user_all_by_uid'              => ['sql' => 'SELECT uid, gid, login, level, name, enabled FROM users WHERE uid = $1'],
		'get_o2_by_user'                   => ['sql' => 'SELECT SUM(o2_vol) FROM fills WHERE uid = $1'],
		'get_he_by_user'                   => ['sql' => 'SELECT SUM(he_vol) FROM fills WHERE uid = $1'],
		'get_unpaid_fills_by_user'         => ['sql' => "SELECT f.fill_id, f.fill_datetime, g.gas_key, ct.name AS cyl_name, c.name, ct.pressure, ct.size, f.cylinder_id, f.o2_vol, f.he_vol FROM fills f, gas_level g, cylinder_types ct, cylinders c WHERE f.uid = $1 AND f.cylinder_id = c.cylinder_id AND c.type_id = ct.type_id AND g.gas_id = f.gas_level_id AND f.counted = FALSE AND f.fill_type = 'vid' AND gas_key IN ('o2', 'tx') ORDER BY f.fill_datetime ASC"],
		'get_unpaid_o2_by_user'            => ['sql' => "SELECT SUM(o2_vol) FROM fills WHERE gas_level_id = " . O2_LEVEL . " AND fill_type = 'vid' AND uid = $1 AND counted = FALSE"],
		'get_unpaid_he_by_user'            => ['sql' => "SELECT SUM(he_vol) FROM fills WHERE gas_level_id = " . HE_LEVEL . " AND fill_type = 'vid' AND uid = $1 AND counted = FALSE"],
		'get_fill_id_by_key'               => ['sql' => 'SELECT gas_id FROM gas_level WHERE gas_key = $1'],
		'get_user_count_and_type'          => ['sql' => 'SELECT COUNT(f.*) FROM fills f, gas_level g WHERE f.uid = $1 AND f.gas_level_id = g.gas_id AND g.gas_key = $2'],
		'get_user_stats_filltype_count'    => ['sql' => 'SELECT fill_type AS stat_key, COUNT(cylinder_id) AS stat_value FROM fills WHERE uid = $1 GROUP BY fill_type ORDER BY stat_key'],
		'get_user_stats_gastype_count'     => ['sql' => 'SELECT gl.gas_key  AS stat_key, COUNT(f.cylinder_id) AS stat_value FROM gas_level gl, fills f WHERE f.gas_level_id = gl.gas_id AND f.uid = $1 GROUP BY f.gas_level_id, gl.gas_key ORDER BY stat_key'],
		'get_user_stats_vol_by_type'       => ['sql' => 'SELECT SUM(o2_vol) AS o2, SUM(he_vol) AS he FROM fills WHERE uid = $1'],
		'get_user_stats_by_cyl_type'       => ['sql' =>	'SELECT ct.name AS stat_key, COUNT(f.cylinder_id) AS stat_value FROM fills f, cylinders c, cylinder_types ct WHERE f.uid = $1 AND f.cylinder_id = c.cylinder_id AND c.type_id = ct.type_id GROUP BY ct.name ORDER BY stat_value DESC'],
		'get_generic_stats_filltype_count' => ['sql' => 'SELECT fill_type AS stat_key, COUNT(cylinder_id) AS stat_value FROM fills GROUP BY fill_type ORDER BY stat_key'],
		'get_generic_stats_gastype_count'  => ['sql' => 'SELECT gl.gas_key  AS stat_key, COUNT(f.cylinder_id) AS stat_value FROM gas_level gl, fills f WHERE f.gas_level_id = gl.gas_id GROUP BY f.gas_level_id, gl.gas_key ORDER BY stat_key'],
		'get_generic_stats_vol_by_type'    => ['sql' => 'SELECT SUM(o2_vol) AS o2, SUM(he_vol) AS he FROM fills'],
		'get_generic_stats_by_cyl_type'    => ['sql' => 'SELECT ct.name AS stat_key, COUNT(f.cylinder_id) AS stat_value FROM fills f, cylinders c, cylinder_types ct WHERE   f.cylinder_id = c.cylinder_id AND   c.type_id = ct.type_id GROUP BY ct.name ORDER BY stat_value DESC'],
		'get_cylinders_by_user'            => ['sql' => 'SELECT c.cylinder_id, c.type_id, c.name, c.identifier, c.added, ct.label, ct.name AS type_name, ct.pressure, ct.size FROM cylinders c, cylinder_types ct WHERE ct.type_id = c.type_id AND c.user_id = $1 ORDER BY c.cylinder_id ASC'],
		'get_cylinders'                    => ['sql' => 'SELECT c.user_id, u.login, u.level, cylinder_id, c.type_id, c.name, c.identifier, c.added, ct.label, ct.name AS type_name, ct.pressure, ct.size FROM cylinders c, cylinder_types ct, users u WHERE u.uid = c.user_id AND ct.type_id = c.type_id ORDER BY c.cylinder_id ASC'],
		'get_cylinder_data'                => ['sql' => 'SELECT c.user_id, c.name, c.identifier, ct.size, ct.pressure, ct.name AS type_name FROM cylinders c, cylinder_types ct WHERE ct.type_id = c.type_id AND c.cylinder_id = $1'],
	];

	/**
	 * DB constructor.
	 * @param $hostname
	 * @param $port
	 * @param $database
	 * @param $user
	 * @param $password
	 */
	public function __construct($hostname, $port, $database, $user, $password) {
		$this->hostname = strlen(getenv('KONTTI_HOST', true)) ? getenv('KONTTI_HOST', true) : $hostname;
		$this->port = strlen(getenv('KONTTI_PORT', true)) ? getenv('KONTTI_PORT', true) : $port;
		$this->database = strlen(getenv('KONTTI_DB', true)) ? getenv('KONTTI_DB', true) : $database;
		$this->user = strlen(getenv('KONTTI_USER', true)) ? getenv('KONTTI_USER', true) : $user;
		$this->password = strlen(getenv('KONTTI_PASSWORD', true)) ? getenv('KONTTI_PASSWORD', true) : $password;

		$this->connect();

		if ($this->state) {
			$this->prepareStatements();
		}
	}

	private function connect(): void {
		$this->dbcon = pg_connect("host=" . $this->hostname .
			" port=" . $this->port .
			" dbname=" . $this->database .
			" user=" . $this->user .
			" password=" . $this->password);

		if (!$this->dbcon) {
			$this->state = false;
		} else {
			$this->state = true;
		}
	}

	private function prepareStatements(): void {
		foreach ($this->db_stmt as $name => $arr) {
			$arr['result'] = pg_prepare($this->dbcon, $name, $arr['sql']);

			if (!$arr['result']) {
				$this->state = false;
			}
		}
	}

	/**
	 * @return bool
	 */
	public function getState(): bool {
		return $this->state;
	}

	public function addAudit(int $uid, string $remote_address, string $type, string $message): void {
		$key = 'put_audit';
		pg_execute($this->dbcon, $key, array($uid, $remote_address, $type, $message));
	}

	/**
	 * authenticate: Authenticate the user by the given login and password combination
	 * @param string $login
	 * @param string $password
	 * @return array|null
	 */

	public function authenticate(string $login, $password): ?array {
		$key = 'get_user_auth';
		$result = pg_execute($this->dbcon, $key, array($login, $password));

		if (!$result) {
			return NULL;
		}

		$arr = pg_fetch_row($result);

		if (is_bool($arr)) {return null;}

		return $arr;
	}

	public function getUserDataByUID(int $uid): array {
		$key = 'get_user_all_by_uid';
		$result = pg_execute($this->dbcon, $key, array($uid));

		if (!$result) {
			return array();
		}

		return pg_fetch_row($result);
	}

	public function getMinGasLevelAndID(string $gas_key): array {
		$key = 'get_min_gas_id';
		$result = pg_execute($this->dbcon, $key, array($gas_key));

		if (!$result) {
			return array();
		}

		return pg_fetch_row($result);
	}

	public function addFill(int $uid, int $level, string $fill_type,
	                        int $cylinder_id,
	                        int $start_pressure, int $end_pressure,
	                        int $o2_start, int $o2_end,
	                        int $he_start, int $he_end,
	                        int $o2_vol, int $he_vol): bool {
		$key = 'add_fill';
		/*
		'add_fill'                         => ['sql' => 'INSERT INTO fills ' .
			'(uid, fill_datetime, gas_level_id, cylinder_id, fill_type, start_pressure, end_pressure, o2_start, o2_end, he_start, he_end, o2_vol, he_vol, counted) ' .
			'VALUES ($1, now(), $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, FALSE)'],
		 */
		$result = pg_execute($this->dbcon, $key, array($uid, $level,
			$cylinder_id, $fill_type,
			$start_pressure, $end_pressure,
			$o2_start, $o2_end,
			$he_start, $he_end,
			$o2_vol, $he_vol));

		if (!$result) {
			return false;
		}

		return true;
	}

	public function getAllUserID(): array {
		$key = 'get_all_user_uid';

		$result = pg_execute($this->dbcon, $key, array());

		if (!$result) {
			return array();
		}

		return pg_fetch_all($result);
	}

	public function close(): void {
		if ($this->state) {
			pg_close($this->dbcon);
		}
	}

	public function getGasPerUser(int $uid, string $gas): int {
		$key = 'get_' . $gas . '_by_user';
		$result = pg_execute($this->dbcon, $key, array($uid));
		$res = pg_fetch_row($result)[0];

		if (is_null($res) || !$res) {
			$res = 0;
		}
		return $res;
	}

	public function getUnpaidGasPerUser(int $uid, string $gas): int {
		$key = 'get_unpaid_' . $gas . '_by_user';
		$result = pg_execute($this->dbcon, $key, array($uid));
		$res = pg_fetch_row($result)[0];

		if (is_null($res) || !$res) {
			$res = 0;
		}
		return $res;
	}

	public function getFillCountPerUser(int $uid, string $fill_type): int {
		$key = 'get_user_count_and_type';
		$result = pg_execute($this->dbcon, $key, array($uid, $fill_type));
		$res = pg_fetch_row($result)[0];

		if (is_null($res) || !$res) {
			$res = 0;
		}
		return $res;
	}

	public function getFillIDFromKey(string $fill_key): int {
		$key = 'get_fill_id_by_key';
		$result = pg_execute($this->dbcon, $key, array($fill_key));
		$res = pg_fetch_row($result)[0];

		if (is_null($res) || !$res) {
			$res = 0;
		}
		return $res;
	}

	public function getFillTypeCountByUser(int $uid): array {
		$key = 'get_user_stats_filltype_count';

		$result = pg_execute($this->dbcon, $key, array($uid));
		$res = pg_fetch_all($result);

		if (is_null($res) || !$res) {
			$res = array();
		}

		return $res;
	}

	public function getGasTypeCountByUser(int $uid): array {
		$key = 'get_user_stats_gastype_count';
		$result = pg_execute($this->dbcon, $key, array($uid));
		$res = pg_fetch_all($result);

		if (is_null($res) || !$res) {
			$res = array();
		}

		return $res;
	}

	public function getGasVolumeByUser(int $uid): array {
		$key = 'get_user_stats_vol_by_type';
		$result = pg_execute($this->dbcon, $key, array($uid));
		$res = pg_fetch_all($result);

		if (is_null($res) || !$res) {
			$res = array();
		}

		return $res;
	}

	public function getFillTypeCountGeneric(): array {
		$key = 'get_generic_stats_filltype_count';

		$result = pg_execute($this->dbcon, $key, array());
		$res = pg_fetch_all($result);

		if (is_null($res) || !$res) {
			$res = array();
		}

		return $res;
	}

	public function getCylTypeByUser(int $uid): array {
		$key = 'get_user_stats_by_cyl_type';
		$result = pg_execute($this->dbcon, $key, array($uid));
		$res = pg_fetch_all($result);

		if (is_null($res) || !$res) {
			$res = array();
		}

		return $res;
	}

	public function getGasTypeCountGeneric(): array {
		$key = 'get_generic_stats_gastype_count';
		$result = pg_execute($this->dbcon, $key, array());
		$res = pg_fetch_all($result);

		if (is_null($res) || !$res) {
			$res = array();
		}

		return $res;
	}

	public function getGasVolumeGeneric(): array {
		$key = 'get_generic_stats_vol_by_type';
		$result = pg_execute($this->dbcon, $key, array());
		$res = pg_fetch_all($result);

		if (is_null($res) || !$res) {
			$res = array();
		}

		return $res;
	}

	public function getCylTypeGeneric(): array {
		$key = 'get_generic_stats_by_cyl_type';
		$result = pg_execute($this->dbcon, $key, array());
		$res = pg_fetch_all($result);

		if (is_null($res) || !$res) {
			$res = array();
		}

		return $res;
	}

	public function get_unused_fill_by_user(int $uid): ?array {
		$key = 'get_unpaid_fills_by_user';
		$result = pg_execute($this->dbcon, $key, array($uid));
		$res = pg_fetch_all($result);

		if (is_null($res) || !$res) {
			$res = array();
		}

		return $res;
	}

	public function update_fills_as_counted(int $uid, array $list): ?bool {
		$val_arr = array();

		for ($i = 0; $i < count($list); $i++) {
			array_push($val_arr, $list[$i]['id']);
		}

		$sqlString = 'UPDATE fills SET counted = TRUE, counted_date = NOW() WHERE  fill_id IN (' . implode(',', $val_arr) . ') AND uid = ' . $uid;

		return $this->putSQL($sqlString);
	}

	////////// CYLINDERS  \\\\\\\\\\
	public function get_cylinder_data(int $cyl_id): array {
		$key = 'get_cylinder_data';
		$result = pg_execute($this->dbcon, $key, array($cyl_id));
		$res = pg_fetch_all($result)[0];

		if (is_null($res) || !$res) {
			$res = array();
		}

		return $res;
	}

	public function get_user_cylinders(int $uid): array {
		$key = 'get_cylinders_by_user';
		$result = pg_execute($this->dbcon, $key, array($uid));
		$res = pg_fetch_all($result);

		if (is_null($res) || !$res) {
			$res = array();
		}

		return $res;
	}

	public function get_all_cylinders(): array {
		$key = 'get_cylinders';
		$result = pg_execute($this->dbcon, $key, array());
		$res = pg_fetch_all($result);

		if (is_null($res) || !$res) {
			$res = array();
		}

		return $res;
	}

	/**
	 * @param string $sql
	 * @param array  $params
	 * @return array|bool
	 */

	// TODO: There's something fundamentaly broken with this function, which results in an invisible 500 server error

	public function runSQL(string $sql, array $params): ?array {
		$res = pg_query_params($this->dbcon, $sql, $params);
		$result = pg_fetch_all($res);

		if ($result == FALSE) {
			print("FALSE");
		} elseif ( is_null($result)) {
			print('NULL');
		} else {
			$num = count($result);

			for ($i = 0; $i < $num; $i++) {
				print('Val: ' . $result[$i]);
			}
		}

		return $result;
	}

	public function putSQL(string $sql): bool {
		$res = pg_query($this->dbcon, $sql);

		if ($res) {return true;}

		return false;
	}
}