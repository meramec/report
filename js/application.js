// /home/ryan/github/meramec/report/app/js/googleApi.js
(function() {
  angular.module('google.api', []);
})();

// /home/ryan/github/meramec/report/app/js/picker.js
(function() {
  angular.module('picker', ['google.api']);
})();

// /home/ryan/github/meramec/report/app/js/app.js
(function() {
  var app = angular.module('ReportGenerator', ['report.generator']);
})();

// /home/ryan/github/meramec/report/app/js/reportGenerator.js
(function() {
  angular.module('report.generator', ['picker']);
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
  angular.module('google.api').service('auth', ['client', auth]);

  var clientId = '215619993678-kdcmgv8u79r9vdmti2m3ldjuvqgagnb7.apps.googleusercontent.com';
  var scopes = [
    'https://www.googleapis.com/auth/plus.me',
    'https://www.googleapis.com/auth/drive.metadata.readonly',
    'https://spreadsheets.google.com/feeds'
  ];

  function auth(client) {
    this.authorize = function(callback) {
      client.authorization(clientId, scopes).authorize(callback);
    };
  }
})();

// /home/ryan/github/meramec/report/app/js/googleApi/drive.js
(function() {
  angular.module('google.api').service('drive', ['client', 'latch',  drive]);

  function drive(client, latch) {
    var lib = client.load('drive', 'v3');

    this.buildTree = function(drive, types) {
      var notify = new Notify();
      lib.start(function() {
        new BuildTree(drive, types, latch, notify).begin();
      });

      return notify;
    }; 
  }

  function BuildTree(drive, types, latch, notify) {
    var self = this;

    var onRootLoaded = latch.create();

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
        drive.folders.unshift(update(response.result.id, response.result));
        onRootLoaded.ready();
      });
    }

    function getSharedFolder() {
      if(files['shared']) {
        return files['shared'];
      } else  {
        var shared = acquire('shared');
        update('shared', { name: 'Shared With Me' });
        drive.folders.push(shared);

        setNotEmpty(shared);

        return shared;
      }
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
                addFolderToParents(file);
              } else {
                addFileToParents(file);
              }
            } else {
              getSharedFolder().files.push(file);
            }
          });
        }

        notify.onNotifyChange();

        if(! response.nextPageToken) {
          onRootLoaded.wait(function() { 
            notify.onNotifyComplete();
          });
        } 
      });
    }

    function addFolderToParents(folder) {
      folder = update(folder.id, folder);
      _.each(folder.parents, function(id) {
        var p = acquire(id);
        p.folders.push(folder);
        if(! folder.empty)
          setNotEmpty(p);
      });
    }

    function addFileToParents(file) {
      _.each(file.parents, function(id) {
        var p = acquire(id);
        p.files.push(file);
        setNotEmpty(p);
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

// /home/ryan/github/meramec/report/app/js/googleApi/me.js
(function() {
  angular.module('google.api').service('me', ['client', me]);

  function me(client) {
    var lib = client.load('plus', 'v1');

    this.load = function(callback) {
      lib.start(function() {
        var fields = 'displayName,id,image(url)';
        var request = gapi.client.plus.people.get({userId: 'me', fields: fields});

        request.execute(function(response) {
          callback(response.result); 
        });
      });
    };
  }
})();

// /home/ryan/github/meramec/report/app/js/googleApi/latch.js
(function() {
  angular.module('google.api').factory('latch', latch);

  function latch() {
    return {
      create: function() {
        return new Latch();
      }
    };
  }

  function Latch() {
    var ready;

    var calls = [];

    this.ready = function() {
      ready = true;

      while(calls.length > 0) {
        var call = calls.shift();
        call();
      }
    };

    this.wait = function(fn) {
      if(ready) {
        fn();
      } else {
        calls.push(fn);
      }
    };
  }
})();

// /home/ryan/github/meramec/report/app/js/googleApi/client.js
(function() {
  angular.module('google.api').service('client', ['$window', '$document', 'latch', client]);

  var clientLoaded;

  function client($window, $document, latch) {

    clientLoaded = latch.create();

    $window.onClientLoaded = function() {
      clientLoaded.ready();
    };

    loadClient();

    this.authorization = function(clientId, scopes) {
      return new Authorization(clientId, scopes);
    };

    this.authToken = function() {
      return gapi.auth.getToken().access_token
    };

    this.load = function(lib, version) {
      return new Library(lib, version);
    };

    function loadClient() {
      var clientjs = $document[0].createElement('script');
      clientjs.src = 'https://apis.google.com/js/client.js?onload=onClientLoaded';
      $document[0].body.appendChild(clientjs);
    }

    function Authorization(clientId, scopes) {
      var options = {
        client_id: clientId,
        scope: scopes.join(' '),
        immediate: true
      };

      this.authorize = function(callback) {
        clientLoaded.wait(function() {
          gapi.auth.authorize(options, function(result) {
            if(result && ! result.error) {
              callback();
            } else if(options.immediate) {
              options.immediate = false;
              this.authorize(options, callback);
            }
          });
        });
      };
    }

    function Library(lib, version) {
      var libraryLoaded = latch.create();

      clientLoaded.wait(function() {
        gapi.client.load(lib, version, function() {
          libraryLoaded.ready();
        });
      });

      this.start = function(fn) {
        libraryLoaded.wait(fn);
      };
    }
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
      $window.document.title = $scope.report.title + ' | ' + $scope.report.subtitle;
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
      $scope.$broadcast('authenticated');
      $scope.$broadcast('choose-file');
    }
  }
})();

// /home/ryan/github/meramec/report/app/js/reportGenerator/user.js
(function() {
  angular.module('report.generator').directive('user', user);
  angular.module('report.generator').controller('UserController', ['$scope', 'me', UserController]);

  function user() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'templates/reportGenerator/user.html',
      controller: 'UserController'
    };
  }

  function UserController($scope, me) {
    $scope.$on('authenticated', function() {
      me.load(function(user) {
        $scope.user = user;
        $scope.$digest();
      });
    });
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

// /home/ryan/github/meramec/report/app/js/picker/folder.js
(function() {
  angular.module('picker').directive('folder', folder);
  angular.module('picker').controller('FolderController', ['$scope', FolderController]);

  function folder() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'templates/picker/folder.html',
      controller: 'FolderController',
    };
  }

  function FolderController($scope) {
    $scope.onClick = function(e) {
      e.stopPropagation();

      $scope.folder.open = ! $scope.folder.open;
    };
  }
})();

// /home/ryan/github/meramec/report/app/js/picker/file.js
(function() {
  angular.module('picker').directive('file', file);
  angular.module('picker').controller('FileController', ['$scope', FileController]);

  function file() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'templates/picker/file.html',
      controller: 'FileController',
    };
  }

  function FileController($scope, selectAction) {
    $scope.onClick = function(e) {
      e.stopPropagation();
    };
  }
})();

// /home/ryan/github/meramec/report/app/js/picker/browseDrive.js
(function() {
  angular.module('picker').directive('browseDrive', browseDrive);
  angular.module('picker').controller('BrowseDriveController', ['$scope', 'drive', BrowseDriveController]);

  function browseDrive() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'templates/picker/browseDrive.html',
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
        $scope.$digest();
      }).onComplete(function() {
        if($scope.drive.folders[0]) {
          $scope.drive.folders[0].open = true;
          $scope.$digest();
        }
      });
  }
})();

// /home/ryan/github/meramec/report/app/js/picker/pickerModal.js
(function() {
  angular.module('picker').directive('pickerModal', pickerModal);
  angular.module('picker').controller('PickerModalController', ['$scope', '$timeout', PickerModalController]);

  function pickerModal() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'templates/picker/pickerModal.html',
      controller: 'PickerModalController',
      scope: true
    };
  }

  function PickerModalController($scope, $timeout) {
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


