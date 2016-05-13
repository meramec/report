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
  angular.module('google.api').service('sheets', ['client', 'latch', '$http', sheets]);

  function sheets(client, latch, $http) {
    var self = this;

    self.open = function(id, callback) {
      client.authToken().getToken(function(token) {
        var spreadsheet = new Spreadsheet(token, callback);
        spreadsheet.load(id);
      });
    };
    function Spreadsheet(token, callback) {
      var title;
      var worksheets = [];

      var params = '?alt=json-in-script&access_token=' + token + '&callback=JSON_CALLBACK';

      this.load = function(id) {
        var url = 'https://spreadsheets.google.com/feeds/worksheets/' + id + '/private/basic' + params;
  
        $http.jsonp(url).then(onWorksheetList);
      };

      function onWorksheetList(response) {
        var doc = response.data.feed;
        var onComplete = latch.create(doc.entry.length);

        onComplete.wait(function() {
          callback({ title: title, worksheets: worksheets });
        });

        title = doc.title.$t;

        _.each(doc.entry, function(sheet) {
          var s = {};
          worksheets.push(s);

          var link = _.find(sheet.link, function(l) { return l.rel === 'http://schemas.google.com/spreadsheets/2006#cellsfeed'; });
          $http.jsonp(link.href + params).then(function(response) {
            onWorksheet(response, s);
            onComplete.ready();
          });
        });
      }

      function onWorksheet(response, sheet) {
        var data = response.data.feed;
        sheet.name = data.title.$t;

        sheet.headers = [];
        sheet.data = [];

        _.each(data.entry, function(entry) {
          var index = entry.title.$t;
          var row = parseInt(index.replace(/^\D+/, ''));

          var colLetters = index.replace(/\d+$/, '');
          var col = 0;
          for(var i = 0; i < colLetters.length; ++i) {
            col *= 26;
            col += colLetters.charCodeAt(i) - 64;
          }

          if(row == 1) {
            sheet.headers[col-1] = entry.content.$t;
          } else {
            var i = row - 2;
            if(! sheet.data[i])
              sheet.data[i] = [];
            sheet.data[i][col-1] = entry.content.$t;
          }
        });
      }
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

    var onComplete = latch.create(2);
    onComplete.wait(function() {
      notify.onNotifyComplete();
    });

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
        onComplete.ready();
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
          onComplete.ready();
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
      create: function(n) {
        return new Latch(n);
      }
    };
  }

  function Latch(n) {
    var ready = n ? n : 1;

    var calls = [];

    this.ready = function() {
      if(--ready > 0)
        return;

      while(calls.length > 0) {
        var call = calls.shift();
        call();
      }
    };

    this.wait = function(fn) {
      if(ready == 0) {
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

  function client($window, $document, latch) {

    var clientLoaded = latch.create();
    authorized = latch.create();

    $window.onClientLoaded = function() {
      clientLoaded.ready();
    };

    var clientjs = $document[0].createElement('script');
    clientjs.src = 'https://apis.google.com/js/client.js?onload=onClientLoaded';
    $document[0].body.appendChild(clientjs);

    this.authorization = function(clientId, scopes) {
      return new Authorization(clientId, scopes);
    };

    this.authToken = function() {
      return new AuthToken();
    };

    this.load = function(lib, version) {
      return new Library(lib, version);
    };

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
              authorized.ready();
            } else if(options.immediate) {
              options.immediate = false;
              this.authorize(options, callback);
            }
          });
        });
      };
    }

    function AuthToken() {
      this.getToken = function(callback) {
        authorized.wait(function() {
          callback(gapi.auth.getToken().access_token);
        });
      }
    }

    function Library(lib, version) {
      var libraryLoaded = latch.create();

      authorized.wait(function() {
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

// /home/ryan/github/meramec/report/app/js/reportGenerator/rowReport.js
(function() {
  angular.module('report.generator').directive('rowReport', rowReport);
  angular.module('report.generator').controller('RowReportController', ['$scope', RowReportController]);

  function rowReport() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'templates/reportGenerator/rowReport.html',
      controller: 'RowReportController',
      scope: true
    };
  }

  function RowReportController($scope) {
    $scope.$watch('row', function() {
      if(! $scope.row)
        return;

      $scope.rowReport = [];

      _.each($scope.spreadsheet.worksheets, function(worksheet) {
        var row = _.find(worksheet.data, function(row) {
          return row[0] === $scope.row;
        });

        if(row) {
          var report = {
            name: worksheet.name,
            columns: []
          };

          $scope.rowReport.push(report);

          _.each(_.tail(row, 1), function(column, j) {
            report.columns.push({
              name: worksheet.headers[j+1],
              value: column
            });
          });
        }
      });

    });
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
      $window.document.title = $scope.report.title + ' | ' + $scope.report.subtitle;
    }

    updateTitle();
  }
})();

// /home/ryan/github/meramec/report/app/js/reportGenerator/spreadsheet.js
(function() {
  angular.module('report.generator').directive('spreadsheet', spreadsheet);
  angular.module('report.generator').controller('SpreadsheetController', ['$scope', '$location', 'sheets', SpreadsheetController]);

  function spreadsheet() {
    return {
      retrict: 'E',
      replace: true,
      templateUrl: 'templates/reportGenerator/spreadsheet.html',
      controller: 'SpreadsheetController',
      scope: true
    };
  }

  function SpreadsheetController($scope, $location, sheets) {

    $scope.$on('$locationChangeSuccess', function() {
      $scope.row = $location.path().replace(/^\//, '');
    });

    $scope.$watch('id', function() {
      if(! $scope.id)
        return;

      sheets.open($scope.id, function(spreadsheet) {
        $scope.spreadsheet = spreadsheet;
      });
    });

    $scope.onClick = function(row) {
      $scope.row = row;
      $location.path(row);
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

    $scope.$on('select-file', function(e, id) {
      $scope.id = id;
    });
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

// /home/ryan/github/meramec/report/app/js/reportGenerator/summary.js
(function() {
  angular.module('report.generator').directive('summary', summary);
  angular.module('report.generator').controller('SummaryController', ['$scope', '$timeout', SummaryController]);

  function summary() {
    return {
      retrict: 'E',
      replace: true,
      templateUrl: 'templates/reportGenerator/summary.html',
      controller: 'SummaryController'
    };
  }

  function SummaryController($scope, $timeout) {
    $scope.$watch('spreadsheet', function() {
      if(! $scope.spreadsheet)
        return;

      $scope.primaryHeader = primaryHeader();
      $scope.summaries = summarizeWorksheets();
    });

    function primaryHeader() {
      var sheet = primaryWorksheet();
      if(sheet)
        return sheet.headers[0];
    };

    function summarizeWorksheets() {
      var summaries = [];
      var byName = {};

      if($scope.spreadsheet) {
        _.each($scope.spreadsheet.worksheets, function(worksheet, k) {
          _.each(worksheet.data, function(row) {
            var name = row[0];
            var summary = byName[name];
            if(! summary) {
              summary = byName[name] = {
                name: name,
                totals: []
              };
              summaries.push(summary);
            }

            summary.totals[k] = _.filter(_.tail(row, 1), function(value) { return !!value}).length;
          });
        });
      }

      return summaries;
    }

    function primaryWorksheet() {
      if($scope.spreadsheet && $scope.spreadsheet.worksheets)
        return $scope.spreadsheet.worksheets[0]; 
    }
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
      controller: 'FileController'
    };
  }

  function FileController($scope) {
    $scope.onClick = function(e) {
      e.stopPropagation();

      $scope.$emit('select-file', $scope.file.id);
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
    });
    $scope.$on('select-file', function() {
      $scope.dismiss();
    });
    $scope.dismiss = function() {
      $scope.openModal = false;
    };
  }

})();


