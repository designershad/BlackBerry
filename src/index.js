/*
 * Copyright (c) 2018 BlackBerry.  All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

const BBMEnterprise = require('bbm-enterprise');


// Initialize the SDK.
const bbmeSdk = new BBMEnterprise({
    // The domain that was provided to you when you registered to use the SDK.
    // This will be of the form XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX. where each
    // X is a lowercase character or number.
    domain: 'domain',

    // It is recommended that you do your development and integration testing in
    // the Spark sandbox environment.
    environment: 'Sandbox',

    // This is the identity of the user to log in as, as provided by the
    // identity provider module.
    userId: 'identifier',

    // This function will be called as needed by the SDK to retrieve an
    // authentication token.  When a token is needed, this function should fetch
    // a new one.  The SDK will request a token once on startup, but will not
    // request again after that until the current token becomes invalid.  The
    // function should not perform caching of the token.
    getToken: () => {
        // Request a new authentication token from your identity provider and
        // return a promise that will be resolved with the fetched token or
        // rejected with an error.
    },

    // This function must be undefined to use the BlackBerry Key Management
    // Service (KMS) as your key storage solution.
    //
    // To use a custom Cloud Key Storage solution, this function must be
    // defined.
    getKeyProvider: function() {
        // Return a promise that will resolve to an object that implements the
        // interface defined by BBMEnterprise.KeyProviderInterface.
    },

    // A description of the client. This will be used to describe this endpoint
    // when using endpoint management functionality. This should never be empty.
    // The description can be a maximum of 2000 Unicode Code Points.
    description: 'node ' + process.version,

    // A friendly name in addition to the description.  The nickname is optional
    // and should be set by a user, if desired.
    nickname: 'My node client',

    // To customize how chat messages are stored, an application may configure a
    // custom storage factory function which must return an object that
    // implements the interface defined by BBMEnterprise.MessageStorageInterface.
    //
    // The Spark SDK for JavaScript provides a few objects in the
    // BBMEnterprise.Storage namespace that already conform to the required
    // interface.  The objects will help you get started with customizing the
    // chat message storage.
    //
    // * BBMEnterprise.Storage.Immutable: This is the default factory.  It is
    //   ideal for clients that want to receive messages in an immutable list.
    //   Changes to the list must be calculated against a previous instance of
    //   the list.
    //
    // * BBMEnterprise.Storage.SpliceWatcher: This factory is ideal for clients
    //   that want to be notified about what has changed through a series of
    //   'splice' events.
    messageStorageFactory: BBMEnterprise.StorageFactory.SpliceWatcher
});