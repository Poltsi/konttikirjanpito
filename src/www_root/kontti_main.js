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
const FILLCYLTYPEPREFIX = 'cyl_type_';
const FILLCYLSIZEPREFIX = 'cyl_size_';
const FILLCYLNUMPREFIX = 'cyl_num_';
const FILLCYLPRESSSTARTPREFIX = 'cyl_start_pressure_';
const FILLCYLPRESSENDPREFIX = 'cyl_end_pressure_';
const FILLCYLO2PCNTSTARTPREFIX = 'cyl_o2_start_';
const FILLCYLO2PCNTENDPREFIX = 'cyl_o2_end_';
const FILLCYLHEPCNTSTARTPREFIX = 'cyl_he_start_';
const FILLCYLHEPCNTENDPREFIX = 'cyl_he_end_';

var next_id = 0;
/* Types of fills, fields are:
 *  0. key
 *  1. Name
 *  2. Button color
 */
const TYPELIST = [[10, 'air', 'Air fill', '#99CC99'],
    [20, 'nx', 'Nitrox fill', '#9999CC'],
    [30, 'o2', 'Oxygen fill', '#9999FF'],
    [40, 'tx', 'Trimix fill', '#CC99CC']];


const CYLLIST = {
    '40cf': ['40cf/5.7l', 5.7],
    '80cf': ['80cf/11.1l', 11.1],
    '2l': ['2l', 2.0],
    '3l': ['3l', 3.0],
    '7l': ['7l', 7.0],
    '10l': ['10l', 10.0],
    '12l': ['12l', 12.0],
    '15l': ['15l', 15.0],
    '18l': ['18l', 18.0],
    '20l': ['20l', 20.0],
    'D7': ['D7', 14.0],
    'D10': ['D10', 20.0],
    'D12': ['D12', 24.0],
    'D15': ['D15', 30.0],
    'D18': ['D18', 36.0],
    'D20': ['D20', 40.0],
    '50l': ['50l', 50.0]
};

/**
 * display_action_buttons: Shows the action buttons depending of the mode, default is to show the main action buttons
 * @return void
 */

function display_action_buttons() {
    /* TODO: Retrieve the session data */
    var mode = sessionStorage.getItem('kontti_mode');

    if (mode === null) {mode = 'login';}
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
            break;
        case 'admin':
            show_admin();
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
    var header_td1 = document.createElement('td');
    header_td1.innerHTML = '# and type';
    header_tr.appendChild(header_td1);
    var header_td2 = document.createElement('td');
    header_td2.innerHTML = 'Cylinder size';
    header_tr.appendChild(header_td2);
    var header_td3 = document.createElement('td');
    header_td3.innerHTML = 'Amount';
    header_tr.appendChild(header_td3);
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

    if (sessionStorage.getItem('kontti_enabled') === 1) {
        for (var i = 0; i < TYPELIST.length; i++) {
            if (parseInt(sessionStorage.getItem('kontti_level')) >= TYPELIST[i][0]) {
                var fill_button = document.createElement('button');
                fill_button.id = TYPELIST[i][1] + '_fill_button';
                fill_button.style.backgroundColor = TYPELIST[i][3];
                fill_button.innerHTML = TYPELIST[i][2];
                fill_button.addEventListener('click', get_show_fill_ref(TYPELIST[i][1]));
                button_div.appendChild(fill_button);
            }
        }
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

    /* Logout button */
    var logout_button = document.createElement('button');
    logout_button.id = 'logout';
    logout_button.innerHTML = 'Logout';
    logout_button.addEventListener('click', get_logout_function());
    logout_button.style = 'float: right';

    button_div.appendChild(logout_button);
    return (button_div);
}

/******************************************************  ADMIN  ******************************************************/
/**
 *
 */

function get_admin_function() {
    return (function() {admin()});
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

    /* List users */
    var users_button = document.createElement('button');
    users_button.innerHTML = 'Users';
    users_button.id = 'users_list';
    users_button.addEventListener('click', get_user_list_function());
    button_div.appendChild(users_button);

    var back_button = document.createElement('button');
    back_button.innerHTML = 'Back to fill';
    back_button.id = 'back';
    back_button.addEventListener('click', get_back_button_function());
    button_div.appendChild(back_button);


    data_action_elem.appendChild(button_div);
}

function get_user_list_function() {
    return (function() {user_list();});
}

function user_list() {
    get_user_data();
}

function get_back_button_function() {
    return(function() {back_button();});
}

function back_button() {
    empty_data();
    sessionStorage.setItem('kontti_mode', 'main');
    show_main();
}

function display_user_data(json) {
    var data_elem = document.querySelector('#' + DATAAREAID);

    if (!json['data'].length) {
        data_elem.innerHTML = 'No data available';
        return;
    }

    var users_table = document.createElement('table');
    users_table.setAttribute('border', '1');
    users_table.appendChild(get_users_table_header());

    for (var i = 0; i < json['data'].length; i++) {
        var data_row = document.createElement('tr');

        var uid_cell = document.createElement('td');
        uid_cell.innerHTML = json['data'][i]['uid'];
        data_row.appendChild(uid_cell);

        var gid_cell = document.createElement('td');
        gid_cell.innerHTML = json['data'][i]['gid'];
        data_row.appendChild(gid_cell);

        var level_cell = document.createElement('td');
        level_cell.innerHTML = json['data'][i]['level'];
        data_row.appendChild(level_cell);

        var login_cell = document.createElement('td');
        login_cell.innerHTML = json['data'][i]['login'];
        data_row.appendChild(login_cell);

        var name_cell = document.createElement('td');
        name_cell.innerHTML = json['data'][i]['name'];
        data_row.appendChild(name_cell);

        var enabled_cell = document.createElement('td');
        enabled_cell.innerHTML = json['data'][i]['enabled'] ? 'Enabled' : 'Disabled';
        data_row.appendChild(enabled_cell);

        var o2_total_cell = document.createElement('td');
        o2_total_cell.innerHTML = json['data'][i]['total_o2'];
        data_row.appendChild(o2_total_cell);

        var he_total_cell = document.createElement('td');
        he_total_cell.innerHTML = json['data'][i]['total_he'];
        data_row.appendChild(he_total_cell);

        var o2_unpaid_cell = document.createElement('td');
        o2_unpaid_cell.innerHTML = json['data'][i]['unpaid_o2'];
        data_row.appendChild(o2_unpaid_cell);

        var he_unpaid_cell = document.createElement('td');
        he_unpaid_cell.innerHTML = json['data'][i]['unpaid_he'];
        data_row.appendChild(he_unpaid_cell);

        var count_air_cell = document.createElement('td');
        count_air_cell.innerHTML = json['data'][i]['count_air'];
        data_row.appendChild(count_air_cell);

        var count_nx_cell = document.createElement('td');
        count_nx_cell.innerHTML = json['data'][i]['count_nx'];
        data_row.appendChild(count_nx_cell);

        var count_o2_cell = document.createElement('td');
        count_o2_cell.innerHTML = json['data'][i]['count_o2'];
        data_row.appendChild(count_o2_cell);

        var count_tx_cell = document.createElement('td');
        count_tx_cell.innerHTML = json['data'][i]['count_tx'];
        data_row.appendChild(count_tx_cell);

        users_table.appendChild(data_row);
    }

    data_elem.appendChild(users_table);
}

function get_users_table_header() {
    var header_tr = document.createElement('tr');
    header_tr.id = 'tr_header';
    var field_array = [
        'userID',
        'GroupID',
        'Level',
        'Login',
        'Full name',
        'Account status',
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

    return (header_tr);
}

function get_user_data() {
    var search_data = {
        'object': 'user',
        'action': 'get',
        'target': ['user_all','gas_total','gas_unpaid_l', 'fill_total']
    };

    var json_data = JSON.stringify(search_data);
    /* Send the JSON to the server */
    var xhr = new XMLHttpRequest();
    xhr.open("POST", 'http://kontti.lappari/admin.php', true);
    xhr.setRequestHeader("Content-type", "application/json");

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var json = JSON.parse(xhr.responseText);
            add_info('Return value: ' + json);

            if (json['status'] === 'OK') {
                empty_info();
                empty_data();
                add_info('User data retrieved');
                display_user_data(json)
            } else {
                add_info('Could not get the user data');

                if (json['reason'] !== null) {
                    add_info(json['reason']);
                }
            }
        }
    };

    xhr.send(json_data);
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
    var gas_type_input = document.createElement('input');
    gas_type_input.setAttribute('type', 'hidden');
    gas_type_input.setAttribute('value', type);
    gas_type_input.id = FILLTYPEPREFIX + id;
    gas_td_type.appendChild(gas_type_input);
    gas_td_type.id = 'td_' + FILLTYPEPREFIX + id;
    gas_tr.appendChild(gas_td_type);

    var gas_td_cyl = document.createElement('td');
    gas_td_cyl.appendChild(get_cylinder_select(id));
    gas_td_cyl.id = 'td_' + FILLCYLSIZEPREFIX + id;
    gas_tr.appendChild(gas_td_cyl);

    var gas_td_num = document.createElement('td');
    gas_td_num.appendChild(get_amount_select(1, 15, 'Number of cylinders', FILLCYLNUMPREFIX + id));
    gas_td_num.id = 'td_' + FILLCYLNUMPREFIX + id;
    gas_tr.appendChild(gas_td_num);

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

/**
 * get_cylinder_select: Returns an select element with the most common cylinder sizes
 * @return {Element}
 */

function get_cylinder_select(id) {
    var cylinder_select = document.createElement('select');
    cylinder_select.id = FILLCYLSIZEPREFIX + id;
    cylinder_select.title = 'Select type of cylinder';

    for (var key in CYLLIST) {
        cylinder_select.options.add(new Option(CYLLIST[key][0], key));
    }

    /* TODO: Handle the other. Show an additional field where the user may input the volume */
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
    var fill_array = [];

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
            fill_array.push(get_fill_data(i));
        }
    }

    var json_data = JSON.stringify(fill_array);

    /* Send the JSON to the server */
    var xhr = new XMLHttpRequest();
    xhr.open("POST", 'http://kontti.lappari/add_data.php', true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var json = JSON.parse(xhr.responseText);

            if (json['status'] === 'OK') {
                empty_info();
                empty_data();
                show_main();
                add_info('Fill data store successfully');
            } else {
                add_info(json['reason']);
            }
        }
    };

    xhr.send(json_data);
}

/**
 * get_fill_data: Collects the fed data from the form and verifies it
 * @param id
 * @return {[null,null,null,null,null,null,null,null,null]}
 */

function get_fill_data(id) {
    var data_array = [null, null, null, null, null, null, null, null, null, null, null, null, null];

    data_array[0] = get_fill_type(id);
    data_array[1] = 'VID';
    data_array[2] = get_cylinder_size(id);
    data_array[3] = get_cylinder_number(id);
    data_array[4] = CYLLIST[get_cylinder_size(id)][1];

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

function get_fill_type(id) {
    return (document.querySelector('#' + FILLTYPEPREFIX + id).value);
}

function get_cylinder_size(id) {
    return (document.querySelector('#' + FILLCYLSIZEPREFIX + id).options[document.querySelector('#' + FILLCYLSIZEPREFIX + id).selectedIndex].value);
}

function get_cylinder_number(id) {
    return (parseInt(document.querySelector('#' + FILLCYLNUMPREFIX + id).value));
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
    var type = get_fill_type(id);
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
    var login_data = {
        'type': 'login',
        'login': get_login(),
        'password': get_password()
    };

    var json_data = JSON.stringify(login_data);
    /* Send the JSON to the server */
    var xhr = new XMLHttpRequest();
    xhr.open("POST", 'http://kontti.lappari/login.php', true);
    xhr.setRequestHeader("Content-type", "application/json");

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var json = JSON.parse(xhr.responseText);
            add_info('Return value: ' + json);

            if (json['status'] === 'OK') {
                empty_info();
                add_info('User logged in successfully');
                sessionStorage.setItem('kontti_mode', 'main');
                sessionStorage.setItem('kontti_enabled', json['enabled']);
                sessionStorage.setItem('kontti_level', json['level']);
                display_action_buttons();
            } else {
                add_info('User not logged in');

                if (json['reason'] !== null) {
                    add_info(json['reason']);
                }
            }
        }
    };

    xhr.send(json_data);
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
    var logout_data = {'type': 'logout'};

    var json_data = JSON.stringify(logout_data);
    /* Send the JSON to the server */
    var xhr = new XMLHttpRequest();
    xhr.open("POST", 'http://kontti.lappari/logout.php', true);
    xhr.setRequestHeader("Content-type", "application/json");

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var json = JSON.parse(xhr.responseText);
            add_info('Return value: ' + json);

            if (json['status'] === 'OK') {
                empty_info();
                add_info('User logged in successfully');
                sessionStorage.clear();
                display_action_buttons();
            } else {
                add_info('Failed to log out, please contact maintainers');

                if (json['reason'] !== null) {
                    add_info(json['reason']);
                }
            }
        }
    };

    xhr.send(json_data);

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
    // TODO: Fetch the stats from server
}

/****************************************************** /STATS  ******************************************************/