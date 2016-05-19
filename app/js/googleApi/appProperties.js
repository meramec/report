(function() {
  angular.module('google.api').service('appProperties', ['client', appProperties]);

  function appProperties(client) {
    var lib = client.load('drive', 'v3');

    this.get = function(id, callback) {
      lib.start(function() {
        var request = gapi.client.drive.files.get({fileId: id, fields: 'appProperties'});
        request.execute(function(data) {
          callback(data.result.appProperties);
        });
      });
    };

    this.set = function(id, data, callback) {
      lib.start(function() {
        var request = gapi.client.drive.files.update({fileId: id, appProperties: data});
        request.execute(function(response) {
          callback();
        });
      });
    };
  }
})();
