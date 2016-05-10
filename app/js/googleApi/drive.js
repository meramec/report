(function() {
  angular.module('google.api').service('drive', ['client', drive]);

  var loaded;
  function drive(client) {
    var self = this;

    var lib = client.load('drive', 'v3');

    self.buildTree = function(drive, types) {
      lib.start(function() {
        new BuildTree(drive, types).begin();
      });
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
