(function() {
  angular.module('picker').service('recentFiles', recentFiles);

  function recentFiles() {
    this.get = function() {
      var recent = localStorage.getItem('recent');
      try {
        if(recent)
          return _.compact(JSON.parse(recent));
      } catch(e) {}
      return [];
    };

    this.update = function(file) {
      var files = this.get();
      if(file) {
        files.unshift(file);

        files = _.head(_.uniq(files, false, function(file) { return file.id}), 10);
        localStorage.setItem('recent', JSON.stringify(files));
      }
      return files;
    };
  }
})();
