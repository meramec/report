(function() {
  angular.module('report.generator').directive('rowReport', rowReport);
  angular.module('report.generator').controller('RowReportController', ['$scope', RowReportController]);

  function rowReport() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'templates/reportGenerator/rowReport.html',
      controller: 'RowReportController',
      scope: true
    };
  }

  function RowReportController($scope) {
    $scope.$watch('row', function() {
      if(! $scope.row)
        return;

      $scope.rowReport = [];

      _.each($scope.spreadsheet.worksheets, function(worksheet) {
        var row = _.find(worksheet.data, function(row) {
          return row[0] === $scope.row;
        });

        if(row) {
          var report = {
            name: worksheet.name,
            columns: []
          };

          $scope.rowReport.push(report);

          _.each(_.tail(row, 1), function(column, j) {
            report.columns.push({
              name: worksheet.headers[j+1],
              value: column
            });
          });
        }
      });

    });
  }

})();