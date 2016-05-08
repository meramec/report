(function() {
  angular.module('google.api').directive('browseDrive', browseDrive);
  angular.module('google.api').controller('BrowseDriveController', ['$scope', BrowseDriveController]);

  function browseDrive() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'templates/googleApi/browseDrive.html',
      controller: 'BrowseDriveController'
    };
  }

  function BrowseDriveController($scope) {
    $scope.folders = [
      {
        name: 'one',
        folders: [
          { name: 'two', files: [ { name: 'file.txt' } ] }
        ]
      },
      {
        name: 'two',
        files: [ { name: 'file2.txt' } ]
      },
    ];
  }
})();
