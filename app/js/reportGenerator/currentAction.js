(function() {
  angular.module('report.generator').directive('currentAction', currentAction);

  function currentAction() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'templates/reportGenerator/currentAction.html'
    };
  }
})();
