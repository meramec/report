(function() {
  angular.module('report.generator').directive('spreadsheet', spreadsheet);
  angular.module('report.generator').controller('SpreadsheetController', ['$scope', '$timeout', 'sheets', SpreadsheetController]);

  function spreadsheet() {
    return {
      retrict: 'E',
      replace: true,
      templateUrl: 'templates/reportGenerator/spreadsheet.html',
      controller: 'SpreadsheetController'
    };
  }

  function SpreadsheetController($scope, $timeout, sheets) {
    $scope.$on('load-spreadsheet', function(e, id) {
      sheets.open(id, function(spreadsheet) {

        $scope.spreadsheet = spreadsheet;
        $scope.primaryHeader = primaryHeader();
        $scope.summaries = summarizeWorksheets();

        $timeout(function() {
          $scope.$digest();
        });
      });
    });

    function primaryHeader() {
      var sheet = primaryWorksheet();
      if(sheet)
        return sheet.headers[0];
    };

    function summarizeWorksheets() {
      var summaries = [];
      var byName = {};

      if($scope.spreadsheet) {
        _.each($scope.spreadsheet.worksheets, function(worksheet, k) {
          _.each(worksheet.data, function(row) {
            var name = row[0];
            var summary = byName[name];
            if(! summary) {
              summary = byName[name] = {
                name: name,
                totals: []
              };
              summaries.push(summary);
            }

            summary.totals[k] = _.filter(_.tail(row, 1), function(value) { return !!value}).length;
          });
        });
      }

      return summaries;
    };

    function primaryWorksheet() {
      if($scope.spreadsheet && $scope.spreadsheet.worksheets)
        return $scope.spreadsheet.worksheets[0]; 
    }
  }
})();
