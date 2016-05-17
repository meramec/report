describe('AppTitle', function() {

  var myWindow = {
    document: {}
  };

  var path = {
    get: function()
  };

  var title = 'page title';
  var subtitle = 'page subtitle';

  beforeEach(function() {
    this.scope.report = {
      title: title,
      subtitle: subtitle
    };

    this.controller('AppTitleController', { $scope: this.scope, $window: myWindow, path: path });
  });

  describe('on creation', function() {
    it('sets the window title', function() {
      expect(myWindow.document.title).toEqual(title + ' | ' + subtitle);
    });
  });

});
