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
    "private_key_id": "1cc55efb28238529792be3366596325aba623438",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC6Y7fZKRKeczIM\nbKg2mHa4zRYkymqEdCGNAvGIzVNXTKCW7bRc9KxfzmstXA6SRLJhGeEJDI+OjG4b\nBua5PaTl9HBIRk4nv2XtnnddKSfmlCLzLgC9Rgvz7coweqH3WDUjVAFVa+p+1YhT\n2CO0W7m+Db9/giaI0qlymhucbFPVSLKuhlKJCb0nOBmQr6xiMK7UVB1YEwMmwY+c\nxeOOtzVGGDucUsy85zfFhM+VuwmeMIPUkKi68h7WkGDpxS6rhoBoSLLJDlClu4Ii\nQWI5NuS/NSdBM5CiQizuu42F4BMc4h0ieBxKzLiQuBHBIgO4AQSdiLhIgJaGXpxV\nmnTkeiITAgMBAAECggEANOopYAPajtQ6Ua+pQ7KeBdHnZvN2MPs9KSi8RG+yKNcO\nwjpimX82zo4t/Dclxd2t3IY5zlVcDgaNHawkZVN8VHJETCh1eLBMMhzqWy7bbokA\nsRQOzq0rqIkJ/SBbifpnP4vSQxt7e52IcfErFcFypmOFyZ+7690OkQPyMcLJPAPG\n1oEFyIRC99tQgMO4ld9YQhPUYTnpP9lsqIWuPciTnCsWB2GaLm5650iqQE9xWYx7\nw0BD0SPLhgpnRaotPgciIanAttYTzfjq0QdhH21cC/sHdgSU2Zx4cp7cwhoUjGHl\n9vxmpKUF+sIH3Kh0yaphlpHfBtbEBA/bXtI92DloIQKBgQDlLSKGw7YR9MpDOAEc\nJA1n8Ul7ZZw4uZARwAv8DYVCw5zFL+rndDXu4hjAUxBo3b2k6QNaHINIzaMYnFOc\nS6V66LYEffZikKpLXTxRZKVBMRJlaBwi+zdOXkYH6mRpreW3OBZjFBCNsACLHndy\n/dRrYY8cHYKhy6s5M4AFim5/8wKBgQDQNI1y0qNumV2sBYDe4hTpCsqJAChQgg6Z\nB+Q8/7/bJljJSGjWWQJIEqu8zQOrZQ3rvZooTOLxOcRLvArMI/OmRADcVn0196rT\nlDu1gVMvefosvK9JE9OXHhR8UDp3xsdBL76cegsoiOsPXBVMK2QQ5LFpzIJfDOMg\nVf0CHdZ9YQKBgQCMnu5BjNMqH28AYdvkfYawUdCJ4+ZAtDPfgFyaM12igs6t++IC\nVT9GrfsL/6vg/LaB+uwwnbA8utkpn7p5+7y1NxeAmB3XivbDOZlqQ/xWjRrBmGkz\nWbws3RHRh5RHeAmtK8Ao2UXy+pzKwE4BBBkULo+Wa9EdIBCXD6+tNqzo2wKBgBR6\ndscqbKS+NPZsfCZv+jqJsy4Sc+SnRiRLIGnXhdlaRjVWB+m9S3onS/j/+TJseBgN\nyBHarh+n3OTOFAnMJ3TdD3CcmSgrugOhetX5aGMtDixESsFXT+J3NPCdO4L4bDS/\nK3Jclqhf/y69keKyCd+XftO3J8ONkvFlQ8Nnh+dBAoGARTSo6nP4uDHjwHnyxUCN\nX67EVKTk+fT9gUfGxvGEaLtucq87POFHqO17GT6eJg2/QOw+SMBkjERlR41H9mxh\ntmH0h7q6QGKguUcs9f/Wtz5euqMLP/doQr+xTiHrWH/vs62VvQEDlI4/PSKIuWWn\nS8Xc7lyxJnvmzX6o3uaVm4E=\n-----END PRIVATE KEY-----\n",
    "client_email": "bbmbot@generated-media-191120.iam.gserviceaccount.com",
    "client_id": "108236042363311481339",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/bbmbot%40generated-media-191120.iam.gserviceaccount.com"
  },

  // A password to use to protect keys.
  password: 'BlackBerry123'
};
