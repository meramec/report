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
