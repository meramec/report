(function() {
  angular.module('report.generator').directive('report', report);
  angular.module('report.generator').controller('ReportController', ['$scope', '$window', 'path', 'metadata', 'auth', ReportController]);

  function report() {
    return {
      restrict: 'E',
      replace: true,
      controller: 'ReportController',
      templateUrl: 'templates/reportGenerator/report.html'
    };
  }

  function ReportController($scope, $window, path, metadata, auth) {

    $scope.report = {};
    $scope.id = localStorage.getItem('id');

    metadata.watch($scope);

    auth.authorize(onReady);

    function onReady() {
      $scope.$broadcast('authenticated');
      if(! $scope.id)
        $scope.$broadcast('choose-file');
    }

    $scope.goHome = function() {
      path.set('/');
    };

    $scope.orderView = function() {
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
