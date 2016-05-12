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
