(function() {
  angular.module('google.api').service('auth', auth);
  
  function auth() {
    this.authorize = function(clientId, scopes, callback) {
      var options = {
        client_id: clientId,
        scope: scopes.join(' '),
        immediate: true
      };

      getAuthorization(options, callback);
    };

    this.getToken = function() {
      return gapi.auth.getToken().access_token;
    };

    function getAuthorization(options, callback) {
      gapi.auth.authorize(options, function(result) {
        if(result && ! result.error) {
          callback();
        } else {
          options.immediate = false;
          getAuthorization(options, callback);
        }
      });
    }
  }
})();
