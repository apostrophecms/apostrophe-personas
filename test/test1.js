var assert = require('assert');
var _ = require('lodash');
var request = require('request');

describe('Personas Module', function() {

  var apos;
  const basePath = "http://localhost:3000"
  const userAgents = {
    desktop: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36",
    googlebot: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    googleImageBot: "Googlebot-Image/1.0"
  }

  this.timeout(3000);
  
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
  
  it('Test request for persona via http', function (done) {
    let j = request.jar()

    return request({url: `${basePath}/?persona=employee`, jar: j}, 'GET')
    .on('response', res => {
      assert(true)
      done()
    })
    .on('error', err => {
      console.log("ERR", err)
      assert(false)
      done()
    })
  })
  
  // test fail on non-get req
  it('middleware should not touch non-GET reqs', function (done) {
    const module = apos.modules['apostrophe-personas']
    const middleware = module.expressMiddleware
    let req = apos.tasks.getAnonReq()
    
    assert(module, 'has personas module')
    assert(typeof middleware === "function", 'has middleware object')
    
    req.method = "POST"
    req.session = {}
    
    
    middleware(req, req.res, () => {
      assert(!req.persona, 'does not set persona for POST request')
      assert(!req.session.persona, 'does not set person to session for POST req')
      done()
    })
  })
  
  // test module middleware for GET req
  it('test persona switcher - redirect via query', function (done) {
    const module = apos.modules['apostrophe-personas']
    const middleware = module.expressMiddleware
    let req = apos.tasks.getAnonReq()
    
    assert(module, 'has personas module')
    assert(typeof middleware === "function", 'has middleware object')
    
    req.method = 'GET'
    req.session = {}
    req.headers = {
      'user-agent': userAgents.desktop
    }
    req.query = {persona: "employee"}
    req.data = {} // @@NOTE - personas middleware expects this, not sure where it comes from -pw
    req.Referrer = apos.baseUrl
    req.url = 'foo'
    
    // stub redirect
    req.res.redirect = (url) => {
      assert(url, 'redirect happens')
      done()
    }
    
    middleware(req, req.res, () => {
      assert(false, 'this should fail, redirect should have already happened')
      done()
    })
  })
  
  it('test middleware - mock after persona is chose', function (done) {
    const module = apos.modules['apostrophe-personas']
    const middleware = module.expressMiddleware
    let req = apos.tasks.getAnonReq()
    
    req.method = 'GET'
    req.session = {persona: 'employee'} // mock persona
    req.headers = {
      'user-agent': userAgents.desktop
    }
    req.data = {}
    req.Referrer = apos.baseUrl
    req.url = '/foo/bar/'
    req.res.redirect = (url) => {
      assert(url === `/${req.session.persona}${req.url}`, 'redirects to /PERSONA/URL')
      done()
    }
    
    middleware(req, req.res, () => {
      assert()
    })
  })

  /**
   * Unit tests
   **/
  it('getAllPrefixes returns correct values', function (done) {
    const module = apos.modules['apostrophe-personas']
    const getAllPrefixes = module.getAllPrefixes
    let req = apos.tasks.getAnonReq()
    
    const hashPrefixes = (arr) => {
      return arr.sort().reduce((acc, cur) => {
        return acc += cur
      }, '')
    }

    const definedPrefixes = hashPrefixes(module.personas.map(persona => persona.prefix))

    req.method = 'GET'
    req.session = {persona: 'employee'} // mock persona
    req.headers = {
      'user-agent': userAgents.desktop
    }
    req.data = {}
    req.Referrer = apos.baseUrl
    req.url = '/foo/bar/'

    const allPref =  getAllPrefixes(req)

    assert(definedPrefixes === hashPrefixes(allPref), 'Computed available prefixes should equal configured available prefixes')

    done()
  })

  it('addPrefix works', function (done) {
    const module = apos.modules['apostrophe-personas']
    const addPrefix = module.addPrefix
    // perform a hash against defined prefixes for comparison

    let req = apos.tasks.getAnonReq()
    
    req.method = 'GET'
    req.session = {persona: 'employee'} // mock persona
    req.headers = {
      'user-agent': userAgents.desktop
    }
    req.data = {}
    req.Referrer = apos.baseUrl
    req.url = '/foo/bar/'
    req.res.redirect = (url) => {
      assert(url === `/${req.session.persona}${req.url}`, 'redirects to /PERSONA/URL')
      done()
    }

    assert(typeof addPrefix === 'function', 'self.addPrefix exists as function')

    const prefixed = addPrefix(req, 'employee', req.url)
    assert(prefixed === "/employee/foo/bar/")
    done()
  })

});
