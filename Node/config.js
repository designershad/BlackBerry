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
    application: '3805035149723375663',
    instance: '23162728'
  },

  // Configuration information for login to a google service account.
  googleConfig: {
    "type": "service_account",
    "project_id": "generated-media-191120",
    "private_key_id": "dc7048551e6e206c526a248c40fe685f7623643c",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDhZBIe3kw8Bi71\n1ip3N36uK5CCDYFlWND68v8NhEdPp2Vd/4vPpqFowVbOO2CvjiBWI4mA0BY4Wc9A\nApbH7eCe6Ka41E+jTQZdPtKt15EJ1VH6C4L/OhyOp57NeE6Dc39NXfAXg98hlnwj\nV/NCx/gZfRR2sQrt7WL89eqzJxOPv1N6H0xr5mWelhdH9k9cMR3Pr8ZnUiPzY9Jh\nF5D0uD8BxqW3bWLzkFhd6hFyPQv52tr5kYBzS+9geJ8yTpPfdupJpiEVdDLU4aTj\nKNz+bVbqRhvRuB3sRDbU8k8hY265iIhdq73vCh0Ssjpmb+3AxjfLhInQxF0fAYKZ\ngOuFUI0fAgMBAAECggEAO4SLbG9TPj57xBsr15Nl9mQ2osEiPDr55Gqqg00874HK\nuMm0h77+vIThgVAYtgMX8ucrdkJ8u6Cro8GLQ3xDZnMVI5Wc+ghq99CRHarg9/HG\n1fqYOwGDbQBCZQux3/Bt22ZE8lC2aU4ttb+R0z6u+zwWXUlfE3kuPJJLycc12S0z\n2TlYUpmfnkakYc2JfExOFCF3Cy+beYCZKIA7HfFGpDbnEw8K0l9UNMOAqMW/0f3G\njfhOwqQAQc7N3m44v4NdaJjqYwuWjzZkTn4z4Dp7hVFjnJ/sGUE0VV34KFcq+3Wf\njrP4rkKt/3lu2QsoBymPziRouYyxewI1mftHs84DsQKBgQD3UhtPBiF+OGqug+6r\nXIi1tLxQpQ1to6U3lZ10vtBPibJCOer0nfGKEesBkMBDZv2KYmDJr25DGksFDyqN\nMwIS9eo3QrvXs3lniGu9LWIDPe9MmXxUeyGmkPBSbJLQrQFJLYsKKE4wnu7KKF5F\nhQ9nBmuSWK1Wnf8Ae01HGz05WwKBgQDpTPMiDeb0APwQNf4vFKqXI6BO9pC04AAg\nPK2965UWpbTl/aQSL3ue3tx0u359m91G8xk2aS0gErbDcwx9DDEyJ2kmNPkBW3+P\nUlvQOesNnlyJA5Q0wmLUGIrxk+WLSF660cIZIaiZygMwieVDfcERNe6WhPBA8F9t\nFIOstjPCjQKBgQDCPyGlumn56bOYZ5S/0Eirdk1lhYz7bMkp0/+8HtYbckmojDbG\nc3qu9429SARJrA08cDIWlgui9navfY7tIX/ihnSzfF1ud87FizcbeRZ+91kIr5Ag\nBimS2kl2Y0IYVZkp8XQ/wRJQS7O+4V/ReEV1pGw+oBlca3FJ3o3+aB14+wKBgQCU\nvKBNV7ukWHRbCXEyJuTTUr1DWmLLTfwGkWjbKjR0qdR4xIozpd4UXVUDfv2XqyUZ\ntKagT9GbHxMx7ElL99ftd77Lwv31ZZYfk4xBZot6tTmdiJCWSk+jlLoQZg/0CoGK\nbWxnhVPuKCJ8cY2ex6+s/0tK3xok7JqJ+ogwNkEtiQKBgQDNuV7wxkBFejlA+OYr\n8/u/HVMs1AdSAA3zRmtewgld1TKMrC676bfRVA35na6ru9J+8Sar4GHc87MxPi7U\nFl2UWnOH+WjaLhNBdzaaEoG2STu+mNkAE8snZLCHHDaAUprtoLRNcxqaHzH0aYNc\npYHWelq1w1DtTkWnAXCfsdQewg==\n-----END PRIVATE KEY-----\n",
    "client_email": "danilo-joksimovic@generated-media-191120.iam.gserviceaccount.com",
    "client_id": "100450212379520213231",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/danilo-joksimovic%40generated-media-191120.iam.gserviceaccount.com"
  },

  // A password to use to protect keys.
  password: 'BlackBerry123'
};
