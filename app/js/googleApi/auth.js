(function() {
  angular.module('google.api').service('auth', ['client', auth]);

  var clientId = '215619993678-kdcmgv8u79r9vdmti2m3ldjuvqgagnb7.apps.googleusercontent.com';
  var scopes = [
    'https://www.googleapis.com/auth/plus.me',
    'https://www.googleapis.com/auth/drive.metadata.readonly',
    'https://spreadsheets.google.com/feeds'
  ];

  function auth(client) {
    this.authorize = function(callback) {
      client.authorization(clientId, scopes).authorize(callback);
    };
  }
})();
