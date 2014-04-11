angular.module('job', [
  'resources',
  'auth',
  'btford.markdown',
  'angularPayments'
])
  .controller(
    'PostJob',
    function PostJob($rootScope, $scope, $location, Page, db, server){
      $('[data-toggle="tooltip"]').tooltip();
      Page.setTitle('Post a Job');
      Page.setName('post-job');
      $scope.job = { city: $rootScope.selected_city }

      $scope.postJob = function(status, response){
        var $pay_button = $('#pay-button');
        $pay_button.button('loading');

        function errorButtonFlash(){
          $pay_button.button('error').addClass('btn-danger');

          setTimeout(function(){
            $pay_button.button('reset').removeClass('btn-danger');
          }, 2000);
        }

        if ($scope.post_job.$invalid || response.error){
          $scope.post_job.submitted = true;
          errorButtonFlash();

          if (response.error){
            $scope.stripe_error = response.error.message;
          }

          return;
        }

        server.pay({
          username: $rootScope.session.userCtx.name,
          token: response.id
        }, function(response){
          if (response.error){
            $scope.payment_error = response.error;
            errorButtonFlash();

            return
          }

          var job = {
            position: $scope.job.position,
            employer: $scope.job.employer,
            city: $scope.job.city,
            instructions: $scope.job.instructions,
            neighborhood: $scope.job.neighborhood,
            stripe_payment_id: response.id,
            description: $scope.job.description
          }

          job.creation_date = (new Date()).getTime();
          job.creator_name = $rootScope.session.userCtx.name;
          job.type = 'job';

          db.save(job, function(result){
            delete $scope.job.failure;
            $scope.job = {};
            $location.url('/job/'+ result.id);
          }, function(failure){
            if (failure.data && failure.data.reason){
              $scope.job.failure_reason = failure.data.reason;
            }
          });
        }, function(error){});
      }
    }
  )
  .controller(
    'JobList',
    function JobList($rootScope, $scope, Page, db){
      Page.setTitle('Programmer Jobs');
      Page.setName('jobs');

      $scope.moment = moment;

      function get_jobs(){
        db.view({
          design_name: 'job',
          view_name: 'list',
          descending: true,
          end_key: [
            '[',
            ['"'+$rootScope.selected_city+'"'].join(','),
            ']'
          ].join(''),
          start_key: [
            '[',
            ['"'+$rootScope.selected_city+'"', '{}'].join(','),
            ']'
          ].join('')
        }, function(response){
          $scope.jobs = response;
        });
      }

      $scope.parse_date = function parse_date(date_string){
        return (new Date(date_string)).toJSON();
      }

      get_jobs();

      $rootScope.$watch('selected_city', function(old_val, new_val){
        if (old_val != new_val) get_jobs();
      });
    }
  )
  .controller(
    'Job', [
      '$rootScope',
      '$scope',
      '$routeParams',
      '$location',
      'Page',
      'db',
      function($rootScope, $scope, $routeParams, $location, Page, db){
        $('[data-toggle="tooltip"]').tooltip();
        Page.setName("job");

        $scope.job = db.get({ _id: $routeParams.job_id }, function(resource){
          Page.setTitle(resource.employer +" needs a "+ resource.position);

          $scope.job_draft = angular.copy(resource);
          $scope.job_original = angular.copy(resource);
        });

        function get_job(){
          db.get({ _id: $routeParams.job_id }, function(job){
            $scope.job = job;
            $scope.job_draft = angular.copy(job);
          });
        }

        $editing_modal = $('#EditJobModal');

        $editing_modal.on('shown.bs.modal', function(){
          $('form input', this).first().focus()
        });

        $deletion_modal = $('#DeleteJobModal');

        $scope.preview = function preview_draft(){
          $scope.job = $scope.job_draft;
          $scope.job_is_draft = true;
          $editing_modal.modal('hide');
        }

        $scope.cancel_preview = function cancel_preview(){
          $scope.job_is_draft = false;
          $scope.job = $scope.job_original;
          $scope.job_draft = $scope.job_original;
        }

        $scope.save = function save(){
          if ($scope.editJob.$invalid){
            $scope.editJob.submitted = true;
            return;
          }

          $scope.job_is_draft = false;
          db.update($scope.job_draft, function(success){
            $editing_modal.modal('hide');
            get_job();
          });
        }

        $scope.delete_job = function(){
          $delete_job_button = $('#DeleteJobButton');
          $delete_job_button.button('loading');

          db.delete({
            _id: $scope.job._id,
            rev: $scope.job._rev
          }, function(result){
            $scope.job._deleted = true;
            $delete_job_button.button('reset');

            $deletion_modal.modal('hide');
            $deletion_modal.one('hidden.bs.modal', function(){
              $rootScope.$apply(function(){
                $rootScope.alerts.push({
                  type: "info",
                  message: "'"+ $scope.job.position +"' job deleted."
                });
                $location.url('/');
              });
            });
          });
        }

        $rootScope.$watch('selected_city', function(old_val, new_val){
          if (new_val != new_val) $location.url('/jobs');
        });
      }
    ]
  )
