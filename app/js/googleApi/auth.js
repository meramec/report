(function() {
  angular.module('google.api').service('auth', auth);

  var clientId = '215619993678-kdcmgv8u79r9vdmti2m3ldjuvqgagnb7.apps.googleusercontent.com';
  var scopes = [
    'https://www.googleapis.com/auth/plus.me',
    'https://www.googleapis.com/auth/drive.metadata.readonly',
    'https://spreadsheets.google.com/feeds'
  ];

  var onAuthorize;
  var loaded;
  window.onGoogleLoaded = function() {
    loaded = true;
    if(onAuthorize)
      onAuthorize();
  };

  function auth() {
    this.authorize = function(callback) {
      var options = {
        client_id: clientId,
        scope: scopes.join(' '),
        immediate: true
      };
  
      var get = function() {
        getAuthorization(options, callback);
      };

      if(loaded)
        get();
      else
        onAuthorize = get;
    };

    this.getToken = function() {
      return gapi.auth.getToken().access_token;
    };

    function getAuthorization(options, callback) {
      gapi.auth.authorize(options, function(result) {
        if(result && ! result.error) {
          callback();
        } else if(options.immediate) {
          options.immediate = false;
          getAuthorization(options, callback);
        }
      });
    }
  }
})();
