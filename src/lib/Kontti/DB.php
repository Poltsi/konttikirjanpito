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
		'put_audit' => ['sql' => 'INSERT INTO audit VALUES (NOW(), $1 , $2, $3, $4)'],
		'get_login' => ['sql' => 'SELECT uid, enabled, level FROM users WHERE login = $1 AND password = crypt($2, salt)'],
		'get_user_auth' => ['sql' => 'SELECT uid, gid, level, name, enabled FROM users WHERE login = $1 AND password = crypt($2, salt)'],
		'get_min_gas_id' => ['sql' => 'SELECT min_fill_level, gas_id FROM gas_level WHERE gas_key = $1'],
		'add_fill' => ['sql' => 'INSERT INTO fills ' .
			'(uid, fill_datetime, gas_level_id, fill_type, cyl_type, cyl_count, cyl_size, start_pressure, end_pressure, o2_start, o2_end, he_start, he_end, o2_vol, he_vol, counted) ' .
			'VALUES ($1, now(), $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, false)'],
		'get_all_user_uid' => ['sql' => 'SELECT uid FROM users'],
		'get_user_all_by_uid' => ['sql' => 'SELECT uid, gid, login, level, name, enabled FROM users WHERE uid = $1'],
		'get_o2_by_user' => ['sql' => 'SELECT SUM(o2_vol) FROM fills WHERE uid = $1'],
		'get_he_by_user' => ['sql' => 'SELECT SUM(he_vol) FROM fills WHERE uid = $1'],
		'get_unpaid_o2_by_user' => ['sql' => 'SELECT SUM(o2_vol) FROM fills WHERE uid = $1 AND counted = FALSE'],
		'get_unpaid_he_by_user' => ['sql' => 'SELECT SUM(he_vol) FROM fills WHERE uid = $1 AND counted = FALSE'],
		'get_count_by_user_and_type' => ['sql' => 'SELECT COUNT(f.*) FROM fills f, gas_level g WHERE f.uid = $1 AND f.gas_level_id = g.gas_id AND g.gas_key = $2'],
		'get_fill_id_by_key' => ['sql' => 'SELECT gas_id FROM gas_level WHERE gas_key = $1']
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
		$this->hostname = getenv('KONTTI_HOST') ?? $hostname;
		$this->port = getenv('KONTTI_PORT') ?? $port;
		$this->database = getenv('KONTTI_DB') ?? $database;
		$this->user = getenv('KONTTI_USER') ?? $user;
		$this->password = getenv('KONTTI_PASSWORD') ?? $password;

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

	public function authenticate(string $login, $password): array {
		$key = 'get_user_auth';
		$result = pg_execute($this->dbcon, $key, array($login, $password));

		if (!$result) {
			return array();
		}

		return pg_fetch_row($result);
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
	                        string $cyl_type, int $cyl_count, float $cyl_size,
	                        int $start_pressure, int $end_pressure,
	                        int $o2_start, int $o2_end,
	                        int $he_start, int $he_end,
	                        int $o2_vol, int $he_vol): bool {
		$key = 'add_fill';
		$result = pg_execute($this->dbcon, $key, array($uid, $level, $fill_type,
			$cyl_type, $cyl_count, $cyl_size,
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
		if (is_null($res)) {
			$res = 0;
		}
		return $res;
	}

	public function getUnpaidGasPerUser(int $uid, string $gas): int {
		$key = 'get_unpaid_' . $gas . '_by_user';
		$result = pg_execute($this->dbcon, $key, array($uid));
		$res = pg_fetch_row($result)[0];
		if (is_null($res)) {
			$res = 0;
		}
		return $res;
	}

	public function getFillCountPerUser(int $uid, string $fill_type): int {
		$key = 'get_count_by_user_and_type';
		$result = pg_execute($this->dbcon, $key, array($uid, $fill_type));
		$res = pg_fetch_row($result)[0];
		if (is_null($res)) {
			$res = 0;
		}
		return $res;
	}

	public function getFillIDFromKey(string $fill_key): int {
		$key = 'get_fill_id_by_key';
		$result = pg_execute($this->dbcon, $key, array($fill_key));
		$res = pg_fetch_row($result)[0];
		if (is_null($res)) {
			$res = 0;
		}
		return $res;
	}

	/**
	 * @param string $sql
	 * @param array $params
	 * @return array|bool
	 */
	public function runSQL(string $sql, array $params): ?array {
		return pg_query_params($this->dbcon, $sql, $params);
	}
}