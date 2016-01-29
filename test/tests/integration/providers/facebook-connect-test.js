var torii, app;

import buildFBMock from 'test/helpers/build-fb-mock';
import configuration from 'torii/configuration';
import startApp from 'test/helpers/start-app';
import lookup from 'test/helpers/lookup';

var originalConfiguration = configuration.providers['facebook-connect'],
    originalGetScript = $.getScript,
    originalFB = window.FB;

module('Facebook Connect - Integration', {
  setup: function(){
    app = startApp({loadInitializers: true});
    torii = lookup(app, 'service:torii');
    configuration.providers['facebook-connect'] = {appId: 'dummy'};
    window.FB = buildFBMock();
  },
  teardown: function(){
    window.FB = originalFB;
    configuration.providers['facebook-connect'] = originalConfiguration;
    $.getScript = originalGetScript;
    Ember.run(app, 'destroy');
  }
});

test("Opens facebook connect session", function(){
  $.getScript = function(){
    window.fbAsyncInit();
  };
  Ember.run(function(){
    torii.open('facebook-connect').then(function(){
      ok(true, "Facebook connect opened");
    }, function(e){
      ok(false, "Facebook connect failed to open: " + e.message);
    });
  });
});

test("Returns the scopes granted when configured", function(){
  $.getScript = function(){
    window.fbAsyncInit();
  };
  configuration.providers['facebook-connect'].returnScopes = true;
  Ember.run(function(){
    torii.open('facebook-connect').then(function(data){
      equal('email', data.grantedScopes);
    });
  });
});

test("Supports custom auth_type on login", function(){
  $.getScript = function(){
    window.fbAsyncInit();
  };
  Ember.run(function(){
    torii.open('facebook-connect', {authType: 'rerequest'}).then(function(data){
      equal(5678, data.expiresIn, 'expriesIn extended when rerequest found');
    });
  });
});
