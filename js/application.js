// /home/ryan/github/meramec/report/app/js/googleApi.js
(function() {
  angular.module('google.api', []);
})();

// /home/ryan/github/meramec/report/app/js/app.js
(function() {
  var app = angular.module('ReportGenerator', ['report.generator']);
})();

// /home/ryan/github/meramec/report/app/js/reportGenerator.js
(function() {
  angular.module('report.generator', ['google.api']);
})();

// /home/ryan/github/meramec/report/app/js/googleApi/sheets.js
(function() {
  angular.module('google.api').service('sheets', ['auth', '$http', sheets]);

  function sheets(auth, $http) {
    var self = this;

    self.open = function(id, callback) {
      $http.jsonp(sheetUrl(id)).then(callback);
    };

    function sheetUrl(id) {
      return 'https://spreadsheets.google.com/feeds/list/' + id + '/od6/private/full?alt=json-in-script&access_token=' + auth.getToken() + '&callback=JSON_CALLBACK';
    }
  }
})();

// /home/ryan/github/meramec/report/app/js/googleApi/auth.js
(function() {
  angular.module('google.api').service('auth', ['$http', auth]);

  var clientId = '215619993678-kdcmgv8u79r9vdmti2m3ldjuvqgagnb7.apps.googleusercontent.com';
  var scopes = [
    'https://www.googleapis.com/auth/plus.me',
    'https://www.googleapis.com/auth/drive.metadata.readonly',
    'https://spreadsheets.google.com/feeds'
  ];

  var onAuthorize;
  var loaded;
  window.onGoogleLoaded = function() {
    loaded = true;
    if(onAuthorize)
      onAuthorize();
  };

  function auth($http) {

    this.authorize = function(callback) {
      var options = {
        client_id: clientId,
        scope: scopes.join(' '),
        immediate: true
      };
  
      var get = function() {
        getAuthorization(options, callback);
      };

      if(loaded)
        get();
      else
        onAuthorize = get;
    };

    this.getToken = function() {
      return gapi.auth.getToken().access_token;
    };

    function getAuthorization(options, callback) {
      gapi.auth.authorize(options, function(result) {
        if(result && ! result.error) {
          callback();
        } else if(options.immediate) {
          options.immediate = false;
          getAuthorization(options, callback);
        }
      });
    }
  }
})();

// /home/ryan/github/meramec/report/app/js/googleApi/drive.js
(function() {
  angular.module('google.api').service('drive', ['client', drive]);

  function drive(client) {
    var lib = client.load('drive', 'v3');

    this.buildTree = function(drive, types) {
      var notify = new Notify();
      lib.start(function() {
        new BuildTree(drive, types, notify).begin();
      });

      return notify;
    }; 
  }

  function BuildTree(drive, types, notify) {
    var self = this;

    var fields = 'id,mimeType,name,parents,size,ownedByMe,owners(displayName)';
    var opts = {
      fields: 'nextPageToken, files(' + fields + ')',
      q: "trashed=false"
    };

    if(types) {
      opts.q += " AND (mimeType='application/vnd.google-apps.folder'";
      _.each(types, function(type) {
        opts.q += " OR mimeType='" + type + "'";
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
        notify.onNotifyChange();
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

                  if(! file.empty)
                    setNotEmpty(p);   
                } else {
                  p.files.push(file);
                  setNotEmpty(p);
                }
              });
            } else {
              var shared = acquire('shared');
              update('shared', { name: 'Shared With Me' });
              drive.folders[1] = shared;

              shared.files.push(file);
              setNotEmpty(shared);
            }
          });
        }
        notify.onNotifyChange();

        if(! response.nextPageToken)
          notify.onNotifyComplete();
      });

    }

    function update(id, file) {
      if(! files[id]) {
        files[id] = {
          empty: true
        };
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
          folders: [],
          empty: true
        };
      }
      var p = files[id];

      if(! p.folders)
        p.folders = [];
      if(! p.files)
        p.files = [];

      return p;
    }

    function setNotEmpty(folder) {
      folder.empty = false;
      _.each(folder.parents, function(id) {
        if(files[id])
          setNotEmpty(files[id]);
      });
    }
  }

  function Notify() {
    var self = this;
    this.onChange = function(callback) {
      self.onNotifyChange = callback;
      return self;
    }
    this.onComplete = function(callback) {
      self.onNotifyComplete = callback;
      return self;
    }
  }

})();

// /home/ryan/github/meramec/report/app/js/googleApi/picker.js
(function() {
  angular.module('google.api').directive('picker', picker);
  angular.module('google.api').controller('PickerController', ['$scope', '$timeout', PickerController]);

  function picker() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'templates/googleApi/picker.html',
      controller: 'PickerController',
      scope: true
    };
  }

  function PickerController($scope, $timeout) {
    $scope.showDrive = true;

    $scope.$on('choose-file', function() {
      $scope.openModal = true;
      $timeout(function() {
        $scope.$digest();
      });
    });
    $scope.dismiss = function() {
      $scope.openModal = false;
      $timeout(function() {
        $scope.$digest();
      });
    };
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
  angular.module('google.api').controller('FileController', ['$scope', 'selectAction', FileController]);

  function file() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'templates/googleApi/file.html',
      controller: 'FileController',
    };
  }

  function FileController($scope, selectAction) {
    $scope.onClick = function(e) {
      e.stopPropagation();

      selectAction.openSheet($scope, $scope.file);
    };
  }
})();

// /home/ryan/github/meramec/report/app/js/googleApi/browseDrive.js
(function() {
  angular.module('google.api').directive('browseDrive', browseDrive);
  angular.module('google.api').controller('BrowseDriveController', ['$scope', 'drive', 'me', BrowseDriveController]);

  function browseDrive() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'templates/googleApi/browseDrive.html',
      controller: 'BrowseDriveController',
      scope: {}
    };
  }

  function BrowseDriveController($scope, drive) {

    $scope.drive = {
      folders: []
    };

    drive.buildTree($scope.drive, ['application/vnd.google-apps.spreadsheet'])
      .onChange(function() {
        if($scope.drive.folders[0])
          $scope.drive.folders[0].open = true;

        $scope.$digest();
      }).onComplete(function() {

      });
  }
})();

// /home/ryan/github/meramec/report/app/js/googleApi/me.js
(function() {
  angular.module('google.api').service('me', ['client', me]);

  function me(client) {
    var lib = client.load('plus', 'v1');

    this.load = function(me) {
      lib.start(function() {
        var fields = 'displayName, emails, id, image(url)';
        var request = gapi.client.plus.people.get({userId: 'me', fields: fields});

        request.execute(function(response) {
          console.log(JSON.stringify(response));
        });
      });
    };
  }
})();

// /home/ryan/github/meramec/report/app/js/googleApi/client.js
(function() {
  angular.module('google.api').factory('client', client);

  function client() {
    var loaded;
    return {
      load: function(lib, version) {
        var run;
        gapi.client.load(lib, version, function() {
          loaded = true;

          if(run)
            run();
        });

        return {
          start: function(fn) {
            if(loaded)
              fn();
            else
              run = fn;
          }
        };
      }
    };
  };
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

// /home/ryan/github/meramec/report/app/js/reportGenerator/report.js
(function() {
  angular.module('report.generator').directive('report', report);
  angular.module('report.generator').controller('ReportController', ['$scope', '$timeout', 'auth', ReportController]);

  function report() {
    return {
      restrict: 'E',
      replace: true,
      controller: 'ReportController',
      templateUrl: 'templates/reportGenerator/report.html'
    };
  }

  function ReportController($scope, $timeout, auth) {
    $scope.report = {
      title: 'Spreadsheet',
      subtitle: 'Report'
    };

    auth.authorize(onReady);

    function onReady() {
      $scope.$broadcast('choose-file');
    }
  }
})();

// /home/ryan/github/meramec/report/app/js/reportGenerator/selectAction.js
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

