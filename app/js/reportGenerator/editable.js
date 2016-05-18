(function() {
  angular.module('report.generator').directive('editable', ['$timeout', editable]);
  angular.module('report.generator').controller('EditableController', ['$scope', '$attrs', EditableController]);

  function editable($timeout) {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'templates/reportGenerator/editable.html',
      controller: 'EditableController',
      scope: true,
      link: function(scope, element) {
        scope.focus = function() {
          $timeout(function() {
            element.find('span')[0].focus();
          });
        };
      }
    };
  }

  function EditableController($scope, $attrs) {

    $scope.key = $attrs.key;

    $scope.makeEditable = function() {
      $scope.editable = true;
      $scope.focus();
    };

    $scope.onKeyUp = function(e) {
      var code = e.keyCode || e.which;
      if(code == 27) {
        e.target.blur();
      } 
    }

    $scope.onKeyDown = function(e) {
      var code = e.keyCode || e.which;
      if(code == 9 || code == 13) {
        save(e);
      }
    }

    $scope.onFocus = function(e) {
      selectAll(e.target);
    }

    $scope.onBlur = function(e) {
      angular.element(e.target).text($scope.report[$scope.key]);
      $scope.editable = false;
    }

    function save(e) {
      $scope.report[$scope.key] = angular.element(e.target).text().trim();
      e.preventDefault();
      e.target.blur(); 
    }

    function selectAll(elem) {
      var range = document.createRange();
      var sel = window.getSelection();
      range.setStart(elem, 1);
      range.selectNodeContents(elem);
      sel.removeAllRanges();
      sel.addRange(range);
      elem.focus();
    }
  }
})();
