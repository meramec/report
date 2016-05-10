(function() {
  angular.module('google.api').service('sheets', ['auth', '$http', sheets]);

  function sheets(auth, $http) {
    var self = this;

    self.open = function(id, callback) {
      $http.jsonp(sheetUrl(id)).then(callback);
    };

    function sheetUrl(id) {
      return 'https://spreadsheets.google.com/feeds/list/' + id + '/od6/private/full?alt=json-in-script&access_token=' + auth.getToken() + '&callback=JSON_CALLBACK';
    }
  }
})();
