(function() {
  angular.module('google.api').factory('latch', latch);

  function latch() {
    return {
      create: function() {
        return new Latch();
      }
    };
  }

  function Latch() {
    var ready;

    var calls = [];

    this.ready = function() {
      ready = true;

      while(calls.length > 0) {
        var call = calls.shift();
        call();
      }
    };

    this.wait = function(fn) {
      if(ready) {
        fn();
      } else {
        calls.push(fn);
      }
    };
  }
})();
