<?php

/**
 * @file
 * alter.inc
 */

/**
 * Implements hook_css_alter().
 */
function govkit_css_alter(&$css) {
  // Exclude css
  if (!empty($excludes)) {
    $css = array_diff_key($css, drupal_map_assoc($excludes));
  }
}

/**
 * Implements hook_js_alter().
 */
function govkit_js_alter(&$js) {
  $theme_path = drupal_get_path('theme', 'govkit');

  // Ensure jQuery Once is always loaded.
  // @see https://drupal.org/node/2149561
  if (empty($js['misc/jquery.once.js'])) {
    $jquery_once = drupal_get_library('system', 'jquery.once');
    $js['misc/jquery.once.js'] = $jquery_once['js']['misc/jquery.once.js'];
    $js['misc/jquery.once.js'] += drupal_js_defaults('misc/jquery.once.js');
  }

  // jQuery update.
  $node_admin_paths = array(
    'node/*/edit',
    'node/add',
    'node/add/*',
    'panels/*',
    'ctools/*'
  );
  $replace_jquery = TRUE;
  if (path_is_admin(current_path())) {
    $replace_jquery = FALSE;
  }
  else {
    foreach ($node_admin_paths as $node_admin_path) {
      if (drupal_match_path(current_path(), $node_admin_path)) {
        $replace_jquery = FALSE;
      }
    }
  }
  // Swap out jQuery to use an updated version of the library.
  if ($replace_jquery) {
    $js['misc/jquery.js']['data'] = $theme_path . '/js/jquery.min.js';
    // CDN.
    $js['misc/jquery.js']['version'] = '3.2.1';
  }

  // Exclude js
  if (!empty($excludes)) {
    $js = array_diff_key($js, drupal_map_assoc($excludes));
  }
}

/**
 * Implements hook_js_callback_filter_xss_alter().
 */
function govkit_js_callback_filter_xss_alter(array &$allowed_tags = array()) {
  $allowed_tags[] = 'button';
}

/**
 * Implements theme_form_alter().
 */
function govkit_form_alter(&$form, &$form_state, $form_id) {
  if ($form_id == 'search_form') {
    $form['basic']['submit']['#attributes']['class'][] = 'au-btn';
    $form['basic']['keys']['#title'] = '';
    $form['basic']['keys']['#attributes']['class'][] = 'au-text-input';
  }

  if ($form_id == 'search_block_form') {
    // Update search keys filed attributes.
    $form['search_block_form']['#attributes']['title'] = 'Search';
    $form['search_block_form']['#attributes']['placeholder'] = t('Enter keywords');
    $form['search_block_form']['#attributes']['autocomplete'] = 'off';
    $form['search_block_form']['#attributes']['class'][] = 'au-text-input';
    // Update submit button style.
    $form['actions']['submit']['#value'] = 'Search';
    $form['actions']['submit']['#attributes']['class'] = ['au-btn', 'au-btn--secondary'];
  }
}