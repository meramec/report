(function() {
  angular.module('report.generator').service('selectAction', [selectAction]);

  function selectAction() {
    this.browseDrive = function(scope) {
      scope.pageTitle = 'Choose Spreadsheet';
      scope.pageSubtitle = 'Spreadsheets available to your google credentials';
      scope.currentAction = 'browse-drive';
    };
  }
})();
