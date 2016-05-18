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
      return new Authorizer(clientId, scopes);
    };

    this.authToken = function() {
      return new AuthToken();
    };

    this.load = function(lib, version) {
      return new Library(lib, version);
    };

    function Authorizer(clientId, scopes) {
      var self = this;

      var onAuthLoaded = new Latch();

      var options = {
        client_id: clientId,
        scope: scopes.join(' '),
        immediate: true
      };

      this.authorize = function(onSignedIn, onSignedOut) {
        clientLoaded.wait(function() {
          gapi.load('auth2', function() {
            gapi.auth2.init(options).then(function() {
              onAuthLoaded.ready();
            });
          });
        });

        return new SignIn(onAuthLoaded, onSignedIn, onSignedOut);
      };
    }

    function SignIn(onAuthLoaded, onSignedIn, onSignedOut) {

      var auth;

      onAuthLoaded.wait(function() {
        auth = gapi.auth2.getAuthInstance();
        if(auth.isSignedIn.get()) {
          notifySignedIn();
        } else {
          onSignedOut();
        }
      });

      this.signIn = function() {
        onAuthLoaded.wait(function() {
          auth.signIn().then(notifySignedIn);
        });
      };

      this.signOut = function() {
        onAuthLoaded.wait(function() {
          auth.signOut().then(onSignedOut);
        });
      };

      function notifySignedIn() {
        authorized.ready();
        onSignedIn();
      }
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
