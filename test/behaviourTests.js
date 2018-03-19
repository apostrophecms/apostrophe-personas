var assert = require('assert');
var rp = require('request-promise');
var j = rp.jar();
var j1 = rp.jar();

describe('Personas Module', function() {

  var apos;

  const basePath = "http://localhost:3000/";
  this.timeout(3000);

  after(function() {
    apos.db.dropDatabase();
  });

  /// ///
  // EXISTENCE
  /// ///
  it('1. Module should be a property of the apos object', function(done) {
    apos = require('apostrophe')({
      testModule: true,
      baseUrl: basePath,
      modules: {
        'apostrophe-pages': {
          park: [
            {
              slug: '/tc-related',
              type: 'home',
              persona: 'tc',
              parkedId: 'tc-related',
              published: true,
              title: 'TC Related',
              body: {
                type: 'area',
                items: [
                  {
                    _id: 'tc001',
                    type: 'apostrophe-rich-text',
                    content: 'TC Page'
                  }
                ]
              }
            },
            {
              slug: '/2r-related',
              type: 'home',
              persona: '2r',
              parkedId: '2r-related',
              published: true,
              title: '2R Related',
              body: '2R related page'
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

  it('2. Test initial page load', function() {
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
      assert(res.toJSON().body.indexOf('ello world') >= 0, 'Has default apostrophe homepage');
    });
  });

  it('3. Passing persona as query should set persona on session', function() {
    const opts = {
      url: basePath,
      method: 'GET',
      jar: j,
      qs: {persona: 'tc'},
      headers: {
        Referrer: basePath
      }
    };

    return rp(opts, (err, res) => {
      assert(!err);
      assert(res.statusCode === 200, 'req success');
      assert(res.toJSON().request.uri.pathname === '/tc/');
    });
  });

  it('4. Subsequent visit should load persona path', function() {
    const opts = {
      url: basePath,
      method: 'GET',
      jar: j,
      headers: {
        Referrer: basePath
      }
    };

    return rp(opts, (err, res) => {
      assert(!err);
      assert(res.statusCode === 200, 'req success');
      assert(res.req.path === '/tc/', 'Redirects to response specific path');
    });
  });

  it('5. New session loads generic home page', function() {
    const opts = {
      url: basePath,
      method: 'GET',
      jar: j1,

      headers: {
        Referrer: basePath
      }
    };

    return rp(opts, (err, res) => {
      assert(!err);
      assert(res.statusCode === 200, 'req success');
      assert(res.toJSON().body.indexOf('ello world') >= 0, 'Has default apostrophe homepage');
      assert(res.req.path === '/', 'loads base path');
    });
  });

  it('6. Visit persona page sets persona session', function() {
    const opts = {
      url: basePath + 'tc-related',
      method: 'GET',
      jar: j1,
      headers: {
        Referrer: basePath
      }
    };

    return rp(opts, (err, res) => {
      assert(!err);
      assert(res.statusCode === 200, 'req success');
    });
  });

  it('7. Subsequent request is forwarded to persona url', function() {
    const opts = {
      url: basePath,
      method: 'GET',
      jar: j1,
      headers: {
        Referrer: basePath
      }
    };

    return rp(opts, (err, res) => {
      assert(!err);
      assert(res.statusCode === 200, 'req success');
      assert(res.req.path === '/tc/', 'Redirects to response specific path');
    });
  });

  it('8. Visit persona page loads default page, sets cookie', function() {
    const opts = {
      url: basePath,
      method: 'GET',
      qs: {persona: 'tc'},
      jar: j1,
      headers: {
        Referrer: basePath
      }
    };

    return rp(opts, (err, res) => {
      assert(!err);
      assert(res.statusCode === 200, 'req success');
      assert(res.toJSON().body.indexOf('ello world') >= 0, 'Has default apostrophe homepage');
    });
  });

  it('9. Subsequent visit to basePath redirects to persona base', function() {
    const opts = {
      url: basePath,
      method: 'GET',
      jar: j1,
      headers: {
        Referrer: basePath
      }
    };

    return rp(opts, (err, res) => {
      assert(!err);
      assert(res.statusCode === 200, 'req success');
      assert(res.req.path === '/tc/', 'Redirects to persona specific path');
    });
  });
});
