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

    var fields = 'id,mimeType,name,parents,ownedByMe,owners(displayName)';
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
