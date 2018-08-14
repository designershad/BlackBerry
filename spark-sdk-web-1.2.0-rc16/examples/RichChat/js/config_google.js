//****************************************************************************
// Copyright 2018 BlackBerry.  All Rights Reserved.
//
// You must obtain a license from and pay any applicable license fees to
// BlackBerry before you may reproduce, modify or distribute this software, or
// any work that includes all or part of this software.
//

'use strict';

// This domain is a string known to the BBM Enterprise server, which is
// generally a GUID.
const ID_PROVIDER_DOMAIN = '53cc1df0-469b-4438-9a1f-02d287902608';

// The environment of your BBM Enterprise server. Must be either 'Sandbox' or
// 'Production'.
const ID_PROVIDER_ENVIRONMENT = 'Sandbox';

// The URL or relative path of the Argon2 WASM file.
const KMS_ARGON_WASM_URL = '../../sdk/argon2.wasm';

// This configuration contains service endpoints and information for OAuth2
// authentication. See Support.Auth.GenericAuthHelper.OAuthConfig in the BBM
// Enterprise SDK for JavaScript API reference documentation.
const AUTH_CONFIGURATION = {
  type: 'OAuth',

  // OAuth 2.0 endpoint for requesting an access token
  // To use google OAuth service, put :
  // 'https://accounts.google.com/o/oauth2/v2/auth'
  authService : 'https://accounts.google.com/o/oauth2/v2/auth',

  // OAuth 2.0 endpoint for token validation
  // To use google token info service, put:
  // 'https://www.googleapis.com/oauth2/v3/tokeninfo'
  tokenInfoService : 'https://www.googleapis.com/oauth2/v3/tokeninfo',

  // OAuth 2.0 endpoint for obtaining user information (name, email, avatar URL)
  // To use google user info service, put:
  // 'https://www.googleapis.com/plus/v1/people/me'
  userInfoService : 'https://www.googleapis.com/oauth2/v2/userinfo',

  // Scopes of OAuth 2.0 access token (which resources it can access)
  // If google OAuth service is used, put following scopes:
  // 'https://www.googleapis.com/auth/firebase https://www.googleapis.com/auth/userinfo.email'
  scope : 'https://www.googleapis.com/auth/firebase https://www.googleapis.com/auth/userinfo.email',

  // The client ID of application registered on OAuth 2.0 server
  clientId: '692019736429-1j73bv11gr68dp7eo90ado9r0kr0v875.apps.googleusercontent.com',

  // Redirect URL same as registered on OAuth 2.0 server. Required by OAuth 2.0
  // server to redirect application after issuing an access token.
  redirectUri : 'http://localhost:8080/examples/RichChat/rich_chat.html'
};

// Firebase config info
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDOH3eLgNoEYDskmlwUpMRgkpweAf0IBnY",
  authDomain: "sparkhackathon.firebaseapp.com",
  databaseURL: "https://sparkhackathon.firebaseio.com",
  projectId: "sparkhackathon",
  storageBucket: "sparkhackathon.appspot.com",
  messagingSenderId: "757672568611"
};

// Create the auth manager for the Rich Chat app.
const createAuthManager = () => new GoogleAuthManager(AUTH_CONFIGURATION);

// Create the user manager for the Rich Chat app.
const createUserManager = (userRegId, authManager, getIdentity,
                           getIdentities) =>
  FirebaseUserManager.factory.createInstance(FIREBASE_CONFIG,
    userRegId, authManager, GenericUserInfo, getIdentity, getIdentities);
