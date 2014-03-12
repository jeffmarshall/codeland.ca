angular.module('jobs', ['LocalStorageModule'])
  // .config(
  //   ['localStorageServiceProvider', function(localStorageServiceProvider){
  //     localStorageServiceProvider.setPrefix('jobs');
  //   }]
  // )
  .controller(
    'JobCtrl',
    function JobCtrl($scope, localStorageService){
      console.log('scope', $scope);
      console.log('storage', localStorageService);
      $scope.jobs = localStorageService.get('jobs') || [];

      $scope.addJob = function(){
        $scope.jobs.push({
          position: $scope.position,
          company: $scope.company,
          description: $scope.description
        });

        localStorageService.set('jobs', $scope.jobs);

        $scope.position = '';
        $scope.company = '';

        $('#add-job').modal('hide');
      }

      $scope.totalJobs = function(){
        return $scope.jobs.length;
      }
    }
  );
