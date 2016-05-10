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
