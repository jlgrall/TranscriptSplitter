/* This file contains various JavaScript libraries */

(function($, undefined) {
"use strict";
	
/*! jQuery.gup (Get URL Parameters) v0.5 - Jean-Louis Grall - MIT License - https://... */

// Returns the parameters of an URL. Returns undefined if the parameter key is not found:
// Improved upon http://www.netlobo.com/comments/url_query_string_javascript and http://simonwillison.net/2006/Jan/20/escape/
$.gup = function(key, asArray, url) {	// optionally return an array of all matchs, optionally pass an URL to parse
	if(asArray !== true && asArray !== false) {	// asArray is optionnal
		url = asArray;
		asArray = false;
	}
	if(url === undefined) url = location.search;	// '===' is to distinguish from the case of url = ""
	else {		// compute the url.search by hand:
		var start = url.indexOf('?'),
			end = url.indexOf('#', start + 1);
		if(start === -1) return res;
		url = url.substring(start, end !== -1 ? end : url.length);
	}
	var res = asArray ? [] : undefined;
	if(url.length > 1) {	// Need at least 2 characters: "?a"
		key = key.replace(/[\[\]{}()|+\-*\\.,?\^$]/g, "\\$&");	// Escape characters for the next Regex (especially '[' and ']' are needed for array extraction)
		var valueRegex = new RegExp("[?&]" + key + "(=([^&]*)|&|$)", "g"),//"=([^&]*)"
			match,
			value;
		while((match = valueRegex.exec(url)) !== null) {	// Because value can be an empty string
			value = match[2] === undefined ? "" : decodeURIComponent(match[2].replace(/\+/g, ' '));	// decodeURIComponent doesn't recognize '+' as encoding for space
			if(asArray) res.push(value);
			else res = value;
		}
	}
	return res;
};



/* https://github.com/nbubna/store */
/*! store2 - v2.3.2 - 2015-10-27
* Copyright (c) 2015 Nathan Bubna; Licensed MIT, GPL */

!function(a,b){var c={version:"2.3.2",areas:{},apis:{},inherit:function(a,b){for(var c in a)b.hasOwnProperty(c)||(b[c]=a[c]);return b},stringify:function(a){return void 0===a||"function"==typeof a?a+"":JSON.stringify(a)},parse:function(a){try{return JSON.parse(a)}catch(b){return a}},fn:function(a,b){c.storeAPI[a]=b;for(var d in c.apis)c.apis[d][a]=b},get:function(a,b){return a.getItem(b)},set:function(a,b,c){a.setItem(b,c)},remove:function(a,b){a.removeItem(b)},key:function(a,b){return a.key(b)},length:function(a){return a.length},clear:function(a){a.clear()},Store:function(a,b,d){var e=c.inherit(c.storeAPI,function(a,b,c){return 0===arguments.length?e.getAll():void 0!==b?e.set(a,b,c):"string"==typeof a||"number"==typeof a?e.get(a):a?e.setAll(a,b):e.clear()});e._id=a;try{var f="_safariPrivate_";b.setItem(f,"sucks"),e._area=b,b.removeItem(f)}catch(g){}return e._area||(e._area=c.inherit(c.storageAPI,{items:{},name:"fake"})),e._ns=d||"",c.areas[a]||(c.areas[a]=e._area),c.apis[e._ns+e._id]||(c.apis[e._ns+e._id]=e),e},storeAPI:{area:function(a,b){var d=this[a];return d&&d.area||(d=c.Store(a,b,this._ns),this[a]||(this[a]=d)),d},namespace:function(a,b){if(!a)return this._ns?this._ns.substring(0,this._ns.length-1):"";var d=a,e=this[d];return e&&e.namespace||(e=c.Store(this._id,this._area,this._ns+d+"."),this[d]||(this[d]=e),b||e.area("session",c.areas.session)),e},isFake:function(){return"fake"===this._area.name},toString:function(){return"store"+(this._ns?"."+this.namespace():"")+"["+this._id+"]"},has:function(a){return this._area.has?this._area.has(this._in(a)):!!(this._in(a)in this._area)},size:function(){return this.keys().length},each:function(a,b){for(var d=0,e=c.length(this._area);e>d;d++){var f=this._out(c.key(this._area,d));if(void 0!==f&&a.call(this,f,b||this.get(f))===!1)break;e>c.length(this._area)&&(e--,d--)}return b||this},keys:function(){return this.each(function(a,b){b.push(a)},[])},get:function(a,b){var d=c.get(this._area,this._in(a));return null!==d?c.parse(d):b||d},getAll:function(){return this.each(function(a,b){b[a]=this.get(a)},{})},set:function(a,b,d){var e=this.get(a);return null!=e&&d===!1?b:c.set(this._area,this._in(a),c.stringify(b),d)||e},setAll:function(a,b){var c,d;for(var e in a)d=a[e],this.set(e,d,b)!==d&&(c=!0);return c},remove:function(a){var b=this.get(a);return c.remove(this._area,this._in(a)),b},clear:function(){return this._ns?this.each(function(a){c.remove(this._area,this._in(a))},1):c.clear(this._area),this},clearAll:function(){var a=this._area;for(var b in c.areas)c.areas.hasOwnProperty(b)&&(this._area=c.areas[b],this.clear());return this._area=a,this},_in:function(a){return"string"!=typeof a&&(a=c.stringify(a)),this._ns?this._ns+a:a},_out:function(a){return this._ns?a&&0===a.indexOf(this._ns)?a.substring(this._ns.length):void 0:a}},storageAPI:{length:0,has:function(a){return this.items.hasOwnProperty(a)},key:function(a){var b=0;for(var c in this.items)if(this.has(c)&&a===b++)return c},setItem:function(a,b){this.has(a)||this.length++,this.items[a]=b},removeItem:function(a){this.has(a)&&(delete this.items[a],this.length--)},getItem:function(a){return this.has(a)?this.items[a]:null},clear:function(){for(var a in this.list)this.removeItem(a)},toString:function(){return this.length+" items in "+this.name+"Storage"}}};a.store&&(c.conflict=a.store);var d=c.Store("local",function(){try{return localStorage}catch(a){}}());d.local=d,d._=c,d.area("session",function(){try{return sessionStorage}catch(a){}}()),a.store=d,"function"==typeof b&&void 0!==b.amd?b(function(){return d}):"undefined"!=typeof module&&module.exports&&(module.exports=d)}(this,this.define);



// Project: https://github.com/thephuse/vanilla-modal
/**
 * @name vanilla-modal
 * @version 1.2.6
 * @author Ben Ceglowski
 * @url http://phuse.ca
 * @date 2015-12-10
 * @license MIT
 */;"use strict";!function(a,b){if("function"==typeof define&&define.amd)define(["exports"],b);else if("undefined"!=typeof exports)b(exports);else{var c={exports:{}};b(c.exports),a.vanillaModal=c.exports}}(this,function(a){function b(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(a,"__esModule",{value:!0});var c=function(){function a(a,b){for(var c=0;c<b.length;c++){var d=b[c];d.enumerable=d.enumerable||!1,d.configurable=!0,"value"in d&&(d.writable=!0),Object.defineProperty(a,d.key,d)}}return function(b,c,d){return c&&a(b.prototype,c),d&&a(b,d),b}}();a.VanillaModal=function(){function a(c){b(this,a),this.$$={modal:".modal",modalInner:".modal-inner",modalContent:".modal-content",open:'[rel="modal:open"]',close:'[rel="modal:close"]',page:"body","class":"modal-visible",loadClass:"vanilla-modal",clickOutside:!0,closeKeys:[27],transitions:!0,transitionEnd:null,onBeforeOpen:null,onBeforeClose:null,onOpen:null,onClose:null},this._applyUserSettings(c),this.error=!1,this.isOpen=!1,this.current=null,this.open=this._open.bind(this),this.close=this._close.bind(this),this.$$.transitionEnd=this._transitionEndVendorSniff(),this.$=this._setupDomNodes(),this.error?console.error("Please fix errors before proceeding."):(this._addLoadedCssClass(),this._events().add())}return c(a,[{key:"_applyUserSettings",value:function(a){if("object"==typeof a)for(var b in a)a.hasOwnProperty(b)&&(this.$$[b]=a[b])}},{key:"_transitionEndVendorSniff",value:function(){if(this.$$.transitions!==!1){var a=document.createElement("div"),b={transition:"transitionend",OTransition:"otransitionend",MozTransition:"transitionend",WebkitTransition:"webkitTransitionEnd"};for(var c in b)if(b.hasOwnProperty(c)&&void 0!==a.style[c])return b[c]}}},{key:"_getNode",value:function(a,b){var c=b||document,d=c.querySelector(a);return d?d:(this.error=!0,console.error(a+" not found in document."))}},{key:"_setupDomNodes",value:function(){var a={};return a.modal=this._getNode(this.$$.modal),a.page=this._getNode(this.$$.page),a.modalInner=this._getNode(this.$$.modalInner,this.modal),a.modalContent=this._getNode(this.$$.modalContent,this.modal),a}},{key:"_addLoadedCssClass",value:function(){this._addClass(this.$.page,this.$$.loadClass)}},{key:"_addClass",value:function(a,b){if(a instanceof HTMLElement!=!1){var c=a.className.split(" ");-1===c.indexOf(b)&&c.push(b),a.className=c.join(" ")}}},{key:"_removeClass",value:function(a,b){if(a instanceof HTMLElement!=!1){var c=a.className.split(" ");c.indexOf(b)>-1&&c.splice(c.indexOf(b),1),a.className=c.join(" ")}}},{key:"_setOpenId",value:function(){var a=this.current.id||"anonymous";this.$.page.setAttribute("data-current-modal",a)}},{key:"_removeOpenId",value:function(){this.$.page.removeAttribute("data-current-modal")}},{key:"_getElementContext",value:function(a){return a&&"string"==typeof a.hash?document.querySelector(a.hash):"string"==typeof a?document.querySelector(a):console.error("No selector supplied to open()")}},{key:"_open",value:function(a,b){return this._releaseNode(),this.current=this._getElementContext(a),this.current instanceof HTMLElement==!1?console.error("VanillaModal target must exist on page."):("function"==typeof this.$$.onBeforeOpen&&this.$$.onBeforeOpen.call(this,b),this._captureNode(),this._addClass(this.$.page,this.$$["class"]),this._setOpenId(),this.isOpen=!0,void("function"==typeof this.$$.onOpen&&this.$$.onOpen.call(this,b)))}},{key:"_detectTransition",value:function(){var a=window.getComputedStyle(this.$.modal,null),b=["transitionDuration","oTransitionDuration","MozTransitionDuration","webkitTransitionDuration"],c=b.filter(function(b){return"string"==typeof a[b]&&parseFloat(a[b])>0?!0:void 0});return c.length?!0:!1}},{key:"_close",value:function(a){if(this.isOpen===!0){this.isOpen=!1,"function"==typeof this.$$.onBeforeClose&&this.$$.onBeforeClose.call(this,a),this._removeClass(this.$.page,this.$$["class"]);var b=this._detectTransition();this.$$.transitions&&this.$$.transitionEnd&&b?this._closeModalWithTransition(a):this._closeModal(a)}}},{key:"_closeModal",value:function(a){this._removeOpenId(this.$.page),this._releaseNode(),this.isOpen=!1,this.current=null,"function"==typeof this.$$.onClose&&this.$$.onClose.call(this,a)}},{key:"_closeModalWithTransition",value:function(a){var b=function(){this.$.modal.removeEventListener(this.$$.transitionEnd,b),this._closeModal(a)}.bind(this);this.$.modal.addEventListener(this.$$.transitionEnd,b)}},{key:"_captureNode",value:function(){if(this.current)for(;this.current.childNodes.length>0;)this.$.modalContent.appendChild(this.current.childNodes[0])}},{key:"_releaseNode",value:function(){if(this.current)for(;this.$.modalContent.childNodes.length>0;)this.current.appendChild(this.$.modalContent.childNodes[0])}},{key:"_closeKeyHandler",value:function(a){"[object Array]"===Object.prototype.toString.call(this.$$.closeKeys)&&0!==this.$$.closeKeys.length&&this.$$.closeKeys.indexOf(a.which)>-1&&this.isOpen===!0&&(a.preventDefault(),this.close(a))}},{key:"_outsideClickHandler",value:function(a){if(this.$$.clickOutside===!0){for(var b=a.target;b&&b!=document.body;){if(b===this.$.modalInner)return;b=b.parentNode}this.close(a)}}},{key:"_matches",value:function(a,b){for(var c=a.target,d=(c.document||c.ownerDocument).querySelectorAll(b),e=0;e<d.length;e++)for(var f=c;f&&f!==document.body;){if(f===d[e])return f;f=f.parentNode}return null}},{key:"_delegateOpen",value:function(a){var b=this._matches(a,this.$$.open);return b?(a.preventDefault(),a.delegateTarget=b,this.open(b,a)):void 0}},{key:"_delegateClose",value:function(a){return this._matches(a,this.$$.close)?(a.preventDefault(),this.close(a)):void 0}},{key:"_events",value:function(){var a=this._closeKeyHandler.bind(this),b=this._outsideClickHandler.bind(this),c=this._delegateOpen.bind(this),d=this._delegateClose.bind(this),e=function(){this.$.modal.addEventListener("click",b,!1),document.addEventListener("keydown",a,!1),document.addEventListener("click",c,!1),document.addEventListener("click",d,!1)};return this.destroy=function(){this.close(),this.$.modal.removeEventListener("click",b),document.removeEventListener("keydown",a),document.removeEventListener("click",c),document.removeEventListener("click",d)},{add:e.bind(this)}}}]),a}()});

// Then I need to simulate the CommonJS import:
this.VanillaModal = this.vanillaModal.VanillaModal;


}).call(window, $);