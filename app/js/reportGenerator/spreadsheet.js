(function() {
  angular.module('report.generator').directive('spreadsheet', spreadsheet);
  angular.module('report.generator').controller('SpreadsheetController', ['$scope', 'path', 'sheets', SpreadsheetController]);

  function spreadsheet() {
    return {
      retrict: 'E',
      replace: true,
      templateUrl: 'templates/reportGenerator/spreadsheet.html',
      controller: 'SpreadsheetController',
      scope: true
    };
  }

  function SpreadsheetController($scope, path, sheets) {

    $scope.row = path.get();

    path.watch($scope, function(row) {
      $scope.row = row;
    });

    $scope.$watch('id', function() {
      if($scope.id) {
        sheets.open($scope.id, function(spreadsheet) {
          $scope.spreadsheet = spreadsheet;
        });
      } else {
        $scope.spreadsheet = undefined;
      }
    });

    $scope.onClick = function(row) {
      $scope.row = row;
      path.set(row);
    };

  }

})();
