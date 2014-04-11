angular.module('auth', ['resources'])
  .controller('user', function($rootScope, $scope, db){
    var auth_modal = $('#authModal');

    auth_modal.on('shown.bs.modal', function(){
      $('form input', this).first().focus()
    });

    var $login_button = $('#login-button');

    function get_session(){
      db.session(function(success){
        $rootScope.session = success;
        $rootScope.$broadcast('got_session', success);

        if (success.userCtx.name){
          $rootScope.session.user = db.get({
            db: '_users',
            _id: [ 'org.couchdb.user', success.userCtx.name ].join(':')
          })
        }
      });
    }

    get_session();

    $scope.closeAuthModal = function(){
      auth_modal.modal('hide').one('hidden.bs.modal', function(){
        $login_button.button('reset').removeClass('btn-success');
      });
    }

    $scope.login = function login(){
      $login_button.button('loading');

      db.login(
        $scope.user,
        function(success){
          $rootScope.$broadcast('logged_in', success);

          $login_button.button('complete').addClass('btn-success');

          setTimeout(function(){
            $scope.user = {};
            $scope.closeAuthModal();
          }, 1700);
        },
        function(failure){
          $login_button.button('reset');
          $scope.login_failure = failure;

          auth_modal.one('hidden.bs.modal', function(){
            $scope.$apply(function(){
              delete $scope.login_failure;
            })
          })
        }
      );
    }

    $scope.signup = function signup(){
      var $signup_button = $('#signup-button');
      $signup_button.button('loading');

      var new_user = {
        _id: ['org.couchdb.user', $scope.user.name].join(':'),
        name: $scope.user.name,
        password: $scope.user.password,
        email: $scope.user.email,
        roles: [],
        type: 'user'
      }

      db.signup(new_user, function(success){
        $signup_button.button('complete').addClass('btn-success');

        setTimeout(function(){
          $rootScope.$broadcast('signed_up', success);
          $signup_button.button('reset').removeClass('btn-success');
          $scope.login();
        }, 2000);
      }, function(failure){
        $scope.signup_failure = failure;
        $signup_button.button('failure').addClass('btn-danger');

        auth_modal.one('hidden.bs.modal', function(){
          $scope.$apply(function(){
            delete $scope.signup_failure;
          })
        })

        setTimeout(function(){
          $signup_button.button('reset').removeClass('btn-danger');
        }, 2000)
      });
    }

    $scope.logout = function logout(){
      db.logout(function(success){
        $rootScope.$broadcast('logged_out', success);
      });
    }

    $rootScope.$on('logged_in', get_session);
    $rootScope.$on('logged_out', get_session);
  });
