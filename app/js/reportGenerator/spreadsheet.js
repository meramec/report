(function() {
  angular.module('report.generator').directive('spreadsheet', spreadsheet);
  angular.module('report.generator').controller('SpreadsheetController', ['$scope', '$location', 'sheets', SpreadsheetController]);

  function spreadsheet() {
    return {
      retrict: 'E',
      replace: true,
      templateUrl: 'templates/reportGenerator/spreadsheet.html',
      controller: 'SpreadsheetController',
      scope: true
    };
  }

  function SpreadsheetController($scope, $location, sheets) {

    $scope.row = getRowFromPath();

    $scope.$on('$locationChangeSuccess', function() {
      $scope.row = getRowFromPath();
    });

    $scope.$watch('id', function() {
      if(! $scope.id)
        return;

      sheets.open($scope.id, function(spreadsheet) {
        $scope.spreadsheet = spreadsheet;
      });
    });

    $scope.onClick = function(row) {
      $scope.row = row;
      $location.path(row);
    };

    function getRowFromPath() {
      return $location.path().replace(/^\//, '');
    }
  }

})();
