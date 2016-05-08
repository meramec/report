// /home/ryan/github/meramec/report/app/js/googleApi.js
(function() {
  angular.module('google.api', []);
})();

// /home/ryan/github/meramec/report/app/js/app.js
(function() {
  var app = angular.module('ReportGenerator', ['report.generator', 'google.api']);
})();

// /home/ryan/github/meramec/report/app/js/reportGenerator.js
(function() {
  angular.module('report.generator', []);
})();

// /home/ryan/github/meramec/report/app/js/googleApi/folder.js
(function() {
  angular.module('google.api').directive('folder', folder);
  angular.module('google.api').controller('FolderController', ['$scope', FolderController]);

  function folder() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'templates/googleApi/folder.html',
      controller: 'FolderController',
    };
  }

  function FolderController($scope) {
    $scope.folder.open = false;

    $scope.onClick = function(e) {
      e.stopPropagation();

      $scope.folder.open = ! $scope.folder.open;
    };
  }
})();

// /home/ryan/github/meramec/report/app/js/googleApi/file.js
(function() {
  angular.module('google.api').directive('file', file);
  angular.module('google.api').controller('FileController', ['$scope', FileController]);

  function file() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'templates/googleApi/file.html',
      controller: 'FileController',
    };
  }

  function FileController($scope) {

    $scope.onClick = function(e) {
      e.stopPropagation();
    };
  }
})();

// /home/ryan/github/meramec/report/app/js/googleApi/browseDrive.js
(function() {
  angular.module('google.api').directive('browseDrive', browseDrive);
  angular.module('google.api').controller('BrowseDriveController', ['$scope', BrowseDriveController]);

  function browseDrive() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'templates/googleApi/browseDrive.html',
      controller: 'BrowseDriveController'
    };
  }

  function BrowseDriveController($scope) {
    $scope.folders = [
      {
        name: 'one',
        folders: [
          { name: 'two', files: [ { name: 'file.txt' } ] }
        ]
      },
      {
        name: 'two',
        files: [ { name: 'file2.txt' } ]
      },
    ];
  }
})();

// /home/ryan/github/meramec/report/app/js/reportGenerator/appTitle.js
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

// /home/ryan/github/meramec/report/app/js/reportGenerator/currentAction.js
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

// /home/ryan/github/meramec/report/app/js/reportGenerator/selectAction.js
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

// /home/ryan/github/meramec/report/app/js/reportGenerator/reportGenerator.js
(function() {
  angular.module('report.generator').directive('reportGenerator', reportGenerator);
  angular.module('report.generator').controller('ReportGeneratorController', ['$scope', 'selectAction', ReportGeneratorController]);

  function reportGenerator() {
    return {
      restrict: 'E',
      replace: true,
      controller: 'ReportGeneratorController',
      templateUrl: 'templates/reportGenerator/reportGenerator.html'
    };
  }

  function ReportGeneratorController($scope, selectAction) {
    selectAction.browseDrive($scope);
  }
})();

