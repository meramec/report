(function() {
  angular.module('picker').directive('pickerModal', pickerModal);
  angular.module('picker').controller('PickerModalController', ['$scope', 'recentFiles', PickerModalController]);

  function pickerModal() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'templates/picker/pickerModal.html',
      controller: 'PickerModalController',
      scope: true
    };
  }

  function PickerModalController($scope, recentFiles) {
    $scope.showDrive = true;

    $scope.$on('choose-file', function() {
      $scope.recentFiles = recentFiles.get();
      $scope.openModal = true;
      $scope.showDrive = $scope.recentFiles.length == 0;
    });
    $scope.$on('select-file', function(e, file) {
      $scope.dismiss();
      $scope.hasRecent = recentFiles.update(file);
    });

    $scope.onBrowse = function() {
      $scope.showDrive = true;
    };
    $scope.onRecent = function() {
      if($scope.recentFiles)
        $scope.showDrive = false;
    };

    $scope.dismiss = function() {
      $scope.openModal = false;
    };
  }

})();

