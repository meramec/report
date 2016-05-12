(function() {
  angular.module('picker').directive('browseDrive', browseDrive);
  angular.module('picker').controller('BrowseDriveController', ['$scope', 'drive', BrowseDriveController]);

  function browseDrive() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'templates/picker/browseDrive.html',
      controller: 'BrowseDriveController',
      scope: {}
    };
  }

  function BrowseDriveController($scope, drive) {

    $scope.drive = {
      folders: []
    };

    drive.buildTree($scope.drive, ['application/vnd.google-apps.spreadsheet'])
      .onChange(function() {
        $scope.$digest();
      }).onComplete(function() {
        if($scope.drive.folders[0]) {
          $scope.drive.folders[0].open = true;
          $scope.$digest();
        }
      });
  }
})();
