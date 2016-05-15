(function() {
  angular.module('picker').directive('file', file);
  angular.module('picker').controller('FileController', ['$scope', FileController]);

  function file() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'templates/picker/file.html',
      controller: 'FileController'
    };
  }

  function FileController($scope) {
    $scope.onClick = function(e) {
      e.stopPropagation();

      $scope.$emit('select-file', $scope.file);
    };
  }
})();
