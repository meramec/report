(function() {
  angular.module('google.api').directive('browseDrive', browseDrive);
  angular.module('google.api').controller('BrowseDriveController', ['$scope', '$timeout', 'drive', 'me', BrowseDriveController]);

  function browseDrive() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'templates/googleApi/browseDrive.html',
      controller: 'BrowseDriveController',
      scope: {}
    };
  }

  function BrowseDriveController($scope, $timeout, drive) {

    $scope.drive = {

      folders: [],

      onChange: function() {
        $timeout(function() {
          $scope.$digest();
        });
      }
    };

    drive.buildTree($scope.drive, ['application/vnd.google-apps.spreadsheet']);
  }
})();
