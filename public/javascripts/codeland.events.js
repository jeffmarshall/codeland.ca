angular.module('events', [
  'resources',
  'auth',
  'btford.markdown'
])
  .controller(
    'PostEvent',
    function PostEvent($rootScope, $scope, $location, Page, db, server){
      $('[data-toggle="tooltip"]').tooltip();
      $scope.moment = moment;

      Page.setTitle('Post an Event');
      Page.setName('post-event');
      $scope.event = {
        city: $rootScope.selected_city,
        start: moment().startOf('day').add('days', 1).add('hours', 18).add('minutes', 30).toDate()
      }

      $scope.postEvent = function(){
        var $post_button = $('#post-button');
        $post_button.button('loading');

        function errorButtonFlash(){
          $post_button.button('error').addClass('btn-danger');

          setTimeout(function(){
            $post_button.button('reset').removeClass('btn-danger');
          }, 2000);
        }

        if ($scope.post_event.$invalid){
          $scope.post_event.submitted = true;
          errorButtonFlash();

          return;
        }

        var event = {
          venue: $scope.event.venue,
          name: $scope.event.name,
          description: $scope.event.description,
          start: $scope.event.start.getTime(),
          homepage: $scope.event.homepage,
          seeking_sponsors: $scope.event.seeking_sponsors,
          city: $scope.event.city
        }

        event.creation_date = (new Date()).getTime();
        event.creator_name = $rootScope.session.userCtx.name;
        event.type = 'event';

        db.save(event, function(result){
          delete $scope.event.failure_reason;
          $scope.event = {};
          $location.url('/event/'+ result.id);
        }, function(failure){
          if (failure.data && failure.data.reason){
            $scope.failure_reason = failure.data.reason;
            errorButtonFlash();
          }
        });
      }
    }
  )
  .controller(
    'EventList',
    function EventList($rootScope, $scope, Page, db){
      Page.setTitle(
        $rootScope.cities[$rootScope.selected_city] +' Tech Events'
      );
      Page.setName('events');

      $scope.moment = moment;

      function get_events(){
        var view_options = {
          design_name: 'event',
          view_name: 'list',
          start_key: [
            '[',
            ['"'+$rootScope.selected_city+'"', (new Date()).getTime()].join(','),
            ']'
          ].join(''),
          end_key: [
            '[',
            ['"'+$rootScope.selected_city+'"', '{}'].join(','),
            ']'
          ].join('')
        }

        db.view(view_options, function(response){
          $scope.events = response;
        });
      }

      $scope.parse_date = function parse_date(date_string){
        return (new Date(date_string)).toJSON();
      }

      get_events();
    }
  )
  .controller(
    'Event', [
      '$rootScope',
      '$scope',
      '$routeParams',
      '$location',
      'Page',
      'db',
      function($rootScope, $scope, $routeParams, $location, Page, db){
        $('[data-toggle="tooltip"]').tooltip();
        $scope.moment = moment;

        Page.setName("event");

        function get_event(){
          db.get({ _id: $routeParams.event_id }, function(event){
            Page.setTitle(event.name);

            event.start_moment = moment(event.start);
            event.start = new Date(event.start);

            $scope.event = event;
            $scope.event_draft = angular.copy(event);
            $scope.event_original = angular.copy(event);
          });
        }

        get_event();

        $editing_modal = $('#EditEventModal');

        $editing_modal.on('shown.bs.modal', function(){
          $('form input', this).first().focus()
        });

        $deletion_modal = $('#DeleteEventModal');

        $scope.preview = function preview_draft(){
          $scope.event = $scope.event_draft;
          $scope.event_is_draft = true;
          $editing_modal.modal('hide');
        }

        $scope.cancel_preview = function cancel_preview(){
          $scope.event_is_draft = false;
          $scope.event = $scope.event_original;
          $scope.event_draft = $scope.event_original;
        }

        $scope.save = function save(){
          if ($scope.editEvent.$invalid){
            $scope.editEvent.submitted = true;
            return;
          }

          $post_button = $('#SaveEventButton');

          function errorButtonFlash(){
            $post_button.button('error').addClass('btn-danger');

            setTimeout(function(){
              $post_button.button('reset').removeClass('btn-danger');
            }, 2000);
          }

          db.update({
            _id: $scope.event_draft._id,
            _rev: $scope.event_draft._rev,
            creation_date: $scope.event_draft.creation_date,
            creator_name: $scope.event_draft.creator_name,
            description: $scope.event_draft.description,
            name: $scope.event_draft.name,
            start: $scope.event_draft.start.getTime(),
            city: $rootScope.selected_city,
            homepage: $scope.event_draft.homepage,
            seeking_sponsors: $scope.event_draft.seeking_sponsors,
            type: 'event',
            venue: $scope.event_draft.venue
          }, function(success){
            $editing_modal.modal('hide');
            $scope.event_is_draft = false;

            $scope.editEvent.$setPristine();
            get_event();
          }, function(failure){
            $scope.failure_reason = failure.data.reason;
            errorButtonFlash();
          });
        }

        $scope.delete_event = function(){
          $delete_event_button = $('#DeleteEventButton');
          $delete_event_button.button('loading');

          db.delete({
            _id: $scope.event._id,
            rev: $scope.event._rev
          }, function(result){
            $scope.event._deleted = true;
            $delete_event_button.button('reset');

            $deletion_modal.modal('hide');
            $deletion_modal.one('hidden.bs.modal', function(){
              $rootScope.$apply(function(){
                $rootScope.alerts.push({
                  type: "info",
                  message: "'"+ $scope.event.name +"' event deleted."
                });
                $location.url('/');
              });
            });
          });
        }
      }
    ]
  )
