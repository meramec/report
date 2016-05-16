(function() {
  angular.module('report.generator').service('toggleUnique', ['$document', toggleUnique]);

  function toggleUnique($document) {
    $document.bind('click', notifyAll);

    var active = [];

    function notifyAll() {
      while(active.length > 0) {
        var cb = active.shift();
        cb();
      }
    }

    this.onClickOff = function(cb) {
      notifyAll();
      active.push(cb);
    };
  }
})();
