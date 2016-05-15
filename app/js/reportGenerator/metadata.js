(function() {
  angular.module('report.generator').service('metadata', metadata);

  function metadata() {

    var raw = localStorage.getItem('metadata');
    var parsed;

    try {
      parsed = JSON.parse(raw);
    } catch(e) { }

    if(! parsed)
      parsed = {};

    this.watch = function(scope) {
      onIdChange(scope);

      scope.$watch('id', function(){
        onIdChange(scope);
      });
      scope.$watch('report', function(){
        onReportChange(scope);
      }, true);
    }

    function onIdChange(scope) {
      var md = scope.id && parsed[scope.id];

      updateReport(scope.report, md, 'title');
      updateReport(scope.report, md, 'subtitle');
    }

    function updateReport(report, md, key) {
      if(md && md[key]) {
        report[key] = md[key];
      } else {
        report[key] = 'Enter Report ' + key.charAt(0).toUpperCase() + key.slice(1);
      }
    }

    function onReportChange(scope) {
      if(! scope.id)
        return;

      var md = parsed[scope.id];
      if(! md)
        md = parsed[scope.id] = {};

      md.title = scope.report.title;
      md.subtitle = scope.report.subtitle;

      localStorage.setItem('metadata', JSON.stringify(parsed));
    }
  }

})();
