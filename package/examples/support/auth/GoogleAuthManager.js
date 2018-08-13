//****************************************************************************
// Copyright 2018 BlackBerry.  All Rights Reserved.
//
// You must obtain a license from and pay any applicable license fees to
// BlackBerry before you may reproduce, modify or distribute this software, or
// any work that includes all or part of this software.
//

"use strict";

/**
 * Manages authentication using Google Auth.
 * This takes a configuration object for the Google authentication service and
 * will manage the authentication with the user and requesting new access tokens
 * as required.
 * This checks if 'profile' scopes is defined in authConfig scope. If 
 * scope is missing, it is automatically added it to this authConfig scope.
 * @param {Support.Auth.GenericAuthHelper.OAuthConfig} authConfig
 *   The configuration required to authenticate with an OAuth2 service.
 *
 * @memberof Support.Auth
 * @class GoogleAuthManager
 */
function GoogleAuthManager(authConfig) {
  var m_authConfig = authConfig;
  var m_helper = new GenericAuthHelper();
  var m_localUserInfo;

  if (!m_authConfig.scope) {
    throw new Error('Configuration scope is not defined');
  }

  const scopes = m_authConfig.scope.split(' ');
  const scopesLen = scopes.length;

  if (!scopes.find(scope => scope.toLowerCase() === 'profile')) {
    console.log('Automatically adding "profile" to scope to get id token');
    scopes.push('profile');
  }

  if (scopesLen !== scopes.length) {
    // New scopes were added. Update the scope.
    m_authConfig.scope = scopes.join(' ');
  }

  this.authenticate = function() {
    return new Promise(function(resolve, reject) {
      m_helper.authenticate(m_authConfig).then(function(userInfoAndTokens) {
        m_localUserInfo = userInfoAndTokens.userInfo;
        resolve(m_localUserInfo);
      }).catch(function(err) {
        reject(err);
      });
    });
  };
  
  /**
   * Get information for the local user that was retrieved from the
   * authentication user info service.
   *
   * @returns {Support.Identity.GenericUserInfo}
   *   The information for the local user.
   */
  this.getLocalUserInfo = function() {
    return m_localUserInfo;
  };
  
  /**
   * Get the access token from the Google auth service that can be used when
   * creating the {BBMEnterprise}.
   * This will return a cached token if it is still valid or it will request a
   * new one if the cached one has expired.
   *
   * @returns {Promise<string>}
   *   The promise of an access token that can be sent to the BBM Enterprise server.
   */
  this.getBbmSdkToken = function() {
    return m_helper.getOAuthAccessToken(m_authConfig);
  };
  
  /**
   * Get the access token from the Google auth service that can be used by
   * the {Support.FirebaseUserManager}.
   * This will return a cached token if it is still valid or it will request a
   * new one if the cached one has expired.
   *
   * @returns {Promise<string>}
   *   The promise of an access token for the user manager.
   */
  this.getUserManagerToken = function() {
    return m_helper.getOAuthAccessToken(m_authConfig);
  };
  
  /**
   * Get the access token from the Google auth service that can be used by
   * the key provider if needed.
   * This will return a cached token if it is still valid or it will request a
   * new one if the cached one has expired.
   *
   * @returns {Promise<string>}
   *   The promise of an access token for a key provider.
   */
  this.getKeyProviderToken = function() {
    return m_helper.getOAuthAccessToken(m_authConfig);
  };
}

//****************************************************************************
