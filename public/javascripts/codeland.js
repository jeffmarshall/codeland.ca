angular.module('codeland', [
  'ngCookies',
  'ngRoute',
  'job',
  'events',
  'auth',
  'config'
])
  .config(function($locationProvider){
    $locationProvider.html5Mode(true).hashPrefix('!');
  })
  .config(function($routeProvider){
    $routeProvider
      .when('/', { controller: 'EventList', templateUrl: 'events.jade' })
      .when('/jobs', { controller: 'JobList', templateUrl: 'jobs.jade' })
      .when('/post-job', { controller: 'PostJob', templateUrl: 'post-job.jade' })
      .when('/job/:job_id', { controller: 'Job', templateUrl: 'job.jade' })
      .when('/post-event', { controller: 'PostEvent', templateUrl: 'post-event.jade' })
      .when('/event/:event_id', { controller: 'Event', templateUrl: 'event.jade' })
      .otherwise({ redirectTo:'/' });
  })
  .factory('Page', function() {
    var title = 'Codeland';
    var name = 'landing';

    return {
      title: function() { return title; },
      name: function(){ return name },
      setTitle: function(newTitle) { title = newTitle },
      setName: function(newName) { name = newName }
    };
  })
  .controller('pageCtrl', function(
    $rootScope,
    $scope,
    $cookies,
    Page,
    config,
    $location
  ){
    $rootScope.Page = Page;
    $rootScope.cities = config.cities;
    $rootScope.selected_city = config.selected_city;
    $rootScope.alerts = [];

    $rootScope.$watch('selected_city', function(old_city, new_city){
      if (new_city == old_city) return;

      var host_array = window.location.host.split('.');

      switch(host_array.length){
        case 3:
          host_array[0] = $rootScope.selected_city; break;

        case 2:
          host_array.unshift($rootScope.selected_city); break;

        default:
          $cookies.selected_city = $rootScope.selected_city;
          return
      }

      window.location.href = [
        window.location.protocol,
        '//'+ host_array.join('.')
      ].join('');
    });

    $('#navbar-collapse a').click(function(){
      $('#navbar-collapse.collapse.in').collapse('hide');
    });
  });
