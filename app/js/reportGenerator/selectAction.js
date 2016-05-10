(function() {
  angular.module('report.generator').service('selectAction', ['sheets', selectAction]);

  function selectAction(sheets) {
    this.browseDrive = function(scope) {
      scope.pageTitle = 'Choose Spreadsheet';
      scope.pageSubtitle = 'Spreadsheets available to your google credentials';
      scope.currentAction = 'browse-drive';
    };

    this.openSheet = function(scope, file) {
      console.log(file.id);
      console.log(file.name);
      sheets.open(file.id, function(data) {
        console.log(JSON.stringify(data));
      });
    };
  }
})();
