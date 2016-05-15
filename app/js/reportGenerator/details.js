(function() {
  angular.module('report.generator').directive('details', details);
  angular.module('report.generator').controller('DetailsController', ['$scope', '$document', DetailsController]);

  function details() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'templates/reportGenerator/details.html',
      controller: 'DetailsController'
    };
  }

  function DetailsController($scope, $document) {
    $scope.worksheet.details =  _.map(_.tail($scope.worksheet.headers, 1), function(name, j) {
      var entries = _.filter($scope.worksheet.data, function(row) {
        return row[j+1];
      });

      return {name: name, value: entries.length};
    });

    $scope.onClick = function(e) {
      e.stopPropagation();
      $scope.showDetails = ! $scope.showDetails;

      function handleClick() {
        $scope.showDetails = false;
        $scope.$digest();
      }

      if($scope.showDetails) {
        $document.bind('click', handleClick);
      
      } else {
        $document.unbind('click', handleClick);
      }
    };
  }
})();
