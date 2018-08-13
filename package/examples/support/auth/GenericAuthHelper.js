//****************************************************************************
// Copyright 2018 BlackBerry.  All Rights Reserved.
//
// You must obtain a license from and pay any applicable license fees to
// BlackBerry before you may reproduce, modify or distribute this software, or
// any work that includes all or part of this software.
//

"use strict";

/**
 * @typedef {Object} OAuthConfig
 *   The configuration required to authenticate with a OAuth2 service.
 *
 * @memberof Support.Auth.GenericAuthHelper
 *
 * @property {string} type
 *   The type of authentication. This must be "OAuth".
 *
 * @property {string} authService
 *   oAuth service endpoint.
 *
 * @property {string} tokenInfoService
 *   Token info service endpoint.
 *
 * @property {string} userInfoService
 *   User info service endpoint.
 *
 * @property {string} scope
 *   Scope of the access token being requested.
 *
 * @property {string} clientId
 *   Application ID configured on oAuth server.
 *
 * @property {string} redirectUri
 *   URL required by oAuth server to redirect app after access token is acquired.
 */

/**
 * @typedef {Object} JWTConfig
 *   The configuration required to authenticate with a OAuth2 service.
 *   Uses JWT to parse the user's info from the token.
 *
 *  @memberof Support.Auth.GenericAuthHelper
 *
 * @property {string} type
 *   The type of authentication. This must be "JWT".
 *
 * @property {string} authService
 *   oAuth service endpoint.
 *
 * @property {string} clientId
 *   Application ID configured on oAuth server.
 *
 * @property {string} redirectUri
 *   URL required by oAuth server to redirect app after access token is acquired.
 *
 * @property {string} [scope]
 *   Scope of the access token being requested.
 *
 * @property {string} [resource]
 *   The resource the token is required to access.  This is optional unless the
 *   authentication service requires it.
 */

/**
 * @typedef {Object} TokenWrapper
 *   Wrapper around token(s) from authentication service.
 *
 * @memberof Support.Auth.GenericAuthHelper
 *
 * @property {string} accessToken
 *   The access token returned by the authentication service.
 *
 * @property {Date} expiresAt
 *   The time that the accessToken will expire.
 *
 * @property {string} [idToken]
 *   The ID token returned by the authentication service.
 */

/**
 * @typedef {Object} UserInfoAndTokens
 *   Wrapper around token(s) and user info from authentication service.
 *
 * @memberof Support.Auth.GenericAuthHelper
 *
 * @property {string} accessToken
 *   The access token returned by the authentication service.
 *
 * @property {string} [idToken]
 *   The ID token returned by the authentication service.
 *
 * @property {Support.Identity.GenericUserInfo} [userInfo]
 *   The user info returned by the authentication service.
 */

/**
 * Contains functions that help with OAuth2 and JWT services.
 * The primary function of this class is to obtain an auth token.
 *
 * @memberof Support.Auth
 * @class GenericAuthHelper
 */
function GenericAuthHelper() {

  const POPUP_HEIGHT = 640; // px
  const POPUP_WIDTH = 480; // px
  const POLL_LOCATION_INTERVAL = 250; // milliseconds
  const POLL_CROSS_DOMAIN_INTERVAL = 500; // milliseconds
  const IFRAME_TIMEOUT = 2000; // milliseconds.

  var m_cachedTokens;
  var m_configuration;
  var self = this;

  /**
   * Authenticate with specified authentication service.
   * This will return an object containing the user ID and an access token from
   * the auth system.
   * 
   * This helper does not validate either the user ID or access
   * token here, that responsibility is left to the caller to allow the service
   * it will use them on to validate it.
   *
   * @param {Support.Auth.GenericAuthHelper.OAuthConfig|Support.Auth.GenericAuthHelper.JWTConfig} config
   *   The configuration required to authenticate with the authentication service.
   *
   * @returns {Promise<Support.Auth.GenericAuthHelper.UserInfoAndTokens>}
   *   The promise of the user ID and access token.
   *
   * @throws {Error} If the config parameter is invalid.
   */
  this.authenticate = function(config) {
    if (config.type === "JWT") {
      return authenticateOAuthJWT(config);
    } else if (config.type === "OAuth") {
      return authenticateOAuth(config);
    } else {
      throw new Error("Invalid config type="+config.type);
    }
  };

  /**
   * Authenticate with specified authentication service using OAuth to get
   * the access token.
   * @param {Support.Auth.GenericAuthHelper.OAuthConfig} config
   *   Customer oAuth service information object.
   *
   * @returns {Promise<Support.Auth.GenericAuthHelper.UserInfoAndTokens>}
   *   The promise of a user info object.
   */
  var authenticateOAuth = function(config) {
    return new Promise(function(resolve, reject) {
      self.getOAuthAccessToken(config)
      .then(function(accessToken) {
        self.getOAuthUserInfo(accessToken, config.userInfoService)
        .then(function(userInfo) {
          resolve({
            accessToken: accessToken,
            userInfo: new GenericUserInfo(userInfo.id,
              undefined, //no regId
              userInfo.displayName,
              userInfo.emails && userInfo.emails.length > 0 ?
                userInfo.emails[0].value : undefined,
              userInfo.image ? userInfo.image.url : undefined)
            });
        }).catch(function(err) {
          console.error("authenticateOAuth: get user info err="+err);
          reject(err);
        });
      }).catch(function(err) {
        console.error("authenticateOAuth: get token err="+err);
        reject(err);
      });
    });
  };

  /**
   * Utility function that performs asynchronous http get request
   * @param url - URL to be requested
   * @param successCallback - callback invoked when request status is Success
   * @param errorCallback - callback invoked when request status is not Success
   */
  var httpGet = (url, successCallback, errorCallback) => {
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = () => {
      if (httpRequest.readyState == 4) {
        if (httpRequest.status == 200
         && typeof httpRequest.response == "object") {
          successCallback(httpRequest.response);
        }
        else {
          var errString = "GenericAuthHelper: httpGet: status="
            + httpRequest.status
            + " statusText="+httpRequest.statusText
            + "; responseType = " + typeof httpRequest.response;
          console.log(errString);
          errorCallback(new Error(errString));
        }
      }
    };
    httpRequest.responseType = "json";
    httpRequest.open("GET", url, true);
    httpRequest.send(null);
  };

  /**
   * Utility function that resolves relative URL string and returns absolute
   * path.
   * @param {String} url - Relative URL string to be resolved
   */
  var resolveRelativeURL = function(url) {
    var a = document.createElement('a');
    document.body.appendChild(a);
    a.href = url;
    var retUrl = a.href;
    a.parentElement.removeChild(a);
    return retUrl;
  };

  /**
   * Utility function that checks if passed URL string is absolute.
   * @param {String} url - URL string to be checked.
   */
  var isAbsoluteURL = function(url) {
    return url.startsWith("http://") || url.startsWith("https://");
  };

  /**
   * Requests access token from specified authentication service
   * @param {Support.Auth.GenericAuthHelper.OAuthConfig|Support.Auth.GenericAuthHelper.JWTConfig} config
   *   The configuration required to authenticate with the authentication service.
   */
  this.getOAuthAccessToken = configuration =>
    getAuthTokens(configuration).then(tokens => tokens.access_token);

  /**
   * Requests an access token (and a ID token if specified in the configuration)
   * from configured authentication service.
   * 
   * @param {Support.Auth.GenericAuthHelper.OAuthConfig|Support.Auth.GenericAuthHelper.JWTConfig} config
   *   The configuration required to authenticate with the authentication service.
   * 
   * @returns {Promise<Support.Auth.GenericAuthHelper.TokenWrapper>}
   *   Promise of the token(s) wrapped in an object.
   *
   * @throws {Error} if only access_token was returned.
   */
  var getAuthTokens = function(configuration) {
    return new Promise((resolve) => {
      if (m_configuration === undefined ||
        m_configuration.clientId !== configuration.clientId)
      {
        // Configuration was changed, remove cached token
        m_cachedTokens = null;
        // Reset configuration
        m_configuration = configuration;
      }

      if (m_cachedTokens) {
        if (m_cachedTokens.expiresAt > new Date().getTime()) {
          resolve(m_cachedTokens);
          return;
        }
      }

      /**
       * Waits for oAuth service to redirect popup to redirectUri with access_token 
       * after # in URL
       * @param {string} authUrl - URL for auth service
       *
       * @returns {Promise<string>}
       *   The promise of the server response string after the # in the redirectUrl
       *   after authenticating with the user.
      */
      var waitForPopupHash = function(authUrl) {
        var cleanup = function() {
          if (authWindow !== null && typeof authWindow !== "undefined") {
            authWindow.close();
          }
        };

        // Handle oAuthResponse in new popup window so our main page will not be reloaded
        var authWindow = window.open(authUrl, "authWindow",
          "height=" + POPUP_HEIGHT + ",width=" + POPUP_WIDTH
        );

        return new Promise(function(resolve, reject) {
          if (!authWindow) {
            reject(new Error("Please check your browser allows popup windows on this domain and try again."));
            return;
          }

          var waitValue = function() {
            try {
              if (!authWindow.location.hash) {
                if (authWindow.closed) {
                  reject(new Error("Failed to obtain parameters from popup window"));
                  return;
                }
                // Wait the configured interval and try again.
                setTimeout(function() {
                  waitValue();
                }, POLL_LOCATION_INTERVAL);
              } else {
                resolve(authWindow.location.hash);
                cleanup();
              }
            } catch (err) {
              // This is the case when popup window shows login form from oAuth
              // server. In this case exception will be thrown each time we
              // access popup window info window (due to cross domain access is
              // not allowed). In this case try again after configured
              // interval.
              setTimeout(function() {
                waitValue();
              }, POLL_CROSS_DOMAIN_INTERVAL);
            }
          };
          waitValue();
        });
      };
      
      var waitForIframeHash = function(authUrl) {
        var frame = document.createElement("iframe");
        frame.style.visibility = "hidden";
        frame.setAttribute("id", "authFrame");
        frame.src = authUrl;
        document.body.appendChild(frame);
        
        var cleanup = function() {
          if (frame.parentElement) {
            frame.parentElement.removeChild(frame);
          }
        };

        var startTime = new Date().getTime();
        return new Promise(function(resolve, reject) {
          var waitValue = function() {
            try {
              if (frame.contentWindow.location.hash) {
                resolve(frame.contentWindow.location.hash);
                cleanup();
              } else {
                var now = new Date().getTime();
                if (now - startTime >= IFRAME_TIMEOUT) {
                  //Took too long, assume it is an error, caller can try in popup so user can see error
                  cleanup();
                  reject(new Error("Waited "+(now - startTime)+" for frame to auto auth"));
                } else {
                  console.log("waitForIframeHash: will wait longer delay="+(now - startTime));
                  //wait a bit longer
                  setTimeout(function() {
                    waitValue();
                  }, POLL_LOCATION_INTERVAL);
                }
              }
            } catch (err) {
              console.log("Failed to auth in frame err="+err);
              //just pass to caller, it can try in popup so user can see error
              cleanup();
              reject(new Error("Error occurred trying to auto auth in frame err="+err));
            }
          };
          waitValue();
        });
      };
      
      /**
       * Try to get the access token(s) using either the hidden iframe or popup window.
       * This will first try using iframe unless forcePopup is true, if that
       * fails then it will try the popup.
       *
       * @param {string} authUrl
       *   The auth service URL.
       *
       * @param {boolean} forcePopup
       *   If true this will prompt user to login in popup window,
       *   if false this will first try to authenticate using a hidden iframe,
       *   then if that fails it will prompt user to login in popup window.
       *
       * @returns  {Promise<Support.Auth.GenericAuthHelper.TokenWrapper>}
       *   The promise of tokens.
       */
      var waitForAccessToken = function(authUrl, forcePopup) {
        //function to use popup, only called if needed.
        return new Promise(function(resolve, reject) {
          var waitForAccessTokenFromPopup = function(authUrl) {
            waitForPopupHash(authUrl)
            .then(function(locationHash) {
              var tokens = getAccessTokenFromRequestUrl(locationHash);
              if (!tokens) {
                reject(new Error("Failed to get token(s) from popup."));
              } else {
                resolve(tokens);
              }
            })
            .catch(function(err) {
              console.log("Error occurred getting access token from popup. err="+err);
              reject(err);
            });
          };

          if (!forcePopup) {
            //First try the hidden way to not annoy user with temp popup
            waitForIframeHash(authUrl)
            .then(function(locationHash) {
              var tokens = getAccessTokenFromRequestUrl(locationHash);
              if (tokens) {
                resolve(tokens);
              } else {
                //If user interaction is required then the access token will not
                //be in the location hash. Open popup to allow user interaction.
                waitForAccessTokenFromPopup(authUrl);
              }
            })
            .catch(function(err) {
              console.log("Failed to auth using iframe, will try popup. err="+err);
              waitForAccessTokenFromPopup(authUrl);
            });
          } else {
            console.log("forced to use popup, will not try iframe");
            waitForAccessTokenFromPopup(authUrl);
          }
        });
      };

      /**
       * Function parses the oAuth server response in URL and returns access
       * token from it.
       *
       * @param {Object} locationHash
       *   The server response string after # in redirectUrl
       *
       * @returns {Support.Auth.GenericAuthHelper.TokenWrapper} in case of success,
       *  null in case of failure.
       *  If only access_token was returned then the access token will be
       *  discarded and null will be returned.
       */
      var getAccessTokenFromRequestUrl = function(locationHash) {
        try {
          var queryHashParamsString = locationHash.substring(1);
          if (queryHashParamsString === "" ) {
            console.error("missing params in locationHash");
            return null;
          }

          var params = {};
          var regex = /([^&=]+)=([^&]*)/g, m;

          while ((m = regex.exec(queryHashParamsString))) {
            params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
          }

          if (params.access_token && params.expires_in) {
            // Do not check for error here. If access_token is present in
            // response, then assume this is a valid access token.

            // Cache received access token
            var dateExpiresAt = new Date(new Date().getTime() +
              params.expires_in * 1000);

            m_cachedTokens = {
              expiresAt: dateExpiresAt,
              access_token: params.access_token
            };

            if (params.id_token) {
              m_cachedTokens.id_token = params.id_token;
            } else {
              m_cachedTokens = null;
              //Fail this request even though we have an access token since the
              //config specified to use ID token.
              //Ensure the reason for failure is logged
              var message = "Auth service did not return id_token as required, will fail";
              console.error(message);
              throw new Error(message);
            }
            
            return m_cachedTokens;
          }
          else {
            if (params.error) {
              console.error("oAuth service returned error: " + params.error);
            }

            if (params.error_description) {
              console.error("oAuth service returned error_description: " +
                            decodeURIComponent(params.error_description)
                            .replace(/\+/g, ' '));
            }

            return null;
          }
        } catch (err) {
          console.log("Failed to get access token from oAuth service: " + err);
          return null;
        }
      };

      var redirectUrl = configuration.redirectUri;
      if (!isAbsoluteURL(redirectUrl))
      {
        redirectUrl = resolveRelativeURL(redirectUrl);
      }

      var params = {
        client_id: configuration.clientId,
        redirect_uri: redirectUrl
      };
      if (configuration.resource) {
        params.resource = configuration.resource;
      }
      if (configuration.scope) {
        params.scope = configuration.scope;
      }
      if (configuration.prompt) {
        params.prompt = configuration.prompt;
      }
      if (configuration.login_hint) {
        params.login_hint = configuration.login_hint;
      }
      //Get both the access token and ID token
      params.response_type="id_token token";
      params.nonce = Math.floor(Math.random() * 1000000);

      const searchParams = Object.keys(params).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(params[key])).join('&');

      //wait for user to authenticate and get the access token from it.
      resolve(waitForAccessToken(configuration.authService + "?" + searchParams, configuration.forcePopup));
    });
  };

  /**
   * Requests the user information from the specified userInfoService associated
   * with the given access_token.
   *
   * @param {Object} access_token
   *   The access token issued by an oAuth service provider.
   *
   * @param {Object} userInfoService
   *   The fully qualified URL of the user info service associated with the
   *   oAuth service that issued the given access_token.
   *
   * @returns {Promise<Object>}
   *   The promise of a user info object, which is opaque data and is returned
   *   without modification. Please refer to the documentation for the user info
   *   service that is being used for details on the structure of the returned
   *   user info object.
   *
   * The promise will be rejected on any failure to retrieve the user info
   * object from the userInfoService.
   */
  this.getOAuthUserInfo = function(access_token, userInfoService) {
    return new Promise(function(resolve, reject) {
      var url = userInfoService + "?access_token=" + access_token;
      httpGet(url, resolve, reject);
    });
  };

  /**
   * Authenticate with specified authentication service using OAuth to get
   * the access token and JWT to parse the user's info from the token
   * returned from the authentication service.
   *
   * @param {Support.Auth.GenericAuthHelper.JWTConfig} config
   *   The configuration required to authenticate with the authentication
   *   service.
   *
   * @returns {Promise<Support.Auth.GenericAuthHelper.UserInfoAndTokens>}
   *   The promise of the user's information.
   */
  var authenticateOAuthJWT = function(config) {
    return new Promise(function(resolve, reject) {
      // Get the token using OAuth
      getAuthTokens(config)
      .then(tokens => {
        //Parse the JWT to extract the user ID from it.
        const userInfo = self.parseJWTToken(tokens.id_token);
        if (!userInfo.oid) {
          reject(new Error("Missing oid field in JWT token"));
          return;
        }
        resolve({
          accessToken: tokens.access_token,
          idToken: tokens.id_token,
          userInfo: new GenericUserInfo(userInfo.oid)
        });
      }).catch(err => {
        console.log(err);
        reject(err);
      });
    });
  };

  /**
   * Parse a JWT (JSON Web Token) from the authentication service into a
   * object with values in human readable text.
   * See: https://tools.ietf.org/html/rfc7519
   *
   * @param {type} token
   *   The JWT from the authentication service.
   *
   * @returns {Object}
   *   The parsed JWT object with the properties from the authentication service.
   */
  this.parseJWTToken = function(token) {
    if (!token) {
      throw new Error("token not specified");
    }

    // Decode the data, it will be in the format header.payload.signature
    var decodedToken = decodeURIComponent(token);
    if (!decodedToken) {
      throw new Error("Failed to decode token from token len="+token.length);
    }

    // We only need the payload.
    var payload = decodedToken.split('.')[1];
    if (!payload) {
      throw new Error("Failed to find payload in decoded token len="+decodedToken.length);
    }
    // Convert from base64 to readable text into an object.
    return JSON.parse(window.atob(payload));
  };
}

//****************************************************************************
