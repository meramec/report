(function() {
  angular.module('report.generator').directive('report', report);
  angular.module('report.generator').controller('ReportController', ['$scope', '$window', 'path', 'auth', ReportController]);

  function report() {
    return {
      restrict: 'E',
      replace: true,
      controller: 'ReportController',
      templateUrl: 'templates/reportGenerator/report.html'
    };
  }

  function ReportController($scope, $window, path, auth) {

    var metadata;

    $scope.report = {
      title: 'Enter Report Title',
      subtitle: 'Enter Report Subtitle'
    };

    auth.authorize(onReady);

    function onReady() {
      $scope.$broadcast('authenticated');
      if(! $scope.id)
        $scope.$broadcast('choose-file');
  
    }
      $scope.id = localStorage.getItem('id');

      var md = localStorage.getItem('metadata');
      if($scope.id && md) {
        metadata = JSON.parse(md);
        if(metadata[$scope.id]) {
          if(metadata[$scope.id].title)
            $scope.report.title = metadata[$scope.id].title;
          if(metadata[$scope.id].subtitle)
            $scope.report.subtitle = metadata[$scope.id].subtitle;
        }
      }

    //}

    $scope.goHome = function() {
      path.set('/');
    };

    $scope.chooseFile = function() {
      $scope.$broadcast('choose-file');
    }

    $scope.print = function() {
      $window.print();
    }

    $scope.$on('select-file', function(e, file) {
      $scope.id = file.id;
      localStorage.setItem('id', file.id);
    });

    $scope.$watch('report.title', function() {
      var md = getMetadata();
      if(md) {
        md.title = $scope.report.title;
        saveMetadata();
      }
    });
    $scope.$watch('report.subtitle', function() {
      var md = getMetadata();
      if(md) {
        md.subtitle = $scope.report.subtitle;
        saveMetadata();
      }
    });

    function getMetadata() {
      if(! $scope.id)
        return;
      if(! metadata)
        metadata = {};
      if(! metadata[$scope.id])
        metadata[$scope.id] = {
          report: {}
        };

      return metadata[$scope.id];
    }

    function saveMetadata() {
      localStorage.setItem('metadata', JSON.stringify(metadata));
    }
  }
})();
