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

/**
 * display_action_buttons: Shows the action buttons depending of the mode, default is to show the main action buttons
 * @param  mode
 * @return void
 */

function display_action_buttons(mode) {
    /* TODO: Check that mode is set */

    var my_action_div = document.getElementById('action');
    my_action_div.innerHTML = '';

    switch (mode) {
        case 'main':
            my_action_div.appendChild(get_main_action_buttons());
            break;
        default:
    }
}

/**
 * get_main_action_buttons: Shows the button block for different fills addition
 * @return {Element}
 */

function get_main_action_buttons() {
    var button_div = document.createElement('div');
    button_div.id = 'main_action';

    var air_fill_button = document.createElement('button');
    air_fill_button.id = 'air_fill_button';
    air_fill_button.style.backgroundColor = '#99CC99';
    air_fill_button.innerHTML = 'Air fill';
    air_fill_button.addEventListener('click', get_show_fill_ref('air'));
    button_div.appendChild(air_fill_button);

    var nitrox_fill_button = document.createElement('button');
    nitrox_fill_button.style.backgroundColor = '#9999CC';
    nitrox_fill_button.id = 'nitrox_fill_button';
    nitrox_fill_button.innerHTML = 'Nitrox fill';
    nitrox_fill_button.addEventListener('click', get_show_fill_ref('nx'));
    button_div.appendChild(nitrox_fill_button);

    var trimix_fill_button = document.createElement('button');
    trimix_fill_button.style.backgroundColor = '#CC99CC';
    trimix_fill_button.id = 'trimix_fill_button';
    trimix_fill_button.innerHTML = 'Trimix fill';
    trimix_fill_button.addEventListener('click', get_show_fill_ref('tx'));
    button_div.appendChild(trimix_fill_button);

    var o2_fill_button = document.createElement('button');
    o2_fill_button.style.backgroundColor = '#9999FF';
    o2_fill_button.id = 'o2_fill_button';
    o2_fill_button.innerHTML = 'O2 fill';
    o2_fill_button.addEventListener('click', get_show_fill_ref('o2'));
    button_div.appendChild(o2_fill_button);

    return (button_div);
}

/**
 * get_show_fill_ref: Helper function to attach the show_gasfill-function to an action
 * @param type
 * @return {Function}
 */

function get_show_fill_ref(type) {
    return (function () {
        show_gasfill(type)
    })
}

/**
 * show_gasfill: Adds the necessary gasfill fields depending of the type of fill
 * @param type
 * @return void
 */

function show_gasfill(type) {
    var fill_form = document.createElement('form');
    var form_id = 'fill_form';
    fill_form.id = form_id;
    var response_div = document.getElementById('response');
    response_div.innerHTML = '';
    var gas_div = document.createElement('div');
    gas_div.appendChild(get_cylinder_select());
    gas_div.appendChild(get_amount_select(1, 15, 'Number of cylinders', '', ''));

    switch (type) {
        case 'tx':
            gas_div.appendChild(get_amount_select(1, 100, 'He % before fill', '', ' %'));
            gas_div.appendChild(get_amount_select(1, 100, 'He % after fill', '', ' %'));
        case 'nx':
            gas_div.appendChild(get_amount_select(1, 100, 'Oxygen % before fill', '', ' %'));
            gas_div.appendChild(get_amount_select(1, 100, 'Oxygen % after fill', '', ' %'));
        case 'o2':
            gas_div.appendChild(get_amount_select(0, 350, 'Pressure before fill', '', ' bar'));
            gas_div.appendChild(get_amount_select(1, 350, 'Pressure after fill', '', ' bar'));
            break;
    }

    gas_div.appendChild(get_add_button());
    gas_div.appendChild(get_clear_button(form_id));
    fill_form.appendChild(gas_div);
    response_div.appendChild(fill_form);
}

/**
 * get_cylinder_select: Returns an select element with the most common cylinder sizes
 * @return {Element}
 */

function get_cylinder_select() {
    var cylinder_select = document.createElement('select');
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

function get_amount_select(from, to, title, prefix, suffix) {
    var amount_select = document.createElement('select');
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
    return (add_button);
}

/**
 * get_clear_button: Returns a clear button for the form
 * @param form_id
 * @return {Element}
 */

function get_clear_button(form_id) {
    var clear_button = document.createElement('button');
    clear_button.innerHTML = 'Clear form';
    clear_button.onclick = function () {
        document.getElementById(form_id).reset()
    };
    clear_button.style.backgroundColor = '#CC9999';
    return (clear_button);
}
