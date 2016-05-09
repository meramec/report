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

    drive.shared = [];

    q: "mimeType='application/vnd.google-apps.folder' OR mimeType = 'application/vnd.google-apps.spreadsheet'"

    var fields = 'id,mimeType,name,parents,size,ownedByMe,owners(displayName)';
    var opts = {
      fields: 'nextPageToken, files(' + fields + ')'
    };

    if(types) {
      opts.q = "mimeType='application/vnd.google-apps.folder'";
      _.each(types, function(type) {
        q += " OR mimeType='" + type + "'";
      });
    }

    self.begin = function() {
      getRootFolder();
      getFiles(opts);
    };

    var files = {};

    function getRootFolder() {
      var request = gapi.client.drive.files.get({fileId: 'root', fields: fields});
      request.execute(function(response) {
        drive.root = update(response.id, response);
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
              update(file.id, file);

              _.each(file.parents, function(id) {
                var p = acquire(id);
                if(file.mimeType === 'application/vnd.google-apps.folder') {
                  p.folders.push(file);
                } else {
                  p.files.push(file);
                }
              });
            } else {
              drive.shared.push(file);
            }
          });
        }
      });
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
