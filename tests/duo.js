var Duo = require('../index')

var IKEY = 'DIXXXXXXXXXXXXXXXXXX'
var WRONG_IKEY = 'DIXXXXXXXXXXXXXXXXXY'
var SKEY = 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeef'
var AKEY = 'useacustomerprovidedapplicationsecretkey'
var WRONG_AKEY = 'useacustomerprovidedapplicationsecretkeY'
var USER = 'testuser'
var INVALID_RESPONSE = 'AUTH|INVALID|SIG'
var EXPIRED_RESPONSE = 'AUTH|dGVzdHVzZXJ8RElYWFhYWFhYWFhYWFhYWFhYWFh8MTMwMDE1Nzg3NA==|cb8f4d60ec7c261394cd5ee5a17e46ca7440d702'
var FUTURE_RESPONSE = 'AUTH|dGVzdHVzZXJ8RElYWFhYWFhYWFhYWFhYWFhYWFh8MTYxNTcyNzI0Mw==|d20ad0d1e62d84b00a3e74ec201a5917e77b6aef'
var WRONG_PARAMS_RESPONSE = 'AUTH|dGVzdHVzZXJ8RElYWFhYWFhYWFhYWFhYWFhYWFh8MTYxNTcyNzI0M3xpbnZhbGlkZXh0cmFkYXRh|6cdbec0fbfa0d3f335c76b0786a4a18eac6cdca7'
var WRONG_PARAMS_APP = 'APP|dGVzdHVzZXJ8RElYWFhYWFhYWFhYWFhYWFhYWFh8MTYxNTcyNzI0M3xpbnZhbGlkZXh0cmFkYXRh|7c2065ea122d028b03ef0295a4b4c5521823b9b5'

module.exports['Signing Checks'] = {
  'sign request with ikey/skey/akey and user': function (test) {
    var request_sig = Duo.sign_request(IKEY, SKEY, AKEY, USER)
    test.notEqual(request_sig, null, 'Invalid Request')
    test.done()
  },
  'sign request without a user': function (test) {
    var request_sig = Duo.sign_request(IKEY, SKEY, AKEY, '')
    test.equal(request_sig, Duo.ERR_USER, 'Sign request user check failed')
    test.done()
  },
  'sign request with invalid user': function (test) {
    var request_sig = Duo.sign_request(IKEY, SKEY, AKEY, 'in|valid')
    test.equal(request_sig, Duo.ERR_USER, 'Sign request user check failed')
    test.done()
  },
  'sign request with an invalid ikey': function (test) {
    var request_sig = Duo.sign_request('invalid', SKEY, AKEY, USER)
    test.equal(request_sig, Duo.ERR_IKEY, 'Sign request ikey check failed')
    test.done()
  },
  'sign request with an invalid skey': function (test) {
    var request_sig = Duo.sign_request(IKEY, 'invalid', AKEY, USER)
    test.equal(request_sig, Duo.ERR_SKEY, 'Sign request skey check failed')
    test.done()
  },
  'sign request with an invalid akey': function (test) {
    var request_sig = Duo.sign_request(IKEY, SKEY, 'invalid', USER)
    test.equal(request_sig, Duo.ERR_AKEY, 'Sign request akey check failed')
    test.done()
  }
}

var request_sig = Duo.sign_request(IKEY, SKEY, AKEY, USER)
var parts = request_sig.split(':')
var valid_app_sig = parts[1]

request_sig = Duo.sign_request(IKEY, SKEY, 'invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalid', USER)
parts = request_sig.split(':')
var invalid_app_sig = parts[1]

module.exports['Verify Checks'] = {
  'verify request': function (test) {
    var user = Duo.verify_response(IKEY, SKEY, AKEY, INVALID_RESPONSE + ':' + valid_app_sig)
    test.equal(user, null, 'Invalid response check failed')
    test.done()
  },
  'expire check': function (test) {
    var user = Duo.verify_response(IKEY, SKEY, AKEY, EXPIRED_RESPONSE + ':' + valid_app_sig)
    test.equal(user, null, 'Expired response check failed')
    test.done()
  },
  'invalid app sig': function (test) {
    var user = Duo.verify_response(IKEY, SKEY, AKEY, FUTURE_RESPONSE + ':' + invalid_app_sig)
    test.equal(user, null, 'Invalid app sig check failed')
    test.done()
  },
  'verify response on valid signature': function (test) {
    var user = Duo.verify_response(IKEY, SKEY, AKEY, FUTURE_RESPONSE + ':' + valid_app_sig)
    test.equal(user, USER, 'verify response failed on valid signature')
    test.done()
  },
  'invalid response format': function (test) {
    var user = Duo.verify_response(IKEY, SKEY, AKEY, WRONG_PARAMS_RESPONSE + ':' + valid_app_sig)
    test.equal(user, null, 'Invalid response format check failed')
    test.done()
  },
  'invalid app sig format': function (test) {
    var user = Duo.verify_response(IKEY, SKEY, AKEY, FUTURE_RESPONSE + ':' + WRONG_PARAMS_APP)
    test.equal(user, null, 'Invalid app sig format check failed')
    test.done()
  },
  'wrong ikey': function (test) {
    var user = Duo.verify_response(WRONG_IKEY, SKEY, AKEY, FUTURE_RESPONSE + ':' + valid_app_sig)
    test.equal(user, null, 'Wrong IKEY check failed')
    test.done()
  }
}

module.exports['Signing App Blob Checks'] = {
  'sign request with ikey/akey and user': function (test) {
    var request_sig = Duo.sign_app_blob(IKEY, AKEY, USER)
    test.notEqual(request_sig, null)
    test.done()
  },
  'sign request without a user': function (test) {
    test.throws(function () {
      Duo.sign_app_blob(IKEY, AKEY, '')
    }, Duo.UsernameError)
    test.done()
  },
  'sign request with invalid user': function (test) {
    test.throws(function () {
      Duo.sign_app_blob(IKEY, AKEY, 'in|valid')
    }, Duo.UsernameError)
    test.done()
  },
  'sign request with an invalid ikey': function (test) {
    test.throws(function () {
      Duo.sign_app_blob('invalid', AKEY, USER)
    }, Duo.IkeyError)
    test.done()
  },
  'sign request with an invalid akey': function (test) {
    test.throws(function () {
      Duo.sign_app_blob(IKEY, 'invalid', USER)
    }, Duo.AkeyError)
    test.done()
  }
}

module.exports['Verifying App Blob Checks'] = {
  'verify response on valid signature': function (test) {
    var app_blob = Duo.sign_app_blob(IKEY, AKEY, USER)
    test.equal(Duo.verify_app_blob(IKEY, AKEY, USER, app_blob), true, 'verify app blob failed on valid signature')
    test.done()
  },
  'verify app blob invalid prefix': function (test) {
    var app_blob = Duo.sign_app_blob(IKEY, AKEY, USER)
    var inv_app_blob = app_blob.replace('A', 'x')
    test.equal(Duo.verify_app_blob(IKEY, AKEY, USER, inv_app_blob), false, 'verify app blob failed on invalid app_blob')
    test.done()
  },
  'verify app blob invalid user': function (test) {
    var app_blob = Duo.sign_app_blob(IKEY, AKEY, USER)
    test.equal(Duo.verify_app_blob(IKEY, AKEY, 'invalid', app_blob), false, 'verify app blob failed on invalid user')
    test.done()
  },
  'verify app blob invalid ikey': function (test) {
    var app_blob = Duo.sign_app_blob(IKEY, AKEY, USER)
    test.equal(Duo.verify_app_blob(WRONG_IKEY, AKEY, USER, app_blob), false, 'verify app blob failed on invalid ikey')
    test.done()
  },
  'verify app blob invalid akey': function (test) {
    var app_blob = Duo.sign_app_blob(IKEY, AKEY, USER)
    test.equal(Duo.verify_app_blob(IKEY, WRONG_AKEY, USER, app_blob), false, 'verify app blob failed on invalid akey')
    test.done()
  }
}
