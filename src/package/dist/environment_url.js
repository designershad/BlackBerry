/*!
 * Copyright (c) 2018 BlackBerry.  All Rights Reserved.
 * 
 * You must obtain a license from and pay any applicable license fees to
 * BlackBerry before you may reproduce, modify or distribute this software, or
 * any work that includes all or part of this software.
 * 
 * The BBM Enterprise SDK includes third party code.  For third party licenses
 * see: THIRDPARTY_LICENSES.txt.
 * 
 */
/*! v1.2.0-rc16 */
module.exports=function(r){var e={};function n(t){if(e[t])return e[t].exports;var o=e[t]={i:t,l:!1,exports:{}};return r[t].call(o.exports,o,o.exports,n),o.l=!0,o.exports}return n.m=r,n.c=e,n.d=function(r,e,t){n.o(r,e)||Object.defineProperty(r,e,{configurable:!1,enumerable:!0,get:t})},n.n=function(r){var e=r&&r.__esModule?function(){return r.default}:function(){return r};return n.d(e,"a",e),e},n.o=function(r,e){return Object.prototype.hasOwnProperty.call(r,e)},n.p="",n(n.s=138)}({138:function(r,e,n){"use strict";var t,o=n(139);t=o.URL?function(r){return new o.URL(r)}:function(r){var e=o.parse(r);return Object.keys(e).forEach(function(r){null===e[r]&&(e[r]="")}),e},r.exports=t},139:function(r,e){r.exports=require("url")}});