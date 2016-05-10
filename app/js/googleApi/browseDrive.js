(function() {
  angular.module('google.api').directive('browseDrive', browseDrive);
  angular.module('google.api').controller('BrowseDriveController', ['$scope', '$timeout', 'auth', 'drive', BrowseDriveController]);

  function browseDrive() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'templates/googleApi/browseDrive.html',
      controller: 'BrowseDriveController',
      scope: {}
    };
  }

  function BrowseDriveController($scope, $timeout, auth, drive) {
    var clientId = '215619993678-kdcmgv8u79r9vdmti2m3ldjuvqgagnb7.apps.googleusercontent.com';
    var scopes = ['https://www.googleapis.com/auth/drive.metadata.readonly', 'https://spreadsheets.google.com/feeds'];

    auth.authorize(clientId, scopes, onReady);

    $scope.drive = {

      folders: [],

      onChange: function() {
        $timeout(function() {
          $scope.$digest();
        });
      }
    };

    function onReady() {
      drive.buildTree($scope.drive, ['application/vnd.google-apps.spreadsheet']);
    }
  }
})();
