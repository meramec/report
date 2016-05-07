(function() {
  angular.module('report.generator').directive('reportTitle', reportTitle);

  function reportTitle() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'templates/reportGenerator/reportTitle.html'
    };
  }

})();
