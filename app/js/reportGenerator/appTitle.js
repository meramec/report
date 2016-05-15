(function() {
  angular.module('report.generator').directive('appTitle', appTitle);
  angular.module('report.generator').controller('AppTitleController', ['$scope', '$window', 'path', AppTitleController]);

  function appTitle() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'templates/reportGenerator/appTitle.html',
      controller: 'AppTitleController'
    };
  }

  function AppTitleController($scope, $window, path) {

    function updateTitle(path) {
      var components = [ $scope.report.title, $scope.report.subtitle ];
      if($scope.id)
        components.push(path);

      $window.document.title = _.compact(components).join(' | ');
      $scope.path = path;
    }

    updateTitle(path.get());
    path.watch($scope, updateTitle);
  }
})();
