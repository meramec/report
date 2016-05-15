(function() {
  angular.module('report.generator').directive('report', report);
  angular.module('report.generator').controller('ReportController', ['$scope', '$window', '$location', 'auth', ReportController]);

  function report() {
    return {
      restrict: 'E',
      replace: true,
      controller: 'ReportController',
      templateUrl: 'templates/reportGenerator/report.html'
    };
  }

  function ReportController($scope, $window, $location, auth) {
    $scope.report = {
      title: 'Spreadsheet',
      subtitle: 'Report'
    };

    auth.authorize(onReady);

    function onReady() {
      $scope.$broadcast('authenticated');
      $scope.id = localStorage.getItem('id');

      if(! $scope.id)
        $scope.$broadcast('choose-file');
    }

    $scope.goHome = function() {
      $location.path('/');
    };

    $scope.chooseFile = function() {
      $scope.$broadcast('choose-file');
    }

    $scope.print = function() {
      $window.print();
    }

    $scope.$on('select-file', function(e, file) {
      $scope.id = file.id;
      localStorage.setItem('id', file.id);
    });
  }
})();
