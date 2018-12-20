var assert = require('assert');
var rp = require('request-promise');
var j = rp.jar();
var j1 = rp.jar();

describe('Personas Module', function() {

  var apos;

  const basePath = "http://localhost:3333/";
  this.timeout(5000);

  after(function(done) {
    require('apostrophe/test-lib/util').destroy(apos, done);
  });

  /// ///
  // EXISTENCE
  /// ///
  it('1. Module should be a property of the apos object', function(done) {
    apos = require('apostrophe')({
      testModule: true,
      baseUrl: basePath,
      modules: {
        'apostrophe-express': {
          port: 3333
        },
        'apostrophe-pages': {
          park: [
            {
              slug: '/',
              parkedId: 'home',
              type: 'home',
              published: true,
              title: 'Home Page',
              persona: 'none',
              body: {
                type: 'area',
                items: [
                  {
                    _id: "footer",
                    type: "apostrophe-rich-text",
                    personas: ['none'],
                    content: "<p>No persona footer</p>"
                  }
                ]
              }
            },
            {
              slug: '/home',
              parkedId: 'persona-home',
              type: 'home',
              published: true,
              title: 'Persona Home Page',
              persona: '',
              body: {
                type: 'area',
                items: [
                  {
                    _id: "2r_home",
                    personas: [ "2r" ],
                    type: "apostrophe-rich-text",
                    content: "<p>2R RELATED CONTENT</p>\n"
                  },
                  {
                    _id: "2c_home",
                    personas: [ "tc" ],
                    type: "apostrophe-rich-text",
                    content: "<p>TC RELATED CONTENT</p>\n"
                  },
                  {
                    _id: "footer",
                    type: "apostrophe-rich-text",
                    personas: ["none"],
                    content: "<p>No persona footer</p>"
                  }
                ]
              }
            },
            {
              slug: '/2r-related',
              parkedId: '2r-related',
              type: 'home',
              persona: '2r',
              published: true,
              title: '2R Related'
            }
          ],
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
        'apostrophe-personas': {
          personas: [
            {
              name: 'tc',
              label: 'tc',
              prefix: '/tc'
            },
            {
              name: '2r',
              label: '2r',
              prefix: '/2r'
            }
          ]
        }
      },
      afterInit: function(callback) {
        assert(apos.modules['apostrophe-personas']);
        // Should NOT have an alias!
        assert(!apos.personas);
        return callback(null);
      },
      afterListen: function(err) {
        assert(!err);
        done();
      }
    });
  });

  it('2. Test global home page load', function() {
    const opts = {
      url: basePath,
      jar: j,
      method: 'GET',
      headers: {
        Referrer: basePath
      }
    };

    return rp(opts, (err, res) => {
      assert(!err);
      assert(res.statusCode === 200, 'req success');
      assert(res.toJSON().body.indexOf('No persona footer') >= 0, 'See none persona content');
    });
  });
  /* This one has changed, now based on option disableEmptyUniversal
  it('3. Trying to reach universal page without persona prefix should redirect to first persona path', function() {
    const opts = {
      url: basePath + 'home',
      method: 'GET',
      jar: j,
      headers: {
        Referrer: basePath
      }
    };

    return rp(opts, (err, res) => {
      assert(!err);
      assert(res.statusCode === 200, 'req success');
      assert(res.req.path === '/tc/home');
      assert(res.toJSON().body.indexOf('TC RELATED CONTENT') >= 0, 'TC persona sees TC related widget');
      assert(res.toJSON().body.indexOf('2R RELATED CONTENT') < 0, 'TC persona DOES NOT SEE 2R related widget');
      assert(res.toJSON().body.indexOf('No persona footer') < 0, 'TC persona DOES NOT SEE none persona content');
    });
  });
  */
  it('4. Passing persona as query should redirect to persona path', function() {
    const opts = {
      url: basePath + 'home',
      method: 'GET',
      jar: j,
      qs: {persona: '2r'},
      headers: {
        Referrer: basePath
      }
    };

    return rp(opts, (err, res) => {
      assert(!err);
      assert(res.statusCode === 200, 'req success');
      assert(res.req.path === '/2r/home');
      assert(res.toJSON().body.indexOf('2R RELATED CONTENT') >= 0, '2R persona sees 2R related widget');
      assert(res.toJSON().body.indexOf('TC RELATED CONTENT') < 0, '2R persona DOES NOT SEE TC related widget');
      assert(res.toJSON().body.indexOf('No persona footer') < 0, '2R persona DOES NOT SEE none persona content');
    });
  });

  it('5. Trying to reach global home page with persona prefix should redirect to root', function() {
    const opts = {
      url: basePath + 'tc',
      method: 'GET',
      jar: j1,
      headers: {
        Referrer: basePath
      }
    };

    return rp(opts, (err, res) => {
      assert(!err);
      assert(res.statusCode === 200, 'req success');
      assert(res.req.path === '/');
    });
  });

  it('6. Trying to reach persona specific page without persona prefix should redirect to persona path', function() {
    const opts = {
      url: basePath + '2r-related',
      method: 'GET',
      jar: j,
      headers: {
        Referrer: basePath
      }
    };

    return rp(opts, (err, res) => {
      assert(!err);
      assert(res.statusCode === 200, 'req success');
      assert(res.req.path === '/2r/2r-related');
    });
  });

  it('6. Trying to reach persona specific page with bad persona prefix should redirect to persona path', function() {
    const opts = {
      url: basePath + 'tc/2r-related',
      method: 'GET',
      jar: j,
      headers: {
        Referrer: basePath
      }
    };

    return rp(opts, (err, res) => {
      assert(!err);
      assert(res.statusCode === 200, 'req success');
      assert(res.req.path === '/2r/2r-related');
    });
  });
});
