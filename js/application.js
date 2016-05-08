// /home/ryan/github/meramec/report/app/js/app.js
(function() {
  var app = angular.module('ReportGenerator', ['report.generator']);
})();

// /home/ryan/github/meramec/report/app/js/reportGenerator.js
(function() {
  angular.module('report.generator', []);
})();

// /home/ryan/github/meramec/report/app/js/reportGenerator/reportTitle.js
(function() {
  angular.module('report.generator').directive('reportTitle', reportTitle);

  function reportTitle() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'templates/reportGenerator/reportTitle.html'
    };
  }

})();

