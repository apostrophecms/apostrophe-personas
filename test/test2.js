var assert = require('assert');
var request = require('request');
var j = request.jar();
var j1 = request.jar();

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
              body: 'TC related page'
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

  it('2. Test initial page load', function(done) {
    const opts = {
      url: basePath,
      jar: j,
      method: 'GET',
      headers: {
        Referrer: basePath
      }
    };

    request(opts, (err, res) => {
      assert(!err);
      assert(res.statusCode === 200, 'req success');
      assert(res.toJSON().body.indexOf('ello world') >= 0, 'Has default apostrophe homepage');
      done();
    });
  });

  it('3. Passing persona as query should set persona on session', function(done) {
    const opts = {
      url: basePath,
      method: 'GET',
      jar: j,
      qs: {persona: '2r'},
      headers: {
        Referrer: basePath
      }
    };

    request(opts, (err, res) => {
      assert(!err);
      assert(res.statusCode === 200, 'req success');
      assert(res.toJSON().request.uri.pathname === '/2r/');
      done();
    });
  });

  it('4. Subsequent visit should load persona path', function(done) {
    const opts = {
      url: basePath,
      method: 'GET',
      jar: j,
      headers: {
        Referrer: basePath
      }
    };

    request(opts, (err, res) => {
      assert(!err);
      assert(res.statusCode === 200, 'req success');
      assert(res.req.path === '/2r/', 'Redirects to response specific path');
      done();
    });
  });

  it('5. New session loads generic home page', function(done) {
    const opts = {
      url: basePath,
      method: 'GET',
      jar: j1,

      headers: {
        Referrer: basePath
      }
    };

    request(opts, (err, res) => {
      assert(!err);
      assert(res.statusCode === 200, 'req success');
      assert(res.toJSON().body.indexOf('ello world') >= 0, 'Has default apostrophe homepage');
      assert(res.req.path === '/', 'loads base path');
      done();
    });
  });

  it('6. Visit persona page sets persona session', function(done) {
    const opts = {
      url: basePath + 'tc-related',
      method: 'GET',
      jar: j1,
      headers: {
        Referrer: basePath
      }
    };

    request(opts, (err, res) => {
      assert(!err);
      assert(res.statusCode === 200, 'req success');
      done();
    });
  });

  it('7. Subsequent request is forwarded to persona url', function(done) {
    const opts = {
      url: basePath,
      method: 'GET',
      jar: j1,
      headers: {
        Referrer: basePath
      }
    };

    request(opts, (err, res) => {
      assert(!err);
      assert(res.statusCode === 200, 'req success');
      assert(res.req.path === '/tc/', 'Redirects to response specific path');
      done();
    });
  });

  it('8. Visit persona page loads default page, sets cookie', function(done) {
    const opts = {
      url: basePath,
      method: 'GET',
      qs: {persona: 'tc'},
      jar: j1,
      headers: {
        Referrer: basePath
      }
    };

    request(opts, (err, res) => {
      assert(!err);
      assert(res.statusCode === 200, 'req success');
      assert(res.toJSON().body.indexOf('ello world') >= 0, 'Has default apostrophe homepage');
      done();
    });
  });

  it('9. Subsequent visit to basePath redirects to persona base', function(done) {
    const opts = {
      url: basePath,
      method: 'GET',
      jar: j1,
      headers: {
        Referrer: basePath
      }
    };

    request(opts, (err, res) => {
      assert(!err);
      assert(res.statusCode === 200, 'req success');
      assert(res.req.path === '/tc/', 'Redirects to persona specific path');
      done();
    });
  });
});
