//****************************************************************************
// Copyright 2018 BlackBerry.  All Rights Reserved.
//
// You must obtain a license from and pay any applicable license fees to
// BlackBerry before you may reproduce, modify or distribute this software, or
// any work that includes all or part of this software.
//

"use strict";

/**
 * Manages authentication using Azure Auth.
 * This will handle both authenticating to get an access token to use with the
 * BBM Enterprise server and another access token for calling the
 * Microsoft Graph API's.
 * This takes 2 separate auth configuration objects to be used when authenticating
 * for both access tokens.  In most cases the configuration will be the same
 * except for the scope since the permissions will be for different resources.
 * This checks if 'openid' and 'profile' scopes are defined in
 * authForBbmSdkConfig and authForUserManagerConfig. If scopes are missing, this
 * will automatically add it to these objects.
 * This will cache both access tokens and handle requesting new ones when the
 * cached ones have expired and are requested.
 *
 * {@link https://developer.blackberry.com/files/bbm-enterprise/documents/guide/html/azureIdentityManagement.html}
 *
 * @param {Support.Auth.GenericAuthHelper.JWTConfig} authForBbmSdkConfig
 *   The configuration required to authenticate with the Azure auth service
 *   with a scope for the BBM Enterprise server.
 *   {@link https://developer.blackberry.com/files/bbm-enterprise/documents/guide/html/identityManagement.html}
 *
 * @param {Support.Auth.GenericAuthHelper.JWTConfig} authForUserManagerConfig
 *   The configuration required to authenticate with the Azure auth service
 *   with a scope for the Microsoft Graph API permissions that are required by
 *   the application.
 *   This would normally contain at least
 *   "https://graph.microsoft.com/User.ReadWrite https://graph.microsoft.com/User.ReadBasic.All"
 *   {@link https://developer.blackberry.com/files/bbm-enterprise/documents/guide/html/azureUserManagement.html}
 *
 * @memberof Support.Auth
 * @class AzureAuthManager
 */
function AzureAuthManager(authForBbmSdkConfig, authForUserManagerConfig) {
  const m_authForBbmSdkConfig = authForBbmSdkConfig;
  const m_authForUserManagerConfig = authForUserManagerConfig;
  const m_helperForBbmSdk = new GenericAuthHelper();
  const m_helperForUserManager = new GenericAuthHelper();
  const m_localUserInfo = {};

  const enforceAuthScopes = authConfig => {
    if (!authConfig.scope) {
      throw new Error('Configuration scope is not defined');
    }
    const scopes = authConfig.scope.split(' ');
    const scopesLen = scopes.length;
    if (!scopes.find(scope => scope.toLowerCase() === 'profile')) {
      console.log('Automatically adding "profile" to scope to get id token');
      scopes.push('profile');
    }
    if (!scopes.find(scope => scope.toLowerCase() === 'openid')) {
      console.log('Automatically adding "openid" to scope to get id token');
      scopes.push('openid');
    }
    if (scopesLen !== scopes.length) {
      // New scopes were added. Updated the scope.
      authConfig.scope = scopes.join(' ');
    }
  };
  enforceAuthScopes(m_authForBbmSdkConfig);
  enforceAuthScopes(m_authForUserManagerConfig);

  this.authenticate = function() {
    return new Promise((resolve, reject) => {
      // First get token for BBM Enterprise server
      m_helperForBbmSdk.authenticate(m_authForBbmSdkConfig)
      .then(loginData1 => {
        // See if the preferred_username is set in a token. This is not
        // mandatory, but can be used to prevent potentially prompting the user
        // to login twice if they are signed in with multiple accounts in the
        // same browser. This would happen if they have work and personal
        // accounts.
        const token
          = loginData1.idToken || loginData1.accessToken;
        if (token) {
          try {
            const jwtInfo = m_helperForBbmSdk.parseJWTToken(token);
            if (jwtInfo && jwtInfo.preferred_username) {
              m_localUserInfo.displayName =
                jwtInfo.name || jwtInfo.preferred_username;
              // Set it in the config for Azure. This will suggest to Azure auth
              // service to use the same user account that the user just
              // selected instead of prompting again.
              m_authForUserManagerConfig.login_hint
                = jwtInfo.preferred_username;
            }
          } catch (err) {
            console.log(`Error occurred trying to find preferred_username,` +
              ` will continue without it. err=${err}`);
          }
        }

        // Get access token to access the Microsoft Graph API. This is separate
        // from the one used to authenticate the user and get access token for
        // the SDK but we will validate they both use the same AD user ID.
        m_helperForUserManager.authenticate(m_authForUserManagerConfig)
        .then(loginData2 => {
          // Validate that we have user ID's and the user ID in both match.
          // This is to confirm that the user didn't select different accounts
          // for the 2 auth requests (eg. work and personal account).
          if (loginData1.userInfo.userId && 
            loginData1.userInfo.userId === loginData2.userInfo.userId) {
            // The user ID's match, just return the user info object for the
            // first auth.
            m_localUserInfo.userId = loginData1.userInfo.userId;
            resolve(m_localUserInfo);
          } else {
            // We don't want to allow using different accounts.
            const error = new Error('User used different account with id= ' +
             `${loginData2.userInfo.userId} to login for MS Graph than ` +
             'for the BBM Enterprise SDK with userId= ' +
             loginData1.userInfo.userId);
            reject(error);
          }
        }).catch(err => {
          reject(err);
        });
      }).catch(err => {
        reject(err);
      });
    });
  };

  /**
   * Get information for the local user that was retrieved from the
   * authentication user info service.
   * @returns {Support.Identity.GenericUserInfo} The information for the local
   * user.
   */
  this.getLocalUserInfo = function() {
    return m_localUserInfo;
  };

  /**
   * Get the access token from the Azure auth service that can be used when
   * creating the {BBMEnterprise}.
   * This will return a cached token if it is still valid or it will request a
   * new one if the cached one has expired.
   * @returns {Promise<string>} The promise of an access token that can be sent
   * to the BBM Enterprise server.
   */
  this.getBbmSdkToken = function() {
    return m_helperForBbmSdk.getOAuthAccessToken(m_authForBbmSdkConfig);
  };

  /**
   * Get the access token from the Azure auth service that can be used by
   * the {Support.AzureUserManager}.
   * This will return a cached token if it is still valid or it will request a
   * new one if the cached one has expired.
   * @returns {Promise<string>}
   *   The promise of an access token for the user manager.
   */
  this.getUserManagerToken = function() {
    return m_helperForUserManager.getOAuthAccessToken(m_authForUserManagerConfig);
  };

  /**
   * Get the access token from the Azure auth service that can be used by
   * the {Support.CosmosDbKeyProvider} or other key provider.
   * This will return a cached token if it is still valid or it will request a
   * new one if the cached one has expired.
   * @returns {Promise<string>}
   *   The promise of an access token for a key provider.
   */
  this.getKeyProviderToken = function() {
    return m_helperForBbmSdk.getOAuthAccessToken(m_authForBbmSdkConfig);
  };
}

//****************************************************************************
