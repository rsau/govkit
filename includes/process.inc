<?php

/**
 * @file process.inc
 */

/**
 * Implements hook_process_html().
 */
function govkit_process_html(&$variables, $hook) {
  $variables['html_attributes'] = drupal_attributes($variables['html_attributes_array']);

  // We want to make sure the file paths are pointing to the correction location
  // on the server.
  $path_to_public_files = variable_get('file_public_path', 'sites/default/files');
  $path_to_theme = path_to_theme();
  $search = array('[path_to_public_files]',
    '%5Bpath_to_public_files%5D',
    '[path_to_theme]',
    '%5Bpath_to_theme%5D',
    '//sitename.govcms.gov.au');
  $replace = array($path_to_public_files,
    $path_to_public_files,
    $path_to_theme,
    $path_to_theme,
    '//www.sitename.gov.au');
  $variables['page'] = str_replace($search, $replace, $variables['page']);
}

/**
 * Override or insert variables in the html_tag theme function.
 */
function govkit_process_html_tag(&$variables) {
  $tag = &$variables['element'];

  if ($tag['#tag'] == 'style' || $tag['#tag'] == 'script') {
    // Remove redundant CDATA comments.
    unset($tag['#value_prefix'], $tag['#value_suffix']);

    // Remove redundant type attribute.
    if (isset($tag['#attributes']['type']) && $tag['#attributes']['type'] !== 'text/ng-template' && $tag['#attributes']['type'] !== 'application/ld+json') {
      unset($tag['#attributes']['type']);
    }

    // Remove media="all" but leave others unaffected.
    if (isset($tag['#attributes']['media']) && $tag['#attributes']['media'] === 'all') {
      unset($tag['#attributes']['media']);
    }
  }
}

/**
 * Implements hook_process_page().
 */
function govkit_process_page(&$variables) {
  // Make search form available to page.tpl.php
  $search_box = drupal_get_form('search_block_form');
  $variables['search_box'] = drupal_render($search_box);
  // Accessibility settings.
  $variables['skip_link_anchor'] = check_plain(theme_get_setting('govkit_skip_link_anchor'));
  $variables['skip_link_text'] = check_plain(theme_get_setting('govkit_skip_link_text'));
}

/**
 * Implements hook_process_block().
 */
function govkit_process_block(&$variables, $hook) {
  // Drupal 7 should use a $title variable instead of $block->subject.
  $variables['title'] = isset($variables['block']->subject) ? $variables['block']->subject : '';
}
