(function() {
  angular.module('google.api').factory('latch', latch);

  function latch() {
    return {
      create: function(n) {
        return new Latch(n);
      }
    };
  }

  function Latch(n) {
    var ready = n ? n : 1;

    var calls = [];

    this.ready = function() {
      if(--ready > 0)
        return;

      while(calls.length > 0) {
        var call = calls.shift();
        call();
      }
    };

    this.wait = function(fn) {
      if(ready == 0) {
        fn();
      } else {
        calls.push(fn);
      }
    };
  }
})();
