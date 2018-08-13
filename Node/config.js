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

module.exports = {
  // This domain is a string known to the BBM Enterprise server, which is
  // generally a GUID.
  id_provider_domain: '93a3cf1c-020e-471e-ab85-deeba8a42b00',

  // The environment of your BBM Enterprise server. Must be either 'Sandbox' or
  // 'Production'.
  id_provider_environment: 'Sandbox',

  // Configuration information for firebase, to use for key storage.
  firebaseConfig: {
    apiKey: "AIzaSyDOH3eLgNoEYDskmlwUpMRgkpweAf0IBnY",
    authDomain: "sparkhackathon.firebaseapp.com",
    databaseURL: "https://sparkhackathon.firebaseio.com",
    projectId: "sparkhackathon",
    storageBucket: "sparkhackathon.appspot.com",
    messagingSenderId: "757672568611"
  },

  // Configuration information for a botlibre account. botlibre provides chatbot
  // services.
  botLibre: {
    application: 'your_botlibre_application',
    instance: 'your_botlibre_instance'
  },

  // Configuration information for login to a google service account.
  googleConfig: {
    "type": "service_account",
    "project_id": "generated-media-191120",
    "private_key_id": "286cd7965118e44c3febab3c78b671b57186634a",
    "private_key":  "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC4XUWfm0JcztZH\ncriRR5VFGkRoQMK16+/6ynUtv6mgEF9NhyJYnx9RaXlFABX3dJQj8NPYT6WDQwvH\n7YAg4goSycDjo8MH6/97Pw/ciHojKeKPQbjJjU4QIvK2XFGyTNbEoXY+0a9L9YZO\nxbhMB01TI4+oAjJu6r0TluS7EgN6/DIkZIfjlymMirGg67tDb7qjPZHIkGiBI7H2\n02DWeIHnMhKCJe50+CDoMNnil4qSd4auOBL/tUI7rA4smooiyZSwAWjwp6k2Mhk+\nBzzrDUFSpw9ZK0rPEzojlCK2YA3HyQkEZG/78CYW4br6AnrS2hXIsQBH6NG/oAED\na9zcVInHAgMBAAECggEALlfz2m0Sv3WW05r43jwaP6acr4An8cb/KhGeZwOYxg2X\nh0uCzLgjDTnwK/Ibk3qQioBNIEDVICvIWFdRL/LiCVsBy7csnV8rd3WgrRT5bsFm\nnBAvPSryBohibojCWImMKx1TNfNLl1J+kmqNKz9ippV31QnIV61WHgh+MrASg+VW\nnI0kxrLQW4RxO0mEtFV20wmmldq7cpe0FKdL9blUVlbMRmyi2RU63R9uk8luSzUs\nWID8AOMiKO0jboCD+kjO+O6wSvsWAEfhy5eTAqXUqymNKlcpjxe+K+5Jg7eaBM8o\nExLGrfWxtGNxakawItLQwwefDi3wJhiyJ86Y39V3sQKBgQD/7Yxa8u4elzf2LdGx\n5iBgxOQrZMrDH6gKQ2+Ww3ni00u1dBNzT6JSgcCaDllk4nfgx3EZRbq5iVratTNT\nuczXtdP2akCuaHAdnFrMutlmIH60TJ8SDUu2MYRW3CZKixo+pMuE55w6ONX6wrc6\nokvxna+pvmyhQy0nOJB5UwAEvQKBgQC4apBsh94MMkHYM8Af1kyJMcopU58WZUG+\ncfpEA29YULxFyeaznwpYuoDZrwJ5R+QuUD1ZPC7i4z8zWQIqlmm2tAlwQuhg6LSO\nNabdnW7i61MVppJQlz4gF8jpwCnyiIduMFACmFDRkrEgcRmMb0odfQR5yLdMDYtu\nOB66HdpK0wKBgCfe+DjLE/HMGTnPFZYjhfPNeMaR40zWx7UhoGbaeUivJmJUfRs/\n0sgL0tetWJvw9EAeki4fwOFa1r6v8BkhHxqUBzuifgUt3Bmg3Dx895WDhnnMXhPP\n4nW17SojDgwa87HCtroz4xDm/d8dKrKFylMP/+fv9LiC4Kv1kfx0w9H5AoGAJ/MF\nyE0CgBffBavoQb1VpR7BEYTI4LwcqtncAiHQXAxZTLD5Jg4c2q3EPePYoFc/ifzd\n3VfZPFNIHKJ6gqlEy0xjAwurdVrTyj67ICT7oXKi8/y6k3TAA4nDf0eejqie1fLn\nUjiWwV+KuWFmzHJLVun/LzaY5oPEoaLMnTrcT/sCgYAflR582k7xGxVLj0sgPEC8\nHIJUguoltUv5uvCqi1MmLcQPaibmKiRuEVTx+QbVRuSnYuPRl8VwKiTAsBkxWkDi\n+lLIZ8Jgh2atrnke50yp/6RQoQdMY2G9JFzBoeowIWNdcu2rgTtUdT6L9NiTCcc7\n5uHOc4SrJBpmLfrX4WmZjw==\n-----END PRIVATE KEY-----\n",
    "client_email": "djoksimovic@generated-media-191120.iam.gserviceaccount.com",
    "client_id": "108160326438024734116",
    "auth_uri": "https://www.googleapis.com/oauth2/v2/userinfo",
    "token_uri": "https://www.googleapis.com/oauth2/v3/tokeninfo"
  },

  // A password to use to protect keys.
  password: 'BlackBerry123'
};
