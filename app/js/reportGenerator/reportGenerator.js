(function() {
  angular.module('report.generator').directive('reportGenerator', reportGenerator);
  angular.module('report.generator').controller('ReportGeneratorController', ['$scope', '$timeout', 'selectAction', ReportGeneratorController]);

  function reportGenerator() {
    return {
      restrict: 'E',
      replace: true,
      controller: 'ReportGeneratorController',
      templateUrl: 'templates/reportGenerator/reportGenerator.html'
    };
  }

  function ReportGeneratorController($scope, $timeout, selectAction) {
    $scope.currentAction = '';
    $scope.$watch('currentAction', function(action) {
      if(action) {
        $timeout(function() {
          $scope.$broadcast(action);
        });
      }
    });

    selectAction.browseDrive($scope);
  }
})();
