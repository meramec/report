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

// /home/ryan/github/meramec/report/app/js/googleApi/auth.js
(function() {
  angular.module('google.api').service('auth', auth);
  
  function auth() {
    this.authorize = function(clientId, scopes, callback) {
      var options = {
        client_id: clientId,
        scope: scopes.join(' '),
        immediate: true
      };

      getAuthorization(options, callback);
    };

    function getAuthorization(options, callback) {
      gapi.auth.authorize(options, function(result) {
        if(result && ! result.error) {
          callback();
        } else {
          options.immediate = false;
          getAuthorization(options, callback);
        }
      });
    }
  }
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
  angular.module('google.api').controller('BrowseDriveController', ['$scope', '$timeout', 'auth', 'client', BrowseDriveController]);

  function browseDrive() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'templates/googleApi/browseDrive.html',
      controller: 'BrowseDriveController',
      scope: {}
    };
  }

  function BrowseDriveController($scope, $timeout, auth, client) {
    var clientId = '215619993678-kdcmgv8u79r9vdmti2m3ldjuvqgagnb7.apps.googleusercontent.com';
    var scopes = ['https://www.googleapis.com/auth/drive.metadata.readonly'];

    auth.authorize(clientId, scopes, onReady);

    $scope.drive = {

      folders: [],

      onChange: function() {
        $timeout(function() {
          $scope.$digest();
        });
      }

    };


    function onReady() {
      client.buildTree($scope.drive);
    }

  }
})();

// /home/ryan/github/meramec/report/app/js/googleApi/client.js
(function() {
  angular.module('google.api').service('client', client);

  var loaded;

  function client() {
    var self = this;

    var buildTree;

    if(! loaded) {
      gapi.client.load('drive', 'v3', function() {
        loaded = true;

        if(buildTree) {
          buildTree.begin();
        }
      });
    }

    self.buildTree = function(drive, types) {
      var b = new BuildTree(drive, types);

      if(loaded) {
        b.begin();
      } else {
        buildTree = b;
      }
    }; 
  }

  function BuildTree(drive, types) {
    var self = this;

    var fields = 'id,mimeType,name,parents,size,ownedByMe,owners(displayName)';
    var opts = {
      fields: 'nextPageToken, files(' + fields + ')',
      q: "trashed=false"
    };

    if(types) {
      opts.q += " AND (mimeType='application/vnd.google-apps.folder'";
      _.each(types, function(type) {
        q += " OR mimeType='" + type + "'";
      });
      opts.q += ")";
    }

    self.begin = function() {
      getRootFolder();
      getFiles(opts);
    };

    var files = {};

    function getRootFolder() {
      var request = gapi.client.drive.files.get({fileId: 'root', fields: fields});
      request.execute(function(response) {
        drive.folders[0] = update(response.result.id, response.result);
        drive.onChange();
      });
    }

    function getFiles(opts) {
      var request = gapi.client.drive.files.list(opts);
      request.execute(function(response) {
        if(response.nextPageToken) {
          opts.pageToken = response.nextPageToken;
          getFiles(opts);
        }

        if(response.files) {
          _.each(response.files, function(file) {
            if(file.ownedByMe) {
              if(file.mimeType === 'application/vnd.google-apps.folder') {
                file = update(file.id, file);
              }

              _.each(file.parents, function(id) {
                var p = acquire(id);
                if(file.mimeType === 'application/vnd.google-apps.folder') {
                  p.folders.push(file);
                } else {
                  p.files.push(file);
                }
              });
            } else {
              var shared = acquire('shared');
              update('shared', { name: 'Shared With Me' });
              drive.folders[1] = shared;

              shared.folders.push(file);
            }
          });
        }
      });

      drive.onChange();
    }

    function update(id, file) {
      if(! files[id]) {
        files[id] = {};
      }
      for(key in file) {
        files[id][key] = file[key];
      }
      return files[id];
    }

    function acquire(id) {
      if(! files[id]) {
        files[id] = {
          files: [],
          folders: []
        };
      }
      var p = files[id];

      if(! p.folders)
        p.folders = [];
      if(! p.files)
        p.files = [];

      return p;
    }
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
  angular.module('report.generator').controller('ReportGeneratorController', ['$scope', '$timeout', 'selectAction', ReportGeneratorController]);

  function reportGenerator() {
    return {
      restrict: 'E',
      replace: true,
      controller: 'ReportGeneratorController',
      templateUrl: 'templates/reportGenerator/reportGenerator.html'
    };
  }

  function ReportGeneratorController($scope, $timeout, selectAction) {
    $scope.currentAction = '';
    $scope.$watch('currentAction', function(action) {
      if(action) {
        $timeout(function() {
          $scope.$broadcast(action);
        });
      }
    });

    selectAction.browseDrive($scope);
  }
})();

