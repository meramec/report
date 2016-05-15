(function() {
  angular.module('report.generator').directive('details', details);
  angular.module('report.generator').controller('DetailsController', ['$scope', DetailsController]);

  function details() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'templates/reportGenerator/details.html',
      controller: 'DetailsController'
    };
  }

  function DetailsController($scope) {
    $scope.worksheet.details =  _.map(_.tail($scope.worksheet.headers, 1), function(name, j) {
      var entries = _.filter($scope.worksheet.data, function(row) {
        return row[j+1];
      });

      return {name: name, value: entries.length};
    });

    $scope.onClick = function() {
      $scope.showDetails = ! $scope.showDetails;
    };
  }
})();
