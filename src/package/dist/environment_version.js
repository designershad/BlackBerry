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
module.exports=function(r){var t={};function e(n){if(t[n])return t[n].exports;var o=t[n]={i:n,l:!1,exports:{}};return r[n].call(o.exports,o,o.exports,e),o.l=!0,o.exports}return e.m=r,e.c=t,e.d=function(r,t,n){e.o(r,t)||Object.defineProperty(r,t,{configurable:!1,enumerable:!0,get:n})},e.n=function(r){var t=r&&r.__esModule?function(){return r.default}:function(){return r};return e.d(t,"a",t),t},e.o=function(r,t){return Object.prototype.hasOwnProperty.call(r,t)},e.p="",e(e.s=140)}({140:function(r,t,e){"use strict";var n=e(141);function o(r){const t=r.startsWith("v")||r.startsWith("V")?1:0,e=/\d/;let n=0,o=!0,s=t;for(;s<r.length;++s){const t=r[s];if(e.test(t))o=!1;else{if("."!==t)break;if(o)break;if(++n>=4)break;o=!0}}if(o&&s>t&&(--s,--n),t===s)return"0.0.0.0";const i=r.substring(t,s);if(n>=3)return i;const u=new Array(3-n);return i.concat(...u.fill(".0"))}r.exports={normalizeVersion:o,osVersion:o(n.version)}},141:function(r,t){r.exports=require("process")}});