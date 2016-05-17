describe('Latch', function() {
  var w1;
  var w2;
  var myLatch;
  beforeEach(function() {
    w1 = jasmine.createSpy();
    w2 = jasmine.createSpy();
  });

  describe('default waits for one', function() {
    beforeEach(function() {
      myLatch = new Latch();
    });

    describe('wait before ready', function() {
      beforeEach(function() {
        myLatch.wait(w1);
        myLatch.wait(w2);
      });

      it('does not call the methods immediately', function() {
        expect(w1).not.toHaveBeenCalled();
        expect(w2).not.toHaveBeenCalled();
      });

      it('calls the methods after ready', function() {
        myLatch.ready();
        expect(w1).toHaveBeenCalled();
        expect(w2).toHaveBeenCalled();
      });
    });

    describe('ready before wait', function() {
      beforeEach(function() {
        myLatch.ready();
      });

      it('calls the methods immediately', function() {
        myLatch.wait(w1);
        expect(w1).toHaveBeenCalled();
        myLatch.wait(w2);    
        expect(w2).toHaveBeenCalled();
      });
    });
  });

  describe('waiting for more than one', function() {
    beforeEach(function() {
      myLatch = new Latch(2);
      myLatch.wait(w1);
      myLatch.wait(w2);
    });

    it('does not call the methods immediately', function() {
      expect(w1).not.toHaveBeenCalled();
      expect(w2).not.toHaveBeenCalled();
    });

    describe('after one ready', function() {
      beforeEach(function() {
        myLatch.ready();
      });
      it('does not call the methods', function() {
        expect(w1).not.toHaveBeenCalled();
        expect(w2).not.toHaveBeenCalled();
      });

      describe('after second ready', function() {
        beforeEach(function() {
          myLatch.ready();
        });
        it('calls the methods', function() {
          expect(w1).toHaveBeenCalled();
          expect(w2).toHaveBeenCalled();
        });
      });

    });
  });
});
