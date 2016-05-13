(function() {
  angular.module('google.api').service('sheets', ['client', 'latch', '$http', sheets]);

  function sheets(client, latch, $http) {
    var self = this;

    self.open = function(id, callback) {
      client.authToken().getToken(function(token) {
        var spreadsheet = new Spreadsheet(token, callback);
        spreadsheet.load(id);
      });
    };
    function Spreadsheet(token, callback) {
      var title;
      var worksheets = [];

      var params = '?alt=json-in-script&access_token=' + token + '&callback=JSON_CALLBACK';

      this.load = function(id) {
        var url = 'https://spreadsheets.google.com/feeds/worksheets/' + id + '/private/basic' + params;
  
        $http.jsonp(url).then(onWorksheetList);
      };

      function onWorksheetList(response) {
        var doc = response.data.feed;
        var onComplete = latch.create(doc.entry.length);

        onComplete.wait(function() {
          callback({ title: title, worksheets: worksheets });
        });

        title = doc.title.$t;

        _.each(doc.entry, function(sheet) {
          var s = {};
          worksheets.push(s);

          var link = _.find(sheet.link, function(l) { return l.rel === 'http://schemas.google.com/spreadsheets/2006#cellsfeed'; });
          $http.jsonp(link.href + params).then(function(response) {
            onWorksheet(response, s);
            onComplete.ready();
          });
        });
      }

      function onWorksheet(response, sheet) {
        var data = response.data.feed;
        sheet.title = data.title.$t;

        sheet.data = [];
        _.each(data.entry, function(entry) {
          var index = entry.title.$t;
          var row = parseInt(index.replace(/^\D+/, ''));

          var colLetters = index.replace(/\d+$/, '');
          var col = 0;
          for(var i = 0; i < colLetters.length; ++i) {
            col *= 26;
            col += colLetters.charCodeAt(i) - 64;
          }

          var i = row - 1, j = col - 1;
          if(! sheet.data[i])
            sheet.data[i] = [];
          sheet.data[i][j] = entry.content.$t;
        });

      }
    }
  }
})();
