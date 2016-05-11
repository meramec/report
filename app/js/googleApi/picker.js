(function() {
  angular.module('google.api').directive('picker', picker);
  angular.module('google.api').controller('PickerController', ['$scope', '$timeout', PickerController]);

  function picker() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'templates/googleApi/picker.html',
      controller: 'PickerController',
      scope: true
    };
  }

  function PickerController($scope, $timeout) {
    $scope.showDrive = true;

    $scope.$on('choose-file', function() {
      $scope.openModal = true;
      $timeout(function() {
        $scope.$digest();
      });
    });
    $scope.dismiss = function() {
      $scope.openModal = false;
      $timeout(function() {
        $scope.$digest();
      });
    };
  }

})();

