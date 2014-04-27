angular.module('resources', ['ngResource', 'config'])
  .factory('db', function($resource, $http, config){
    $http.defaults.withCredentials = true;

    var db = $resource(':protocol//:server/:db/:_id', {
      protocol: 'http:',
      db: config.db_name,
      server: config.db_host,
      _id: '@_id'
    }, {
      update: { method: 'PUT' },
      view: {
        url: ':protocol//:server/:db/_design/:design_name/_view/:view_name',
        isArray: false
      },
      get: {
        params: { _id: '@_id' }
      },
      delete: {
        params: { _id: '@_id', rev: '@_rev' },
        method: 'DELETE'
      },
      session: {
        params: { db: '_session' },
        method: 'GET'
      },
      login: {
        params: { db: '_session' },
        method: 'POST'
      },
      logout: {
        params: { db: '_session' },
        method: 'DELETE'
      },
      signup: {
        params: {
          db: '_users'
        },
        method: 'PUT'
      }
    })

    return db;
  })

  .factory('server', function($resource){
    var server = $resource('/api/:command', {}, {
      pay: {
        method: 'post',
        params: { command: 'pay' }
      }
    });

    return server;
  });
