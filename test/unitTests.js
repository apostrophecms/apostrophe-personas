var assert = require('assert');
var rp = require('request-promise');

describe('Personas Module', function() {

  var apos;
  const basePath = "http://localhost:3000";
  const userAgents = {
    desktop: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36",
    googlebot: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    googleImageBot: "Googlebot-Image/1.0"
  };

  this.timeout(3000);

  after(function(done) {
    require('apostrophe/test-lib/util').destroy(apos, done);
  });

  /// ///
  // EXISTENCE
  /// ///
  it('should be a property of the apos object', function(done) {
    apos = require('apostrophe')({
      testModule: true,
      baseUrl: 'http://localhost:4000',
      modules: {
        'apostrophe-express': {
          port: 4242
        },
        'apostrophe-pages': {
          park: [{slug: '/', type: 'home'}],
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
              name: 'employee',
              label: 'Employee',
              prefix: '/employee'
            },
            {
              name: 'employer',
              label: 'Employer',
              prefix: '/employer'
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

  it('Should load home page', function (done) {
    return apos.pages.find(apos.tasks.getReq({ locale: 'default-draft' }), { slug: '/' }).toObject(function(err, home) {
      assert(!err);
      assert(home.slug === '/');
      assert(home.type === 'home');
      done();
    });
  });

  it('Test request for persona via http', function () {
    const j = rp.jar();
    rp({url: basePath, qs: {persona: 'employee'}, jar: j})
      .then('response', res => {
        assert(true);
      });
  });

  // test fail on non-get req
  it('middleware should not touch non-GET reqs', function (done) {
    const module = apos.modules['apostrophe-personas'];
    const middleware = module.expressMiddleware.middleware;
    let req = apos.tasks.getAnonReq();

    assert(module, 'has personas module');
    assert(typeof middleware === "function", 'has middleware object');

    req.method = "POST";
    req.session = {};

    middleware(req, req.res, () => {
      assert(!req.persona, 'does not set persona for POST request');
      assert(!req.session.persona, 'does not set person to session for POST req');
      done();
    });
  });

  // test module middleware for GET req
  it('test persona switcher - redirect via query', function (done) {
    const module = apos.modules['apostrophe-personas'];
    const middleware = module.expressMiddleware.middleware;
    let req = apos.tasks.getAnonReq();

    assert(module, 'has personas module');
    assert(typeof middleware === "function", 'has middleware object');

    req.method = 'GET';
    req.session = {};
    req.headers = {
      'user-agent': userAgents.desktop
    };
    req.query = {persona: "employee"};
    req.data = {}; // @@NOTE - personas middleware expects this, not sure where it comes from -pw
    req.Referrer = apos.baseUrl;
    req.url = 'foo';

    // stub redirect
    req.res.redirect = (url) => {
      assert(url, 'redirect happens');
      done();
    };

    middleware(req, req.res, () => {
      assert(false, 'this should fail, redirect should have already happened');
      done();
    });
  });

  /**
   * Unit tests
   **/
  it('getAllPrefixes returns correct values', function (done) {
    const module = apos.modules['apostrophe-personas'];
    const getAllPrefixes = module.getAllPrefixes;
    let req = apos.tasks.getAnonReq();

    const hashPrefixes = (arr) => {
      return arr.sort().reduce((acc, cur) => {
        const ret = acc += cur;
        return ret;
      }, '');
    };

    const definedPrefixes = hashPrefixes(module.personas.map(persona => persona.prefix));

    req.method = 'GET';
    req.session = {persona: 'employee'}; // mock persona
    req.headers = {
      'user-agent': userAgents.desktop
    };
    req.data = {};
    req.Referrer = apos.baseUrl;
    req.url = '/foo/bar/';

    const allPref = getAllPrefixes(req);

    assert((definedPrefixes === hashPrefixes(allPref)), 'Computed available prefixes should equal configured available prefixes');

    done();
  });

  it('addPrefix works', function (done) {
    const module = apos.modules['apostrophe-personas'];
    const addPrefix = module.addPrefix;
    // perform a hash against defined prefixes for comparison

    let req = apos.tasks.getAnonReq();

    req.method = 'GET';
    req.session = {persona: 'employee'}; // mock persona
    req.headers = {
      'user-agent': userAgents.desktop,
      'Referrer': apos.baseUrl
    };
    req.data = {};
    req.url = '/foo/bar/';
    req.res.redirect = (url) => {
      assert(url === `/${req.session.persona}${req.url}`, 'redirects to /PERSONA/URL');
      done();
    };

    assert(typeof addPrefix === 'function', 'self.addPrefix exists as function');

    const prefixed = addPrefix(req, 'employee', req.url);
    assert(prefixed === "/employee/foo/bar/");
    done();
  });

  it('composePersonas works', function (done) {
    const module = apos.modules['apostrophe-personas'];
    const personasInit = JSON.stringify(module.personas);

    module.composePersonas();

    const personasComposed = JSON.stringify(module.personas);

    assert(personasInit === personasComposed, 'If app definition used the verbose personas format, composePersonas should not change anything');

    done();
  });

  it('inPersona works', function (done) {
    const module = apos.modules['apostrophe-areas'];
    const inPersona = module.inPersona;

    assert(typeof inPersona === 'function');

    // some very naive widgets
    const widgetNoPersona = {foo: "bar"};
    const widgetNoPersona2 = {foo: "bar", personas: []};
    const widgetPersona = {foo: "bar", personas: [ "employee" ]};

    let req = apos.tasks.getAnonReq();

    assert(inPersona(req, widgetNoPersona) === true, '1. widget with no persona always returns true');

    assert(inPersona(req, widgetPersona) === true, '2. widget with persona returns true if req has no persona');

    req.persona = 'employer';

    //  assert(inPersona(req, widgetPersona) === false, '3. widget with persona returns false if req has wrong persona');

    assert(inPersona(req, widgetNoPersona), '4. widget with no persona returns true for req with any persona');
    assert(inPersona(req, widgetNoPersona2), '4. widget with no persona (via empty array) returns true for req with any persona');

    req.persona = 'employee';

    assert(inPersona(req, widgetPersona), '5. widget returns true for correct persona');

    done();
  });
});
