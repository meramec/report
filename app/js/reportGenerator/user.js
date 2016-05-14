(function() {
  angular.module('report.generator').directive('user', user);
  angular.module('report.generator').controller('UserController', ['$scope', '$document', 'me', 'client', UserController]);

  function user() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'templates/reportGenerator/user.html',
      controller: 'UserController',
      scope: {}
    };
  }

  function UserController($scope, $document, me, client) {
    $scope.$on('authenticated', function() {
      me.load(function(user) {
        $scope.user = user;
        $scope.$digest();
      });
    });

    $scope.toggleInfo = function(e) {
      e.stopPropagation();
      $scope.showInfo = ! $scope.showInfo;

      function handleClick() {
        $scope.showInfo = false;
        $scope.$digest();
      }

      if($scope.showInfo) {
        $document.bind('click', handleClick);
      
      } else {
        $document.unbind('click', handleClick);
      }
    };

    $scope.signOut = function() {
      client.signOut();
      $scope.showInfo = false; 
    };

    $scope.email = function() {
      if(! $scope.user || ! $scope.user.emails)
        return;

      var email = _.find($scope.user.emails, function(email) {
        return email.type === 'account';
      });

      if(email)
        return email.value;

      return $scope.user.emails[0].value;
    };
  }
})();
