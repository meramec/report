(function() {
  angular.module('report.generator').directive('appTitle', appTitle);
  angular.module('report.generator').controller('AppTitleController', ['$scope', '$window', AppTitleController]);

  function appTitle() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'templates/reportGenerator/appTitle.html',
      controller: 'AppTitleController'
    };
  }

  function AppTitleController($scope, $window) {

    function updateTitle() {
      $window.document.title = $scope.pageTitle + ' | ' + $scope.pageSubtitle;
    }

    updateTitle();
  }
})();
