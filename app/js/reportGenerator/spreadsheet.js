(function() {
  angular.module('report.generator').directive('spreadsheet', spreadsheet);
  angular.module('report.generator').controller('SpreadsheetController', ['$scope', 'sheets', SpreadsheetController]);

  function spreadsheet() {
    return {
      retrict: 'E',
      replace: true,
      templateUrl: 'templates/reportGenerator/spreadsheet.html',
      controller: 'SpreadsheetController'
    };
  }

  function SpreadsheetController($scope, sheets) {
    $scope.$on('load-spreadsheet', function(e, id) {
      sheets.open(id, function(response) {
        console.log(JSON.stringify(response));
      });
    });
  }
})();
