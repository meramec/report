(function() {
  angular.module('google.api').directive('folder', folder);
  angular.module('google.api').controller('FolderController', ['$scope', FolderController]);

  function folder() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'templates/googleApi/folder.html',
      controller: 'FolderController',
    };
  }

  function FolderController($scope) {
    $scope.folder.open = false;

    $scope.onClick = function(e) {
      e.stopPropagation();

      $scope.folder.open = ! $scope.folder.open;
    };
  }
})();
