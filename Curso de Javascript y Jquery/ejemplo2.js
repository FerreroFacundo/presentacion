$.fn.twitterResult = function(settings) {
        return this.each(function() {
            var $results = $(this),
                $actions = $.fn.twitterResult.actions =
                    $.fn.twitterResult.actions ||
                    $.fn.twitterResult.createActions(),
                $a = $actions.clone().prependTo($results),
                term = settings.term;
    
            $results.find('span.search_term').text(term);
    
            $.each(
                ['refresh', 'populate', 'remove', 'collapse', 'expand'],
                function(i, ev) {
                    $results.bind(
                        ev,
                        { term : term },
                        $.fn.twitterResult.events[ev]
                    );
                }
            );
    
            // utiliza la clase de cada acción para determinar
            // que evento se ejecutará en el panel de resultados
            $a.find('li').click(function() {
                // pasa el elemento <li> clickeado en la función
                // para que se pueda manipular en caso de ser necesario
                $results.trigger($(this).attr('class'), [ $(this) ]);
            });
        });
    };
    
    $.fn.twitterResult.createActions = function() {
        return $('<ul class="actions" />').append(
            '<li class="refresh">Refresh</li>' +
            '<li class="remove">Remove</li>' +
            '<li class="collapse">Collapse</li>'
        );
    };
    
    $.fn.twitterResult.events = {
        refresh : function(e) {
               // indica que los resultados se estan actualizando
            var $this = $(this).addClass('refreshing');
    
            $this.find('p.tweet').remove();
            $results.append('<p class="loading">Loading ...</p>');
    
            // obtiene la información de Twitter en formato jsonp
            $.getJSON(
                'http://search.twitter.com/search.json?q=' +
                    escape(e.data.term) + '&rpp=5&callback=?',
                function(json) {
                    $this.trigger('populate', [ json ]);
                }
            );
        },
    
        populate : function(e, json) {
            var results = json.results;
            var $this = $(this);
    
            $this.find('p.loading').remove();
    
            $.each(results, function(i,result) {
                var tweet = '<p class="tweet">' +
                    '<a href="http://twitter.com/' +
                    result.from_user +
                    '">' +
                    result.from_user +
                    '</a>: ' +
                    result.text +
                    ' <span class="date">' +
                    result.created_at +
                    '</span>' +
                '</p>';
                $this.append(tweet);
            });
    
            // indica que los resultados
            // ya se han actualizado
            $this.removeClass('refreshing');
        },
    
        remove : function(e, force) {
            if (
                !force &&
                !confirm('Remove panel for term ' + e.data.term + '?')
            ) {
                return;
            }
            $(this).remove();
    
            // indica que ya no se tendrá
            // un panel para el término
            search_terms[e.data.term] = 0;
        },
    
        collapse : function(e) {
            $(this).find('li.collapse').removeClass('collapse')
                .addClass('expand').text('Expand');
    
            $(this).addClass('collapsed');
        },
    
        expand : function(e) {
            $(this).find('li.expand').removeClass('expand')
                .addClass('collapse').text('Collapse');
    
            $(this).removeClass('collapsed');
        }
    };

