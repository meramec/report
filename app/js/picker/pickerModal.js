(function() {
  angular.module('picker').directive('pickerModal', pickerModal);
  angular.module('picker').controller('PickerModalController', ['$scope', '$timeout', PickerModalController]);

  function pickerModal() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'templates/picker/pickerModal.html',
      controller: 'PickerModalController',
      scope: true
    };
  }

  function PickerModalController($scope, $timeout) {
    $scope.showDrive = true;

    $scope.$on('choose-file', function() {
      $scope.openModal = true;
    });
    $scope.$on('select-file', function() {
      $scope.dismiss();
    });
    $scope.dismiss = function() {
      $scope.openModal = false;
    };
  }

})();

