(function() {
  angular.module('report.generator').service('metadata', ['appProperties', metadata]);

  function metadata(appProperties) {

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
      if(scope.id) {
        appProperties.get(scope.id, function(data) {
          updateReport(scope.report, data, 'title');
          updateReport(scope.report, data, 'subtitle');
        });
      }
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

      var md = {
        title: scope.report.title,
        subtitle: scope.report.subtitle
      };

      appProperties.set(scope.id, md, function() {});
    }
  }

})();
