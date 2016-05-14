(function() {
  angular.module('google.api').service('me', ['client', me]);

  function me(client) {
    var lib = client.load('plus', 'v1');

    this.load = function(callback) {
      lib.start(function() {
        var fields = 'displayName,id,emails,image(url)';
        var request = gapi.client.plus.people.get({userId: 'me', fields: fields});

        request.execute(function(response) {
          callback(response.result); 
        });
      });
    };
  }
})();
