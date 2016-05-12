(function() {
  angular.module('picker').directive('folder', folder);
  angular.module('picker').controller('FolderController', ['$scope', FolderController]);

  function folder() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'templates/picker/folder.html',
      controller: 'FolderController',
    };
  }

  function FolderController($scope) {
    $scope.onClick = function(e) {
      e.stopPropagation();

      $scope.folder.open = ! $scope.folder.open;
    };
  }
})();
