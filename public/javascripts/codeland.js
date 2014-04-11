angular.module('codeland', ['ngRoute', 'ngCookies', 'job', 'events', 'auth'])
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
  .controller('pageCtrl', function($rootScope, $scope, $cookies, Page){
    $rootScope.Page = Page;
    $rootScope.selected_city = $cookies.selected_city || 'mtl';
    $rootScope.alerts = [];

    $rootScope.$watch('selected_city', function(){
      $cookies.selected_city = $rootScope.selected_city;
    });
  });
