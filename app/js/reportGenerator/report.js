(function() {
  angular.module('report.generator').directive('report', report);
  angular.module('report.generator').controller('ReportController', ['$scope', '$window', 'path', 'metadata', ReportController]);

  function report() {
    return {
      restrict: 'E',
      replace: true,
      controller: 'ReportController',
      templateUrl: 'templates/reportGenerator/report.html'
    };
  }

  function ReportController($scope, $window, path, metadata) {

    $scope.report = {};
    $scope.signedIn = false;

    metadata.watch($scope);

    $scope.$on('signed-in', function() {
      $scope.signedIn = true;
      $scope.id = localStorage.getItem('id');
      if(! $scope.id)
        $scope.chooseFile();
    });

    $scope.$on('signed-out', function() {
      $scope.signedIn = false;
      $scope.id = undefined;
      $scope.goHome();
    });

    $scope.goHome = function() {
      path.set('/');
    };

    $scope.totalsView = function() {
      path.set('/all/totals')
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
