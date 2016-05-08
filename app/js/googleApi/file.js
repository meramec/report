(function() {
  angular.module('google.api').directive('file', file);
  angular.module('google.api').controller('FileController', ['$scope', FileController]);

  function file() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'templates/googleApi/file.html',
      controller: 'FileController',
    };
  }

  function FileController($scope) {

    $scope.onClick = function(e) {
      e.stopPropagation();
    };
  }
})();
