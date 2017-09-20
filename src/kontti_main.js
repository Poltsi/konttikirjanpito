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
const FILLTYPEID                   = 'fill_type';
const FILLLISTID                   = 'fill_list';
const FILLLISTTABLEID              = 'fill_list_table';
const ACTIONID                     = 'action';
const FILLLISTFORMID               = 'fill_form';
const FILLROWPREFIX                = 'fill_tr_';
const FILLCYLTYPEPREFIX            = 'cyl_type_';
const FILLCYLSIZEPREFIX            = 'cyl_size_';
const FILLCYLNUMPREFIX             = 'cyl_num_';
const FILLCYLPRESSSTARTPREFIX      = 'cyl_start_pressure_';
const FILLCYLPRESSENDPREFIX        = 'cyl_end_pressure_';
const FILLCYLO2PCNTSTARTPREFIX     = 'cyl_o2_start_';
const FILLCYLO2PCNTENDPREFIX       = 'cyl_o2_end_';
const FILLCYLHEPCNTSTARTPREFIX     = 'cyl_he_start_';
const FILLCYLHEPCNTENDPREFIX       = 'cyl_he_end_';

var next_id         = 0;
/* Types of fills, fields are:
 *  0. key
 *  1. Name
 *  2. Button color
 */
const TYPELIST   = [    ['air', 'Air fill', '#99CC99'],
                        ['nx',  'Nitrox fill', '#9999CC'],
                        ['tx',  'Trimix fill', '#CC99CC'],
                        ['o2',  'Oxygen fill', '#9999FF']];


/**
 * display_action_buttons: Shows the action buttons depending of the mode, default is to show the main action buttons
 * @param  mode
 * @return void
 */

function display_action_buttons(mode) {
    /* TODO: Check that mode is set */

    /* Clear the divs first */
    var my_filltype_elem = document.getElementById(FILLTYPEID);
    my_filltype_elem.innerHTML = '';
    var my_filllist_elem = document.querySelector('#' + FILLLISTID);
    my_filllist_elem.innerHTML = '';
    var my_action_elem = document.querySelector('#' + ACTIONID);
    my_action_elem.innerHTML = '';

    switch (mode) {
        case 'login':
            break;
        case 'main':
            my_filltype_elem.appendChild(get_main_action_buttons());
            /* Add the fill form to the main field div */
            var fill_form = document.createElement('form');
            fill_form.id = FILLLISTFORMID;
            var fill_form_table = document.createElement('table');
            fill_form_table.appendChild(get_fill_table_header());
            fill_form_table.id = FILLLISTTABLEID;
            fill_form_table.setAttribute('border', '1');
            fill_form.appendChild(fill_form_table);
            my_filllist_elem.appendChild(fill_form);
            my_action_elem.appendChild(get_add_button());
            my_action_elem.appendChild(get_clear_button(FILLLISTFORMID));
            break;
        case 'logout':
            break;
        default:
    }
}

/**
 * get_fill_table_header: Adds the header row to the fill table
 * @return void
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
    header_td9.innerHTML = 'Helium at end';
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

    for (var i = 0; i < TYPELIST.length; i++)
    {
        var fill_button = document.createElement('button');
        fill_button.id = TYPELIST[i][0] + '_fill_button';
        fill_button.style.backgroundColor = TYPELIST[i][2];
        fill_button.innerHTML = TYPELIST[i][1];
        fill_button.addEventListener('click', get_show_fill_ref(TYPELIST[i][0]));
        button_div.appendChild(fill_button);
    }

    return (button_div);
}

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
 * @param id running id of the fill, used to individualize the fills
 * @return void
 */

function add_gas_fill_row(type) {
    var id = get_next_fill_id();
    var my_filllist_elem = document.querySelector('#' + FILLLISTTABLEID);
    var gas_tr = document.createElement('tr');
    gas_tr.id = FILLROWPREFIX + id;

    var gas_td_type = document.createElement('td');
    gas_td_type.innerHTML = id + ': ' + type + ' fill';
    var gas_type_input = document.createElement('input');
    gas_type_input.setAttribute('type', 'hidden');
    gas_type_input.setAttribute('value', type);
    gas_type_input.id = FILLCYLTYPEPREFIX + id;
    gas_td_type.appendChild(gas_type_input);
    gas_tr.appendChild(gas_td_type);

    var gas_td_cyl =  document.createElement('td');
    gas_td_cyl.appendChild(get_cylinder_select(id));
    gas_tr.appendChild(gas_td_cyl);

    var gas_td_num =  document.createElement('td');
    gas_td_num.appendChild(get_amount_select(1, 15, 'Number of cylinders', FILLCYLNUMPREFIX + id, '', ''));
    gas_tr.appendChild(gas_td_num);

    var n = 6;

    if (type !== 'air') {
        var gas_td_bar_start =  document.createElement('td');
        gas_td_bar_start.appendChild(get_amount_select(0, 350, 'Pressure before fill', FILLCYLPRESSSTARTPREFIX + id, '', ' bar'));
        gas_tr.appendChild(gas_td_bar_start);

        var gas_td_bar_end =  document.createElement('td');
        gas_td_bar_end.appendChild(get_amount_select(1, 350, 'Pressure after fill', FILLCYLPRESSENDPREFIX + id, '', ' bar'));
        gas_tr.appendChild(gas_td_bar_end);
        n = 4;

        if (type !== 'o2') {
            var gas_td_o2_start = document.createElement('td');
            gas_td_o2_start.appendChild(get_amount_select(0, 100, 'O2 percentage before fill', FILLCYLO2PCNTSTARTPREFIX + id, '', ' %'));
            gas_tr.appendChild(gas_td_o2_start);

            var gas_td_o2_end = document.createElement('td');
            gas_td_o2_end.appendChild(get_amount_select(1, 100, 'O2 percentage after fill', FILLCYLO2PCNTENDPREFIX + id, '', ' %'));
            gas_tr.appendChild(gas_td_o2_end);
            n = 2;

            if (type !== 'nx') {
                var gas_td_he_start = document.createElement('td');
                gas_td_he_start.appendChild(get_amount_select(0, 100, 'He percentage before fill', FILLCYLHEPCNTSTARTPREFIX + id, '', ' %'));
                gas_tr.appendChild(gas_td_he_start);

                var gas_td_he_end = document.createElement('td');
                gas_td_he_end.appendChild(get_amount_select(1, 100, 'He percentage after fill', FILLCYLHEPCNTENDPREFIX + id, '', ' %'));
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
    cylinder_select.options.add(new Option('40cf/5.7l', '40cf'));
    cylinder_select.options.add(new Option('80cf/11.1l', '80cf'));
    cylinder_select.options.add(new Option('7l', '7l'));
    cylinder_select.options.add(new Option('12l', '12l'), true, true);
    cylinder_select.options.add(new Option('15l', '15l'));
    cylinder_select.options.add(new Option('18l', '18l'));
    cylinder_select.options.add(new Option('20l', '20l'));
    cylinder_select.options.add(new Option('D7', 'D7'));
    cylinder_select.options.add(new Option('D10', 'D10'));
    cylinder_select.options.add(new Option('D12', 'D12'));
    cylinder_select.options.add(new Option('D15', 'D15'));
    cylinder_select.options.add(new Option('D18', 'D18'));
    cylinder_select.options.add(new Option('D20', 'D20'));
    cylinder_select.options.add(new Option('50l', '50l'));
    cylinder_select.options.add(new Option('Other', 'Other'));

    /* TODO: Handle the other. Show an additional field where the user may input the volume */
    return (cylinder_select);
}

/**
 * get_amount_select: Generic select-element is returned which has a running number as value
 * @param from
 * @param to
 * @param title
 * @param prefix
 * @param suffix
 * @return {Element}
 */

function get_amount_select(from, to, title, id, prefix, suffix) {
    var amount_select = document.createElement('select');
    amount_select.id = id;
    amount_select.title = title;

    for (var i = from; i <= to; i++) {
        amount_select.options.add(new Option(prefix + i + suffix, i));
    }

    return (amount_select);
}

/**
 * get_add_button: Returns an add-button for the gas fill block
 * @return {Element}
 */

function get_add_button() {
    var add_button = document.createElement('button');
    add_button.innerHTML = 'Add fill(s)';
    add_button.style.backgroundColor = '#99CC99';
    add_button.onclick = get_submit_fill_data_function();
    return (add_button);
}

/**
 * get_clear_button: Returns a clear button for the form
 * @param form_id
 * @return {Element}
 */

function get_clear_button(form_id) {
    var clear_button = document.createElement('button');
    clear_button.innerHTML = 'Reset fields';
    clear_button.onclick = function () {
        document.getElementById(form_id).reset()
    };
    clear_button.style.backgroundColor = '#CC9999';
    return (clear_button);
}

/**
 * get_next_fill_id: Get's the next free id and bumps the counter up
 * @return {number}
 */

function get_next_fill_id() {
    var my_id = next_id;
    next_id++;
    return(my_id);
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
    return (function() {remove_fill_row(id)});
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

function get_submit_fill_data_function() {
    return (function() {submit_fill_data()});
}

/**
 * submit_fill_data: Verifies and sends the given data to the server
 * @return {void}
 */

function submit_fill_data() {
    var fill_array = [];

    var table = document.querySelector('#' + FILLLISTTABLEID);
    var num_rows =  table.childElementCount;

    /* There is the header row*/
    if (num_rows < 2) {
        alert('No fills added');
        return;
    }

    if (!verify_fill_data()) {
        return;
    }

    /* Try to fetch any id from 0 to max value */
    for (var i = 0; i < next_id; i++) {
        var row = document.querySelector('#' + FILLROWPREFIX + i);
        if (row != null) {
            fill_array.push(get_fill_data(i));
        }
    }

    // var myJsonString = JSON.stringify(fill_array);
}

/**
 * get_fill_data: Collects the fed data from the form and verifies it
 * @param id
 * @return {[null,null,null,null,null,null,null,null,null]}
 */

function get_fill_data(id) {
    var data_array = [null,null,null,null,null,null,null,null,null];

    data_array[0] = get_cylinder_type(id);
    data_array[1] = get_cylinder_size(id);
    data_array[2] = get_cylinder_number(id);

    if (data_array[0] !== 'air') {
        data_array[3] = get_cylinder_start_pressure(id);
        data_array[4] = get_cylinder_end_pressure(id);

        if (data_array[0] !== 'o2') {
            data_array[5] = get_cylinder_o2_start_percentage(id);
            data_array[6] = get_cylinder_o2_end_percentage(id);

            if (data_array[0] !== 'nx') {
                data_array[7] = get_cylinder_he_start_percentage(id);
                data_array[8] = get_cylinder_he_end_percentage(id);
            }
        }
    }

    // TODO: Verify the data
    return (data_array);
}

function get_cylinder_type(id) {return (document.querySelector('#' + FILLCYLTYPEPREFIX + id).value);}
function get_cylinder_size(id) {return (document.querySelector('#' + FILLCYLSIZEPREFIX + id).options[document.querySelector('#' + FILLCYLSIZEPREFIX + id).selectedIndex].value);}
function get_cylinder_number(id) {return (document.querySelector('#' + FILLCYLNUMPREFIX + id).options[document.querySelector('#' + FILLCYLNUMPREFIX + id).selectedIndex].value);}
function get_cylinder_start_pressure(id) {return (document.querySelector('#' + FILLCYLPRESSSTARTPREFIX + id).options[document.querySelector('#' + FILLCYLPRESSSTARTPREFIX + id).selectedIndex].value);}
function get_cylinder_end_pressure(id) {return (document.querySelector('#' + FILLCYLPRESSENDPREFIX + id).options[document.querySelector('#' + FILLCYLPRESSENDPREFIX + id).selectedIndex].value);}
function get_cylinder_o2_start_percentage(id) {return (document.querySelector('#' + FILLCYLO2PCNTSTARTPREFIX + id).options[document.querySelector('#' + FILLCYLO2PCNTSTARTPREFIX + id).selectedIndex].value);}
function get_cylinder_o2_end_percentage(id) {return (document.querySelector('#' + FILLCYLO2PCNTENDPREFIX + id).options[document.querySelector('#' + FILLCYLO2PCNTENDPREFIX + id).selectedIndex].value);}
function get_cylinder_he_start_percentage(id) {return (document.querySelector('#' + FILLCYLHEPCNTSTARTPREFIX + id).options[document.querySelector('#' + FILLCYLHEPCNTSTARTPREFIX + id).selectedIndex].value);}
function get_cylinder_he_end_percentage(id) { return (document.querySelector('#' + FILLCYLHEPCNTENDPREFIX + id).options[document.querySelector('#' + FILLCYLHEPCNTENDPREFIX + id).selectedIndex].value);}

/**
 * verify_fill_data: Goes through each fill row and calls the row verification for each id
 * @return {boolean}
 */
function verify_fill_data() {
    /* Try to fetch any id from 0 to max value */
    for (var i = 0; i < next_id; i++) {
        var row = document.querySelector('#' + FILLROWPREFIX + i);
        if (row != null) {
            if (!verify_row_data(i)) return (false);
        }
    }

    return (true);
}

/**
 * verify_row_data: Checks that the fed information is consistent
 * @param id
 * @return {boolean}
 */

function verify_row_data(id) {
    // TODO: Make sure the end pressure is not lower than the start pressure
    if (get_cylinder_end_pressure(id) < get_cylinder_start_pressure(id)) return (false);
    // TODO: Make sure the sum of start O2 and He is not over 100
    if (get_cylinder_o2_start_percentage(id) +  get_cylinder_he_start_percentage(id) > 100) return (false);
    // TODO: Make sure the sum of end O2 and He is not over 100
    if (get_cylinder_o2_end_percentage(id) +  get_cylinder_he_end_percentage(id) > 100) return (false);
    // TODO: Make sure the fill did not require more than 100% o2
    if (is_overfill_gas(get_cylinder_start_pressure(id), get_cylinder_end_pressure(id), get_cylinder_o2_start_percentage(id), get_cylinder_o2_end_percentage(id))) return (false);
    // TODO: Make sure the fill did not require more than 100% he
    if (is_overfill_gas(get_cylinder_start_pressure(id), get_cylinder_end_pressure(id), get_cylinder_he_start_percentage(id), get_cylinder_he_end_percentage(id))) return (false);
    return (true);
}

/**
 * is_overfill_gas: See if the numbers violate physics
 * @param press_start
 * @param press_end
 * @param fraction_start
 * @param fraction_end
 * @return {Boolean}
 */

is_overfill_gas(press_start, press_end, fraction_start, fraction_end) {
    var gas_press_start = fraction_start * press_start;
    var gas_press_end = fraction_end * press_end;
    var abs_gas_diff = press_end - press_start;
    var abs_partial_gas_diff = gas_press_end - gas_press_start;

    if ((abs_partial_gas_diff < 0) ||
        (abs_partial_gas_diff > abs_gas_diff)) return (false);

    return (true);
}