(function() {
  angular.module('report.generator').directive('report', report);
  angular.module('report.generator').controller('ReportController', ['$scope', '$timeout', 'auth', ReportController]);

  function report() {
    return {
      restrict: 'E',
      replace: true,
      controller: 'ReportController',
      templateUrl: 'templates/reportGenerator/report.html'
    };
  }

  function ReportController($scope, $timeout, auth) {
    $scope.report = {
      title: 'Spreadsheet',
      subtitle: 'Report'
    };

    auth.authorize(onReady);

    function onReady() {
      $scope.$broadcast('authenticated');
      $scope.$broadcast('choose-file');
    }

    $scope.$on('select-file', function(e, id) {
      $scope.$broadcast('load-spreadsheet', id);
    });
  }
})();
