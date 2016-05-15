(function() {
  angular.module('report.generator').service('path', ['$location', path]);

  function path($location) {
    var self = this;
    this.get = function() { 
      return $location.path().replace(/^\//, '');
    };
    this.set = function(path) {
      $location.path(path);
    };
    this.watch = function(scope, callback) {
      scope.$on('$locationChangeStart', function() {
        callback(self.get());
      });
    };

  }
})();
