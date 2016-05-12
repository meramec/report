(function() {
  angular.module('google.api').service('client', ['$window', '$document', client]);

  var clientLoaded = new OnLoaded();

  function client($window, $document) {

    $window.onClientLoaded = function() {
      clientLoaded.ready();
    };

    loadClient($document[0]);

    this.authorization = function(clientId, scopes) {
      return new Authorization(clientId, scopes);
    };

    this.authToken = function() {
      return gapi.auth.getToken().access_token
    };

    this.load = function(lib, version) {
      return new Library(lib, version);
    };
  };

  function loadClient(document) {
    var clientjs = document.createElement('script');
    clientjs.src = 'https://apis.google.com/js/client.js?onload=onClientLoaded';
    document.body.appendChild(clientjs);
  }

  function Authorization(clientId, scopes) {
    var options = {
      client_id: clientId,
      scope: scopes.join(' '),
      immediate: true
    };

    this.authorize = function(callback) {
      clientLoaded.call(function() {
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
    var libraryLoaded = new OnLoaded();

    clientLoaded.call(function() {
      gapi.client.load(lib, version, function() {
        libraryLoaded.ready();
      });
    });

    this.start = function(fn) {
      libraryLoaded.call(fn);
    };
  }

  function OnLoaded() {
    var loaded;
    var run;

    var calls = [];

    this.ready = function() {
      loaded = true;

      while(calls.length > 0) {
        var call = calls.shift();
        call();
      }
    };

    this.call = function(fn) {
      if(loaded) {
        fn();
      } else {
        calls.push(fn);
      }
    };
  }

})();
