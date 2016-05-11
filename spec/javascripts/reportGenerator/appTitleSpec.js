describe('AppTitle', function() {

  var myWindow = {
    document: {}
  };

  beforeEach(function() {
    this.scope.pageTitle = 'page title';
    this.scope.pageSubtitle = 'page subtitle';

    this.controller('AppTitleController', { $scope: this.scope, $window: myWindow });
  });

  describe('on creation', function() {
    it('sets the window title', function() {
      expect(myWindow.document.title).toEqual(this.scope.pageTitle + ' | ' + this.scope.pageSubtitle);
    });
  });

});
