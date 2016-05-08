(function() {
  angular.module('report.generator').directive('reportGenerator', reportGenerator);
  angular.module('report.generator').controller('ReportGeneratorController', ['$scope', 'selectAction', ReportGeneratorController]);

  function reportGenerator() {
    return {
      restrict: 'E',
      replace: true,
      controller: 'ReportGeneratorController',
      templateUrl: 'templates/reportGenerator/reportGenerator.html'
    };
  }

  function ReportGeneratorController($scope, selectAction) {
    selectAction.browseDrive($scope);
  }
})();
