(function() {
  angular.module('report.generator').directive('user', user);
  angular.module('report.generator').controller('UserController', ['$scope', '$timeout', 'me', 'client', 'toggleUnique', UserController]);

  function user() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'templates/reportGenerator/user.html',
      controller: 'UserController',
      scope: {}
    };
  }

  function UserController($scope, $timeout, me, client, toggleUnique) {
    $scope.$on('authenticated', function() {
      me.load(function(user) {
        $scope.user = user;
        $scope.$digest();
      });
    });

    $scope.toggleInfo = function(e) {
      $scope.showInfo = ! $scope.showInfo;

      if($scope.showInfo) {
        e.stopPropagation();
        toggleUnique.onClickOff(function() {
          $scope.showInfo = false;
          $timeout(function() {
            $scope.$digest();
          });
        });
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
