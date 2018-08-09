//****************************************************************************
// Copyright 2018 BlackBerry.  All Rights Reserved.
//
// You must obtain a license from and pay any applicable license fees to
// BlackBerry before you may reproduce, modify or distribute this software, or
// any work that includes all or part of this software.
//

'use strict';

// Refer to the guide to set up your application to use Azure:
// https://developer.blackberry.com/files/bbm-enterprise/documents/guide/html/azureForWebExamples.html

// This domain is a string known to the BBM Enterprise server, which is
// generally a GUID.
// To create a new domain follow the link below
// https://account.good.com/#/a/organization/applications/add
const ID_PROVIDER_DOMAIN = 'your_idp_domain';

// The client ID of application registered on OAuth 2.0 server.
// To set up your application refer to
// https://developer.blackberry.com/files/bbm-enterprise/documents/guide/html/azureIdentityManagement.html
const CLIENT_ID = 'your_client_id';

// The tenant ID of your organization.
// To get your tenant ID refer to
// https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-howto-tenant
const TENANT_ID = 'your_tenant_id';

// =============================================================================
// Configuration below does not require modifications. Change it only if you
// want to change existing application behavior.

// The environment of your BBM Enterprise server. Must be either 'Sandbox' or
// 'Production'.
const ID_PROVIDER_ENVIRONMENT = 'Sandbox';

// The URL or relative path of the Argon2 WASM file.
const KMS_ARGON_WASM_URL = '../../sdk/argon2.wasm';

// See Support.Auth.GenericAuthHelper.JWTConfig for structure of this object.
const AUTH_CONFIGURATION = {
  type: 'JWT',

  // OAuth 2.0 endpoint for requesting an access token.
  authService: `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/authorize`,

  // The client ID of application registered on OAuth 2.0 server
  clientId: CLIENT_ID,

  // Redirect URL same as registered on OAuth 2.0 server. Required by OAuth 2.0
  // server to redirect application after issuing an access token.
  redirectUri : 'oAuthCallback.html',

  // Scopes of OAuth 2.0 access token (which resources it can access)
  scope: `api://${CLIENT_ID}/Messaging.All`
};

// Create the auth manager for the Rich Chat app.
const createAuthManager = () => {
  // Create a copy of the auth config for Azure auth so we can change it.
  const userMgtAuthConfig = Object.assign({}, AUTH_CONFIGURATION);
  // Change the scope so instead of specifying the BBM Enterprise SDK permission
  // it has the permissions required to access AD from Microsoft Graph API.
  userMgtAuthConfig.scope = 'https://graph.microsoft.com/User.ReadWrite '
                          + 'https://graph.microsoft.com/User.ReadBasic.All';
  return new AzureAuthManager(AUTH_CONFIGURATION, userMgtAuthConfig);
};

// Create the user manager for the Rich Chat app.
const createUserManager = (userRegId, authManager, getIdentity, getIdentities) =>
  Promise.resolve(new AzureUserManager(userRegId, authManager, getIdentities));
