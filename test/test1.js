var assert = require('assert');
var _ = require('lodash');

describe('Personas Module', function() {

  var apos;

  this.timeout(20000);

  after(function() {
    apos.db.dropDatabase();
  });

  /// ///
  // EXISTENCE
  /// ///

  it('should be a property of the apos object', function(done) {
    apos = require('apostrophe')({
      testModule: true,

      modules: {
        'apostrophe-pages': {
          park: [],
          types: [
            {
              name: 'home',
              label: 'Home'
            },
            {
              name: 'testPage',
              label: 'Test Page'
            }
          ]
        },
        'apostrophe-personas': {}
      },
      afterInit: function(callback) {
        assert(apos.modules['apostrophe-personas']);
        // Should NOT have an alias!
        assert(!apos.personas);
        return callback(null);
      },
      afterListen: function(err) {
        console.log('1e', err)
        assert(!err);
        done();
      }
    });
  });
/*
  it('should make sure all of the expected indexs are configured', function (done) {
    apos = require('apostrophe')({
      apos.docs.db.indexInformation(function(err, info) {
        assert(!err);
        console.log(info);
        done();
      });
    });
  });
*/
});
