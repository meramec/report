(function() {
  function Report() {
    this.something = function() {
      return "Generator";
    };
  }

  document.write(new Report().something());

})();


