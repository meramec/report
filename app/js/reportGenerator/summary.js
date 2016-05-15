(function() {
  angular.module('report.generator').directive('summary', summary);
  angular.module('report.generator').controller('SummaryController', ['$scope', '$timeout', SummaryController]);

  function summary() {
    return {
      retrict: 'E',
      replace: true,
      templateUrl: 'templates/reportGenerator/summary.html',
      controller: 'SummaryController'
    };
  }

  function SummaryController($scope, $timeout) {
    $scope.$watch('spreadsheet', function() {
      if(! $scope.spreadsheet)
        return;

      $scope.primaryHeader = primaryHeader();
      $scope.summaries = summarizeWorksheets();

    });

    function primaryHeader() {
      var sheet = primaryWorksheet();
      if(sheet)
        return sheet.headers[0];
    };

    function summarizeWorksheets() {
      var summaries = [];
      var byName = {};

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

      return summaries;
    }

    function primaryWorksheet() {
      if($scope.spreadsheet && $scope.spreadsheet.worksheets)
        return $scope.spreadsheet.worksheets[0]; 
    }
  }
})();
