(function() {
  angular.module('report.generator').directive('spreadsheet', spreadsheet);
  angular.module('report.generator').controller('SpreadsheetController', ['$scope', '$window', 'sheets', SpreadsheetController]);

  function spreadsheet() {
    return {
      retrict: 'E',
      replace: true,
      templateUrl: 'templates/reportGenerator/spreadsheet.html',
      controller: 'SpreadsheetController',
      scope: true
    };
  }

  function SpreadsheetController($scope, $window, sheets) {
    $scope.$watch('id', function() {
      if(! $scope.id)
        return;

      sheets.open($scope.id, function(spreadsheet) {
        $scope.spreadsheet = spreadsheet;
      });
    });

    $scope.onClick = function(row) {
      $scope.row = row;
    };
  }
})();
