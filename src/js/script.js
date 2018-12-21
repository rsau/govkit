/**
 * @file
 * govkit theme main JavaScript
 * Icon Agency Canberra
 * Dec 2018
 */

(function ($, Drupal, window, document, undefined) {

  'use strict';

  Drupal.behaviors.govkit = {
    attach: function (context, settings) {
      $(document).ready(function () {
        // Add smooth scrolling to all links
        $("a").on('click', function(event) {
          if (this.hash !== "") {
            event.preventDefault();
            var hash = this.hash;
            $('html, body').animate({
              scrollTop: $(hash).offset().top
            }, 800, function(){
              window.location.hash = hash;
            });
          } // End if
        });

      });
    },

  };

})(jQuery, Drupal, this, this.document);
