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

    self.buildTree = function(root, types) {
      var b = new BuildTree(root, types);

      if(loaded) {
        b.begin();
      } else {
        buildTree = b;
      }
    }; 
  }

  function BuildTree(root, types) {
    var self = this;

    root.shared = [];

    q: "mimeType='application/vnd.google-apps.folder' OR mimeType = 'application/vnd.google-apps.spreadsheet'"

    var opts = {
      fields: 'nextPageToken, files(id,mimeType,name,parents,size,ownedByMe,owners(displayName))'
    };

    if(types) {
      opts.q = "mimeType='application/vnd.google-apps.folder'";
      _.each(types, function(type) {
        q += " OR mimeType='" + type + "'";
      });
    }

    self.begin = function() {
      getFiles(opts);
    };

    var files = {};

    function getFiles(opts) {
      var request = gapi.client.drive.files.list(opts);
      request.execute(function(response) {
        if(response.nextPageToken) {
          opts.pageToken = response.nextPageToken;
          getFiles(opts);
        }
        else console.log(JSON.stringify(root));

        if(response.files) {
          _.each(response.files, function(file) {
            if(file.ownedByMe) {
              update(file.id, file);

              if(file.parents) {
                _.each(file.parents, function(id) {
                  var p = acquire(id);
                  if(file.mimeType === 'application/vnd.google-apps.folder') {
                    p.folders.push(file);
                  } else {
                    p.files.push(file);
                  }
                });
              } else {
                root.drive = file;                
              }
            } else {
              root.shared.push(file);
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

      if(file.mimeType === 'application/vnd.google-apps.folder') {
        files[id].files = [];
        files[id].folders = [];
      }
    }

    function acquire(id) {
      if(files[id]) {
        return files[id];
      } else {
        return files[id] = {
          files: [],
          folders: []
        };
      }
    }
  }
})();
