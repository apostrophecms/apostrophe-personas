var assert = require('assert');
var _ = require('lodash');
var request = require('request');

describe('Personas Module', function() {

  var apos;
  const basePath = "http://localhost:3000"

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
        console.log('1e', err)
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
      console.log("res", res.toJSON())
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
  it('test persona middleware', function (done) {
    const module = apos.modules['apostrophe-personas']
    const middleware = module.expressMiddleware
    let req = apos.tasks.getAnonReq()
    
    assert(module, 'has personas module')
    assert(typeof middleware === "function", 'has middleware object')

    req.session = {}
    
    // stub redirect
    req.res.redirect = (url) => {
      console.log("Test stub - redirect url", url)
      assert(url, 'redirect happens')
    }

    done()
  })

  // check referrer
  
  // check session
 
 /*
  it('A request with a persona attribute should add persona to session', function (done) {
    let req = apos.tasks.getReq();
    req.query.persona = "employer"
    assert(req.session && !req.session.persona);

    return apos.pages.find(req, { slug: '/employee/foo' }).toObject(function(err, page) {
      console.log(err, req, page);
      assert(!err);
      done();
    });
  });
*/
  // test unassigned persona
  
  // test persona switcher - assign
  
  // test persona-switcher - change

  // test persona-switcher - reset
  
});
