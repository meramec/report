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
      var displayPath = _.map(path.split('/'), function(part) {
        return part.charAt(0).toUpperCase() + part.slice(1);
      }).join(' | ');

      var components = [ $scope.report.title, $scope.report.subtitle ];
      if($scope.id)
        components.push(displayPath);

      $window.document.title = _.compact(components).join(' | ');
      $scope.path = displayPath;
    }

    updateTitle(path.get());
    path.watch($scope, updateTitle);
  }
})();
