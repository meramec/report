(function() {
  angular.module('google.api').directive('browseDriveModal', browseDriveModal);
  angular.module('google.api').controller('BrowseDriveModalController', ['$scope', '$timeout', BrowseDriveModalController]);

  function browseDriveModal() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'templates/googleApi/browseDriveModal.html',
      controller: 'BrowseDriveModalController',
      scope: {}
    };
  }

  function BrowseDriveModalController($scope, $timeout) {
    $scope.$on('browse-drive', function() {
      $scope.openModal = true;
      $scope.$digest();
    });
  }

})();

