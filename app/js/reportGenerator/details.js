(function() {
  angular.module('report.generator').directive('details', details);
  angular.module('report.generator').controller('DetailsController', ['$scope', '$timeout', 'toggleUnique', DetailsController]);

  function details() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'templates/reportGenerator/details.html',
      controller: 'DetailsController'
    };
  }

  function DetailsController($scope, $timeout, toggleUnique) {
    $scope.worksheet.details =  _.map(_.tail($scope.worksheet.headers, 1), function(name, j) {
      var entries = _.filter($scope.worksheet.data, function(row) {
        return row[j+1];
      });

      return {name: name, value: entries.length};
    });

    $scope.onClick = function(e) {
      e.stopPropagation();

      $scope.showDetails = ! $scope.showDetails;

      if($scope.showDetails) {
        toggleUnique.onClickOff(function() {
          $scope.showDetails = false;
          $timeout(function() {
            $scope.$digest();
          });
        });
      }
    };
  }
})();
