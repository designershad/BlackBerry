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
  id_provider_domain: '53cc1df0-469b-4438-9a1f-02d287902608',

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
    application: '3805035149723375663',
    instance: '23162728'
  },

  // Configuration information for login to a google service account.
  googleConfig: {
    "type": "service_account",
    "project_id": "generated-media-191120",
    "private_key_id": "9becc97ad67edf0d724a658e84f9eae34342a90f",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDSJNDXH+TmfAyn\nTmV9MHLoLc8FqPq2xXKxxgxS6mDRsMehNWRY3tbskegm/dX4ztLnXaw9ljEcU/ZF\nnvDBSXr0hSvdNLsV6P6RPV2YGzyAIwjHiDhRL+3UUPX0Wcr9/uzyNuzGWABvt7HG\ndDIDDsCcFap0WKDSrSncflFCaDJPL1AAZ7Pi2lkT4ucAq2afWN9LM27nmMqGdtN2\nQQ81u2zR7z5YRvwroMOhi1nRrAORtKitCrrjbfc3BGgL8PmXxmgahB6zSA6y7MdY\nDVvaoRedVQ46PzjYQNIHc7HVUQwBc5/Ff7MX9PqjzKSGJg2tHTn2PfOsahY7qcPH\n0hcTMIQJAgMBAAECggEAKjuR6RoU06lslZcw2FcLUNQb/gQ21tKZuVaXFXbbHGlN\nxX1IfH/Ua9jq8iMjhIx0YGE4A2yS1CGfpeBKfF37Ivc8mIlHbCDWQHQ3wiD/KLVh\nx0/+GXrrbjcTJxeAr0kzb35QWZBIDiu5w6uIfYrSdMv55MYHFDAO8KxGQnVUXwtC\ntyNpb4rKtlM4bpykkLOuyTyt6E52ISTgo0JgsDosaKGZD/C1ZDCTCWHRcCghB6X9\nKbx+tFEmIdy1y6onsy1TQXFQirzUs8ZUl0g4sqxO6Mh34GKeTK+KZuckkVL1lU/C\n4dg2BhRSbsue7tHVCn3tHPVUJ07SMPATzl40uTJRzQKBgQD3zJy+Qd+1nUY+CBSq\ncuvs5/VMr4p4S1rptMM+JlsJp3i20Si8mVvKUUdWq+0c0TIFl/aC4tzNaiuzUCoj\nQw+Ek1MO5KywjG96VuN99hq4UczLqVWL/nYpLaaR1pND/Iy7R9zBkjYCac+9K/h4\nIQAK0w4xjBnj1QI2EuNpzal/IwKBgQDZGS57vhc5kfrkwuw7v7smf7VV9ac4hh1p\n+ghIxywNM48pXcLttMohQbXgKXdt4T3B2xsrI4lSU0r2EnwJtwZCdg6P38MgaGYC\nM1BQFcH+FzOUyTESdag8TtaP4fv6+gyxaz9kO1rwUELhg0CTk/KWMVjnS9AegKfP\nqoOZPniY4wKBgQDo7LFNeZgyG+Lh/jCGw72Wk7cVXVA4oQSU97Aq5Fzgp0Yl+ldj\naHhKpbn782HPm6h8b4ptH5hTkf//7lOdj7Svdtg1AKh+z5MeGTx/s20MYv+xVLuv\n+wHQ1TNklKEa3/LdO8B7R9dyz0lRVVqaeNKUWi1WT44qhZgtgfW4B3TSpwKBgD0Z\n3kBLfuPgFxn9Vll2m+i49sNrsRWygWLLUTuSeu54PWmqDuux/1We1d5yLT/KrgP6\nc8oPZV27PZTGHQzq6yMXcP/DPXrIhzVFVexEQ2YNB6JvgZUtch0PH0o9kxrO93WT\ntrKyFeUe4cPwmeMvN45X8yqd5sQ+93v2BLXDpFN7AoGBAIyZ05xXdcGbpD6RZpSH\ne/Stw1FE5V7yNL2t1lMnUev9j/gQDQj/cl8U9IT/g/4twG8Gyy0WN2hu6ZqkRyx2\nz1b0kUOFUoY1X2Dct+skR/q2N58jz/VTvRkhfRsb2K6jDDbWkRLs9UJPNyB46ZIa\nPu+2x6Xgx6phlqT8NTri6hIM\n-----END PRIVATE KEY-----\n",
    "client_email": "bbmbot@generated-media-191120.iam.gserviceaccount.com",
    "client_id": "108236042363311481339",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/bbmbot%40generated-media-191120.iam.gserviceaccount.com"
  },

  // A password to use to protect keys.
  // password: 'BlackBerry123'
};
