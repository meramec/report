(function() {
  angular.module('google.api').service('me', ['client', me]);

  function me(client) {
    var lib = client.load('plus', 'v1');

    this.load = function(me) {
      lib.start(function() {
        var fields = 'displayName, emails, id, image(url)';
        var request = gapi.client.plus.people.get({userId: 'me', fields: fields});

        request.execute(function(response) {
          console.log(JSON.stringify(response));
        });
      });
    };
  }
})();
