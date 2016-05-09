(function() {
  angular.module('google.api').directive('browseDrive', browseDrive);
  angular.module('google.api').controller('BrowseDriveController', ['$scope', 'auth', 'client', BrowseDriveController]);

  function browseDrive() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'templates/googleApi/browseDrive.html',
      controller: 'BrowseDriveController',
      scope: {}
    };
  }

  function BrowseDriveController($scope, auth, client) {
    var clientId = '215619993678-kdcmgv8u79r9vdmti2m3ldjuvqgagnb7.apps.googleusercontent.com';
    var scopes = ['https://www.googleapis.com/auth/drive.metadata.readonly'];

    auth.authorize(clientId, scopes, onReady);

    function onReady() {
      $scope.drive = {};
      client.buildTree($scope.drive);
    }
  }
})();
