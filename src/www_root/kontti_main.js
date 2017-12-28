/*
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

/* Global variables for strings */
const MAINDATAACTIONID = 'main_action';
const DATAAREAID = 'data_area';
const DATAAREATABLEID = 'data_area_table';
const DATAACTIONID = 'data_action';
const INFOID = 'info';
const DATAAREAFORMID = 'fill_form';
const FILLROWPREFIX = 'fill_tr_';
const FILLTYPEPREFIX = 'fill_type_';
const GASLEVELPREFIX = 'gas_level_';
const FILLCYLIDPREFIX = 'cyl_id_';
const FILLCYLPRESSSTARTPREFIX = 'cyl_start_pressure_';
const FILLCYLPRESSENDPREFIX = 'cyl_end_pressure_';
const FILLCYLO2PCNTSTARTPREFIX = 'cyl_o2_start_';
const FILLCYLO2PCNTENDPREFIX = 'cyl_o2_end_';
const FILLCYLHEPCNTSTARTPREFIX = 'cyl_he_start_';
const FILLCYLHEPCNTENDPREFIX = 'cyl_he_end_';

const STATUS_OK = 'OK';
const STATUS_NOK = 'NOK';
const KEY_STATUS = 'status';
const KEY_REASON = 'reason';

/* Get our host URL*/
var url = document.URL;
var url_parts = url.split('/');
var baseUrl = url_parts[0] + '//' + url_parts[2] + '/';

var next_id = 0;
/* Types of fills, fields are:
 *  0. key
 *  1. Name
 *  2. Button color
 */
const TYPELIST = {
	10: ['air', 'Air fill', '#99CC99'],
	20: [ 'nx', 'Nitrox fill', '#9999CC'],
	30: [ 'o2', 'Oxygen fill', '#9999FF'],
	40: [ 'tx', 'Trimix fill', '#CC99CC']};

const FILLTYPELIST = {
	'pp': ['Prepaid', ''],
	'vid': ['VID', ''],
	'int': ['Internal', '']
};

const FILLEDITORFIELDS = {
	'fill_datetime': 'Date',
	'gas_key': 'Fill type',
	'cyl_name': 'Cylinder type',
	'size': 'Cylinder size',
	'pressure': 'Nominal pressure',
	'name': 'Cylinder name',
	'o2_vol': 'O2 volume',
	'he_vol': 'He volume'
};

/**
 * display_action_buttons: Shows the action buttons depending of the mode, default is to show the main action buttons
 * @return void
 */

function display_action_buttons() {
	/* TODO: Retrieve the session data */
	var mode = sessionStorage.getItem('kontti_mode');

	if (mode === null) {
		mode = 'login';
	}
	/* TODO: Check that mode is set */

	/* Clear the divs first */
	clear_divs();

	switch (mode) {
		case 'login':
			show_login();
			break;
		case 'main':
			show_main();
			break;
		case 'stats':
			show_stats();
			break;
		case 'admin':
			show_admin();
			break;
		case 'user_settings':
			show_user_settings();
			break;
		case 'logout':
			break;
		default:
	}
}

function clear_divs() {
	var main_action_elem = document.querySelector('#' + MAINDATAACTIONID);
	main_action_elem.innerHTML = '';
	var data_area_elem = document.querySelector('#' + DATAAREAID);
	data_area_elem.innerHTML = '';
	var data_action_elem = document.querySelector('#' + DATAACTIONID);
	data_action_elem.innerHTML = '';
}

function show_main() {
	// Retrieve and store some generic data
	fetch_cylinder_list();
	update_cylinder_types();

	var main_action_elem = document.getElementById(MAINDATAACTIONID);
	var data_area_elem = document.querySelector('#' + DATAAREAID);
	var data_action_elem = document.querySelector('#' + DATAACTIONID);
	main_action_elem.innerHTML = '';
	main_action_elem.appendChild(get_main_action_buttons());

	/* Add the fill form to the main field div */
	var fill_form = document.createElement('form');
	fill_form.id = DATAAREAFORMID;

	var fill_form_table = document.createElement('table');
	fill_form_table.appendChild(get_fill_table_header());
	fill_form_table.id = DATAAREATABLEID;
	fill_form_table.setAttribute('border', '1');
	fill_form.appendChild(fill_form_table);
	data_area_elem.appendChild(fill_form);

	data_action_elem.innerHTML = '';
	data_action_elem.appendChild(get_check_button());
	data_action_elem.appendChild(get_save_data_button(DATAAREAFORMID));
}

/**
 * get_fill_table_header: Adds the header row to the fill table
 * @return Element
 */

function get_fill_table_header() {
	var header_tr = document.createElement('tr');
	header_tr.id = 'tr_header';
	var header_td0 = document.createElement('td');
	header_td0.innerHTML = '# and type';
	header_tr.appendChild(header_td0);
	var header_td1 = document.createElement('td');
	header_td1.innerHTML = 'Fill type';
	header_tr.appendChild(header_td1);
	var header_td2 = document.createElement('td');
	header_td2.innerHTML = 'Cylinder';
	header_tr.appendChild(header_td2);
	var header_td4 = document.createElement('td');
	header_td4.innerHTML = 'Start pressure';
	header_tr.appendChild(header_td4);
	var header_td5 = document.createElement('td');
	header_td5.innerHTML = 'End pressure';
	header_tr.appendChild(header_td5);
	var header_td6 = document.createElement('td');
	header_td6.innerHTML = 'Oxygen % at start';
	header_tr.appendChild(header_td6);
	var header_td7 = document.createElement('td');
	header_td7.innerHTML = 'Oxygen % at end';
	header_tr.appendChild(header_td7);
	var header_td8 = document.createElement('td');
	header_td8.innerHTML = 'Helium % at start';
	header_tr.appendChild(header_td8);
	var header_td9 = document.createElement('td');
	header_td9.innerHTML = 'Helium % at end';
	header_tr.appendChild(header_td9);
	var header_td10 = document.createElement('td');
	header_td10.innerHTML = 'Remove';
	header_tr.appendChild(header_td10);
	return (header_tr);
}

/**
 * get_main_action_buttons: Shows the button block for different fills addition
 * @return {Element}
 */

function get_main_action_buttons() {
	var button_div = document.createElement('div');
	button_div.id = 'main_action';
	button_div.width = '100%';

	if (sessionStorage.getItem('kontti_enabled') === '1') {
		Object.keys(TYPELIST).forEach(function(key, index) {
			if (parseInt(sessionStorage.getItem('kontti_level')) >= key) {
				var fill_button = document.createElement('button');
				fill_button.id = TYPELIST[key][1] + '_fill_button';
				fill_button.style.backgroundColor = TYPELIST[key][2];
				fill_button.innerHTML = TYPELIST[key][1];
				fill_button.addEventListener('click', get_show_fill_ref(TYPELIST[key][0]));
				button_div.appendChild(fill_button);
			}
		});
	}

	/* Admin button */
	if (sessionStorage.getItem('kontti_level') > 40) {
		var admin_button = document.createElement('button');
		admin_button.innerHTML = 'Admin';
		admin_button.id = 'admin';
		admin_button.addEventListener('click', get_admin_function());
		button_div.appendChild(admin_button);
	}

	/* Stats button */
	var stats_button = document.createElement('button');
	stats_button.innerHTML = 'Statistics';
	stats_button.id = 'stats';
	stats_button.addEventListener('click', get_stats_function());
	button_div.appendChild(stats_button);

	button_div.appendChild(get_user_settings_button());
	button_div.appendChild(get_logout_button());
	return (button_div);
}

function get_logout_button() {
	/* Logout button */
	var logout_button = document.createElement('button');
	logout_button.id = 'logout';
	logout_button.innerHTML = 'Logout';
	logout_button.addEventListener('click', get_logout_function());
	logout_button.style = 'float: right';
	return logout_button;
}

/*************************************************** USER SETTINGS ***************************************************/

function get_user_settings_button() {
	/* Logout button */
	var user_settings_button = document.createElement('button');
	user_settings_button.id = 'user_settings';
	user_settings_button.innerHTML = 'User settings';
	user_settings_button.addEventListener('click', get_user_settings_function());
	return user_settings_button;
}

/**
 * get_user_settings_function: Return a reference to the logout function
 * @returns {Function}
 */

function get_user_settings_function() {
	return (function () {
		user_settings();
	});
}

function user_settings() {
	sessionStorage.setItem('kontti_mode', 'user_settings');
	display_action_buttons();
	// TODO: Empty the main div
}

function show_user_settings() {
	/* TODO: Populate the action div */
	var data_action_elem = document.querySelector('#' + MAINDATAACTIONID);
	var button_div = document.createElement('div');
	button_div.id = 'stats_action';

	/* Show user settings */
	var own_button = document.createElement('button');
	own_button.innerHTML = 'User settings';
	own_button.id = 'manage_settings';
	own_button.addEventListener('click', get_settings_function('user'));
	button_div.appendChild(own_button);

	/* Show user cylinders */
	var user_cylinder_button = document.createElement('button');
	user_cylinder_button.innerHTML = 'Manage cylinders';
	user_cylinder_button.id = 'manage_cylinder_list';
	user_cylinder_button.addEventListener('click', get_settings_function('cylinder'));
	button_div.appendChild(user_cylinder_button);

	/* Show user certificates */
	var user_certificate_button = document.createElement('button');
	user_certificate_button.innerHTML = 'Manage certificates';
	user_certificate_button.id = 'manage_certificate_list';
	user_certificate_button.addEventListener('click', get_settings_function('certificate'));
	button_div.appendChild(user_certificate_button);

	button_div.appendChild(get_back_to_fill_button());
	button_div.appendChild(get_user_settings_button());
	button_div.appendChild(get_logout_button());

	data_action_elem.appendChild(button_div);
}

function get_settings_function(type) {
	switch (type) {
		case 'user':
			return function () {
				manage_settings(function () {
					manage_user_settings();
				});
			};
		case 'cylinder':
			return function () {
				manage_settings( function () {
					manage_cylinder_settings();
				});
			};
		case 'certificate':
			return function () {
				manage_settings(function () {
					manage_certificate_settings();
				});
			};
	}
}

function manage_settings(func) {
	var request_data = {
		'object': 'user',
		'action': 'get',
		'target': ['user_settings']
	};

	var callback = function (xhr) {
		if (xhr.readyState === 4 && xhr.status === 200) {
			var json = JSON.parse(xhr.responseText);
			add_info('Return value: ' + json);

			if (json[KEY_STATUS] === STATUS_OK) {
				empty_info();
				empty_data();
				update_user_settings(json);
				update_user_cylinder_list(json);
				update_user_certificate_list(json);
				update_certificate_org_list(json);
				add_info('User settings retrieved');
				func();
			} else {
				add_info('Could not get user settings');

				if (json[KEY_REASON] !== null) {
					add_info(json[KEY_REASON]);
				}
			}
		}
	};

	send_json_request(request_data, 'settings.php', callback);
}

function manage_user_settings() {
	var settings = JSON.parse(sessionStorage.getItem('kontti_settings'));
	var data_elem = document.querySelector('#' + DATAAREAID);

	var settings_table = document.createElement('table');
	settings_table.setAttribute('border', '1');

	var settings_header = document.createElement('tr');
	var settings_key_cell = document.createElement('th');
	settings_key_cell.innerHTML = 'Field';
	var settings_value_cell = document.createElement('th');
	settings_value_cell.innerHTML = 'Value';

	settings_header.appendChild(settings_key_cell);
	settings_header.appendChild(settings_value_cell);

	settings_table.appendChild(settings_header);

	var header_fields = {
		'gid':     ['Group ID', 'text', false],
		'level':   ['Fill level', 'fill_level', false],
		'login':   ['Login', 'text', false],
		'name':    ['Name', 'text', true],
		'enabled': ['Account state', 'enabled', false]};

	Object.keys(settings).forEach(function(key) {
		var setting_row = document.createElement('tr');
		var field_cell = document.createElement('td');
		field_cell.id = 'personal_' + key;
		field_cell.style.textAlign = 'right';
		field_cell.innerHTML = header_fields[key][0];

		var data_cell = document.createElement('td');
		data_cell.appendChild(get_form_element(
			header_fields[key],
			settings,
			settings[key],
			'personal_editable-' + key,
			'User info'));
		data_cell.style.textAlign = 'right';

		setting_row.appendChild(field_cell);
		setting_row.appendChild(data_cell);
		settings_table.appendChild(setting_row);
	});

	// Finally add the main editing row
	var edit_row = document.createElement('tr');
	var edit_cell = document.createElement('td');
	edit_cell.setAttribute('colspan', '2');

	var update_button = document.createElement('button');
	update_button.innerHTML = 'Update settings';
	update_button.addEventListener('click', get_update_settings_function(settings_table, header_fields));
	edit_cell.appendChild(update_button);

	edit_row.appendChild(edit_cell);
	settings_table.appendChild(edit_row);
	data_elem.appendChild(settings_table);
}

function get_update_settings_function(table, fields) {
	return function() {update_settings(table, fields);};
}

function update_settings(table, fields) {
	var request_data = {
		'object': 'user',
		'action': 'set',
		'target': ['settings'],
		'data': {}
	};

	Object.keys(fields).forEach(function(key) {
		if (fields[key][2]) {
			request_data['data'][key] = document.querySelector('#personal_editable-' + key).value;
		}
	});

	var callback = function (xhr) {
		if (xhr.readyState === 4 && xhr.status === 200) {
			var json = JSON.parse(xhr.responseText);
			add_info('Return value: ' + json);

			if (json[KEY_STATUS] === STATUS_OK) {
				empty_info();
				// empty_data();
				add_info('User settings updated');
			} else {
				add_info('Problems updating settings');

				if (json[KEY_REASON] !== null) {
					add_info(json[KEY_REASON]);
				}
			}
		}
	};

	send_json_request(request_data, 'settings.php', callback);
}

function get_form_element(struct, list, value, id, title) {
	var editable = struct[2];

	var input_field = null;

	switch (struct[1]) {
		case 'text':
			if (!editable) {
				return (document.createTextNode(value));
			}

			input_field = document.createElement('input');
			input_field.setAttribute('value', value);
			break;
		case 'integer':
		case 'decimal':
			if (!editable) {
				return (document.createTextNode(value));
			}

			input_field = document.createElement('input');
			input_field.setAttribute('type', 'number');
			break;
		case 'cylinder':
			if (!editable) {
				return (document.createTextNode(value));
			}

			input_field = document.createElement('select');

			for (var i = 0; i < list.length; i++) {
				var opt = new Option(list[i]['name'], list[i]['type_id']);

				if (list[i]['label'] === value) {
					opt.selected = true;
				}

				input_field.options.add(opt);
			}

			break;
		case 'certificate':
			break;
		case 'fill_level':
			if (!editable) {
				return (document.createTextNode(TYPELIST[value][0]));
			}

			break;
		case 'enabled':
			if (!editable) {
				return (document.createTextNode((value === 1 ? 'Enabled' : 'Disabled')));
			}

			input_field = document.createTextNode((value === 1 ? 'Enabled' : 'Disabled'));
			break;
		case 'level':
			if (!editable) {
				return (document.createTextNode(value));
			}

			return (document.createTextNode(TYPELIST[list[key]][1]));
//		case '':
//			break;
		case 'yearmonth':
			input_field = get_year_date_selector(id, value);
			break;
		case 'datetime':
			if (!editable) {
				return (document.createTextNode(value));
			}

			input_field = document.createElement('input');
			input_field.setAttribute('type', 'datetime-local');
			input_field.setAttribute('value', value);
			break;
		default:
			console.log('Unknown form type: ' + struct[1]);
	}

	input_field.setAttribute('id', id);
	input_field.title = title;
	return input_field;
}

function manage_cylinder_settings() {
	var cylinders = JSON.parse(sessionStorage.getItem('kontti_cylinder_list'));
	var data_elem = document.querySelector('#' + DATAAREAID);

	var cylinder_table = document.createElement('table');
	cylinder_table.setAttribute('border', '1');

	var header_fields = {
		'cylinder_id':     ['Cylinder ID', 'text', false],
		'type_id':         ['Type ID', 'text', false],
		'name':            ['Name', 'text', true],
		'identifier':      ['Serial', 'text', true],
		'inspection_date': ['Inspected (year, month)', 'yearmonth', true],
		'added':           ['Added', 'datetime', false],
		'label':           ['Type', 'cylinder', true],
		'pressure':        ['Pressure', 'integer', false],
		'size':            ['Size', 'decimal', false]};

	var settings_header = document.createElement('tr');

	Object.keys(header_fields).forEach(function(key) {
		var header_cell = document.createElement('th');
		header_cell.innerHTML = header_fields[key][0];
		settings_header.appendChild(header_cell);
	});

	var action_cell = document.createElement('th');
	action_cell.innerHTML = 'Action';
	settings_header.appendChild(action_cell);

	cylinder_table.appendChild(settings_header);
	var cyl_count = {counter: 0};

	for (cyl_count.counter = 0; cyl_count.counter < cylinders.length; cyl_count.counter++) {
		var cyl_id = cylinders[cyl_count.counter]['cylinder_id'];
		var setting_row = document.createElement('tr');
		var row_id = 'cylinder_editable_row-' + cyl_count.counter;

		setting_row.setAttribute('id', row_id);

		Object.keys(header_fields).forEach(function(key) {
			var data_cell = document.createElement('td');
			data_cell.appendChild(get_form_element(
				header_fields[key],
				JSON.parse(sessionStorage.getItem('kontti_cylinder_type_list')),
				cylinders[cyl_count.counter][key],
				'cylinder_editable-' + cylinders[cyl_count.counter][key] + '-' + cyl_id,
				'Select cylinder'));

			setting_row.appendChild(data_cell);
		});

		var action_row_cell = document.createElement('td');
		var action_button = document.createElement('button');
		action_button.innerText = 'Remove cylinder';
		action_button.setAttribute('id', 'cylinder_editable-remove_button-' + cyl_count.counter);
		action_button.addEventListener('click', get_remove_cylinder_function(row_id));
		action_row_cell.appendChild(action_button);
		setting_row.appendChild(action_row_cell);

		cylinder_table.appendChild(setting_row);
	}

	// Finally add the main editing row
	var edit_row = document.createElement('tr');
	var edit_cell = document.createElement('td');
	edit_cell.setAttribute('colspan', '10');

	var add_row_button = document.createElement('button');
	add_row_button.innerHTML = 'Add cylinder';
	add_row_button.addEventListener('click', get_add_cylinder_function(cylinder_table, header_fields, cyl_count));
	edit_cell.appendChild(add_row_button);

	var update_button = document.createElement('button');
	update_button.innerHTML = 'Update cylinders';
	update_button.addEventListener('click', get_update_cylinder_list_function(cylinder_table, header_fields));
	edit_cell.appendChild(update_button);
edit_row.setAttribute('id', 'cylinder_editable_action_row');
	edit_row.appendChild(edit_cell);
	cylinder_table.appendChild(edit_row);

	data_elem.appendChild(cylinder_table);
}

function get_remove_cylinder_function(id) {
	return function(){remove_cylinder(id);};
}

function get_update_cylinder_list_function(table, field_list) {
	return function(){update_cylinder_list(table, field_list);};
}

function update_cylinder_list(table, field_list) {

}

function get_add_cylinder_function(table, field_list, cyl_count) {
	return function(){add_cylinder(table, field_list, cyl_count);};
}

function remove_cylinder(id) {
	console.log('ID: ' + id);
	var action_row = document.querySelector('#' + id);
	action_row.parentNode.removeChild(action_row);
}

function add_cylinder(table, field_list, cyl_count) {
	var action_row = document.querySelector('#cylinder_editable_action_row');
	var new_row = document.createElement('tr');
	var row_id = 'cylinder_editable_row-' + cyl_count.counter;
	new_row.setAttribute('id', row_id);

	Object.keys(field_list).forEach(function(key) {
		var cyl_cell = document.createElement('td');
		cyl_cell.appendChild(get_form_element(
			field_list[key],
			JSON.parse(sessionStorage.getItem('kontti_cylinder_type_list')),
			'',
			'cylinder_editable_new-' + key + '-' + cyl_count.counter,
			'Select cylinder'));
		new_row.appendChild(cyl_cell);
	});

	var action_row_cell = document.createElement('td');
	var action_button = document.createElement('button');
	action_button.innerText = 'Remove cylinder';
	action_button.setAttribute('id', 'cylinder_editable-remove_button-' + cyl_count.counter);
	action_button.addEventListener('click', get_remove_cylinder_function(row_id));
	action_row_cell.appendChild(action_button);
	new_row.appendChild(action_row_cell);

	table.insertBefore(new_row, action_row);
	cyl_count.counter++;
}

function manage_certificate_settings() {
	var certificates = JSON.parse(sessionStorage.getItem('kontti_certificate_list'));
	var data_elem = document.querySelector('#' + DATAAREAID);

	var certificate_table = document.createElement('table');
	certificate_table.setAttribute('border', '1');

	var header_fields = {
		'cert_id': ['Certificate ID', false],
		'type': ['Type (rec/tec/cave/other)', true],
		'name': ['Organization', true],
		'serial_ident': ['Certificate serial', true],
		'instructor': ['Instructor', true]};

	var settings_header = document.createElement('tr');

	Object.keys(header_fields).forEach(function(key) {
		var header_cell = document.createElement('th');
		header_cell.innerHTML = header_fields[key][0];
		settings_header.appendChild(header_cell);
	});

	var action_cell = document.createElement('th');
	action_cell.innerHTML = 'Action';
	settings_header.appendChild(action_cell);

	certificate_table.appendChild(settings_header);

	for (var i = 0; i < certificates.length; i++) {
		var cert_id = certificates[i]['cert_id'];
		var setting_row = document.createElement('tr');
		setting_row.setAttribute('id', 'certificate_row-' + cert_id);

		Object.keys(header_fields).forEach(function(key) {
			var data_cell = document.createElement('td');

			if (header_fields[key][1]) {
				// We show a drop down for organizations
				if (key === 'name') {
					var input_field = document.createElement('select');
					input_field.setAttribute('id', 'certificate_editable-' + certificates[i][key] + '-' + cert_id);
					input_field.title = 'Select organization';

					var cert_org_list = JSON.parse(sessionStorage.getItem('kontti_cert_org_list'));

					for (var j = 0; j < cert_org_list.length; j++) {
						var opt = new Option(cert_org_list[j]['name'], cert_org_list[j]['org_id']);

						if (cert_org_list[j]['org_id'] === certificates[i]['org_id']) {
							opt.selected = true;
						}

						input_field.options.add(opt);
					}

					data_cell.appendChild(input_field);
				} else if (key === 'type') {
					var input_field = document.createElement('select');
					input_field.setAttribute('id', 'certificate_editable-' + certificates[i][key] + '-' + cert_id);
					input_field.title = 'Select type of certificate';

					var cert_type_list = ['rec', 'tec', 'cave', 'other'];

					for (var j = 0; j < cert_type_list.length; j++) {
						var opt = new Option(cert_type_list[j], cert_type_list[j]);

						if (cert_type_list[j] === certificates[i]['type']) {
							opt.selected = true;
						}

						input_field.options.add(opt);
					}

					data_cell.appendChild(input_field);
				} else {
					var input_field = document.createElement('input');
					input_field.setAttribute('value', certificates[i][key]);
					input_field.setAttribute('type', 'text');
					input_field.setAttribute('id', 'certificate_editable-' + certificates[i][key] + '-' + cert_id);
					data_cell.appendChild(input_field);
				}
			} else {
				data_cell.innerHTML = certificates[i][key];
			}

			setting_row.appendChild(data_cell);
		});

		var action_row_cell = document.createElement('td');
		var action_button = document.createElement('button');
		action_button.innerText = 'Remove certificate';
		action_button.setAttribute('id', 'certificate_editable-remove_button-' + cert_id);
		action_button.addEventListener('click', get_remove_certificate_function(cert_id));
		action_row_cell.appendChild(action_button);
		setting_row.appendChild(action_row_cell);

		certificate_table.appendChild(setting_row);
	}

	// Finally add the main editing row
	var edit_row = document.createElement('tr');
	var edit_cell = document.createElement('td');
	edit_cell.setAttribute('colspan', '10');

	var add_row_button = document.createElement('button');
	add_row_button.innerHTML = 'Add certificate';
	add_row_button.addEventListener('click', get_add_certificate_function(certificate_table, header_fields));
	edit_cell.appendChild(add_row_button);

	var update_button = document.createElement('button');
	update_button.innerHTML = 'Update certificates';
	update_button.addEventListener('click', get_update_certificate_list_function(certificate_table));
	edit_cell.appendChild(update_button);

	edit_row.appendChild(edit_cell);
	certificate_table.appendChild(edit_row);

	data_elem.appendChild(certificate_table);
}

function get_remove_certificate_function(cert_id) {
	return function(){remove_certificate(cert_id);};
}

function remove_certificate(cert_id) {
	var cert_row = document.querySelector('#certificate_row-' + cert_id);
	cert_row.parentNode.removeChild(cert_row);
}

function get_update_certificate_list_function(table) {
	return function(){update_certificate_list(table);};
}

function update_certificate_list(table) {

}

function get_add_certificate_function(table, field_list) {
	return function(){add_certificate(table, field_list);};
}

function add_certificate(table, field_list) {

}

function update_user_settings(response) {
	sessionStorage.setItem('kontti_settings', JSON.stringify(response['data']['personal']));
}

function get_year_date_selector(id, fulldate) {
	// Get the year and month from date, the Date-object does not understand YYYY-MM-DD format so we do it manually
	var year = parseInt(fulldate.split('-')[0]);
	var month = parseInt(fulldate.split('-')[1]);

	var year_date_div = document.createElement('div');
	var year_field = document.createElement('select');
	year_field.setAttribute('id', id + '-year');
	year_field.title = 'Select year';

	for (var i = 1990; i <= (new Date()).getFullYear(); i++) {
		var opt = new Option(i, i);

		if (i === year) {
			opt.selected = true;
		}

		year_field.options.add(opt);
	}


	var month_field = document.createElement('select');
	month_field.setAttribute('id', id + '-month');
	month_field.title = 'Select month';

	for (var j = 1; j < 13; j++) {
		var opt = new Option(j, j);

		if (j === month) {
			opt.selected = true;
		}

		month_field.options.add(opt);
	}

	year_date_div.appendChild(year_field);
	year_date_div.appendChild(month_field);
	return year_date_div;
}
/*************************************************** USER SETTINGS ***************************************************/

/******************************************************  ADMIN  ******************************************************/
/**
 *
 */

function get_admin_function() {
	return (function () {
		admin()
	});
}

function admin() {
	sessionStorage.setItem('kontti_mode', 'admin');
	display_action_buttons();
}

function show_admin() {
	/* TODO: Populate the action div */
	var data_action_elem = document.querySelector('#' + MAINDATAACTIONID);
	var button_div = document.createElement('div');
	button_div.id = 'admin_action';

	/* Fill management */
	var fill_mgmnt_button = document.createElement('button');
	fill_mgmnt_button.innerHTML = 'Fill management';
	fill_mgmnt_button.id = 'fill_management_btn';
	fill_mgmnt_button.addEventListener('click', get_fill_mgmnt_function());
	button_div.appendChild(fill_mgmnt_button);

	/* User management */
	var user_mgmnt_button = document.createElement('button');
	user_mgmnt_button.innerHTML = 'User management';
	user_mgmnt_button.id = 'user_management_btn';
	user_mgmnt_button.addEventListener('click', get_user_mgmnt_function());
	button_div.appendChild(user_mgmnt_button);

	/* Back to fills */
	button_div.appendChild(get_back_to_fill_button());
	button_div.appendChild(get_user_settings_button());
	button_div.appendChild(get_logout_button());
	data_action_elem.appendChild(button_div);
}

function get_back_to_fill_button() {
	var back_button = document.createElement('button');
	back_button.innerHTML = 'Back to fill';
	back_button.id = 'back';
	back_button.addEventListener('click', get_back_button_function());
	return back_button;
}

function get_user_mgmnt_function() {
	return (function () {
		user_mgmnt();
	});
}

function user_mgmnt() {
	// TODO: Add user management functionality
}

function get_back_button_function() {
	return (function () {
		back_button();
	});
}

function back_button() {
	empty_data();
	sessionStorage.setItem('kontti_mode', 'main');
	show_main();
}

function display_user_fill_data(json) {
	var data_elem = document.querySelector('#' + DATAAREAID);

	if (!json['data'].length) {
		data_elem.innerHTML = 'No users available. This should not happen';
		return;
	}

	var users_table = document.createElement('table');
	users_table.setAttribute('border', '1');
	users_table.appendChild(get_users_table_header());

	for (var i = 0; i < json['data'].length; i++) {
		var data_row = document.createElement('tr');

		Object.keys(json['data'][i]).forEach(function (key, index) {
			var val_cell = document.createElement('td');
			val_cell.id = key + '-' + i;
			val_cell.style.textAlign = 'right';
			val_cell.innerHTML = json['data'][i][key];
			data_row.appendChild(val_cell);
		});

		var edit_cell = document.createElement('td');
		edit_cell.id = 'edit_cell' + '-' + i;
		edit_cell.style.textAlign = 'right';

		var edit_button = document.createElement('button');
		edit_button.innerText = 'Edit user fills';
		edit_button.id = 'edit_button-' + json['data'][i]['uid'];
		edit_button.addEventListener('click', get_edit_user_fill_function(data_row, i + 2, json['data'][i]['uid'], 'open'));
		edit_cell.appendChild(edit_button);
		data_row.appendChild(edit_cell);

		users_table.appendChild(data_row);
	}

	data_elem.appendChild(users_table);
}

function get_edit_user_fill_function(data_row, row, uid, action) {
	return function () {
		edit_user_fill(data_row, row, uid, action)
	};
}

function edit_user_fill(data_row, row, uid, action) {
	var edit_button = document.querySelector('#edit_button-' + uid);
	// Workaround to remove and replace the eventListener
	var clone_button = edit_button.cloneNode(true);
	edit_button.parentNode.replaceChild(clone_button, edit_button);

	if (action === 'open') {
		// First we toggle the button action to close
		clone_button.addEventListener('click', get_edit_user_fill_function(data_row, row, uid, 'close'));
		// Open the edit row for the given user
		var edit_tr = document.createElement('tr');
		edit_tr.id = 'tr_edit_row-' + uid;
		data_row.parentNode.insertBefore(edit_tr, data_row.nextSibling);
		var edit_td = edit_tr.insertCell(0);
		edit_td.colSpan = 15;
		get_user_unpaid_fills(uid, edit_td);
	} else if (action === 'close') {
		// First we toggle the button action to open
		clone_button.addEventListener('click', get_edit_user_fill_function(data_row, row, uid, 'open'));
		var edit_row = document.querySelector('#tr_edit_row-' + uid);
		edit_row.parentNode.removeChild(edit_row);
	}
}

function get_user_fill_edit_form(response) {
	if (!('fills' in response['data'])) {
		return document.createTextNode(response[KEY_REASON]);
	}

	if (response['data']['fills'].length === 0) {
		return document.createTextNode('User has no fills');
	}

	var counter = {
		'cyl_count': 0,
		'o2_volume': 0,
		'he_volume': 0
	};

	var uid = response['data']['uid'];
	var edit_form = document.createElement('form');
	// Store the uid
	var uid_hidden = document.createElement('input');
	uid_hidden.setAttribute('type', 'hidden');
	uid_hidden.setAttribute('value', uid);
	edit_form.appendChild(uid_hidden);

	var editor_table = document.createElement('table');
	editor_table.appendChild(get_user_edit_header());

	for (var i = 0; i < response['data']['fills'].length; i++) {
		var editor_row = document.createElement('tr');

		// Object.keys(response['data']['fills'][i]).forEach(function (key, index) {
		for (var key in FILLEDITORFIELDS) {
			// We jump over the first which is the fill id
			// if (index > 0) {
			var val_cell = document.createElement('td');
			val_cell.id = key + '-' + i;
			val_cell.style.textAlign = 'right';
			val_cell.innerHTML = response['data']['fills'][i][key];
			editor_row.appendChild(val_cell);
			// }
			// });
		}

		counter['cyl_count']++;
		if (response['data']['fills'][i]['gas_key'] === 'o2') counter['o2_volume'] += parseInt(response['data']['fills'][i]['o2_vol']);
		counter['he_volume'] += parseInt(response['data']['fills'][i]['he_vol']);

		var editor_checkbox_cell = document.createElement('td');
		var check_box = document.createElement('input');
		check_box.type = 'checkbox';
		check_box.id = 'mark_fill-' + uid + '-' + response['data']['fills'][i]['fill_id'];
		editor_checkbox_cell.appendChild(check_box);
		editor_checkbox_cell.style.textAlign = 'center';
		editor_checkbox_cell.style.verticalAlign = 'middle';
		editor_row.appendChild(editor_checkbox_cell);
		editor_table.appendChild(editor_row);
	}

	var sum_row = document.createElement('tr');
	var total_cell = document.createElement('td');
	total_cell.colSpan = 4;
	total_cell.innerHTML = 'Total';
	total_cell.style.textAlign = 'left';
	sum_row.appendChild(total_cell);

	var cyl_sum_cell = document.createElement('td');
	cyl_sum_cell.innerHTML = counter['cyl_count'];
	cyl_sum_cell.style.textAlign = 'right';
	sum_row.appendChild(cyl_sum_cell);

	var o2_sum_cell = document.createElement('td');
	o2_sum_cell.innerHTML = counter['o2_volume'];
	o2_sum_cell.style.textAlign = 'right';
	sum_row.appendChild(o2_sum_cell);

	var he_sum_cell = document.createElement('td');
	he_sum_cell.innerHTML = counter['he_volume'];
	he_sum_cell.style.textAlign = 'right';
	sum_row.appendChild(he_sum_cell);

	var commit_cell = document.createElement('td');
	var commit_button = document.createElement('button');
	commit_button.addEventListener('click', get_commit_fills_function(uid));
	commit_button.innerText = 'Commit';
	commit_button.type = 'button';
	commit_cell.appendChild(commit_button);
	commit_cell.style.textAlign = 'right';
	sum_row.appendChild(commit_cell);

	editor_table.appendChild(sum_row);

	edit_form.appendChild(editor_table);

	return (edit_form);
}

function get_commit_fills_function(uid) {
	"use strict";
	return (function () {
		commit_fills(uid);
	});
}

function commit_fills(uid) {
	// Collect all the checkboxes for the given uid
	var elements = document.querySelectorAll("input[id^='mark_fill-" + uid + "-']");
	// Request json

	var request_data = {
		'object': 'user',
		'action': 'update',
		'target': ['mark_counted_fills'],
		'uid': uid,
		'data': []
	};
	// Go through them, checking which are marked
	var i = 0;

	for (var index = 0; index < elements.length; index++) {
		if (elements[index].checked) {
			var fillId = parseInt(elements[index].id.split('-')[2]);
			request_data['data'].push({'id': fillId});
			i++;
		}
	}

	var callback = function (xhr) {
		if (xhr.readyState === 4 && xhr.status === 200) {
			var json = JSON.parse(xhr.responseText);
			add_info('Return value: ' + json);

			if (json[KEY_STATUS] === STATUS_OK) {
				empty_info();
				add_info('Fill data retrieved');
				fill_mgmnt();
			} else {
				add_info('Could not update the fill status');

				if (json[KEY_REASON] !== null) {
					add_info(json[KEY_REASON]);
				}
			}
		}
	};

	send_json_request(request_data, 'admin.php', callback);
}

function get_user_edit_header() {
	var header_tr = document.createElement('tr');
	var labels = ['Date', 'Fill type', 'Cylinder type', 'Cylinder name', 'Nominal pressure', 'Start pressure', 'End pressure', 'O2 volume', 'He volume', 'Mark as paid'];

	for (var key in FILLEDITORFIELDS) {
		var cell = document.createElement('td');
		cell.style.padding = '10px';
		cell.style.backgroundColor = 'grey';
		cell.innerHTML = FILLEDITORFIELDS[key];
		header_tr.appendChild(cell);
	}

	return header_tr;
}

function get_users_table_header() {
	var header_tr = document.createElement('tr');
	header_tr.id = 'tr_header';
	var field_array = [
		'userID',
		'GroupID',
		'Login',
		'Level',
		'Full name',
		'Account enabled',
		'O2 used total (l)',
		'He used total (l)',
		'Unpaid O2 (l)',
		'Unpaid He (l)',
		'Air fills',
		'Nx fills',
		'O2 fills',
		'Tx fills'
	];

	for (var i = 0; i < field_array.length; i++) {
		var td_elem = document.createElement('td');
		td_elem.innerHTML = field_array[i];
		header_tr.appendChild(td_elem);
	}

	var lock_elem = document.createElement('td');
	lock_elem.innerHTML = 'Modify user';
	header_tr.appendChild(lock_elem);

	return (header_tr);
}

function get_fill_mgmnt_function() {
	return (function () {
		fill_mgmnt();
	});
}

function fill_mgmnt() {
	var request_data = {
		'object': 'user',
		'action': 'get',
		'target': ['user_all', 'gas_total', 'gas_unpaid_l', 'fill_total']
	};

	var callback = function (xhr) {
		if (xhr.readyState === 4 && xhr.status === 200) {
			var json = JSON.parse(xhr.responseText);
			add_info('Return value: ' + json);

			if (json[KEY_STATUS] === STATUS_OK) {
				empty_info();
				empty_data();
				add_info('Fill data retrieved');
				display_user_fill_data(json);
			} else {
				add_info('Could not get the user fill data');

				if (json[KEY_REASON] !== null) {
					add_info(json[KEY_REASON]);
				}
			}
		}
	};

	send_json_request(request_data, 'admin.php', callback);
}

function get_user_unpaid_fills(uid, parent_element) {
	var request_data = {
		'object': 'user',
		'action': 'get',
		'target': ['unpaid_fills'],
		'uid': uid
	};

	var callback = function (xhr) {
		if (xhr.readyState === 4 && xhr.status === 200) {
			var json = JSON.parse(xhr.responseText);
			add_info('Return value: ' + json);

			if (json[KEY_STATUS] === STATUS_OK) {
				empty_info();
				// empty_data();
				add_info('User data for edit retrieved');
				parent_element.appendChild(get_user_fill_edit_form(json));
			} else {
				add_info('Could not get the user data');

				if (json[KEY_REASON] !== null) {
					add_info(json[KEY_REASON]);
				}
			}
		}
	};

	send_json_request(request_data, 'admin.php', callback);
}

/****************************************************** /ADMIN  ******************************************************/

/**
 * get_show_fill_ref: Helper function to attach the add_gas_fill_row-function to an action
 * @param type
 * @return {Function}
 */

function get_show_fill_ref(type) {
	return (function () {
		add_gas_fill_row(type)
	})
}

/**
 * add_gas_fill_row: Adds the necessary gasfill fields depending of the type of fill
 * @param type What type of fill is it, see TYPELIST first field
 * @return void
 */

function add_gas_fill_row(type) {
	var id = get_next_fill_id();
	var my_filllist_elem = document.querySelector('#' + DATAAREATABLEID);
	var gas_tr = document.createElement('tr');
	gas_tr.id = FILLROWPREFIX + id;

	var gas_td_type = document.createElement('td');
	gas_td_type.innerHTML = id + ': ' + type + ' fill';

	var gas_level = document.createElement('input');
	gas_level.setAttribute('type', 'hidden');
	gas_level.setAttribute('value', type);
	gas_level.id = GASLEVELPREFIX + id;
	gas_td_type.appendChild(gas_level);
	gas_td_type.id = 'td_' + GASLEVELPREFIX + id;
	gas_tr.appendChild(gas_td_type);

	var gas_td_level = document.createElement('td');
	gas_td_level.appendChild(get_fill_type_select(id, type));
	gas_td_level.id = 'td_' + FILLTYPEPREFIX + id;
	gas_tr.appendChild(gas_td_level);

	var gas_td_cyl = document.createElement('td');
	gas_td_cyl.appendChild(get_cylinder_select(id));
	gas_td_cyl.id = 'td_' + FILLCYLIDPREFIX + id;
	gas_tr.appendChild(gas_td_cyl);

	var n = 6;

	if (type !== 'air') {
		var gas_td_bar_start = document.createElement('td');
		gas_td_bar_start.appendChild(get_amount_select(0, 350, 'Pressure before fill', FILLCYLPRESSSTARTPREFIX + id));
		gas_td_bar_start.id = 'td_' + FILLCYLPRESSSTARTPREFIX + id;
		gas_tr.appendChild(gas_td_bar_start);

		var gas_td_bar_end = document.createElement('td');
		gas_td_bar_end.appendChild(get_amount_select(1, 350, 'Pressure after fill', FILLCYLPRESSENDPREFIX + id));
		gas_td_bar_end.id = 'td_' + FILLCYLPRESSENDPREFIX + id;
		gas_tr.appendChild(gas_td_bar_end);
		n = 4;

		if (type !== 'o2') {
			var gas_td_o2_start = document.createElement('td');
			gas_td_o2_start.appendChild(get_amount_select(0, 100, 'O2 percentage before fill', FILLCYLO2PCNTSTARTPREFIX + id));
			gas_td_o2_start.id = 'td_' + FILLCYLO2PCNTSTARTPREFIX + id;
			gas_tr.appendChild(gas_td_o2_start);

			var gas_td_o2_end = document.createElement('td');
			gas_td_o2_end.appendChild(get_amount_select(1, 100, 'O2 percentage after fill', FILLCYLO2PCNTENDPREFIX + id));
			gas_td_o2_end.id = 'td_' + FILLCYLO2PCNTENDPREFIX + id;
			gas_tr.appendChild(gas_td_o2_end);
			n = 2;

			if (type !== 'nx') {
				var gas_td_he_start = document.createElement('td');
				gas_td_he_start.appendChild(get_amount_select(0, 100, 'He percentage before fill', FILLCYLHEPCNTSTARTPREFIX + id));
				gas_td_he_start.id = 'td_' + FILLCYLHEPCNTSTARTPREFIX + id;
				gas_tr.appendChild(gas_td_he_start);

				var gas_td_he_end = document.createElement('td');
				gas_td_he_end.appendChild(get_amount_select(1, 100, 'He percentage after fill', FILLCYLHEPCNTENDPREFIX + id));
				gas_td_he_end.id = 'td_' + FILLCYLHEPCNTENDPREFIX + id;
				gas_tr.appendChild(gas_td_he_end);
				n = 0;
			}
		}
	}

	/* Add empty cells */
	for (var i = 0; i < n; i++) {
		gas_tr.appendChild(document.createElement('td'));
	}

	/* Finally add the row removal button */
	gas_tr.appendChild(get_removal_cell(id));
	my_filllist_elem.appendChild(gas_tr);
}


function get_fill_type_select(id, type) {
	"use strict";
	var fill_type_select = document.createElement('select');
	fill_type_select.id = FILLTYPEPREFIX + id;
	fill_type_select.title = 'Select type of fill';
	var preferred = '';

	/* Try to figure out which is the preferred fill type for the given gas type
	 * TODO: May be something else but VID */
	switch (type) {
		case 'air':
		case 'nx':
		case 'o2':
		case 'tx':
			preferred = 'vid';
			break;
	}

	for (var key in FILLTYPELIST) {
		var op = new Option(FILLTYPELIST[key][0], key);
		op.defaultSelected = (key === preferred);
		fill_type_select.options.add(op);
	}

	return (fill_type_select);
}

/**
 * get_cylinder_select: Returns an select element with the most common cylinder sizes
 * @return {Element}
 */

function get_cylinder_select(id) {
	var cylinder_select = document.createElement('select');
	cylinder_select.id = FILLCYLIDPREFIX + id;
	cylinder_select.title = 'Select cylinder';

	var cylinder_list = JSON.parse(sessionStorage.getItem('kontti_cylinder_list'))

	for (var i = 0; i < cylinder_list.length; i++) {
		cylinder_select.options.add(new Option(cylinder_list[i]['name'] + ' ' + cylinder_list[i]['type_name'] + ' ' + cylinder_list[i]['identifier'], cylinder_list[i]['cylinder_id']));
	}

	return (cylinder_select);
}

/**
 * get_amount_select: Generic select-element is returned which has a running number as value
 * @param from
 * @param to
 * @param title
 * @param id
 * @return {Element}
 */

function get_amount_select(from, to, title, id) {
	var amount_select = document.createElement('input');
	amount_select.type = 'number';
	amount_select.id = id;
	amount_select.title = title;
	amount_select.setAttribute('min', from);
	amount_select.setAttribute('max', to);
	return (amount_select);
}

/**
 * get_check_button: Returns an check-button for the gas fill block
 * @return {Element}
 */

function get_check_button() {
	var add_button = document.createElement('button');
	add_button.innerHTML = 'Check fill(s)';
	add_button.style.backgroundColor = '#99CC99';
	add_button.onclick = get_check_data_function();
	return (add_button);
}

/**
 * get_save_data_button: Returns a clear button for the form
 * @param button_id
 * @return {Element}
 */

function get_save_data_button(button_id) {
	var clear_button = document.createElement('button');
	clear_button.innerHTML = 'Save fill(s)';
	clear_button.id = button_id;
	clear_button.onclick = get_save_data_function();
	clear_button.style.backgroundColor = '#CC9999';
	return (clear_button);
}

function get_save_data_function() {
	return (function () {
		save_data()
	});
}

/**
 * get_next_fill_id: Get's the next free id and bumps the counter up
 * @return {number}
 */

function get_next_fill_id() {
	var my_id = next_id;
	next_id++;
	return (my_id);
}

/**
 * get_removal_cell: Creates and returns a cell with the remove-button
 * @param id identification number of the row
 * @return {Element}
 */

function get_removal_cell(id) {
	var td_cell = document.createElement('td');
	var removal_button = document.createElement('button');
	removal_button.backgroundColor = '#CC6060';
	removal_button.innerHTML = 'Remove fill';
	removal_button.onclick = get_remove_fill_row_function(id);
	td_cell.appendChild(removal_button);
	return (td_cell);
}

function get_remove_fill_row_function(id) {
	return (function () {
		remove_fill_row(id)
	});
}

/**
 * remove_fill_row: Remove the row from the fill table by the given id. Please note that the id may be different from
 *                  the row number, as other rows may have been removed previously
 * @param id identification number of the row
 * @return {void}
 */
function remove_fill_row(id) {
	var row_elem = document.querySelector('#' + FILLROWPREFIX + id);
	row_elem.parentNode.removeChild(row_elem);
}

function get_check_data_function() {
	return (function () {
		check_data()
	});
}

/**
 * save_data: Verifies and sends the given data to the server
 * @return {void}
 */

function save_data() {
	var request_data = [];

	var table = document.querySelector('#' + DATAAREATABLEID);
	var num_rows = table.childElementCount;

	/* There is the header row*/
	if (num_rows < 2) {
		alert('No fills added');
		return;
	}

	/* Try to fetch any id from 0 to max value */
	for (var i = 0; i < next_id; i++) {
		var row = document.querySelector('#' + FILLROWPREFIX + i);
		if (row !== null) {
			request_data.push(get_fill_data(i));
		}
	}

	var callback = function (xhr) {
		if (xhr.readyState === 4 && xhr.status === 200) {
			var json = JSON.parse(xhr.responseText);

			if (json[KEY_STATUS] === STATUS_OK) {
				empty_info();
				empty_data();
				show_main();
				add_info('Fill data store successfully');
			} else {
				add_info(json[KEY_REASON]);
			}
		}
	};

	send_json_request(request_data, 'add_data.php', callback);
}

/**
 * get_fill_data: Collects the fed data from the form and verifies it
 * @param id
 * @return {[null,null,null,null,null,null,null,null,null]}
 */

function get_fill_data(id) {
	var data_array = [null, null, null, null, null, null, null, null, null, null, null, null, null];

	data_array[0] = get_gas_level(id);
	data_array[1] = get_fill_type(id);
	data_array[2] = get_cylinder_id(id);

	if (data_array[0] !== 'air') {
		data_array[5] = get_cylinder_start_pressure(id);
		data_array[6] = get_cylinder_end_pressure(id);
		data_array[11] = data_array[3] * data_array[4] * (data_array[6] - data_array[5]);

		if (data_array[0] !== 'o2') {
			data_array[7] = get_cylinder_o2_start_percentage(id);
			data_array[8] = get_cylinder_o2_end_percentage(id);
			data_array[11] = data_array[3] * data_array[4] * (data_array[6] * data_array[8] - data_array[5] * data_array[7]) / 100;

			if (data_array[0] !== 'nx') {
				data_array[9] = get_cylinder_he_start_percentage(id);
				data_array[10] = get_cylinder_he_end_percentage(id);
				data_array[12] = data_array[3] * data_array[4] * (data_array[6] * data_array[10] - data_array[5] * data_array[9]) / 100;
			}
		}
	}

	// TODO: Verify the data
	return (data_array);
}

function get_gas_level(id) {
	return (document.querySelector('#' + GASLEVELPREFIX + id).value);
}

function get_fill_type(id) {
	return (document.querySelector('#' + FILLTYPEPREFIX + id).value);
}

function get_cylinder_id(id) {
	return (document.querySelector('#' + FILLCYLIDPREFIX + id).options[document.querySelector('#' + FILLCYLIDPREFIX + id).selectedIndex].value);
}

function get_cylinder_start_pressure(id) {
	return (parseInt(document.querySelector('#' + FILLCYLPRESSSTARTPREFIX + id).value));
}

function get_cylinder_end_pressure(id) {
	return (parseInt(document.querySelector('#' + FILLCYLPRESSENDPREFIX + id).value));
}

function get_cylinder_o2_start_percentage(id) {
	return (parseInt(document.querySelector('#' + FILLCYLO2PCNTSTARTPREFIX + id).value));
}

function get_cylinder_o2_end_percentage(id) {
	return (parseInt(document.querySelector('#' + FILLCYLO2PCNTENDPREFIX + id).value));
}

function get_cylinder_he_start_percentage(id) {
	return (parseInt(document.querySelector('#' + FILLCYLHEPCNTSTARTPREFIX + id).value));
}

function get_cylinder_he_end_percentage(id) {
	return (parseInt(document.querySelector('#' + FILLCYLHEPCNTENDPREFIX + id).value));
}

function get_login() {
	return (document.querySelector('#login').value);
}

function get_password() {
	return (document.querySelector('#password').value);
}

/**
 * check_data: Goes through each fill row and calls the row verification for each id
 * @return {boolean}
 */
function check_data() {
	/* Try to fetch any id from 0 to max value */
	var ret_val = true;

	for (var i = 0; i < next_id; i++) {
		var selector = '#' + FILLROWPREFIX + i;

		var row = document.querySelector(selector);
		if (row !== null) {
			if (!verify_row_data(i)) {
				ret_val = false;
			}
		}
	}

	return (ret_val);
}

/**
 * verify_row_data: Checks that the fed information is consistent
 * @param id
 * @return {boolean}
 */

function verify_row_data(id) {
	var type = get_gas_level(id);
	var ret_val = true;

	if (type !== 'air') {
		// Make sure the end pressure is not lower than the start pressure
		if (get_cylinder_end_pressure(id) < get_cylinder_start_pressure(id)) {
			mark_red('td_' + FILLCYLPRESSSTARTPREFIX + id);
			mark_red('td_' + FILLCYLPRESSENDPREFIX + id);
			add_info('The end pressure is lower than the start pressure');
			ret_val = false;
		}

		if (type !== 'o2') {
			// Make sure the fill did not require more than 100% o2
			if (is_overfill_gas(get_cylinder_start_pressure(id), get_cylinder_end_pressure(id), get_cylinder_o2_start_percentage(id), get_cylinder_o2_end_percentage(id))) {
				mark_red('td_' + FILLCYLO2PCNTSTARTPREFIX + id);
				mark_red('td_' + FILLCYLO2PCNTENDPREFIX + id);
				add_info('The fill would require you to use over 100% oxygen (you can not get to the given end O2% even if you used 100% oxygen');
				ret_val = false;
			} else if (is_negative_gas(get_cylinder_start_pressure(id), get_cylinder_end_pressure(id), get_cylinder_o2_start_percentage(id), get_cylinder_o2_end_percentage(id))) {
				mark_red('td_' + FILLCYLO2PCNTSTARTPREFIX + id);
				mark_red('td_' + FILLCYLO2PCNTENDPREFIX + id);
				add_info('The amount of oxygen in the cylinder is less after the fill than what it contained in the beginning');
				ret_val = false;
			}

			if (type !== 'nx') {
				// Make sure the sum of start O2 and He is not over 100
				if (get_cylinder_o2_start_percentage(id) + get_cylinder_he_start_percentage(id) > 100) {
					mark_red('td_' + FILLCYLO2PCNTSTARTPREFIX + id);
					mark_red('td_' + FILLCYLHEPCNTSTARTPREFIX + id);
					add_info('The sum of O2% (' + get_cylinder_o2_start_percentage(id) + ') and He% (' + get_cylinder_he_start_percentage(id) + ') is more (' +
						(get_cylinder_o2_start_percentage(id) + get_cylinder_he_start_percentage(id)) + ') than 100% at beginning');
					ret_val = false;
				}
				// Make sure the sum of end O2 and He is not over 100
				if (get_cylinder_o2_end_percentage(id) + get_cylinder_he_end_percentage(id) > 100) {
					mark_red('td_' + FILLCYLO2PCNTENDPREFIX + id);
					mark_red('td_' + FILLCYLHEPCNTENDPREFIX + id);
					add_info('The sum of O2 and He partial pressure add is larger than the whole fill at the end');
					ret_val = false;
				}
				// Make sure the fill did not require more than 100% he
				if (is_overfill_gas(get_cylinder_start_pressure(id), get_cylinder_end_pressure(id), get_cylinder_he_start_percentage(id), get_cylinder_he_end_percentage(id))) {
					mark_red('td_' + FILLCYLHEPCNTSTARTPREFIX + id);
					mark_red('td_' + FILLCYLHEPCNTENDPREFIX + id);
					add_info('The fill would require you to use over 100% helium (you can not get to the given end He% even if you used 100% helium');
					ret_val = false;
				} else if (is_negative_gas(get_cylinder_start_pressure(id), get_cylinder_end_pressure(id), get_cylinder_he_start_percentage(id), get_cylinder_he_end_percentage(id))) {
					mark_red('td_' + FILLCYLHEPCNTSTARTPREFIX + id);
					mark_red('td_' + FILLCYLHEPCNTENDPREFIX + id);
					add_info('The amount of helium in the cylinder is less after the fill than what it contained in the beginning');
					ret_val = false;
				}
			}
		}
	}

	return (ret_val);
}

/**
 * is_overfill_gas: Tells whether the change in the fraction is larger than the total change
 * @param press_start
 * @param press_end
 * @param fraction_start
 * @param fraction_end
 * @return {boolean}
 */

function is_overfill_gas(press_start, press_end, fraction_start, fraction_end) {
	var fraction_press_start = fraction_start * press_start / 100.0;
	var fraction_press_end = fraction_end * press_end / 100.0;
	var total_gas_diff = press_end - press_start;
	var fraction_gas_diff = fraction_press_end - fraction_press_start;
	return (total_gas_diff < fraction_gas_diff);
}

/**
 * is_negative_gas: Tells whether there is less gas in the end than in the beginning
 * @param press_start
 * @param press_end
 * @param fraction_start
 * @param fraction_end
 * @returns {boolean}
 */

function is_negative_gas(press_start, press_end, fraction_start, fraction_end) {
	var fraction_press_start = fraction_start * press_start / 100.0;
	var fraction_press_end = fraction_end * press_end / 100.0;
	return (fraction_press_end < fraction_press_start);
}

/**
 * mark_red: With the given id (which is full ID, not just the number), set the background color red
 * @param id
 * @return {void}
 */

function mark_red(id) {
	var entity = document.querySelector('#' + id);
	entity.style.backgroundColor = '#FF3030';
}

/**
 * empty_info: Empty the info-area
 */

function empty_info() {
	var info_div = document.querySelector('#' + INFOID);
	info_div.innerHTML = '';
}

/**
 * empty_data: Empty the data-area
 */

function empty_data() {
	var info_div = document.querySelector('#' + DATAAREAID);
	info_div.innerHTML = '';
}

/**
 * add_info: Add a paragraph of info to the info-div
 * @param message
 */

function add_info(message) {
	var info_div = document.querySelector('#' + INFOID);
	var new_par = document.createElement('p');
	new_par.innerHTML = message;
	info_div.appendChild(new_par);
}

/**
 * show_login: Prepare for showing the login
 */

function show_login() {
	/* Clear the action div */
	var action_div = document.querySelector('#' + MAINDATAACTIONID);
	action_div.innerHTML = '';
	/* Clear the data div */
	var data_div = document.querySelector('#' + DATAAREAID);
	data_div.innerHTML = '';
	/* Clear the info div */
	var info_div = document.querySelector('#' + INFOID);
	info_div.innerHTML = '';
	/* Create the login form */
	action_div.appendChild(get_login_form());
}

/**
 * get_login_form: Constructs and returns the login form
 * @returns {Element}
 */

function get_login_form() {
	var login_form = document.createElement('form');
	login_form.id = 'login_form';
	login_form.setAttribute('onsubmit', 'return false');
	var login_username = document.createElement('input');
	login_username.setAttribute('placeholder', 'Username');
	login_username.id = 'login';
	var login_password = document.createElement('input');
	login_password.setAttribute('placeholder', 'Password');
	login_password.id = 'password';
	var login_button = document.createElement('button');
	login_button.innerHTML = 'Login';
	login_button.onclick = get_verify_login_function();
	login_password.setAttribute('type', 'password');
	login_form.appendChild(login_username);
	login_form.appendChild(login_password);
	login_form.appendChild(login_button);

	return (login_form);
}

/**
 * get_verify_login_function: Return a reference to the login verification function
 * @returns {Function}
 */

function get_verify_login_function() {
	return (function () {
		verify_login();
	});
}

/**
 * verify_login: Send the credentials to server for verification
 */

function verify_login() {
	/* Connect to server and verify the login credentials */
	var request_data = {
		'type': 'login',
		'login': get_login(),
		'password': get_password()
	};

	var callback = function (xhr) {
		if (xhr.readyState === 4 && xhr.status === 200) {
			var json = JSON.parse(xhr.responseText);
			add_info('Return value: ' + json);

			if (json[KEY_STATUS] === STATUS_OK) {
				empty_info();
				add_info('User logged in successfully');
				sessionStorage.setItem('kontti_mode', 'main');
				sessionStorage.setItem('kontti_enabled', json['enabled']);
				sessionStorage.setItem('kontti_level', json['level']);
				display_action_buttons();
			} else {
				add_info('User not logged in');

				if (json[KEY_REASON] !== null) {
					add_info(json[KEY_REASON]);
				}
			}
		}
	};

	send_json_request(request_data, 'login.php', callback);
}

/**
 * get_logout_function: Return a reference to the logout function
 * @returns {Function}
 */

function get_logout_function() {
	return (function () {
		logout();
	});
}

/**
 * logout: Close the session
 */

function logout() {
	/* TODO: Connect to server and verify the login credentials */
	var request_data = {'type': 'logout'};

	var callback = function (xhr) {
		if (xhr.readyState === 4 && xhr.status === 200) {
			var json = JSON.parse(xhr.responseText);
			add_info('Return value: ' + json);

			if (json[KEY_STATUS] === STATUS_OK) {
				empty_info();
				add_info('User logged in successfully');
				sessionStorage.clear();
				display_action_buttons();
			} else {
				add_info('Failed to log out, please contact maintainers');

				if (json[KEY_REASON] !== null) {
					add_info(json[KEY_REASON]);
				}
			}
		}
	};

	send_json_request(request_data, 'logout.php', callback);
}

/******************************************************  STATS  ******************************************************/
/**
 * get_stats_function: Returns reference to the stats-function
 * @returns {Function}
 */

function get_stats_function() {
	return (function () {
		stats();
	})
}

/**
 *
 */
function stats() {
	sessionStorage.setItem('kontti_mode', 'stats');
	display_action_buttons();
	// TODO: Empty the main div
}

function show_stats() {
	/* TODO: Populate the action div */
	var data_action_elem = document.querySelector('#' + MAINDATAACTIONID);
	var button_div = document.createElement('div');
	button_div.id = 'stats_action';

	/* List users */
	var own_button = document.createElement('button');
	own_button.innerHTML = 'Show your own stats';
	own_button.id = 'own_stats';
	own_button.addEventListener('click', get_own_stats_function());
	button_div.appendChild(own_button);

	/* List general stats */
	var general_stats_button = document.createElement('button');
	general_stats_button.innerHTML = 'Show general stats';
	general_stats_button.id = 'general_stats';
	general_stats_button.addEventListener('click', get_general_stats_function());
	button_div.appendChild(general_stats_button);

	if (sessionStorage.getItem('kontti_level') > 40) {
		var users_button = document.createElement('button');
		users_button.innerHTML = 'Show user statistics';
		users_button.id = 'users_stats';
		users_button.addEventListener('click', get_user_stats_function());
		button_div.appendChild(users_button);
	}

	button_div.appendChild(get_back_to_fill_button());
	button_div.appendChild(get_user_settings_button());
	button_div.appendChild(get_logout_button());

	data_action_elem.appendChild(button_div);
}

//----------------------------------- Own stats
function get_own_stats_function() {
	"use strict";
	return (function () {
		get_own_stats();
	});
}

function get_own_stats() {
	var request_data = {
		'object': 'self',
		'action': 'get'
	};

	var callback = function (xhr) {
		if (xhr.readyState === 4 && xhr.status === 200) {
			var response = JSON.parse(xhr.responseText);

			if (response[KEY_STATUS] === STATUS_OK) {
				// empty_info();
				add_info('Own status retrieved');
				show_basic_stats(response);
			} else {
				add_info('Failed to log out, please contact maintainers');

				if (response[KEY_REASON] !== null) {
					add_info(response[KEY_REASON]);
				}
			}
		}
	};

	send_json_request(request_data, 'stats.php', callback);
}

function show_basic_stats(response) {
	empty_data();
	print_gas_consumption(response['data']['gas_volume'], 'Gas used');
	print_stat_table(response['data']['fill_type'], "Sorted by fill type");
	print_stat_table(response['data']['gas_type'], "Sorted by gas type");
	print_stat_table(response['data']['cyl_type'], "Sorted by cylinder type");
}

function print_gas_consumption(arr, header) {
	"use strict";
	var data_elem = document.querySelector('#' + DATAAREAID);

	var header_elem = document.createElement('h2');
	header_elem.innerHTML = header;
	data_elem.appendChild(header_elem);

	var gas_table = document.createElement('table');
	gas_table.setAttribute('border', '1');

	var header_row = document.createElement('tr');

	var cell1 = document.createElement('td');
	cell1.innerHTML = "Oxygen (l)";
	header_row.appendChild(cell1);

	var cell2 = document.createElement('td');
	cell2.innerHTML = "Helium (l)";
	header_row.appendChild(cell2);
	gas_table.appendChild(header_row);

	var gas_row = document.createElement('tr');

	var cell3 = document.createElement('td');
	cell3.innerHTML = arr[0]['o2'];
	cell3.style.textAlign = 'right';
	gas_row.appendChild(cell3);

	var cell4 = document.createElement('td');
	cell4.innerHTML = arr[0]['he'];
	cell4.style.textAlign = 'right';
	gas_row.appendChild(cell4);
	gas_table.appendChild(gas_row);

	data_elem.appendChild(gas_table);
}

function print_stat_table(arr, header) {
	var data_elem = document.querySelector('#' + DATAAREAID);

	var users_table = document.createElement('table');
	users_table.setAttribute('border', '1');

	var header_row = document.createElement('tr');

	var cell1 = document.createElement('td');
	cell1.innerHTML = "Type";
	header_row.appendChild(cell1);

	var cell2 = document.createElement('td');
	cell2.innerHTML = "Count";
	header_row.appendChild(cell2);


	users_table.appendChild(header_row);

	for (var i = 0; i < arr.length; i++) {
		var data_row = document.createElement('tr');

		var key_cell = document.createElement('td');
		key_cell.innerHTML = arr[i]['stat_key'];
		data_row.appendChild(key_cell);

		var value_cell = document.createElement('td');
		value_cell.style.textAlign = 'right';
		value_cell.innerHTML = arr[i]['stat_value'];
		data_row.appendChild(value_cell);

		users_table.appendChild(data_row);
	}

	var header_elem = document.createElement('h2');
	header_elem.innerHTML = header;
	data_elem.appendChild(header_elem);
	data_elem.appendChild(users_table);

}

//----------------------------------- General stats
function get_general_stats_function() {
	"use strict";
	return (function () {
		get_general_stats();
	});
}

function get_general_stats() {
	var request_data = {
		'object': 'generic',
		'action': 'get'
	};

	var callback = function (xhr) {
		"use strict";
		if (xhr.readyState === 4 && xhr.status === 200) {
			var response = JSON.parse(xhr.responseText);

			if (response[KEY_STATUS] === STATUS_OK) {
				empty_info();
				add_info('Generic status retrieved');
				show_basic_stats(response);
			} else {
				add_info('Failed to log out, please contact maintainers');

				if (response[KEY_REASON] !== null) {
					add_info(response[KEY_REASON]);
				}
			}
		}
	};

	send_json_request(request_data, 'stats.php', callback);
}

//----------------------------------- User stats
function get_user_stats_function() {
	"use strict";
	return (function () {
		get_user_stats();
	});
}

function get_user_stats() {
	// TODO: Implement user specific stats
}

/****************************************************** /STATS  ******************************************************/

/****************************************************** GENERIC ******************************************************/

function send_json_request(request_data, URI, callback) {
	var json_data = JSON.stringify(request_data);
	/* Send the JSON to the server */
	var xhr = new XMLHttpRequest();
	xhr.open("POST", baseUrl + URI, true);
	xhr.setRequestHeader("Content-type", "application/json");

	xhr.onreadystatechange = function () {
		callback(xhr);
	};

	xhr.send(json_data);
}

//////////////////// Handle cylinder list

function fetch_cylinder_list() {
	var request_data = {
		'object': 'user',
		'action': 'get',
		'filter': 'cylinders'
	};

	var callback = function (xhr) {
		"use strict";
		if (xhr.readyState === 4 && xhr.status === 200) {
			var response = JSON.parse(xhr.responseText);

			if (response[KEY_STATUS] === STATUS_OK) {
				update_user_cylinder_list(response);
			} else {
				add_info('Failed to retrieve list of user cylinders, have you defined any?');

				if (response[KEY_REASON] !== null) {
					add_info(response[KEY_REASON]);
				}
			}
		}
	};

	send_json_request(request_data, 'cylinder_list.php', callback);
}

function update_user_cylinder_list(response) {
	var cylinder_list = [];

	for (var i = 0; i < response['data']['cylinders'].length; i++) {
		cylinder_list.push(response['data']['cylinders'][i]);
	}

	sessionStorage.setItem('kontti_cylinder_list', JSON.stringify(cylinder_list));
}

function update_cylinder_types() {
	var request_data = {
		'object': 'cylinder',
		'action': 'get'
	};

	var callback = function (xhr) {
		"use strict";
		if (xhr.readyState === 4 && xhr.status === 200) {
			var response = JSON.parse(xhr.responseText);

			if (response[KEY_STATUS] === STATUS_OK) {
				store_cylinder_types(response);
			} else {
				add_info('Failed to retrieve list of cylinder types. Problems with the network?');

				if (response[KEY_REASON] !== null) {
					add_info(response[KEY_REASON]);
				}
			}
		}
	};

	send_json_request(request_data, 'cylinder_types.php', callback);
}

function store_cylinder_types(response) {
	if (response['data']['cylinder_types'].length > 0) {
		sessionStorage.setItem('kontti_cylinder_type_list', JSON.stringify(response['data']['cylinder_types']));
	} else {
		sessionStorage.setItem('kontti_cylinder_type_list', false);
	}
}

////////////////////\\\\\\\\\\\\\\\\\\\\\
//////////////////// Handle certificate list

function update_user_certificate_list(response) {
	var certificate_list = [];

	for (var i = 0; i < response['data']['certificates'].length; i++) {
		certificate_list.push(response['data']['certificates'][i]);
	}

	sessionStorage.setItem('kontti_certificate_list', JSON.stringify(certificate_list));
}

function update_certificate_org_list(response) {
	var cert_org_list = [];

	for (var i = 0; i < response['data']['certificate_org'].length; i++) {
		cert_org_list.push(response['data']['certificate_org'][i]);
	}

	sessionStorage.setItem('kontti_cert_org_list', JSON.stringify(cert_org_list));
}

////////////////////\\\\\\\\\\\\\\\\\\\\\
