beforeEach(module('ReportGenerator'));

beforeEach(function() {
  var self = this;
  module(function($provide) {
    self.provide = $provide;
  });
});

beforeEach(inject(function(_$httpBackend_, _$compile_, $rootScope, $controller, $location, $injector, $timeout) {
  var self = this;
  this.scope = $rootScope.$new();
  this.http = _$httpBackend_;
  this.compile = _$compile_;
  this.location = $location;
  this.controller = $controller;
  this.injector = $injector;
  this.timeout = $timeout;
  this.model = function(name) {
    return this.injector.get(name);
  };
  this.eventLoop = {
    flush: function() {
      this.scope.$digest()
    }
  };
}));

afterEach(function() {
  this.http.resetExpectations();
  this.http.verifyNoOutstandingExpectation();
  this.http.verifyNoOutstandingRequest();
});
