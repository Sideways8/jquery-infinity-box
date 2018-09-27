/**
 * jQuery Infinity Box
 * A lightweight jQuery lightbox plugin.
 * Developed at https://sideways8.com/
 */ 

(function($) {

    $.fn.infinityBox = function( args ) {

        // Represents the input selector elements.
        var elements = this,
            by_group = {},
            container,
            inner,
            content,
            caption,
            title,
            prev,
            next,
            visible = false,
            mouse_state = false,
            current_item = elements.length ? elements[0] : undefined;

        // Declare the default light box arguments.
        var default_args = {
        };

        // Verify object type.
        if ( 'object' !== typeof( args ) ) {
            args = {};
        }

        // Parse arguments.
        for ( var i in default_args ) {
            if ( 'undefined' === typeof( args[i] ) ) {
                args[i] = default_args[i];
            }
        }

        // Break elements into lightbox groups.
        for( i in elements ) {
            var item = elements[i],
                group = $(item).data('lightbox');
            // Declare array if undefined.
            if ( 'undefined' === typeof( by_group[group] ) ) {
                by_group[group] = [];
            }
            by_group[group].push(item);
        }

        function click_item(e) {
            // Set html.
            set_current_item_html(this);
            e.preventDefault();
        }

        function create_modal() {

            // Do nothing if modal already exists.
            if ( $('.infinity-box-container').length ) {
                return;
            }

            var html = '<div class="infinity-box-container">' +
                '<div class="infinity-box-inner">' +
                '<div class="infinity-box-content">' +
                '</div>' +
                '<div class="infinity-title"></div>' +
                '<div class="infinity-caption"></div>' +
                '<div class="infinity-controls">' +
                '<div class="previous"><i class="fa fa-chevron-circle-left"></i></div>' +
                '<div class="next"><i class="fa fa-chevron-circle-right"></i></div>' +
                '</div>' +
                '<div class="infinity-close"><i class="fa fa-times-circle"></i></div>' +
                '</div>' +
                '</div>';
            $('body').append(html);

            container = $('.infinity-box-container');
            inner = $('.infinity-box-inner');
            content = $('.infinity-box-content');
            caption = $('.infinity-caption');
            prev = $('.infinity-controls .previous');
            next = $('.infinity-controls .next');
        }

        function bind_close() {
            container.not('.infinity-box-inner').click(hide_modal);
        }

        function show_modal() {
            visible = true;
            container
                .css({
                    display: 'block',
                    'z-index': 250
                })
                .stop()
                .animate({opacity: 1}, 250, function() {});
        }

        function hide_modal(e) {
            if ( mouse_state && !$(e.target).hasClass('fa-times-circle') ) {
                return;
            }
            container
                .stop()
                .animate({opacity: 0}, 250, function() {
                    container.css({
                        display: 'none',
                        'z-index': 0
                    });
                    visible = false;
                });
        }

        /**
         * Update the current image frame.
         * @param item
         */
        function set_current_item_html( item ) {
            var url = $(item).attr('href'),
                html = '<img src="' + url + '" alt="" style="display: none;">';
            // Update content html.
            content.html(html);
            // Update content after image loaded.
            content.imagesLoaded(function () {
                content.find('img').fadeIn();
                setTimeout(function() {
                    resize_modal();
                    swipes();
                }, 75);
            });
            // Set current item.
            current_item = item;
            show_modal();
            bind_close();
            update_caption();
        }

        /**
         * Bind left and right arrow keys.
         */
        function bind_arrow_keys() {
            $(document).on('keydown', function(e) {
                if ( ! visible ) {
                    return;
                }
                // Left arrow key.
                if ( 37 === e.keyCode ) {
                    show_previous_image();
                }
                // Right arrow key.
                if ( 39 === e.keyCode ) {
                    show_next_image();
                }
            });
        }

        function show_previous_image() {
            var index,
                group = $(current_item).data('lightbox'),
                items = by_group[group];

            for( var i in items ) {
                if ( items[i] === current_item ) {
                    index = i;
                }
            }
            // Only one item...
            if ( ! items.length ) {
                return 0;
            }
            // Decrease or reset index to end of array.
            index--;
            if ( index <= 0 ) {
                index = items.length - 1;
            }

            // Set html.
            var item = items[index];
            set_current_item_html( item );
        }

        function show_next_image() {
            var index,
                group = $(current_item).data('lightbox'),
                items = by_group[group];

            for (var i in items) {
                if (items[i] === current_item) {
                    index = i;
                }
            }
            // Only one item...
            if (!items.length) {
                //return 0;
            }

            // Bump index and check we're not over the total.
            index++;
            if (index === items.length-1) {
                index = 0;
            }

            // Set html.
            var item = items[index];
            set_current_item_html(item);
        }

        function resize_modal() {

            if ( ! visible ) {
                return;
            }

            var img = content.find('img'),
                img_width = $(img)[0].naturalWidth,
                img_height = $(img)[0].naturalHeight,
                window_height = $(window).height(),
                window_width = $(window).width();

            // The image will fit within the current window frame.
            if ( img_width < window_width && img_height < window_height ) {
                inner.css({
                    width: img_width,
                    height: img_height
                });
            } else {
                var w = window_width,
                    h = window_width * img_height / img_width,
                    margin = 10, // percent
                    offset = ( 100 - margin ) / 100;
                inner.css({
                    width: Math.floor( w * offset ),
                    height: Math.floor( h * offset )
                });
            }
        }

        function update_caption() {
            var text = $(current_item).data('title');
            caption.html(text);
        }

        function track_mouse_state() {
            inner
                .on('mouseleave', function(e) {
                    mouse_state = false;
                })
                .on('mouseover', function(e) {
                    mouse_state = true;
                });
        }

        function bind_close_button() {
            $('.infinity-close').on('click', hide_modal);
        }

        // Initialize functionality.
        create_modal();
        bind_arrow_keys();
        bind_close_button();
        track_mouse_state();

        // Bind input elements.
        $(elements).each(function() {
            $(this).on('click', click_item);
        });

        prev.on('click', show_previous_image);
        next.on('click', show_next_image);

        // Bind to window resize.
        $(window).on('resize', resize_modal);

        // Return this for chaining.
        return this;
    };

})(jQuery);
