(function() {
  angular.module('google.api').service('client', ['$window', '$document', '$http', client]);

  function client($window, $document, $http) {

    var clientLoaded = new Latch();
    var authorized = new Latch();

    var authorization;

    $window.onClientLoaded = function() {
      clientLoaded.ready();
    };

    var clientjs = $document[0].createElement('script');
    clientjs.src = 'https://apis.google.com/js/client:platform.js?onload=onClientLoaded';
    $document[0].body.appendChild(clientjs);

    this.authorization = function(clientId, scopes) {
      authorization = new Authorization(clientId, scopes);

      return authorization;
    };

    this.authToken = function() {
      return new AuthToken();
    };

    this.load = function(lib, version) {
      return new Library(lib, version);
    };

    this.signIn = function() {
      authorization.authorize(function() {});
    };

    this.signOut = function() {
      var auth = gapi.auth2.getAuthInstance();
      auth.signOut();
    };

    function Authorization(clientId, scopes) {
      var self = this;
      var options = {
        client_id: clientId,
        scope: scopes.join(' '),
        immediate: true
      };

      this.authorize = function(callback) {
        clientLoaded.wait(function() {
          gapi.load('auth2', function() {
            gapi.auth2.init(options).then(function() {
              var auth = gapi.auth2.getAuthInstance();
              if(auth.isSignedIn.get()) {
                authorized.ready();
                callback();
              } else {
                auth.signIn().then(function() {
                  authorized.ready();
                  callback();
                });
              }

              auth.isSignedIn.listen(function() {

              });
            });
          });
        });
      };
    }

    function AuthToken() {
      this.getToken = function(callback) {
        authorized.wait(function() {
          var auth = gapi.auth2.getAuthInstance();
          var user = auth.currentUser.get();
          callback(user.getAuthResponse().access_token);
        });
      }
    }

    function Library(lib, version) {
      var libraryLoaded = new Latch();

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
