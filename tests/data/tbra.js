/*
Copyright (c) 2009, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
version: 2.7.0
*/
/**
 * The YAHOO object is the single global object used by YUI Library.  It
 * contains utility function for setting up namespaces, inheritance, and
 * logging.  YAHOO.util, YAHOO.widget, and YAHOO.example are namespaces
 * created automatically for and used by the library.
 * @module yahoo
 * @title  YAHOO Global
 */

/**
 * YAHOO_config is not included as part of the library.  Instead it is an 
 * object that can be defined by the implementer immediately before 
 * including the YUI library.  The properties included in this object
 * will be used to configure global properties needed as soon as the 
 * library begins to load.
 * @class YAHOO_config
 * @static
 */

/**
 * A reference to a function that will be executed every time a YAHOO module
 * is loaded.  As parameter, this function will receive the version
 * information for the module. See <a href="YAHOO.env.html#getVersion">
 * YAHOO.env.getVersion</a> for the description of the version data structure.
 * @property listener
 * @type Function
 * @static
 * @default undefined
 */

/**
 * Set to true if the library will be dynamically loaded after window.onload.
 * Defaults to false 
 * @property injecting
 * @type boolean
 * @static
 * @default undefined
 */

/**
 * Instructs the yuiloader component to dynamically load yui components and
 * their dependencies.  See the yuiloader documentation for more information
 * about dynamic loading
 * @property load
 * @static
 * @default undefined
 * @see yuiloader
 */

/**
 * Forces the use of the supplied locale where applicable in the library
 * @property locale
 * @type string
 * @static
 * @default undefined
 */

if (typeof YAHOO == "undefined" || !YAHOO) {
    /**
     * The YAHOO global namespace object.  If YAHOO is already defined, the
     * existing YAHOO object will not be overwritten so that defined
     * namespaces are preserved.
     * @class YAHOO
     * @static
     */
    var YAHOO = {};
}

/**
 * Returns the namespace specified and creates it if it doesn't exist
 * <pre>
 * YAHOO.namespace("property.package");
 * YAHOO.namespace("YAHOO.property.package");
 * </pre>
 * Either of the above would create YAHOO.property, then
 * YAHOO.property.package
 *
 * Be careful when naming packages. Reserved words may work in some browsers
 * and not others. For instance, the following will fail in Safari:
 * <pre>
 * YAHOO.namespace("really.long.nested.namespace");
 * </pre>
 * This fails because "long" is a future reserved word in ECMAScript
 *
 * For implementation code that uses YUI, do not create your components
 * in the namespaces created by the library.  defined by YUI -- create 
 * your own (YAHOO.util, YAHOO.widget, YAHOO.lang, YAHOO.env)
 *
 * @method namespace
 * @static
 * @param  {String*} arguments 1-n namespaces to create 
 * @return {Object}  A reference to the last namespace object created
 */
YAHOO.namespace = function() {
    var a=arguments, o=null, i, j, d;
    for (i=0; i<a.length; i=i+1) {
        d=(""+a[i]).split(".");
        o=YAHOO;

        // YAHOO is implied, so it is ignored if it is included
        for (j=(d[0] == "YAHOO") ? 1 : 0; j<d.length; j=j+1) {
            o[d[j]]=o[d[j]] || {};
            o=o[d[j]];
        }
    }

    return o;
};

/**
 * Uses YAHOO.widget.Logger to output a log message, if the widget is
 * available.
 *
 * @method log
 * @static
 * @param  {String}  msg  The message to log.
 * @param  {String}  cat  The log category for the message.  Default
 *                        categories are "info", "warn", "error", time".
 *                        Custom categories can be used as well. (opt)
 * @param  {String}  src  The source of the the message (opt)
 * @return {Boolean}      True if the log operation was successful.
 */
YAHOO.log = function(msg, cat, src) {
    var l=YAHOO.widget.Logger;
    if(l && l.log) {
        return l.log(msg, cat, src);
    } else {
        return false;
    }
};

/**
 * Registers a module with the YAHOO object
 * @method register
 * @static
 * @param {String}   name    the name of the module (event, slider, etc)
 * @param {Function} mainClass a reference to class in the module.  This
 *                             class will be tagged with the version info
 *                             so that it will be possible to identify the
 *                             version that is in use when multiple versions
 *                             have loaded
 * @param {Object}   data      metadata object for the module.  Currently it
 *                             is expected to contain a "version" property
 *                             and a "build" property at minimum.
 */
YAHOO.register = function(name, mainClass, data) {
    var mods = YAHOO.env.modules, m, v, b, ls, i;

    if (!mods[name]) {
        mods[name] = { 
            versions:[], 
            builds:[] 
        };
    }

    m  = mods[name];
    v  = data.version;
    b  = data.build;
    ls = YAHOO.env.listeners;

    m.name = name;
    m.version = v;
    m.build = b;
    m.versions.push(v);
    m.builds.push(b);
    m.mainClass = mainClass;

    // fire the module load listeners
    for (i=0;i<ls.length;i=i+1) {
        ls[i](m);
    }
    // label the main class
    if (mainClass) {
        mainClass.VERSION = v;
        mainClass.BUILD = b;
    } else {
        YAHOO.log("mainClass is undefined for module " + name, "warn");
    }
};

/**
 * YAHOO.env is used to keep track of what is known about the YUI library and
 * the browsing environment
 * @class YAHOO.env
 * @static
 */
YAHOO.env = YAHOO.env || {

    /**
     * Keeps the version info for all YUI modules that have reported themselves
     * @property modules
     * @type Object[]
     */
    modules: [],
    
    /**
     * List of functions that should be executed every time a YUI module
     * reports itself.
     * @property listeners
     * @type Function[]
     */
    listeners: []
};

/**
 * Returns the version data for the specified module:
 *      <dl>
 *      <dt>name:</dt>      <dd>The name of the module</dd>
 *      <dt>version:</dt>   <dd>The version in use</dd>
 *      <dt>build:</dt>     <dd>The build number in use</dd>
 *      <dt>versions:</dt>  <dd>All versions that were registered</dd>
 *      <dt>builds:</dt>    <dd>All builds that were registered.</dd>
 *      <dt>mainClass:</dt> <dd>An object that was was stamped with the
 *                 current version and build. If 
 *                 mainClass.VERSION != version or mainClass.BUILD != build,
 *                 multiple versions of pieces of the library have been
 *                 loaded, potentially causing issues.</dd>
 *       </dl>
 *
 * @method getVersion
 * @static
 * @param {String}  name the name of the module (event, slider, etc)
 * @return {Object} The version info
 */
YAHOO.env.getVersion = function(name) {
    return YAHOO.env.modules[name] || null;
};

/**
 * Do not fork for a browser if it can be avoided.  Use feature detection when
 * you can.  Use the user agent as a last resort.  YAHOO.env.ua stores a version
 * number for the browser engine, 0 otherwise.  This value may or may not map
 * to the version number of the browser using the engine.  The value is 
 * presented as a float so that it can easily be used for boolean evaluation 
 * as well as for looking for a particular range of versions.  Because of this, 
 * some of the granularity of the version info may be lost (e.g., Gecko 1.8.0.9 
 * reports 1.8).
 * @class YAHOO.env.ua
 * @static
 */
YAHOO.env.ua = function() {
    var o={

        /**
         * Internet Explorer version number or 0.  Example: 6
         * @property ie
         * @type float
         */
        ie:0,

        /**
         * Opera version number or 0.  Example: 9.2
         * @property opera
         * @type float
         */
        opera:0,

        /**
         * Gecko engine revision number.  Will evaluate to 1 if Gecko 
         * is detected but the revision could not be found. Other browsers
         * will be 0.  Example: 1.8
         * <pre>
         * Firefox 1.0.0.4: 1.7.8   <-- Reports 1.7
         * Firefox 1.5.0.9: 1.8.0.9 <-- Reports 1.8
         * Firefox 2.0.0.3: 1.8.1.3 <-- Reports 1.8
         * Firefox 3 alpha: 1.9a4   <-- Reports 1.9
         * </pre>
         * @property gecko
         * @type float
         */
        gecko:0,

        /**
         * AppleWebKit version.  KHTML browsers that are not WebKit browsers 
         * will evaluate to 1, other browsers 0.  Example: 418.9.1
         * <pre>
         * Safari 1.3.2 (312.6): 312.8.1 <-- Reports 312.8 -- currently the 
         *                                   latest available for Mac OSX 10.3.
         * Safari 2.0.2:         416     <-- hasOwnProperty introduced
         * Safari 2.0.4:         418     <-- preventDefault fixed
         * Safari 2.0.4 (419.3): 418.9.1 <-- One version of Safari may run
         *                                   different versions of webkit
         * Safari 2.0.4 (419.3): 419     <-- Tiger installations that have been
         *                                   updated, but not updated
         *                                   to the latest patch.
         * Webkit 212 nightly:   522+    <-- Safari 3.0 precursor (with native SVG
         *                                   and many major issues fixed).  
         * 3.x yahoo.com, flickr:422     <-- Safari 3.x hacks the user agent
         *                                   string when hitting yahoo.com and 
         *                                   flickr.com.
         * Safari 3.0.4 (523.12):523.12  <-- First Tiger release - automatic update
         *                                   from 2.x via the 10.4.11 OS patch
         * Webkit nightly 1/2008:525+    <-- Supports DOMContentLoaded event.
         *                                   yahoo.com user agent hack removed.
         *                                   
         * </pre>
         * http://developer.apple.com/internet/safari/uamatrix.html
         * @property webkit
         * @type float
         */
        webkit: 0,

        /**
         * The mobile property will be set to a string containing any relevant
         * user agent information when a modern mobile browser is detected.
         * Currently limited to Safari on the iPhone/iPod Touch, Nokia N-series
         * devices with the WebKit-based browser, and Opera Mini.  
         * @property mobile 
         * @type string
         */
        mobile: null,

        /**
         * Adobe AIR version number or 0.  Only populated if webkit is detected.
         * Example: 1.0
         * @property air
         * @type float
         */
        air: 0,

        /**
         * Google Caja version number or 0.
         * @property caja
         * @type float
         */
        caja: 0

    },

    ua = navigator.userAgent, 
    
    m;

    // Modern KHTML browsers should qualify as Safari X-Grade
    if ((/KHTML/).test(ua)) {
        o.webkit=1;
    }
    // Modern WebKit browsers are at least X-Grade
    m=ua.match(/AppleWebKit\/([^\s]*)/);
    if (m&&m[1]) {
        o.webkit=parseFloat(m[1]);

        // Mobile browser check
        if (/ Mobile\//.test(ua)) {
            o.mobile = "Apple"; // iPhone or iPod Touch
        } else {
            m=ua.match(/NokiaN[^\/]*/);
            if (m) {
                o.mobile = m[0]; // Nokia N-series, ex: NokiaN95
            }
        }

        m=ua.match(/AdobeAIR\/([^\s]*)/);
        if (m) {
            o.air = m[0]; // Adobe AIR 1.0 or better
        }

    }

    if (!o.webkit) { // not webkit
        // @todo check Opera/8.01 (J2ME/MIDP; Opera Mini/2.0.4509/1316; fi; U; ssr)
        m=ua.match(/Opera[\s\/]([^\s]*)/);
        if (m&&m[1]) {
            o.opera=parseFloat(m[1]);
            m=ua.match(/Opera Mini[^;]*/);
            if (m) {
                o.mobile = m[0]; // ex: Opera Mini/2.0.4509/1316
            }
        } else { // not opera or webkit
            m=ua.match(/MSIE\s([^;]*)/);
            if (m&&m[1]) {
                o.ie=parseFloat(m[1]);
            } else { // not opera, webkit, or ie
                m=ua.match(/Gecko\/([^\s]*)/);
                if (m) {
                    o.gecko=1; // Gecko detected, look for revision
                    m=ua.match(/rv:([^\s\)]*)/);
                    if (m&&m[1]) {
                        o.gecko=parseFloat(m[1]);
                    }
                }
            }
        }
    }

    m=ua.match(/Caja\/([^\s]*)/);
    if (m&&m[1]) {
        o.caja=parseFloat(m[1]);
    }
    
    return o;
}();

/*
 * Initializes the global by creating the default namespaces and applying
 * any new configuration information that is detected.  This is the setup
 * for env.
 * @method init
 * @static
 * @private
 */
(function() {
    YAHOO.namespace("util", "widget", "example");
    /*global YAHOO_config*/
    if ("undefined" !== typeof YAHOO_config) {
        var l=YAHOO_config.listener,ls=YAHOO.env.listeners,unique=true,i;
        if (l) {
            // if YAHOO is loaded multiple times we need to check to see if
            // this is a new config object.  If it is, add the new component
            // load listener to the stack
            for (i=0;i<ls.length;i=i+1) {
                if (ls[i]==l) {
                    unique=false;
                    break;
                }
            }
            if (unique) {
                ls.push(l);
            }
        }
    }
})();
/**
 * Provides the language utilites and extensions used by the library
 * @class YAHOO.lang
 */
YAHOO.lang = YAHOO.lang || {};

(function() {


var L = YAHOO.lang,

    ARRAY_TOSTRING = '[object Array]',
    FUNCTION_TOSTRING = '[object Function]',
    OP = Object.prototype,

    // ADD = ["toString", "valueOf", "hasOwnProperty"],
    ADD = ["toString", "valueOf"],

    OB = {

    /**
     * Determines wheather or not the provided object is an array.
     * @method isArray
     * @param {any} o The object being testing
     * @return {boolean} the result
     */
    isArray: function(o) { 
        return OP.toString.apply(o) === ARRAY_TOSTRING;
    },

    /**
     * Determines whether or not the provided object is a boolean
     * @method isBoolean
     * @param {any} o The object being testing
     * @return {boolean} the result
     */
    isBoolean: function(o) {
        return typeof o === 'boolean';
    },
    
    /**
     * Determines whether or not the provided object is a function.
     * Note: Internet Explorer thinks certain functions are objects:
     *
     * var obj = document.createElement("object");
     * YAHOO.lang.isFunction(obj.getAttribute) // reports false in IE
     *
     * var input = document.createElement("input"); // append to body
     * YAHOO.lang.isFunction(input.focus) // reports false in IE
     *
     * You will have to implement additional tests if these functions
     * matter to you.
     *
     * @method isFunction
     * @param {any} o The object being testing
     * @return {boolean} the result
     */
    isFunction: function(o) {
        return OP.toString.apply(o) === FUNCTION_TOSTRING;
    },
        
    /**
     * Determines whether or not the provided object is null
     * @method isNull
     * @param {any} o The object being testing
     * @return {boolean} the result
     */
    isNull: function(o) {
        return o === null;
    },
        
    /**
     * Determines whether or not the provided object is a legal number
     * @method isNumber
     * @param {any} o The object being testing
     * @return {boolean} the result
     */
    isNumber: function(o) {
        return typeof o === 'number' && isFinite(o);
    },
      
    /**
     * Determines whether or not the provided object is of type object
     * or function
     * @method isObject
     * @param {any} o The object being testing
     * @return {boolean} the result
     */  
    isObject: function(o) {
return (o && (typeof o === 'object' || L.isFunction(o))) || false;
    },
        
    /**
     * Determines whether or not the provided object is a string
     * @method isString
     * @param {any} o The object being testing
     * @return {boolean} the result
     */
    isString: function(o) {
        return typeof o === 'string';
    },
        
    /**
     * Determines whether or not the provided object is undefined
     * @method isUndefined
     * @param {any} o The object being testing
     * @return {boolean} the result
     */
    isUndefined: function(o) {
        return typeof o === 'undefined';
    },
    
 
    /**
     * IE will not enumerate native functions in a derived object even if the
     * function was overridden.  This is a workaround for specific functions 
     * we care about on the Object prototype. 
     * @property _IEEnumFix
     * @param {Function} r  the object to receive the augmentation
     * @param {Function} s  the object that supplies the properties to augment
     * @static
     * @private
     */
    _IEEnumFix: (YAHOO.env.ua.ie) ? function(r, s) {
            var i, fname, f;
            for (i=0;i<ADD.length;i=i+1) {

                fname = ADD[i];
                f = s[fname];

                if (L.isFunction(f) && f!=OP[fname]) {
                    r[fname]=f;
                }
            }
    } : function(){},
       
    /**
     * Utility to set up the prototype, constructor and superclass properties to
     * support an inheritance strategy that can chain constructors and methods.
     * Static members will not be inherited.
     *
     * @method extend
     * @static
     * @param {Function} subc   the object to modify
     * @param {Function} superc the object to inherit
     * @param {Object} overrides  additional properties/methods to add to the
     *                              subclass prototype.  These will override the
     *                              matching items obtained from the superclass 
     *                              if present.
     */
    extend: function(subc, superc, overrides) {
        if (!superc||!subc) {
            throw new Error("extend failed, please check that " +
                            "all dependencies are included.");
        }
        var F = function() {}, i;
        F.prototype=superc.prototype;
        subc.prototype=new F();
        subc.prototype.constructor=subc;
        subc.superclass=superc.prototype;
        if (superc.prototype.constructor == OP.constructor) {
            superc.prototype.constructor=superc;
        }
    
        if (overrides) {
            for (i in overrides) {
                if (L.hasOwnProperty(overrides, i)) {
                    subc.prototype[i]=overrides[i];
                }
            }

            L._IEEnumFix(subc.prototype, overrides);
        }
    },
   
    /**
     * Applies all properties in the supplier to the receiver if the
     * receiver does not have these properties yet.  Optionally, one or 
     * more methods/properties can be specified (as additional 
     * parameters).  This option will overwrite the property if receiver 
     * has it already.  If true is passed as the third parameter, all 
     * properties will be applied and _will_ overwrite properties in 
     * the receiver.
     *
     * @method augmentObject
     * @static
     * @since 2.3.0
     * @param {Function} r  the object to receive the augmentation
     * @param {Function} s  the object that supplies the properties to augment
     * @param {String*|boolean}  arguments zero or more properties methods 
     *        to augment the receiver with.  If none specified, everything
     *        in the supplier will be used unless it would
     *        overwrite an existing property in the receiver. If true
     *        is specified as the third parameter, all properties will
     *        be applied and will overwrite an existing property in
     *        the receiver
     */
    augmentObject: function(r, s) {
        if (!s||!r) {
            throw new Error("Absorb failed, verify dependencies.");
        }
        var a=arguments, i, p, overrideList=a[2];
        if (overrideList && overrideList!==true) { // only absorb the specified properties
            for (i=2; i<a.length; i=i+1) {
                r[a[i]] = s[a[i]];
            }
        } else { // take everything, overwriting only if the third parameter is true
            for (p in s) { 
                if (overrideList || !(p in r)) {
                    r[p] = s[p];
                }
            }
            
            L._IEEnumFix(r, s);
        }
    },
 
    /**
     * Same as YAHOO.lang.augmentObject, except it only applies prototype properties
     * @see YAHOO.lang.augmentObject
     * @method augmentProto
     * @static
     * @param {Function} r  the object to receive the augmentation
     * @param {Function} s  the object that supplies the properties to augment
     * @param {String*|boolean}  arguments zero or more properties methods 
     *        to augment the receiver with.  If none specified, everything 
     *        in the supplier will be used unless it would overwrite an existing 
     *        property in the receiver.  if true is specified as the third 
     *        parameter, all properties will be applied and will overwrite an 
     *        existing property in the receiver
     */
    augmentProto: function(r, s) {
        if (!s||!r) {
            throw new Error("Augment failed, verify dependencies.");
        }
        //var a=[].concat(arguments);
        var a=[r.prototype,s.prototype], i;
        for (i=2;i<arguments.length;i=i+1) {
            a.push(arguments[i]);
        }
        L.augmentObject.apply(this, a);
    },

      
    /**
     * Returns a simple string representation of the object or array.
     * Other types of objects will be returned unprocessed.  Arrays
     * are expected to be indexed.  Use object notation for
     * associative arrays.
     * @method dump
     * @since 2.3.0
     * @param o {Object} The object to dump
     * @param d {int} How deep to recurse child objects, default 3
     * @return {String} the dump result
     */
    dump: function(o, d) {
        var i,len,s=[],OBJ="{...}",FUN="f(){...}",
            COMMA=', ', ARROW=' => ';

        // Cast non-objects to string
        // Skip dates because the std toString is what we want
        // Skip HTMLElement-like objects because trying to dump 
        // an element will cause an unhandled exception in FF 2.x
        if (!L.isObject(o)) {
            return o + "";
        } else if (o instanceof Date || ("nodeType" in o && "tagName" in o)) {
            return o;
        } else if  (L.isFunction(o)) {
            return FUN;
        }

        // dig into child objects the depth specifed. Default 3
        d = (L.isNumber(d)) ? d : 3;

        // arrays [1, 2, 3]
        if (L.isArray(o)) {
            s.push("[");
            for (i=0,len=o.length;i<len;i=i+1) {
                if (L.isObject(o[i])) {
                    s.push((d > 0) ? L.dump(o[i], d-1) : OBJ);
                } else {
                    s.push(o[i]);
                }
                s.push(COMMA);
            }
            if (s.length > 1) {
                s.pop();
            }
            s.push("]");
        // objects {k1 => v1, k2 => v2}
        } else {
            s.push("{");
            for (i in o) {
                if (L.hasOwnProperty(o, i)) {
                    s.push(i + ARROW);
                    if (L.isObject(o[i])) {
                        s.push((d > 0) ? L.dump(o[i], d-1) : OBJ);
                    } else {
                        s.push(o[i]);
                    }
                    s.push(COMMA);
                }
            }
            if (s.length > 1) {
                s.pop();
            }
            s.push("}");
        }

        return s.join("");
    },

    /**
     * Does variable substitution on a string. It scans through the string 
     * looking for expressions enclosed in { } braces. If an expression 
     * is found, it is used a key on the object.  If there is a space in
     * the key, the first word is used for the key and the rest is provided
     * to an optional function to be used to programatically determine the
     * value (the extra information might be used for this decision). If 
     * the value for the key in the object, or what is returned from the
     * function has a string value, number value, or object value, it is 
     * substituted for the bracket expression and it repeats.  If this
     * value is an object, it uses the Object's toString() if this has
     * been overridden, otherwise it does a shallow dump of the key/value
     * pairs.
     * @method substitute
     * @since 2.3.0
     * @param s {String} The string that will be modified.
     * @param o {Object} An object containing the replacement values
     * @param f {Function} An optional function that can be used to
     *                     process each match.  It receives the key,
     *                     value, and any extra metadata included with
     *                     the key inside of the braces.
     * @return {String} the substituted string
     */
    substitute: function (s, o, f) {
        var i, j, k, key, v, meta, saved=[], token, 
            DUMP='dump', SPACE=' ', LBRACE='{', RBRACE='}',
            dump;


        for (;;) {
            i = s.lastIndexOf(LBRACE);
            if (i < 0) {
                break;
            }
            j = s.indexOf(RBRACE, i);
            if (i + 1 >= j) {
                break;
            }

            //Extract key and meta info 
            token = s.substring(i + 1, j);
            key = token;
            meta = null;
            k = key.indexOf(SPACE);
            if (k > -1) {
                meta = key.substring(k + 1);
                key = key.substring(0, k);
            }

            // lookup the value
            v = o[key];

            // if a substitution function was provided, execute it
            if (f) {
                v = f(key, v, meta);
            }

            if (L.isObject(v)) {
                if (L.isArray(v)) {
                    v = L.dump(v, parseInt(meta, 10));
                } else {
                    meta = meta || "";

                    // look for the keyword 'dump', if found force obj dump
                    dump = meta.indexOf(DUMP);
                    if (dump > -1) {
                        meta = meta.substring(4);
                    }

                    // use the toString if it is not the Object toString 
                    // and the 'dump' meta info was not found
                    if (v.toString===OP.toString || dump>-1) {
                        v = L.dump(v, parseInt(meta, 10));
                    } else {
                        v = v.toString();
                    }
                }
            } else if (!L.isString(v) && !L.isNumber(v)) {
                // This {block} has no replace string. Save it for later.
                v = "~-" + saved.length + "-~";
                saved[saved.length] = token;

                // break;
            }

            s = s.substring(0, i) + v + s.substring(j + 1);


        }

        // restore saved {block}s
        for (i=saved.length-1; i>=0; i=i-1) {
            s = s.replace(new RegExp("~-" + i + "-~"), "{"  + saved[i] + "}", "g");
        }

        return s;
    },


    /**
     * Returns a string without any leading or trailing whitespace.  If 
     * the input is not a string, the input will be returned untouched.
     * @method trim
     * @since 2.3.0
     * @param s {string} the string to trim
     * @return {string} the trimmed string
     */
    trim: function(s){
        try {
            return s.replace(/^\s+|\s+$/g, "");
        } catch(e) {
            return s;
        }
    },

    /**
     * Returns a new object containing all of the properties of
     * all the supplied objects.  The properties from later objects
     * will overwrite those in earlier objects.
     * @method merge
     * @since 2.3.0
     * @param arguments {Object*} the objects to merge
     * @return the new merged object
     */
    merge: function() {
        var o={}, a=arguments, l=a.length, i;
        for (i=0; i<l; i=i+1) {
            L.augmentObject(o, a[i], true);
        }
        return o;
    },

    /**
     * Executes the supplied function in the context of the supplied 
     * object 'when' milliseconds later.  Executes the function a 
     * single time unless periodic is set to true.
     * @method later
     * @since 2.4.0
     * @param when {int} the number of milliseconds to wait until the fn 
     * is executed
     * @param o the context object
     * @param fn {Function|String} the function to execute or the name of 
     * the method in the 'o' object to execute
     * @param data [Array] data that is provided to the function.  This accepts
     * either a single item or an array.  If an array is provided, the
     * function is executed with one parameter for each array item.  If
     * you need to pass a single array parameter, it needs to be wrapped in
     * an array [myarray]
     * @param periodic {boolean} if true, executes continuously at supplied 
     * interval until canceled
     * @return a timer object. Call the cancel() method on this object to 
     * stop the timer.
     */
    later: function(when, o, fn, data, periodic) {
        when = when || 0; 
        o = o || {};
        var m=fn, d=data, f, r;

        if (L.isString(fn)) {
            m = o[fn];
        }

        if (!m) {
            throw new TypeError("method undefined");
        }

        if (!L.isArray(d)) {
            d = [data];
        }

        f = function() {
            m.apply(o, d);
        };

        r = (periodic) ? setInterval(f, when) : setTimeout(f, when);

        return {
            interval: periodic,
            cancel: function() {
                if (this.interval) {
                    clearInterval(r);
                } else {
                    clearTimeout(r);
                }
            }
        };
    },
    
    /**
     * A convenience method for detecting a legitimate non-null value.
     * Returns false for null/undefined/NaN, true for other values, 
     * including 0/false/''
     * @method isValue
     * @since 2.3.0
     * @param o {any} the item to test
     * @return {boolean} true if it is not null/undefined/NaN || false
     */
    isValue: function(o) {
        // return (o || o === false || o === 0 || o === ''); // Infinity fails
return (L.isObject(o) || L.isString(o) || L.isNumber(o) || L.isBoolean(o));
    }

};

/**
 * Determines whether or not the property was added
 * to the object instance.  Returns false if the property is not present
 * in the object, or was inherited from the prototype.
 * This abstraction is provided to enable hasOwnProperty for Safari 1.3.x.
 * There is a discrepancy between YAHOO.lang.hasOwnProperty and
 * Object.prototype.hasOwnProperty when the property is a primitive added to
 * both the instance AND prototype with the same value:
 * <pre>
 * var A = function() {};
 * A.prototype.foo = 'foo';
 * var a = new A();
 * a.foo = 'foo';
 * alert(a.hasOwnProperty('foo')); // true
 * alert(YAHOO.lang.hasOwnProperty(a, 'foo')); // false when using fallback
 * </pre>
 * @method hasOwnProperty
 * @param {any} o The object being testing
 * @param prop {string} the name of the property to test
 * @return {boolean} the result
 */
L.hasOwnProperty = (OP.hasOwnProperty) ?
    function(o, prop) {
        return o && o.hasOwnProperty(prop);
    } : function(o, prop) {
        return !L.isUndefined(o[prop]) && 
                o.constructor.prototype[prop] !== o[prop];
    };

// new lang wins
OB.augmentObject(L, OB, true);

/*
 * An alias for <a href="YAHOO.lang.html">YAHOO.lang</a>
 * @class YAHOO.util.Lang
 */
YAHOO.util.Lang = L;
 
/**
 * Same as YAHOO.lang.augmentObject, except it only applies prototype 
 * properties.  This is an alias for augmentProto.
 * @see YAHOO.lang.augmentObject
 * @method augment
 * @static
 * @param {Function} r  the object to receive the augmentation
 * @param {Function} s  the object that supplies the properties to augment
 * @param {String*|boolean}  arguments zero or more properties methods to 
 *        augment the receiver with.  If none specified, everything
 *        in the supplier will be used unless it would
 *        overwrite an existing property in the receiver.  if true
 *        is specified as the third parameter, all properties will
 *        be applied and will overwrite an existing property in
 *        the receiver
 */
L.augment = L.augmentProto;

/**
 * An alias for <a href="YAHOO.lang.html#augment">YAHOO.lang.augment</a>
 * @for YAHOO
 * @method augment
 * @static
 * @param {Function} r  the object to receive the augmentation
 * @param {Function} s  the object that supplies the properties to augment
 * @param {String*}  arguments zero or more properties methods to 
 *        augment the receiver with.  If none specified, everything
 *        in the supplier will be used unless it would
 *        overwrite an existing property in the receiver
 */
YAHOO.augment = L.augmentProto;
       
/**
 * An alias for <a href="YAHOO.lang.html#extend">YAHOO.lang.extend</a>
 * @method extend
 * @static
 * @param {Function} subc   the object to modify
 * @param {Function} superc the object to inherit
 * @param {Object} overrides  additional properties/methods to add to the
 *        subclass prototype.  These will override the
 *        matching items obtained from the superclass if present.
 */
YAHOO.extend = L.extend;

})();
YAHOO.register("yahoo", YAHOO, {version: "2.7.0", build: "1796"});
/*
Copyright (c) 2009, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
version: 2.7.0
*/
/**
 * The dom module provides helper methods for manipulating Dom elements.
 * @module dom
 *
 */

(function() {
    YAHOO.env._id_counter = YAHOO.env._id_counter || 0;     // for use with generateId (global to save state if Dom is overwritten)

        // internal shorthand
    var Y = YAHOO.util,
        lang = YAHOO.lang,
        UA = YAHOO.env.ua,
        trim = YAHOO.lang.trim,
        propertyCache = {}, // for faster hyphen converts
        reCache = {}, // cache className regexes
        RE_TABLE = /^t(?:able|d|h)$/i, // for _calcBorders
        RE_COLOR = /color$/i,

        // DOM aliases 
        document = window.document,     
        documentElement = document.documentElement,

        // string constants
        OWNER_DOCUMENT = 'ownerDocument',
        DEFAULT_VIEW = 'defaultView',
        DOCUMENT_ELEMENT = 'documentElement',
        COMPAT_MODE = 'compatMode',
        OFFSET_LEFT = 'offsetLeft',
        OFFSET_TOP = 'offsetTop',
        OFFSET_PARENT = 'offsetParent',
        PARENT_NODE = 'parentNode',
        NODE_TYPE = 'nodeType',
        TAG_NAME = 'tagName',
        SCROLL_LEFT = 'scrollLeft',
        SCROLL_TOP = 'scrollTop',
        GET_BOUNDING_CLIENT_RECT = 'getBoundingClientRect',
        GET_COMPUTED_STYLE = 'getComputedStyle',
        CURRENT_STYLE = 'currentStyle',
        CSS1_COMPAT = 'CSS1Compat',
        _BACK_COMPAT = 'BackCompat',
        _CLASS = 'class', // underscore due to reserved word
        CLASS_NAME = 'className',
        EMPTY = '',
        SPACE = ' ',
        C_START = '(?:^|\\s)',
        C_END = '(?= |$)',
        G = 'g',
        POSITION = 'position',
        FIXED = 'fixed',
        RELATIVE = 'relative',
        LEFT = 'left',
        TOP = 'top',
        MEDIUM = 'medium',
        BORDER_LEFT_WIDTH = 'borderLeftWidth',
        BORDER_TOP_WIDTH = 'borderTopWidth',
    
    // brower detection
        isOpera = UA.opera,
        isSafari = UA.webkit, 
        isGecko = UA.gecko, 
        isIE = UA.ie; 
    
    /**
     * Provides helper methods for DOM elements.
     * @namespace YAHOO.util
     * @class Dom
     * @requires yahoo, event
     */
    Y.Dom = {
        CUSTOM_ATTRIBUTES: (!documentElement.hasAttribute) ? { // IE < 8
            'for': 'htmlFor',
            'class': CLASS_NAME
        } : { // w3c
            'htmlFor': 'for',
            'className': _CLASS
        },

        /**
         * Returns an HTMLElement reference.
         * @method get
         * @param {String | HTMLElement |Array} el Accepts a string to use as an ID for getting a DOM reference, an actual DOM reference, or an Array of IDs and/or HTMLElements.
         * @return {HTMLElement | Array} A DOM reference to an HTML element or an array of HTMLElements.
         */
        get: function(el) {
            var id, nodes, c, i, len;

            if (el) {
                if (el[NODE_TYPE] || el.item) { // Node, or NodeList
                    return el;
                }

                if (typeof el === 'string') { // id
                    id = el;
                    el = document.getElementById(el);
                    if (el && el.id === id) { // IE: avoid false match on "name" attribute
                    return el;
                    } else if (el && document.all) { // filter by name
                        el = null;
                        nodes = document.all[id];
                        for (i = 0, len = nodes.length; i < len; ++i) {
                            if (nodes[i].id === id) {
                                return nodes[i];
                            }
                        }
                    }
                    return el;
                }
                
                if (el.DOM_EVENTS) { // YAHOO.util.Element
                    el = el.get('element');
                }

                if ('length' in el) { // array-like 
                    c = [];
                    for (i = 0, len = el.length; i < len; ++i) {
                        c[c.length] = Y.Dom.get(el[i]);
                    }
                    
                    return c;
                }

                return el; // some other object, just pass it back
            }

            return null;
        },
    
        getComputedStyle: function(el, property) {
            if (window[GET_COMPUTED_STYLE]) {
                return el[OWNER_DOCUMENT][DEFAULT_VIEW][GET_COMPUTED_STYLE](el, null)[property];
            } else if (el[CURRENT_STYLE]) {
                return Y.Dom.IE_ComputedStyle.get(el, property);
            }
        },

        /**
         * Normalizes currentStyle and ComputedStyle.
         * @method getStyle
         * @param {String | HTMLElement |Array} el Accepts a string to use as an ID, an actual DOM reference, or an Array of IDs and/or HTMLElements.
         * @param {String} property The style property whose value is returned.
         * @return {String | Array} The current value of the style property for the element(s).
         */
        getStyle: function(el, property) {
            return Y.Dom.batch(el, Y.Dom._getStyle, property);
        },

        // branching at load instead of runtime
        _getStyle: function() {
            if (window[GET_COMPUTED_STYLE]) { // W3C DOM method
                return function(el, property) {
                    property = (property === 'float') ? property = 'cssFloat' :
                            Y.Dom._toCamel(property);

                    var value = el.style[property],
                        computed;
                    
                    if (!value) {
                        computed = el[OWNER_DOCUMENT][DEFAULT_VIEW][GET_COMPUTED_STYLE](el, null);
                        if (computed) { // test computed before touching for safari
                            value = computed[property];
                        }
                    }
                    
                    return value;
                };
            } else if (documentElement[CURRENT_STYLE]) {
                return function(el, property) {                         
                    var value;

                    switch(property) {
                        case 'opacity' :// IE opacity uses filter
                            value = 100;
                            try { // will error if no DXImageTransform
                                value = el.filters['DXImageTransform.Microsoft.Alpha'].opacity;

                            } catch(e) {
                                try { // make sure its in the document
                                    value = el.filters('alpha').opacity;
                                } catch(err) {
                                }
                            }
                            return value / 100;
                        case 'float': // fix reserved word
                            property = 'styleFloat'; // fall through
                        default: 
                            property = Y.Dom._toCamel(property);
                            value = el[CURRENT_STYLE] ? el[CURRENT_STYLE][property] : null;
                            return ( el.style[property] || value );
                    }
                };
            }
        }(),
    
        /**
         * Wrapper for setting style properties of HTMLElements.  Normalizes "opacity" across modern browsers.
         * @method setStyle
         * @param {String | HTMLElement | Array} el Accepts a string to use as an ID, an actual DOM reference, or an Array of IDs and/or HTMLElements.
         * @param {String} property The style property to be set.
         * @param {String} val The value to apply to the given property.
         */
        setStyle: function(el, property, val) {
            Y.Dom.batch(el, Y.Dom._setStyle, { prop: property, val: val });
        },

        _setStyle: function() {
            if (isIE) {
                return function(el, args) {
                    var property = Y.Dom._toCamel(args.prop),
                        val = args.val;

                    if (el) {
                        switch (property) {
                            case 'opacity':
                                if ( lang.isString(el.style.filter) ) { // in case not appended
                                    el.style.filter = 'alpha(opacity=' + val * 100 + ')';
                                    
                                    if (!el[CURRENT_STYLE] || !el[CURRENT_STYLE].hasLayout) {
                                        el.style.zoom = 1; // when no layout or cant tell
                                    }
                                }
                                break;
                            case 'float':
                                property = 'styleFloat';
                            default:
                            el.style[property] = val;
                        }
                    } else {
                    }
                };
            } else {
                return function(el, args) {
                    var property = Y.Dom._toCamel(args.prop),
                        val = args.val;
                    if (el) {
                        if (property == 'float') {
                            property = 'cssFloat';
                        }
                        el.style[property] = val;
                    } else {
                    }
                };
            }

        }(),
        
        /**
         * Gets the current position of an element based on page coordinates. 
         * Element must be part of the DOM tree to have page coordinates (display:none or elements not appended return false).
         * @method getXY
         * @param {String | HTMLElement | Array} el Accepts a string to use as an ID, an actual DOM
         * reference, or an Array of IDs and/or HTMLElements
         * @return {Array} The XY position of the element(s)
         */
        getXY: function(el) {
            return Y.Dom.batch(el, Y.Dom._getXY);
        },

        _canPosition: function(el) {
            return ( Y.Dom._getStyle(el, 'display') !== 'none' && Y.Dom._inDoc(el) );
        },

        _getXY: function() {
            if (document[DOCUMENT_ELEMENT][GET_BOUNDING_CLIENT_RECT]) {
                return function(node) {
                    var scrollLeft, scrollTop, box, doc,
                        off1, off2, mode, bLeft, bTop,
                        floor = Math.floor, // TODO: round?
                        xy = false;

                    if (Y.Dom._canPosition(node)) {
                        box = node[GET_BOUNDING_CLIENT_RECT]();
                        doc = node[OWNER_DOCUMENT];
                        scrollLeft = Y.Dom.getDocumentScrollLeft(doc);
                        scrollTop = Y.Dom.getDocumentScrollTop(doc);
                        xy = [floor(box[LEFT]), floor(box[TOP])];

                        if (isIE && UA.ie < 8) { // IE < 8: viewport off by 2
                            off1 = 2;
                            off2 = 2;
                            mode = doc[COMPAT_MODE];
                            bLeft = _getComputedStyle(doc[DOCUMENT_ELEMENT], BORDER_LEFT_WIDTH);
                            bTop = _getComputedStyle(doc[DOCUMENT_ELEMENT], BORDER_TOP_WIDTH);

                            if (UA.ie === 6) {
                                if (mode !== _BACK_COMPAT) {
                                    off1 = 0;
                                    off2 = 0;
                                }
                            }
                            
                            if ((mode == _BACK_COMPAT)) {
                                if (bLeft !== MEDIUM) {
                                    off1 = parseInt(bLeft, 10);
                                }
                                if (bTop !== MEDIUM) {
                                    off2 = parseInt(bTop, 10);
                                }
                            }
                            
                            xy[0] -= off1;
                            xy[1] -= off2;

                        }

                        if ((scrollTop || scrollLeft)) {
                            xy[0] += scrollLeft;
                            xy[1] += scrollTop;
                        }

                        // gecko may return sub-pixel (non-int) values
                        xy[0] = floor(xy[0]);
                        xy[1] = floor(xy[1]);
                    } else {
                    }

                    return xy;
                };
            } else {
                return function(node) { // ff2, safari: manually calculate by crawling up offsetParents
                    var docScrollLeft, docScrollTop,
                        scrollTop, scrollLeft,
                        bCheck,
                        xy = false,
                        parentNode = node;

                    if  (Y.Dom._canPosition(node) ) {
                        xy = [node[OFFSET_LEFT], node[OFFSET_TOP]];
                        docScrollLeft = Y.Dom.getDocumentScrollLeft(node[OWNER_DOCUMENT]);
                        docScrollTop = Y.Dom.getDocumentScrollTop(node[OWNER_DOCUMENT]);

                        // TODO: refactor with !! or just falsey
                        bCheck = ((isGecko || UA.webkit > 519) ? true : false);

                        // TODO: worth refactoring for TOP/LEFT only?
                        while ((parentNode = parentNode[OFFSET_PARENT])) {
                            xy[0] += parentNode[OFFSET_LEFT];
                            xy[1] += parentNode[OFFSET_TOP];
                            if (bCheck) {
                                xy = Y.Dom._calcBorders(parentNode, xy);
                            }
                        }

                        // account for any scrolled ancestors
                        if (Y.Dom._getStyle(node, POSITION) !== FIXED) {
                            parentNode = node;

                            while ((parentNode = parentNode[PARENT_NODE]) && parentNode[TAG_NAME]) {
                                scrollTop = parentNode[SCROLL_TOP];
                                scrollLeft = parentNode[SCROLL_LEFT];

                                //Firefox does something funky with borders when overflow is not visible.
                                if (isGecko && (Y.Dom._getStyle(parentNode, 'overflow') !== 'visible')) {
                                        xy = Y.Dom._calcBorders(parentNode, xy);
                                }

                                if (scrollTop || scrollLeft) {
                                    xy[0] -= scrollLeft;
                                    xy[1] -= scrollTop;
                                }
                            }
                            xy[0] += docScrollLeft;
                            xy[1] += docScrollTop;

                        } else {
                            //Fix FIXED position -- add scrollbars
                            if (isOpera) {
                                xy[0] -= docScrollLeft;
                                xy[1] -= docScrollTop;
                            } else if (isSafari || isGecko) {
                                xy[0] += docScrollLeft;
                                xy[1] += docScrollTop;
                            }
                        }
                        //Round the numbers so we get sane data back
                        xy[0] = Math.floor(xy[0]);
                        xy[1] = Math.floor(xy[1]);
                    } else {
                    }
                    return xy;                
                };
            }
        }(), // NOTE: Executing for loadtime branching
        
        /**
         * Gets the current X position of an element based on page coordinates.  The element must be part of the DOM tree to have page coordinates (display:none or elements not appended return false).
         * @method getX
         * @param {String | HTMLElement | Array} el Accepts a string to use as an ID, an actual DOM reference, or an Array of IDs and/or HTMLElements
         * @return {Number | Array} The X position of the element(s)
         */
        getX: function(el) {
            var f = function(el) {
                return Y.Dom.getXY(el)[0];
            };
            
            return Y.Dom.batch(el, f, Y.Dom, true);
        },
        
        /**
         * Gets the current Y position of an element based on page coordinates.  Element must be part of the DOM tree to have page coordinates (display:none or elements not appended return false).
         * @method getY
         * @param {String | HTMLElement | Array} el Accepts a string to use as an ID, an actual DOM reference, or an Array of IDs and/or HTMLElements
         * @return {Number | Array} The Y position of the element(s)
         */
        getY: function(el) {
            var f = function(el) {
                return Y.Dom.getXY(el)[1];
            };
            
            return Y.Dom.batch(el, f, Y.Dom, true);
        },
        
        /**
         * Set the position of an html element in page coordinates, regardless of how the element is positioned.
         * The element(s) must be part of the DOM tree to have page coordinates (display:none or elements not appended return false).
         * @method setXY
         * @param {String | HTMLElement | Array} el Accepts a string to use as an ID, an actual DOM reference, or an Array of IDs and/or HTMLElements
         * @param {Array} pos Contains X & Y values for new position (coordinates are page-based)
         * @param {Boolean} noRetry By default we try and set the position a second time if the first fails
         */
        setXY: function(el, pos, noRetry) {
            Y.Dom.batch(el, Y.Dom._setXY, { pos: pos, noRetry: noRetry });
        },

        _setXY: function(node, args) {
            var pos = Y.Dom._getStyle(node, POSITION),
                setStyle = Y.Dom.setStyle,
                xy = args.pos,
                noRetry = args.noRetry,

                delta = [ // assuming pixels; if not we will have to retry
                    parseInt( Y.Dom.getComputedStyle(node, LEFT), 10 ),
                    parseInt( Y.Dom.getComputedStyle(node, TOP), 10 )
                ],

                currentXY,
                newXY;
        
            if (pos == 'static') { // default to relative
                pos = RELATIVE;
                setStyle(node, POSITION, pos);
            }

            currentXY = Y.Dom._getXY(node);

            if (!xy || currentXY === false) { // has to be part of doc to have xy
                return false; 
            }
            
            if ( isNaN(delta[0]) ) {// in case of 'auto'
                delta[0] = (pos == RELATIVE) ? 0 : node[OFFSET_LEFT];
            } 
            if ( isNaN(delta[1]) ) { // in case of 'auto'
                delta[1] = (pos == RELATIVE) ? 0 : node[OFFSET_TOP];
            } 

            if (xy[0] !== null) { // from setX
                setStyle(node, LEFT, xy[0] - currentXY[0] + delta[0] + 'px');
            }

            if (xy[1] !== null) { // from setY
                setStyle(node, TOP, xy[1] - currentXY[1] + delta[1] + 'px');
            }
          
            if (!noRetry) {
                newXY = Y.Dom._getXY(node);

                // if retry is true, try one more time if we miss 
               if ( (xy[0] !== null && newXY[0] != xy[0]) || 
                    (xy[1] !== null && newXY[1] != xy[1]) ) {
                   Y.Dom._setXY(node, { pos: xy, noRetry: true });
               }
            }        

        },
        
        /**
         * Set the X position of an html element in page coordinates, regardless of how the element is positioned.
         * The element must be part of the DOM tree to have page coordinates (display:none or elements not appended return false).
         * @method setX
         * @param {String | HTMLElement | Array} el Accepts a string to use as an ID, an actual DOM reference, or an Array of IDs and/or HTMLElements.
         * @param {Int} x The value to use as the X coordinate for the element(s).
         */
        setX: function(el, x) {
            Y.Dom.setXY(el, [x, null]);
        },
        
        /**
         * Set the Y position of an html element in page coordinates, regardless of how the element is positioned.
         * The element must be part of the DOM tree to have page coordinates (display:none or elements not appended return false).
         * @method setY
         * @param {String | HTMLElement | Array} el Accepts a string to use as an ID, an actual DOM reference, or an Array of IDs and/or HTMLElements.
         * @param {Int} x To use as the Y coordinate for the element(s).
         */
        setY: function(el, y) {
            Y.Dom.setXY(el, [null, y]);
        },
        
        /**
         * Returns the region position of the given element.
         * The element must be part of the DOM tree to have a region (display:none or elements not appended return false).
         * @method getRegion
         * @param {String | HTMLElement | Array} el Accepts a string to use as an ID, an actual DOM reference, or an Array of IDs and/or HTMLElements.
         * @return {Region | Array} A Region or array of Region instances containing "top, left, bottom, right" member data.
         */
        getRegion: function(el) {
            var f = function(el) {
                var region = false;
                if ( Y.Dom._canPosition(el) ) {
                    region = Y.Region.getRegion(el);
                } else {
                }

                return region;
            };
            
            return Y.Dom.batch(el, f, Y.Dom, true);
        },
        
        /**
         * Returns the width of the client (viewport).
         * @method getClientWidth
         * @deprecated Now using getViewportWidth.  This interface left intact for back compat.
         * @return {Int} The width of the viewable area of the page.
         */
        getClientWidth: function() {
            return Y.Dom.getViewportWidth();
        },
        
        /**
         * Returns the height of the client (viewport).
         * @method getClientHeight
         * @deprecated Now using getViewportHeight.  This interface left intact for back compat.
         * @return {Int} The height of the viewable area of the page.
         */
        getClientHeight: function() {
            return Y.Dom.getViewportHeight();
        },

        /**
         * Returns a array of HTMLElements with the given class.
         * For optimized performance, include a tag and/or root node when possible.
         * Note: This method operates against a live collection, so modifying the 
         * collection in the callback (removing/appending nodes, etc.) will have
         * side effects.  Instead you should iterate the returned nodes array,
         * as you would with the native "getElementsByTagName" method. 
         * @method getElementsByClassName
         * @param {String} className The class name to match against
         * @param {String} tag (optional) The tag name of the elements being collected
         * @param {String | HTMLElement} root (optional) The HTMLElement or an ID to use as the starting point 
         * @param {Function} apply (optional) A function to apply to each element when found 
         * @param {Any} o (optional) An optional arg that is passed to the supplied method
         * @param {Boolean} overrides (optional) Whether or not to override the scope of "method" with "o"
         * @return {Array} An array of elements that have the given class name
         */
        getElementsByClassName: function(className, tag, root, apply, o, overrides) {
            className = lang.trim(className);
            tag = tag || '*';
            root = (root) ? Y.Dom.get(root) : null || document; 
            if (!root) {
                return [];
            }

            var nodes = [],
                elements = root.getElementsByTagName(tag),
                hasClass = Y.Dom.hasClass;

            for (var i = 0, len = elements.length; i < len; ++i) {
                if ( hasClass(elements[i], className) ) {
                    nodes[nodes.length] = elements[i];
                }
            }
            
            if (apply) {
                Y.Dom.batch(nodes, apply, o, overrides);
            }

            return nodes;
        },

        /**
         * Determines whether an HTMLElement has the given className.
         * @method hasClass
         * @param {String | HTMLElement | Array} el The element or collection to test
         * @param {String} className the class name to search for
         * @return {Boolean | Array} A boolean value or array of boolean values
         */
        hasClass: function(el, className) {
            return Y.Dom.batch(el, Y.Dom._hasClass, className);
        },

        _hasClass: function(el, className) {
            var ret = false,
                current;
            
            if (el && className) {
                current = Y.Dom.getAttribute(el, CLASS_NAME) || EMPTY;
                if (className.exec) {
                    ret = className.test(current);
                } else {
                    ret = className && (SPACE + current + SPACE).
                        indexOf(SPACE + className + SPACE) > -1;
                }
            } else {
            }

            return ret;
        },
    
        /**
         * Adds a class name to a given element or collection of elements.
         * @method addClass         
         * @param {String | HTMLElement | Array} el The element or collection to add the class to
         * @param {String} className the class name to add to the class attribute
         * @return {Boolean | Array} A pass/fail boolean or array of booleans
         */
        addClass: function(el, className) {
            return Y.Dom.batch(el, Y.Dom._addClass, className);
        },

        _addClass: function(el, className) {
            var ret = false,
                current;

            if (el && className) {
                current = Y.Dom.getAttribute(el, CLASS_NAME) || EMPTY;
                if ( !Y.Dom._hasClass(el, className) ) {
                    Y.Dom.setAttribute(el, CLASS_NAME, trim(current + SPACE + className));
                    ret = true;
                }
            } else {
            }

            return ret;
        },
    
        /**
         * Removes a class name from a given element or collection of elements.
         * @method removeClass         
         * @param {String | HTMLElement | Array} el The element or collection to remove the class from
         * @param {String} className the class name to remove from the class attribute
         * @return {Boolean | Array} A pass/fail boolean or array of booleans
         */
        removeClass: function(el, className) {
            return Y.Dom.batch(el, Y.Dom._removeClass, className);
        },
        
        _removeClass: function(el, className) {
            var ret = false,
                current,
                newClass,
                attr;

            if (el && className) {
                current = Y.Dom.getAttribute(el, CLASS_NAME) || EMPTY;
                Y.Dom.setAttribute(el, CLASS_NAME, current.replace(Y.Dom._getClassRegex(className), EMPTY));

                newClass = Y.Dom.getAttribute(el, CLASS_NAME);
                if (current !== newClass) { // else nothing changed
                    Y.Dom.setAttribute(el, CLASS_NAME, trim(newClass)); // trim after comparing to current class
                    ret = true;

                    if (Y.Dom.getAttribute(el, CLASS_NAME) === '') { // remove class attribute if empty
                        attr = (el.hasAttribute && el.hasAttribute(_CLASS)) ? _CLASS : CLASS_NAME;
                        el.removeAttribute(attr);
                    }
                }

            } else {
            }

            return ret;
        },
        
        /**
         * Replace a class with another class for a given element or collection of elements.
         * If no oldClassName is present, the newClassName is simply added.
         * @method replaceClass  
         * @param {String | HTMLElement | Array} el The element or collection to remove the class from
         * @param {String} oldClassName the class name to be replaced
         * @param {String} newClassName the class name that will be replacing the old class name
         * @return {Boolean | Array} A pass/fail boolean or array of booleans
         */
        replaceClass: function(el, oldClassName, newClassName) {
            return Y.Dom.batch(el, Y.Dom._replaceClass, { from: oldClassName, to: newClassName });
        },

        _replaceClass: function(el, classObj) {
            var className,
                from,
                to,
                ret = false,
                current;

            if (el && classObj) {
                from = classObj.from;
                to = classObj.to;

                if (!to) {
                    ret = false;
                }  else if (!from) { // just add if no "from"
                    ret = Y.Dom._addClass(el, classObj.to);
                } else if (from !== to) { // else nothing to replace
                    // May need to lead with DBLSPACE?
                    current = Y.Dom.getAttribute(el, CLASS_NAME) || EMPTY;
                    className = (SPACE + current.replace(Y.Dom._getClassRegex(from), SPACE + to)).
                               split(Y.Dom._getClassRegex(to));

                    // insert to into what would have been the first occurrence slot
                    className.splice(1, 0, SPACE + to);
                    Y.Dom.setAttribute(el, CLASS_NAME, trim(className.join(EMPTY)));
                    ret = true;
                }
            } else {
            }

            return ret;
        },
        
        /**
         * Returns an ID and applies it to the element "el", if provided.
         * @method generateId  
         * @param {String | HTMLElement | Array} el (optional) An optional element array of elements to add an ID to (no ID is added if one is already present).
         * @param {String} prefix (optional) an optional prefix to use (defaults to "yui-gen").
         * @return {String | Array} The generated ID, or array of generated IDs (or original ID if already present on an element)
         */
        generateId: function(el, prefix) {
            prefix = prefix || 'yui-gen';

            var f = function(el) {
                if (el && el.id) { // do not override existing ID
                    return el.id;
                }

                var id = prefix + YAHOO.env._id_counter++;

                if (el) {
                    if (el[OWNER_DOCUMENT].getElementById(id)) { // in case one already exists
                        // use failed id plus prefix to help ensure uniqueness
                        return Y.Dom.generateId(el, id + prefix);
                    }
                    el.id = id;
                }
                
                return id;
            };

            // batch fails when no element, so just generate and return single ID
            return Y.Dom.batch(el, f, Y.Dom, true) || f.apply(Y.Dom, arguments);
        },
        
        /**
         * Determines whether an HTMLElement is an ancestor of another HTML element in the DOM hierarchy.
         * @method isAncestor
         * @param {String | HTMLElement} haystack The possible ancestor
         * @param {String | HTMLElement} needle The possible descendent
         * @return {Boolean} Whether or not the haystack is an ancestor of needle
         */
        isAncestor: function(haystack, needle) {
            haystack = Y.Dom.get(haystack);
            needle = Y.Dom.get(needle);
            
            var ret = false;

            if ( (haystack && needle) && (haystack[NODE_TYPE] && needle[NODE_TYPE]) ) {
                if (haystack.contains && haystack !== needle) { // contains returns true when equal
                    ret = haystack.contains(needle);
                }
                else if (haystack.compareDocumentPosition) { // gecko
                    ret = !!(haystack.compareDocumentPosition(needle) & 16);
                }
            } else {
            }
            return ret;
        },
        
        /**
         * Determines whether an HTMLElement is present in the current document.
         * @method inDocument         
         * @param {String | HTMLElement} el The element to search for
         * @param {Object} doc An optional document to search, defaults to element's owner document 
         * @return {Boolean} Whether or not the element is present in the current document
         */
        inDocument: function(el, doc) {
            return Y.Dom._inDoc(Y.Dom.get(el), doc);
        },

        _inDoc: function(el, doc) {
            var ret = false;
            if (el && el[TAG_NAME]) {
                doc = doc || el[OWNER_DOCUMENT]; 
                ret = Y.Dom.isAncestor(doc[DOCUMENT_ELEMENT], el);
            } else {
            }
            return ret;
        },
        
        /**
         * Returns a array of HTMLElements that pass the test applied by supplied boolean method.
         * For optimized performance, include a tag and/or root node when possible.
         * Note: This method operates against a live collection, so modifying the 
         * collection in the callback (removing/appending nodes, etc.) will have
         * side effects.  Instead you should iterate the returned nodes array,
         * as you would with the native "getElementsByTagName" method. 
         * @method getElementsBy
         * @param {Function} method - A boolean method for testing elements which receives the element as its only argument.
         * @param {String} tag (optional) The tag name of the elements being collected
         * @param {String | HTMLElement} root (optional) The HTMLElement or an ID to use as the starting point 
         * @param {Function} apply (optional) A function to apply to each element when found 
         * @param {Any} o (optional) An optional arg that is passed to the supplied method
         * @param {Boolean} overrides (optional) Whether or not to override the scope of "method" with "o"
         * @return {Array} Array of HTMLElements
         */
        getElementsBy: function(method, tag, root, apply, o, overrides, firstOnly) {
            tag = tag || '*';
            root = (root) ? Y.Dom.get(root) : null || document; 

            if (!root) {
                return [];
            }

            var nodes = [],
                elements = root.getElementsByTagName(tag);
            
            for (var i = 0, len = elements.length; i < len; ++i) {
                if ( method(elements[i]) ) {
                    if (firstOnly) {
                        nodes = elements[i]; 
                        break;
                    } else {
                        nodes[nodes.length] = elements[i];
                    }
                }
            }

            if (apply) {
                Y.Dom.batch(nodes, apply, o, overrides);
            }

            
            return nodes;
        },
        
        /**
         * Returns the first HTMLElement that passes the test applied by the supplied boolean method.
         * @method getElementBy
         * @param {Function} method - A boolean method for testing elements which receives the element as its only argument.
         * @param {String} tag (optional) The tag name of the elements being collected
         * @param {String | HTMLElement} root (optional) The HTMLElement or an ID to use as the starting point 
         * @return {HTMLElement}
         */
        getElementBy: function(method, tag, root) {
            return Y.Dom.getElementsBy(method, tag, root, null, null, null, true); 
        },

        /**
         * Runs the supplied method against each item in the Collection/Array.
         * The method is called with the element(s) as the first arg, and the optional param as the second ( method(el, o) ).
         * @method batch
         * @param {String | HTMLElement | Array} el (optional) An element or array of elements to apply the method to
         * @param {Function} method The method to apply to the element(s)
         * @param {Any} o (optional) An optional arg that is passed to the supplied method
         * @param {Boolean} overrides (optional) Whether or not to override the scope of "method" with "o"
         * @return {Any | Array} The return value(s) from the supplied method
         */
        batch: function(el, method, o, overrides) {
            var collection = [],
                scope = (overrides) ? o : window;
                
            el = (el && (el[TAG_NAME] || el.item)) ? el : Y.Dom.get(el); // skip get() when possible
            if (el && method) {
                if (el[TAG_NAME] || el.length === undefined) { // element or not array-like 
                    return method.call(scope, el, o);
                } 

                for (var i = 0; i < el.length; ++i) {
                    collection[collection.length] = method.call(scope, el[i], o);
                }
            } else {
                return false;
            } 
            return collection;
        },
        
        /**
         * Returns the height of the document.
         * @method getDocumentHeight
         * @return {Int} The height of the actual document (which includes the body and its margin).
         */
        getDocumentHeight: function() {
            var scrollHeight = (document[COMPAT_MODE] != CSS1_COMPAT || isSafari) ? document.body.scrollHeight : documentElement.scrollHeight,
                h = Math.max(scrollHeight, Y.Dom.getViewportHeight());

            return h;
        },
        
        /**
         * Returns the width of the document.
         * @method getDocumentWidth
         * @return {Int} The width of the actual document (which includes the body and its margin).
         */
        getDocumentWidth: function() {
            var scrollWidth = (document[COMPAT_MODE] != CSS1_COMPAT || isSafari) ? document.body.scrollWidth : documentElement.scrollWidth,
                w = Math.max(scrollWidth, Y.Dom.getViewportWidth());
            return w;
        },

        /**
         * Returns the current height of the viewport.
         * @method getViewportHeight
         * @return {Int} The height of the viewable area of the page (excludes scrollbars).
         */
        getViewportHeight: function() {
            var height = self.innerHeight, // Safari, Opera
                mode = document[COMPAT_MODE];
        
            if ( (mode || isIE) && !isOpera ) { // IE, Gecko
                height = (mode == CSS1_COMPAT) ?
                        documentElement.clientHeight : // Standards
                        document.body.clientHeight; // Quirks
            }
        
            return height;
        },
        
        /**
         * Returns the current width of the viewport.
         * @method getViewportWidth
         * @return {Int} The width of the viewable area of the page (excludes scrollbars).
         */
        
        getViewportWidth: function() {
            var width = self.innerWidth,  // Safari
                mode = document[COMPAT_MODE];
            
            if (mode || isIE) { // IE, Gecko, Opera
                width = (mode == CSS1_COMPAT) ?
                        documentElement.clientWidth : // Standards
                        document.body.clientWidth; // Quirks
            }
            return width;
        },

       /**
         * Returns the nearest ancestor that passes the test applied by supplied boolean method.
         * For performance reasons, IDs are not accepted and argument validation omitted.
         * @method getAncestorBy
         * @param {HTMLElement} node The HTMLElement to use as the starting point 
         * @param {Function} method - A boolean method for testing elements which receives the element as its only argument.
         * @return {Object} HTMLElement or null if not found
         */
        getAncestorBy: function(node, method) {
            while ( (node = node[PARENT_NODE]) ) { // NOTE: assignment
                if ( Y.Dom._testElement(node, method) ) {
                    return node;
                }
            } 

            return null;
        },
        
        /**
         * Returns the nearest ancestor with the given className.
         * @method getAncestorByClassName
         * @param {String | HTMLElement} node The HTMLElement or an ID to use as the starting point 
         * @param {String} className
         * @return {Object} HTMLElement
         */
        getAncestorByClassName: function(node, className) {
            node = Y.Dom.get(node);
            if (!node) {
                return null;
            }
            var method = function(el) { return Y.Dom.hasClass(el, className); };
            return Y.Dom.getAncestorBy(node, method);
        },

        /**
         * Returns the nearest ancestor with the given tagName.
         * @method getAncestorByTagName
         * @param {String | HTMLElement} node The HTMLElement or an ID to use as the starting point 
         * @param {String} tagName
         * @return {Object} HTMLElement
         */
        getAncestorByTagName: function(node, tagName) {
            node = Y.Dom.get(node);
            if (!node) {
                return null;
            }
            var method = function(el) {
                 return el[TAG_NAME] && el[TAG_NAME].toUpperCase() == tagName.toUpperCase();
            };

            return Y.Dom.getAncestorBy(node, method);
        },

        /**
         * Returns the previous sibling that is an HTMLElement. 
         * For performance reasons, IDs are not accepted and argument validation omitted.
         * Returns the nearest HTMLElement sibling if no method provided.
         * @method getPreviousSiblingBy
         * @param {HTMLElement} node The HTMLElement to use as the starting point 
         * @param {Function} method A boolean function used to test siblings
         * that receives the sibling node being tested as its only argument
         * @return {Object} HTMLElement or null if not found
         */
        getPreviousSiblingBy: function(node, method) {
            while (node) {
                node = node.previousSibling;
                if ( Y.Dom._testElement(node, method) ) {
                    return node;
                }
            }
            return null;
        }, 

        /**
         * Returns the previous sibling that is an HTMLElement 
         * @method getPreviousSibling
         * @param {String | HTMLElement} node The HTMLElement or an ID to use as the starting point 
         * @return {Object} HTMLElement or null if not found
         */
        getPreviousSibling: function(node) {
            node = Y.Dom.get(node);
            if (!node) {
                return null;
            }

            return Y.Dom.getPreviousSiblingBy(node);
        }, 

        /**
         * Returns the next HTMLElement sibling that passes the boolean method. 
         * For performance reasons, IDs are not accepted and argument validation omitted.
         * Returns the nearest HTMLElement sibling if no method provided.
         * @method getNextSiblingBy
         * @param {HTMLElement} node The HTMLElement to use as the starting point 
         * @param {Function} method A boolean function used to test siblings
         * that receives the sibling node being tested as its only argument
         * @return {Object} HTMLElement or null if not found
         */
        getNextSiblingBy: function(node, method) {
            while (node) {
                node = node.nextSibling;
                if ( Y.Dom._testElement(node, method) ) {
                    return node;
                }
            }
            return null;
        }, 

        /**
         * Returns the next sibling that is an HTMLElement 
         * @method getNextSibling
         * @param {String | HTMLElement} node The HTMLElement or an ID to use as the starting point 
         * @return {Object} HTMLElement or null if not found
         */
        getNextSibling: function(node) {
            node = Y.Dom.get(node);
            if (!node) {
                return null;
            }

            return Y.Dom.getNextSiblingBy(node);
        }, 

        /**
         * Returns the first HTMLElement child that passes the test method. 
         * @method getFirstChildBy
         * @param {HTMLElement} node The HTMLElement to use as the starting point 
         * @param {Function} method A boolean function used to test children
         * that receives the node being tested as its only argument
         * @return {Object} HTMLElement or null if not found
         */
        getFirstChildBy: function(node, method) {
            var child = ( Y.Dom._testElement(node.firstChild, method) ) ? node.firstChild : null;
            return child || Y.Dom.getNextSiblingBy(node.firstChild, method);
        }, 

        /**
         * Returns the first HTMLElement child. 
         * @method getFirstChild
         * @param {String | HTMLElement} node The HTMLElement or an ID to use as the starting point 
         * @return {Object} HTMLElement or null if not found
         */
        getFirstChild: function(node, method) {
            node = Y.Dom.get(node);
            if (!node) {
                return null;
            }
            return Y.Dom.getFirstChildBy(node);
        }, 

        /**
         * Returns the last HTMLElement child that passes the test method. 
         * @method getLastChildBy
         * @param {HTMLElement} node The HTMLElement to use as the starting point 
         * @param {Function} method A boolean function used to test children
         * that receives the node being tested as its only argument
         * @return {Object} HTMLElement or null if not found
         */
        getLastChildBy: function(node, method) {
            if (!node) {
                return null;
            }
            var child = ( Y.Dom._testElement(node.lastChild, method) ) ? node.lastChild : null;
            return child || Y.Dom.getPreviousSiblingBy(node.lastChild, method);
        }, 

        /**
         * Returns the last HTMLElement child. 
         * @method getLastChild
         * @param {String | HTMLElement} node The HTMLElement or an ID to use as the starting point 
         * @return {Object} HTMLElement or null if not found
         */
        getLastChild: function(node) {
            node = Y.Dom.get(node);
            return Y.Dom.getLastChildBy(node);
        }, 

        /**
         * Returns an array of HTMLElement childNodes that pass the test method. 
         * @method getChildrenBy
         * @param {HTMLElement} node The HTMLElement to start from
         * @param {Function} method A boolean function used to test children
         * that receives the node being tested as its only argument
         * @return {Array} A static array of HTMLElements
         */
        getChildrenBy: function(node, method) {
            var child = Y.Dom.getFirstChildBy(node, method),
                children = child ? [child] : [];

            Y.Dom.getNextSiblingBy(child, function(node) {
                if ( !method || method(node) ) {
                    children[children.length] = node;
                }
                return false; // fail test to collect all children
            });

            return children;
        },
 
        /**
         * Returns an array of HTMLElement childNodes. 
         * @method getChildren
         * @param {String | HTMLElement} node The HTMLElement or an ID to use as the starting point 
         * @return {Array} A static array of HTMLElements
         */
        getChildren: function(node) {
            node = Y.Dom.get(node);
            if (!node) {
            }

            return Y.Dom.getChildrenBy(node);
        },

        /**
         * Returns the left scroll value of the document 
         * @method getDocumentScrollLeft
         * @param {HTMLDocument} document (optional) The document to get the scroll value of
         * @return {Int}  The amount that the document is scrolled to the left
         */
        getDocumentScrollLeft: function(doc) {
            doc = doc || document;
            return Math.max(doc[DOCUMENT_ELEMENT].scrollLeft, doc.body.scrollLeft);
        }, 

        /**
         * Returns the top scroll value of the document 
         * @method getDocumentScrollTop
         * @param {HTMLDocument} document (optional) The document to get the scroll value of
         * @return {Int}  The amount that the document is scrolled to the top
         */
        getDocumentScrollTop: function(doc) {
            doc = doc || document;
            return Math.max(doc[DOCUMENT_ELEMENT].scrollTop, doc.body.scrollTop);
        },

        /**
         * Inserts the new node as the previous sibling of the reference node 
         * @method insertBefore
         * @param {String | HTMLElement} newNode The node to be inserted
         * @param {String | HTMLElement} referenceNode The node to insert the new node before 
         * @return {HTMLElement} The node that was inserted (or null if insert fails) 
         */
        insertBefore: function(newNode, referenceNode) {
            newNode = Y.Dom.get(newNode); 
            referenceNode = Y.Dom.get(referenceNode); 
            
            if (!newNode || !referenceNode || !referenceNode[PARENT_NODE]) {
                return null;
            }       

            return referenceNode[PARENT_NODE].insertBefore(newNode, referenceNode); 
        },

        /**
         * Inserts the new node as the next sibling of the reference node 
         * @method insertAfter
         * @param {String | HTMLElement} newNode The node to be inserted
         * @param {String | HTMLElement} referenceNode The node to insert the new node after 
         * @return {HTMLElement} The node that was inserted (or null if insert fails) 
         */
        insertAfter: function(newNode, referenceNode) {
            newNode = Y.Dom.get(newNode); 
            referenceNode = Y.Dom.get(referenceNode); 
            
            if (!newNode || !referenceNode || !referenceNode[PARENT_NODE]) {
                return null;
            }       

            if (referenceNode.nextSibling) {
                return referenceNode[PARENT_NODE].insertBefore(newNode, referenceNode.nextSibling); 
            } else {
                return referenceNode[PARENT_NODE].appendChild(newNode);
            }
        },

        /**
         * Creates a Region based on the viewport relative to the document. 
         * @method getClientRegion
         * @return {Region} A Region object representing the viewport which accounts for document scroll
         */
        getClientRegion: function() {
            var t = Y.Dom.getDocumentScrollTop(),
                l = Y.Dom.getDocumentScrollLeft(),
                r = Y.Dom.getViewportWidth() + l,
                b = Y.Dom.getViewportHeight() + t;

            return new Y.Region(t, r, b, l);
        },

        /**
         * Provides a normalized attribute interface. 
         * @method setAttibute
         * @param {String | HTMLElement} el The target element for the attribute.
         * @param {String} attr The attribute to set.
         * @param {String} val The value of the attribute.
         */
        setAttribute: function(el, attr, val) {
            attr = Y.Dom.CUSTOM_ATTRIBUTES[attr] || attr;
            el.setAttribute(attr, val);
        },


        /**
         * Provides a normalized attribute interface. 
         * @method getAttibute
         * @param {String | HTMLElement} el The target element for the attribute.
         * @param {String} attr The attribute to get.
         * @return {String} The current value of the attribute. 
         */
        getAttribute: function(el, attr) {
            attr = Y.Dom.CUSTOM_ATTRIBUTES[attr] || attr;
            return el.getAttribute(attr);
        },

        _toCamel: function(property) {
            var c = propertyCache;

            function tU(x,l) {
                return l.toUpperCase();
            }

            return c[property] || (c[property] = property.indexOf('-') === -1 ? 
                                    property :
                                    property.replace( /-([a-z])/gi, tU ));
        },

        _getClassRegex: function(className) {
            var re;
            if (className !== undefined) { // allow empty string to pass
                if (className.exec) { // already a RegExp
                    re = className;
                } else {
                    re = reCache[className];
                    if (!re) {
                        // escape special chars (".", "[", etc.)
                        className = className.replace(Y.Dom._patterns.CLASS_RE_TOKENS, '\\$1');
                        re = reCache[className] = new RegExp(C_START + className + C_END, G);
                    }
                }
            }
            return re;
        },

        _patterns: {
            ROOT_TAG: /^body|html$/i, // body for quirks mode, html for standards,
            CLASS_RE_TOKENS: /([\.\(\)\^\$\*\+\?\|\[\]\{\}])/g
        },


        _testElement: function(node, method) {
            return node && node[NODE_TYPE] == 1 && ( !method || method(node) );
        },

        _calcBorders: function(node, xy2) {
            var t = parseInt(Y.Dom[GET_COMPUTED_STYLE](node, BORDER_TOP_WIDTH), 10) || 0,
                l = parseInt(Y.Dom[GET_COMPUTED_STYLE](node, BORDER_LEFT_WIDTH), 10) || 0;
            if (isGecko) {
                if (RE_TABLE.test(node[TAG_NAME])) {
                    t = 0;
                    l = 0;
                }
            }
            xy2[0] += l;
            xy2[1] += t;
            return xy2;
        }
    };
        
    var _getComputedStyle = Y.Dom[GET_COMPUTED_STYLE];
    // fix opera computedStyle default color unit (convert to rgb)
    if (UA.opera) {
        Y.Dom[GET_COMPUTED_STYLE] = function(node, att) {
            var val = _getComputedStyle(node, att);
            if (RE_COLOR.test(att)) {
                val = Y.Dom.Color.toRGB(val);
            }

            return val;
        };

    }

    // safari converts transparent to rgba(), others use "transparent"
    if (UA.webkit) {
        Y.Dom[GET_COMPUTED_STYLE] = function(node, att) {
            var val = _getComputedStyle(node, att);

            if (val === 'rgba(0, 0, 0, 0)') {
                val = 'transparent'; 
            }

            return val;
        };

    }
})();
/**
 * A region is a representation of an object on a grid.  It is defined
 * by the top, right, bottom, left extents, so is rectangular by default.  If 
 * other shapes are required, this class could be extended to support it.
 * @namespace YAHOO.util
 * @class Region
 * @param {Int} t the top extent
 * @param {Int} r the right extent
 * @param {Int} b the bottom extent
 * @param {Int} l the left extent
 * @constructor
 */
YAHOO.util.Region = function(t, r, b, l) {

    /**
     * The region's top extent
     * @property top
     * @type Int
     */
    this.top = t;
    
    /**
     * The region's top extent
     * @property y
     * @type Int
     */
    this.y = t;
    
    /**
     * The region's top extent as index, for symmetry with set/getXY
     * @property 1
     * @type Int
     */
    this[1] = t;

    /**
     * The region's right extent
     * @property right
     * @type int
     */
    this.right = r;

    /**
     * The region's bottom extent
     * @property bottom
     * @type Int
     */
    this.bottom = b;

    /**
     * The region's left extent
     * @property left
     * @type Int
     */
    this.left = l;
    
    /**
     * The region's left extent
     * @property x
     * @type Int
     */
    this.x = l;
    
    /**
     * The region's left extent as index, for symmetry with set/getXY
     * @property 0
     * @type Int
     */
    this[0] = l;

    /**
     * The region's total width 
     * @property width 
     * @type Int
     */
    this.width = this.right - this.left;

    /**
     * The region's total height 
     * @property height 
     * @type Int
     */
    this.height = this.bottom - this.top;
};

/**
 * Returns true if this region contains the region passed in
 * @method contains
 * @param  {Region}  region The region to evaluate
 * @return {Boolean}        True if the region is contained with this region, 
 *                          else false
 */
YAHOO.util.Region.prototype.contains = function(region) {
    return ( region.left   >= this.left   && 
             region.right  <= this.right  && 
             region.top    >= this.top    && 
             region.bottom <= this.bottom    );

};

/**
 * Returns the area of the region
 * @method getArea
 * @return {Int} the region's area
 */
YAHOO.util.Region.prototype.getArea = function() {
    return ( (this.bottom - this.top) * (this.right - this.left) );
};

/**
 * Returns the region where the passed in region overlaps with this one
 * @method intersect
 * @param  {Region} region The region that intersects
 * @return {Region}        The overlap region, or null if there is no overlap
 */
YAHOO.util.Region.prototype.intersect = function(region) {
    var t = Math.max( this.top,    region.top    ),
        r = Math.min( this.right,  region.right  ),
        b = Math.min( this.bottom, region.bottom ),
        l = Math.max( this.left,   region.left   );
    
    if (b >= t && r >= l) {
        return new YAHOO.util.Region(t, r, b, l);
    } else {
        return null;
    }
};

/**
 * Returns the region representing the smallest region that can contain both
 * the passed in region and this region.
 * @method union
 * @param  {Region} region The region that to create the union with
 * @return {Region}        The union region
 */
YAHOO.util.Region.prototype.union = function(region) {
    var t = Math.min( this.top,    region.top    ),
        r = Math.max( this.right,  region.right  ),
        b = Math.max( this.bottom, region.bottom ),
        l = Math.min( this.left,   region.left   );

    return new YAHOO.util.Region(t, r, b, l);
};

/**
 * toString
 * @method toString
 * @return string the region properties
 */
YAHOO.util.Region.prototype.toString = function() {
    return ( "Region {"    +
             "top: "       + this.top    + 
             ", right: "   + this.right  + 
             ", bottom: "  + this.bottom + 
             ", left: "    + this.left   + 
             ", height: "  + this.height + 
             ", width: "    + this.width   + 
             "}" );
};

/**
 * Returns a region that is occupied by the DOM element
 * @method getRegion
 * @param  {HTMLElement} el The element
 * @return {Region}         The region that the element occupies
 * @static
 */
YAHOO.util.Region.getRegion = function(el) {
    var p = YAHOO.util.Dom.getXY(el),
        t = p[1],
        r = p[0] + el.offsetWidth,
        b = p[1] + el.offsetHeight,
        l = p[0];

    return new YAHOO.util.Region(t, r, b, l);
};

/////////////////////////////////////////////////////////////////////////////


/**
 * A point is a region that is special in that it represents a single point on 
 * the grid.
 * @namespace YAHOO.util
 * @class Point
 * @param {Int} x The X position of the point
 * @param {Int} y The Y position of the point
 * @constructor
 * @extends YAHOO.util.Region
 */
YAHOO.util.Point = function(x, y) {
   if (YAHOO.lang.isArray(x)) { // accept input from Dom.getXY, Event.getXY, etc.
      y = x[1]; // dont blow away x yet
      x = x[0];
   }
 
    YAHOO.util.Point.superclass.constructor.call(this, y, x, y, x);
};

YAHOO.extend(YAHOO.util.Point, YAHOO.util.Region);

(function() {
/**
 * Add style management functionality to DOM.
 * @module dom
 * @for Dom
 */

var Y = YAHOO.util, 
    CLIENT_TOP = 'clientTop',
    CLIENT_LEFT = 'clientLeft',
    PARENT_NODE = 'parentNode',
    RIGHT = 'right',
    HAS_LAYOUT = 'hasLayout',
    PX = 'px',
    OPACITY = 'opacity',
    AUTO = 'auto',
    BORDER_LEFT_WIDTH = 'borderLeftWidth',
    BORDER_TOP_WIDTH = 'borderTopWidth',
    BORDER_RIGHT_WIDTH = 'borderRightWidth',
    BORDER_BOTTOM_WIDTH = 'borderBottomWidth',
    VISIBLE = 'visible',
    TRANSPARENT = 'transparent',
    HEIGHT = 'height',
    WIDTH = 'width',
    STYLE = 'style',
    CURRENT_STYLE = 'currentStyle',

// IE getComputedStyle
// TODO: unit-less lineHeight (e.g. 1.22)
    re_size = /^width|height$/,
    re_unit = /^(\d[.\d]*)+(em|ex|px|gd|rem|vw|vh|vm|ch|mm|cm|in|pt|pc|deg|rad|ms|s|hz|khz|%){1}?/i,

    ComputedStyle = {
        get: function(el, property) {
            var value = '',
                current = el[CURRENT_STYLE][property];

            if (property === OPACITY) {
                value = Y.Dom.getStyle(el, OPACITY);        
            } else if (!current || (current.indexOf && current.indexOf(PX) > -1)) { // no need to convert
                value = current;
            } else if (Y.Dom.IE_COMPUTED[property]) { // use compute function
                value = Y.Dom.IE_COMPUTED[property](el, property);
            } else if (re_unit.test(current)) { // convert to pixel
                value = Y.Dom.IE.ComputedStyle.getPixel(el, property);
            } else {
                value = current;
            }

            return value;
        },

        getOffset: function(el, prop) {
            var current = el[CURRENT_STYLE][prop],                        // value of "width", "top", etc.
                capped = prop.charAt(0).toUpperCase() + prop.substr(1), // "Width", "Top", etc.
                offset = 'offset' + capped,                             // "offsetWidth", "offsetTop", etc.
                pixel = 'pixel' + capped,                               // "pixelWidth", "pixelTop", etc.
                value = '',
                actual;

            if (current == AUTO) {
                actual = el[offset]; // offsetHeight/Top etc.
                if (actual === undefined) { // likely "right" or "bottom"
                    value = 0;
                }

                value = actual;
                if (re_size.test(prop)) { // account for box model diff 
                    el[STYLE][prop] = actual; 
                    if (el[offset] > actual) {
                        // the difference is padding + border (works in Standards & Quirks modes)
                        value = actual - (el[offset] - actual);
                    }
                    el[STYLE][prop] = AUTO; // revert to auto
                }
            } else { // convert units to px
                if (!el[STYLE][pixel] && !el[STYLE][prop]) { // need to map style.width to currentStyle (no currentStyle.pixelWidth)
                    el[STYLE][prop] = current;              // no style.pixelWidth if no style.width
                }
                value = el[STYLE][pixel];
            }
            return value + PX;
        },

        getBorderWidth: function(el, property) {
            // clientHeight/Width = paddingBox (e.g. offsetWidth - borderWidth)
            // clientTop/Left = borderWidth
            var value = null;
            if (!el[CURRENT_STYLE][HAS_LAYOUT]) { // TODO: unset layout?
                el[STYLE].zoom = 1; // need layout to measure client
            }

            switch(property) {
                case BORDER_TOP_WIDTH:
                    value = el[CLIENT_TOP];
                    break;
                case BORDER_BOTTOM_WIDTH:
                    value = el.offsetHeight - el.clientHeight - el[CLIENT_TOP];
                    break;
                case BORDER_LEFT_WIDTH:
                    value = el[CLIENT_LEFT];
                    break;
                case BORDER_RIGHT_WIDTH:
                    value = el.offsetWidth - el.clientWidth - el[CLIENT_LEFT];
                    break;
            }
            return value + PX;
        },

        getPixel: function(node, att) {
            // use pixelRight to convert to px
            var val = null,
                styleRight = node[CURRENT_STYLE][RIGHT],
                current = node[CURRENT_STYLE][att];

            node[STYLE][RIGHT] = current;
            val = node[STYLE].pixelRight;
            node[STYLE][RIGHT] = styleRight; // revert

            return val + PX;
        },

        getMargin: function(node, att) {
            var val;
            if (node[CURRENT_STYLE][att] == AUTO) {
                val = 0 + PX;
            } else {
                val = Y.Dom.IE.ComputedStyle.getPixel(node, att);
            }
            return val;
        },

        getVisibility: function(node, att) {
            var current;
            while ( (current = node[CURRENT_STYLE]) && current[att] == 'inherit') { // NOTE: assignment in test
                node = node[PARENT_NODE];
            }
            return (current) ? current[att] : VISIBLE;
        },

        getColor: function(node, att) {
            return Y.Dom.Color.toRGB(node[CURRENT_STYLE][att]) || TRANSPARENT;
        },

        getBorderColor: function(node, att) {
            var current = node[CURRENT_STYLE],
                val = current[att] || current.color;
            return Y.Dom.Color.toRGB(Y.Dom.Color.toHex(val));
        }

    },

//fontSize: getPixelFont,
    IEComputed = {};

IEComputed.top = IEComputed.right = IEComputed.bottom = IEComputed.left = 
        IEComputed[WIDTH] = IEComputed[HEIGHT] = ComputedStyle.getOffset;

IEComputed.color = ComputedStyle.getColor;

IEComputed[BORDER_TOP_WIDTH] = IEComputed[BORDER_RIGHT_WIDTH] =
        IEComputed[BORDER_BOTTOM_WIDTH] = IEComputed[BORDER_LEFT_WIDTH] =
        ComputedStyle.getBorderWidth;

IEComputed.marginTop = IEComputed.marginRight = IEComputed.marginBottom =
        IEComputed.marginLeft = ComputedStyle.getMargin;

IEComputed.visibility = ComputedStyle.getVisibility;
IEComputed.borderColor = IEComputed.borderTopColor =
        IEComputed.borderRightColor = IEComputed.borderBottomColor =
        IEComputed.borderLeftColor = ComputedStyle.getBorderColor;

Y.Dom.IE_COMPUTED = IEComputed;
Y.Dom.IE_ComputedStyle = ComputedStyle;
})();
(function() {
/**
 * Add style management functionality to DOM.
 * @module dom
 * @for Dom
 */

var TO_STRING = 'toString',
    PARSE_INT = parseInt,
    RE = RegExp,
    Y = YAHOO.util;

Y.Dom.Color = {
    KEYWORDS: {
        black: '000',
        silver: 'c0c0c0',
        gray: '808080',
        white: 'fff',
        maroon: '800000',
        red: 'f00',
        purple: '800080',
        fuchsia: 'f0f',
        green: '008000',
        lime: '0f0',
        olive: '808000',
        yellow: 'ff0',
        navy: '000080',
        blue: '00f',
        teal: '008080',
        aqua: '0ff'
    },

    re_RGB: /^rgb\(([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\)$/i,
    re_hex: /^#?([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})$/i,
    re_hex3: /([0-9A-F])/gi,

    toRGB: function(val) {
        if (!Y.Dom.Color.re_RGB.test(val)) {
            val = Y.Dom.Color.toHex(val);
        }

        if(Y.Dom.Color.re_hex.exec(val)) {
            val = 'rgb(' + [
                PARSE_INT(RE.$1, 16),
                PARSE_INT(RE.$2, 16),
                PARSE_INT(RE.$3, 16)
            ].join(', ') + ')';
        }
        return val;
    },

    toHex: function(val) {
        val = Y.Dom.Color.KEYWORDS[val] || val;
        if (Y.Dom.Color.re_RGB.exec(val)) {
            var r = (RE.$1.length === 1) ? '0' + RE.$1 : Number(RE.$1),
                g = (RE.$2.length === 1) ? '0' + RE.$2 : Number(RE.$2),
                b = (RE.$3.length === 1) ? '0' + RE.$3 : Number(RE.$3);

            val = [
                r[TO_STRING](16),
                g[TO_STRING](16),
                b[TO_STRING](16)
            ].join('');
        }

        if (val.length < 6) {
            val = val.replace(Y.Dom.Color.re_hex3, '$1$1');
        }

        if (val !== 'transparent' && val.indexOf('#') < 0) {
            val = '#' + val;
        }

        return val.toLowerCase();
    }
};
}());
YAHOO.register("dom", YAHOO.util.Dom, {version: "2.7.0", build: "1796"});
/*
Copyright (c) 2009, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
version: 2.7.0
*/

/**
 * The CustomEvent class lets you define events for your application
 * that can be subscribed to by one or more independent component.
 *
 * @param {String}  type The type of event, which is passed to the callback
 *                  when the event fires
 * @param {Object}  context The context the event will fire from.  "this" will
 *                  refer to this object in the callback.  Default value: 
 *                  the window object.  The listener can override this.
 * @param {boolean} silent pass true to prevent the event from writing to
 *                  the debugsystem
 * @param {int}     signature the signature that the custom event subscriber
 *                  will receive. YAHOO.util.CustomEvent.LIST or 
 *                  YAHOO.util.CustomEvent.FLAT.  The default is
 *                  YAHOO.util.CustomEvent.LIST.
 * @namespace YAHOO.util
 * @class CustomEvent
 * @constructor
 */
YAHOO.util.CustomEvent = function(type, context, silent, signature) {

    /**
     * The type of event, returned to subscribers when the event fires
     * @property type
     * @type string
     */
    this.type = type;

    /**
     * The context the the event will fire from by default.  Defaults to the window 
     * obj
     * @property scope
     * @type object
     */
    this.scope = context || window;

    /**
     * By default all custom events are logged in the debug build, set silent
     * to true to disable debug outpu for this event.
     * @property silent
     * @type boolean
     */
    this.silent = silent;

    /**
     * Custom events support two styles of arguments provided to the event
     * subscribers.  
     * <ul>
     * <li>YAHOO.util.CustomEvent.LIST: 
     *   <ul>
     *   <li>param1: event name</li>
     *   <li>param2: array of arguments sent to fire</li>
     *   <li>param3: <optional> a custom object supplied by the subscriber</li>
     *   </ul>
     * </li>
     * <li>YAHOO.util.CustomEvent.FLAT
     *   <ul>
     *   <li>param1: the first argument passed to fire.  If you need to
     *           pass multiple parameters, use and array or object literal</li>
     *   <li>param2: <optional> a custom object supplied by the subscriber</li>
     *   </ul>
     * </li>
     * </ul>
     *   @property signature
     *   @type int
     */
    this.signature = signature || YAHOO.util.CustomEvent.LIST;

    /**
     * The subscribers to this event
     * @property subscribers
     * @type Subscriber[]
     */
    this.subscribers = [];

    if (!this.silent) {
    }

    var onsubscribeType = "_YUICEOnSubscribe";

    // Only add subscribe events for events that are not generated by 
    // CustomEvent
    if (type !== onsubscribeType) {

        /**
         * Custom events provide a custom event that fires whenever there is
         * a new subscriber to the event.  This provides an opportunity to
         * handle the case where there is a non-repeating event that has
         * already fired has a new subscriber.  
         *
         * @event subscribeEvent
         * @type YAHOO.util.CustomEvent
         * @param {Function} fn The function to execute
         * @param {Object}   obj An object to be passed along when the event 
         *                       fires defaults to the custom event
         * @param {boolean|Object}  override If true, the obj passed in becomes 
         *                                   the execution context of the listener.
         *                                   if an object, that object becomes the
         *                                   the execution context. defaults to
         *                                   the custom event
         */
        this.subscribeEvent = 
                new YAHOO.util.CustomEvent(onsubscribeType, this, true);

    } 


    /**
     * In order to make it possible to execute the rest of the subscriber
     * stack when one thows an exception, the subscribers exceptions are
     * caught.  The most recent exception is stored in this property
     * @property lastError
     * @type Error
     */
    this.lastError = null;
};

/**
 * Subscriber listener sigature constant.  The LIST type returns three
 * parameters: the event type, the array of args passed to fire, and
 * the optional custom object
 * @property YAHOO.util.CustomEvent.LIST
 * @static
 * @type int
 */
YAHOO.util.CustomEvent.LIST = 0;

/**
 * Subscriber listener sigature constant.  The FLAT type returns two
 * parameters: the first argument passed to fire and the optional 
 * custom object
 * @property YAHOO.util.CustomEvent.FLAT
 * @static
 * @type int
 */
YAHOO.util.CustomEvent.FLAT = 1;

YAHOO.util.CustomEvent.prototype = {

    /**
     * Subscribes the caller to this event
     * @method subscribe
     * @param {Function} fn        The function to execute
     * @param {Object}   obj       An object to be passed along when the event 
     *                             fires
     * @param {boolean|Object}  overrideContext If true, the obj passed in becomes 
     *                                   the execution context of the listener.
     *                                   if an object, that object becomes the
     *                                   the execution context.
     */
    subscribe: function(fn, obj, overrideContext) {

        if (!fn) {
throw new Error("Invalid callback for subscriber to '" + this.type + "'");
        }

        if (this.subscribeEvent) {
            this.subscribeEvent.fire(fn, obj, overrideContext);
        }

        this.subscribers.push( new YAHOO.util.Subscriber(fn, obj, overrideContext) );
    },

    /**
     * Unsubscribes subscribers.
     * @method unsubscribe
     * @param {Function} fn  The subscribed function to remove, if not supplied
     *                       all will be removed
     * @param {Object}   obj  The custom object passed to subscribe.  This is
     *                        optional, but if supplied will be used to
     *                        disambiguate multiple listeners that are the same
     *                        (e.g., you subscribe many object using a function
     *                        that lives on the prototype)
     * @return {boolean} True if the subscriber was found and detached.
     */
    unsubscribe: function(fn, obj) {

        if (!fn) {
            return this.unsubscribeAll();
        }

        var found = false;
        for (var i=0, len=this.subscribers.length; i<len; ++i) {
            var s = this.subscribers[i];
            if (s && s.contains(fn, obj)) {
                this._delete(i);
                found = true;
            }
        }

        return found;
    },

    /**
     * Notifies the subscribers.  The callback functions will be executed
     * from the context specified when the event was created, and with the 
     * following parameters:
     *   <ul>
     *   <li>The type of event</li>
     *   <li>All of the arguments fire() was executed with as an array</li>
     *   <li>The custom object (if any) that was passed into the subscribe() 
     *       method</li>
     *   </ul>
     * @method fire 
     * @param {Object*} arguments an arbitrary set of parameters to pass to 
     *                            the handler.
     * @return {boolean} false if one of the subscribers returned false, 
     *                   true otherwise
     */
    fire: function() {

        this.lastError = null;

        var errors = [],
            len=this.subscribers.length;

        if (!len && this.silent) {
            return true;
        }

        var args=[].slice.call(arguments, 0), ret=true, i, rebuild=false;

        if (!this.silent) {
        }

        // make a copy of the subscribers so that there are
        // no index problems if one subscriber removes another.
        var subs = this.subscribers.slice(), throwErrors = YAHOO.util.Event.throwErrors;

        for (i=0; i<len; ++i) {
            var s = subs[i];
            if (!s) {
                rebuild=true;
            } else {
                if (!this.silent) {
                }

                var scope = s.getScope(this.scope);

                if (this.signature == YAHOO.util.CustomEvent.FLAT) {
                    var param = null;
                    if (args.length > 0) {
                        param = args[0];
                    }

                    try {
                        ret = s.fn.call(scope, param, s.obj);
                    } catch(e) {
                        this.lastError = e;
                        // errors.push(e);
                        if (throwErrors) {
                            throw e;
                        }
                    }
                } else {
                    try {
                        ret = s.fn.call(scope, this.type, args, s.obj);
                    } catch(ex) {
                        this.lastError = ex;
                        if (throwErrors) {
                            throw ex;
                        }
                    }
                }

                if (false === ret) {
                    if (!this.silent) {
                    }

                    break;
                    // return false;
                }
            }
        }

        return (ret !== false);
    },

    /**
     * Removes all listeners
     * @method unsubscribeAll
     * @return {int} The number of listeners unsubscribed
     */
    unsubscribeAll: function() {
        var l = this.subscribers.length, i;
        for (i=l-1; i>-1; i--) {
            this._delete(i);
        }

        this.subscribers=[];

        return l;
    },

    /**
     * @method _delete
     * @private
     */
    _delete: function(index) {
        var s = this.subscribers[index];
        if (s) {
            delete s.fn;
            delete s.obj;
        }

        // this.subscribers[index]=null;
        this.subscribers.splice(index, 1);
    },

    /**
     * @method toString
     */
    toString: function() {
         return "CustomEvent: " + "'" + this.type  + "', " + 
             "context: " + this.scope;

    }
};

/////////////////////////////////////////////////////////////////////

/**
 * Stores the subscriber information to be used when the event fires.
 * @param {Function} fn       The function to execute
 * @param {Object}   obj      An object to be passed along when the event fires
 * @param {boolean}  overrideContext If true, the obj passed in becomes the execution
 *                            context of the listener
 * @class Subscriber
 * @constructor
 */
YAHOO.util.Subscriber = function(fn, obj, overrideContext) {

    /**
     * The callback that will be execute when the event fires
     * @property fn
     * @type function
     */
    this.fn = fn;

    /**
     * An optional custom object that will passed to the callback when
     * the event fires
     * @property obj
     * @type object
     */
    this.obj = YAHOO.lang.isUndefined(obj) ? null : obj;

    /**
     * The default execution context for the event listener is defined when the
     * event is created (usually the object which contains the event).
     * By setting overrideContext to true, the execution context becomes the custom
     * object passed in by the subscriber.  If overrideContext is an object, that 
     * object becomes the context.
     * @property overrideContext
     * @type boolean|object
     */
    this.overrideContext = overrideContext;

};

/**
 * Returns the execution context for this listener.  If overrideContext was set to true
 * the custom obj will be the context.  If overrideContext is an object, that is the
 * context, otherwise the default context will be used.
 * @method getScope
 * @param {Object} defaultScope the context to use if this listener does not
 *                              override it.
 */
YAHOO.util.Subscriber.prototype.getScope = function(defaultScope) {
    if (this.overrideContext) {
        if (this.overrideContext === true) {
            return this.obj;
        } else {
            return this.overrideContext;
        }
    }
    return defaultScope;
};

/**
 * Returns true if the fn and obj match this objects properties.
 * Used by the unsubscribe method to match the right subscriber.
 *
 * @method contains
 * @param {Function} fn the function to execute
 * @param {Object} obj an object to be passed along when the event fires
 * @return {boolean} true if the supplied arguments match this 
 *                   subscriber's signature.
 */
YAHOO.util.Subscriber.prototype.contains = function(fn, obj) {
    if (obj) {
        return (this.fn == fn && this.obj == obj);
    } else {
        return (this.fn == fn);
    }
};

/**
 * @method toString
 */
YAHOO.util.Subscriber.prototype.toString = function() {
    return "Subscriber { obj: " + this.obj  + 
           ", overrideContext: " +  (this.overrideContext || "no") + " }";
};

/**
 * The Event Utility provides utilities for managing DOM Events and tools
 * for building event systems
 *
 * @module event
 * @title Event Utility
 * @namespace YAHOO.util
 * @requires yahoo
 */

// The first instance of Event will win if it is loaded more than once.
// @TODO this needs to be changed so that only the state data that needs to
// be preserved is kept, while methods are overwritten/added as needed.
// This means that the module pattern can't be used.
if (!YAHOO.util.Event) {

/**
 * The event utility provides functions to add and remove event listeners,
 * event cleansing.  It also tries to automatically remove listeners it
 * registers during the unload event.
 *
 * @class Event
 * @static
 */
    YAHOO.util.Event = function() {

        /**
         * True after the onload event has fired
         * @property loadComplete
         * @type boolean
         * @static
         * @private
         */
        var loadComplete =  false;

        /**
         * Cache of wrapped listeners
         * @property listeners
         * @type array
         * @static
         * @private
         */
        var listeners = [];

        /**
         * User-defined unload function that will be fired before all events
         * are detached
         * @property unloadListeners
         * @type array
         * @static
         * @private
         */
        var unloadListeners = [];

        /**
         * Cache of DOM0 event handlers to work around issues with DOM2 events
         * in Safari
         * @property legacyEvents
         * @static
         * @private
         */
        var legacyEvents = [];

        /**
         * Listener stack for DOM0 events
         * @property legacyHandlers
         * @static
         * @private
         */
        var legacyHandlers = [];

        /**
         * The number of times to poll after window.onload.  This number is
         * increased if additional late-bound handlers are requested after
         * the page load.
         * @property retryCount
         * @static
         * @private
         */
        var retryCount = 0;

        /**
         * onAvailable listeners
         * @property onAvailStack
         * @static
         * @private
         */
        var onAvailStack = [];

        /**
         * Lookup table for legacy events
         * @property legacyMap
         * @static
         * @private
         */
        var legacyMap = [];

        /**
         * Counter for auto id generation
         * @property counter
         * @static
         * @private
         */
        var counter = 0;
        
        /**
         * Normalized keycodes for webkit/safari
         * @property webkitKeymap
         * @type {int: int}
         * @private
         * @static
         * @final
         */
        var webkitKeymap = {
            63232: 38, // up
            63233: 40, // down
            63234: 37, // left
            63235: 39, // right
            63276: 33, // page up
            63277: 34, // page down
            25: 9      // SHIFT-TAB (Safari provides a different key code in
                       // this case, even though the shiftKey modifier is set)
        };
        
        // String constants used by the addFocusListener and removeFocusListener methods
        var _FOCUS = YAHOO.env.ua.ie ? "focusin" : "focus";
        var _BLUR = YAHOO.env.ua.ie ? "focusout" : "blur";      

        return {

            /**
             * The number of times we should look for elements that are not
             * in the DOM at the time the event is requested after the document
             * has been loaded.  The default is 2000@amp;20 ms, so it will poll
             * for 40 seconds or until all outstanding handlers are bound
             * (whichever comes first).
             * @property POLL_RETRYS
             * @type int
             * @static
             * @final
             */
            POLL_RETRYS: 2000,

            /**
             * The poll interval in milliseconds
             * @property POLL_INTERVAL
             * @type int
             * @static
             * @final
             */
            POLL_INTERVAL: 20,

            /**
             * Element to bind, int constant
             * @property EL
             * @type int
             * @static
             * @final
             */
            EL: 0,

            /**
             * Type of event, int constant
             * @property TYPE
             * @type int
             * @static
             * @final
             */
            TYPE: 1,

            /**
             * Function to execute, int constant
             * @property FN
             * @type int
             * @static
             * @final
             */
            FN: 2,

            /**
             * Function wrapped for context correction and cleanup, int constant
             * @property WFN
             * @type int
             * @static
             * @final
             */
            WFN: 3,

            /**
             * Object passed in by the user that will be returned as a 
             * parameter to the callback, int constant.  Specific to
             * unload listeners
             * @property OBJ
             * @type int
             * @static
             * @final
             */
            UNLOAD_OBJ: 3,

            /**
             * Adjusted context, either the element we are registering the event
             * on or the custom object passed in by the listener, int constant
             * @property ADJ_SCOPE
             * @type int
             * @static
             * @final
             */
            ADJ_SCOPE: 4,

            /**
             * The original obj passed into addListener
             * @property OBJ
             * @type int
             * @static
             * @final
             */
            OBJ: 5,

            /**
             * The original context parameter passed into addListener
             * @property OVERRIDE
             * @type int
             * @static
             * @final
             */
            OVERRIDE: 6,

            /**
             * addListener/removeListener can throw errors in unexpected scenarios.
             * These errors are suppressed, the method returns false, and this property
             * is set
             * @property lastError
             * @static
             * @type Error
             */
            lastError: null,

            /**
             * Safari detection
             * @property isSafari
             * @private
             * @static
             * @deprecated use YAHOO.env.ua.webkit
             */
            isSafari: YAHOO.env.ua.webkit,
            
            /**
             * webkit version
             * @property webkit
             * @type string
             * @private
             * @static
             * @deprecated use YAHOO.env.ua.webkit
             */
            webkit: YAHOO.env.ua.webkit,
            
            /**
             * IE detection 
             * @property isIE
             * @private
             * @static
             * @deprecated use YAHOO.env.ua.ie
             */
            isIE: YAHOO.env.ua.ie,

            /**
             * poll handle
             * @property _interval
             * @static
             * @private
             */
            _interval: null,

            /**
             * document readystate poll handle
             * @property _dri
             * @static
             * @private
             */
             _dri: null,

            /**
             * True when the document is initially usable
             * @property DOMReady
             * @type boolean
             * @static
             */
            DOMReady: false,

            /**
             * Errors thrown by subscribers of custom events are caught
             * and the error message is written to the debug console.  If
             * this property is set to true, it will also re-throw the
             * error.
             * @property throwErrors
             * @type boolean
             * @default false
             */
            throwErrors: false,

            /**
             * @method startInterval
             * @static
             * @private
             */
            startInterval: function() {
                if (!this._interval) {
                    var self = this;
                    var callback = function() { self._tryPreloadAttach(); };
                    this._interval = setInterval(callback, this.POLL_INTERVAL);
                }
            },

            /**
             * Executes the supplied callback when the item with the supplied
             * id is found.  This is meant to be used to execute behavior as
             * soon as possible as the page loads.  If you use this after the
             * initial page load it will poll for a fixed time for the element.
             * The number of times it will poll and the frequency are
             * configurable.  By default it will poll for 10 seconds.
             *
             * <p>The callback is executed with a single parameter:
             * the custom object parameter, if provided.</p>
             *
             * @method onAvailable
             *
             * @param {string||string[]}   id the id of the element, or an array
             * of ids to look for.
             * @param {function} fn what to execute when the element is found.
             * @param {object}   obj an optional object to be passed back as
             *                   a parameter to fn.
             * @param {boolean|object}  overrideContext If set to true, fn will execute
             *                   in the context of obj, if set to an object it
             *                   will execute in the context of that object
             * @param checkContent {boolean} check child node readiness (onContentReady)
             * @static
             */
            onAvailable: function(id, fn, obj, overrideContext, checkContent) {

                var a = (YAHOO.lang.isString(id)) ? [id] : id;

                for (var i=0; i<a.length; i=i+1) {
                    onAvailStack.push({id:         a[i], 
                                       fn:         fn, 
                                       obj:        obj, 
                                       overrideContext:   overrideContext, 
                                       checkReady: checkContent });
                }

                retryCount = this.POLL_RETRYS;

                this.startInterval();
            },

            /**
             * Works the same way as onAvailable, but additionally checks the
             * state of sibling elements to determine if the content of the
             * available element is safe to modify.
             *
             * <p>The callback is executed with a single parameter:
             * the custom object parameter, if provided.</p>
             *
             * @method onContentReady
             *
             * @param {string}   id the id of the element to look for.
             * @param {function} fn what to execute when the element is ready.
             * @param {object}   obj an optional object to be passed back as
             *                   a parameter to fn.
             * @param {boolean|object}  overrideContext If set to true, fn will execute
             *                   in the context of obj.  If an object, fn will
             *                   exectute in the context of that object
             *
             * @static
             */
            onContentReady: function(id, fn, obj, overrideContext) {
                this.onAvailable(id, fn, obj, overrideContext, true);
            },

            /**
             * Executes the supplied callback when the DOM is first usable.  This
             * will execute immediately if called after the DOMReady event has
             * fired.   @todo the DOMContentReady event does not fire when the
             * script is dynamically injected into the page.  This means the
             * DOMReady custom event will never fire in FireFox or Opera when the
             * library is injected.  It _will_ fire in Safari, and the IE 
             * implementation would allow for us to fire it if the defered script
             * is not available.  We want this to behave the same in all browsers.
             * Is there a way to identify when the script has been injected 
             * instead of included inline?  Is there a way to know whether the 
             * window onload event has fired without having had a listener attached 
             * to it when it did so?
             *
             * <p>The callback is a CustomEvent, so the signature is:</p>
             * <p>type &lt;string&gt;, args &lt;array&gt;, customobject &lt;object&gt;</p>
             * <p>For DOMReady events, there are no fire argments, so the
             * signature is:</p>
             * <p>"DOMReady", [], obj</p>
             *
             *
             * @method onDOMReady
             *
             * @param {function} fn what to execute when the element is found.
             * @param {object}   obj an optional object to be passed back as
             *                   a parameter to fn.
             * @param {boolean|object}  overrideContext If set to true, fn will execute
             *                   in the context of obj, if set to an object it
             *                   will execute in the context of that object
             *
             * @static
             */
            onDOMReady: function(fn, obj, overrideContext) {
                if (this.DOMReady) {
                    setTimeout(function() {
                        var s = window;
                        if (overrideContext) {
                            if (overrideContext === true) {
                                s = obj;
                            } else {
                                s = overrideContext;
                            }
                        }
                        fn.call(s, "DOMReady", [], obj);
                    }, 0);
                } else {
                    this.DOMReadyEvent.subscribe(fn, obj, overrideContext);
                }
            },


            /**
             * Appends an event handler
             *
             * @method _addListener
             *
             * @param {String|HTMLElement|Array|NodeList} el An id, an element 
             *  reference, or a collection of ids and/or elements to assign the 
             *  listener to.
             * @param {String}   sType     The type of event to append
             * @param {Function} fn        The method the event invokes
             * @param {Object}   obj    An arbitrary object that will be 
             *                             passed as a parameter to the handler
             * @param {Boolean|object}  overrideContext  If true, the obj passed in becomes
             *                             the execution context of the listener. If an
             *                             object, this object becomes the execution
             *                             context.
             * @param {boolen}      capture capture or bubble phase
             * @return {Boolean} True if the action was successful or defered,
             *                        false if one or more of the elements 
             *                        could not have the listener attached,
             *                        or if the operation throws an exception.
             * @private
             * @static
             */
            _addListener: function(el, sType, fn, obj, overrideContext, bCapture) {

                if (!fn || !fn.call) {
                    return false;
                }

                // The el argument can be an array of elements or element ids.
                if ( this._isValidCollection(el)) {
                    var ok = true;
                    for (var i=0,len=el.length; i<len; ++i) {
                        ok = this.on(el[i], 
                                       sType, 
                                       fn, 
                                       obj, 
                                       overrideContext) && ok;
                    }
                    return ok;

                } else if (YAHOO.lang.isString(el)) {
                    var oEl = this.getEl(el);
                    // If the el argument is a string, we assume it is 
                    // actually the id of the element.  If the page is loaded
                    // we convert el to the actual element, otherwise we 
                    // defer attaching the event until onload event fires

                    // check to see if we need to delay hooking up the event 
                    // until after the page loads.
                    if (oEl) {
                        el = oEl;
                    } else {
                        // defer adding the event until the element is available
                        this.onAvailable(el, function() {
                           YAHOO.util.Event.on(el, sType, fn, obj, overrideContext);
                        });

                        return true;
                    }
                }

                // Element should be an html element or an array if we get 
                // here.
                if (!el) {
                    return false;
                }

                // we need to make sure we fire registered unload events 
                // prior to automatically unhooking them.  So we hang on to 
                // these instead of attaching them to the window and fire the
                // handles explicitly during our one unload event.
                if ("unload" == sType && obj !== this) {
                    unloadListeners[unloadListeners.length] =
                            [el, sType, fn, obj, overrideContext];
                    return true;
                }


                // if the user chooses to override the context, we use the custom
                // object passed in, otherwise the executing context will be the
                // HTML element that the event is registered on
                var context = el;
                if (overrideContext) {
                    if (overrideContext === true) {
                        context = obj;
                    } else {
                        context = overrideContext;
                    }
                }

                // wrap the function so we can return the obj object when
                // the event fires;
                var wrappedFn = function(e) {
                        return fn.call(context, YAHOO.util.Event.getEvent(e, el), 
                                obj);
                    };

                var li = [el, sType, fn, wrappedFn, context, obj, overrideContext];
                var index = listeners.length;
                // cache the listener so we can try to automatically unload
                listeners[index] = li;

                if (this.useLegacyEvent(el, sType)) {
                    var legacyIndex = this.getLegacyIndex(el, sType);

                    // Add a new dom0 wrapper if one is not detected for this
                    // element
                    if ( legacyIndex == -1 || 
                                el != legacyEvents[legacyIndex][0] ) {

                        legacyIndex = legacyEvents.length;
                        legacyMap[el.id + sType] = legacyIndex;

                        // cache the signature for the DOM0 event, and 
                        // include the existing handler for the event, if any
                        legacyEvents[legacyIndex] = 
                            [el, sType, el["on" + sType]];
                        legacyHandlers[legacyIndex] = [];

                        el["on" + sType] = 
                            function(e) {
                                YAHOO.util.Event.fireLegacyEvent(
                                    YAHOO.util.Event.getEvent(e), legacyIndex);
                            };
                    }

                    // add a reference to the wrapped listener to our custom
                    // stack of events
                    //legacyHandlers[legacyIndex].push(index);
                    legacyHandlers[legacyIndex].push(li);

                } else {
                    try {
                        this._simpleAdd(el, sType, wrappedFn, bCapture);
                    } catch(ex) {
                        // handle an error trying to attach an event.  If it fails
                        // we need to clean up the cache
                        this.lastError = ex;
                        this.removeListener(el, sType, fn);
                        return false;
                    }
                }

                return true;
                
            },


            /**
             * Appends an event handler
             *
             * @method addListener
             *
             * @param {String|HTMLElement|Array|NodeList} el An id, an element 
             *  reference, or a collection of ids and/or elements to assign the 
             *  listener to.
             * @param {String}   sType     The type of event to append
             * @param {Function} fn        The method the event invokes
             * @param {Object}   obj    An arbitrary object that will be 
             *                             passed as a parameter to the handler
             * @param {Boolean|object}  overrideContext  If true, the obj passed in becomes
             *                             the execution context of the listener. If an
             *                             object, this object becomes the execution
             *                             context.
             * @return {Boolean} True if the action was successful or defered,
             *                        false if one or more of the elements 
             *                        could not have the listener attached,
             *                        or if the operation throws an exception.
             * @static
             */
            addListener: function (el, sType, fn, obj, overrideContext) {
                return this._addListener(el, sType, fn, obj, overrideContext, false);
            },

            /**
             * Appends a focus event handler.  (The focusin event is used for Internet Explorer, 
             * the focus, capture-event for Opera, WebKit.)
             *
             * @method addFocusListener
             *
             * @param {String|HTMLElement|Array|NodeList} el An id, an element 
             *  reference, or a collection of ids and/or elements to assign the 
             *  listener to.
             * @param {Function} fn        The method the event invokes
             * @param {Object}   obj    An arbitrary object that will be 
             *                             passed as a parameter to the handler
             * @param {Boolean|object}  overrideContext  If true, the obj passed in becomes
             *                             the execution context of the listener. If an
             *                             object, this object becomes the execution
             *                             context.
             * @return {Boolean} True if the action was successful or defered,
             *                        false if one or more of the elements 
             *                        could not have the listener attached,
             *                        or if the operation throws an exception.
             * @static
             */
            addFocusListener: function (el, fn, obj, overrideContext) {
                return this._addListener(el, _FOCUS, fn, obj, overrideContext, true);
            },          


            /**
             * Removes a focus event listener
             *
             * @method removeListener
             *
             * @param {String|HTMLElement|Array|NodeList} el An id, an element 
             *  reference, or a collection of ids and/or elements to remove
             *  the listener from.
             * @param {Function} fn the method the event invokes.  If fn is
             *  undefined, then all event handlers for the type of event are 
             *  removed.
             * @return {boolean} true if the unbind was successful, false 
             *  otherwise.
             * @static
             */
            removeFocusListener: function (el, fn) { 
                return this.removeListener(el, _FOCUS, fn);
            },

            /**
             * Appends a blur event handler.  (The focusout event is used for Internet Explorer, 
             * the focusout, capture-event for Opera, WebKit.)
             *
             * @method addBlurListener
             *
             * @param {String|HTMLElement|Array|NodeList} el An id, an element 
             *  reference, or a collection of ids and/or elements to assign the 
             *  listener to.
             * @param {Function} fn        The method the event invokes
             * @param {Object}   obj    An arbitrary object that will be 
             *                             passed as a parameter to the handler
             * @param {Boolean|object}  overrideContext  If true, the obj passed in becomes
             *                             the execution context of the listener. If an
             *                             object, this object becomes the execution
             *                             context.
             * @return {Boolean} True if the action was successful or defered,
             *                        false if one or more of the elements 
             *                        could not have the listener attached,
             *                        or if the operation throws an exception.
             * @static
             */
            addBlurListener: function (el, fn, obj, overrideContext) {
                return this._addListener(el, _BLUR, fn, obj, overrideContext, true);
            },          

            /**
             * Removes a blur event listener
             *
             * @method removeListener
             *
             * @param {String|HTMLElement|Array|NodeList} el An id, an element 
             *  reference, or a collection of ids and/or elements to remove
             *  the listener from.
             * @param {Function} fn the method the event invokes.  If fn is
             *  undefined, then all event handlers for the type of event are 
             *  removed.
             * @return {boolean} true if the unbind was successful, false 
             *  otherwise.
             * @static
             */
            removeBlurListener: function (el, fn) { 
            
                return this.removeListener(el, _BLUR, fn);
            
            },

            /**
             * When using legacy events, the handler is routed to this object
             * so we can fire our custom listener stack.
             * @method fireLegacyEvent
             * @static
             * @private
             */
            fireLegacyEvent: function(e, legacyIndex) {
                var ok=true, le, lh, li, context, ret;
                
                lh = legacyHandlers[legacyIndex].slice();
                for (var i=0, len=lh.length; i<len; ++i) {
                // for (var i in lh.length) {
                    li = lh[i];
                    if ( li && li[this.WFN] ) {
                        context = li[this.ADJ_SCOPE];
                        ret = li[this.WFN].call(context, e);
                        ok = (ok && ret);
                    }
                }

                // Fire the original handler if we replaced one.  We fire this
                // after the other events to keep stopPropagation/preventDefault
                // that happened in the DOM0 handler from touching our DOM2
                // substitute
                le = legacyEvents[legacyIndex];
                if (le && le[2]) {
                    le[2](e);
                }
                
                return ok;
            },

            /**
             * Returns the legacy event index that matches the supplied 
             * signature
             * @method getLegacyIndex
             * @static
             * @private
             */
            getLegacyIndex: function(el, sType) {
                var key = this.generateId(el) + sType;
                if (typeof legacyMap[key] == "undefined") { 
                    return -1;
                } else {
                    return legacyMap[key];
                }
            },

            /**
             * Logic that determines when we should automatically use legacy
             * events instead of DOM2 events.  Currently this is limited to old
             * Safari browsers with a broken preventDefault
             * @method useLegacyEvent
             * @static
             * @private
             */
            useLegacyEvent: function(el, sType) {
return (this.webkit && this.webkit < 419 && ("click"==sType || "dblclick"==sType));
            },
                    
            /**
             * Removes an event listener
             *
             * @method removeListener
             *
             * @param {String|HTMLElement|Array|NodeList} el An id, an element 
             *  reference, or a collection of ids and/or elements to remove
             *  the listener from.
             * @param {String} sType the type of event to remove.
             * @param {Function} fn the method the event invokes.  If fn is
             *  undefined, then all event handlers for the type of event are 
             *  removed.
             * @return {boolean} true if the unbind was successful, false 
             *  otherwise.
             * @static
             */
            removeListener: function(el, sType, fn) {
                var i, len, li;

                // The el argument can be a string
                if (typeof el == "string") {
                    el = this.getEl(el);
                // The el argument can be an array of elements or element ids.
                } else if ( this._isValidCollection(el)) {
                    var ok = true;
                    for (i=el.length-1; i>-1; i--) {
                        ok = ( this.removeListener(el[i], sType, fn) && ok );
                    }
                    return ok;
                }

                if (!fn || !fn.call) {
                    //return false;
                    return this.purgeElement(el, false, sType);
                }

                if ("unload" == sType) {

                    for (i=unloadListeners.length-1; i>-1; i--) {
                        li = unloadListeners[i];
                        if (li && 
                            li[0] == el && 
                            li[1] == sType && 
                            li[2] == fn) {
                                unloadListeners.splice(i, 1);
                                // unloadListeners[i]=null;
                                return true;
                        }
                    }

                    return false;
                }

                var cacheItem = null;

                // The index is a hidden parameter; needed to remove it from
                // the method signature because it was tempting users to
                // try and take advantage of it, which is not possible.
                var index = arguments[3];
  
                if ("undefined" === typeof index) {
                    index = this._getCacheIndex(el, sType, fn);
                }

                if (index >= 0) {
                    cacheItem = listeners[index];
                }

                if (!el || !cacheItem) {
                    return false;
                }


                if (this.useLegacyEvent(el, sType)) {
                    var legacyIndex = this.getLegacyIndex(el, sType);
                    var llist = legacyHandlers[legacyIndex];
                    if (llist) {
                        for (i=0, len=llist.length; i<len; ++i) {
                        // for (i in llist.length) {
                            li = llist[i];
                            if (li && 
                                li[this.EL] == el && 
                                li[this.TYPE] == sType && 
                                li[this.FN] == fn) {
                                    llist.splice(i, 1);
                                    // llist[i]=null;
                                    break;
                            }
                        }
                    }

                } else {
                    try {
                        this._simpleRemove(el, sType, cacheItem[this.WFN], false);
                    } catch(ex) {
                        this.lastError = ex;
                        return false;
                    }
                }

                // removed the wrapped handler
                delete listeners[index][this.WFN];
                delete listeners[index][this.FN];
                listeners.splice(index, 1);
                // listeners[index]=null;

                return true;

            },

            /**
             * Returns the event's target element.  Safari sometimes provides
             * a text node, and this is automatically resolved to the text
             * node's parent so that it behaves like other browsers.
             * @method getTarget
             * @param {Event} ev the event
             * @param {boolean} resolveTextNode when set to true the target's
             *                  parent will be returned if the target is a 
             *                  text node.  @deprecated, the text node is
             *                  now resolved automatically
             * @return {HTMLElement} the event's target
             * @static
             */
            getTarget: function(ev, resolveTextNode) {
                var t = ev.target || ev.srcElement;
                return this.resolveTextNode(t);
            },

            /**
             * In some cases, some browsers will return a text node inside
             * the actual element that was targeted.  This normalizes the
             * return value for getTarget and getRelatedTarget.
             * @method resolveTextNode
             * @param {HTMLElement} node node to resolve
             * @return {HTMLElement} the normized node
             * @static
             */
            resolveTextNode: function(n) {
                try {
                    if (n && 3 == n.nodeType) {
                        return n.parentNode;
                    }
                } catch(e) { }

                return n;
            },

            /**
             * Returns the event's pageX
             * @method getPageX
             * @param {Event} ev the event
             * @return {int} the event's pageX
             * @static
             */
            getPageX: function(ev) {
                var x = ev.pageX;
                if (!x && 0 !== x) {
                    x = ev.clientX || 0;

                    if ( this.isIE ) {
                        x += this._getScrollLeft();
                    }
                }

                return x;
            },

            /**
             * Returns the event's pageY
             * @method getPageY
             * @param {Event} ev the event
             * @return {int} the event's pageY
             * @static
             */
            getPageY: function(ev) {
                var y = ev.pageY;
                if (!y && 0 !== y) {
                    y = ev.clientY || 0;

                    if ( this.isIE ) {
                        y += this._getScrollTop();
                    }
                }


                return y;
            },

            /**
             * Returns the pageX and pageY properties as an indexed array.
             * @method getXY
             * @param {Event} ev the event
             * @return {[x, y]} the pageX and pageY properties of the event
             * @static
             */
            getXY: function(ev) {
                return [this.getPageX(ev), this.getPageY(ev)];
            },

            /**
             * Returns the event's related target 
             * @method getRelatedTarget
             * @param {Event} ev the event
             * @return {HTMLElement} the event's relatedTarget
             * @static
             */
            getRelatedTarget: function(ev) {
                var t = ev.relatedTarget;
                if (!t) {
                    if (ev.type == "mouseout") {
                        t = ev.toElement;
                    } else if (ev.type == "mouseover") {
                        t = ev.fromElement;
                    }
                }

                return this.resolveTextNode(t);
            },

            /**
             * Returns the time of the event.  If the time is not included, the
             * event is modified using the current time.
             * @method getTime
             * @param {Event} ev the event
             * @return {Date} the time of the event
             * @static
             */
            getTime: function(ev) {
                if (!ev.time) {
                    var t = new Date().getTime();
                    try {
                        ev.time = t;
                    } catch(ex) { 
                        this.lastError = ex;
                        return t;
                    }
                }

                return ev.time;
            },

            /**
             * Convenience method for stopPropagation + preventDefault
             * @method stopEvent
             * @param {Event} ev the event
             * @static
             */
            stopEvent: function(ev) {
                this.stopPropagation(ev);
                this.preventDefault(ev);
            },

            /**
             * Stops event propagation
             * @method stopPropagation
             * @param {Event} ev the event
             * @static
             */
            stopPropagation: function(ev) {
                if (ev.stopPropagation) {
                    ev.stopPropagation();
                } else {
                    ev.cancelBubble = true;
                }
            },

            /**
             * Prevents the default behavior of the event
             * @method preventDefault
             * @param {Event} ev the event
             * @static
             */
            preventDefault: function(ev) {
                if (ev.preventDefault) {
                    ev.preventDefault();
                } else {
                    ev.returnValue = false;
                }
            },
             
            /**
             * Finds the event in the window object, the caller's arguments, or
             * in the arguments of another method in the callstack.  This is
             * executed automatically for events registered through the event
             * manager, so the implementer should not normally need to execute
             * this function at all.
             * @method getEvent
             * @param {Event} e the event parameter from the handler
             * @param {HTMLElement} boundEl the element the listener is attached to
             * @return {Event} the event 
             * @static
             */
            getEvent: function(e, boundEl) {
                var ev = e || window.event;

                if (!ev) {
                    var c = this.getEvent.caller;
                    while (c) {
                        ev = c.arguments[0];
                        if (ev && Event == ev.constructor) {
                            break;
                        }
                        c = c.caller;
                    }
                }

                return ev;
            },

            /**
             * Returns the charcode for an event
             * @method getCharCode
             * @param {Event} ev the event
             * @return {int} the event's charCode
             * @static
             */
            getCharCode: function(ev) {
                var code = ev.keyCode || ev.charCode || 0;

                // webkit key normalization
                if (YAHOO.env.ua.webkit && (code in webkitKeymap)) {
                    code = webkitKeymap[code];
                }
                return code;
            },

            /**
             * Locating the saved event handler data by function ref
             *
             * @method _getCacheIndex
             * @static
             * @private
             */
            _getCacheIndex: function(el, sType, fn) {
                for (var i=0, l=listeners.length; i<l; i=i+1) {
                    var li = listeners[i];
                    if ( li                 && 
                         li[this.FN] == fn  && 
                         li[this.EL] == el  && 
                         li[this.TYPE] == sType ) {
                        return i;
                    }
                }

                return -1;
            },

            /**
             * Generates an unique ID for the element if it does not already 
             * have one.
             * @method generateId
             * @param el the element to create the id for
             * @return {string} the resulting id of the element
             * @static
             */
            generateId: function(el) {
                var id = el.id;

                if (!id) {
                    id = "yuievtautoid-" + counter;
                    ++counter;
                    el.id = id;
                }

                return id;
            },


            /**
             * We want to be able to use getElementsByTagName as a collection
             * to attach a group of events to.  Unfortunately, different 
             * browsers return different types of collections.  This function
             * tests to determine if the object is array-like.  It will also 
             * fail if the object is an array, but is empty.
             * @method _isValidCollection
             * @param o the object to test
             * @return {boolean} true if the object is array-like and populated
             * @static
             * @private
             */
            _isValidCollection: function(o) {
                try {
                    return ( o                     && // o is something
                             typeof o !== "string" && // o is not a string
                             o.length              && // o is indexed
                             !o.tagName            && // o is not an HTML element
                             !o.alert              && // o is not a window
                             typeof o[0] !== "undefined" );
                } catch(ex) {
                    return false;
                }

            },

            /**
             * @private
             * @property elCache
             * DOM element cache
             * @static
             * @deprecated Elements are not cached due to issues that arise when
             * elements are removed and re-added
             */
            elCache: {},

            /**
             * We cache elements bound by id because when the unload event 
             * fires, we can no longer use document.getElementById
             * @method getEl
             * @static
             * @private
             * @deprecated Elements are not cached any longer
             */
            getEl: function(id) {
                return (typeof id === "string") ? document.getElementById(id) : id;
            },

            /**
             * Clears the element cache
             * @deprecated Elements are not cached any longer
             * @method clearCache
             * @static
             * @private
             */
            clearCache: function() { },

            /**
             * Custom event the fires when the dom is initially usable
             * @event DOMReadyEvent
             */
            DOMReadyEvent: new YAHOO.util.CustomEvent("DOMReady", this),

            /**
             * hook up any deferred listeners
             * @method _load
             * @static
             * @private
             */
            _load: function(e) {

                if (!loadComplete) {
                    loadComplete = true;
                    var EU = YAHOO.util.Event;

                    // Just in case DOMReady did not go off for some reason
                    EU._ready();

                    // Available elements may not have been detected before the
                    // window load event fires. Try to find them now so that the
                    // the user is more likely to get the onAvailable notifications
                    // before the window load notification
                    EU._tryPreloadAttach();

                }
            },

            /**
             * Fires the DOMReady event listeners the first time the document is
             * usable.
             * @method _ready
             * @static
             * @private
             */
            _ready: function(e) {
                var EU = YAHOO.util.Event;
                if (!EU.DOMReady) {
                    EU.DOMReady=true;

                    // Fire the content ready custom event
                    EU.DOMReadyEvent.fire();

                    // Remove the DOMContentLoaded (FF/Opera)
                    EU._simpleRemove(document, "DOMContentLoaded", EU._ready);
                }
            },

            /**
             * Polling function that runs before the onload event fires, 
             * attempting to attach to DOM Nodes as soon as they are 
             * available
             * @method _tryPreloadAttach
             * @static
             * @private
             */
            _tryPreloadAttach: function() {

                if (onAvailStack.length === 0) {
                    retryCount = 0;
                    if (this._interval) {
                        clearInterval(this._interval);
                        this._interval = null;
                    } 
                    return;
                }

                if (this.locked) {
                    return;
                }

                if (this.isIE) {
                    // Hold off if DOMReady has not fired and check current
                    // readyState to protect against the IE operation aborted
                    // issue.
                    if (!this.DOMReady) {
                        this.startInterval();
                        return;
                    }
                }

                this.locked = true;


                // keep trying until after the page is loaded.  We need to 
                // check the page load state prior to trying to bind the 
                // elements so that we can be certain all elements have been 
                // tested appropriately
                var tryAgain = !loadComplete;
                if (!tryAgain) {
                    tryAgain = (retryCount > 0 && onAvailStack.length > 0);
                }

                // onAvailable
                var notAvail = [];

                var executeItem = function (el, item) {
                    var context = el;
                    if (item.overrideContext) {
                        if (item.overrideContext === true) {
                            context = item.obj;
                        } else {
                            context = item.overrideContext;
                        }
                    }
                    item.fn.call(context, item.obj);
                };

                var i, len, item, el, ready=[];

                // onAvailable onContentReady
                for (i=0, len=onAvailStack.length; i<len; i=i+1) {
                    item = onAvailStack[i];
                    if (item) {
                        el = this.getEl(item.id);
                        if (el) {
                            if (item.checkReady) {
                                if (loadComplete || el.nextSibling || !tryAgain) {
                                    ready.push(item);
                                    onAvailStack[i] = null;
                                }
                            } else {
                                executeItem(el, item);
                                onAvailStack[i] = null;
                            }
                        } else {
                            notAvail.push(item);
                        }
                    }
                }
                
                // make sure onContentReady fires after onAvailable
                for (i=0, len=ready.length; i<len; i=i+1) {
                    item = ready[i];
                    executeItem(this.getEl(item.id), item);
                }


                retryCount--;

                if (tryAgain) {
                    for (i=onAvailStack.length-1; i>-1; i--) {
                        item = onAvailStack[i];
                        if (!item || !item.id) {
                            onAvailStack.splice(i, 1);
                        }
                    }

                    this.startInterval();
                } else {
                    if (this._interval) {
                        clearInterval(this._interval);
                        this._interval = null;
                    }
                }

                this.locked = false;

            },

            /**
             * Removes all listeners attached to the given element via addListener.
             * Optionally, the node's children can also be purged.
             * Optionally, you can specify a specific type of event to remove.
             * @method purgeElement
             * @param {HTMLElement} el the element to purge
             * @param {boolean} recurse recursively purge this element's children
             * as well.  Use with caution.
             * @param {string} sType optional type of listener to purge. If
             * left out, all listeners will be removed
             * @static
             */
            purgeElement: function(el, recurse, sType) {
                var oEl = (YAHOO.lang.isString(el)) ? this.getEl(el) : el;
                var elListeners = this.getListeners(oEl, sType), i, len;
                if (elListeners) {
                    for (i=elListeners.length-1; i>-1; i--) {
                        var l = elListeners[i];
                        this.removeListener(oEl, l.type, l.fn);
                    }
                }

                if (recurse && oEl && oEl.childNodes) {
                    for (i=0,len=oEl.childNodes.length; i<len ; ++i) {
                        this.purgeElement(oEl.childNodes[i], recurse, sType);
                    }
                }
            },

            /**
             * Returns all listeners attached to the given element via addListener.
             * Optionally, you can specify a specific type of event to return.
             * @method getListeners
             * @param el {HTMLElement|string} the element or element id to inspect 
             * @param sType {string} optional type of listener to return. If
             * left out, all listeners will be returned
             * @return {Object} the listener. Contains the following fields:
             * &nbsp;&nbsp;type:   (string)   the type of event
             * &nbsp;&nbsp;fn:     (function) the callback supplied to addListener
             * &nbsp;&nbsp;obj:    (object)   the custom object supplied to addListener
             * &nbsp;&nbsp;adjust: (boolean|object)  whether or not to adjust the default context
             * &nbsp;&nbsp;scope: (boolean)  the derived context based on the adjust parameter
             * &nbsp;&nbsp;index:  (int)      its position in the Event util listener cache
             * @static
             */           
            getListeners: function(el, sType) {
                var results=[], searchLists;
                if (!sType) {
                    searchLists = [listeners, unloadListeners];
                } else if (sType === "unload") {
                    searchLists = [unloadListeners];
                } else {
                    searchLists = [listeners];
                }

                var oEl = (YAHOO.lang.isString(el)) ? this.getEl(el) : el;

                for (var j=0;j<searchLists.length; j=j+1) {
                    var searchList = searchLists[j];
                    if (searchList) {
                        for (var i=0,len=searchList.length; i<len ; ++i) {
                            var l = searchList[i];
                            if ( l  && l[this.EL] === oEl && 
                                    (!sType || sType === l[this.TYPE]) ) {
                                results.push({
                                    type:   l[this.TYPE],
                                    fn:     l[this.FN],
                                    obj:    l[this.OBJ],
                                    adjust: l[this.OVERRIDE],
                                    scope:  l[this.ADJ_SCOPE],
                                    index:  i
                                });
                            }
                        }
                    }
                }

                return (results.length) ? results : null;
            },

            /**
             * Removes all listeners registered by pe.event.  Called 
             * automatically during the unload event.
             * @method _unload
             * @static
             * @private
             */
            _unload: function(e) {

                var EU = YAHOO.util.Event, i, j, l, len, index,
                         ul = unloadListeners.slice(), context;

                // execute and clear stored unload listeners
                for (i=0, len=unloadListeners.length; i<len; ++i) {
                    l = ul[i];
                    if (l) {
                        context = window;
                        if (l[EU.ADJ_SCOPE]) {
                            if (l[EU.ADJ_SCOPE] === true) {
                                context = l[EU.UNLOAD_OBJ];
                            } else {
                                context = l[EU.ADJ_SCOPE];
                            }
                        }
                        l[EU.FN].call(context, EU.getEvent(e, l[EU.EL]), l[EU.UNLOAD_OBJ] );
                        ul[i] = null;
                    }
                }

                l = null;
                context = null;
                unloadListeners = null;

                // Remove listeners to handle IE memory leaks
                //if (YAHOO.env.ua.ie && listeners && listeners.length > 0) {
                
                // 2.5.0 listeners are removed for all browsers again.  FireFox preserves
                // at least some listeners between page refreshes, potentially causing
                // errors during page load (mouseover listeners firing before they
                // should if the user moves the mouse at the correct moment).
                if (listeners) {
                    for (j=listeners.length-1; j>-1; j--) {
                        l = listeners[j];
                        if (l) {
                            EU.removeListener(l[EU.EL], l[EU.TYPE], l[EU.FN], j);
                        } 
                    }
                    l=null;
                }

                legacyEvents = null;

                EU._simpleRemove(window, "unload", EU._unload);

            },

            /**
             * Returns scrollLeft
             * @method _getScrollLeft
             * @static
             * @private
             */
            _getScrollLeft: function() {
                return this._getScroll()[1];
            },

            /**
             * Returns scrollTop
             * @method _getScrollTop
             * @static
             * @private
             */
            _getScrollTop: function() {
                return this._getScroll()[0];
            },

            /**
             * Returns the scrollTop and scrollLeft.  Used to calculate the 
             * pageX and pageY in Internet Explorer
             * @method _getScroll
             * @static
             * @private
             */
            _getScroll: function() {
                var dd = document.documentElement, db = document.body;
                if (dd && (dd.scrollTop || dd.scrollLeft)) {
                    return [dd.scrollTop, dd.scrollLeft];
                } else if (db) {
                    return [db.scrollTop, db.scrollLeft];
                } else {
                    return [0, 0];
                }
            },
            
            /**
             * Used by old versions of CustomEvent, restored for backwards
             * compatibility
             * @method regCE
             * @private
             * @static
             * @deprecated still here for backwards compatibility
             */
            regCE: function() {
                // does nothing
            },

            /**
             * Adds a DOM event directly without the caching, cleanup, context adj, etc
             *
             * @method _simpleAdd
             * @param {HTMLElement} el      the element to bind the handler to
             * @param {string}      sType   the type of event handler
             * @param {function}    fn      the callback to invoke
             * @param {boolen}      capture capture or bubble phase
             * @static
             * @private
             */
            _simpleAdd: function () {
                if (window.addEventListener) {
                    return function(el, sType, fn, capture) {
                        el.addEventListener(sType, fn, (capture));
                    };
                } else if (window.attachEvent) {
                    return function(el, sType, fn, capture) {
                        el.attachEvent("on" + sType, fn);
                    };
                } else {
                    return function(){};
                }
            }(),

            /**
             * Basic remove listener
             *
             * @method _simpleRemove
             * @param {HTMLElement} el      the element to bind the handler to
             * @param {string}      sType   the type of event handler
             * @param {function}    fn      the callback to invoke
             * @param {boolen}      capture capture or bubble phase
             * @static
             * @private
             */
            _simpleRemove: function() {
                if (window.removeEventListener) {
                    return function (el, sType, fn, capture) {
                        el.removeEventListener(sType, fn, (capture));
                    };
                } else if (window.detachEvent) {
                    return function (el, sType, fn) {
                        el.detachEvent("on" + sType, fn);
                    };
                } else {
                    return function(){};
                }
            }()
        };

    }();

    (function() {
        var EU = YAHOO.util.Event;

        /**
         * YAHOO.util.Event.on is an alias for addListener
         * @method on
         * @see addListener
         * @static
         */
        EU.on = EU.addListener;

        /**
         * YAHOO.util.Event.onFocus is an alias for addFocusListener
         * @method on
         * @see addFocusListener
         * @static
         */
        EU.onFocus = EU.addFocusListener;

        /**
         * YAHOO.util.Event.onBlur is an alias for addBlurListener
         * @method onBlur
         * @see addBlurListener
         * @static
         */     
        EU.onBlur = EU.addBlurListener;


/*! DOMReady: based on work by: Dean Edwards/John Resig/Matthias Miller */

        // Internet Explorer: use the readyState of a defered script.
        // This isolates what appears to be a safe moment to manipulate
        // the DOM prior to when the document's readyState suggests
        // it is safe to do so.
        if (EU.isIE) {

            // Process onAvailable/onContentReady items when the 
            // DOM is ready.
            YAHOO.util.Event.onDOMReady(
                    YAHOO.util.Event._tryPreloadAttach,
                    YAHOO.util.Event, true);
            
            var n = document.createElement('p');  

            EU._dri = setInterval(function() {
                try {
                    // throws an error if doc is not ready
                    n.doScroll('left');
                    clearInterval(EU._dri);
                    EU._dri = null;
                    EU._ready();
                    n = null;
                } catch (ex) { 
                }
            }, EU.POLL_INTERVAL); 

        
        // The document's readyState in Safari currently will
        // change to loaded/complete before images are loaded.
        } else if (EU.webkit && EU.webkit < 525) {

            EU._dri = setInterval(function() {
                var rs=document.readyState;
                if ("loaded" == rs || "complete" == rs) {
                    clearInterval(EU._dri);
                    EU._dri = null;
                    EU._ready();
                }
            }, EU.POLL_INTERVAL); 

        // FireFox and Opera: These browsers provide a event for this
        // moment.  The latest WebKit releases now support this event.
        } else {

            EU._simpleAdd(document, "DOMContentLoaded", EU._ready);

        }
        /////////////////////////////////////////////////////////////


        EU._simpleAdd(window, "load", EU._load);
        EU._simpleAdd(window, "unload", EU._unload);
        EU._tryPreloadAttach();
    })();

}
/**
 * EventProvider is designed to be used with YAHOO.augment to wrap 
 * CustomEvents in an interface that allows events to be subscribed to 
 * and fired by name.  This makes it possible for implementing code to
 * subscribe to an event that either has not been created yet, or will
 * not be created at all.
 *
 * @Class EventProvider
 */
YAHOO.util.EventProvider = function() { };

YAHOO.util.EventProvider.prototype = {

    /**
     * Private storage of custom events
     * @property __yui_events
     * @type Object[]
     * @private
     */
    __yui_events: null,

    /**
     * Private storage of custom event subscribers
     * @property __yui_subscribers
     * @type Object[]
     * @private
     */
    __yui_subscribers: null,
    
    /**
     * Subscribe to a CustomEvent by event type
     *
     * @method subscribe
     * @param p_type     {string}   the type, or name of the event
     * @param p_fn       {function} the function to exectute when the event fires
     * @param p_obj      {Object}   An object to be passed along when the event 
     *                              fires
     * @param overrideContext {boolean}  If true, the obj passed in becomes the 
     *                              execution scope of the listener
     */
    subscribe: function(p_type, p_fn, p_obj, overrideContext) {

        this.__yui_events = this.__yui_events || {};
        var ce = this.__yui_events[p_type];

        if (ce) {
            ce.subscribe(p_fn, p_obj, overrideContext);
        } else {
            this.__yui_subscribers = this.__yui_subscribers || {};
            var subs = this.__yui_subscribers;
            if (!subs[p_type]) {
                subs[p_type] = [];
            }
            subs[p_type].push(
                { fn: p_fn, obj: p_obj, overrideContext: overrideContext } );
        }
    },

    /**
     * Unsubscribes one or more listeners the from the specified event
     * @method unsubscribe
     * @param p_type {string}   The type, or name of the event.  If the type
     *                          is not specified, it will attempt to remove
     *                          the listener from all hosted events.
     * @param p_fn   {Function} The subscribed function to unsubscribe, if not
     *                          supplied, all subscribers will be removed.
     * @param p_obj  {Object}   The custom object passed to subscribe.  This is
     *                        optional, but if supplied will be used to
     *                        disambiguate multiple listeners that are the same
     *                        (e.g., you subscribe many object using a function
     *                        that lives on the prototype)
     * @return {boolean} true if the subscriber was found and detached.
     */
    unsubscribe: function(p_type, p_fn, p_obj) {
        this.__yui_events = this.__yui_events || {};
        var evts = this.__yui_events;
        if (p_type) {
            var ce = evts[p_type];
            if (ce) {
                return ce.unsubscribe(p_fn, p_obj);
            }
        } else {
            var ret = true;
            for (var i in evts) {
                if (YAHOO.lang.hasOwnProperty(evts, i)) {
                    ret = ret && evts[i].unsubscribe(p_fn, p_obj);
                }
            }
            return ret;
        }

        return false;
    },
    
    /**
     * Removes all listeners from the specified event.  If the event type
     * is not specified, all listeners from all hosted custom events will
     * be removed.
     * @method unsubscribeAll
     * @param p_type {string}   The type, or name of the event
     */
    unsubscribeAll: function(p_type) {
        return this.unsubscribe(p_type);
    },

    /**
     * Creates a new custom event of the specified type.  If a custom event
     * by that name already exists, it will not be re-created.  In either
     * case the custom event is returned. 
     *
     * @method createEvent
     *
     * @param p_type {string} the type, or name of the event
     * @param p_config {object} optional config params.  Valid properties are:
     *
     *  <ul>
     *    <li>
     *      scope: defines the default execution scope.  If not defined
     *      the default scope will be this instance.
     *    </li>
     *    <li>
     *      silent: if true, the custom event will not generate log messages.
     *      This is false by default.
     *    </li>
     *    <li>
     *      onSubscribeCallback: specifies a callback to execute when the
     *      event has a new subscriber.  This will fire immediately for
     *      each queued subscriber if any exist prior to the creation of
     *      the event.
     *    </li>
     *  </ul>
     *
     *  @return {CustomEvent} the custom event
     *
     */
    createEvent: function(p_type, p_config) {

        this.__yui_events = this.__yui_events || {};
        var opts = p_config || {};
        var events = this.__yui_events;

        if (events[p_type]) {
        } else {

            var scope  = opts.scope  || this;
            var silent = (opts.silent);

            var ce = new YAHOO.util.CustomEvent(p_type, scope, silent,
                    YAHOO.util.CustomEvent.FLAT);
            events[p_type] = ce;

            if (opts.onSubscribeCallback) {
                ce.subscribeEvent.subscribe(opts.onSubscribeCallback);
            }

            this.__yui_subscribers = this.__yui_subscribers || {};
            var qs = this.__yui_subscribers[p_type];

            if (qs) {
                for (var i=0; i<qs.length; ++i) {
                    ce.subscribe(qs[i].fn, qs[i].obj, qs[i].overrideContext);
                }
            }
        }

        return events[p_type];
    },


   /**
     * Fire a custom event by name.  The callback functions will be executed
     * from the scope specified when the event was created, and with the 
     * following parameters:
     *   <ul>
     *   <li>The first argument fire() was executed with</li>
     *   <li>The custom object (if any) that was passed into the subscribe() 
     *       method</li>
     *   </ul>
     * @method fireEvent
     * @param p_type    {string}  the type, or name of the event
     * @param arguments {Object*} an arbitrary set of parameters to pass to 
     *                            the handler.
     * @return {boolean} the return value from CustomEvent.fire
     *                   
     */
    fireEvent: function(p_type, arg1, arg2, etc) {

        this.__yui_events = this.__yui_events || {};
        var ce = this.__yui_events[p_type];

        if (!ce) {
            return null;
        }

        var args = [];
        for (var i=1; i<arguments.length; ++i) {
            args.push(arguments[i]);
        }
        return ce.fire.apply(ce, args);
    },

    /**
     * Returns true if the custom event of the provided type has been created
     * with createEvent.
     * @method hasEvent
     * @param type {string} the type, or name of the event
     */
    hasEvent: function(type) {
        if (this.__yui_events) {
            if (this.__yui_events[type]) {
                return true;
            }
        }
        return false;
    }

};

(function() {

    var Event = YAHOO.util.Event, Lang = YAHOO.lang;

/**
* KeyListener is a utility that provides an easy interface for listening for
* keydown/keyup events fired against DOM elements.
* @namespace YAHOO.util
* @class KeyListener
* @constructor
* @param {HTMLElement} attachTo The element or element ID to which the key 
*                               event should be attached
* @param {String}      attachTo The element or element ID to which the key
*                               event should be attached
* @param {Object}      keyData  The object literal representing the key(s) 
*                               to detect. Possible attributes are 
*                               shift(boolean), alt(boolean), ctrl(boolean) 
*                               and keys(either an int or an array of ints 
*                               representing keycodes).
* @param {Function}    handler  The CustomEvent handler to fire when the 
*                               key event is detected
* @param {Object}      handler  An object literal representing the handler. 
* @param {String}      event    Optional. The event (keydown or keyup) to 
*                               listen for. Defaults automatically to keydown.
*
* @knownissue the "keypress" event is completely broken in Safari 2.x and below.
*             the workaround is use "keydown" for key listening.  However, if
*             it is desired to prevent the default behavior of the keystroke,
*             that can only be done on the keypress event.  This makes key
*             handling quite ugly.
* @knownissue keydown is also broken in Safari 2.x and below for the ESC key.
*             There currently is no workaround other than choosing another
*             key to listen for.
*/
YAHOO.util.KeyListener = function(attachTo, keyData, handler, event) {
    if (!attachTo) {
    } else if (!keyData) {
    } else if (!handler) {
    } 
    
    if (!event) {
        event = YAHOO.util.KeyListener.KEYDOWN;
    }

    /**
    * The CustomEvent fired internally when a key is pressed
    * @event keyEvent
    * @private
    * @param {Object} keyData The object literal representing the key(s) to 
    *                         detect. Possible attributes are shift(boolean), 
    *                         alt(boolean), ctrl(boolean) and keys(either an 
    *                         int or an array of ints representing keycodes).
    */
    var keyEvent = new YAHOO.util.CustomEvent("keyPressed");
    
    /**
    * The CustomEvent fired when the KeyListener is enabled via the enable() 
    * function
    * @event enabledEvent
    * @param {Object} keyData The object literal representing the key(s) to 
    *                         detect. Possible attributes are shift(boolean), 
    *                         alt(boolean), ctrl(boolean) and keys(either an 
    *                         int or an array of ints representing keycodes).
    */
    this.enabledEvent = new YAHOO.util.CustomEvent("enabled");

    /**
    * The CustomEvent fired when the KeyListener is disabled via the 
    * disable() function
    * @event disabledEvent
    * @param {Object} keyData The object literal representing the key(s) to 
    *                         detect. Possible attributes are shift(boolean), 
    *                         alt(boolean), ctrl(boolean) and keys(either an 
    *                         int or an array of ints representing keycodes).
    */
    this.disabledEvent = new YAHOO.util.CustomEvent("disabled");

    if (Lang.isString(attachTo)) {
        attachTo = document.getElementById(attachTo); // No Dom util
    }

    if (Lang.isFunction(handler)) {
        keyEvent.subscribe(handler);
    } else {
        keyEvent.subscribe(handler.fn, handler.scope, handler.correctScope);
    }

    /**
    * Handles the key event when a key is pressed.
    * @method handleKeyPress
    * @param {DOMEvent} e   The keypress DOM event
    * @param {Object}   obj The DOM event scope object
    * @private
    */
    function handleKeyPress(e, obj) {
        if (! keyData.shift) {  
            keyData.shift = false; 
        }
        if (! keyData.alt) {    
            keyData.alt = false;
        }
        if (! keyData.ctrl) {
            keyData.ctrl = false;
        }

        // check held down modifying keys first
        if (e.shiftKey == keyData.shift && 
            e.altKey   == keyData.alt &&
            e.ctrlKey  == keyData.ctrl) { // if we pass this, all modifiers match
            
            var dataItem, keys = keyData.keys, key;

            if (YAHOO.lang.isArray(keys)) {
                for (var i=0;i<keys.length;i++) {
                    dataItem = keys[i];
                    key = Event.getCharCode(e);

                    if (dataItem == key) {
                        keyEvent.fire(key, e);
                        break;
                    }
                }
            } else {
                key = Event.getCharCode(e);
                if (keys == key ) {
                    keyEvent.fire(key, e);
                }
            }
        }
    }

    /**
    * Enables the KeyListener by attaching the DOM event listeners to the 
    * target DOM element
    * @method enable
    */
    this.enable = function() {
        if (! this.enabled) {
            Event.on(attachTo, event, handleKeyPress);
            this.enabledEvent.fire(keyData);
        }
        /**
        * Boolean indicating the enabled/disabled state of the Tooltip
        * @property enabled
        * @type Boolean
        */
        this.enabled = true;
    };

    /**
    * Disables the KeyListener by removing the DOM event listeners from the 
    * target DOM element
    * @method disable
    */
    this.disable = function() {
        if (this.enabled) {
            Event.removeListener(attachTo, event, handleKeyPress);
            this.disabledEvent.fire(keyData);
        }
        this.enabled = false;
    };

    /**
    * Returns a String representation of the object.
    * @method toString
    * @return {String}  The string representation of the KeyListener
    */ 
    this.toString = function() {
        return "KeyListener [" + keyData.keys + "] " + attachTo.tagName + 
                (attachTo.id ? "[" + attachTo.id + "]" : "");
    };

};

var KeyListener = YAHOO.util.KeyListener;

/**
 * Constant representing the DOM "keydown" event.
 * @property YAHOO.util.KeyListener.KEYDOWN
 * @static
 * @final
 * @type String
 */
KeyListener.KEYDOWN = "keydown";

/**
 * Constant representing the DOM "keyup" event.
 * @property YAHOO.util.KeyListener.KEYUP
 * @static
 * @final
 * @type String
 */
KeyListener.KEYUP = "keyup";

/**
 * keycode constants for a subset of the special keys
 * @property KEY
 * @static
 * @final
 */
KeyListener.KEY = {
    ALT          : 18,
    BACK_SPACE   : 8,
    CAPS_LOCK    : 20,
    CONTROL      : 17,
    DELETE       : 46,
    DOWN         : 40,
    END          : 35,
    ENTER        : 13,
    ESCAPE       : 27,
    HOME         : 36,
    LEFT         : 37,
    META         : 224,
    NUM_LOCK     : 144,
    PAGE_DOWN    : 34,
    PAGE_UP      : 33, 
    PAUSE        : 19,
    PRINTSCREEN  : 44,
    RIGHT        : 39,
    SCROLL_LOCK  : 145,
    SHIFT        : 16,
    SPACE        : 32,
    TAB          : 9,
    UP           : 38
};

})();
YAHOO.register("event", YAHOO.util.Event, {version: "2.7.0", build: "1796"});
/*
Copyright (c) 2009, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
version: 2.7.0
*/
/**
 * Provides a mechanism to fetch remote resources and
 * insert them into a document
 * @module get
 * @requires yahoo
 */

/**
 * Fetches and inserts one or more script or link nodes into the document 
 * @namespace YAHOO.util
 * @class YAHOO.util.Get
 */
YAHOO.util.Get = function() {

    /**
     * hash of queues to manage multiple requests
     * @property queues
     * @private
     */
    var queues={}, 
        
    /**
     * queue index used to generate transaction ids
     * @property qidx
     * @type int
     * @private
     */
        qidx=0, 
        
    /**
     * node index used to generate unique node ids
     * @property nidx
     * @type int
     * @private
     */
        nidx=0, 

        // ridx=0,

        // sandboxFrame=null,

    /**
     * interal property used to prevent multiple simultaneous purge 
     * processes
     * @property purging
     * @type boolean
     * @private
     */
        purging=false,

        ua=YAHOO.env.ua, 
        
        lang=YAHOO.lang;
    
    /** 
     * Generates an HTML element, this is not appended to a document
     * @method _node
     * @param type {string} the type of element
     * @param attr {string} the attributes
     * @param win {Window} optional window to create the element in
     * @return {HTMLElement} the generated node
     * @private
     */
    var _node = function(type, attr, win) {
        var w = win || window, d=w.document, n=d.createElement(type);

        for (var i in attr) {
            if (attr[i] && YAHOO.lang.hasOwnProperty(attr, i)) {
                n.setAttribute(i, attr[i]);
            }
        }

        return n;
    };

    /**
     * Generates a link node
     * @method _linkNode
     * @param url {string} the url for the css file
     * @param win {Window} optional window to create the node in
     * @return {HTMLElement} the generated node
     * @private
     */
    var _linkNode = function(url, win, charset) {
        var c = charset || "utf-8";
        return _node("link", {
                "id":      "yui__dyn_" + (nidx++),
                "type":    "text/css",
                "charset": c,
                "rel":     "stylesheet",
                "href":    url
            }, win);
    };

    /**
     * Generates a script node
     * @method _scriptNode
     * @param url {string} the url for the script file
     * @param win {Window} optional window to create the node in
     * @return {HTMLElement} the generated node
     * @private
     */
    var _scriptNode = function(url, win, charset) {
        var c = charset || "utf-8";
        return _node("script", {
                "id":      "yui__dyn_" + (nidx++),
                "type":    "text/javascript",
                "charset": c,
                "src":     url
            }, win);
    };

    /**
     * Returns the data payload for callback functions
     * @method _returnData
     * @private
     */
    var _returnData = function(q, msg) {
        return {
                tId: q.tId,
                win: q.win,
                data: q.data,
                nodes: q.nodes,
                msg: msg,
                purge: function() {
                    _purge(this.tId);
                }
            };
    };

    var _get = function(nId, tId) {
        var q = queues[tId],
            n = (lang.isString(nId)) ? q.win.document.getElementById(nId) : nId;
        if (!n) {
            _fail(tId, "target node not found: " + nId);
        }

        return n;
    };

    /*
     * The request failed, execute fail handler with whatever
     * was accomplished.  There isn't a failure case at the
     * moment unless you count aborted transactions
     * @method _fail
     * @param id {string} the id of the request
     * @private
     */
    var _fail = function(id, msg) {
        var q = queues[id];
        // execute failure callback
        if (q.onFailure) {
            var sc=q.scope || q.win;
            q.onFailure.call(sc, _returnData(q, msg));
        }
    };

    /**
     * The request is complete, so executing the requester's callback
     * @method _finish
     * @param id {string} the id of the request
     * @private
     */
    var _finish = function(id) {
        var q = queues[id];
        q.finished = true;

        if (q.aborted) {
            var msg = "transaction " + id + " was aborted";
            _fail(id, msg);
            return;
        }

        // execute success callback
        if (q.onSuccess) {
            var sc=q.scope || q.win;
            q.onSuccess.call(sc, _returnData(q));
        }
    };

    /**
     * Timeout detected
     * @method _timeout
     * @param id {string} the id of the request
     * @private
     */
    var _timeout = function(id) {
        var q = queues[id];
        if (q.onTimeout) {
            var sc=q.scope || q;
            q.onTimeout.call(sc, _returnData(q));
        }
    };

    /**
     * Loads the next item for a given request
     * @method _next
     * @param id {string} the id of the request
     * @param loaded {string} the url that was just loaded, if any
     * @private
     */
    var _next = function(id, loaded) {
        var q = queues[id];

        if (q.timer) {
            // Y.log('cancel timer');
            q.timer.cancel();
        }

        if (q.aborted) {
            var msg = "transaction " + id + " was aborted";
            _fail(id, msg);
            return;
        }

        if (loaded) {
            q.url.shift(); 
            if (q.varName) {
                q.varName.shift(); 
            }
        } else {
            // This is the first pass: make sure the url is an array
            q.url = (lang.isString(q.url)) ? [q.url] : q.url;
            if (q.varName) {
                q.varName = (lang.isString(q.varName)) ? [q.varName] : q.varName;
            }
        }

        var w=q.win, d=w.document, h=d.getElementsByTagName("head")[0], n;

        if (q.url.length === 0) {
            // Safari 2.x workaround - There is no way to know when 
            // a script is ready in versions of Safari prior to 3.x.
            // Adding an extra node reduces the problem, but doesn't
            // eliminate it completely because the browser executes
            // them asynchronously. 
            if (q.type === "script" && ua.webkit && ua.webkit < 420 && 
                    !q.finalpass && !q.varName) {
                // Add another script node.  This does not guarantee that the
                // scripts will execute in order, but it does appear to fix the
                // problem on fast connections more effectively than using an
                // arbitrary timeout.  It is possible that the browser does
                // block subsequent script execution in this case for a limited
                // time.
                var extra = _scriptNode(null, q.win, q.charset);
                extra.innerHTML='YAHOO.util.Get._finalize("' + id + '");';
                q.nodes.push(extra); h.appendChild(extra);

            } else {
                _finish(id);
            }

            return;
        } 


        var url = q.url[0];

        // if the url is undefined, this is probably a trailing comma problem in IE
        if (!url) {
            q.url.shift(); 
            return _next(id);
        }


        if (q.timeout) {
            // Y.log('create timer');
            q.timer = lang.later(q.timeout, q, _timeout, id);
        }

        if (q.type === "script") {
            n = _scriptNode(url, w, q.charset);
        } else {
            n = _linkNode(url, w, q.charset);
        }

        // track this node's load progress
        _track(q.type, n, id, url, w, q.url.length);

        // add the node to the queue so we can return it to the user supplied callback
        q.nodes.push(n);

        // add it to the head or insert it before 'insertBefore'
        if (q.insertBefore) {
            var s = _get(q.insertBefore, id);
            if (s) {
                s.parentNode.insertBefore(n, s);
            }
        } else {
            h.appendChild(n);
        }
        

        // FireFox does not support the onload event for link nodes, so there is
        // no way to make the css requests synchronous. This means that the css 
        // rules in multiple files could be applied out of order in this browser
        // if a later request returns before an earlier one.  Safari too.
        if ((ua.webkit || ua.gecko) && q.type === "css") {
            _next(id, url);
        }
    };

    /**
     * Removes processed queues and corresponding nodes
     * @method _autoPurge
     * @private
     */
    var _autoPurge = function() {

        if (purging) {
            return;
        }

        purging = true;
        for (var i in queues) {
            var q = queues[i];
            if (q.autopurge && q.finished) {
                _purge(q.tId);
                delete queues[i];
            }
        }

        purging = false;
    };

    /**
     * Removes the nodes for the specified queue
     * @method _purge
     * @private
     */
    var _purge = function(tId) {
        var q=queues[tId];
        if (q) {
            var n=q.nodes, l=n.length, d=q.win.document, 
                h=d.getElementsByTagName("head")[0];

            if (q.insertBefore) {
                var s = _get(q.insertBefore, tId);
                if (s) {
                    h = s.parentNode;
                }
            }

            for (var i=0; i<l; i=i+1) {
                h.removeChild(n[i]);
            }

            q.nodes = [];
        }
    };

    /**
     * Saves the state for the request and begins loading
     * the requested urls
     * @method queue
     * @param type {string} the type of node to insert
     * @param url {string} the url to load
     * @param opts the hash of options for this request
     * @private
     */
    var _queue = function(type, url, opts) {

        var id = "q" + (qidx++);
        opts = opts || {};

        if (qidx % YAHOO.util.Get.PURGE_THRESH === 0) {
            _autoPurge();
        }

        queues[id] = lang.merge(opts, {
            tId: id,
            type: type,
            url: url,
            finished: false,
            aborted: false,
            nodes: []
        });

        var q = queues[id];
        q.win = q.win || window;
        q.scope = q.scope || q.win;
        q.autopurge = ("autopurge" in q) ? q.autopurge : 
                      (type === "script") ? true : false;

        lang.later(0, q, _next, id);

        return {
            tId: id
        };
    };

    /**
     * Detects when a node has been loaded.  In the case of
     * script nodes, this does not guarantee that contained
     * script is ready to use.
     * @method _track
     * @param type {string} the type of node to track
     * @param n {HTMLElement} the node to track
     * @param id {string} the id of the request
     * @param url {string} the url that is being loaded
     * @param win {Window} the targeted window
     * @param qlength the number of remaining items in the queue,
     * including this one
     * @param trackfn {Function} function to execute when finished
     * the default is _next
     * @private
     */
    var _track = function(type, n, id, url, win, qlength, trackfn) {
        var f = trackfn || _next;

        // IE supports the readystatechange event for script and css nodes
        if (ua.ie) {
            n.onreadystatechange = function() {
                var rs = this.readyState;
                if ("loaded" === rs || "complete" === rs) {
                    n.onreadystatechange = null;
                    f(id, url);
                }
            };

        // webkit prior to 3.x is problemmatic
        } else if (ua.webkit) {

            if (type === "script") {

                // Safari 3.x supports the load event for script nodes (DOM2)
                if (ua.webkit >= 420) {

                    n.addEventListener("load", function() {
                        f(id, url);
                    });

                // Nothing can be done with Safari < 3.x except to pause and hope
                // for the best, particularly after last script is inserted. The
                // scripts will always execute in the order they arrive, not
                // necessarily the order in which they were inserted.  To support
                // script nodes with complete reliability in these browsers, script
                // nodes either need to invoke a function in the window once they
                // are loaded or the implementer needs to provide a well-known
                // property that the utility can poll for.
                } else {
                    // Poll for the existence of the named variable, if it
                    // was supplied.
                    var q = queues[id];
                    if (q.varName) {
                        var freq=YAHOO.util.Get.POLL_FREQ;
                        q.maxattempts = YAHOO.util.Get.TIMEOUT/freq;
                        q.attempts = 0;
                        q._cache = q.varName[0].split(".");
                        q.timer = lang.later(freq, q, function(o) {
                            var a=this._cache, l=a.length, w=this.win, i;
                            for (i=0; i<l; i=i+1) {
                                w = w[a[i]];
                                if (!w) {
                                    // if we have exausted our attempts, give up
                                    this.attempts++;
                                    if (this.attempts++ > this.maxattempts) {
                                        var msg = "Over retry limit, giving up";
                                        q.timer.cancel();
                                        _fail(id, msg);
                                    } else {
                                    }
                                    return;
                                }
                            }
                            

                            q.timer.cancel();
                            f(id, url);

                        }, null, true);
                    } else {
                        lang.later(YAHOO.util.Get.POLL_FREQ, null, f, [id, url]);
                    }
                }
            } 

        // FireFox and Opera support onload (but not DOM2 in FF) handlers for
        // script nodes.  Opera, but not FF, supports the onload event for link
        // nodes.
        } else { 
            n.onload = function() {
                f(id, url);
            };
        }
    };

    return {

        /**
         * The default poll freqency in ms, when needed
         * @property POLL_FREQ
         * @static
         * @type int
         * @default 10
         */
        POLL_FREQ: 10,

        /**
         * The number of request required before an automatic purge.
         * property PURGE_THRESH
         * @static
         * @type int
         * @default 20
         */
        PURGE_THRESH: 20,

        /**
         * The length time to poll for varName when loading a script in
         * Safari 2.x before the transaction fails.
         * property TIMEOUT
         * @static
         * @type int
         * @default 2000
         */
        TIMEOUT: 2000,
        
        /**
         * Called by the the helper for detecting script load in Safari
         * @method _finalize
         * @param id {string} the transaction id
         * @private
         */
        _finalize: function(id) {
            lang.later(0, null, _finish, id);
        },

        /**
         * Abort a transaction
         * @method abort
         * @param {string|object} either the tId or the object returned from
         * script() or css()
         */
        abort: function(o) {
            var id = (lang.isString(o)) ? o : o.tId;
            var q = queues[id];
            if (q) {
                q.aborted = true;
            }
        }, 

        /**
         * Fetches and inserts one or more script nodes into the head
         * of the current document or the document in a specified window.
         *
         * @method script
         * @static
         * @param url {string|string[]} the url or urls to the script(s)
         * @param opts {object} Options: 
         * <dl>
         * <dt>onSuccess</dt>
         * <dd>
         * callback to execute when the script(s) are finished loading
         * The callback receives an object back with the following
         * data:
         * <dl>
         * <dt>win</dt>
         * <dd>the window the script(s) were inserted into</dd>
         * <dt>data</dt>
         * <dd>the data object passed in when the request was made</dd>
         * <dt>nodes</dt>
         * <dd>An array containing references to the nodes that were
         * inserted</dd>
         * <dt>purge</dt>
         * <dd>A function that, when executed, will remove the nodes
         * that were inserted</dd>
         * <dt>
         * </dl>
         * </dd>
         * <dt>onFailure</dt>
         * <dd>
         * callback to execute when the script load operation fails
         * The callback receives an object back with the following
         * data:
         * <dl>
         * <dt>win</dt>
         * <dd>the window the script(s) were inserted into</dd>
         * <dt>data</dt>
         * <dd>the data object passed in when the request was made</dd>
         * <dt>nodes</dt>
         * <dd>An array containing references to the nodes that were
         * inserted successfully</dd>
         * <dt>purge</dt>
         * <dd>A function that, when executed, will remove any nodes
         * that were inserted</dd>
         * <dt>
         * </dl>
         * </dd>
         * <dt>onTimeout</dt>
         * <dd>
         * callback to execute when a timeout occurs.
         * The callback receives an object back with the following
         * data:
         * <dl>
         * <dt>win</dt>
         * <dd>the window the script(s) were inserted into</dd>
         * <dt>data</dt>
         * <dd>the data object passed in when the request was made</dd>
         * <dt>nodes</dt>
         * <dd>An array containing references to the nodes that were
         * inserted</dd>
         * <dt>purge</dt>
         * <dd>A function that, when executed, will remove the nodes
         * that were inserted</dd>
         * <dt>
         * </dl>
         * </dd>
         * <dt>scope</dt>
         * <dd>the execution context for the callbacks</dd>
         * <dt>win</dt>
         * <dd>a window other than the one the utility occupies</dd>
         * <dt>autopurge</dt>
         * <dd>
         * setting to true will let the utilities cleanup routine purge 
         * the script once loaded
         * </dd>
         * <dt>data</dt>
         * <dd>
         * data that is supplied to the callback when the script(s) are
         * loaded.
         * </dd>
         * <dt>varName</dt>
         * <dd>
         * variable that should be available when a script is finished
         * loading.  Used to help Safari 2.x and below with script load 
         * detection.  The type of this property should match what was
         * passed into the url parameter: if loading a single url, a
         * string can be supplied.  If loading multiple scripts, you
         * must supply an array that contains the variable name for
         * each script.
         * </dd>
         * <dt>insertBefore</dt>
         * <dd>node or node id that will become the new node's nextSibling</dd>
         * </dl>
         * <dt>charset</dt>
         * <dd>Node charset, default utf-8</dd>
         * <dt>timeout</dt>
         * <dd>Number of milliseconds to wait before aborting and firing the timeout event</dd>
         * <pre>
         * // assumes yahoo, dom, and event are already on the page
         * &nbsp;&nbsp;YAHOO.util.Get.script(
         * &nbsp;&nbsp;["http://yui.yahooapis.com/2.3.1/build/dragdrop/dragdrop-min.js",
         * &nbsp;&nbsp;&nbsp;"http://yui.yahooapis.com/2.3.1/build/animation/animation-min.js"], &#123;
         * &nbsp;&nbsp;&nbsp;&nbsp;onSuccess: function(o) &#123;
         * &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;new YAHOO.util.DDProxy("dd1"); // also new o.reference("dd1"); would work
         * &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;this.log("won't cause error because YAHOO is the scope");
         * &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;this.log(o.nodes.length === 2) // true
         * &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// o.purge(); // optionally remove the script nodes immediately
         * &nbsp;&nbsp;&nbsp;&nbsp;&#125;,
         * &nbsp;&nbsp;&nbsp;&nbsp;onFailure: function(o) &#123;
         * &nbsp;&nbsp;&nbsp;&nbsp;&#125;,
         * &nbsp;&nbsp;&nbsp;&nbsp;data: "foo",
         * &nbsp;&nbsp;&nbsp;&nbsp;timeout: 10000, // 10 second timeout
         * &nbsp;&nbsp;&nbsp;&nbsp;scope: YAHOO,
         * &nbsp;&nbsp;&nbsp;&nbsp;// win: otherframe // target another window/frame
         * &nbsp;&nbsp;&nbsp;&nbsp;autopurge: true // allow the utility to choose when to remove the nodes
         * &nbsp;&nbsp;&#125;);
         * </pre>
         * @return {tId: string} an object containing info about the transaction
         */
        script: function(url, opts) { return _queue("script", url, opts); },

        /**
         * Fetches and inserts one or more css link nodes into the 
         * head of the current document or the document in a specified
         * window.
         * @method css
         * @static
         * @param url {string} the url or urls to the css file(s)
         * @param opts Options: 
         * <dl>
         * <dt>onSuccess</dt>
         * <dd>
         * callback to execute when the css file(s) are finished loading
         * The callback receives an object back with the following
         * data:
         * <dl>win</dl>
         * <dd>the window the link nodes(s) were inserted into</dd>
         * <dt>data</dt>
         * <dd>the data object passed in when the request was made</dd>
         * <dt>nodes</dt>
         * <dd>An array containing references to the nodes that were
         * inserted</dd>
         * <dt>purge</dt>
         * <dd>A function that, when executed, will remove the nodes
         * that were inserted</dd>
         * <dt>
         * </dl>
         * </dd>
         * <dt>scope</dt>
         * <dd>the execution context for the callbacks</dd>
         * <dt>win</dt>
         * <dd>a window other than the one the utility occupies</dd>
         * <dt>data</dt>
         * <dd>
         * data that is supplied to the callbacks when the nodes(s) are
         * loaded.
         * </dd>
         * <dt>insertBefore</dt>
         * <dd>node or node id that will become the new node's nextSibling</dd>
         * <dt>charset</dt>
         * <dd>Node charset, default utf-8</dd>
         * </dl>
         * <pre>
         *      YAHOO.util.Get.css("http://yui.yahooapis.com/2.3.1/build/menu/assets/skins/sam/menu.css");
         * </pre>
         * <pre>
         *      YAHOO.util.Get.css(["http://yui.yahooapis.com/2.3.1/build/menu/assets/skins/sam/menu.css",
         * </pre>
         * @return {tId: string} an object containing info about the transaction
         */
        css: function(url, opts) {
            return _queue("css", url, opts); 
        }
    };
}();

YAHOO.register("get", YAHOO.util.Get, {version: "2.7.0", build: "1796"});
/*
Copyright (c) 2009, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
version: 2.7.0
*/
/**
 * The YAHOO object is the single global object used by YUI Library.  It
 * contains utility function for setting up namespaces, inheritance, and
 * logging.  YAHOO.util, YAHOO.widget, and YAHOO.example are namespaces
 * created automatically for and used by the library.
 * @module yahoo
 * @title  YAHOO Global
 */

/**
 * YAHOO_config is not included as part of the library.  Instead it is an 
 * object that can be defined by the implementer immediately before 
 * including the YUI library.  The properties included in this object
 * will be used to configure global properties needed as soon as the 
 * library begins to load.
 * @class YAHOO_config
 * @static
 */

/**
 * A reference to a function that will be executed every time a YAHOO module
 * is loaded.  As parameter, this function will receive the version
 * information for the module. See <a href="YAHOO.env.html#getVersion">
 * YAHOO.env.getVersion</a> for the description of the version data structure.
 * @property listener
 * @type Function
 * @static
 * @default undefined
 */

/**
 * Set to true if the library will be dynamically loaded after window.onload.
 * Defaults to false 
 * @property injecting
 * @type boolean
 * @static
 * @default undefined
 */

/**
 * Instructs the yuiloader component to dynamically load yui components and
 * their dependencies.  See the yuiloader documentation for more information
 * about dynamic loading
 * @property load
 * @static
 * @default undefined
 * @see yuiloader
 */

/**
 * Forces the use of the supplied locale where applicable in the library
 * @property locale
 * @type string
 * @static
 * @default undefined
 */

if (typeof YAHOO == "undefined" || !YAHOO) {
    /**
     * The YAHOO global namespace object.  If YAHOO is already defined, the
     * existing YAHOO object will not be overwritten so that defined
     * namespaces are preserved.
     * @class YAHOO
     * @static
     */
    var YAHOO = {};
}

/**
 * Returns the namespace specified and creates it if it doesn't exist
 * <pre>
 * YAHOO.namespace("property.package");
 * YAHOO.namespace("YAHOO.property.package");
 * </pre>
 * Either of the above would create YAHOO.property, then
 * YAHOO.property.package
 *
 * Be careful when naming packages. Reserved words may work in some browsers
 * and not others. For instance, the following will fail in Safari:
 * <pre>
 * YAHOO.namespace("really.long.nested.namespace");
 * </pre>
 * This fails because "long" is a future reserved word in ECMAScript
 *
 * For implementation code that uses YUI, do not create your components
 * in the namespaces created by the library.  defined by YUI -- create 
 * your own (YAHOO.util, YAHOO.widget, YAHOO.lang, YAHOO.env)
 *
 * @method namespace
 * @static
 * @param  {String*} arguments 1-n namespaces to create 
 * @return {Object}  A reference to the last namespace object created
 */
YAHOO.namespace = function() {
    var a=arguments, o=null, i, j, d;
    for (i=0; i<a.length; i=i+1) {
        d=(""+a[i]).split(".");
        o=YAHOO;

        // YAHOO is implied, so it is ignored if it is included
        for (j=(d[0] == "YAHOO") ? 1 : 0; j<d.length; j=j+1) {
            o[d[j]]=o[d[j]] || {};
            o=o[d[j]];
        }
    }

    return o;
};

/**
 * Uses YAHOO.widget.Logger to output a log message, if the widget is
 * available.
 *
 * @method log
 * @static
 * @param  {String}  msg  The message to log.
 * @param  {String}  cat  The log category for the message.  Default
 *                        categories are "info", "warn", "error", time".
 *                        Custom categories can be used as well. (opt)
 * @param  {String}  src  The source of the the message (opt)
 * @return {Boolean}      True if the log operation was successful.
 */
YAHOO.log = function(msg, cat, src) {
    var l=YAHOO.widget.Logger;
    if(l && l.log) {
        return l.log(msg, cat, src);
    } else {
        return false;
    }
};

/**
 * Registers a module with the YAHOO object
 * @method register
 * @static
 * @param {String}   name    the name of the module (event, slider, etc)
 * @param {Function} mainClass a reference to class in the module.  This
 *                             class will be tagged with the version info
 *                             so that it will be possible to identify the
 *                             version that is in use when multiple versions
 *                             have loaded
 * @param {Object}   data      metadata object for the module.  Currently it
 *                             is expected to contain a "version" property
 *                             and a "build" property at minimum.
 */
YAHOO.register = function(name, mainClass, data) {
    var mods = YAHOO.env.modules, m, v, b, ls, i;

    if (!mods[name]) {
        mods[name] = { 
            versions:[], 
            builds:[] 
        };
    }

    m  = mods[name];
    v  = data.version;
    b  = data.build;
    ls = YAHOO.env.listeners;

    m.name = name;
    m.version = v;
    m.build = b;
    m.versions.push(v);
    m.builds.push(b);
    m.mainClass = mainClass;

    // fire the module load listeners
    for (i=0;i<ls.length;i=i+1) {
        ls[i](m);
    }
    // label the main class
    if (mainClass) {
        mainClass.VERSION = v;
        mainClass.BUILD = b;
    } else {
        YAHOO.log("mainClass is undefined for module " + name, "warn");
    }
};

/**
 * YAHOO.env is used to keep track of what is known about the YUI library and
 * the browsing environment
 * @class YAHOO.env
 * @static
 */
YAHOO.env = YAHOO.env || {

    /**
     * Keeps the version info for all YUI modules that have reported themselves
     * @property modules
     * @type Object[]
     */
    modules: [],
    
    /**
     * List of functions that should be executed every time a YUI module
     * reports itself.
     * @property listeners
     * @type Function[]
     */
    listeners: []
};

/**
 * Returns the version data for the specified module:
 *      <dl>
 *      <dt>name:</dt>      <dd>The name of the module</dd>
 *      <dt>version:</dt>   <dd>The version in use</dd>
 *      <dt>build:</dt>     <dd>The build number in use</dd>
 *      <dt>versions:</dt>  <dd>All versions that were registered</dd>
 *      <dt>builds:</dt>    <dd>All builds that were registered.</dd>
 *      <dt>mainClass:</dt> <dd>An object that was was stamped with the
 *                 current version and build. If 
 *                 mainClass.VERSION != version or mainClass.BUILD != build,
 *                 multiple versions of pieces of the library have been
 *                 loaded, potentially causing issues.</dd>
 *       </dl>
 *
 * @method getVersion
 * @static
 * @param {String}  name the name of the module (event, slider, etc)
 * @return {Object} The version info
 */
YAHOO.env.getVersion = function(name) {
    return YAHOO.env.modules[name] || null;
};

/**
 * Do not fork for a browser if it can be avoided.  Use feature detection when
 * you can.  Use the user agent as a last resort.  YAHOO.env.ua stores a version
 * number for the browser engine, 0 otherwise.  This value may or may not map
 * to the version number of the browser using the engine.  The value is 
 * presented as a float so that it can easily be used for boolean evaluation 
 * as well as for looking for a particular range of versions.  Because of this, 
 * some of the granularity of the version info may be lost (e.g., Gecko 1.8.0.9 
 * reports 1.8).
 * @class YAHOO.env.ua
 * @static
 */
YAHOO.env.ua = function() {
    var o={

        /**
         * Internet Explorer version number or 0.  Example: 6
         * @property ie
         * @type float
         */
        ie:0,

        /**
         * Opera version number or 0.  Example: 9.2
         * @property opera
         * @type float
         */
        opera:0,

        /**
         * Gecko engine revision number.  Will evaluate to 1 if Gecko 
         * is detected but the revision could not be found. Other browsers
         * will be 0.  Example: 1.8
         * <pre>
         * Firefox 1.0.0.4: 1.7.8   <-- Reports 1.7
         * Firefox 1.5.0.9: 1.8.0.9 <-- Reports 1.8
         * Firefox 2.0.0.3: 1.8.1.3 <-- Reports 1.8
         * Firefox 3 alpha: 1.9a4   <-- Reports 1.9
         * </pre>
         * @property gecko
         * @type float
         */
        gecko:0,

        /**
         * AppleWebKit version.  KHTML browsers that are not WebKit browsers 
         * will evaluate to 1, other browsers 0.  Example: 418.9.1
         * <pre>
         * Safari 1.3.2 (312.6): 312.8.1 <-- Reports 312.8 -- currently the 
         *                                   latest available for Mac OSX 10.3.
         * Safari 2.0.2:         416     <-- hasOwnProperty introduced
         * Safari 2.0.4:         418     <-- preventDefault fixed
         * Safari 2.0.4 (419.3): 418.9.1 <-- One version of Safari may run
         *                                   different versions of webkit
         * Safari 2.0.4 (419.3): 419     <-- Tiger installations that have been
         *                                   updated, but not updated
         *                                   to the latest patch.
         * Webkit 212 nightly:   522+    <-- Safari 3.0 precursor (with native SVG
         *                                   and many major issues fixed).  
         * 3.x yahoo.com, flickr:422     <-- Safari 3.x hacks the user agent
         *                                   string when hitting yahoo.com and 
         *                                   flickr.com.
         * Safari 3.0.4 (523.12):523.12  <-- First Tiger release - automatic update
         *                                   from 2.x via the 10.4.11 OS patch
         * Webkit nightly 1/2008:525+    <-- Supports DOMContentLoaded event.
         *                                   yahoo.com user agent hack removed.
         *                                   
         * </pre>
         * http://developer.apple.com/internet/safari/uamatrix.html
         * @property webkit
         * @type float
         */
        webkit: 0,

        /**
         * The mobile property will be set to a string containing any relevant
         * user agent information when a modern mobile browser is detected.
         * Currently limited to Safari on the iPhone/iPod Touch, Nokia N-series
         * devices with the WebKit-based browser, and Opera Mini.  
         * @property mobile 
         * @type string
         */
        mobile: null,

        /**
         * Adobe AIR version number or 0.  Only populated if webkit is detected.
         * Example: 1.0
         * @property air
         * @type float
         */
        air: 0,

        /**
         * Google Caja version number or 0.
         * @property caja
         * @type float
         */
        caja: 0

    },

    ua = navigator.userAgent, 
    
    m;

    // Modern KHTML browsers should qualify as Safari X-Grade
    if ((/KHTML/).test(ua)) {
        o.webkit=1;
    }
    // Modern WebKit browsers are at least X-Grade
    m=ua.match(/AppleWebKit\/([^\s]*)/);
    if (m&&m[1]) {
        o.webkit=parseFloat(m[1]);

        // Mobile browser check
        if (/ Mobile\//.test(ua)) {
            o.mobile = "Apple"; // iPhone or iPod Touch
        } else {
            m=ua.match(/NokiaN[^\/]*/);
            if (m) {
                o.mobile = m[0]; // Nokia N-series, ex: NokiaN95
            }
        }

        m=ua.match(/AdobeAIR\/([^\s]*)/);
        if (m) {
            o.air = m[0]; // Adobe AIR 1.0 or better
        }

    }

    if (!o.webkit) { // not webkit
        // @todo check Opera/8.01 (J2ME/MIDP; Opera Mini/2.0.4509/1316; fi; U; ssr)
        m=ua.match(/Opera[\s\/]([^\s]*)/);
        if (m&&m[1]) {
            o.opera=parseFloat(m[1]);
            m=ua.match(/Opera Mini[^;]*/);
            if (m) {
                o.mobile = m[0]; // ex: Opera Mini/2.0.4509/1316
            }
        } else { // not opera or webkit
            m=ua.match(/MSIE\s([^;]*)/);
            if (m&&m[1]) {
                o.ie=parseFloat(m[1]);
            } else { // not opera, webkit, or ie
                m=ua.match(/Gecko\/([^\s]*)/);
                if (m) {
                    o.gecko=1; // Gecko detected, look for revision
                    m=ua.match(/rv:([^\s\)]*)/);
                    if (m&&m[1]) {
                        o.gecko=parseFloat(m[1]);
                    }
                }
            }
        }
    }

    m=ua.match(/Caja\/([^\s]*)/);
    if (m&&m[1]) {
        o.caja=parseFloat(m[1]);
    }
    
    return o;
}();

/*
 * Initializes the global by creating the default namespaces and applying
 * any new configuration information that is detected.  This is the setup
 * for env.
 * @method init
 * @static
 * @private
 */
(function() {
    YAHOO.namespace("util", "widget", "example");
    /*global YAHOO_config*/
    if ("undefined" !== typeof YAHOO_config) {
        var l=YAHOO_config.listener,ls=YAHOO.env.listeners,unique=true,i;
        if (l) {
            // if YAHOO is loaded multiple times we need to check to see if
            // this is a new config object.  If it is, add the new component
            // load listener to the stack
            for (i=0;i<ls.length;i=i+1) {
                if (ls[i]==l) {
                    unique=false;
                    break;
                }
            }
            if (unique) {
                ls.push(l);
            }
        }
    }
})();
/**
 * Provides the language utilites and extensions used by the library
 * @class YAHOO.lang
 */
YAHOO.lang = YAHOO.lang || {};

(function() {


var L = YAHOO.lang,

    ARRAY_TOSTRING = '[object Array]',
    FUNCTION_TOSTRING = '[object Function]',
    OP = Object.prototype,

    // ADD = ["toString", "valueOf", "hasOwnProperty"],
    ADD = ["toString", "valueOf"],

    OB = {

    /**
     * Determines wheather or not the provided object is an array.
     * @method isArray
     * @param {any} o The object being testing
     * @return {boolean} the result
     */
    isArray: function(o) { 
        return OP.toString.apply(o) === ARRAY_TOSTRING;
    },

    /**
     * Determines whether or not the provided object is a boolean
     * @method isBoolean
     * @param {any} o The object being testing
     * @return {boolean} the result
     */
    isBoolean: function(o) {
        return typeof o === 'boolean';
    },
    
    /**
     * Determines whether or not the provided object is a function.
     * Note: Internet Explorer thinks certain functions are objects:
     *
     * var obj = document.createElement("object");
     * YAHOO.lang.isFunction(obj.getAttribute) // reports false in IE
     *
     * var input = document.createElement("input"); // append to body
     * YAHOO.lang.isFunction(input.focus) // reports false in IE
     *
     * You will have to implement additional tests if these functions
     * matter to you.
     *
     * @method isFunction
     * @param {any} o The object being testing
     * @return {boolean} the result
     */
    isFunction: function(o) {
        return OP.toString.apply(o) === FUNCTION_TOSTRING;
    },
        
    /**
     * Determines whether or not the provided object is null
     * @method isNull
     * @param {any} o The object being testing
     * @return {boolean} the result
     */
    isNull: function(o) {
        return o === null;
    },
        
    /**
     * Determines whether or not the provided object is a legal number
     * @method isNumber
     * @param {any} o The object being testing
     * @return {boolean} the result
     */
    isNumber: function(o) {
        return typeof o === 'number' && isFinite(o);
    },
      
    /**
     * Determines whether or not the provided object is of type object
     * or function
     * @method isObject
     * @param {any} o The object being testing
     * @return {boolean} the result
     */  
    isObject: function(o) {
return (o && (typeof o === 'object' || L.isFunction(o))) || false;
    },
        
    /**
     * Determines whether or not the provided object is a string
     * @method isString
     * @param {any} o The object being testing
     * @return {boolean} the result
     */
    isString: function(o) {
        return typeof o === 'string';
    },
        
    /**
     * Determines whether or not the provided object is undefined
     * @method isUndefined
     * @param {any} o The object being testing
     * @return {boolean} the result
     */
    isUndefined: function(o) {
        return typeof o === 'undefined';
    },
    
 
    /**
     * IE will not enumerate native functions in a derived object even if the
     * function was overridden.  This is a workaround for specific functions 
     * we care about on the Object prototype. 
     * @property _IEEnumFix
     * @param {Function} r  the object to receive the augmentation
     * @param {Function} s  the object that supplies the properties to augment
     * @static
     * @private
     */
    _IEEnumFix: (YAHOO.env.ua.ie) ? function(r, s) {
            var i, fname, f;
            for (i=0;i<ADD.length;i=i+1) {

                fname = ADD[i];
                f = s[fname];

                if (L.isFunction(f) && f!=OP[fname]) {
                    r[fname]=f;
                }
            }
    } : function(){},
       
    /**
     * Utility to set up the prototype, constructor and superclass properties to
     * support an inheritance strategy that can chain constructors and methods.
     * Static members will not be inherited.
     *
     * @method extend
     * @static
     * @param {Function} subc   the object to modify
     * @param {Function} superc the object to inherit
     * @param {Object} overrides  additional properties/methods to add to the
     *                              subclass prototype.  These will override the
     *                              matching items obtained from the superclass 
     *                              if present.
     */
    extend: function(subc, superc, overrides) {
        if (!superc||!subc) {
            throw new Error("extend failed, please check that " +
                            "all dependencies are included.");
        }
        var F = function() {}, i;
        F.prototype=superc.prototype;
        subc.prototype=new F();
        subc.prototype.constructor=subc;
        subc.superclass=superc.prototype;
        if (superc.prototype.constructor == OP.constructor) {
            superc.prototype.constructor=superc;
        }
    
        if (overrides) {
            for (i in overrides) {
                if (L.hasOwnProperty(overrides, i)) {
                    subc.prototype[i]=overrides[i];
                }
            }

            L._IEEnumFix(subc.prototype, overrides);
        }
    },
   
    /**
     * Applies all properties in the supplier to the receiver if the
     * receiver does not have these properties yet.  Optionally, one or 
     * more methods/properties can be specified (as additional 
     * parameters).  This option will overwrite the property if receiver 
     * has it already.  If true is passed as the third parameter, all 
     * properties will be applied and _will_ overwrite properties in 
     * the receiver.
     *
     * @method augmentObject
     * @static
     * @since 2.3.0
     * @param {Function} r  the object to receive the augmentation
     * @param {Function} s  the object that supplies the properties to augment
     * @param {String*|boolean}  arguments zero or more properties methods 
     *        to augment the receiver with.  If none specified, everything
     *        in the supplier will be used unless it would
     *        overwrite an existing property in the receiver. If true
     *        is specified as the third parameter, all properties will
     *        be applied and will overwrite an existing property in
     *        the receiver
     */
    augmentObject: function(r, s) {
        if (!s||!r) {
            throw new Error("Absorb failed, verify dependencies.");
        }
        var a=arguments, i, p, overrideList=a[2];
        if (overrideList && overrideList!==true) { // only absorb the specified properties
            for (i=2; i<a.length; i=i+1) {
                r[a[i]] = s[a[i]];
            }
        } else { // take everything, overwriting only if the third parameter is true
            for (p in s) { 
                if (overrideList || !(p in r)) {
                    r[p] = s[p];
                }
            }
            
            L._IEEnumFix(r, s);
        }
    },
 
    /**
     * Same as YAHOO.lang.augmentObject, except it only applies prototype properties
     * @see YAHOO.lang.augmentObject
     * @method augmentProto
     * @static
     * @param {Function} r  the object to receive the augmentation
     * @param {Function} s  the object that supplies the properties to augment
     * @param {String*|boolean}  arguments zero or more properties methods 
     *        to augment the receiver with.  If none specified, everything 
     *        in the supplier will be used unless it would overwrite an existing 
     *        property in the receiver.  if true is specified as the third 
     *        parameter, all properties will be applied and will overwrite an 
     *        existing property in the receiver
     */
    augmentProto: function(r, s) {
        if (!s||!r) {
            throw new Error("Augment failed, verify dependencies.");
        }
        //var a=[].concat(arguments);
        var a=[r.prototype,s.prototype], i;
        for (i=2;i<arguments.length;i=i+1) {
            a.push(arguments[i]);
        }
        L.augmentObject.apply(this, a);
    },

      
    /**
     * Returns a simple string representation of the object or array.
     * Other types of objects will be returned unprocessed.  Arrays
     * are expected to be indexed.  Use object notation for
     * associative arrays.
     * @method dump
     * @since 2.3.0
     * @param o {Object} The object to dump
     * @param d {int} How deep to recurse child objects, default 3
     * @return {String} the dump result
     */
    dump: function(o, d) {
        var i,len,s=[],OBJ="{...}",FUN="f(){...}",
            COMMA=', ', ARROW=' => ';

        // Cast non-objects to string
        // Skip dates because the std toString is what we want
        // Skip HTMLElement-like objects because trying to dump 
        // an element will cause an unhandled exception in FF 2.x
        if (!L.isObject(o)) {
            return o + "";
        } else if (o instanceof Date || ("nodeType" in o && "tagName" in o)) {
            return o;
        } else if  (L.isFunction(o)) {
            return FUN;
        }

        // dig into child objects the depth specifed. Default 3
        d = (L.isNumber(d)) ? d : 3;

        // arrays [1, 2, 3]
        if (L.isArray(o)) {
            s.push("[");
            for (i=0,len=o.length;i<len;i=i+1) {
                if (L.isObject(o[i])) {
                    s.push((d > 0) ? L.dump(o[i], d-1) : OBJ);
                } else {
                    s.push(o[i]);
                }
                s.push(COMMA);
            }
            if (s.length > 1) {
                s.pop();
            }
            s.push("]");
        // objects {k1 => v1, k2 => v2}
        } else {
            s.push("{");
            for (i in o) {
                if (L.hasOwnProperty(o, i)) {
                    s.push(i + ARROW);
                    if (L.isObject(o[i])) {
                        s.push((d > 0) ? L.dump(o[i], d-1) : OBJ);
                    } else {
                        s.push(o[i]);
                    }
                    s.push(COMMA);
                }
            }
            if (s.length > 1) {
                s.pop();
            }
            s.push("}");
        }

        return s.join("");
    },

    /**
     * Does variable substitution on a string. It scans through the string 
     * looking for expressions enclosed in { } braces. If an expression 
     * is found, it is used a key on the object.  If there is a space in
     * the key, the first word is used for the key and the rest is provided
     * to an optional function to be used to programatically determine the
     * value (the extra information might be used for this decision). If 
     * the value for the key in the object, or what is returned from the
     * function has a string value, number value, or object value, it is 
     * substituted for the bracket expression and it repeats.  If this
     * value is an object, it uses the Object's toString() if this has
     * been overridden, otherwise it does a shallow dump of the key/value
     * pairs.
     * @method substitute
     * @since 2.3.0
     * @param s {String} The string that will be modified.
     * @param o {Object} An object containing the replacement values
     * @param f {Function} An optional function that can be used to
     *                     process each match.  It receives the key,
     *                     value, and any extra metadata included with
     *                     the key inside of the braces.
     * @return {String} the substituted string
     */
    substitute: function (s, o, f) {
        var i, j, k, key, v, meta, saved=[], token, 
            DUMP='dump', SPACE=' ', LBRACE='{', RBRACE='}',
            dump;


        for (;;) {
            i = s.lastIndexOf(LBRACE);
            if (i < 0) {
                break;
            }
            j = s.indexOf(RBRACE, i);
            if (i + 1 >= j) {
                break;
            }

            //Extract key and meta info 
            token = s.substring(i + 1, j);
            key = token;
            meta = null;
            k = key.indexOf(SPACE);
            if (k > -1) {
                meta = key.substring(k + 1);
                key = key.substring(0, k);
            }

            // lookup the value
            v = o[key];

            // if a substitution function was provided, execute it
            if (f) {
                v = f(key, v, meta);
            }

            if (L.isObject(v)) {
                if (L.isArray(v)) {
                    v = L.dump(v, parseInt(meta, 10));
                } else {
                    meta = meta || "";

                    // look for the keyword 'dump', if found force obj dump
                    dump = meta.indexOf(DUMP);
                    if (dump > -1) {
                        meta = meta.substring(4);
                    }

                    // use the toString if it is not the Object toString 
                    // and the 'dump' meta info was not found
                    if (v.toString===OP.toString || dump>-1) {
                        v = L.dump(v, parseInt(meta, 10));
                    } else {
                        v = v.toString();
                    }
                }
            } else if (!L.isString(v) && !L.isNumber(v)) {
                // This {block} has no replace string. Save it for later.
                v = "~-" + saved.length + "-~";
                saved[saved.length] = token;

                // break;
            }

            s = s.substring(0, i) + v + s.substring(j + 1);


        }

        // restore saved {block}s
        for (i=saved.length-1; i>=0; i=i-1) {
            s = s.replace(new RegExp("~-" + i + "-~"), "{"  + saved[i] + "}", "g");
        }

        return s;
    },


    /**
     * Returns a string without any leading or trailing whitespace.  If 
     * the input is not a string, the input will be returned untouched.
     * @method trim
     * @since 2.3.0
     * @param s {string} the string to trim
     * @return {string} the trimmed string
     */
    trim: function(s){
        try {
            return s.replace(/^\s+|\s+$/g, "");
        } catch(e) {
            return s;
        }
    },

    /**
     * Returns a new object containing all of the properties of
     * all the supplied objects.  The properties from later objects
     * will overwrite those in earlier objects.
     * @method merge
     * @since 2.3.0
     * @param arguments {Object*} the objects to merge
     * @return the new merged object
     */
    merge: function() {
        var o={}, a=arguments, l=a.length, i;
        for (i=0; i<l; i=i+1) {
            L.augmentObject(o, a[i], true);
        }
        return o;
    },

    /**
     * Executes the supplied function in the context of the supplied 
     * object 'when' milliseconds later.  Executes the function a 
     * single time unless periodic is set to true.
     * @method later
     * @since 2.4.0
     * @param when {int} the number of milliseconds to wait until the fn 
     * is executed
     * @param o the context object
     * @param fn {Function|String} the function to execute or the name of 
     * the method in the 'o' object to execute
     * @param data [Array] data that is provided to the function.  This accepts
     * either a single item or an array.  If an array is provided, the
     * function is executed with one parameter for each array item.  If
     * you need to pass a single array parameter, it needs to be wrapped in
     * an array [myarray]
     * @param periodic {boolean} if true, executes continuously at supplied 
     * interval until canceled
     * @return a timer object. Call the cancel() method on this object to 
     * stop the timer.
     */
    later: function(when, o, fn, data, periodic) {
        when = when || 0; 
        o = o || {};
        var m=fn, d=data, f, r;

        if (L.isString(fn)) {
            m = o[fn];
        }

        if (!m) {
            throw new TypeError("method undefined");
        }

        if (!L.isArray(d)) {
            d = [data];
        }

        f = function() {
            m.apply(o, d);
        };

        r = (periodic) ? setInterval(f, when) : setTimeout(f, when);

        return {
            interval: periodic,
            cancel: function() {
                if (this.interval) {
                    clearInterval(r);
                } else {
                    clearTimeout(r);
                }
            }
        };
    },
    
    /**
     * A convenience method for detecting a legitimate non-null value.
     * Returns false for null/undefined/NaN, true for other values, 
     * including 0/false/''
     * @method isValue
     * @since 2.3.0
     * @param o {any} the item to test
     * @return {boolean} true if it is not null/undefined/NaN || false
     */
    isValue: function(o) {
        // return (o || o === false || o === 0 || o === ''); // Infinity fails
return (L.isObject(o) || L.isString(o) || L.isNumber(o) || L.isBoolean(o));
    }

};

/**
 * Determines whether or not the property was added
 * to the object instance.  Returns false if the property is not present
 * in the object, or was inherited from the prototype.
 * This abstraction is provided to enable hasOwnProperty for Safari 1.3.x.
 * There is a discrepancy between YAHOO.lang.hasOwnProperty and
 * Object.prototype.hasOwnProperty when the property is a primitive added to
 * both the instance AND prototype with the same value:
 * <pre>
 * var A = function() {};
 * A.prototype.foo = 'foo';
 * var a = new A();
 * a.foo = 'foo';
 * alert(a.hasOwnProperty('foo')); // true
 * alert(YAHOO.lang.hasOwnProperty(a, 'foo')); // false when using fallback
 * </pre>
 * @method hasOwnProperty
 * @param {any} o The object being testing
 * @param prop {string} the name of the property to test
 * @return {boolean} the result
 */
L.hasOwnProperty = (OP.hasOwnProperty) ?
    function(o, prop) {
        return o && o.hasOwnProperty(prop);
    } : function(o, prop) {
        return !L.isUndefined(o[prop]) && 
                o.constructor.prototype[prop] !== o[prop];
    };

// new lang wins
OB.augmentObject(L, OB, true);

/*
 * An alias for <a href="YAHOO.lang.html">YAHOO.lang</a>
 * @class YAHOO.util.Lang
 */
YAHOO.util.Lang = L;
 
/**
 * Same as YAHOO.lang.augmentObject, except it only applies prototype 
 * properties.  This is an alias for augmentProto.
 * @see YAHOO.lang.augmentObject
 * @method augment
 * @static
 * @param {Function} r  the object to receive the augmentation
 * @param {Function} s  the object that supplies the properties to augment
 * @param {String*|boolean}  arguments zero or more properties methods to 
 *        augment the receiver with.  If none specified, everything
 *        in the supplier will be used unless it would
 *        overwrite an existing property in the receiver.  if true
 *        is specified as the third parameter, all properties will
 *        be applied and will overwrite an existing property in
 *        the receiver
 */
L.augment = L.augmentProto;

/**
 * An alias for <a href="YAHOO.lang.html#augment">YAHOO.lang.augment</a>
 * @for YAHOO
 * @method augment
 * @static
 * @param {Function} r  the object to receive the augmentation
 * @param {Function} s  the object that supplies the properties to augment
 * @param {String*}  arguments zero or more properties methods to 
 *        augment the receiver with.  If none specified, everything
 *        in the supplier will be used unless it would
 *        overwrite an existing property in the receiver
 */
YAHOO.augment = L.augmentProto;
       
/**
 * An alias for <a href="YAHOO.lang.html#extend">YAHOO.lang.extend</a>
 * @method extend
 * @static
 * @param {Function} subc   the object to modify
 * @param {Function} superc the object to inherit
 * @param {Object} overrides  additional properties/methods to add to the
 *        subclass prototype.  These will override the
 *        matching items obtained from the superclass if present.
 */
YAHOO.extend = L.extend;

})();
YAHOO.register("yahoo", YAHOO, {version: "2.7.0", build: "1796"});
/**
 * Provides a mechanism to fetch remote resources and
 * insert them into a document
 * @module get
 * @requires yahoo
 */

/**
 * Fetches and inserts one or more script or link nodes into the document 
 * @namespace YAHOO.util
 * @class YAHOO.util.Get
 */
YAHOO.util.Get = function() {

    /**
     * hash of queues to manage multiple requests
     * @property queues
     * @private
     */
    var queues={}, 
        
    /**
     * queue index used to generate transaction ids
     * @property qidx
     * @type int
     * @private
     */
        qidx=0, 
        
    /**
     * node index used to generate unique node ids
     * @property nidx
     * @type int
     * @private
     */
        nidx=0, 

        // ridx=0,

        // sandboxFrame=null,

    /**
     * interal property used to prevent multiple simultaneous purge 
     * processes
     * @property purging
     * @type boolean
     * @private
     */
        purging=false,

        ua=YAHOO.env.ua, 
        
        lang=YAHOO.lang;
    
    /** 
     * Generates an HTML element, this is not appended to a document
     * @method _node
     * @param type {string} the type of element
     * @param attr {string} the attributes
     * @param win {Window} optional window to create the element in
     * @return {HTMLElement} the generated node
     * @private
     */
    var _node = function(type, attr, win) {
        var w = win || window, d=w.document, n=d.createElement(type);

        for (var i in attr) {
            if (attr[i] && YAHOO.lang.hasOwnProperty(attr, i)) {
                n.setAttribute(i, attr[i]);
            }
        }

        return n;
    };

    /**
     * Generates a link node
     * @method _linkNode
     * @param url {string} the url for the css file
     * @param win {Window} optional window to create the node in
     * @return {HTMLElement} the generated node
     * @private
     */
    var _linkNode = function(url, win, charset) {
        var c = charset || "utf-8";
        return _node("link", {
                "id":      "yui__dyn_" + (nidx++),
                "type":    "text/css",
                "charset": c,
                "rel":     "stylesheet",
                "href":    url
            }, win);
    };

    /**
     * Generates a script node
     * @method _scriptNode
     * @param url {string} the url for the script file
     * @param win {Window} optional window to create the node in
     * @return {HTMLElement} the generated node
     * @private
     */
    var _scriptNode = function(url, win, charset) {
        var c = charset || "utf-8";
        return _node("script", {
                "id":      "yui__dyn_" + (nidx++),
                "type":    "text/javascript",
                "charset": c,
                "src":     url
            }, win);
    };

    /**
     * Returns the data payload for callback functions
     * @method _returnData
     * @private
     */
    var _returnData = function(q, msg) {
        return {
                tId: q.tId,
                win: q.win,
                data: q.data,
                nodes: q.nodes,
                msg: msg,
                purge: function() {
                    _purge(this.tId);
                }
            };
    };

    var _get = function(nId, tId) {
        var q = queues[tId],
            n = (lang.isString(nId)) ? q.win.document.getElementById(nId) : nId;
        if (!n) {
            _fail(tId, "target node not found: " + nId);
        }

        return n;
    };

    /*
     * The request failed, execute fail handler with whatever
     * was accomplished.  There isn't a failure case at the
     * moment unless you count aborted transactions
     * @method _fail
     * @param id {string} the id of the request
     * @private
     */
    var _fail = function(id, msg) {
        var q = queues[id];
        // execute failure callback
        if (q.onFailure) {
            var sc=q.scope || q.win;
            q.onFailure.call(sc, _returnData(q, msg));
        }
    };

    /**
     * The request is complete, so executing the requester's callback
     * @method _finish
     * @param id {string} the id of the request
     * @private
     */
    var _finish = function(id) {
        var q = queues[id];
        q.finished = true;

        if (q.aborted) {
            var msg = "transaction " + id + " was aborted";
            _fail(id, msg);
            return;
        }

        // execute success callback
        if (q.onSuccess) {
            var sc=q.scope || q.win;
            q.onSuccess.call(sc, _returnData(q));
        }
    };

    /**
     * Timeout detected
     * @method _timeout
     * @param id {string} the id of the request
     * @private
     */
    var _timeout = function(id) {
        var q = queues[id];
        if (q.onTimeout) {
            var sc=q.scope || q;
            q.onTimeout.call(sc, _returnData(q));
        }
    };

    /**
     * Loads the next item for a given request
     * @method _next
     * @param id {string} the id of the request
     * @param loaded {string} the url that was just loaded, if any
     * @private
     */
    var _next = function(id, loaded) {
        var q = queues[id];

        if (q.timer) {
            // Y.log('cancel timer');
            q.timer.cancel();
        }

        if (q.aborted) {
            var msg = "transaction " + id + " was aborted";
            _fail(id, msg);
            return;
        }

        if (loaded) {
            q.url.shift(); 
            if (q.varName) {
                q.varName.shift(); 
            }
        } else {
            // This is the first pass: make sure the url is an array
            q.url = (lang.isString(q.url)) ? [q.url] : q.url;
            if (q.varName) {
                q.varName = (lang.isString(q.varName)) ? [q.varName] : q.varName;
            }
        }

        var w=q.win, d=w.document, h=d.getElementsByTagName("head")[0], n;

        if (q.url.length === 0) {
            // Safari 2.x workaround - There is no way to know when 
            // a script is ready in versions of Safari prior to 3.x.
            // Adding an extra node reduces the problem, but doesn't
            // eliminate it completely because the browser executes
            // them asynchronously. 
            if (q.type === "script" && ua.webkit && ua.webkit < 420 && 
                    !q.finalpass && !q.varName) {
                // Add another script node.  This does not guarantee that the
                // scripts will execute in order, but it does appear to fix the
                // problem on fast connections more effectively than using an
                // arbitrary timeout.  It is possible that the browser does
                // block subsequent script execution in this case for a limited
                // time.
                var extra = _scriptNode(null, q.win, q.charset);
                extra.innerHTML='YAHOO.util.Get._finalize("' + id + '");';
                q.nodes.push(extra); h.appendChild(extra);

            } else {
                _finish(id);
            }

            return;
        } 


        var url = q.url[0];

        // if the url is undefined, this is probably a trailing comma problem in IE
        if (!url) {
            q.url.shift(); 
            return _next(id);
        }


        if (q.timeout) {
            // Y.log('create timer');
            q.timer = lang.later(q.timeout, q, _timeout, id);
        }

        if (q.type === "script") {
            n = _scriptNode(url, w, q.charset);
        } else {
            n = _linkNode(url, w, q.charset);
        }

        // track this node's load progress
        _track(q.type, n, id, url, w, q.url.length);

        // add the node to the queue so we can return it to the user supplied callback
        q.nodes.push(n);

        // add it to the head or insert it before 'insertBefore'
        if (q.insertBefore) {
            var s = _get(q.insertBefore, id);
            if (s) {
                s.parentNode.insertBefore(n, s);
            }
        } else {
            h.appendChild(n);
        }
        

        // FireFox does not support the onload event for link nodes, so there is
        // no way to make the css requests synchronous. This means that the css 
        // rules in multiple files could be applied out of order in this browser
        // if a later request returns before an earlier one.  Safari too.
        if ((ua.webkit || ua.gecko) && q.type === "css") {
            _next(id, url);
        }
    };

    /**
     * Removes processed queues and corresponding nodes
     * @method _autoPurge
     * @private
     */
    var _autoPurge = function() {

        if (purging) {
            return;
        }

        purging = true;
        for (var i in queues) {
            var q = queues[i];
            if (q.autopurge && q.finished) {
                _purge(q.tId);
                delete queues[i];
            }
        }

        purging = false;
    };

    /**
     * Removes the nodes for the specified queue
     * @method _purge
     * @private
     */
    var _purge = function(tId) {
        var q=queues[tId];
        if (q) {
            var n=q.nodes, l=n.length, d=q.win.document, 
                h=d.getElementsByTagName("head")[0];

            if (q.insertBefore) {
                var s = _get(q.insertBefore, tId);
                if (s) {
                    h = s.parentNode;
                }
            }

            for (var i=0; i<l; i=i+1) {
                h.removeChild(n[i]);
            }

            q.nodes = [];
        }
    };

    /**
     * Saves the state for the request and begins loading
     * the requested urls
     * @method queue
     * @param type {string} the type of node to insert
     * @param url {string} the url to load
     * @param opts the hash of options for this request
     * @private
     */
    var _queue = function(type, url, opts) {

        var id = "q" + (qidx++);
        opts = opts || {};

        if (qidx % YAHOO.util.Get.PURGE_THRESH === 0) {
            _autoPurge();
        }

        queues[id] = lang.merge(opts, {
            tId: id,
            type: type,
            url: url,
            finished: false,
            aborted: false,
            nodes: []
        });

        var q = queues[id];
        q.win = q.win || window;
        q.scope = q.scope || q.win;
        q.autopurge = ("autopurge" in q) ? q.autopurge : 
                      (type === "script") ? true : false;

        lang.later(0, q, _next, id);

        return {
            tId: id
        };
    };

    /**
     * Detects when a node has been loaded.  In the case of
     * script nodes, this does not guarantee that contained
     * script is ready to use.
     * @method _track
     * @param type {string} the type of node to track
     * @param n {HTMLElement} the node to track
     * @param id {string} the id of the request
     * @param url {string} the url that is being loaded
     * @param win {Window} the targeted window
     * @param qlength the number of remaining items in the queue,
     * including this one
     * @param trackfn {Function} function to execute when finished
     * the default is _next
     * @private
     */
    var _track = function(type, n, id, url, win, qlength, trackfn) {
        var f = trackfn || _next;

        // IE supports the readystatechange event for script and css nodes
        if (ua.ie) {
            n.onreadystatechange = function() {
                var rs = this.readyState;
                if ("loaded" === rs || "complete" === rs) {
                    n.onreadystatechange = null;
                    f(id, url);
                }
            };

        // webkit prior to 3.x is problemmatic
        } else if (ua.webkit) {

            if (type === "script") {

                // Safari 3.x supports the load event for script nodes (DOM2)
                if (ua.webkit >= 420) {

                    n.addEventListener("load", function() {
                        f(id, url);
                    });

                // Nothing can be done with Safari < 3.x except to pause and hope
                // for the best, particularly after last script is inserted. The
                // scripts will always execute in the order they arrive, not
                // necessarily the order in which they were inserted.  To support
                // script nodes with complete reliability in these browsers, script
                // nodes either need to invoke a function in the window once they
                // are loaded or the implementer needs to provide a well-known
                // property that the utility can poll for.
                } else {
                    // Poll for the existence of the named variable, if it
                    // was supplied.
                    var q = queues[id];
                    if (q.varName) {
                        var freq=YAHOO.util.Get.POLL_FREQ;
                        q.maxattempts = YAHOO.util.Get.TIMEOUT/freq;
                        q.attempts = 0;
                        q._cache = q.varName[0].split(".");
                        q.timer = lang.later(freq, q, function(o) {
                            var a=this._cache, l=a.length, w=this.win, i;
                            for (i=0; i<l; i=i+1) {
                                w = w[a[i]];
                                if (!w) {
                                    // if we have exausted our attempts, give up
                                    this.attempts++;
                                    if (this.attempts++ > this.maxattempts) {
                                        var msg = "Over retry limit, giving up";
                                        q.timer.cancel();
                                        _fail(id, msg);
                                    } else {
                                    }
                                    return;
                                }
                            }
                            

                            q.timer.cancel();
                            f(id, url);

                        }, null, true);
                    } else {
                        lang.later(YAHOO.util.Get.POLL_FREQ, null, f, [id, url]);
                    }
                }
            } 

        // FireFox and Opera support onload (but not DOM2 in FF) handlers for
        // script nodes.  Opera, but not FF, supports the onload event for link
        // nodes.
        } else { 
            n.onload = function() {
                f(id, url);
            };
        }
    };

    return {

        /**
         * The default poll freqency in ms, when needed
         * @property POLL_FREQ
         * @static
         * @type int
         * @default 10
         */
        POLL_FREQ: 10,

        /**
         * The number of request required before an automatic purge.
         * property PURGE_THRESH
         * @static
         * @type int
         * @default 20
         */
        PURGE_THRESH: 20,

        /**
         * The length time to poll for varName when loading a script in
         * Safari 2.x before the transaction fails.
         * property TIMEOUT
         * @static
         * @type int
         * @default 2000
         */
        TIMEOUT: 2000,
        
        /**
         * Called by the the helper for detecting script load in Safari
         * @method _finalize
         * @param id {string} the transaction id
         * @private
         */
        _finalize: function(id) {
            lang.later(0, null, _finish, id);
        },

        /**
         * Abort a transaction
         * @method abort
         * @param {string|object} either the tId or the object returned from
         * script() or css()
         */
        abort: function(o) {
            var id = (lang.isString(o)) ? o : o.tId;
            var q = queues[id];
            if (q) {
                q.aborted = true;
            }
        }, 

        /**
         * Fetches and inserts one or more script nodes into the head
         * of the current document or the document in a specified window.
         *
         * @method script
         * @static
         * @param url {string|string[]} the url or urls to the script(s)
         * @param opts {object} Options: 
         * <dl>
         * <dt>onSuccess</dt>
         * <dd>
         * callback to execute when the script(s) are finished loading
         * The callback receives an object back with the following
         * data:
         * <dl>
         * <dt>win</dt>
         * <dd>the window the script(s) were inserted into</dd>
         * <dt>data</dt>
         * <dd>the data object passed in when the request was made</dd>
         * <dt>nodes</dt>
         * <dd>An array containing references to the nodes that were
         * inserted</dd>
         * <dt>purge</dt>
         * <dd>A function that, when executed, will remove the nodes
         * that were inserted</dd>
         * <dt>
         * </dl>
         * </dd>
         * <dt>onFailure</dt>
         * <dd>
         * callback to execute when the script load operation fails
         * The callback receives an object back with the following
         * data:
         * <dl>
         * <dt>win</dt>
         * <dd>the window the script(s) were inserted into</dd>
         * <dt>data</dt>
         * <dd>the data object passed in when the request was made</dd>
         * <dt>nodes</dt>
         * <dd>An array containing references to the nodes that were
         * inserted successfully</dd>
         * <dt>purge</dt>
         * <dd>A function that, when executed, will remove any nodes
         * that were inserted</dd>
         * <dt>
         * </dl>
         * </dd>
         * <dt>onTimeout</dt>
         * <dd>
         * callback to execute when a timeout occurs.
         * The callback receives an object back with the following
         * data:
         * <dl>
         * <dt>win</dt>
         * <dd>the window the script(s) were inserted into</dd>
         * <dt>data</dt>
         * <dd>the data object passed in when the request was made</dd>
         * <dt>nodes</dt>
         * <dd>An array containing references to the nodes that were
         * inserted</dd>
         * <dt>purge</dt>
         * <dd>A function that, when executed, will remove the nodes
         * that were inserted</dd>
         * <dt>
         * </dl>
         * </dd>
         * <dt>scope</dt>
         * <dd>the execution context for the callbacks</dd>
         * <dt>win</dt>
         * <dd>a window other than the one the utility occupies</dd>
         * <dt>autopurge</dt>
         * <dd>
         * setting to true will let the utilities cleanup routine purge 
         * the script once loaded
         * </dd>
         * <dt>data</dt>
         * <dd>
         * data that is supplied to the callback when the script(s) are
         * loaded.
         * </dd>
         * <dt>varName</dt>
         * <dd>
         * variable that should be available when a script is finished
         * loading.  Used to help Safari 2.x and below with script load 
         * detection.  The type of this property should match what was
         * passed into the url parameter: if loading a single url, a
         * string can be supplied.  If loading multiple scripts, you
         * must supply an array that contains the variable name for
         * each script.
         * </dd>
         * <dt>insertBefore</dt>
         * <dd>node or node id that will become the new node's nextSibling</dd>
         * </dl>
         * <dt>charset</dt>
         * <dd>Node charset, default utf-8</dd>
         * <dt>timeout</dt>
         * <dd>Number of milliseconds to wait before aborting and firing the timeout event</dd>
         * <pre>
         * // assumes yahoo, dom, and event are already on the page
         * &nbsp;&nbsp;YAHOO.util.Get.script(
         * &nbsp;&nbsp;["http://yui.yahooapis.com/2.3.1/build/dragdrop/dragdrop-min.js",
         * &nbsp;&nbsp;&nbsp;"http://yui.yahooapis.com/2.3.1/build/animation/animation-min.js"], &#123;
         * &nbsp;&nbsp;&nbsp;&nbsp;onSuccess: function(o) &#123;
         * &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;new YAHOO.util.DDProxy("dd1"); // also new o.reference("dd1"); would work
         * &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;this.log("won't cause error because YAHOO is the scope");
         * &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;this.log(o.nodes.length === 2) // true
         * &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// o.purge(); // optionally remove the script nodes immediately
         * &nbsp;&nbsp;&nbsp;&nbsp;&#125;,
         * &nbsp;&nbsp;&nbsp;&nbsp;onFailure: function(o) &#123;
         * &nbsp;&nbsp;&nbsp;&nbsp;&#125;,
         * &nbsp;&nbsp;&nbsp;&nbsp;data: "foo",
         * &nbsp;&nbsp;&nbsp;&nbsp;timeout: 10000, // 10 second timeout
         * &nbsp;&nbsp;&nbsp;&nbsp;scope: YAHOO,
         * &nbsp;&nbsp;&nbsp;&nbsp;// win: otherframe // target another window/frame
         * &nbsp;&nbsp;&nbsp;&nbsp;autopurge: true // allow the utility to choose when to remove the nodes
         * &nbsp;&nbsp;&#125;);
         * </pre>
         * @return {tId: string} an object containing info about the transaction
         */
        script: function(url, opts) { return _queue("script", url, opts); },

        /**
         * Fetches and inserts one or more css link nodes into the 
         * head of the current document or the document in a specified
         * window.
         * @method css
         * @static
         * @param url {string} the url or urls to the css file(s)
         * @param opts Options: 
         * <dl>
         * <dt>onSuccess</dt>
         * <dd>
         * callback to execute when the css file(s) are finished loading
         * The callback receives an object back with the following
         * data:
         * <dl>win</dl>
         * <dd>the window the link nodes(s) were inserted into</dd>
         * <dt>data</dt>
         * <dd>the data object passed in when the request was made</dd>
         * <dt>nodes</dt>
         * <dd>An array containing references to the nodes that were
         * inserted</dd>
         * <dt>purge</dt>
         * <dd>A function that, when executed, will remove the nodes
         * that were inserted</dd>
         * <dt>
         * </dl>
         * </dd>
         * <dt>scope</dt>
         * <dd>the execution context for the callbacks</dd>
         * <dt>win</dt>
         * <dd>a window other than the one the utility occupies</dd>
         * <dt>data</dt>
         * <dd>
         * data that is supplied to the callbacks when the nodes(s) are
         * loaded.
         * </dd>
         * <dt>insertBefore</dt>
         * <dd>node or node id that will become the new node's nextSibling</dd>
         * <dt>charset</dt>
         * <dd>Node charset, default utf-8</dd>
         * </dl>
         * <pre>
         *      YAHOO.util.Get.css("http://yui.yahooapis.com/2.3.1/build/menu/assets/skins/sam/menu.css");
         * </pre>
         * <pre>
         *      YAHOO.util.Get.css(["http://yui.yahooapis.com/2.3.1/build/menu/assets/skins/sam/menu.css",
         * </pre>
         * @return {tId: string} an object containing info about the transaction
         */
        css: function(url, opts) {
            return _queue("css", url, opts); 
        }
    };
}();

YAHOO.register("get", YAHOO.util.Get, {version: "2.7.0", build: "1796"});
/**
 * Provides dynamic loading for the YUI library.  It includes the dependency
 * info for the library, and will automatically pull in dependencies for
 * the modules requested.  It supports rollup files (such as utilities.js
 * and yahoo-dom-event.js), and will automatically use these when
 * appropriate in order to minimize the number of http connections
 * required to load all of the dependencies.
 * 
 * @module yuiloader
 * @namespace YAHOO.util
 */

/**
 * YUILoader provides dynamic loading for YUI.
 * @class YAHOO.util.YUILoader
 * @todo
 *      version management, automatic sandboxing
 */
(function() {

    var Y=YAHOO, util=Y.util, lang=Y.lang, env=Y.env,
        PROV = "_provides", SUPER = "_supersedes",
        REQ = "expanded", AFTER = "_after";
 
    var YUI = {

        dupsAllowed: {'yahoo': true, 'get': true},

        /*
         * The library metadata for the current release  The is the default
         * value for YAHOO.util.YUILoader.moduleInfo
         * @property YUIInfo
         * @static
         */
        info: {

    // 'root': '2.5.2/build/',
    // 'base': 'http://yui.yahooapis.com/2.5.2/build/',

    'root': '2.7.0/build/',
    'base': 'http://yui.yahooapis.com/2.7.0/build/',

    'comboBase': 'http://yui.yahooapis.com/combo?',

    'skin': {
        'defaultSkin': 'sam',
        'base': 'assets/skins/',
        'path': 'skin.css',
        'after': ['reset', 'fonts', 'grids', 'base'],
        'rollup': 3
    },

    dupsAllowed: ['yahoo', 'get'],

    'moduleInfo': {

        'animation': {
            'type': 'js',
            'path': 'animation/animation-min.js',
            'requires': ['dom', 'event']
        },

        'autocomplete': {
            'type': 'js',
            'path': 'autocomplete/autocomplete-min.js',
            'requires': ['dom', 'event', 'datasource'],
            'optional': ['connection', 'animation'],
            'skinnable': true
        },

        'base': {
            'type': 'css',
            'path': 'base/base-min.css',
            'after': ['reset', 'fonts', 'grids']
        },

        'button': {
            'type': 'js',
            'path': 'button/button-min.js',
            'requires': ['element'],
            'optional': ['menu'],
            'skinnable': true
        },

        'calendar': {
            'type': 'js',
            'path': 'calendar/calendar-min.js',
            'requires': ['event', 'dom'],
            'skinnable': true
        },

        'carousel': {
            'type': 'js',
            'path': 'carousel/carousel-min.js',
            'requires': ['element'],
            'optional': ['animation'],
            'skinnable': true
        },

        'charts': {
            'type': 'js',
            'path': 'charts/charts-min.js',
            'requires': ['element', 'json', 'datasource']
        },

        'colorpicker': {
            'type': 'js',
            'path': 'colorpicker/colorpicker-min.js',
            'requires': ['slider', 'element'],
            'optional': ['animation'],
            'skinnable': true
        },

        'connection': {
            'type': 'js',
            'path': 'connection/connection-min.js',
            'requires': ['event']
        },

        'container': {
            'type': 'js',
            'path': 'container/container-min.js',
            'requires': ['dom', 'event'],
            // button is also optional, but this creates a circular 
            // dependency when loadOptional is specified.  button
            // optionally includes menu, menu requires container.
            'optional': ['dragdrop', 'animation', 'connection'],
            'supersedes': ['containercore'],
            'skinnable': true
        },

        'containercore': {
            'type': 'js',
            'path': 'container/container_core-min.js',
            'requires': ['dom', 'event'],
            'pkg': 'container'
        },

        'cookie': {
            'type': 'js',
            'path': 'cookie/cookie-min.js',
            'requires': ['yahoo']
        },

        'datasource': {
            'type': 'js',
            'path': 'datasource/datasource-min.js',
            'requires': ['event'],
            'optional': ['connection']
        },

        'datatable': {
            'type': 'js',
            'path': 'datatable/datatable-min.js',
            'requires': ['element', 'datasource'],
            'optional': ['calendar', 'dragdrop', 'paginator'],
            'skinnable': true
        },

        'dom': {
            'type': 'js',
            'path': 'dom/dom-min.js',
            'requires': ['yahoo']
        },

        'dragdrop': {
            'type': 'js',
            'path': 'dragdrop/dragdrop-min.js',
            'requires': ['dom', 'event']
        },

        'editor': {
            'type': 'js',
            'path': 'editor/editor-min.js',
            'requires': ['menu', 'element', 'button'],
            'optional': ['animation', 'dragdrop'],
            'supersedes': ['simpleeditor'],
            'skinnable': true
        },

        'element': {
            'type': 'js',
            'path': 'element/element-min.js',
            'requires': ['dom', 'event']
        },

        'event': {
            'type': 'js',
            'path': 'event/event-min.js',
            'requires': ['yahoo']
        },

        'fonts': {
            'type': 'css',
            'path': 'fonts/fonts-min.css'
        },

        'get': {
            'type': 'js',
            'path': 'get/get-min.js',
            'requires': ['yahoo']
        },

        'grids': {
            'type': 'css',
            'path': 'grids/grids-min.css',
            'requires': ['fonts'],
            'optional': ['reset']
        },

        'history': {
            'type': 'js',
            'path': 'history/history-min.js',
            'requires': ['event']
        },

         'imagecropper': {
             'type': 'js',
             'path': 'imagecropper/imagecropper-min.js',
             'requires': ['dom', 'event', 'dragdrop', 'element', 'resize'],
             'skinnable': true
         },

         'imageloader': {
            'type': 'js',
            'path': 'imageloader/imageloader-min.js',
            'requires': ['event', 'dom']
         },

         'json': {
            'type': 'js',
            'path': 'json/json-min.js',
            'requires': ['yahoo']
         },

         'layout': {
             'type': 'js',
             'path': 'layout/layout-min.js',
             'requires': ['dom', 'event', 'element'],
             'optional': ['animation', 'dragdrop', 'resize', 'selector'],
             'skinnable': true
         }, 

        'logger': {
            'type': 'js',
            'path': 'logger/logger-min.js',
            'requires': ['event', 'dom'],
            'optional': ['dragdrop'],
            'skinnable': true
        },

        'menu': {
            'type': 'js',
            'path': 'menu/menu-min.js',
            'requires': ['containercore'],
            'skinnable': true
        },

        'paginator': {
            'type': 'js',
            'path': 'paginator/paginator-min.js',
            'requires': ['element'],
            'skinnable': true
        },

        'profiler': {
            'type': 'js',
            'path': 'profiler/profiler-min.js',
            'requires': ['yahoo']
        },


        'profilerviewer': {
            'type': 'js',
            'path': 'profilerviewer/profilerviewer-min.js',
            'requires': ['profiler', 'yuiloader', 'element'],
            'skinnable': true
        },

        'reset': {
            'type': 'css',
            'path': 'reset/reset-min.css'
        },

        'reset-fonts-grids': {
            'type': 'css',
            'path': 'reset-fonts-grids/reset-fonts-grids.css',
            'supersedes': ['reset', 'fonts', 'grids', 'reset-fonts'],
            'rollup': 4
        },

        'reset-fonts': {
            'type': 'css',
            'path': 'reset-fonts/reset-fonts.css',
            'supersedes': ['reset', 'fonts'],
            'rollup': 2
        },

         'resize': {
             'type': 'js',
             'path': 'resize/resize-min.js',
             'requires': ['dom', 'event', 'dragdrop', 'element'],
             'optional': ['animation'],
             'skinnable': true
         },

        'selector': {
            'type': 'js',
            'path': 'selector/selector-min.js',
            'requires': ['yahoo', 'dom']
        },

        'simpleeditor': {
            'type': 'js',
            'path': 'editor/simpleeditor-min.js',
            'requires': ['element'],
            'optional': ['containercore', 'menu', 'button', 'animation', 'dragdrop'],
            'skinnable': true,
            'pkg': 'editor'
        },

        'slider': {
            'type': 'js',
            'path': 'slider/slider-min.js',
            'requires': ['dragdrop'],
            'optional': ['animation'],
            'skinnable': true
        },

         'stylesheet': {
            'type': 'js',
            'path': 'stylesheet/stylesheet-min.js',
            'requires': ['yahoo']
         },

        'tabview': {
            'type': 'js',
            'path': 'tabview/tabview-min.js',
            'requires': ['element'],
            'optional': ['connection'],
            'skinnable': true
        },

        'treeview': {
            'type': 'js',
            'path': 'treeview/treeview-min.js',
            'requires': ['event', 'dom'],
            'optional': ['json'],
            'skinnable': true
        },

        'uploader': {
            'type': 'js',
            'path': 'uploader/uploader.js',
            'requires': ['element']
        },

        'utilities': {
            'type': 'js',
            'path': 'utilities/utilities.js',
            'supersedes': ['yahoo', 'event', 'dragdrop', 'animation', 'dom', 'connection', 'element', 'yahoo-dom-event', 'get', 'yuiloader', 'yuiloader-dom-event'],
            'rollup': 8
        },

        'yahoo': {
            'type': 'js',
            'path': 'yahoo/yahoo-min.js'
        },

        'yahoo-dom-event': {
            'type': 'js',
            'path': 'yahoo-dom-event/yahoo-dom-event.js',
            'supersedes': ['yahoo', 'event', 'dom'],
            'rollup': 3
        },

        'yuiloader': {
            'type': 'js',
            'path': 'yuiloader/yuiloader-min.js',
            'supersedes': ['yahoo', 'get']
        },

        'yuiloader-dom-event': {
            'type': 'js',
            'path': 'yuiloader-dom-event/yuiloader-dom-event.js',
            'supersedes': ['yahoo', 'dom', 'event', 'get', 'yuiloader', 'yahoo-dom-event'],
            'rollup': 5
        },

        'yuitest': {
            'type': 'js',
            'path': 'yuitest/yuitest-min.js',
            'requires': ['logger'],
            'skinnable': true
        }
    }
}
 , 

        ObjectUtil: {
            appendArray: function(o, a) {
                if (a) {
                    for (var i=0; i<a.length; i=i+1) {
                        o[a[i]] = true;
                    }
                }
            },

            keys: function(o, ordered) {
                var a=[], i;
                for (i in o) {
                    if (lang.hasOwnProperty(o, i)) {
                        a.push(i);
                    }
                }

                return a;
            }
        },

        ArrayUtil: {

            appendArray: function(a1, a2) {
                Array.prototype.push.apply(a1, a2);
                /*
                for (var i=0; i<a2.length; i=i+1) {
                    a1.push(a2[i]);
                }
                */
            },

            indexOf: function(a, val) {
                for (var i=0; i<a.length; i=i+1) {
                    if (a[i] === val) {
                        return i;
                    }
                }

                return -1;
            },

            toObject: function(a) {
                var o = {};
                for (var i=0; i<a.length; i=i+1) {
                    o[a[i]] = true;
                }

                return o;
            },

            /*
             * Returns a unique array.  Does not maintain order, which is fine
             * for this application, and performs better than it would if it
             * did.
             */
            uniq: function(a) {
                return YUI.ObjectUtil.keys(YUI.ArrayUtil.toObject(a));
            }
        }
    };

    YAHOO.util.YUILoader = function(o) {

        /**
         * Internal callback to handle multiple internal insert() calls
         * so that css is inserted prior to js
         * @property _internalCallback
         * @private
         */
        this._internalCallback = null;

        /**
         * Use the YAHOO environment listener to detect script load.  This
         * is only switched on for Safari 2.x and below.
         * @property _useYahooListener
         * @private
         */
        this._useYahooListener = false;

        /**
         * Callback that will be executed when the loader is finished
         * with an insert
         * @method onSuccess
         * @type function
         */
        this.onSuccess = null;

        /**
         * Callback that will be executed if there is a failure
         * @method onFailure
         * @type function
         */
        this.onFailure = Y.log;

        /**
         * Callback that will be executed each time a new module is loaded
         * @method onProgress
         * @type function
         */
        this.onProgress = null;

        /**
         * Callback that will be executed if a timeout occurs
         * @method onTimeout
         * @type function
         */
        this.onTimeout = null;

        /**
         * The execution scope for all callbacks
         * @property scope
         * @default this
         */
        this.scope = this;

        /**
         * Data that is passed to all callbacks
         * @property data
         */
        this.data = null;

        /**
         * Node reference or id where new nodes should be inserted before
         * @property insertBefore
         * @type string|HTMLElement
         */
        this.insertBefore = null;

        /**
         * The charset attribute for inserted nodes
         * @property charset
         * @type string
         * @default utf-8
         */
        this.charset = null;

        /**
         * The name of the variable in a sandbox or script node 
         * (for external script support in Safari 2.x and earlier)
         * to reference when the load is complete.  If this variable 
         * is not available in the specified scripts, the operation will 
         * fail.  
         * @property varName
         * @type string
         */
        this.varName = null;

        /**
         * The base directory.
         * @property base
         * @type string
         * @default http://yui.yahooapis.com/[YUI VERSION]/build/
         */
        this.base = YUI.info.base;

        /**
         * Base path for the combo service
         * @property comboBase
         * @type string
         * @default http://yui.yahooapis.com/combo?
         */
        this.comboBase = YUI.info.comboBase;

        /**
         * If configured, YUI will use the the combo handler on the
         * Yahoo! CDN to pontentially reduce the number of http requests
         * required.
         * @property combine
         * @type boolean
         * @default false
         */
        // this.combine = (o && !('base' in o));
        this.combine = false;


        /**
         * Root path to prepend to module path for the combo
         * service
         * @property root
         * @type string
         * @default [YUI VERSION]/build/
         */
        this.root = YUI.info.root;

        /**
         * Timeout value in milliseconds.  If set, this value will be used by
         * the get utility.  the timeout event will fire if
         * a timeout occurs.
         * @property timeout
         * @type int
         */
        this.timeout = 0;

        /**
         * A list of modules that should not be loaded, even if
         * they turn up in the dependency tree
         * @property ignore
         * @type string[]
         */
        this.ignore = null;

        /**
         * A list of modules that should always be loaded, even
         * if they have already been inserted into the page.
         * @property force
         * @type string[]
         */
        this.force = null;

        /**
         * Should we allow rollups
         * @property allowRollup
         * @type boolean
         * @default true
         */
        this.allowRollup = true;

        /**
         * A filter to apply to result urls.  This filter will modify the default
         * path for all modules.  The default path for the YUI library is the
         * minified version of the files (e.g., event-min.js).  The filter property
         * can be a predefined filter or a custom filter.  The valid predefined 
         * filters are:
         * <dl>
         *  <dt>DEBUG</dt>
         *  <dd>Selects the debug versions of the library (e.g., event-debug.js).
         *      This option will automatically include the logger widget</dd>
         *  <dt>RAW</dt>
         *  <dd>Selects the non-minified version of the library (e.g., event.js).
         * </dl>
         * You can also define a custom filter, which must be an object literal 
         * containing a search expression and a replace string:
         * <pre>
         *  myFilter: &#123; 
         *      'searchExp': "-min\\.js", 
         *      'replaceStr': "-debug.js"
         *  &#125;
         * </pre>
         * @property filter
         * @type string|{searchExp: string, replaceStr: string}
         */
        this.filter = null;

        /**
         * The list of requested modules
         * @property required
         * @type {string: boolean}
         */
        this.required = {};

        /**
         * The library metadata
         * @property moduleInfo
         */
        this.moduleInfo = lang.merge(YUI.info.moduleInfo);

        /**
         * List of rollup files found in the library metadata
         * @property rollups
         */
        this.rollups = null;

        /**
         * Whether or not to load optional dependencies for 
         * the requested modules
         * @property loadOptional
         * @type boolean
         * @default false
         */
        this.loadOptional = false;

        /**
         * All of the derived dependencies in sorted order, which
         * will be populated when either calculate() or insert()
         * is called
         * @property sorted
         * @type string[]
         */
        this.sorted = [];

        /**
         * Set when beginning to compute the dependency tree. 
         * Composed of what YAHOO reports to be loaded combined
         * with what has been loaded by the tool
         * @propery loaded
         * @type {string: boolean}
         */
        this.loaded = {};

        /**
         * Flag to indicate the dependency tree needs to be recomputed
         * if insert is called again.
         * @property dirty
         * @type boolean
         * @default true
         */
        this.dirty = true;

        /**
         * List of modules inserted by the utility
         * @property inserted
         * @type {string: boolean}
         */
        this.inserted = {};

        /**
         * Provides the information used to skin the skinnable components.
         * The following skin definition would result in 'skin1' and 'skin2'
         * being loaded for calendar (if calendar was requested), and
         * 'sam' for all other skinnable components:
         *
         *   <code>
         *   skin: {
         *
         *      // The default skin, which is automatically applied if not
         *      // overriden by a component-specific skin definition.
         *      // Change this in to apply a different skin globally
         *      defaultSkin: 'sam', 
         *
         *      // This is combined with the loader base property to get
         *      // the default root directory for a skin. ex:
         *      // http://yui.yahooapis.com/2.3.0/build/assets/skins/sam/
         *      base: 'assets/skins/',
         *
         *      // The name of the rollup css file for the skin
         *      path: 'skin.css',
         *
         *      // The number of skinnable components requested that are
         *      // required before using the rollup file rather than the
         *      // individual component css files
         *      rollup: 3,
         *
         *      // Any component-specific overrides can be specified here,
         *      // making it possible to load different skins for different
         *      // components.  It is possible to load more than one skin
         *      // for a given component as well.
         *      overrides: {
         *          calendar: ['skin1', 'skin2']
         *      }
         *   }
         *   </code>
         *   @property skin
         */

        var self = this;

        env.listeners.push(function(m) {
            if (self._useYahooListener) {
                //Y.log("YAHOO listener: " + m.name);
                self.loadNext(m.name);
            }
        });

        this.skin = lang.merge(YUI.info.skin); 

        this._config(o);

    };

    Y.util.YUILoader.prototype = {

        FILTERS: {
            RAW: { 
                'searchExp': "-min\\.js", 
                'replaceStr': ".js"
            },
            DEBUG: { 
                'searchExp': "-min\\.js", 
                'replaceStr': "-debug.js"
            }
        },

        SKIN_PREFIX: "skin-",

        _config: function(o) {

            // apply config values
            if (o) {
                for (var i in o) {
                    if (lang.hasOwnProperty(o, i)) {
                        if (i == "require") {
                            this.require(o[i]);
                        } else {
                            this[i] = o[i];
                        }
                    }
                }
            }

            // fix filter
            var f = this.filter;

            if (lang.isString(f)) {
                f = f.toUpperCase();

                // the logger must be available in order to use the debug
                // versions of the library
                if (f === "DEBUG") {
                    this.require("logger");
                }

                // hack to handle a a bug where LogWriter is being instantiated
                // at load time, and the loader has no way to sort above it
                // at the moment.
                if (!Y.widget.LogWriter) {
                    Y.widget.LogWriter = function() {
                        return Y;
                    };
                }

                this.filter = this.FILTERS[f];
            }

        },

        /** Add a new module to the component metadata.         
         * <dl>
         *     <dt>name:</dt>       <dd>required, the component name</dd>
         *     <dt>type:</dt>       <dd>required, the component type (js or css)</dd>
         *     <dt>path:</dt>       <dd>required, the path to the script from "base"</dd>
         *     <dt>requires:</dt>   <dd>array of modules required by this component</dd>
         *     <dt>optional:</dt>   <dd>array of optional modules for this component</dd>
         *     <dt>supersedes:</dt> <dd>array of the modules this component replaces</dd>
         *     <dt>after:</dt>      <dd>array of modules the components which, if present, should be sorted above this one</dd>
         *     <dt>rollup:</dt>     <dd>the number of superseded modules required for automatic rollup</dd>
         *     <dt>fullpath:</dt>   <dd>If fullpath is specified, this is used instead of the configured base + path</dd>
         *     <dt>skinnable:</dt>  <dd>flag to determine if skin assets should automatically be pulled in</dd>
         * </dl>
         * @method addModule
         * @param o An object containing the module data
         * @return {boolean} true if the module was added, false if 
         * the object passed in did not provide all required attributes
         */
        addModule: function(o) {

            if (!o || !o.name || !o.type || (!o.path && !o.fullpath)) {
                return false;
            }

            o.ext = ('ext' in o) ? o.ext : true;
            o.requires = o.requires || [];

            this.moduleInfo[o.name] = o;
            this.dirty = true;

            return true;
        },

        /**
         * Add a requirement for one or more module
         * @method require
         * @param what {string[] | string*} the modules to load
         */
        require: function(what) {
            var a = (typeof what === "string") ? arguments : what;
            this.dirty = true;
            YUI.ObjectUtil.appendArray(this.required, a);
        },

        /**
         * Adds the skin def to the module info
         * @method _addSkin
         * @param skin {string} the name of the skin
         * @param mod {string} the name of the module
         * @return {string} the module name for the skin
         * @private
         */
        _addSkin: function(skin, mod) {

            // Add a module definition for the skin rollup css
            var name = this.formatSkin(skin), info = this.moduleInfo,
                sinf = this.skin, ext = info[mod] && info[mod].ext;

            // Y.log('ext? ' + mod + ": " + ext);
            if (!info[name]) {
                // Y.log('adding skin ' + name);
                this.addModule({
                    'name': name,
                    'type': 'css',
                    'path': sinf.base + skin + '/' + sinf.path,
                    //'supersedes': '*',
                    'after': sinf.after,
                    'rollup': sinf.rollup,
                    'ext': ext
                });
            }

            // Add a module definition for the module-specific skin css
            if (mod) {
                name = this.formatSkin(skin, mod);
                if (!info[name]) {
                    var mdef = info[mod], pkg = mdef.pkg || mod;
                    // Y.log('adding skin ' + name);
                    this.addModule({
                        'name': name,
                        'type': 'css',
                        'after': sinf.after,
                        'path': pkg + '/' + sinf.base + skin + '/' + mod + '.css',
                        'ext': ext
                    });
                }
            }

            return name;
        },

        /**
         * Returns an object containing properties for all modules required
         * in order to load the requested module
         * @method getRequires
         * @param mod The module definition from moduleInfo
         */
        getRequires: function(mod) {
            if (!mod) {
                return [];
            }

            if (!this.dirty && mod.expanded) {
                return mod.expanded;
            }

            mod.requires=mod.requires || [];
            var i, d=[], r=mod.requires, o=mod.optional, info=this.moduleInfo, m;
            for (i=0; i<r.length; i=i+1) {
                d.push(r[i]);
                m = info[r[i]];
                YUI.ArrayUtil.appendArray(d, this.getRequires(m));

                // add existing skins for skinnable modules as well.  The only
                // way to do this is go through the list of required items (this
                // assumes that _skin is called before getRequires is called on
                // the module.
                // if (m.skinnable) {
                //     var req=this.required, l=req.length;
                //     for (var j=0; j<l; j=j+1) {
                //         // YAHOO.log('checking ' + r[j]);
                //         if (req[j].indexOf(r[j]) > -1) {
                //             // YAHOO.log('adding ' + r[j]);
                //             d.push(req[j]);
                //         }
                //     }
                // }
            }

            if (o && this.loadOptional) {
                for (i=0; i<o.length; i=i+1) {
                    d.push(o[i]);
                    YUI.ArrayUtil.appendArray(d, this.getRequires(info[o[i]]));
                }
            }

            mod.expanded = YUI.ArrayUtil.uniq(d);

            return mod.expanded;
        },


        /**
         * Returns an object literal of the modules the supplied module satisfies
         * @method getProvides
         * @param name{string} The name of the module
         * @param notMe {string} don't add this module name, only include superseded modules
         * @return what this module provides
         */
        getProvides: function(name, notMe) {
            var addMe = !(notMe), ckey = (addMe) ? PROV : SUPER,
                m = this.moduleInfo[name], o = {};

            if (!m) {
                return o;
            }

            if (m[ckey]) {
// Y.log('cached: ' + name + ' ' + ckey + ' ' + lang.dump(this.moduleInfo[name][ckey], 0));
                return m[ckey];
            }

            var s = m.supersedes, done={}, me = this;

            // use worker to break cycles
            var add = function(mm) {
                if (!done[mm]) {
                    // Y.log(name + ' provides worker trying: ' + mm);
                    done[mm] = true;
                    // we always want the return value normal behavior 
                    // (provides) for superseded modules.
                    lang.augmentObject(o, me.getProvides(mm));
                } 
                
                // else {
                // Y.log(name + ' provides worker skipping done: ' + mm);
                // }
            };

            // calculate superseded modules
            if (s) {
                for (var i=0; i<s.length; i=i+1) {
                    add(s[i]);
                }
            }

            // supersedes cache
            m[SUPER] = o;
            // provides cache
            m[PROV] = lang.merge(o);
            m[PROV][name] = true;

// Y.log(name + " supersedes " + lang.dump(m[SUPER], 0));
// Y.log(name + " provides " + lang.dump(m[PROV], 0));

            return m[ckey];
        },


        /**
         * Calculates the dependency tree, the result is stored in the sorted 
         * property
         * @method calculate
         * @param o optional options object
         */
        calculate: function(o) {
            if (o || this.dirty) {
                this._config(o);
                this._setup();
                this._explode();
                // this._skin(); // deprecated
                if (this.allowRollup) {
                    this._rollup();
                }
                this._reduce();
                this._sort();

                // Y.log("after calculate: " + lang.dump(this.required));

                this.dirty = false;
            }
        },

        /**
         * Investigates the current YUI configuration on the page.  By default,
         * modules already detected will not be loaded again unless a force
         * option is encountered.  Called by calculate()
         * @method _setup
         * @private
         */
        _setup: function() {

            var info = this.moduleInfo, name, i, j;

            // Create skin modules
            for (name in info) {

                if (lang.hasOwnProperty(info, name)) {
                    var m = info[name];
                    if (m && m.skinnable) {
                        // Y.log("skinning: " + name);
                        var o=this.skin.overrides, smod;
                        if (o && o[name]) {
                            for (i=0; i<o[name].length; i=i+1) {
                                smod = this._addSkin(o[name][i], name);
                            }
                        } else {
                            smod = this._addSkin(this.skin.defaultSkin, name);
                        }

                        m.requires.push(smod);
                    }
                }

            }

            var l = lang.merge(this.inserted); // shallow clone
            
            if (!this._sandbox) {
                l = lang.merge(l, env.modules);
            }

            // Y.log("Already loaded stuff: " + lang.dump(l, 0));

            // add the ignore list to the list of loaded packages
            if (this.ignore) {
                YUI.ObjectUtil.appendArray(l, this.ignore);
            }

            // remove modules on the force list from the loaded list
            if (this.force) {
                for (i=0; i<this.force.length; i=i+1) {
                    if (this.force[i] in l) {
                        delete l[this.force[i]];
                    }
                }
            }

            // expand the list to include superseded modules
            for (j in l) {
                // Y.log("expanding: " + j);
                if (lang.hasOwnProperty(l, j)) {
                    lang.augmentObject(l, this.getProvides(j));
                }
            }

            // Y.log("loaded expanded: " + lang.dump(l, 0));

            this.loaded = l;

        },
        

        /**
         * Inspects the required modules list looking for additional 
         * dependencies.  Expands the required list to include all 
         * required modules.  Called by calculate()
         * @method _explode
         * @private
         */
        _explode: function() {

            var r=this.required, i, mod;

            for (i in r) {
                if (lang.hasOwnProperty(r, i)) {
                    mod = this.moduleInfo[i];
                    if (mod) {

                        var req = this.getRequires(mod);

                        if (req) {
                            YUI.ObjectUtil.appendArray(r, req);
                        }
                    }
                }
            }
        },

        /**
         * Sets up the requirements for the skin assets if any of the
         * requested modules are skinnable
         * @method _skin
         * @private
         * @deprecated skin modules are generated for all skinnable
         *             components during _setup(), and the components
         *             are configured to require the skin.
         */
        _skin: function() {

        },

        /**
         * Returns the skin module name for the specified skin name.  If a
         * module name is supplied, the returned skin module name is 
         * specific to the module passed in.
         * @method formatSkin
         * @param skin {string} the name of the skin
         * @param mod {string} optional: the name of a module to skin
         * @return {string} the full skin module name
         */
        formatSkin: function(skin, mod) {
            var s = this.SKIN_PREFIX + skin;
            if (mod) {
                s = s + "-" + mod;
            }

            return s;
        },
        
        /**
         * Reverses <code>formatSkin</code>, providing the skin name and
         * module name if the string matches the pattern for skins.
         * @method parseSkin
         * @param mod {string} the module name to parse
         * @return {skin: string, module: string} the parsed skin name 
         * and module name, or null if the supplied string does not match
         * the skin pattern
         */
        parseSkin: function(mod) {
            
            if (mod.indexOf(this.SKIN_PREFIX) === 0) {
                var a = mod.split("-");
                return {skin: a[1], module: a[2]};
            } 

            return null;
        },

        /**
         * Look for rollup packages to determine if all of the modules a
         * rollup supersedes are required.  If so, include the rollup to
         * help reduce the total number of connections required.  Called
         * by calculate()
         * @method _rollup
         * @private
         */
        _rollup: function() {
            var i, j, m, s, rollups={}, r=this.required, roll,
                info = this.moduleInfo;

            // find and cache rollup modules
            if (this.dirty || !this.rollups) {
                for (i in info) {
                    if (lang.hasOwnProperty(info, i)) {
                        m = info[i];
                        //if (m && m.rollup && m.supersedes) {
                        if (m && m.rollup) {
                            rollups[i] = m;
                        }
                    }
                }

                this.rollups = rollups;
            }

            // make as many passes as needed to pick up rollup rollups
            for (;;) {
                var rolled = false;

                // go through the rollup candidates
                for (i in rollups) { 

                    // there can be only one
                    if (!r[i] && !this.loaded[i]) {
                        m =info[i]; s = m.supersedes; roll=false;

                        if (!m.rollup) {
                            continue;
                        }

                        var skin = (m.ext) ? false : this.parseSkin(i), c = 0;

                        // Y.log('skin? ' + i + ": " + skin);
                        if (skin) {
                            for (j in r) {
                                if (lang.hasOwnProperty(r, j)) {
                                    if (i !== j && this.parseSkin(j)) {
                                        c++;
                                        roll = (c >= m.rollup);
                                        if (roll) {
                                            // Y.log("skin rollup " + lang.dump(r));
                                            break;
                                        }
                                    }
                                }
                            }

                        } else {

                            // check the threshold
                            for (j=0;j<s.length;j=j+1) {

                                // if the superseded module is loaded, we can't load the rollup
                                if (this.loaded[s[j]] && (!YUI.dupsAllowed[s[j]])) {
                                    roll = false;
                                    break;
                                // increment the counter if this module is required.  if we are
                                // beyond the rollup threshold, we will use the rollup module
                                } else if (r[s[j]]) {
                                    c++;
                                    roll = (c >= m.rollup);
                                    if (roll) {
                                        // Y.log("over thresh " + c + ", " + lang.dump(r));
                                        break;
                                    }
                                }
                            }
                        }

                        if (roll) {
                            // Y.log("rollup: " +  i + ", " + lang.dump(this, 1));
                            // add the rollup
                            r[i] = true;
                            rolled = true;

                            // expand the rollup's dependencies
                            this.getRequires(m);
                        }
                    }
                }

                // if we made it here w/o rolling up something, we are done
                if (!rolled) {
                    break;
                }
            }
        },

        /**
         * Remove superceded modules and loaded modules.  Called by
         * calculate() after we have the mega list of all dependencies
         * @method _reduce
         * @private
         */
        _reduce: function() {

            var i, j, s, m, r=this.required;
            for (i in r) {

                // remove if already loaded
                if (i in this.loaded) { 
                    delete r[i];

                // remove anything this module supersedes
                } else {

                    var skinDef = this.parseSkin(i);

                    if (skinDef) {
                        //YAHOO.log("skin found in reduce: " + skinDef.skin + ", " + skinDef.module);
                        // the skin rollup will not have a module name
                        if (!skinDef.module) {
                            var skin_pre = this.SKIN_PREFIX + skinDef.skin;
                            //YAHOO.log("skin_pre: " + skin_pre);
                            for (j in r) {

                                if (lang.hasOwnProperty(r, j)) {
                                    m = this.moduleInfo[j];
                                    var ext = m && m.ext;
                                    if (!ext && j !== i && j.indexOf(skin_pre) > -1) {
                                        // Y.log ("removing component skin: " + j);
                                        delete r[j];
                                    }
                                }
                            }
                        }
                    } else {

                         m = this.moduleInfo[i];
                         s = m && m.supersedes;
                         if (s) {
                             for (j=0; j<s.length; j=j+1) {
                                 if (s[j] in r) {
                                     delete r[s[j]];
                                 }
                             }
                         }
                    }
                }
            }
        },

        _onFailure: function(msg) {
            YAHOO.log('Failure', 'info', 'loader');

            var f = this.onFailure;
            if (f) {
                f.call(this.scope, {
                    msg: 'failure: ' + msg,
                    data: this.data,
                    success: false
                });
            }
        },

        _onTimeout: function() {
            YAHOO.log('Timeout', 'info', 'loader');
            var f = this.onTimeout;
            if (f) {
                f.call(this.scope, {
                    msg: 'timeout',
                    data: this.data,
                    success: false
                });
            }
        },
        
        /**
         * Sorts the dependency tree.  The last step of calculate()
         * @method _sort
         * @private
         */
        _sort: function() {
            // create an indexed list
            var s=[], info=this.moduleInfo, loaded=this.loaded,
                checkOptional=!this.loadOptional, me = this;

            // returns true if b is not loaded, and is required
            // directly or by means of modules it supersedes.
            var requires = function(aa, bb) {

                var mm=info[aa];

                if (loaded[bb] || !mm) {
                    return false;
                }

                var ii, 
                    rr = mm.expanded, 
                    after = mm.after, 
                    other = info[bb],
                    optional = mm.optional;


                // check if this module requires the other directly
                if (rr && YUI.ArrayUtil.indexOf(rr, bb) > -1) {
                    return true;
                }

                // check if this module should be sorted after the other
                if (after && YUI.ArrayUtil.indexOf(after, bb) > -1) {
                    return true;
                }

                // if loadOptional is not specified, optional dependencies still
                // must be sorted correctly when present.
                if (checkOptional && optional && YUI.ArrayUtil.indexOf(optional, bb) > -1) {
                    return true;
                }

                // check if this module requires one the other supersedes
                var ss=info[bb] && info[bb].supersedes;
                if (ss) {
                    for (ii=0; ii<ss.length; ii=ii+1) {
                        if (requires(aa, ss[ii])) {
                            return true;
                        }
                    }
                }

                // var ss=me.getProvides(bb, true);
                // if (ss) {
                //     for (ii in ss) {
                //         if (requires(aa, ii)) {
                //             return true;
                //         }
                //     }
                // }

                // external css files should be sorted below yui css
                if (mm.ext && mm.type == 'css' && !other.ext && other.type == 'css') {
                    return true;
                }

                return false;
            };

            // get the required items out of the obj into an array so we
            // can sort
            for (var i in this.required) {
                if (lang.hasOwnProperty(this.required, i)) {
                    s.push(i);
                }
            }

            // pointer to the first unsorted item
            var p=0; 

            // keep going until we make a pass without moving anything
            for (;;) {
               
                var l=s.length, a, b, j, k, moved=false;

                // start the loop after items that are already sorted
                for (j=p; j<l; j=j+1) {

                    // check the next module on the list to see if its
                    // dependencies have been met
                    a = s[j];

                    // check everything below current item and move if we
                    // find a requirement for the current item
                    for (k=j+1; k<l; k=k+1) {
                        if (requires(a, s[k])) {

                            // extract the dependency so we can move it up
                            b = s.splice(k, 1);

                            // insert the dependency above the item that 
                            // requires it
                            s.splice(j, 0, b[0]);

                            moved = true;
                            break;
                        }
                    }

                    // jump out of loop if we moved something
                    if (moved) {
                        break;
                    // this item is sorted, move our pointer and keep going
                    } else {
                        p = p + 1;
                    }
                }

                // when we make it here and moved is false, we are 
                // finished sorting
                if (!moved) {
                    break;
                }

            }

            this.sorted = s;
        },

        toString: function() {
            var o = {
                type: "YUILoader",
                base: this.base,
                filter: this.filter,
                required: this.required,
                loaded: this.loaded,
                inserted: this.inserted
            };

            lang.dump(o, 1);
        },

        _combine: function() {

                this._combining = []; 

                var self = this,
                    s=this.sorted,
                    len = s.length,
                    js = this.comboBase,
                    css = this.comboBase,
                    target, 
                    startLen = js.length,
                    i, m, type = this.loadType;

                YAHOO.log('type ' + type);

                for (i=0; i<len; i=i+1) {

                    m = this.moduleInfo[s[i]];

                    if (m && !m.ext && (!type || type === m.type)) {

                        target = this.root + m.path;

                        // if (i < len-1) {
                        target += '&';
                        // }

                        if (m.type == 'js') {
                            js += target;
                        } else {
                            css += target;
                        }

                        // YAHOO.log(target);
                        this._combining.push(s[i]);
                    }
                }

                if (this._combining.length) {

YAHOO.log('Attempting to combine: ' + this._combining, "info", "loader");

                    var callback=function(o) {
                        // YAHOO.log('Combo complete: ' + o.data, "info", "loader");
                        // this._combineComplete = true;

                        var c=this._combining, len=c.length, i, m;
                        for (i=0; i<len; i=i+1) {
                            this.inserted[c[i]] = true;
                        }

                        this.loadNext(o.data);
                    }, 
                    
                    loadScript = function() {
                        // YAHOO.log('combining js: ' + js);
                        if (js.length > startLen) {
                            YAHOO.util.Get.script(self._filter(js), {
                                data: self._loading,
                                onSuccess: callback,
                                onFailure: self._onFailure,
                                onTimeout: self._onTimeout,
                                insertBefore: self.insertBefore,
                                charset: self.charset,
                                timeout: self.timeout,
                                scope: self 
                            });
                        }
                    };

                    // load the css first
                    // YAHOO.log('combining css: ' + css);
                    if (css.length > startLen) {
                        YAHOO.util.Get.css(this._filter(css), {
                            data: this._loading,
                            onSuccess: loadScript,
                            onFailure: this._onFailure,
                            onTimeout: this._onTimeout,
                            insertBefore: this.insertBefore,
                            charset: this.charset,
                            timeout: this.timeout,
                            scope: self 
                        });
                    } else {
                        loadScript();
                    }

                    return;

                } else {
                    // this._combineComplete = true;
                    this.loadNext(this._loading);
                }
        }, 

        /**
         * inserts the requested modules and their dependencies.  
         * <code>type</code> can be "js" or "css".  Both script and 
         * css are inserted if type is not provided.
         * @method insert
         * @param o optional options object
         * @param type {string} the type of dependency to insert
         */
        insert: function(o, type) {
            // if (o) {
            //     Y.log("insert: " + lang.dump(o, 1) + ", " + type);
            // } else {
            //     Y.log("insert: " + this.toString() + ", " + type);
            // }

            // build the dependency list
            this.calculate(o);


            // set a flag to indicate the load has started
            this._loading = true;

            // flag to indicate we are done with the combo service
            // and any additional files will need to be loaded
            // individually
            // this._combineComplete = false;

            // keep the loadType (js, css or undefined) cached
            this.loadType = type;

            if (this.combine) {
                return this._combine();
            }

            if (!type) {
                // Y.log("trying to load css first");
                var self = this;
                this._internalCallback = function() {
                            self._internalCallback = null;
                            self.insert(null, "js");
                        };
                this.insert(null, "css");
                return;
            }


            // start the load
            this.loadNext();

        },

        /**
         * Interns the script for the requested modules.  The callback is
         * provided a reference to the sandboxed YAHOO object.  This only
         * applies to the script: css can not be sandboxed; css will be
         * loaded into the page normally if specified.
         * @method sandbox
         * @param callback {Function} the callback to exectued when the load is
         *        complete.
         */
        sandbox: function(o, type) {
            // if (o) {
                // YAHOO.log("sandbox: " + lang.dump(o, 1) + ", " + type);
            // } else {
                // YAHOO.log("sandbox: " + this.toString() + ", " + type);
            // }

            this._config(o);

            if (!this.onSuccess) {
throw new Error("You must supply an onSuccess handler for your sandbox");
            }

            this._sandbox = true;

            var self = this;

            // take care of any css first (this can't be sandboxed)
            if (!type || type !== "js") {
                this._internalCallback = function() {
                            self._internalCallback = null;
                            self.sandbox(null, "js");
                        };
                this.insert(null, "css");
                return;
            }

            // get the connection manager if not on the page
            if (!util.Connect) {
                // get a new loader instance to load connection.
                var ld = new YAHOO.util.YUILoader();
                ld.insert({
                    base: this.base,
                    filter: this.filter,
                    require: "connection",
                    insertBefore: this.insertBefore,
                    charset: this.charset,
                    onSuccess: function() {
                        this.sandbox(null, "js");
                    },
                    scope: this
                }, "js");
                return;
            }

            this._scriptText = [];
            this._loadCount = 0;
            this._stopCount = this.sorted.length;
            this._xhr = [];

            this.calculate();

            var s=this.sorted, l=s.length, i, m, url;

            for (i=0; i<l; i=i+1) {
                m = this.moduleInfo[s[i]];

                // undefined modules cause a failure
                if (!m) {
                    this._onFailure("undefined module " + m);
                    for (var j=0;j<this._xhr.length;j=j+1) {
                        this._xhr[j].abort();
                    }
                    return;
                }

                // css files should be done
                if (m.type !== "js") {
                    this._loadCount++;
                    continue;
                }

                url = m.fullpath;
                url = (url) ? this._filter(url) : this._url(m.path);

                // YAHOO.log("xhr request: " + url + ", " + i);

                var xhrData = {

                    success: function(o) {
                        
                        var idx=o.argument[0], name=o.argument[2];

                        // store the response in the position it was requested
                        this._scriptText[idx] = o.responseText; 
                        
                        // YAHOO.log("received: " + o.responseText.substr(0, 100) + ", " + idx);
                    
                        if (this.onProgress) {
                            this.onProgress.call(this.scope, {
                                        name: name,
                                        scriptText: o.responseText,
                                        xhrResponse: o,
                                        data: this.data
                                    });
                        }

                        // only generate the sandbox once everything is loaded
                        this._loadCount++;

                        if (this._loadCount >= this._stopCount) {

                            // the variable to find
                            var v = this.varName || "YAHOO";

                            // wrap the contents of the requested modules in an anonymous function
                            var t = "(function() {\n";
                        
                            // return the locally scoped reference.
                            var b = "\nreturn " + v + ";\n})();";

                            var ref = eval(t + this._scriptText.join("\n") + b);

                            this._pushEvents(ref);

                            if (ref) {
                                this.onSuccess.call(this.scope, {
                                        reference: ref,
                                        data: this.data
                                    });
                            } else {
                                this._onFailure.call(this.varName + " reference failure");
                            }
                        }
                    },

                    failure: function(o) {
                        this.onFailure.call(this.scope, {
                                msg: "XHR failure",
                                xhrResponse: o,
                                data: this.data
                            });
                    },

                    scope: this,

                    // module index, module name, sandbox name
                    argument: [i, url, s[i]]

                };

                this._xhr.push(util.Connect.asyncRequest('GET', url, xhrData));
            }
        },

        /**
         * Executed every time a module is loaded, and if we are in a load
         * cycle, we attempt to load the next script.  Public so that it
         * is possible to call this if using a method other than
         * YAHOO.register to determine when scripts are fully loaded
         * @method loadNext
         * @param mname {string} optional the name of the module that has
         * been loaded (which is usually why it is time to load the next
         * one)
         */
        loadNext: function(mname) {

            // It is possible that this function is executed due to something
            // else one the page loading a YUI module.  Only react when we
            // are actively loading something
            if (!this._loading) {
                return;
            }


            if (mname) {

                // if the module that was just loaded isn't what we were expecting,
                // continue to wait
                if (mname !== this._loading) {
                    return;
                }

                // YAHOO.log("loadNext executing, just loaded " + mname);

                // The global handler that is called when each module is loaded
                // will pass that module name to this function.  Storing this
                // data to avoid loading the same module multiple times
                this.inserted[mname] = true;

                if (this.onProgress) {
                    this.onProgress.call(this.scope, {
                            name: mname,
                            data: this.data
                        });
                }
                //var o = this.getProvides(mname);
                //this.inserted = lang.merge(this.inserted, o);
            }

            var s=this.sorted, len=s.length, i, m;

            for (i=0; i<len; i=i+1) {

                // This.inserted keeps track of what the loader has loaded
                if (s[i] in this.inserted) {
                    // YAHOO.log(s[i] + " alread loaded ");
                    continue;
                }

                // Because rollups will cause multiple load notifications
                // from YAHOO, loadNext may be called multiple times for
                // the same module when loading a rollup.  We can safely
                // skip the subsequent requests
                if (s[i] === this._loading) {
                    // YAHOO.log("still loading " + s[i] + ", waiting");
                    return;
                }

                // log("inserting " + s[i]);
                m = this.moduleInfo[s[i]];

                if (!m) {
                    this.onFailure.call(this.scope, {
                            msg: "undefined module " + m,
                            data: this.data
                        });
                    return;
                }

                // The load type is stored to offer the possibility to load
                // the css separately from the script.
                if (!this.loadType || this.loadType === m.type) {
                    this._loading = s[i];
                    //YAHOO.log("attempting to load " + s[i] + ", " + this.base);

                    var fn=(m.type === "css") ? util.Get.css : util.Get.script,
                        url = m.fullpath,
                        self=this, 
                        c=function(o) {
                            self.loadNext(o.data);
                        };

                        url = (url) ? this._filter(url) : this._url(m.path);

                    // safari 2.x or lower, script, and part of YUI
                    if (env.ua.webkit && env.ua.webkit < 420 && m.type === "js" && 
                          !m.varName) {
                          //YUI.info.moduleInfo[s[i]]) {
                          //YAHOO.log("using YAHOO env " + s[i] + ", " + m.varName);
                        c = null;
                        this._useYahooListener = true;
                    }

                    fn(url, {
                        data: s[i],
                        onSuccess: c,
                        onFailure: this._onFailure,
                        onTimeout: this._onTimeout,
                        insertBefore: this.insertBefore,
                        charset: this.charset,
                        timeout: this.timeout,
                        varName: m.varName,
                        scope: self 
                    });

                    return;
                }
            }

            // we are finished
            this._loading = null;

            // internal callback for loading css first
            if (this._internalCallback) {
                var f = this._internalCallback;
                this._internalCallback = null;
                f.call(this);
            } else if (this.onSuccess) {
                this._pushEvents();
                this.onSuccess.call(this.scope, {
                        data: this.data
                    });
            }

        },

        /**
         * In IE, the onAvailable/onDOMReady events need help when Event is
         * loaded dynamically
         * @method _pushEvents
         * @param {Function} optional function reference
         * @private
         */
        _pushEvents: function(ref) {
            var r = ref || YAHOO;
            if (r.util && r.util.Event) {
                r.util.Event._load();
            }
        },

        /**
         * Applies filter
         * method _filter
         * @return {string} the filtered string
         * @private
         */
        _filter: function(str) {
            var f = this.filter;
            return (f) ?  str.replace(new RegExp(f.searchExp, 'g'), f.replaceStr) : str;
        },

        /**
         * Generates the full url for a module
         * method _url
         * @param path {string} the path fragment
         * @return {string} the full url
         * @private
         */
        _url: function(path) {
            return this._filter((this.base || "") + path);
        }

    };

})();
YAHOO.register("yuiloader", YAHOO.util.YUILoader, {version: "2.7.0", build: "1796"});
/*
Copyright (c) 2009, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
version: 2.7.0
*/
/**
 * The Connection Manager provides a simplified interface to the XMLHttpRequest
 * object.  It handles cross-browser instantiantion of XMLHttpRequest, negotiates the
 * interactive states and server response, returning the results to a pre-defined
 * callback you create.
 *
 * @namespace YAHOO.util
 * @module connection
 * @requires yahoo
 * @requires event
 */

/**
 * The Connection Manager singleton provides methods for creating and managing
 * asynchronous transactions.
 *
 * @class Connect
 */

YAHOO.util.Connect =
{
  /**
   * @description Array of MSFT ActiveX ids for XMLHttpRequest.
   * @property _msxml_progid
   * @private
   * @static
   * @type array
   */
	_msxml_progid:[
		'Microsoft.XMLHTTP',
		'MSXML2.XMLHTTP.3.0',
		'MSXML2.XMLHTTP'
		],

  /**
   * @description Object literal of HTTP header(s)
   * @property _http_header
   * @private
   * @static
   * @type object
   */
	_http_headers:{},

  /**
   * @description Determines if HTTP headers are set.
   * @property _has_http_headers
   * @private
   * @static
   * @type boolean
   */
	_has_http_headers:false,

 /**
  * @description Determines if a default header of
  * Content-Type of 'application/x-www-form-urlencoded'
  * will be added to any client HTTP headers sent for POST
  * transactions.
  * @property _use_default_post_header
  * @private
  * @static
  * @type boolean
  */
    _use_default_post_header:true,

 /**
  * @description The default header used for POST transactions.
  * @property _default_post_header
  * @private
  * @static
  * @type boolean
  */
    _default_post_header:'application/x-www-form-urlencoded; charset=UTF-8',

 /**
  * @description The default header used for transactions involving the
  * use of HTML forms.
  * @property _default_form_header
  * @private
  * @static
  * @type boolean
  */
    _default_form_header:'application/x-www-form-urlencoded',

 /**
  * @description Determines if a default header of
  * 'X-Requested-With: XMLHttpRequest'
  * will be added to each transaction.
  * @property _use_default_xhr_header
  * @private
  * @static
  * @type boolean
  */
    _use_default_xhr_header:true,

 /**
  * @description The default header value for the label
  * "X-Requested-With".  This is sent with each
  * transaction, by default, to identify the
  * request as being made by YUI Connection Manager.
  * @property _default_xhr_header
  * @private
  * @static
  * @type boolean
  */
    _default_xhr_header:'XMLHttpRequest',

 /**
  * @description Determines if custom, default headers
  * are set for each transaction.
  * @property _has_default_header
  * @private
  * @static
  * @type boolean
  */
    _has_default_headers:true,

 /**
  * @description Determines if custom, default headers
  * are set for each transaction.
  * @property _has_default_header
  * @private
  * @static
  * @type boolean
  */
    _default_headers:{},

 /**
  * @description Property modified by setForm() to determine if the data
  * should be submitted as an HTML form.
  * @property _isFormSubmit
  * @private
  * @static
  * @type boolean
  */
    _isFormSubmit:false,

 /**
  * @description Property modified by setForm() to determine if a file(s)
  * upload is expected.
  * @property _isFileUpload
  * @private
  * @static
  * @type boolean
  */
    _isFileUpload:false,

 /**
  * @description Property modified by setForm() to set a reference to the HTML
  * form node if the desired action is file upload.
  * @property _formNode
  * @private
  * @static
  * @type object
  */
    _formNode:null,

 /**
  * @description Property modified by setForm() to set the HTML form data
  * for each transaction.
  * @property _sFormData
  * @private
  * @static
  * @type string
  */
    _sFormData:null,

 /**
  * @description Collection of polling references to the polling mechanism in handleReadyState.
  * @property _poll
  * @private
  * @static
  * @type object
  */
    _poll:{},

 /**
  * @description Queue of timeout values for each transaction callback with a defined timeout value.
  * @property _timeOut
  * @private
  * @static
  * @type object
  */
    _timeOut:{},

  /**
   * @description The polling frequency, in milliseconds, for HandleReadyState.
   * when attempting to determine a transaction's XHR readyState.
   * The default is 50 milliseconds.
   * @property _polling_interval
   * @private
   * @static
   * @type int
   */
     _polling_interval:50,

  /**
   * @description A transaction counter that increments the transaction id for each transaction.
   * @property _transaction_id
   * @private
   * @static
   * @type int
   */
     _transaction_id:0,

  /**
   * @description Tracks the name-value pair of the "clicked" submit button if multiple submit
   * buttons are present in an HTML form; and, if YAHOO.util.Event is available.
   * @property _submitElementValue
   * @private
   * @static
   * @type string
   */
	 _submitElementValue:null,

  /**
   * @description Determines whether YAHOO.util.Event is available and returns true or false.
   * If true, an event listener is bound at the document level to trap click events that
   * resolve to a target type of "Submit".  This listener will enable setForm() to determine
   * the clicked "Submit" value in a multi-Submit button, HTML form.
   * @property _hasSubmitListener
   * @private
   * @static
   */
	 _hasSubmitListener:(function()
	 {
		if(YAHOO.util.Event){
			YAHOO.util.Event.addListener(
				document,
				'click',
				function(e){
					var obj = YAHOO.util.Event.getTarget(e),
						name = obj.nodeName.toLowerCase();
					if((name === 'input' || name === 'button') && (obj.type && obj.type.toLowerCase() == 'submit')){
						YAHOO.util.Connect._submitElementValue = encodeURIComponent(obj.name) + "=" + encodeURIComponent(obj.value);
					}
				});
			return true;
	    }
	    return false;
	 })(),

  /**
   * @description Custom event that fires at the start of a transaction
   * @property startEvent
   * @private
   * @static
   * @type CustomEvent
   */
	startEvent: new YAHOO.util.CustomEvent('start'),

  /**
   * @description Custom event that fires when a transaction response has completed.
   * @property completeEvent
   * @private
   * @static
   * @type CustomEvent
   */
	completeEvent: new YAHOO.util.CustomEvent('complete'),

  /**
   * @description Custom event that fires when handleTransactionResponse() determines a
   * response in the HTTP 2xx range.
   * @property successEvent
   * @private
   * @static
   * @type CustomEvent
   */
	successEvent: new YAHOO.util.CustomEvent('success'),

  /**
   * @description Custom event that fires when handleTransactionResponse() determines a
   * response in the HTTP 4xx/5xx range.
   * @property failureEvent
   * @private
   * @static
   * @type CustomEvent
   */
	failureEvent: new YAHOO.util.CustomEvent('failure'),

  /**
   * @description Custom event that fires when handleTransactionResponse() determines a
   * response in the HTTP 4xx/5xx range.
   * @property failureEvent
   * @private
   * @static
   * @type CustomEvent
   */
	uploadEvent: new YAHOO.util.CustomEvent('upload'),

  /**
   * @description Custom event that fires when a transaction is successfully aborted.
   * @property abortEvent
   * @private
   * @static
   * @type CustomEvent
   */
	abortEvent: new YAHOO.util.CustomEvent('abort'),

  /**
   * @description A reference table that maps callback custom events members to its specific
   * event name.
   * @property _customEvents
   * @private
   * @static
   * @type object
   */
	_customEvents:
	{
		onStart:['startEvent', 'start'],
		onComplete:['completeEvent', 'complete'],
		onSuccess:['successEvent', 'success'],
		onFailure:['failureEvent', 'failure'],
		onUpload:['uploadEvent', 'upload'],
		onAbort:['abortEvent', 'abort']
	},

  /**
   * @description Member to add an ActiveX id to the existing xml_progid array.
   * In the event(unlikely) a new ActiveX id is introduced, it can be added
   * without internal code modifications.
   * @method setProgId
   * @public
   * @static
   * @param {string} id The ActiveX id to be added to initialize the XHR object.
   * @return void
   */
	setProgId:function(id)
	{
		this._msxml_progid.unshift(id);
	},

  /**
   * @description Member to override the default POST header.
   * @method setDefaultPostHeader
   * @public
   * @static
   * @param {boolean} b Set and use default header - true or false .
   * @return void
   */
	setDefaultPostHeader:function(b)
	{
		if(typeof b == 'string'){
			this._default_post_header = b;
		}
		else if(typeof b == 'boolean'){
			this._use_default_post_header = b;
		}
	},

  /**
   * @description Member to override the default transaction header..
   * @method setDefaultXhrHeader
   * @public
   * @static
   * @param {boolean} b Set and use default header - true or false .
   * @return void
   */
	setDefaultXhrHeader:function(b)
	{
		if(typeof b == 'string'){
			this._default_xhr_header = b;
		}
		else{
			this._use_default_xhr_header = b;
		}
	},

  /**
   * @description Member to modify the default polling interval.
   * @method setPollingInterval
   * @public
   * @static
   * @param {int} i The polling interval in milliseconds.
   * @return void
   */
	setPollingInterval:function(i)
	{
		if(typeof i == 'number' && isFinite(i)){
			this._polling_interval = i;
		}
	},

  /**
   * @description Instantiates a XMLHttpRequest object and returns an object with two properties:
   * the XMLHttpRequest instance and the transaction id.
   * @method createXhrObject
   * @private
   * @static
   * @param {int} transactionId Property containing the transaction id for this transaction.
   * @return object
   */
	createXhrObject:function(transactionId)
	{
		var obj,http;
		try
		{
			// Instantiates XMLHttpRequest in non-IE browsers and assigns to http.
			http = new XMLHttpRequest();
			//  Object literal with http and tId properties
			obj = { conn:http, tId:transactionId };
		}
		catch(e)
		{
			for(var i=0; i<this._msxml_progid.length; ++i){
				try
				{
					// Instantiates XMLHttpRequest for IE and assign to http
					http = new ActiveXObject(this._msxml_progid[i]);
					//  Object literal with conn and tId properties
					obj = { conn:http, tId:transactionId };
					break;
				}
				catch(e2){}
			}
		}
		finally
		{
			return obj;
		}
	},

  /**
   * @description This method is called by asyncRequest to create a
   * valid connection object for the transaction.  It also passes a
   * transaction id and increments the transaction id counter.
   * @method getConnectionObject
   * @private
   * @static
   * @return {object}
   */
	getConnectionObject:function(isFileUpload)
	{
		var o;
		var tId = this._transaction_id;

		try
		{
			if(!isFileUpload){
				o = this.createXhrObject(tId);
			}
			else{
				o = {};
				o.tId = tId;
				o.isUpload = true;
			}

			if(o){
				this._transaction_id++;
			}
		}
		catch(e){}
		finally
		{
			return o;
		}
	},

  /**
   * @description Method for initiating an asynchronous request via the XHR object.
   * @method asyncRequest
   * @public
   * @static
   * @param {string} method HTTP transaction method
   * @param {string} uri Fully qualified path of resource
   * @param {callback} callback User-defined callback function or object
   * @param {string} postData POST body
   * @return {object} Returns the connection object
   */
	asyncRequest:function(method, uri, callback, postData)
	{
		var o = (this._isFileUpload)?this.getConnectionObject(true):this.getConnectionObject();
		var args = (callback && callback.argument)?callback.argument:null;

		if(!o){
			return null;
		}
		else{

			// Intialize any transaction-specific custom events, if provided.
			if(callback && callback.customevents){
				this.initCustomEvents(o, callback);
			}

			if(this._isFormSubmit){
				if(this._isFileUpload){
					this.uploadFile(o, callback, uri, postData);
					return o;
				}

				// If the specified HTTP method is GET, setForm() will return an
				// encoded string that is concatenated to the uri to
				// create a querystring.
				if(method.toUpperCase() == 'GET'){
					if(this._sFormData.length !== 0){
						// If the URI already contains a querystring, append an ampersand
						// and then concatenate _sFormData to the URI.
						uri += ((uri.indexOf('?') == -1)?'?':'&') + this._sFormData;
					}
				}
				else if(method.toUpperCase() == 'POST'){
					// If POST data exist in addition to the HTML form data,
					// it will be concatenated to the form data.
					postData = postData?this._sFormData + "&" + postData:this._sFormData;
				}
			}

			if(method.toUpperCase() == 'GET' && (callback && callback.cache === false)){
				// If callback.cache is defined and set to false, a
				// timestamp value will be added to the querystring.
				uri += ((uri.indexOf('?') == -1)?'?':'&') + "rnd=" + new Date().valueOf().toString();
			}

			o.conn.open(method, uri, true);

			// Each transaction will automatically include a custom header of
			// "X-Requested-With: XMLHttpRequest" to identify the request as
			// having originated from Connection Manager.
			if(this._use_default_xhr_header){
				if(!this._default_headers['X-Requested-With']){
					this.initHeader('X-Requested-With', this._default_xhr_header, true);
				}
			}

			//If the transaction method is POST and the POST header value is set to true
			//or a custom value, initalize the Content-Type header to this value.
			if((method.toUpperCase() === 'POST' && this._use_default_post_header) && this._isFormSubmit === false){
				this.initHeader('Content-Type', this._default_post_header);
			}

			//Initialize all default and custom HTTP headers,
			if(this._has_default_headers || this._has_http_headers){
				this.setHeader(o);
			}

			this.handleReadyState(o, callback);
			o.conn.send(postData || '');


			// Reset the HTML form data and state properties as
			// soon as the data are submitted.
			if(this._isFormSubmit === true){
				this.resetFormState();
			}

			// Fire global custom event -- startEvent
			this.startEvent.fire(o, args);

			if(o.startEvent){
				// Fire transaction custom event -- startEvent
				o.startEvent.fire(o, args);
			}

			return o;
		}
	},

  /**
   * @description This method creates and subscribes custom events,
   * specific to each transaction
   * @method initCustomEvents
   * @private
   * @static
   * @param {object} o The connection object
   * @param {callback} callback The user-defined callback object
   * @return {void}
   */
	initCustomEvents:function(o, callback)
	{
		var prop;
		// Enumerate through callback.customevents members and bind/subscribe
		// events that match in the _customEvents table.
		for(prop in callback.customevents){
			if(this._customEvents[prop][0]){
				// Create the custom event
				o[this._customEvents[prop][0]] = new YAHOO.util.CustomEvent(this._customEvents[prop][1], (callback.scope)?callback.scope:null);

				// Subscribe the custom event
				o[this._customEvents[prop][0]].subscribe(callback.customevents[prop]);
			}
		}
	},

  /**
   * @description This method serves as a timer that polls the XHR object's readyState
   * property during a transaction, instead of binding a callback to the
   * onreadystatechange event.  Upon readyState 4, handleTransactionResponse
   * will process the response, and the timer will be cleared.
   * @method handleReadyState
   * @private
   * @static
   * @param {object} o The connection object
   * @param {callback} callback The user-defined callback object
   * @return {void}
   */

    handleReadyState:function(o, callback)

    {
		var oConn = this;
		var args = (callback && callback.argument)?callback.argument:null;

		if(callback && callback.timeout){
			this._timeOut[o.tId] = window.setTimeout(function(){ oConn.abort(o, callback, true); }, callback.timeout);
		}

		this._poll[o.tId] = window.setInterval(
			function(){
				if(o.conn && o.conn.readyState === 4){

					// Clear the polling interval for the transaction
					// and remove the reference from _poll.
					window.clearInterval(oConn._poll[o.tId]);
					delete oConn._poll[o.tId];

					if(callback && callback.timeout){
						window.clearTimeout(oConn._timeOut[o.tId]);
						delete oConn._timeOut[o.tId];
					}

					// Fire global custom event -- completeEvent
					oConn.completeEvent.fire(o, args);

					if(o.completeEvent){
						// Fire transaction custom event -- completeEvent
						o.completeEvent.fire(o, args);
					}

					oConn.handleTransactionResponse(o, callback);
				}
			}
		,this._polling_interval);
    },

  /**
   * @description This method attempts to interpret the server response and
   * determine whether the transaction was successful, or if an error or
   * exception was encountered.
   * @method handleTransactionResponse
   * @private
   * @static
   * @param {object} o The connection object
   * @param {object} callback The user-defined callback object
   * @param {boolean} isAbort Determines if the transaction was terminated via abort().
   * @return {void}
   */
    handleTransactionResponse:function(o, callback, isAbort)
    {
		var httpStatus, responseObject;
		var args = (callback && callback.argument)?callback.argument:null;

		try
		{
			if(o.conn.status !== undefined && o.conn.status !== 0){
				httpStatus = o.conn.status;
			}
			else{
				httpStatus = 13030;
			}
		}
		catch(e){

			 // 13030 is a custom code to indicate the condition -- in Mozilla/FF --
			 // when the XHR object's status and statusText properties are
			 // unavailable, and a query attempt throws an exception.
			httpStatus = 13030;
		}

		if(httpStatus >= 200 && httpStatus < 300 || httpStatus === 1223){
			responseObject = this.createResponseObject(o, args);
			if(callback && callback.success){
				if(!callback.scope){
					callback.success(responseObject);
				}
				else{
					// If a scope property is defined, the callback will be fired from
					// the context of the object.
					callback.success.apply(callback.scope, [responseObject]);
				}
			}

			// Fire global custom event -- successEvent
			this.successEvent.fire(responseObject);

			if(o.successEvent){
				// Fire transaction custom event -- successEvent
				o.successEvent.fire(responseObject);
			}
		}
		else{
			switch(httpStatus){
				// The following cases are wininet.dll error codes that may be encountered.
				case 12002: // Server timeout
				case 12029: // 12029 to 12031 correspond to dropped connections.
				case 12030:
				case 12031:
				case 12152: // Connection closed by server.
				case 13030: // See above comments for variable status.
					responseObject = this.createExceptionObject(o.tId, args, (isAbort?isAbort:false));
					if(callback && callback.failure){
						if(!callback.scope){
							callback.failure(responseObject);
						}
						else{
							callback.failure.apply(callback.scope, [responseObject]);
						}
					}

					break;
				default:
					responseObject = this.createResponseObject(o, args);
					if(callback && callback.failure){
						if(!callback.scope){
							callback.failure(responseObject);
						}
						else{
							callback.failure.apply(callback.scope, [responseObject]);
						}
					}
			}

			// Fire global custom event -- failureEvent
			this.failureEvent.fire(responseObject);

			if(o.failureEvent){
				// Fire transaction custom event -- failureEvent
				o.failureEvent.fire(responseObject);
			}

		}

		this.releaseObject(o);
		responseObject = null;
    },

  /**
   * @description This method evaluates the server response, creates and returns the results via
   * its properties.  Success and failure cases will differ in the response
   * object's property values.
   * @method createResponseObject
   * @private
   * @static
   * @param {object} o The connection object
   * @param {callbackArg} callbackArg The user-defined argument or arguments to be passed to the callback
   * @return {object}
   */
    createResponseObject:function(o, callbackArg)
    {
		var obj = {};
		var headerObj = {};

		try
		{
			var headerStr = o.conn.getAllResponseHeaders();
			var header = headerStr.split('\n');
			for(var i=0; i<header.length; i++){
				var delimitPos = header[i].indexOf(':');
				if(delimitPos != -1){
					headerObj[header[i].substring(0,delimitPos)] = header[i].substring(delimitPos+2);
				}
			}
		}
		catch(e){}

		obj.tId = o.tId;
		// Normalize IE's response to HTTP 204 when Win error 1223.
		obj.status = (o.conn.status == 1223)?204:o.conn.status;
		// Normalize IE's statusText to "No Content" instead of "Unknown".
		obj.statusText = (o.conn.status == 1223)?"No Content":o.conn.statusText;
		obj.getResponseHeader = headerObj;
		obj.getAllResponseHeaders = headerStr;
		obj.responseText = o.conn.responseText;
		obj.responseXML = o.conn.responseXML;

		if(callbackArg){
			obj.argument = callbackArg;
		}

		return obj;
    },

  /**
   * @description If a transaction cannot be completed due to dropped or closed connections,
   * there may be not be enough information to build a full response object.
   * The failure callback will be fired and this specific condition can be identified
   * by a status property value of 0.
   *
   * If an abort was successful, the status property will report a value of -1.
   *
   * @method createExceptionObject
   * @private
   * @static
   * @param {int} tId The Transaction Id
   * @param {callbackArg} callbackArg The user-defined argument or arguments to be passed to the callback
   * @param {boolean} isAbort Determines if the exception case is caused by a transaction abort
   * @return {object}
   */
    createExceptionObject:function(tId, callbackArg, isAbort)
    {
		var COMM_CODE = 0;
		var COMM_ERROR = 'communication failure';
		var ABORT_CODE = -1;
		var ABORT_ERROR = 'transaction aborted';

		var obj = {};

		obj.tId = tId;
		if(isAbort){
			obj.status = ABORT_CODE;
			obj.statusText = ABORT_ERROR;
		}
		else{
			obj.status = COMM_CODE;
			obj.statusText = COMM_ERROR;
		}

		if(callbackArg){
			obj.argument = callbackArg;
		}

		return obj;
    },

  /**
   * @description Method that initializes the custom HTTP headers for the each transaction.
   * @method initHeader
   * @public
   * @static
   * @param {string} label The HTTP header label
   * @param {string} value The HTTP header value
   * @param {string} isDefault Determines if the specific header is a default header
   * automatically sent with each transaction.
   * @return {void}
   */
	initHeader:function(label, value, isDefault)
	{
		var headerObj = (isDefault)?this._default_headers:this._http_headers;
		headerObj[label] = value;

		if(isDefault){
			this._has_default_headers = true;
		}
		else{
			this._has_http_headers = true;
		}
	},


  /**
   * @description Accessor that sets the HTTP headers for each transaction.
   * @method setHeader
   * @private
   * @static
   * @param {object} o The connection object for the transaction.
   * @return {void}
   */
	setHeader:function(o)
	{
		var prop;
		if(this._has_default_headers){
			for(prop in this._default_headers){
				if(YAHOO.lang.hasOwnProperty(this._default_headers, prop)){
					o.conn.setRequestHeader(prop, this._default_headers[prop]);
				}
			}
		}

		if(this._has_http_headers){
			for(prop in this._http_headers){
				if(YAHOO.lang.hasOwnProperty(this._http_headers, prop)){
					o.conn.setRequestHeader(prop, this._http_headers[prop]);
				}
			}
			delete this._http_headers;

			this._http_headers = {};
			this._has_http_headers = false;
		}
	},

  /**
   * @description Resets the default HTTP headers object
   * @method resetDefaultHeaders
   * @public
   * @static
   * @return {void}
   */
	resetDefaultHeaders:function(){
		delete this._default_headers;
		this._default_headers = {};
		this._has_default_headers = false;
	},

  /**
   * @description This method assembles the form label and value pairs and
   * constructs an encoded string.
   * asyncRequest() will automatically initialize the transaction with a
   * a HTTP header Content-Type of application/x-www-form-urlencoded.
   * @method setForm
   * @public
   * @static
   * @param {string || object} form id or name attribute, or form object.
   * @param {boolean} optional enable file upload.
   * @param {boolean} optional enable file upload over SSL in IE only.
   * @return {string} string of the HTML form field name and value pairs..
   */
	setForm:function(formId, isUpload, secureUri)
	{
        var oForm, oElement, oName, oValue, oDisabled,
            hasSubmit = false,
            data = [], item = 0,
            i,len,j,jlen,opt;

		this.resetFormState();

		if(typeof formId == 'string'){
			// Determine if the argument is a form id or a form name.
			// Note form name usage is deprecated by supported
			// here for legacy reasons.
			oForm = (document.getElementById(formId) || document.forms[formId]);
		}
		else if(typeof formId == 'object'){
			// Treat argument as an HTML form object.
			oForm = formId;
		}
		else{
			return;
		}

		// If the isUpload argument is true, setForm will call createFrame to initialize
		// an iframe as the form target.
		//
		// The argument secureURI is also required by IE in SSL environments
		// where the secureURI string is a fully qualified HTTP path, used to set the source
		// of the iframe, to a stub resource in the same domain.
		if(isUpload){

			// Create iframe in preparation for file upload.
			this.createFrame(secureUri?secureUri:null);

			// Set form reference and file upload properties to true.
			this._isFormSubmit = true;
			this._isFileUpload = true;
			this._formNode = oForm;

			return;

		}

		// Iterate over the form elements collection to construct the
		// label-value pairs.
		for (i=0,len=oForm.elements.length; i<len; ++i){
			oElement  = oForm.elements[i];
			oDisabled = oElement.disabled;
            oName     = oElement.name;

			// Do not submit fields that are disabled or
			// do not have a name attribute value.
			if(!oDisabled && oName)
			{
                oName  = encodeURIComponent(oName)+'=';
                oValue = encodeURIComponent(oElement.value);

				switch(oElement.type)
				{
                    // Safari, Opera, FF all default opt.value from .text if
                    // value attribute not specified in markup
					case 'select-one':
                        if (oElement.selectedIndex > -1) {
                            opt = oElement.options[oElement.selectedIndex];
                            data[item++] = oName + encodeURIComponent(
                                (opt.attributes.value && opt.attributes.value.specified) ? opt.value : opt.text);
                        }
                        break;
					case 'select-multiple':
                        if (oElement.selectedIndex > -1) {
                            for(j=oElement.selectedIndex, jlen=oElement.options.length; j<jlen; ++j){
                                opt = oElement.options[j];
                                if (opt.selected) {
                                    data[item++] = oName + encodeURIComponent(
                                        (opt.attributes.value && opt.attributes.value.specified) ? opt.value : opt.text);
                                }
                            }
                        }
						break;
					case 'radio':
					case 'checkbox':
						if(oElement.checked){
                            data[item++] = oName + oValue;
						}
						break;
					case 'file':
						// stub case as XMLHttpRequest will only send the file path as a string.
					case undefined:
						// stub case for fieldset element which returns undefined.
					case 'reset':
						// stub case for input type reset button.
					case 'button':
						// stub case for input type button elements.
						break;
					case 'submit':
						if(hasSubmit === false){
							if(this._hasSubmitListener && this._submitElementValue){
                                data[item++] = this._submitElementValue;
							}
							hasSubmit = true;
						}
						break;
					default:
                        data[item++] = oName + oValue;
				}
			}
		}

		this._isFormSubmit = true;
		this._sFormData = data.join('&');


		this.initHeader('Content-Type', this._default_form_header);

		return this._sFormData;
	},

  /**
   * @description Resets HTML form properties when an HTML form or HTML form
   * with file upload transaction is sent.
   * @method resetFormState
   * @private
   * @static
   * @return {void}
   */
	resetFormState:function(){
		this._isFormSubmit = false;
		this._isFileUpload = false;
		this._formNode = null;
		this._sFormData = "";
	},

  /**
   * @description Creates an iframe to be used for form file uploads.  It is remove from the
   * document upon completion of the upload transaction.
   * @method createFrame
   * @private
   * @static
   * @param {string} optional qualified path of iframe resource for SSL in IE.
   * @return {void}
   */
	createFrame:function(secureUri){

		// IE does not allow the setting of id and name attributes as object
		// properties via createElement().  A different iframe creation
		// pattern is required for IE.
		var frameId = 'yuiIO' + this._transaction_id;
		var io;
		if(YAHOO.env.ua.ie){
			io = document.createElement('<iframe id="' + frameId + '" name="' + frameId + '" />');

			// IE will throw a security exception in an SSL environment if the
			// iframe source is undefined.
			if(typeof secureUri == 'boolean'){
				io.src = 'javascript:false';
			}
		}
		else{
			io = document.createElement('iframe');
			io.id = frameId;
			io.name = frameId;
		}

		io.style.position = 'absolute';
		io.style.top = '-1000px';
		io.style.left = '-1000px';

		document.body.appendChild(io);
	},

  /**
   * @description Parses the POST data and creates hidden form elements
   * for each key-value, and appends them to the HTML form object.
   * @method appendPostData
   * @private
   * @static
   * @param {string} postData The HTTP POST data
   * @return {array} formElements Collection of hidden fields.
   */
	appendPostData:function(postData)
	{
		var formElements = [],
			postMessage = postData.split('&'),
			i, delimitPos;
		for(i=0; i < postMessage.length; i++){
			delimitPos = postMessage[i].indexOf('=');
			if(delimitPos != -1){
				formElements[i] = document.createElement('input');
				formElements[i].type = 'hidden';
				formElements[i].name = decodeURIComponent(postMessage[i].substring(0,delimitPos));
				formElements[i].value = decodeURIComponent(postMessage[i].substring(delimitPos+1));
				this._formNode.appendChild(formElements[i]);
			}
		}

		return formElements;
	},

  /**
   * @description Uploads HTML form, inclusive of files/attachments, using the
   * iframe created in createFrame to facilitate the transaction.
   * @method uploadFile
   * @private
   * @static
   * @param {int} id The transaction id.
   * @param {object} callback User-defined callback object.
   * @param {string} uri Fully qualified path of resource.
   * @param {string} postData POST data to be submitted in addition to HTML form.
   * @return {void}
   */
	uploadFile:function(o, callback, uri, postData){

		// Each iframe has an id prefix of "yuiIO" followed
		// by the unique transaction id.
		var frameId = 'yuiIO' + o.tId,
		    uploadEncoding = 'multipart/form-data',
		    io = document.getElementById(frameId),
		    oConn = this,
			args = (callback && callback.argument)?callback.argument:null,
            oElements,i,prop,obj;

		// Track original HTML form attribute values.
		var rawFormAttributes =
		{
			action:this._formNode.getAttribute('action'),
			method:this._formNode.getAttribute('method'),
			target:this._formNode.getAttribute('target')
		};

		// Initialize the HTML form properties in case they are
		// not defined in the HTML form.
		this._formNode.setAttribute('action', uri);
		this._formNode.setAttribute('method', 'POST');
		this._formNode.setAttribute('target', frameId);

		if(YAHOO.env.ua.ie){
			// IE does not respect property enctype for HTML forms.
			// Instead it uses the property - "encoding".
			this._formNode.setAttribute('encoding', uploadEncoding);
		}
		else{
			this._formNode.setAttribute('enctype', uploadEncoding);
		}

		if(postData){
			oElements = this.appendPostData(postData);
		}

		// Start file upload.
		this._formNode.submit();

		// Fire global custom event -- startEvent
		this.startEvent.fire(o, args);

		if(o.startEvent){
			// Fire transaction custom event -- startEvent
			o.startEvent.fire(o, args);
		}

		// Start polling if a callback is present and the timeout
		// property has been defined.
		if(callback && callback.timeout){
			this._timeOut[o.tId] = window.setTimeout(function(){ oConn.abort(o, callback, true); }, callback.timeout);
		}

		// Remove HTML elements created by appendPostData
		if(oElements && oElements.length > 0){
			for(i=0; i < oElements.length; i++){
				this._formNode.removeChild(oElements[i]);
			}
		}

		// Restore HTML form attributes to their original
		// values prior to file upload.
		for(prop in rawFormAttributes){
			if(YAHOO.lang.hasOwnProperty(rawFormAttributes, prop)){
				if(rawFormAttributes[prop]){
					this._formNode.setAttribute(prop, rawFormAttributes[prop]);
				}
				else{
					this._formNode.removeAttribute(prop);
				}
			}
		}

		// Reset HTML form state properties.
		this.resetFormState();

		// Create the upload callback handler that fires when the iframe
		// receives the load event.  Subsequently, the event handler is detached
		// and the iframe removed from the document.
		var uploadCallback = function()
		{
			if(callback && callback.timeout){
				window.clearTimeout(oConn._timeOut[o.tId]);
				delete oConn._timeOut[o.tId];
			}

			// Fire global custom event -- completeEvent
			oConn.completeEvent.fire(o, args);

			if(o.completeEvent){
				// Fire transaction custom event -- completeEvent
				o.completeEvent.fire(o, args);
			}

			obj = {
			    tId : o.tId,
			    argument : callback.argument
            };

			try
			{
				// responseText and responseXML will be populated with the same data from the iframe.
				// Since the HTTP headers cannot be read from the iframe
				obj.responseText = io.contentWindow.document.body?io.contentWindow.document.body.innerHTML:io.contentWindow.document.documentElement.textContent;
				obj.responseXML = io.contentWindow.document.XMLDocument?io.contentWindow.document.XMLDocument:io.contentWindow.document;
			}
			catch(e){}

			if(callback && callback.upload){
				if(!callback.scope){
					callback.upload(obj);
				}
				else{
					callback.upload.apply(callback.scope, [obj]);
				}
			}

			// Fire global custom event -- uploadEvent
			oConn.uploadEvent.fire(obj);

			if(o.uploadEvent){
				// Fire transaction custom event -- uploadEvent
				o.uploadEvent.fire(obj);
			}

			YAHOO.util.Event.removeListener(io, "load", uploadCallback);

			setTimeout(
				function(){
					document.body.removeChild(io);
					oConn.releaseObject(o);
				}, 100);
		};

		// Bind the onload handler to the iframe to detect the file upload response.
		YAHOO.util.Event.addListener(io, "load", uploadCallback);
	},

  /**
   * @description Method to terminate a transaction, if it has not reached readyState 4.
   * @method abort
   * @public
   * @static
   * @param {object} o The connection object returned by asyncRequest.
   * @param {object} callback  User-defined callback object.
   * @param {string} isTimeout boolean to indicate if abort resulted from a callback timeout.
   * @return {boolean}
   */
	abort:function(o, callback, isTimeout)
	{
		var abortStatus;
		var args = (callback && callback.argument)?callback.argument:null;


		if(o && o.conn){
			if(this.isCallInProgress(o)){
				// Issue abort request
				o.conn.abort();

				window.clearInterval(this._poll[o.tId]);
				delete this._poll[o.tId];

				if(isTimeout){
					window.clearTimeout(this._timeOut[o.tId]);
					delete this._timeOut[o.tId];
				}

				abortStatus = true;
			}
		}
		else if(o && o.isUpload === true){
			var frameId = 'yuiIO' + o.tId;
			var io = document.getElementById(frameId);

			if(io){
				// Remove all listeners on the iframe prior to
				// its destruction.
				YAHOO.util.Event.removeListener(io, "load");
				// Destroy the iframe facilitating the transaction.
				document.body.removeChild(io);

				if(isTimeout){
					window.clearTimeout(this._timeOut[o.tId]);
					delete this._timeOut[o.tId];
				}

				abortStatus = true;
			}
		}
		else{
			abortStatus = false;
		}

		if(abortStatus === true){
			// Fire global custom event -- abortEvent
			this.abortEvent.fire(o, args);

			if(o.abortEvent){
				// Fire transaction custom event -- abortEvent
				o.abortEvent.fire(o, args);
			}

			this.handleTransactionResponse(o, callback, true);
		}

		return abortStatus;
	},

  /**
   * @description Determines if the transaction is still being processed.
   * @method isCallInProgress
   * @public
   * @static
   * @param {object} o The connection object returned by asyncRequest
   * @return {boolean}
   */
	isCallInProgress:function(o)
	{
		// if the XHR object assigned to the transaction has not been dereferenced,
		// then check its readyState status.  Otherwise, return false.
		if(o && o.conn){
			return o.conn.readyState !== 4 && o.conn.readyState !== 0;
		}
		else if(o && o.isUpload === true){
			var frameId = 'yuiIO' + o.tId;
			return document.getElementById(frameId)?true:false;
		}
		else{
			return false;
		}
	},

  /**
   * @description Dereference the XHR instance and the connection object after the transaction is completed.
   * @method releaseObject
   * @private
   * @static
   * @param {object} o The connection object
   * @return {void}
   */
	releaseObject:function(o)
	{
		if(o && o.conn){
			//dereference the XHR instance.
			o.conn = null;


			//dereference the connection object.
			o = null;
		}
	}
};
YAHOO.register("connection", YAHOO.util.Connect, {version: "2.7.0", build: "1796"});
/*
Copyright (c) 2009, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
version: 2.7.0
*/
(function() {

var Y = YAHOO.util;

/*
Copyright (c) 2006, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
*/

/**
 * The animation module provides allows effects to be added to HTMLElements.
 * @module animation
 * @requires yahoo, event, dom
 */

/**
 *
 * Base animation class that provides the interface for building animated effects.
 * <p>Usage: var myAnim = new YAHOO.util.Anim(el, { width: { from: 10, to: 100 } }, 1, YAHOO.util.Easing.easeOut);</p>
 * @class Anim
 * @namespace YAHOO.util
 * @requires YAHOO.util.AnimMgr
 * @requires YAHOO.util.Easing
 * @requires YAHOO.util.Dom
 * @requires YAHOO.util.Event
 * @requires YAHOO.util.CustomEvent
 * @constructor
 * @param {String | HTMLElement} el Reference to the element that will be animated
 * @param {Object} attributes The attribute(s) to be animated.  
 * Each attribute is an object with at minimum a "to" or "by" member defined.  
 * Additional optional members are "from" (defaults to current value), "units" (defaults to "px").  
 * All attribute names use camelCase.
 * @param {Number} duration (optional, defaults to 1 second) Length of animation (frames or seconds), defaults to time-based
 * @param {Function} method (optional, defaults to YAHOO.util.Easing.easeNone) Computes the values that are applied to the attributes per frame (generally a YAHOO.util.Easing method)
 */

var Anim = function(el, attributes, duration, method) {
    if (!el) {
    }
    this.init(el, attributes, duration, method); 
};

Anim.NAME = 'Anim';

Anim.prototype = {
    /**
     * Provides a readable name for the Anim instance.
     * @method toString
     * @return {String}
     */
    toString: function() {
        var el = this.getEl() || {};
        var id = el.id || el.tagName;
        return (this.constructor.NAME + ': ' + id);
    },
    
    patterns: { // cached for performance
        noNegatives:        /width|height|opacity|padding/i, // keep at zero or above
        offsetAttribute:  /^((width|height)|(top|left))$/, // use offsetValue as default
        defaultUnit:        /width|height|top$|bottom$|left$|right$/i, // use 'px' by default
        offsetUnit:         /\d+(em|%|en|ex|pt|in|cm|mm|pc)$/i // IE may return these, so convert these to offset
    },
    
    /**
     * Returns the value computed by the animation's "method".
     * @method doMethod
     * @param {String} attr The name of the attribute.
     * @param {Number} start The value this attribute should start from for this animation.
     * @param {Number} end  The value this attribute should end at for this animation.
     * @return {Number} The Value to be applied to the attribute.
     */
    doMethod: function(attr, start, end) {
        return this.method(this.currentFrame, start, end - start, this.totalFrames);
    },
    
    /**
     * Applies a value to an attribute.
     * @method setAttribute
     * @param {String} attr The name of the attribute.
     * @param {Number} val The value to be applied to the attribute.
     * @param {String} unit The unit ('px', '%', etc.) of the value.
     */
    setAttribute: function(attr, val, unit) {
        var el = this.getEl();
        if ( this.patterns.noNegatives.test(attr) ) {
            val = (val > 0) ? val : 0;
        }

        if ('style' in el) {
            Y.Dom.setStyle(el, attr, val + unit);
        } else if (attr in el) {
            el[attr] = val;
        }
    },                        
    
    /**
     * Returns current value of the attribute.
     * @method getAttribute
     * @param {String} attr The name of the attribute.
     * @return {Number} val The current value of the attribute.
     */
    getAttribute: function(attr) {
        var el = this.getEl();
        var val = Y.Dom.getStyle(el, attr);

        if (val !== 'auto' && !this.patterns.offsetUnit.test(val)) {
            return parseFloat(val);
        }
        
        var a = this.patterns.offsetAttribute.exec(attr) || [];
        var pos = !!( a[3] ); // top or left
        var box = !!( a[2] ); // width or height
        
        if ('style' in el) {
            // use offsets for width/height and abs pos top/left
            if ( box || (Y.Dom.getStyle(el, 'position') == 'absolute' && pos) ) {
                val = el['offset' + a[0].charAt(0).toUpperCase() + a[0].substr(1)];
            } else { // default to zero for other 'auto'
                val = 0;
            }
        } else if (attr in el) {
            val = el[attr];
        }

        return val;
    },
    
    /**
     * Returns the unit to use when none is supplied.
     * @method getDefaultUnit
     * @param {attr} attr The name of the attribute.
     * @return {String} The default unit to be used.
     */
    getDefaultUnit: function(attr) {
         if ( this.patterns.defaultUnit.test(attr) ) {
            return 'px';
         }
         
         return '';
    },
        
    /**
     * Sets the actual values to be used during the animation.  Should only be needed for subclass use.
     * @method setRuntimeAttribute
     * @param {Object} attr The attribute object
     * @private 
     */
    setRuntimeAttribute: function(attr) {
        var start;
        var end;
        var attributes = this.attributes;

        this.runtimeAttributes[attr] = {};
        
        var isset = function(prop) {
            return (typeof prop !== 'undefined');
        };
        
        if ( !isset(attributes[attr]['to']) && !isset(attributes[attr]['by']) ) {
            return false; // note return; nothing to animate to
        }
        
        start = ( isset(attributes[attr]['from']) ) ? attributes[attr]['from'] : this.getAttribute(attr);

        // To beats by, per SMIL 2.1 spec
        if ( isset(attributes[attr]['to']) ) {
            end = attributes[attr]['to'];
        } else if ( isset(attributes[attr]['by']) ) {
            if (start.constructor == Array) {
                end = [];
                for (var i = 0, len = start.length; i < len; ++i) {
                    end[i] = start[i] + attributes[attr]['by'][i] * 1; // times 1 to cast "by" 
                }
            } else {
                end = start + attributes[attr]['by'] * 1;
            }
        }
        
        this.runtimeAttributes[attr].start = start;
        this.runtimeAttributes[attr].end = end;

        // set units if needed
        this.runtimeAttributes[attr].unit = ( isset(attributes[attr].unit) ) ?
                attributes[attr]['unit'] : this.getDefaultUnit(attr);
        return true;
    },

    /**
     * Constructor for Anim instance.
     * @method init
     * @param {String | HTMLElement} el Reference to the element that will be animated
     * @param {Object} attributes The attribute(s) to be animated.  
     * Each attribute is an object with at minimum a "to" or "by" member defined.  
     * Additional optional members are "from" (defaults to current value), "units" (defaults to "px").  
     * All attribute names use camelCase.
     * @param {Number} duration (optional, defaults to 1 second) Length of animation (frames or seconds), defaults to time-based
     * @param {Function} method (optional, defaults to YAHOO.util.Easing.easeNone) Computes the values that are applied to the attributes per frame (generally a YAHOO.util.Easing method)
     */ 
    init: function(el, attributes, duration, method) {
        /**
         * Whether or not the animation is running.
         * @property isAnimated
         * @private
         * @type Boolean
         */
        var isAnimated = false;
        
        /**
         * A Date object that is created when the animation begins.
         * @property startTime
         * @private
         * @type Date
         */
        var startTime = null;
        
        /**
         * The number of frames this animation was able to execute.
         * @property actualFrames
         * @private
         * @type Int
         */
        var actualFrames = 0; 

        /**
         * The element to be animated.
         * @property el
         * @private
         * @type HTMLElement
         */
        el = Y.Dom.get(el);
        
        /**
         * The collection of attributes to be animated.  
         * Each attribute must have at least a "to" or "by" defined in order to animate.  
         * If "to" is supplied, the animation will end with the attribute at that value.  
         * If "by" is supplied, the animation will end at that value plus its starting value. 
         * If both are supplied, "to" is used, and "by" is ignored. 
         * Optional additional member include "from" (the value the attribute should start animating from, defaults to current value), and "unit" (the units to apply to the values).
         * @property attributes
         * @type Object
         */
        this.attributes = attributes || {};
        
        /**
         * The length of the animation.  Defaults to "1" (second).
         * @property duration
         * @type Number
         */
        this.duration = !YAHOO.lang.isUndefined(duration) ? duration : 1;
        
        /**
         * The method that will provide values to the attribute(s) during the animation. 
         * Defaults to "YAHOO.util.Easing.easeNone".
         * @property method
         * @type Function
         */
        this.method = method || Y.Easing.easeNone;

        /**
         * Whether or not the duration should be treated as seconds.
         * Defaults to true.
         * @property useSeconds
         * @type Boolean
         */
        this.useSeconds = true; // default to seconds
        
        /**
         * The location of the current animation on the timeline.
         * In time-based animations, this is used by AnimMgr to ensure the animation finishes on time.
         * @property currentFrame
         * @type Int
         */
        this.currentFrame = 0;
        
        /**
         * The total number of frames to be executed.
         * In time-based animations, this is used by AnimMgr to ensure the animation finishes on time.
         * @property totalFrames
         * @type Int
         */
        this.totalFrames = Y.AnimMgr.fps;
        
        /**
         * Changes the animated element
         * @method setEl
         */
        this.setEl = function(element) {
            el = Y.Dom.get(element);
        };
        
        /**
         * Returns a reference to the animated element.
         * @method getEl
         * @return {HTMLElement}
         */
        this.getEl = function() { return el; };
        
        /**
         * Checks whether the element is currently animated.
         * @method isAnimated
         * @return {Boolean} current value of isAnimated.     
         */
        this.isAnimated = function() {
            return isAnimated;
        };
        
        /**
         * Returns the animation start time.
         * @method getStartTime
         * @return {Date} current value of startTime.      
         */
        this.getStartTime = function() {
            return startTime;
        };        
        
        this.runtimeAttributes = {};
        
        
        
        /**
         * Starts the animation by registering it with the animation manager. 
         * @method animate  
         */
        this.animate = function() {
            if ( this.isAnimated() ) {
                return false;
            }
            
            this.currentFrame = 0;
            
            this.totalFrames = ( this.useSeconds ) ? Math.ceil(Y.AnimMgr.fps * this.duration) : this.duration;
    
            if (this.duration === 0 && this.useSeconds) { // jump to last frame if zero second duration 
                this.totalFrames = 1; 
            }
            Y.AnimMgr.registerElement(this);
            return true;
        };
          
        /**
         * Stops the animation.  Normally called by AnimMgr when animation completes.
         * @method stop
         * @param {Boolean} finish (optional) If true, animation will jump to final frame.
         */ 
        this.stop = function(finish) {
            if (!this.isAnimated()) { // nothing to stop
                return false;
            }

            if (finish) {
                 this.currentFrame = this.totalFrames;
                 this._onTween.fire();
            }
            Y.AnimMgr.stop(this);
        };
        
        var onStart = function() {            
            this.onStart.fire();
            
            this.runtimeAttributes = {};
            for (var attr in this.attributes) {
                this.setRuntimeAttribute(attr);
            }
            
            isAnimated = true;
            actualFrames = 0;
            startTime = new Date(); 
        };
        
        /**
         * Feeds the starting and ending values for each animated attribute to doMethod once per frame, then applies the resulting value to the attribute(s).
         * @private
         */
         
        var onTween = function() {
            var data = {
                duration: new Date() - this.getStartTime(),
                currentFrame: this.currentFrame
            };
            
            data.toString = function() {
                return (
                    'duration: ' + data.duration +
                    ', currentFrame: ' + data.currentFrame
                );
            };
            
            this.onTween.fire(data);
            
            var runtimeAttributes = this.runtimeAttributes;
            
            for (var attr in runtimeAttributes) {
                this.setAttribute(attr, this.doMethod(attr, runtimeAttributes[attr].start, runtimeAttributes[attr].end), runtimeAttributes[attr].unit); 
            }
            
            actualFrames += 1;
        };
        
        var onComplete = function() {
            var actual_duration = (new Date() - startTime) / 1000 ;
            
            var data = {
                duration: actual_duration,
                frames: actualFrames,
                fps: actualFrames / actual_duration
            };
            
            data.toString = function() {
                return (
                    'duration: ' + data.duration +
                    ', frames: ' + data.frames +
                    ', fps: ' + data.fps
                );
            };
            
            isAnimated = false;
            actualFrames = 0;
            this.onComplete.fire(data);
        };
        
        /**
         * Custom event that fires after onStart, useful in subclassing
         * @private
         */    
        this._onStart = new Y.CustomEvent('_start', this, true);

        /**
         * Custom event that fires when animation begins
         * Listen via subscribe method (e.g. myAnim.onStart.subscribe(someFunction)
         * @event onStart
         */    
        this.onStart = new Y.CustomEvent('start', this);
        
        /**
         * Custom event that fires between each frame
         * Listen via subscribe method (e.g. myAnim.onTween.subscribe(someFunction)
         * @event onTween
         */
        this.onTween = new Y.CustomEvent('tween', this);
        
        /**
         * Custom event that fires after onTween
         * @private
         */
        this._onTween = new Y.CustomEvent('_tween', this, true);
        
        /**
         * Custom event that fires when animation ends
         * Listen via subscribe method (e.g. myAnim.onComplete.subscribe(someFunction)
         * @event onComplete
         */
        this.onComplete = new Y.CustomEvent('complete', this);
        /**
         * Custom event that fires after onComplete
         * @private
         */
        this._onComplete = new Y.CustomEvent('_complete', this, true);

        this._onStart.subscribe(onStart);
        this._onTween.subscribe(onTween);
        this._onComplete.subscribe(onComplete);
    }
};

    Y.Anim = Anim;
})();
/**
 * Handles animation queueing and threading.
 * Used by Anim and subclasses.
 * @class AnimMgr
 * @namespace YAHOO.util
 */
YAHOO.util.AnimMgr = new function() {
    /** 
     * Reference to the animation Interval.
     * @property thread
     * @private
     * @type Int
     */
    var thread = null;
    
    /** 
     * The current queue of registered animation objects.
     * @property queue
     * @private
     * @type Array
     */    
    var queue = [];

    /** 
     * The number of active animations.
     * @property tweenCount
     * @private
     * @type Int
     */        
    var tweenCount = 0;

    /** 
     * Base frame rate (frames per second). 
     * Arbitrarily high for better x-browser calibration (slower browsers drop more frames).
     * @property fps
     * @type Int
     * 
     */
    this.fps = 1000;

    /** 
     * Interval delay in milliseconds, defaults to fastest possible.
     * @property delay
     * @type Int
     * 
     */
    this.delay = 1;

    /**
     * Adds an animation instance to the animation queue.
     * All animation instances must be registered in order to animate.
     * @method registerElement
     * @param {object} tween The Anim instance to be be registered
     */
    this.registerElement = function(tween) {
        queue[queue.length] = tween;
        tweenCount += 1;
        tween._onStart.fire();
        this.start();
    };
    
    /**
     * removes an animation instance from the animation queue.
     * All animation instances must be registered in order to animate.
     * @method unRegister
     * @param {object} tween The Anim instance to be be registered
     * @param {Int} index The index of the Anim instance
     * @private
     */
    this.unRegister = function(tween, index) {
        index = index || getIndex(tween);
        if (!tween.isAnimated() || index == -1) {
            return false;
        }
        
        tween._onComplete.fire();
        queue.splice(index, 1);

        tweenCount -= 1;
        if (tweenCount <= 0) {
            this.stop();
        }

        return true;
    };
    
    /**
     * Starts the animation thread.
	* Only one thread can run at a time.
     * @method start
     */    
    this.start = function() {
        if (thread === null) {
            thread = setInterval(this.run, this.delay);
        }
    };

    /**
     * Stops the animation thread or a specific animation instance.
     * @method stop
     * @param {object} tween A specific Anim instance to stop (optional)
     * If no instance given, Manager stops thread and all animations.
     */    
    this.stop = function(tween) {
        if (!tween) {
            clearInterval(thread);
            
            for (var i = 0, len = queue.length; i < len; ++i) {
                this.unRegister(queue[0], 0);  
            }

            queue = [];
            thread = null;
            tweenCount = 0;
        }
        else {
            this.unRegister(tween);
        }
    };
    
    /**
     * Called per Interval to handle each animation frame.
     * @method run
     */    
    this.run = function() {
        for (var i = 0, len = queue.length; i < len; ++i) {
            var tween = queue[i];
            if ( !tween || !tween.isAnimated() ) { continue; }

            if (tween.currentFrame < tween.totalFrames || tween.totalFrames === null)
            {
                tween.currentFrame += 1;
                
                if (tween.useSeconds) {
                    correctFrame(tween);
                }
                tween._onTween.fire();          
            }
            else { YAHOO.util.AnimMgr.stop(tween, i); }
        }
    };
    
    var getIndex = function(anim) {
        for (var i = 0, len = queue.length; i < len; ++i) {
            if (queue[i] == anim) {
                return i; // note return;
            }
        }
        return -1;
    };
    
    /**
     * On the fly frame correction to keep animation on time.
     * @method correctFrame
     * @private
     * @param {Object} tween The Anim instance being corrected.
     */
    var correctFrame = function(tween) {
        var frames = tween.totalFrames;
        var frame = tween.currentFrame;
        var expected = (tween.currentFrame * tween.duration * 1000 / tween.totalFrames);
        var elapsed = (new Date() - tween.getStartTime());
        var tweak = 0;
        
        if (elapsed < tween.duration * 1000) { // check if falling behind
            tweak = Math.round((elapsed / expected - 1) * tween.currentFrame);
        } else { // went over duration, so jump to end
            tweak = frames - (frame + 1); 
        }
        if (tweak > 0 && isFinite(tweak)) { // adjust if needed
            if (tween.currentFrame + tweak >= frames) {// dont go past last frame
                tweak = frames - (frame + 1);
            }
            
            tween.currentFrame += tweak;      
        }
    };
};
/**
 * Used to calculate Bezier splines for any number of control points.
 * @class Bezier
 * @namespace YAHOO.util
 *
 */
YAHOO.util.Bezier = new function() {
    /**
     * Get the current position of the animated element based on t.
     * Each point is an array of "x" and "y" values (0 = x, 1 = y)
     * At least 2 points are required (start and end).
     * First point is start. Last point is end.
     * Additional control points are optional.     
     * @method getPosition
     * @param {Array} points An array containing Bezier points
     * @param {Number} t A number between 0 and 1 which is the basis for determining current position
     * @return {Array} An array containing int x and y member data
     */
    this.getPosition = function(points, t) {  
        var n = points.length;
        var tmp = [];

        for (var i = 0; i < n; ++i){
            tmp[i] = [points[i][0], points[i][1]]; // save input
        }
        
        for (var j = 1; j < n; ++j) {
            for (i = 0; i < n - j; ++i) {
                tmp[i][0] = (1 - t) * tmp[i][0] + t * tmp[parseInt(i + 1, 10)][0];
                tmp[i][1] = (1 - t) * tmp[i][1] + t * tmp[parseInt(i + 1, 10)][1]; 
            }
        }
    
        return [ tmp[0][0], tmp[0][1] ]; 
    
    };
};
(function() {
/**
 * Anim subclass for color transitions.
 * <p>Usage: <code>var myAnim = new Y.ColorAnim(el, { backgroundColor: { from: '#FF0000', to: '#FFFFFF' } }, 1, Y.Easing.easeOut);</code> Color values can be specified with either 112233, #112233, 
 * [255,255,255], or rgb(255,255,255)</p>
 * @class ColorAnim
 * @namespace YAHOO.util
 * @requires YAHOO.util.Anim
 * @requires YAHOO.util.AnimMgr
 * @requires YAHOO.util.Easing
 * @requires YAHOO.util.Bezier
 * @requires YAHOO.util.Dom
 * @requires YAHOO.util.Event
 * @constructor
 * @extends YAHOO.util.Anim
 * @param {HTMLElement | String} el Reference to the element that will be animated
 * @param {Object} attributes The attribute(s) to be animated.
 * Each attribute is an object with at minimum a "to" or "by" member defined.
 * Additional optional members are "from" (defaults to current value), "units" (defaults to "px").
 * All attribute names use camelCase.
 * @param {Number} duration (optional, defaults to 1 second) Length of animation (frames or seconds), defaults to time-based
 * @param {Function} method (optional, defaults to YAHOO.util.Easing.easeNone) Computes the values that are applied to the attributes per frame (generally a YAHOO.util.Easing method)
 */
    var ColorAnim = function(el, attributes, duration,  method) {
        ColorAnim.superclass.constructor.call(this, el, attributes, duration, method);
    };
    
    ColorAnim.NAME = 'ColorAnim';

    ColorAnim.DEFAULT_BGCOLOR = '#fff';
    // shorthand
    var Y = YAHOO.util;
    YAHOO.extend(ColorAnim, Y.Anim);

    var superclass = ColorAnim.superclass;
    var proto = ColorAnim.prototype;
    
    proto.patterns.color = /color$/i;
    proto.patterns.rgb            = /^rgb\(([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\)$/i;
    proto.patterns.hex            = /^#?([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})$/i;
    proto.patterns.hex3          = /^#?([0-9A-F]{1})([0-9A-F]{1})([0-9A-F]{1})$/i;
    proto.patterns.transparent = /^transparent|rgba\(0, 0, 0, 0\)$/; // need rgba for safari
    
    /**
     * Attempts to parse the given string and return a 3-tuple.
     * @method parseColor
     * @param {String} s The string to parse.
     * @return {Array} The 3-tuple of rgb values.
     */
    proto.parseColor = function(s) {
        if (s.length == 3) { return s; }
    
        var c = this.patterns.hex.exec(s);
        if (c && c.length == 4) {
            return [ parseInt(c[1], 16), parseInt(c[2], 16), parseInt(c[3], 16) ];
        }
    
        c = this.patterns.rgb.exec(s);
        if (c && c.length == 4) {
            return [ parseInt(c[1], 10), parseInt(c[2], 10), parseInt(c[3], 10) ];
        }
    
        c = this.patterns.hex3.exec(s);
        if (c && c.length == 4) {
            return [ parseInt(c[1] + c[1], 16), parseInt(c[2] + c[2], 16), parseInt(c[3] + c[3], 16) ];
        }
        
        return null;
    };

    proto.getAttribute = function(attr) {
        var el = this.getEl();
        if (this.patterns.color.test(attr) ) {
            var val = YAHOO.util.Dom.getStyle(el, attr);
            
            var that = this;
            if (this.patterns.transparent.test(val)) { // bgcolor default
                var parent = YAHOO.util.Dom.getAncestorBy(el, function(node) {
                    return !that.patterns.transparent.test(val);
                });

                if (parent) {
                    val = Y.Dom.getStyle(parent, attr);
                } else {
                    val = ColorAnim.DEFAULT_BGCOLOR;
                }
            }
        } else {
            val = superclass.getAttribute.call(this, attr);
        }

        return val;
    };
    
    proto.doMethod = function(attr, start, end) {
        var val;
    
        if ( this.patterns.color.test(attr) ) {
            val = [];
            for (var i = 0, len = start.length; i < len; ++i) {
                val[i] = superclass.doMethod.call(this, attr, start[i], end[i]);
            }
            
            val = 'rgb('+Math.floor(val[0])+','+Math.floor(val[1])+','+Math.floor(val[2])+')';
        }
        else {
            val = superclass.doMethod.call(this, attr, start, end);
        }

        return val;
    };

    proto.setRuntimeAttribute = function(attr) {
        superclass.setRuntimeAttribute.call(this, attr);
        
        if ( this.patterns.color.test(attr) ) {
            var attributes = this.attributes;
            var start = this.parseColor(this.runtimeAttributes[attr].start);
            var end = this.parseColor(this.runtimeAttributes[attr].end);
            // fix colors if going "by"
            if ( typeof attributes[attr]['to'] === 'undefined' && typeof attributes[attr]['by'] !== 'undefined' ) {
                end = this.parseColor(attributes[attr].by);
            
                for (var i = 0, len = start.length; i < len; ++i) {
                    end[i] = start[i] + end[i];
                }
            }
            
            this.runtimeAttributes[attr].start = start;
            this.runtimeAttributes[attr].end = end;
        }
    };

    Y.ColorAnim = ColorAnim;
})();
/*!
TERMS OF USE - EASING EQUATIONS
Open source under the BSD License.
Copyright 2001 Robert Penner All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

 * Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 * Neither the name of the author nor the names of contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
 * Singleton that determines how an animation proceeds from start to end.
 * @class Easing
 * @namespace YAHOO.util
*/

YAHOO.util.Easing = {

    /**
     * Uniform speed between points.
     * @method easeNone
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @return {Number} The computed value for the current animation frame
     */
    easeNone: function (t, b, c, d) {
    	return c*t/d + b;
    },
    
    /**
     * Begins slowly and accelerates towards end.
     * @method easeIn
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @return {Number} The computed value for the current animation frame
     */
    easeIn: function (t, b, c, d) {
    	return c*(t/=d)*t + b;
    },

    /**
     * Begins quickly and decelerates towards end.
     * @method easeOut
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @return {Number} The computed value for the current animation frame
     */
    easeOut: function (t, b, c, d) {
    	return -c *(t/=d)*(t-2) + b;
    },
    
    /**
     * Begins slowly and decelerates towards end.
     * @method easeBoth
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @return {Number} The computed value for the current animation frame
     */
    easeBoth: function (t, b, c, d) {
    	if ((t/=d/2) < 1) {
            return c/2*t*t + b;
        }
        
    	return -c/2 * ((--t)*(t-2) - 1) + b;
    },
    
    /**
     * Begins slowly and accelerates towards end.
     * @method easeInStrong
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @return {Number} The computed value for the current animation frame
     */
    easeInStrong: function (t, b, c, d) {
    	return c*(t/=d)*t*t*t + b;
    },
    
    /**
     * Begins quickly and decelerates towards end.
     * @method easeOutStrong
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @return {Number} The computed value for the current animation frame
     */
    easeOutStrong: function (t, b, c, d) {
    	return -c * ((t=t/d-1)*t*t*t - 1) + b;
    },
    
    /**
     * Begins slowly and decelerates towards end.
     * @method easeBothStrong
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @return {Number} The computed value for the current animation frame
     */
    easeBothStrong: function (t, b, c, d) {
    	if ((t/=d/2) < 1) {
            return c/2*t*t*t*t + b;
        }
        
    	return -c/2 * ((t-=2)*t*t*t - 2) + b;
    },

    /**
     * Snap in elastic effect.
     * @method elasticIn
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @param {Number} a Amplitude (optional)
     * @param {Number} p Period (optional)
     * @return {Number} The computed value for the current animation frame
     */

    elasticIn: function (t, b, c, d, a, p) {
    	if (t == 0) {
            return b;
        }
        if ( (t /= d) == 1 ) {
            return b+c;
        }
        if (!p) {
            p=d*.3;
        }
        
    	if (!a || a < Math.abs(c)) {
            a = c; 
            var s = p/4;
        }
    	else {
            var s = p/(2*Math.PI) * Math.asin (c/a);
        }
        
    	return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
    },

    /**
     * Snap out elastic effect.
     * @method elasticOut
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @param {Number} a Amplitude (optional)
     * @param {Number} p Period (optional)
     * @return {Number} The computed value for the current animation frame
     */
    elasticOut: function (t, b, c, d, a, p) {
    	if (t == 0) {
            return b;
        }
        if ( (t /= d) == 1 ) {
            return b+c;
        }
        if (!p) {
            p=d*.3;
        }
        
    	if (!a || a < Math.abs(c)) {
            a = c;
            var s = p / 4;
        }
    	else {
            var s = p/(2*Math.PI) * Math.asin (c/a);
        }
        
    	return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
    },
    
    /**
     * Snap both elastic effect.
     * @method elasticBoth
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @param {Number} a Amplitude (optional)
     * @param {Number} p Period (optional)
     * @return {Number} The computed value for the current animation frame
     */
    elasticBoth: function (t, b, c, d, a, p) {
    	if (t == 0) {
            return b;
        }
        
        if ( (t /= d/2) == 2 ) {
            return b+c;
        }
        
        if (!p) {
            p = d*(.3*1.5);
        }
        
    	if ( !a || a < Math.abs(c) ) {
            a = c; 
            var s = p/4;
        }
    	else {
            var s = p/(2*Math.PI) * Math.asin (c/a);
        }
        
    	if (t < 1) {
            return -.5*(a*Math.pow(2,10*(t-=1)) * 
                    Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
        }
    	return a*Math.pow(2,-10*(t-=1)) * 
                Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
    },


    /**
     * Backtracks slightly, then reverses direction and moves to end.
     * @method backIn
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @param {Number} s Overshoot (optional)
     * @return {Number} The computed value for the current animation frame
     */
    backIn: function (t, b, c, d, s) {
    	if (typeof s == 'undefined') {
            s = 1.70158;
        }
    	return c*(t/=d)*t*((s+1)*t - s) + b;
    },

    /**
     * Overshoots end, then reverses and comes back to end.
     * @method backOut
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @param {Number} s Overshoot (optional)
     * @return {Number} The computed value for the current animation frame
     */
    backOut: function (t, b, c, d, s) {
    	if (typeof s == 'undefined') {
            s = 1.70158;
        }
    	return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
    },
    
    /**
     * Backtracks slightly, then reverses direction, overshoots end, 
     * then reverses and comes back to end.
     * @method backBoth
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @param {Number} s Overshoot (optional)
     * @return {Number} The computed value for the current animation frame
     */
    backBoth: function (t, b, c, d, s) {
    	if (typeof s == 'undefined') {
            s = 1.70158; 
        }
        
    	if ((t /= d/2 ) < 1) {
            return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
        }
    	return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
    },

    /**
     * Bounce off of start.
     * @method bounceIn
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @return {Number} The computed value for the current animation frame
     */
    bounceIn: function (t, b, c, d) {
    	return c - YAHOO.util.Easing.bounceOut(d-t, 0, c, d) + b;
    },
    
    /**
     * Bounces off end.
     * @method bounceOut
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @return {Number} The computed value for the current animation frame
     */
    bounceOut: function (t, b, c, d) {
    	if ((t/=d) < (1/2.75)) {
    		return c*(7.5625*t*t) + b;
    	} else if (t < (2/2.75)) {
    		return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
    	} else if (t < (2.5/2.75)) {
    		return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
    	}
        return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
    },
    
    /**
     * Bounces off start and end.
     * @method bounceBoth
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @return {Number} The computed value for the current animation frame
     */
    bounceBoth: function (t, b, c, d) {
    	if (t < d/2) {
            return YAHOO.util.Easing.bounceIn(t*2, 0, c, d) * .5 + b;
        }
    	return YAHOO.util.Easing.bounceOut(t*2-d, 0, c, d) * .5 + c*.5 + b;
    }
};

(function() {
/**
 * Anim subclass for moving elements along a path defined by the "points" 
 * member of "attributes".  All "points" are arrays with x, y coordinates.
 * <p>Usage: <code>var myAnim = new YAHOO.util.Motion(el, { points: { to: [800, 800] } }, 1, YAHOO.util.Easing.easeOut);</code></p>
 * @class Motion
 * @namespace YAHOO.util
 * @requires YAHOO.util.Anim
 * @requires YAHOO.util.AnimMgr
 * @requires YAHOO.util.Easing
 * @requires YAHOO.util.Bezier
 * @requires YAHOO.util.Dom
 * @requires YAHOO.util.Event
 * @requires YAHOO.util.CustomEvent 
 * @constructor
 * @extends YAHOO.util.ColorAnim
 * @param {String | HTMLElement} el Reference to the element that will be animated
 * @param {Object} attributes The attribute(s) to be animated.  
 * Each attribute is an object with at minimum a "to" or "by" member defined.  
 * Additional optional members are "from" (defaults to current value), "units" (defaults to "px").  
 * All attribute names use camelCase.
 * @param {Number} duration (optional, defaults to 1 second) Length of animation (frames or seconds), defaults to time-based
 * @param {Function} method (optional, defaults to YAHOO.util.Easing.easeNone) Computes the values that are applied to the attributes per frame (generally a YAHOO.util.Easing method)
 */
    var Motion = function(el, attributes, duration,  method) {
        if (el) { // dont break existing subclasses not using YAHOO.extend
            Motion.superclass.constructor.call(this, el, attributes, duration, method);
        }
    };


    Motion.NAME = 'Motion';

    // shorthand
    var Y = YAHOO.util;
    YAHOO.extend(Motion, Y.ColorAnim);
    
    var superclass = Motion.superclass;
    var proto = Motion.prototype;

    proto.patterns.points = /^points$/i;
    
    proto.setAttribute = function(attr, val, unit) {
        if (  this.patterns.points.test(attr) ) {
            unit = unit || 'px';
            superclass.setAttribute.call(this, 'left', val[0], unit);
            superclass.setAttribute.call(this, 'top', val[1], unit);
        } else {
            superclass.setAttribute.call(this, attr, val, unit);
        }
    };

    proto.getAttribute = function(attr) {
        if (  this.patterns.points.test(attr) ) {
            var val = [
                superclass.getAttribute.call(this, 'left'),
                superclass.getAttribute.call(this, 'top')
            ];
        } else {
            val = superclass.getAttribute.call(this, attr);
        }

        return val;
    };

    proto.doMethod = function(attr, start, end) {
        var val = null;

        if ( this.patterns.points.test(attr) ) {
            var t = this.method(this.currentFrame, 0, 100, this.totalFrames) / 100;				
            val = Y.Bezier.getPosition(this.runtimeAttributes[attr], t);
        } else {
            val = superclass.doMethod.call(this, attr, start, end);
        }
        return val;
    };

    proto.setRuntimeAttribute = function(attr) {
        if ( this.patterns.points.test(attr) ) {
            var el = this.getEl();
            var attributes = this.attributes;
            var start;
            var control = attributes['points']['control'] || [];
            var end;
            var i, len;
            
            if (control.length > 0 && !(control[0] instanceof Array) ) { // could be single point or array of points
                control = [control];
            } else { // break reference to attributes.points.control
                var tmp = []; 
                for (i = 0, len = control.length; i< len; ++i) {
                    tmp[i] = control[i];
                }
                control = tmp;
            }

            if (Y.Dom.getStyle(el, 'position') == 'static') { // default to relative
                Y.Dom.setStyle(el, 'position', 'relative');
            }
    
            if ( isset(attributes['points']['from']) ) {
                Y.Dom.setXY(el, attributes['points']['from']); // set position to from point
            } 
            else { Y.Dom.setXY( el, Y.Dom.getXY(el) ); } // set it to current position
            
            start = this.getAttribute('points'); // get actual top & left
            
            // TO beats BY, per SMIL 2.1 spec
            if ( isset(attributes['points']['to']) ) {
                end = translateValues.call(this, attributes['points']['to'], start);
                
                var pageXY = Y.Dom.getXY(this.getEl());
                for (i = 0, len = control.length; i < len; ++i) {
                    control[i] = translateValues.call(this, control[i], start);
                }

                
            } else if ( isset(attributes['points']['by']) ) {
                end = [ start[0] + attributes['points']['by'][0], start[1] + attributes['points']['by'][1] ];
                
                for (i = 0, len = control.length; i < len; ++i) {
                    control[i] = [ start[0] + control[i][0], start[1] + control[i][1] ];
                }
            }

            this.runtimeAttributes[attr] = [start];
            
            if (control.length > 0) {
                this.runtimeAttributes[attr] = this.runtimeAttributes[attr].concat(control); 
            }

            this.runtimeAttributes[attr][this.runtimeAttributes[attr].length] = end;
        }
        else {
            superclass.setRuntimeAttribute.call(this, attr);
        }
    };
    
    var translateValues = function(val, start) {
        var pageXY = Y.Dom.getXY(this.getEl());
        val = [ val[0] - pageXY[0] + start[0], val[1] - pageXY[1] + start[1] ];

        return val; 
    };
    
    var isset = function(prop) {
        return (typeof prop !== 'undefined');
    };

    Y.Motion = Motion;
})();
(function() {
/**
 * Anim subclass for scrolling elements to a position defined by the "scroll"
 * member of "attributes".  All "scroll" members are arrays with x, y scroll positions.
 * <p>Usage: <code>var myAnim = new YAHOO.util.Scroll(el, { scroll: { to: [0, 800] } }, 1, YAHOO.util.Easing.easeOut);</code></p>
 * @class Scroll
 * @namespace YAHOO.util
 * @requires YAHOO.util.Anim
 * @requires YAHOO.util.AnimMgr
 * @requires YAHOO.util.Easing
 * @requires YAHOO.util.Bezier
 * @requires YAHOO.util.Dom
 * @requires YAHOO.util.Event
 * @requires YAHOO.util.CustomEvent 
 * @extends YAHOO.util.ColorAnim
 * @constructor
 * @param {String or HTMLElement} el Reference to the element that will be animated
 * @param {Object} attributes The attribute(s) to be animated.  
 * Each attribute is an object with at minimum a "to" or "by" member defined.  
 * Additional optional members are "from" (defaults to current value), "units" (defaults to "px").  
 * All attribute names use camelCase.
 * @param {Number} duration (optional, defaults to 1 second) Length of animation (frames or seconds), defaults to time-based
 * @param {Function} method (optional, defaults to YAHOO.util.Easing.easeNone) Computes the values that are applied to the attributes per frame (generally a YAHOO.util.Easing method)
 */
    var Scroll = function(el, attributes, duration,  method) {
        if (el) { // dont break existing subclasses not using YAHOO.extend
            Scroll.superclass.constructor.call(this, el, attributes, duration, method);
        }
    };

    Scroll.NAME = 'Scroll';

    // shorthand
    var Y = YAHOO.util;
    YAHOO.extend(Scroll, Y.ColorAnim);
    
    var superclass = Scroll.superclass;
    var proto = Scroll.prototype;

    proto.doMethod = function(attr, start, end) {
        var val = null;
    
        if (attr == 'scroll') {
            val = [
                this.method(this.currentFrame, start[0], end[0] - start[0], this.totalFrames),
                this.method(this.currentFrame, start[1], end[1] - start[1], this.totalFrames)
            ];
            
        } else {
            val = superclass.doMethod.call(this, attr, start, end);
        }
        return val;
    };

    proto.getAttribute = function(attr) {
        var val = null;
        var el = this.getEl();
        
        if (attr == 'scroll') {
            val = [ el.scrollLeft, el.scrollTop ];
        } else {
            val = superclass.getAttribute.call(this, attr);
        }
        
        return val;
    };

    proto.setAttribute = function(attr, val, unit) {
        var el = this.getEl();
        
        if (attr == 'scroll') {
            el.scrollLeft = val[0];
            el.scrollTop = val[1];
        } else {
            superclass.setAttribute.call(this, attr, val, unit);
        }
    };

    Y.Scroll = Scroll;
})();
YAHOO.register("animation", YAHOO.util.Anim, {version: "2.7.0", build: "1796"});
/*
Copyright (c) 2009, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
version: 2.7.0
*/
/**
 * The drag and drop utility provides a framework for building drag and drop
 * applications.  In addition to enabling drag and drop for specific elements,
 * the drag and drop elements are tracked by the manager class, and the
 * interactions between the various elements are tracked during the drag and
 * the implementing code is notified about these important moments.
 * @module dragdrop
 * @title Drag and Drop
 * @requires yahoo,dom,event
 * @namespace YAHOO.util
 */

// Only load the library once.  Rewriting the manager class would orphan 
// existing drag and drop instances.
if (!YAHOO.util.DragDropMgr) {

/**
 * DragDropMgr is a singleton that tracks the element interaction for 
 * all DragDrop items in the window.  Generally, you will not call 
 * this class directly, but it does have helper methods that could 
 * be useful in your DragDrop implementations.
 * @class DragDropMgr
 * @static
 */
YAHOO.util.DragDropMgr = function() {

    var Event = YAHOO.util.Event,
        Dom = YAHOO.util.Dom;

    return {
        /**
        * This property is used to turn on global use of the shim element on all DragDrop instances, defaults to false for backcompat. (Use: YAHOO.util.DDM.useShim = true)
        * @property useShim
        * @type Boolean
        * @static
        */
        useShim: false,
        /**
        * This property is used to determine if the shim is active over the screen, default false.
        * @private
        * @property _shimActive
        * @type Boolean
        * @static
        */
        _shimActive: false,
        /**
        * This property is used when useShim is set on a DragDrop object to store the current state of DDM.useShim so it can be reset when a drag operation is done.
        * @private
        * @property _shimState
        * @type Boolean
        * @static
        */
        _shimState: false,
        /**
        * This property is used when useShim is set to true, it will set the opacity on the shim to .5 for debugging. Use: (YAHOO.util.DDM._debugShim = true;)
        * @private
        * @property _debugShim
        * @type Boolean
        * @static
        */
        _debugShim: false,
        /**
        * This method will create a shim element (giving it the id of yui-ddm-shim), it also attaches the mousemove and mouseup listeners to it and attaches a scroll listener on the window
        * @private
        * @method _sizeShim
        * @static
        */
        _createShim: function() {
            var s = document.createElement('div');
            s.id = 'yui-ddm-shim';
            if (document.body.firstChild) {
                document.body.insertBefore(s, document.body.firstChild);
            } else {
                document.body.appendChild(s);
            }
            s.style.display = 'none';
            s.style.backgroundColor = 'red';
            s.style.position = 'absolute';
            s.style.zIndex = '99999';
            Dom.setStyle(s, 'opacity', '0');
            this._shim = s;
            Event.on(s, "mouseup",   this.handleMouseUp, this, true);
            Event.on(s, "mousemove", this.handleMouseMove, this, true);
            Event.on(window, 'scroll', this._sizeShim, this, true);
        },
        /**
        * This method will size the shim, called from activate and on window scroll event
        * @private
        * @method _sizeShim
        * @static
        */
        _sizeShim: function() {
            if (this._shimActive) {
                var s = this._shim;
                s.style.height = Dom.getDocumentHeight() + 'px';
                s.style.width = Dom.getDocumentWidth() + 'px';
                s.style.top = '0';
                s.style.left = '0';
            }
        },
        /**
        * This method will create the shim element if needed, then show the shim element, size the element and set the _shimActive property to true
        * @private
        * @method _activateShim
        * @static
        */
        _activateShim: function() {
            if (this.useShim) {
                if (!this._shim) {
                    this._createShim();
                }
                this._shimActive = true;
                var s = this._shim,
                    o = '0';
                if (this._debugShim) {
                    o = '.5';
                }
                Dom.setStyle(s, 'opacity', o);
                this._sizeShim();
                s.style.display = 'block';
            }
        },
        /**
        * This method will hide the shim element and set the _shimActive property to false
        * @private
        * @method _deactivateShim
        * @static
        */
        _deactivateShim: function() {
            this._shim.style.display = 'none';
            this._shimActive = false;
        },
        /**
        * The HTML element created to use as a shim over the document to track mouse movements
        * @private
        * @property _shim
        * @type HTMLElement
        * @static
        */
        _shim: null,
        /**
         * Two dimensional Array of registered DragDrop objects.  The first 
         * dimension is the DragDrop item group, the second the DragDrop 
         * object.
         * @property ids
         * @type {string: string}
         * @private
         * @static
         */
        ids: {},

        /**
         * Array of element ids defined as drag handles.  Used to determine 
         * if the element that generated the mousedown event is actually the 
         * handle and not the html element itself.
         * @property handleIds
         * @type {string: string}
         * @private
         * @static
         */
        handleIds: {},

        /**
         * the DragDrop object that is currently being dragged
         * @property dragCurrent
         * @type DragDrop
         * @private
         * @static
         **/
        dragCurrent: null,

        /**
         * the DragDrop object(s) that are being hovered over
         * @property dragOvers
         * @type Array
         * @private
         * @static
         */
        dragOvers: {},

        /**
         * the X distance between the cursor and the object being dragged
         * @property deltaX
         * @type int
         * @private
         * @static
         */
        deltaX: 0,

        /**
         * the Y distance between the cursor and the object being dragged
         * @property deltaY
         * @type int
         * @private
         * @static
         */
        deltaY: 0,

        /**
         * Flag to determine if we should prevent the default behavior of the
         * events we define. By default this is true, but this can be set to 
         * false if you need the default behavior (not recommended)
         * @property preventDefault
         * @type boolean
         * @static
         */
        preventDefault: true,

        /**
         * Flag to determine if we should stop the propagation of the events 
         * we generate. This is true by default but you may want to set it to
         * false if the html element contains other features that require the
         * mouse click.
         * @property stopPropagation
         * @type boolean
         * @static
         */
        stopPropagation: true,

        /**
         * Internal flag that is set to true when drag and drop has been
         * initialized
         * @property initialized
         * @private
         * @static
         */
        initialized: false,

        /**
         * All drag and drop can be disabled.
         * @property locked
         * @private
         * @static
         */
        locked: false,

        /**
         * Provides additional information about the the current set of
         * interactions.  Can be accessed from the event handlers. It
         * contains the following properties:
         *
         *       out:       onDragOut interactions
         *       enter:     onDragEnter interactions
         *       over:      onDragOver interactions
         *       drop:      onDragDrop interactions
         *       point:     The location of the cursor
         *       draggedRegion: The location of dragged element at the time
         *                      of the interaction
         *       sourceRegion: The location of the source elemtn at the time
         *                     of the interaction
         *       validDrop: boolean
         * @property interactionInfo
         * @type object
         * @static
         */
        interactionInfo: null,

        /**
         * Called the first time an element is registered.
         * @method init
         * @private
         * @static
         */
        init: function() {
            this.initialized = true;
        },

        /**
         * In point mode, drag and drop interaction is defined by the 
         * location of the cursor during the drag/drop
         * @property POINT
         * @type int
         * @static
         * @final
         */
        POINT: 0,

        /**
         * In intersect mode, drag and drop interaction is defined by the 
         * cursor position or the amount of overlap of two or more drag and 
         * drop objects.
         * @property INTERSECT
         * @type int
         * @static
         * @final
         */
        INTERSECT: 1,

        /**
         * In intersect mode, drag and drop interaction is defined only by the 
         * overlap of two or more drag and drop objects.
         * @property STRICT_INTERSECT
         * @type int
         * @static
         * @final
         */
        STRICT_INTERSECT: 2,

        /**
         * The current drag and drop mode.  Default: POINT
         * @property mode
         * @type int
         * @static
         */
        mode: 0,

        /**
         * Runs method on all drag and drop objects
         * @method _execOnAll
         * @private
         * @static
         */
        _execOnAll: function(sMethod, args) {
            for (var i in this.ids) {
                for (var j in this.ids[i]) {
                    var oDD = this.ids[i][j];
                    if (! this.isTypeOfDD(oDD)) {
                        continue;
                    }
                    oDD[sMethod].apply(oDD, args);
                }
            }
        },

        /**
         * Drag and drop initialization.  Sets up the global event handlers
         * @method _onLoad
         * @private
         * @static
         */
        _onLoad: function() {

            this.init();

            Event.on(document, "mouseup",   this.handleMouseUp, this, true);
            Event.on(document, "mousemove", this.handleMouseMove, this, true);
            Event.on(window,   "unload",    this._onUnload, this, true);
            Event.on(window,   "resize",    this._onResize, this, true);
            // Event.on(window,   "mouseout",    this._test);

        },

        /**
         * Reset constraints on all drag and drop objs
         * @method _onResize
         * @private
         * @static
         */
        _onResize: function(e) {
            this._execOnAll("resetConstraints", []);
        },

        /**
         * Lock all drag and drop functionality
         * @method lock
         * @static
         */
        lock: function() { this.locked = true; },

        /**
         * Unlock all drag and drop functionality
         * @method unlock
         * @static
         */
        unlock: function() { this.locked = false; },

        /**
         * Is drag and drop locked?
         * @method isLocked
         * @return {boolean} True if drag and drop is locked, false otherwise.
         * @static
         */
        isLocked: function() { return this.locked; },

        /**
         * Location cache that is set for all drag drop objects when a drag is
         * initiated, cleared when the drag is finished.
         * @property locationCache
         * @private
         * @static
         */
        locationCache: {},

        /**
         * Set useCache to false if you want to force object the lookup of each
         * drag and drop linked element constantly during a drag.
         * @property useCache
         * @type boolean
         * @static
         */
        useCache: true,

        /**
         * The number of pixels that the mouse needs to move after the 
         * mousedown before the drag is initiated.  Default=3;
         * @property clickPixelThresh
         * @type int
         * @static
         */
        clickPixelThresh: 3,

        /**
         * The number of milliseconds after the mousedown event to initiate the
         * drag if we don't get a mouseup event. Default=1000
         * @property clickTimeThresh
         * @type int
         * @static
         */
        clickTimeThresh: 1000,

        /**
         * Flag that indicates that either the drag pixel threshold or the 
         * mousdown time threshold has been met
         * @property dragThreshMet
         * @type boolean
         * @private
         * @static
         */
        dragThreshMet: false,

        /**
         * Timeout used for the click time threshold
         * @property clickTimeout
         * @type Object
         * @private
         * @static
         */
        clickTimeout: null,

        /**
         * The X position of the mousedown event stored for later use when a 
         * drag threshold is met.
         * @property startX
         * @type int
         * @private
         * @static
         */
        startX: 0,

        /**
         * The Y position of the mousedown event stored for later use when a 
         * drag threshold is met.
         * @property startY
         * @type int
         * @private
         * @static
         */
        startY: 0,

        /**
         * Flag to determine if the drag event was fired from the click timeout and
         * not the mouse move threshold.
         * @property fromTimeout
         * @type boolean
         * @private
         * @static
         */
        fromTimeout: false,

        /**
         * Each DragDrop instance must be registered with the DragDropMgr.  
         * This is executed in DragDrop.init()
         * @method regDragDrop
         * @param {DragDrop} oDD the DragDrop object to register
         * @param {String} sGroup the name of the group this element belongs to
         * @static
         */
        regDragDrop: function(oDD, sGroup) {
            if (!this.initialized) { this.init(); }
            
            if (!this.ids[sGroup]) {
                this.ids[sGroup] = {};
            }
            this.ids[sGroup][oDD.id] = oDD;
        },

        /**
         * Removes the supplied dd instance from the supplied group. Executed
         * by DragDrop.removeFromGroup, so don't call this function directly.
         * @method removeDDFromGroup
         * @private
         * @static
         */
        removeDDFromGroup: function(oDD, sGroup) {
            if (!this.ids[sGroup]) {
                this.ids[sGroup] = {};
            }

            var obj = this.ids[sGroup];
            if (obj && obj[oDD.id]) {
                delete obj[oDD.id];
            }
        },

        /**
         * Unregisters a drag and drop item.  This is executed in 
         * DragDrop.unreg, use that method instead of calling this directly.
         * @method _remove
         * @private
         * @static
         */
        _remove: function(oDD) {
            for (var g in oDD.groups) {
                if (g) {
                    var item = this.ids[g];
                    if (item && item[oDD.id]) {
                        delete item[oDD.id];
                    }
                }
                
            }
            delete this.handleIds[oDD.id];
        },

        /**
         * Each DragDrop handle element must be registered.  This is done
         * automatically when executing DragDrop.setHandleElId()
         * @method regHandle
         * @param {String} sDDId the DragDrop id this element is a handle for
         * @param {String} sHandleId the id of the element that is the drag 
         * handle
         * @static
         */
        regHandle: function(sDDId, sHandleId) {
            if (!this.handleIds[sDDId]) {
                this.handleIds[sDDId] = {};
            }
            this.handleIds[sDDId][sHandleId] = sHandleId;
        },

        /**
         * Utility function to determine if a given element has been 
         * registered as a drag drop item.
         * @method isDragDrop
         * @param {String} id the element id to check
         * @return {boolean} true if this element is a DragDrop item, 
         * false otherwise
         * @static
         */
        isDragDrop: function(id) {
            return ( this.getDDById(id) ) ? true : false;
        },

        /**
         * Returns the drag and drop instances that are in all groups the
         * passed in instance belongs to.
         * @method getRelated
         * @param {DragDrop} p_oDD the obj to get related data for
         * @param {boolean} bTargetsOnly if true, only return targetable objs
         * @return {DragDrop[]} the related instances
         * @static
         */
        getRelated: function(p_oDD, bTargetsOnly) {
            var oDDs = [];
            for (var i in p_oDD.groups) {
                for (var j in this.ids[i]) {
                    var dd = this.ids[i][j];
                    if (! this.isTypeOfDD(dd)) {
                        continue;
                    }
                    if (!bTargetsOnly || dd.isTarget) {
                        oDDs[oDDs.length] = dd;
                    }
                }
            }

            return oDDs;
        },

        /**
         * Returns true if the specified dd target is a legal target for 
         * the specifice drag obj
         * @method isLegalTarget
         * @param {DragDrop} the drag obj
         * @param {DragDrop} the target
         * @return {boolean} true if the target is a legal target for the 
         * dd obj
         * @static
         */
        isLegalTarget: function (oDD, oTargetDD) {
            var targets = this.getRelated(oDD, true);
            for (var i=0, len=targets.length;i<len;++i) {
                if (targets[i].id == oTargetDD.id) {
                    return true;
                }
            }

            return false;
        },

        /**
         * My goal is to be able to transparently determine if an object is
         * typeof DragDrop, and the exact subclass of DragDrop.  typeof 
         * returns "object", oDD.constructor.toString() always returns
         * "DragDrop" and not the name of the subclass.  So for now it just
         * evaluates a well-known variable in DragDrop.
         * @method isTypeOfDD
         * @param {Object} the object to evaluate
         * @return {boolean} true if typeof oDD = DragDrop
         * @static
         */
        isTypeOfDD: function (oDD) {
            return (oDD && oDD.__ygDragDrop);
        },

        /**
         * Utility function to determine if a given element has been 
         * registered as a drag drop handle for the given Drag Drop object.
         * @method isHandle
         * @param {String} id the element id to check
         * @return {boolean} true if this element is a DragDrop handle, false 
         * otherwise
         * @static
         */
        isHandle: function(sDDId, sHandleId) {
            return ( this.handleIds[sDDId] && 
                            this.handleIds[sDDId][sHandleId] );
        },

        /**
         * Returns the DragDrop instance for a given id
         * @method getDDById
         * @param {String} id the id of the DragDrop object
         * @return {DragDrop} the drag drop object, null if it is not found
         * @static
         */
        getDDById: function(id) {
            for (var i in this.ids) {
                if (this.ids[i][id]) {
                    return this.ids[i][id];
                }
            }
            return null;
        },

        /**
         * Fired after a registered DragDrop object gets the mousedown event.
         * Sets up the events required to track the object being dragged
         * @method handleMouseDown
         * @param {Event} e the event
         * @param oDD the DragDrop object being dragged
         * @private
         * @static
         */
        handleMouseDown: function(e, oDD) {
            //this._activateShim();

            this.currentTarget = YAHOO.util.Event.getTarget(e);

            this.dragCurrent = oDD;

            var el = oDD.getEl();

            // track start position
            this.startX = YAHOO.util.Event.getPageX(e);
            this.startY = YAHOO.util.Event.getPageY(e);

            this.deltaX = this.startX - el.offsetLeft;
            this.deltaY = this.startY - el.offsetTop;

            this.dragThreshMet = false;

            this.clickTimeout = setTimeout( 
                    function() { 
                        var DDM = YAHOO.util.DDM;
                        DDM.startDrag(DDM.startX, DDM.startY);
                        DDM.fromTimeout = true;
                    }, 
                    this.clickTimeThresh );
        },

        /**
         * Fired when either the drag pixel threshold or the mousedown hold 
         * time threshold has been met.
         * @method startDrag
         * @param x {int} the X position of the original mousedown
         * @param y {int} the Y position of the original mousedown
         * @static
         */
        startDrag: function(x, y) {
            if (this.dragCurrent && this.dragCurrent.useShim) {
                this._shimState = this.useShim;
                this.useShim = true;
            }
            this._activateShim();
            clearTimeout(this.clickTimeout);
            var dc = this.dragCurrent;
            if (dc && dc.events.b4StartDrag) {
                dc.b4StartDrag(x, y);
                dc.fireEvent('b4StartDragEvent', { x: x, y: y });
            }
            if (dc && dc.events.startDrag) {
                dc.startDrag(x, y);
                dc.fireEvent('startDragEvent', { x: x, y: y });
            }
            this.dragThreshMet = true;
        },

        /**
         * Internal function to handle the mouseup event.  Will be invoked 
         * from the context of the document.
         * @method handleMouseUp
         * @param {Event} e the event
         * @private
         * @static
         */
        handleMouseUp: function(e) {
            if (this.dragCurrent) {
                clearTimeout(this.clickTimeout);

                if (this.dragThreshMet) {
                    if (this.fromTimeout) {
                        this.fromTimeout = false;
                        this.handleMouseMove(e);
                    }
                    this.fromTimeout = false;
                    this.fireEvents(e, true);
                } else {
                }

                this.stopDrag(e);

                this.stopEvent(e);
            }
        },

        /**
         * Utility to stop event propagation and event default, if these 
         * features are turned on.
         * @method stopEvent
         * @param {Event} e the event as returned by this.getEvent()
         * @static
         */
        stopEvent: function(e) {
            if (this.stopPropagation) {
                YAHOO.util.Event.stopPropagation(e);
            }

            if (this.preventDefault) {
                YAHOO.util.Event.preventDefault(e);
            }
        },

        /** 
         * Ends the current drag, cleans up the state, and fires the endDrag
         * and mouseUp events.  Called internally when a mouseup is detected
         * during the drag.  Can be fired manually during the drag by passing
         * either another event (such as the mousemove event received in onDrag)
         * or a fake event with pageX and pageY defined (so that endDrag and
         * onMouseUp have usable position data.).  Alternatively, pass true
         * for the silent parameter so that the endDrag and onMouseUp events
         * are skipped (so no event data is needed.)
         *
         * @method stopDrag
         * @param {Event} e the mouseup event, another event (or a fake event) 
         *                  with pageX and pageY defined, or nothing if the 
         *                  silent parameter is true
         * @param {boolean} silent skips the enddrag and mouseup events if true
         * @static
         */
        stopDrag: function(e, silent) {
            var dc = this.dragCurrent;
            // Fire the drag end event for the item that was dragged
            if (dc && !silent) {
                if (this.dragThreshMet) {
                    if (dc.events.b4EndDrag) {
                        dc.b4EndDrag(e);
                        dc.fireEvent('b4EndDragEvent', { e: e });
                    }
                    if (dc.events.endDrag) {
                        dc.endDrag(e);
                        dc.fireEvent('endDragEvent', { e: e });
                    }
                }
                if (dc.events.mouseUp) {
                    dc.onMouseUp(e);
                    dc.fireEvent('mouseUpEvent', { e: e });
                }
            }

            if (this._shimActive) {
                this._deactivateShim();
                if (this.dragCurrent && this.dragCurrent.useShim) {
                    this.useShim = this._shimState;
                    this._shimState = false;
                }
            }

            this.dragCurrent = null;
            this.dragOvers = {};
        },

        /** 
         * Internal function to handle the mousemove event.  Will be invoked 
         * from the context of the html element.
         *
         * @TODO figure out what we can do about mouse events lost when the 
         * user drags objects beyond the window boundary.  Currently we can 
         * detect this in internet explorer by verifying that the mouse is 
         * down during the mousemove event.  Firefox doesn't give us the 
         * button state on the mousemove event.
         * @method handleMouseMove
         * @param {Event} e the event
         * @private
         * @static
         */
        handleMouseMove: function(e) {

            var dc = this.dragCurrent;
            if (dc) {

                // var button = e.which || e.button;

                // check for IE mouseup outside of page boundary
                if (YAHOO.util.Event.isIE && !e.button) {
                    this.stopEvent(e);
                    return this.handleMouseUp(e);
                } else {
                    if (e.clientX < 0 || e.clientY < 0) {
                        //This will stop the element from leaving the viewport in FF, Opera & Safari
                        //Not turned on yet
                        //this.stopEvent(e);
                        //return false;
                    }
                }

                if (!this.dragThreshMet) {
                    var diffX = Math.abs(this.startX - YAHOO.util.Event.getPageX(e));
                    var diffY = Math.abs(this.startY - YAHOO.util.Event.getPageY(e));
                    if (diffX > this.clickPixelThresh || 
                                diffY > this.clickPixelThresh) {
                        this.startDrag(this.startX, this.startY);
                    }
                }

                if (this.dragThreshMet) {
                    if (dc && dc.events.b4Drag) {
                        dc.b4Drag(e);
                        dc.fireEvent('b4DragEvent', { e: e});
                    }
                    if (dc && dc.events.drag) {
                        dc.onDrag(e);
                        dc.fireEvent('dragEvent', { e: e});
                    }
                    if (dc) {
                        this.fireEvents(e, false);
                    }
                }

                this.stopEvent(e);
            }
        },
        
        /**
         * Iterates over all of the DragDrop elements to find ones we are 
         * hovering over or dropping on
         * @method fireEvents
         * @param {Event} e the event
         * @param {boolean} isDrop is this a drop op or a mouseover op?
         * @private
         * @static
         */
        fireEvents: function(e, isDrop) {
            var dc = this.dragCurrent;

            // If the user did the mouse up outside of the window, we could 
            // get here even though we have ended the drag.
            // If the config option dragOnly is true, bail out and don't fire the events
            if (!dc || dc.isLocked() || dc.dragOnly) {
                return;
            }

            var x = YAHOO.util.Event.getPageX(e),
                y = YAHOO.util.Event.getPageY(e),
                pt = new YAHOO.util.Point(x,y),
                pos = dc.getTargetCoord(pt.x, pt.y),
                el = dc.getDragEl(),
                events = ['out', 'over', 'drop', 'enter'],
                curRegion = new YAHOO.util.Region( pos.y, 
                                               pos.x + el.offsetWidth,
                                               pos.y + el.offsetHeight, 
                                               pos.x ),
            
                oldOvers = [], // cache the previous dragOver array
                inGroupsObj  = {},
                inGroups  = [],
                data = {
                    outEvts: [],
                    overEvts: [],
                    dropEvts: [],
                    enterEvts: []
                };


            // Check to see if the object(s) we were hovering over is no longer 
            // being hovered over so we can fire the onDragOut event
            for (var i in this.dragOvers) {

                var ddo = this.dragOvers[i];

                if (! this.isTypeOfDD(ddo)) {
                    continue;
                }
                if (! this.isOverTarget(pt, ddo, this.mode, curRegion)) {
                    data.outEvts.push( ddo );
                }

                oldOvers[i] = true;
                delete this.dragOvers[i];
            }

            for (var sGroup in dc.groups) {
                
                if ("string" != typeof sGroup) {
                    continue;
                }

                for (i in this.ids[sGroup]) {
                    var oDD = this.ids[sGroup][i];
                    if (! this.isTypeOfDD(oDD)) {
                        continue;
                    }

                    if (oDD.isTarget && !oDD.isLocked() && oDD != dc) {
                        if (this.isOverTarget(pt, oDD, this.mode, curRegion)) {
                            inGroupsObj[sGroup] = true;
                            // look for drop interactions
                            if (isDrop) {
                                data.dropEvts.push( oDD );
                            // look for drag enter and drag over interactions
                            } else {

                                // initial drag over: dragEnter fires
                                if (!oldOvers[oDD.id]) {
                                    data.enterEvts.push( oDD );
                                // subsequent drag overs: dragOver fires
                                } else {
                                    data.overEvts.push( oDD );
                                }

                                this.dragOvers[oDD.id] = oDD;
                            }
                        }
                    }
                }
            }

            this.interactionInfo = {
                out:       data.outEvts,
                enter:     data.enterEvts,
                over:      data.overEvts,
                drop:      data.dropEvts,
                point:     pt,
                draggedRegion:    curRegion,
                sourceRegion: this.locationCache[dc.id],
                validDrop: isDrop
            };

            
            for (var inG in inGroupsObj) {
                inGroups.push(inG);
            }

            // notify about a drop that did not find a target
            if (isDrop && !data.dropEvts.length) {
                this.interactionInfo.validDrop = false;
                if (dc.events.invalidDrop) {
                    dc.onInvalidDrop(e);
                    dc.fireEvent('invalidDropEvent', { e: e });
                }
            }
            for (i = 0; i < events.length; i++) {
                var tmp = null;
                if (data[events[i] + 'Evts']) {
                    tmp = data[events[i] + 'Evts'];
                }
                if (tmp && tmp.length) {
                    var type = events[i].charAt(0).toUpperCase() + events[i].substr(1),
                        ev = 'onDrag' + type,
                        b4 = 'b4Drag' + type,
                        cev = 'drag' + type + 'Event',
                        check = 'drag' + type;
                    if (this.mode) {
                        if (dc.events[b4]) {
                            dc[b4](e, tmp, inGroups);
                            dc.fireEvent(b4 + 'Event', { event: e, info: tmp, group: inGroups });
                            
                        }
                        if (dc.events[check]) {
                            dc[ev](e, tmp, inGroups);
                            dc.fireEvent(cev, { event: e, info: tmp, group: inGroups });
                        }
                    } else {
                        for (var b = 0, len = tmp.length; b < len; ++b) {
                            if (dc.events[b4]) {
                                dc[b4](e, tmp[b].id, inGroups[0]);
                                dc.fireEvent(b4 + 'Event', { event: e, info: tmp[b].id, group: inGroups[0] });
                            }
                            if (dc.events[check]) {
                                dc[ev](e, tmp[b].id, inGroups[0]);
                                dc.fireEvent(cev, { event: e, info: tmp[b].id, group: inGroups[0] });
                            }
                        }
                    }
                }
            }
        },

        /**
         * Helper function for getting the best match from the list of drag 
         * and drop objects returned by the drag and drop events when we are 
         * in INTERSECT mode.  It returns either the first object that the 
         * cursor is over, or the object that has the greatest overlap with 
         * the dragged element.
         * @method getBestMatch
         * @param  {DragDrop[]} dds The array of drag and drop objects 
         * targeted
         * @return {DragDrop}       The best single match
         * @static
         */
        getBestMatch: function(dds) {
            var winner = null;

            var len = dds.length;

            if (len == 1) {
                winner = dds[0];
            } else {
                // Loop through the targeted items
                for (var i=0; i<len; ++i) {
                    var dd = dds[i];
                    // If the cursor is over the object, it wins.  If the 
                    // cursor is over multiple matches, the first one we come
                    // to wins.
                    if (this.mode == this.INTERSECT && dd.cursorIsOver) {
                        winner = dd;
                        break;
                    // Otherwise the object with the most overlap wins
                    } else {
                        if (!winner || !winner.overlap || (dd.overlap &&
                            winner.overlap.getArea() < dd.overlap.getArea())) {
                            winner = dd;
                        }
                    }
                }
            }

            return winner;
        },

        /**
         * Refreshes the cache of the top-left and bottom-right points of the 
         * drag and drop objects in the specified group(s).  This is in the
         * format that is stored in the drag and drop instance, so typical 
         * usage is:
         * <code>
         * YAHOO.util.DragDropMgr.refreshCache(ddinstance.groups);
         * </code>
         * Alternatively:
         * <code>
         * YAHOO.util.DragDropMgr.refreshCache({group1:true, group2:true});
         * </code>
         * @TODO this really should be an indexed array.  Alternatively this
         * method could accept both.
         * @method refreshCache
         * @param {Object} groups an associative array of groups to refresh
         * @static
         */
        refreshCache: function(groups) {

            // refresh everything if group array is not provided
            var g = groups || this.ids;

            for (var sGroup in g) {
                if ("string" != typeof sGroup) {
                    continue;
                }
                for (var i in this.ids[sGroup]) {
                    var oDD = this.ids[sGroup][i];

                    if (this.isTypeOfDD(oDD)) {
                        var loc = this.getLocation(oDD);
                        if (loc) {
                            this.locationCache[oDD.id] = loc;
                        } else {
                            delete this.locationCache[oDD.id];
                        }
                    }
                }
            }
        },

        /**
         * This checks to make sure an element exists and is in the DOM.  The
         * main purpose is to handle cases where innerHTML is used to remove
         * drag and drop objects from the DOM.  IE provides an 'unspecified
         * error' when trying to access the offsetParent of such an element
         * @method verifyEl
         * @param {HTMLElement} el the element to check
         * @return {boolean} true if the element looks usable
         * @static
         */
        verifyEl: function(el) {
            try {
                if (el) {
                    var parent = el.offsetParent;
                    if (parent) {
                        return true;
                    }
                }
            } catch(e) {
            }

            return false;
        },
        
        /**
         * Returns a Region object containing the drag and drop element's position
         * and size, including the padding configured for it
         * @method getLocation
         * @param {DragDrop} oDD the drag and drop object to get the 
         *                       location for
         * @return {YAHOO.util.Region} a Region object representing the total area
         *                             the element occupies, including any padding
         *                             the instance is configured for.
         * @static
         */
        getLocation: function(oDD) {
            if (! this.isTypeOfDD(oDD)) {
                return null;
            }

            var el = oDD.getEl(), pos, x1, x2, y1, y2, t, r, b, l;

            try {
                pos= YAHOO.util.Dom.getXY(el);
            } catch (e) { }

            if (!pos) {
                return null;
            }

            x1 = pos[0];
            x2 = x1 + el.offsetWidth;
            y1 = pos[1];
            y2 = y1 + el.offsetHeight;

            t = y1 - oDD.padding[0];
            r = x2 + oDD.padding[1];
            b = y2 + oDD.padding[2];
            l = x1 - oDD.padding[3];

            return new YAHOO.util.Region( t, r, b, l );
        },

        /**
         * Checks the cursor location to see if it over the target
         * @method isOverTarget
         * @param {YAHOO.util.Point} pt The point to evaluate
         * @param {DragDrop} oTarget the DragDrop object we are inspecting
         * @param {boolean} intersect true if we are in intersect mode
         * @param {YAHOO.util.Region} pre-cached location of the dragged element
         * @return {boolean} true if the mouse is over the target
         * @private
         * @static
         */
        isOverTarget: function(pt, oTarget, intersect, curRegion) {
            // use cache if available
            var loc = this.locationCache[oTarget.id];
            if (!loc || !this.useCache) {
                loc = this.getLocation(oTarget);
                this.locationCache[oTarget.id] = loc;

            }

            if (!loc) {
                return false;
            }

            oTarget.cursorIsOver = loc.contains( pt );

            // DragDrop is using this as a sanity check for the initial mousedown
            // in this case we are done.  In POINT mode, if the drag obj has no
            // contraints, we are done. Otherwise we need to evaluate the 
            // region the target as occupies to determine if the dragged element
            // overlaps with it.
            
            var dc = this.dragCurrent;
            if (!dc || (!intersect && !dc.constrainX && !dc.constrainY)) {

                //if (oTarget.cursorIsOver) {
                //}
                return oTarget.cursorIsOver;
            }

            oTarget.overlap = null;


            // Get the current location of the drag element, this is the
            // location of the mouse event less the delta that represents
            // where the original mousedown happened on the element.  We
            // need to consider constraints and ticks as well.

            if (!curRegion) {
                var pos = dc.getTargetCoord(pt.x, pt.y);
                var el = dc.getDragEl();
                curRegion = new YAHOO.util.Region( pos.y, 
                                                   pos.x + el.offsetWidth,
                                                   pos.y + el.offsetHeight, 
                                                   pos.x );
            }

            var overlap = curRegion.intersect(loc);

            if (overlap) {
                oTarget.overlap = overlap;
                return (intersect) ? true : oTarget.cursorIsOver;
            } else {
                return false;
            }
        },

        /**
         * unload event handler
         * @method _onUnload
         * @private
         * @static
         */
        _onUnload: function(e, me) {
            this.unregAll();
        },

        /**
         * Cleans up the drag and drop events and objects.
         * @method unregAll
         * @private
         * @static
         */
        unregAll: function() {

            if (this.dragCurrent) {
                this.stopDrag();
                this.dragCurrent = null;
            }

            this._execOnAll("unreg", []);

            //for (var i in this.elementCache) {
                //delete this.elementCache[i];
            //}
            //this.elementCache = {};

            this.ids = {};
        },

        /**
         * A cache of DOM elements
         * @property elementCache
         * @private
         * @static
         * @deprecated elements are not cached now
         */
        elementCache: {},
        
        /**
         * Get the wrapper for the DOM element specified
         * @method getElWrapper
         * @param {String} id the id of the element to get
         * @return {YAHOO.util.DDM.ElementWrapper} the wrapped element
         * @private
         * @deprecated This wrapper isn't that useful
         * @static
         */
        getElWrapper: function(id) {
            var oWrapper = this.elementCache[id];
            if (!oWrapper || !oWrapper.el) {
                oWrapper = this.elementCache[id] = 
                    new this.ElementWrapper(YAHOO.util.Dom.get(id));
            }
            return oWrapper;
        },

        /**
         * Returns the actual DOM element
         * @method getElement
         * @param {String} id the id of the elment to get
         * @return {Object} The element
         * @deprecated use YAHOO.util.Dom.get instead
         * @static
         */
        getElement: function(id) {
            return YAHOO.util.Dom.get(id);
        },
        
        /**
         * Returns the style property for the DOM element (i.e., 
         * document.getElById(id).style)
         * @method getCss
         * @param {String} id the id of the elment to get
         * @return {Object} The style property of the element
         * @deprecated use YAHOO.util.Dom instead
         * @static
         */
        getCss: function(id) {
            var el = YAHOO.util.Dom.get(id);
            return (el) ? el.style : null;
        },

        /**
         * Inner class for cached elements
         * @class DragDropMgr.ElementWrapper
         * @for DragDropMgr
         * @private
         * @deprecated
         */
        ElementWrapper: function(el) {
                /**
                 * The element
                 * @property el
                 */
                this.el = el || null;
                /**
                 * The element id
                 * @property id
                 */
                this.id = this.el && el.id;
                /**
                 * A reference to the style property
                 * @property css
                 */
                this.css = this.el && el.style;
            },

        /**
         * Returns the X position of an html element
         * @method getPosX
         * @param el the element for which to get the position
         * @return {int} the X coordinate
         * @for DragDropMgr
         * @deprecated use YAHOO.util.Dom.getX instead
         * @static
         */
        getPosX: function(el) {
            return YAHOO.util.Dom.getX(el);
        },

        /**
         * Returns the Y position of an html element
         * @method getPosY
         * @param el the element for which to get the position
         * @return {int} the Y coordinate
         * @deprecated use YAHOO.util.Dom.getY instead
         * @static
         */
        getPosY: function(el) {
            return YAHOO.util.Dom.getY(el); 
        },

        /**
         * Swap two nodes.  In IE, we use the native method, for others we 
         * emulate the IE behavior
         * @method swapNode
         * @param n1 the first node to swap
         * @param n2 the other node to swap
         * @static
         */
        swapNode: function(n1, n2) {
            if (n1.swapNode) {
                n1.swapNode(n2);
            } else {
                var p = n2.parentNode;
                var s = n2.nextSibling;

                if (s == n1) {
                    p.insertBefore(n1, n2);
                } else if (n2 == n1.nextSibling) {
                    p.insertBefore(n2, n1);
                } else {
                    n1.parentNode.replaceChild(n2, n1);
                    p.insertBefore(n1, s);
                }
            }
        },

        /**
         * Returns the current scroll position
         * @method getScroll
         * @private
         * @static
         */
        getScroll: function () {
            var t, l, dde=document.documentElement, db=document.body;
            if (dde && (dde.scrollTop || dde.scrollLeft)) {
                t = dde.scrollTop;
                l = dde.scrollLeft;
            } else if (db) {
                t = db.scrollTop;
                l = db.scrollLeft;
            } else {
            }
            return { top: t, left: l };
        },

        /**
         * Returns the specified element style property
         * @method getStyle
         * @param {HTMLElement} el          the element
         * @param {string}      styleProp   the style property
         * @return {string} The value of the style property
         * @deprecated use YAHOO.util.Dom.getStyle
         * @static
         */
        getStyle: function(el, styleProp) {
            return YAHOO.util.Dom.getStyle(el, styleProp);
        },

        /**
         * Gets the scrollTop
         * @method getScrollTop
         * @return {int} the document's scrollTop
         * @static
         */
        getScrollTop: function () { return this.getScroll().top; },

        /**
         * Gets the scrollLeft
         * @method getScrollLeft
         * @return {int} the document's scrollTop
         * @static
         */
        getScrollLeft: function () { return this.getScroll().left; },

        /**
         * Sets the x/y position of an element to the location of the
         * target element.
         * @method moveToEl
         * @param {HTMLElement} moveEl      The element to move
         * @param {HTMLElement} targetEl    The position reference element
         * @static
         */
        moveToEl: function (moveEl, targetEl) {
            var aCoord = YAHOO.util.Dom.getXY(targetEl);
            YAHOO.util.Dom.setXY(moveEl, aCoord);
        },

        /**
         * Gets the client height
         * @method getClientHeight
         * @return {int} client height in px
         * @deprecated use YAHOO.util.Dom.getViewportHeight instead
         * @static
         */
        getClientHeight: function() {
            return YAHOO.util.Dom.getViewportHeight();
        },

        /**
         * Gets the client width
         * @method getClientWidth
         * @return {int} client width in px
         * @deprecated use YAHOO.util.Dom.getViewportWidth instead
         * @static
         */
        getClientWidth: function() {
            return YAHOO.util.Dom.getViewportWidth();
        },

        /**
         * Numeric array sort function
         * @method numericSort
         * @static
         */
        numericSort: function(a, b) { return (a - b); },

        /**
         * Internal counter
         * @property _timeoutCount
         * @private
         * @static
         */
        _timeoutCount: 0,

        /**
         * Trying to make the load order less important.  Without this we get
         * an error if this file is loaded before the Event Utility.
         * @method _addListeners
         * @private
         * @static
         */
        _addListeners: function() {
            var DDM = YAHOO.util.DDM;
            if ( YAHOO.util.Event && document ) {
                DDM._onLoad();
            } else {
                if (DDM._timeoutCount > 2000) {
                } else {
                    setTimeout(DDM._addListeners, 10);
                    if (document && document.body) {
                        DDM._timeoutCount += 1;
                    }
                }
            }
        },

        /**
         * Recursively searches the immediate parent and all child nodes for 
         * the handle element in order to determine wheter or not it was 
         * clicked.
         * @method handleWasClicked
         * @param node the html element to inspect
         * @static
         */
        handleWasClicked: function(node, id) {
            if (this.isHandle(id, node.id)) {
                return true;
            } else {
                // check to see if this is a text node child of the one we want
                var p = node.parentNode;

                while (p) {
                    if (this.isHandle(id, p.id)) {
                        return true;
                    } else {
                        p = p.parentNode;
                    }
                }
            }

            return false;
        }

    };

}();

// shorter alias, save a few bytes
YAHOO.util.DDM = YAHOO.util.DragDropMgr;
YAHOO.util.DDM._addListeners();

}

(function() {

var Event=YAHOO.util.Event; 
var Dom=YAHOO.util.Dom;

/**
 * Defines the interface and base operation of items that that can be 
 * dragged or can be drop targets.  It was designed to be extended, overriding
 * the event handlers for startDrag, onDrag, onDragOver, onDragOut.
 * Up to three html elements can be associated with a DragDrop instance:
 * <ul>
 * <li>linked element: the element that is passed into the constructor.
 * This is the element which defines the boundaries for interaction with 
 * other DragDrop objects.</li>
 * <li>handle element(s): The drag operation only occurs if the element that 
 * was clicked matches a handle element.  By default this is the linked 
 * element, but there are times that you will want only a portion of the 
 * linked element to initiate the drag operation, and the setHandleElId() 
 * method provides a way to define this.</li>
 * <li>drag element: this represents an the element that would be moved along
 * with the cursor during a drag operation.  By default, this is the linked
 * element itself as in {@link YAHOO.util.DD}.  setDragElId() lets you define
 * a separate element that would be moved, as in {@link YAHOO.util.DDProxy}
 * </li>
 * </ul>
 * This class should not be instantiated until the onload event to ensure that
 * the associated elements are available.
 * The following would define a DragDrop obj that would interact with any 
 * other DragDrop obj in the "group1" group:
 * <pre>
 *  dd = new YAHOO.util.DragDrop("div1", "group1");
 * </pre>
 * Since none of the event handlers have been implemented, nothing would 
 * actually happen if you were to run the code above.  Normally you would 
 * override this class or one of the default implementations, but you can 
 * also override the methods you want on an instance of the class...
 * <pre>
 *  dd.onDragDrop = function(e, id) {
 *  &nbsp;&nbsp;alert("dd was dropped on " + id);
 *  }
 * </pre>
 * @namespace YAHOO.util
 * @class DragDrop
 * @constructor
 * @param {String} id of the element that is linked to this instance
 * @param {String} sGroup the group of related DragDrop objects
 * @param {object} config an object containing configurable attributes
 *                Valid properties for DragDrop: 
 *                    padding, isTarget, maintainOffset, primaryButtonOnly,
 */
YAHOO.util.DragDrop = function(id, sGroup, config) {
    if (id) {
        this.init(id, sGroup, config); 
    }
};

YAHOO.util.DragDrop.prototype = {
    /**
     * An Object Literal containing the events that we will be using: mouseDown, b4MouseDown, mouseUp, b4StartDrag, startDrag, b4EndDrag, endDrag, mouseUp, drag, b4Drag, invalidDrop, b4DragOut, dragOut, dragEnter, b4DragOver, dragOver, b4DragDrop, dragDrop
     * By setting any of these to false, then event will not be fired.
     * @property events
     * @type object
     */
    events: null,
    /**
    * @method on
    * @description Shortcut for EventProvider.subscribe, see <a href="YAHOO.util.EventProvider.html#subscribe">YAHOO.util.EventProvider.subscribe</a>
    */
    on: function() {
        this.subscribe.apply(this, arguments);
    },
    /**
     * The id of the element associated with this object.  This is what we 
     * refer to as the "linked element" because the size and position of 
     * this element is used to determine when the drag and drop objects have 
     * interacted.
     * @property id
     * @type String
     */
    id: null,

    /**
     * Configuration attributes passed into the constructor
     * @property config
     * @type object
     */
    config: null,

    /**
     * The id of the element that will be dragged.  By default this is same 
     * as the linked element , but could be changed to another element. Ex: 
     * YAHOO.util.DDProxy
     * @property dragElId
     * @type String
     * @private
     */
    dragElId: null, 

    /**
     * the id of the element that initiates the drag operation.  By default 
     * this is the linked element, but could be changed to be a child of this
     * element.  This lets us do things like only starting the drag when the 
     * header element within the linked html element is clicked.
     * @property handleElId
     * @type String
     * @private
     */
    handleElId: null, 

    /**
     * An associative array of HTML tags that will be ignored if clicked.
     * @property invalidHandleTypes
     * @type {string: string}
     */
    invalidHandleTypes: null, 

    /**
     * An associative array of ids for elements that will be ignored if clicked
     * @property invalidHandleIds
     * @type {string: string}
     */
    invalidHandleIds: null, 

    /**
     * An indexted array of css class names for elements that will be ignored
     * if clicked.
     * @property invalidHandleClasses
     * @type string[]
     */
    invalidHandleClasses: null, 

    /**
     * The linked element's absolute X position at the time the drag was 
     * started
     * @property startPageX
     * @type int
     * @private
     */
    startPageX: 0,

    /**
     * The linked element's absolute X position at the time the drag was 
     * started
     * @property startPageY
     * @type int
     * @private
     */
    startPageY: 0,

    /**
     * The group defines a logical collection of DragDrop objects that are 
     * related.  Instances only get events when interacting with other 
     * DragDrop object in the same group.  This lets us define multiple 
     * groups using a single DragDrop subclass if we want.
     * @property groups
     * @type {string: string}
     */
    groups: null,

    /**
     * Individual drag/drop instances can be locked.  This will prevent 
     * onmousedown start drag.
     * @property locked
     * @type boolean
     * @private
     */
    locked: false,

    /**
     * Lock this instance
     * @method lock
     */
    lock: function() { this.locked = true; },

    /**
     * Unlock this instace
     * @method unlock
     */
    unlock: function() { this.locked = false; },

    /**
     * By default, all instances can be a drop target.  This can be disabled by
     * setting isTarget to false.
     * @property isTarget
     * @type boolean
     */
    isTarget: true,

    /**
     * The padding configured for this drag and drop object for calculating
     * the drop zone intersection with this object.
     * @property padding
     * @type int[]
     */
    padding: null,
    /**
     * If this flag is true, do not fire drop events. The element is a drag only element (for movement not dropping)
     * @property dragOnly
     * @type Boolean
     */
    dragOnly: false,

    /**
     * If this flag is true, a shim will be placed over the screen/viewable area to track mouse events. Should help with dragging elements over iframes and other controls.
     * @property useShim
     * @type Boolean
     */
    useShim: false,

    /**
     * Cached reference to the linked element
     * @property _domRef
     * @private
     */
    _domRef: null,

    /**
     * Internal typeof flag
     * @property __ygDragDrop
     * @private
     */
    __ygDragDrop: true,

    /**
     * Set to true when horizontal contraints are applied
     * @property constrainX
     * @type boolean
     * @private
     */
    constrainX: false,

    /**
     * Set to true when vertical contraints are applied
     * @property constrainY
     * @type boolean
     * @private
     */
    constrainY: false,

    /**
     * The left constraint
     * @property minX
     * @type int
     * @private
     */
    minX: 0,

    /**
     * The right constraint
     * @property maxX
     * @type int
     * @private
     */
    maxX: 0,

    /**
     * The up constraint 
     * @property minY
     * @type int
     * @type int
     * @private
     */
    minY: 0,

    /**
     * The down constraint 
     * @property maxY
     * @type int
     * @private
     */
    maxY: 0,

    /**
     * The difference between the click position and the source element's location
     * @property deltaX
     * @type int
     * @private
     */
    deltaX: 0,

    /**
     * The difference between the click position and the source element's location
     * @property deltaY
     * @type int
     * @private
     */
    deltaY: 0,

    /**
     * Maintain offsets when we resetconstraints.  Set to true when you want
     * the position of the element relative to its parent to stay the same
     * when the page changes
     *
     * @property maintainOffset
     * @type boolean
     */
    maintainOffset: false,

    /**
     * Array of pixel locations the element will snap to if we specified a 
     * horizontal graduation/interval.  This array is generated automatically
     * when you define a tick interval.
     * @property xTicks
     * @type int[]
     */
    xTicks: null,

    /**
     * Array of pixel locations the element will snap to if we specified a 
     * vertical graduation/interval.  This array is generated automatically 
     * when you define a tick interval.
     * @property yTicks
     * @type int[]
     */
    yTicks: null,

    /**
     * By default the drag and drop instance will only respond to the primary
     * button click (left button for a right-handed mouse).  Set to true to
     * allow drag and drop to start with any mouse click that is propogated
     * by the browser
     * @property primaryButtonOnly
     * @type boolean
     */
    primaryButtonOnly: true,

    /**
     * The availabe property is false until the linked dom element is accessible.
     * @property available
     * @type boolean
     */
    available: false,

    /**
     * By default, drags can only be initiated if the mousedown occurs in the
     * region the linked element is.  This is done in part to work around a
     * bug in some browsers that mis-report the mousedown if the previous
     * mouseup happened outside of the window.  This property is set to true
     * if outer handles are defined.
     *
     * @property hasOuterHandles
     * @type boolean
     * @default false
     */
    hasOuterHandles: false,

    /**
     * Property that is assigned to a drag and drop object when testing to
     * see if it is being targeted by another dd object.  This property
     * can be used in intersect mode to help determine the focus of
     * the mouse interaction.  DDM.getBestMatch uses this property first to
     * determine the closest match in INTERSECT mode when multiple targets
     * are part of the same interaction.
     * @property cursorIsOver
     * @type boolean
     */
    cursorIsOver: false,

    /**
     * Property that is assigned to a drag and drop object when testing to
     * see if it is being targeted by another dd object.  This is a region
     * that represents the area the draggable element overlaps this target.
     * DDM.getBestMatch uses this property to compare the size of the overlap
     * to that of other targets in order to determine the closest match in
     * INTERSECT mode when multiple targets are part of the same interaction.
     * @property overlap 
     * @type YAHOO.util.Region
     */
    overlap: null,

    /**
     * Code that executes immediately before the startDrag event
     * @method b4StartDrag
     * @private
     */
    b4StartDrag: function(x, y) { },

    /**
     * Abstract method called after a drag/drop object is clicked
     * and the drag or mousedown time thresholds have beeen met.
     * @method startDrag
     * @param {int} X click location
     * @param {int} Y click location
     */
    startDrag: function(x, y) { /* override this */ },

    /**
     * Code that executes immediately before the onDrag event
     * @method b4Drag
     * @private
     */
    b4Drag: function(e) { },

    /**
     * Abstract method called during the onMouseMove event while dragging an 
     * object.
     * @method onDrag
     * @param {Event} e the mousemove event
     */
    onDrag: function(e) { /* override this */ },

    /**
     * Abstract method called when this element fist begins hovering over 
     * another DragDrop obj
     * @method onDragEnter
     * @param {Event} e the mousemove event
     * @param {String|DragDrop[]} id In POINT mode, the element
     * id this is hovering over.  In INTERSECT mode, an array of one or more 
     * dragdrop items being hovered over.
     */
    onDragEnter: function(e, id) { /* override this */ },

    /**
     * Code that executes immediately before the onDragOver event
     * @method b4DragOver
     * @private
     */
    b4DragOver: function(e) { },

    /**
     * Abstract method called when this element is hovering over another 
     * DragDrop obj
     * @method onDragOver
     * @param {Event} e the mousemove event
     * @param {String|DragDrop[]} id In POINT mode, the element
     * id this is hovering over.  In INTERSECT mode, an array of dd items 
     * being hovered over.
     */
    onDragOver: function(e, id) { /* override this */ },

    /**
     * Code that executes immediately before the onDragOut event
     * @method b4DragOut
     * @private
     */
    b4DragOut: function(e) { },

    /**
     * Abstract method called when we are no longer hovering over an element
     * @method onDragOut
     * @param {Event} e the mousemove event
     * @param {String|DragDrop[]} id In POINT mode, the element
     * id this was hovering over.  In INTERSECT mode, an array of dd items 
     * that the mouse is no longer over.
     */
    onDragOut: function(e, id) { /* override this */ },

    /**
     * Code that executes immediately before the onDragDrop event
     * @method b4DragDrop
     * @private
     */
    b4DragDrop: function(e) { },

    /**
     * Abstract method called when this item is dropped on another DragDrop 
     * obj
     * @method onDragDrop
     * @param {Event} e the mouseup event
     * @param {String|DragDrop[]} id In POINT mode, the element
     * id this was dropped on.  In INTERSECT mode, an array of dd items this 
     * was dropped on.
     */
    onDragDrop: function(e, id) { /* override this */ },

    /**
     * Abstract method called when this item is dropped on an area with no
     * drop target
     * @method onInvalidDrop
     * @param {Event} e the mouseup event
     */
    onInvalidDrop: function(e) { /* override this */ },

    /**
     * Code that executes immediately before the endDrag event
     * @method b4EndDrag
     * @private
     */
    b4EndDrag: function(e) { },

    /**
     * Fired when we are done dragging the object
     * @method endDrag
     * @param {Event} e the mouseup event
     */
    endDrag: function(e) { /* override this */ },

    /**
     * Code executed immediately before the onMouseDown event
     * @method b4MouseDown
     * @param {Event} e the mousedown event
     * @private
     */
    b4MouseDown: function(e) {  },

    /**
     * Event handler that fires when a drag/drop obj gets a mousedown
     * @method onMouseDown
     * @param {Event} e the mousedown event
     */
    onMouseDown: function(e) { /* override this */ },

    /**
     * Event handler that fires when a drag/drop obj gets a mouseup
     * @method onMouseUp
     * @param {Event} e the mouseup event
     */
    onMouseUp: function(e) { /* override this */ },
   
    /**
     * Override the onAvailable method to do what is needed after the initial
     * position was determined.
     * @method onAvailable
     */
    onAvailable: function () { 
    },

    /**
     * Returns a reference to the linked element
     * @method getEl
     * @return {HTMLElement} the html element 
     */
    getEl: function() { 
        if (!this._domRef) {
            this._domRef = Dom.get(this.id); 
        }

        return this._domRef;
    },

    /**
     * Returns a reference to the actual element to drag.  By default this is
     * the same as the html element, but it can be assigned to another 
     * element. An example of this can be found in YAHOO.util.DDProxy
     * @method getDragEl
     * @return {HTMLElement} the html element 
     */
    getDragEl: function() {
        return Dom.get(this.dragElId);
    },

    /**
     * Sets up the DragDrop object.  Must be called in the constructor of any
     * YAHOO.util.DragDrop subclass
     * @method init
     * @param id the id of the linked element
     * @param {String} sGroup the group of related items
     * @param {object} config configuration attributes
     */
    init: function(id, sGroup, config) {
        this.initTarget(id, sGroup, config);
        Event.on(this._domRef || this.id, "mousedown", 
                        this.handleMouseDown, this, true);

        // Event.on(this.id, "selectstart", Event.preventDefault);
        for (var i in this.events) {
            this.createEvent(i + 'Event');
        }
        
    },

    /**
     * Initializes Targeting functionality only... the object does not
     * get a mousedown handler.
     * @method initTarget
     * @param id the id of the linked element
     * @param {String} sGroup the group of related items
     * @param {object} config configuration attributes
     */
    initTarget: function(id, sGroup, config) {

        // configuration attributes 
        this.config = config || {};

        this.events = {};

        // create a local reference to the drag and drop manager
        this.DDM = YAHOO.util.DDM;

        // initialize the groups object
        this.groups = {};

        // assume that we have an element reference instead of an id if the
        // parameter is not a string
        if (typeof id !== "string") {
            this._domRef = id;
            id = Dom.generateId(id);
        }

        // set the id
        this.id = id;

        // add to an interaction group
        this.addToGroup((sGroup) ? sGroup : "default");

        // We don't want to register this as the handle with the manager
        // so we just set the id rather than calling the setter.
        this.handleElId = id;

        Event.onAvailable(id, this.handleOnAvailable, this, true);


        // the linked element is the element that gets dragged by default
        this.setDragElId(id); 

        // by default, clicked anchors will not start drag operations. 
        // @TODO what else should be here?  Probably form fields.
        this.invalidHandleTypes = { A: "A" };
        this.invalidHandleIds = {};
        this.invalidHandleClasses = [];

        this.applyConfig();
    },

    /**
     * Applies the configuration parameters that were passed into the constructor.
     * This is supposed to happen at each level through the inheritance chain.  So
     * a DDProxy implentation will execute apply config on DDProxy, DD, and 
     * DragDrop in order to get all of the parameters that are available in
     * each object.
     * @method applyConfig
     */
    applyConfig: function() {
        this.events = {
            mouseDown: true,
            b4MouseDown: true,
            mouseUp: true,
            b4StartDrag: true,
            startDrag: true,
            b4EndDrag: true,
            endDrag: true,
            drag: true,
            b4Drag: true,
            invalidDrop: true,
            b4DragOut: true,
            dragOut: true,
            dragEnter: true,
            b4DragOver: true,
            dragOver: true,
            b4DragDrop: true,
            dragDrop: true
        };
        
        if (this.config.events) {
            for (var i in this.config.events) {
                if (this.config.events[i] === false) {
                    this.events[i] = false;
                }
            }
        }


        // configurable properties: 
        //    padding, isTarget, maintainOffset, primaryButtonOnly
        this.padding           = this.config.padding || [0, 0, 0, 0];
        this.isTarget          = (this.config.isTarget !== false);
        this.maintainOffset    = (this.config.maintainOffset);
        this.primaryButtonOnly = (this.config.primaryButtonOnly !== false);
        this.dragOnly = ((this.config.dragOnly === true) ? true : false);
        this.useShim = ((this.config.useShim === true) ? true : false);
    },

    /**
     * Executed when the linked element is available
     * @method handleOnAvailable
     * @private
     */
    handleOnAvailable: function() {
        this.available = true;
        this.resetConstraints();
        this.onAvailable();
    },

     /**
     * Configures the padding for the target zone in px.  Effectively expands
     * (or reduces) the virtual object size for targeting calculations.  
     * Supports css-style shorthand; if only one parameter is passed, all sides
     * will have that padding, and if only two are passed, the top and bottom
     * will have the first param, the left and right the second.
     * @method setPadding
     * @param {int} iTop    Top pad
     * @param {int} iRight  Right pad
     * @param {int} iBot    Bot pad
     * @param {int} iLeft   Left pad
     */
    setPadding: function(iTop, iRight, iBot, iLeft) {
        // this.padding = [iLeft, iRight, iTop, iBot];
        if (!iRight && 0 !== iRight) {
            this.padding = [iTop, iTop, iTop, iTop];
        } else if (!iBot && 0 !== iBot) {
            this.padding = [iTop, iRight, iTop, iRight];
        } else {
            this.padding = [iTop, iRight, iBot, iLeft];
        }
    },

    /**
     * Stores the initial placement of the linked element.
     * @method setInitialPosition
     * @param {int} diffX   the X offset, default 0
     * @param {int} diffY   the Y offset, default 0
     * @private
     */
    setInitPosition: function(diffX, diffY) {
        var el = this.getEl();

        if (!this.DDM.verifyEl(el)) {
            if (el && el.style && (el.style.display == 'none')) {
            } else {
            }
            return;
        }

        var dx = diffX || 0;
        var dy = diffY || 0;

        var p = Dom.getXY( el );

        this.initPageX = p[0] - dx;
        this.initPageY = p[1] - dy;

        this.lastPageX = p[0];
        this.lastPageY = p[1];



        this.setStartPosition(p);
    },

    /**
     * Sets the start position of the element.  This is set when the obj
     * is initialized, the reset when a drag is started.
     * @method setStartPosition
     * @param pos current position (from previous lookup)
     * @private
     */
    setStartPosition: function(pos) {
        var p = pos || Dom.getXY(this.getEl());

        this.deltaSetXY = null;

        this.startPageX = p[0];
        this.startPageY = p[1];
    },

    /**
     * Add this instance to a group of related drag/drop objects.  All 
     * instances belong to at least one group, and can belong to as many 
     * groups as needed.
     * @method addToGroup
     * @param sGroup {string} the name of the group
     */
    addToGroup: function(sGroup) {
        this.groups[sGroup] = true;
        this.DDM.regDragDrop(this, sGroup);
    },

    /**
     * Remove's this instance from the supplied interaction group
     * @method removeFromGroup
     * @param {string}  sGroup  The group to drop
     */
    removeFromGroup: function(sGroup) {
        if (this.groups[sGroup]) {
            delete this.groups[sGroup];
        }

        this.DDM.removeDDFromGroup(this, sGroup);
    },

    /**
     * Allows you to specify that an element other than the linked element 
     * will be moved with the cursor during a drag
     * @method setDragElId
     * @param id {string} the id of the element that will be used to initiate the drag
     */
    setDragElId: function(id) {
        this.dragElId = id;
    },

    /**
     * Allows you to specify a child of the linked element that should be 
     * used to initiate the drag operation.  An example of this would be if 
     * you have a content div with text and links.  Clicking anywhere in the 
     * content area would normally start the drag operation.  Use this method
     * to specify that an element inside of the content div is the element 
     * that starts the drag operation.
     * @method setHandleElId
     * @param id {string} the id of the element that will be used to 
     * initiate the drag.
     */
    setHandleElId: function(id) {
        if (typeof id !== "string") {
            id = Dom.generateId(id);
        }
        this.handleElId = id;
        this.DDM.regHandle(this.id, id);
    },

    /**
     * Allows you to set an element outside of the linked element as a drag 
     * handle
     * @method setOuterHandleElId
     * @param id the id of the element that will be used to initiate the drag
     */
    setOuterHandleElId: function(id) {
        if (typeof id !== "string") {
            id = Dom.generateId(id);
        }
        Event.on(id, "mousedown", 
                this.handleMouseDown, this, true);
        this.setHandleElId(id);

        this.hasOuterHandles = true;
    },

    /**
     * Remove all drag and drop hooks for this element
     * @method unreg
     */
    unreg: function() {
        Event.removeListener(this.id, "mousedown", 
                this.handleMouseDown);
        this._domRef = null;
        this.DDM._remove(this);
    },

    /**
     * Returns true if this instance is locked, or the drag drop mgr is locked
     * (meaning that all drag/drop is disabled on the page.)
     * @method isLocked
     * @return {boolean} true if this obj or all drag/drop is locked, else 
     * false
     */
    isLocked: function() {
        return (this.DDM.isLocked() || this.locked);
    },

    /**
     * Fired when this object is clicked
     * @method handleMouseDown
     * @param {Event} e 
     * @param {YAHOO.util.DragDrop} oDD the clicked dd object (this dd obj)
     * @private
     */
    handleMouseDown: function(e, oDD) {

        var button = e.which || e.button;

        if (this.primaryButtonOnly && button > 1) {
            return;
        }

        if (this.isLocked()) {
            return;
        }



        // firing the mousedown events prior to calculating positions
        var b4Return = this.b4MouseDown(e),
        b4Return2 = true;

        if (this.events.b4MouseDown) {
            b4Return2 = this.fireEvent('b4MouseDownEvent', e);
        }
        var mDownReturn = this.onMouseDown(e),
            mDownReturn2 = true;
        if (this.events.mouseDown) {
            mDownReturn2 = this.fireEvent('mouseDownEvent', e);
        }

        if ((b4Return === false) || (mDownReturn === false) || (b4Return2 === false) || (mDownReturn2 === false)) {
            return;
        }

        this.DDM.refreshCache(this.groups);
        // var self = this;
        // setTimeout( function() { self.DDM.refreshCache(self.groups); }, 0);

        // Only process the event if we really clicked within the linked 
        // element.  The reason we make this check is that in the case that 
        // another element was moved between the clicked element and the 
        // cursor in the time between the mousedown and mouseup events. When 
        // this happens, the element gets the next mousedown event 
        // regardless of where on the screen it happened.  
        var pt = new YAHOO.util.Point(Event.getPageX(e), Event.getPageY(e));
        if (!this.hasOuterHandles && !this.DDM.isOverTarget(pt, this) )  {
        } else {
            if (this.clickValidator(e)) {


                // set the initial element position
                this.setStartPosition();

                // start tracking mousemove distance and mousedown time to
                // determine when to start the actual drag
                this.DDM.handleMouseDown(e, this);

                // this mousedown is mine
                this.DDM.stopEvent(e);
            } else {


            }
        }
    },

    /**
     * @method clickValidator
     * @description Method validates that the clicked element
     * was indeed the handle or a valid child of the handle
     * @param {Event} e 
     */
    clickValidator: function(e) {
        var target = YAHOO.util.Event.getTarget(e);
        return ( this.isValidHandleChild(target) &&
                    (this.id == this.handleElId || 
                        this.DDM.handleWasClicked(target, this.id)) );
    },

    /**
     * Finds the location the element should be placed if we want to move
     * it to where the mouse location less the click offset would place us.
     * @method getTargetCoord
     * @param {int} iPageX the X coordinate of the click
     * @param {int} iPageY the Y coordinate of the click
     * @return an object that contains the coordinates (Object.x and Object.y)
     * @private
     */
    getTargetCoord: function(iPageX, iPageY) {


        var x = iPageX - this.deltaX;
        var y = iPageY - this.deltaY;

        if (this.constrainX) {
            if (x < this.minX) { x = this.minX; }
            if (x > this.maxX) { x = this.maxX; }
        }

        if (this.constrainY) {
            if (y < this.minY) { y = this.minY; }
            if (y > this.maxY) { y = this.maxY; }
        }

        x = this.getTick(x, this.xTicks);
        y = this.getTick(y, this.yTicks);


        return {x:x, y:y};
    },

    /**
     * Allows you to specify a tag name that should not start a drag operation
     * when clicked.  This is designed to facilitate embedding links within a
     * drag handle that do something other than start the drag.
     * @method addInvalidHandleType
     * @param {string} tagName the type of element to exclude
     */
    addInvalidHandleType: function(tagName) {
        var type = tagName.toUpperCase();
        this.invalidHandleTypes[type] = type;
    },

    /**
     * Lets you to specify an element id for a child of a drag handle
     * that should not initiate a drag
     * @method addInvalidHandleId
     * @param {string} id the element id of the element you wish to ignore
     */
    addInvalidHandleId: function(id) {
        if (typeof id !== "string") {
            id = Dom.generateId(id);
        }
        this.invalidHandleIds[id] = id;
    },


    /**
     * Lets you specify a css class of elements that will not initiate a drag
     * @method addInvalidHandleClass
     * @param {string} cssClass the class of the elements you wish to ignore
     */
    addInvalidHandleClass: function(cssClass) {
        this.invalidHandleClasses.push(cssClass);
    },

    /**
     * Unsets an excluded tag name set by addInvalidHandleType
     * @method removeInvalidHandleType
     * @param {string} tagName the type of element to unexclude
     */
    removeInvalidHandleType: function(tagName) {
        var type = tagName.toUpperCase();
        // this.invalidHandleTypes[type] = null;
        delete this.invalidHandleTypes[type];
    },
    
    /**
     * Unsets an invalid handle id
     * @method removeInvalidHandleId
     * @param {string} id the id of the element to re-enable
     */
    removeInvalidHandleId: function(id) {
        if (typeof id !== "string") {
            id = Dom.generateId(id);
        }
        delete this.invalidHandleIds[id];
    },

    /**
     * Unsets an invalid css class
     * @method removeInvalidHandleClass
     * @param {string} cssClass the class of the element(s) you wish to 
     * re-enable
     */
    removeInvalidHandleClass: function(cssClass) {
        for (var i=0, len=this.invalidHandleClasses.length; i<len; ++i) {
            if (this.invalidHandleClasses[i] == cssClass) {
                delete this.invalidHandleClasses[i];
            }
        }
    },

    /**
     * Checks the tag exclusion list to see if this click should be ignored
     * @method isValidHandleChild
     * @param {HTMLElement} node the HTMLElement to evaluate
     * @return {boolean} true if this is a valid tag type, false if not
     */
    isValidHandleChild: function(node) {

        var valid = true;
        // var n = (node.nodeName == "#text") ? node.parentNode : node;
        var nodeName;
        try {
            nodeName = node.nodeName.toUpperCase();
        } catch(e) {
            nodeName = node.nodeName;
        }
        valid = valid && !this.invalidHandleTypes[nodeName];
        valid = valid && !this.invalidHandleIds[node.id];

        for (var i=0, len=this.invalidHandleClasses.length; valid && i<len; ++i) {
            valid = !Dom.hasClass(node, this.invalidHandleClasses[i]);
        }


        return valid;

    },

    /**
     * Create the array of horizontal tick marks if an interval was specified
     * in setXConstraint().
     * @method setXTicks
     * @private
     */
    setXTicks: function(iStartX, iTickSize) {
        this.xTicks = [];
        this.xTickSize = iTickSize;
        
        var tickMap = {};

        for (var i = this.initPageX; i >= this.minX; i = i - iTickSize) {
            if (!tickMap[i]) {
                this.xTicks[this.xTicks.length] = i;
                tickMap[i] = true;
            }
        }

        for (i = this.initPageX; i <= this.maxX; i = i + iTickSize) {
            if (!tickMap[i]) {
                this.xTicks[this.xTicks.length] = i;
                tickMap[i] = true;
            }
        }

        this.xTicks.sort(this.DDM.numericSort) ;
    },

    /**
     * Create the array of vertical tick marks if an interval was specified in 
     * setYConstraint().
     * @method setYTicks
     * @private
     */
    setYTicks: function(iStartY, iTickSize) {
        this.yTicks = [];
        this.yTickSize = iTickSize;

        var tickMap = {};

        for (var i = this.initPageY; i >= this.minY; i = i - iTickSize) {
            if (!tickMap[i]) {
                this.yTicks[this.yTicks.length] = i;
                tickMap[i] = true;
            }
        }

        for (i = this.initPageY; i <= this.maxY; i = i + iTickSize) {
            if (!tickMap[i]) {
                this.yTicks[this.yTicks.length] = i;
                tickMap[i] = true;
            }
        }

        this.yTicks.sort(this.DDM.numericSort) ;
    },

    /**
     * By default, the element can be dragged any place on the screen.  Use 
     * this method to limit the horizontal travel of the element.  Pass in 
     * 0,0 for the parameters if you want to lock the drag to the y axis.
     * @method setXConstraint
     * @param {int} iLeft the number of pixels the element can move to the left
     * @param {int} iRight the number of pixels the element can move to the 
     * right
     * @param {int} iTickSize optional parameter for specifying that the 
     * element
     * should move iTickSize pixels at a time.
     */
    setXConstraint: function(iLeft, iRight, iTickSize) {
        this.leftConstraint = parseInt(iLeft, 10);
        this.rightConstraint = parseInt(iRight, 10);

        this.minX = this.initPageX - this.leftConstraint;
        this.maxX = this.initPageX + this.rightConstraint;
        if (iTickSize) { this.setXTicks(this.initPageX, iTickSize); }

        this.constrainX = true;
    },

    /**
     * Clears any constraints applied to this instance.  Also clears ticks
     * since they can't exist independent of a constraint at this time.
     * @method clearConstraints
     */
    clearConstraints: function() {
        this.constrainX = false;
        this.constrainY = false;
        this.clearTicks();
    },

    /**
     * Clears any tick interval defined for this instance
     * @method clearTicks
     */
    clearTicks: function() {
        this.xTicks = null;
        this.yTicks = null;
        this.xTickSize = 0;
        this.yTickSize = 0;
    },

    /**
     * By default, the element can be dragged any place on the screen.  Set 
     * this to limit the vertical travel of the element.  Pass in 0,0 for the
     * parameters if you want to lock the drag to the x axis.
     * @method setYConstraint
     * @param {int} iUp the number of pixels the element can move up
     * @param {int} iDown the number of pixels the element can move down
     * @param {int} iTickSize optional parameter for specifying that the 
     * element should move iTickSize pixels at a time.
     */
    setYConstraint: function(iUp, iDown, iTickSize) {
        this.topConstraint = parseInt(iUp, 10);
        this.bottomConstraint = parseInt(iDown, 10);

        this.minY = this.initPageY - this.topConstraint;
        this.maxY = this.initPageY + this.bottomConstraint;
        if (iTickSize) { this.setYTicks(this.initPageY, iTickSize); }

        this.constrainY = true;
        
    },

    /**
     * resetConstraints must be called if you manually reposition a dd element.
     * @method resetConstraints
     */
    resetConstraints: function() {


        // Maintain offsets if necessary
        if (this.initPageX || this.initPageX === 0) {
            // figure out how much this thing has moved
            var dx = (this.maintainOffset) ? this.lastPageX - this.initPageX : 0;
            var dy = (this.maintainOffset) ? this.lastPageY - this.initPageY : 0;

            this.setInitPosition(dx, dy);

        // This is the first time we have detected the element's position
        } else {
            this.setInitPosition();
        }

        if (this.constrainX) {
            this.setXConstraint( this.leftConstraint, 
                                 this.rightConstraint, 
                                 this.xTickSize        );
        }

        if (this.constrainY) {
            this.setYConstraint( this.topConstraint, 
                                 this.bottomConstraint, 
                                 this.yTickSize         );
        }
    },

    /**
     * Normally the drag element is moved pixel by pixel, but we can specify 
     * that it move a number of pixels at a time.  This method resolves the 
     * location when we have it set up like this.
     * @method getTick
     * @param {int} val where we want to place the object
     * @param {int[]} tickArray sorted array of valid points
     * @return {int} the closest tick
     * @private
     */
    getTick: function(val, tickArray) {

        if (!tickArray) {
            // If tick interval is not defined, it is effectively 1 pixel, 
            // so we return the value passed to us.
            return val; 
        } else if (tickArray[0] >= val) {
            // The value is lower than the first tick, so we return the first
            // tick.
            return tickArray[0];
        } else {
            for (var i=0, len=tickArray.length; i<len; ++i) {
                var next = i + 1;
                if (tickArray[next] && tickArray[next] >= val) {
                    var diff1 = val - tickArray[i];
                    var diff2 = tickArray[next] - val;
                    return (diff2 > diff1) ? tickArray[i] : tickArray[next];
                }
            }

            // The value is larger than the last tick, so we return the last
            // tick.
            return tickArray[tickArray.length - 1];
        }
    },

    /**
     * toString method
     * @method toString
     * @return {string} string representation of the dd obj
     */
    toString: function() {
        return ("DragDrop " + this.id);
    }

};
YAHOO.augment(YAHOO.util.DragDrop, YAHOO.util.EventProvider);

/**
* @event mouseDownEvent
* @description Provides access to the mousedown event. The mousedown does not always result in a drag operation.
* @type YAHOO.util.CustomEvent See <a href="YAHOO.util.Element.html#addListener">Element.addListener</a> for more information on listening for this event.
*/

/**
* @event b4MouseDownEvent
* @description Provides access to the mousedown event, before the mouseDownEvent gets fired. Returning false will cancel the drag.
* @type YAHOO.util.CustomEvent See <a href="YAHOO.util.Element.html#addListener">Element.addListener</a> for more information on listening for this event.
*/

/**
* @event mouseUpEvent
* @description Fired from inside DragDropMgr when the drag operation is finished.
* @type YAHOO.util.CustomEvent See <a href="YAHOO.util.Element.html#addListener">Element.addListener</a> for more information on listening for this event.
*/

/**
* @event b4StartDragEvent
* @description Fires before the startDragEvent, returning false will cancel the startDrag Event.
* @type YAHOO.util.CustomEvent See <a href="YAHOO.util.Element.html#addListener">Element.addListener</a> for more information on listening for this event.
*/

/**
* @event startDragEvent
* @description Occurs after a mouse down and the drag threshold has been met. The drag threshold default is either 3 pixels of mouse movement or 1 full second of holding the mousedown. 
* @type YAHOO.util.CustomEvent See <a href="YAHOO.util.Element.html#addListener">Element.addListener</a> for more information on listening for this event.
*/

/**
* @event b4EndDragEvent
* @description Fires before the endDragEvent. Returning false will cancel.
* @type YAHOO.util.CustomEvent See <a href="YAHOO.util.Element.html#addListener">Element.addListener</a> for more information on listening for this event.
*/

/**
* @event endDragEvent
* @description Fires on the mouseup event after a drag has been initiated (startDrag fired).
* @type YAHOO.util.CustomEvent See <a href="YAHOO.util.Element.html#addListener">Element.addListener</a> for more information on listening for this event.
*/

/**
* @event dragEvent
* @description Occurs every mousemove event while dragging.
* @type YAHOO.util.CustomEvent See <a href="YAHOO.util.Element.html#addListener">Element.addListener</a> for more information on listening for this event.
*/
/**
* @event b4DragEvent
* @description Fires before the dragEvent.
* @type YAHOO.util.CustomEvent See <a href="YAHOO.util.Element.html#addListener">Element.addListener</a> for more information on listening for this event.
*/
/**
* @event invalidDropEvent
* @description Fires when the dragged objects is dropped in a location that contains no drop targets.
* @type YAHOO.util.CustomEvent See <a href="YAHOO.util.Element.html#addListener">Element.addListener</a> for more information on listening for this event.
*/
/**
* @event b4DragOutEvent
* @description Fires before the dragOutEvent
* @type YAHOO.util.CustomEvent See <a href="YAHOO.util.Element.html#addListener">Element.addListener</a> for more information on listening for this event.
*/
/**
* @event dragOutEvent
* @description Fires when a dragged object is no longer over an object that had the onDragEnter fire. 
* @type YAHOO.util.CustomEvent See <a href="YAHOO.util.Element.html#addListener">Element.addListener</a> for more information on listening for this event.
*/
/**
* @event dragEnterEvent
* @description Occurs when the dragged object first interacts with another targettable drag and drop object.
* @type YAHOO.util.CustomEvent See <a href="YAHOO.util.Element.html#addListener">Element.addListener</a> for more information on listening for this event.
*/
/**
* @event b4DragOverEvent
* @description Fires before the dragOverEvent.
* @type YAHOO.util.CustomEvent See <a href="YAHOO.util.Element.html#addListener">Element.addListener</a> for more information on listening for this event.
*/
/**
* @event dragOverEvent
* @description Fires every mousemove event while over a drag and drop object.
* @type YAHOO.util.CustomEvent See <a href="YAHOO.util.Element.html#addListener">Element.addListener</a> for more information on listening for this event.
*/
/**
* @event b4DragDropEvent 
* @description Fires before the dragDropEvent
* @type YAHOO.util.CustomEvent See <a href="YAHOO.util.Element.html#addListener">Element.addListener</a> for more information on listening for this event.
*/
/**
* @event dragDropEvent
* @description Fires when the dragged objects is dropped on another.
* @type YAHOO.util.CustomEvent See <a href="YAHOO.util.Element.html#addListener">Element.addListener</a> for more information on listening for this event.
*/
})();
/**
 * A DragDrop implementation where the linked element follows the 
 * mouse cursor during a drag.
 * @class DD
 * @extends YAHOO.util.DragDrop
 * @constructor
 * @param {String} id the id of the linked element 
 * @param {String} sGroup the group of related DragDrop items
 * @param {object} config an object containing configurable attributes
 *                Valid properties for DD: 
 *                    scroll
 */
YAHOO.util.DD = function(id, sGroup, config) {
    if (id) {
        this.init(id, sGroup, config);
    }
};

YAHOO.extend(YAHOO.util.DD, YAHOO.util.DragDrop, {

    /**
     * When set to true, the utility automatically tries to scroll the browser
     * window when a drag and drop element is dragged near the viewport boundary.
     * Defaults to true.
     * @property scroll
     * @type boolean
     */
    scroll: true, 

    /**
     * Sets the pointer offset to the distance between the linked element's top 
     * left corner and the location the element was clicked
     * @method autoOffset
     * @param {int} iPageX the X coordinate of the click
     * @param {int} iPageY the Y coordinate of the click
     */
    autoOffset: function(iPageX, iPageY) {
        var x = iPageX - this.startPageX;
        var y = iPageY - this.startPageY;
        this.setDelta(x, y);
    },

    /** 
     * Sets the pointer offset.  You can call this directly to force the 
     * offset to be in a particular location (e.g., pass in 0,0 to set it 
     * to the center of the object, as done in YAHOO.widget.Slider)
     * @method setDelta
     * @param {int} iDeltaX the distance from the left
     * @param {int} iDeltaY the distance from the top
     */
    setDelta: function(iDeltaX, iDeltaY) {
        this.deltaX = iDeltaX;
        this.deltaY = iDeltaY;
    },

    /**
     * Sets the drag element to the location of the mousedown or click event, 
     * maintaining the cursor location relative to the location on the element 
     * that was clicked.  Override this if you want to place the element in a 
     * location other than where the cursor is.
     * @method setDragElPos
     * @param {int} iPageX the X coordinate of the mousedown or drag event
     * @param {int} iPageY the Y coordinate of the mousedown or drag event
     */
    setDragElPos: function(iPageX, iPageY) {
        // the first time we do this, we are going to check to make sure
        // the element has css positioning

        var el = this.getDragEl();
        this.alignElWithMouse(el, iPageX, iPageY);
    },

    /**
     * Sets the element to the location of the mousedown or click event, 
     * maintaining the cursor location relative to the location on the element 
     * that was clicked.  Override this if you want to place the element in a 
     * location other than where the cursor is.
     * @method alignElWithMouse
     * @param {HTMLElement} el the element to move
     * @param {int} iPageX the X coordinate of the mousedown or drag event
     * @param {int} iPageY the Y coordinate of the mousedown or drag event
     */
    alignElWithMouse: function(el, iPageX, iPageY) {
        var oCoord = this.getTargetCoord(iPageX, iPageY);

        if (!this.deltaSetXY) {
            var aCoord = [oCoord.x, oCoord.y];
            YAHOO.util.Dom.setXY(el, aCoord);

            var newLeft = parseInt( YAHOO.util.Dom.getStyle(el, "left"), 10 );
            var newTop  = parseInt( YAHOO.util.Dom.getStyle(el, "top" ), 10 );

            this.deltaSetXY = [ newLeft - oCoord.x, newTop - oCoord.y ];
        } else {
            YAHOO.util.Dom.setStyle(el, "left", (oCoord.x + this.deltaSetXY[0]) + "px");
            YAHOO.util.Dom.setStyle(el, "top",  (oCoord.y + this.deltaSetXY[1]) + "px");
        }
        
        this.cachePosition(oCoord.x, oCoord.y);
        var self = this;
        setTimeout(function() {
            self.autoScroll.call(self, oCoord.x, oCoord.y, el.offsetHeight, el.offsetWidth);
        }, 0);
    },

    /**
     * Saves the most recent position so that we can reset the constraints and
     * tick marks on-demand.  We need to know this so that we can calculate the
     * number of pixels the element is offset from its original position.
     * @method cachePosition
     * @param iPageX the current x position (optional, this just makes it so we
     * don't have to look it up again)
     * @param iPageY the current y position (optional, this just makes it so we
     * don't have to look it up again)
     */
    cachePosition: function(iPageX, iPageY) {
        if (iPageX) {
            this.lastPageX = iPageX;
            this.lastPageY = iPageY;
        } else {
            var aCoord = YAHOO.util.Dom.getXY(this.getEl());
            this.lastPageX = aCoord[0];
            this.lastPageY = aCoord[1];
        }
    },

    /**
     * Auto-scroll the window if the dragged object has been moved beyond the 
     * visible window boundary.
     * @method autoScroll
     * @param {int} x the drag element's x position
     * @param {int} y the drag element's y position
     * @param {int} h the height of the drag element
     * @param {int} w the width of the drag element
     * @private
     */
    autoScroll: function(x, y, h, w) {

        if (this.scroll) {
            // The client height
            var clientH = this.DDM.getClientHeight();

            // The client width
            var clientW = this.DDM.getClientWidth();

            // The amt scrolled down
            var st = this.DDM.getScrollTop();

            // The amt scrolled right
            var sl = this.DDM.getScrollLeft();

            // Location of the bottom of the element
            var bot = h + y;

            // Location of the right of the element
            var right = w + x;

            // The distance from the cursor to the bottom of the visible area, 
            // adjusted so that we don't scroll if the cursor is beyond the
            // element drag constraints
            var toBot = (clientH + st - y - this.deltaY);

            // The distance from the cursor to the right of the visible area
            var toRight = (clientW + sl - x - this.deltaX);


            // How close to the edge the cursor must be before we scroll
            // var thresh = (document.all) ? 100 : 40;
            var thresh = 40;

            // How many pixels to scroll per autoscroll op.  This helps to reduce 
            // clunky scrolling. IE is more sensitive about this ... it needs this 
            // value to be higher.
            var scrAmt = (document.all) ? 80 : 30;

            // Scroll down if we are near the bottom of the visible page and the 
            // obj extends below the crease
            if ( bot > clientH && toBot < thresh ) { 
                window.scrollTo(sl, st + scrAmt); 
            }

            // Scroll up if the window is scrolled down and the top of the object
            // goes above the top border
            if ( y < st && st > 0 && y - st < thresh ) { 
                window.scrollTo(sl, st - scrAmt); 
            }

            // Scroll right if the obj is beyond the right border and the cursor is
            // near the border.
            if ( right > clientW && toRight < thresh ) { 
                window.scrollTo(sl + scrAmt, st); 
            }

            // Scroll left if the window has been scrolled to the right and the obj
            // extends past the left border
            if ( x < sl && sl > 0 && x - sl < thresh ) { 
                window.scrollTo(sl - scrAmt, st);
            }
        }
    },

    /*
     * Sets up config options specific to this class. Overrides
     * YAHOO.util.DragDrop, but all versions of this method through the 
     * inheritance chain are called
     */
    applyConfig: function() {
        YAHOO.util.DD.superclass.applyConfig.call(this);
        this.scroll = (this.config.scroll !== false);
    },

    /*
     * Event that fires prior to the onMouseDown event.  Overrides 
     * YAHOO.util.DragDrop.
     */
    b4MouseDown: function(e) {
        this.setStartPosition();
        // this.resetConstraints();
        this.autoOffset(YAHOO.util.Event.getPageX(e), 
                            YAHOO.util.Event.getPageY(e));
    },

    /*
     * Event that fires prior to the onDrag event.  Overrides 
     * YAHOO.util.DragDrop.
     */
    b4Drag: function(e) {
        this.setDragElPos(YAHOO.util.Event.getPageX(e), 
                            YAHOO.util.Event.getPageY(e));
    },

    toString: function() {
        return ("DD " + this.id);
    }

    //////////////////////////////////////////////////////////////////////////
    // Debugging ygDragDrop events that can be overridden
    //////////////////////////////////////////////////////////////////////////
    /*
    startDrag: function(x, y) {
    },

    onDrag: function(e) {
    },

    onDragEnter: function(e, id) {
    },

    onDragOver: function(e, id) {
    },

    onDragOut: function(e, id) {
    },

    onDragDrop: function(e, id) {
    },

    endDrag: function(e) {
    }

    */

/**
* @event mouseDownEvent
* @description Provides access to the mousedown event. The mousedown does not always result in a drag operation.
* @type YAHOO.util.CustomEvent See <a href="YAHOO.util.Element.html#addListener">Element.addListener</a> for more information on listening for this event.
*/

/**
* @event b4MouseDownEvent
* @description Provides access to the mousedown event, before the mouseDownEvent gets fired. Returning false will cancel the drag.
* @type YAHOO.util.CustomEvent See <a href="YAHOO.util.Element.html#addListener">Element.addListener</a> for more information on listening for this event.
*/

/**
* @event mouseUpEvent
* @description Fired from inside DragDropMgr when the drag operation is finished.
* @type YAHOO.util.CustomEvent See <a href="YAHOO.util.Element.html#addListener">Element.addListener</a> for more information on listening for this event.
*/

/**
* @event b4StartDragEvent
* @description Fires before the startDragEvent, returning false will cancel the startDrag Event.
* @type YAHOO.util.CustomEvent See <a href="YAHOO.util.Element.html#addListener">Element.addListener</a> for more information on listening for this event.
*/

/**
* @event startDragEvent
* @description Occurs after a mouse down and the drag threshold has been met. The drag threshold default is either 3 pixels of mouse movement or 1 full second of holding the mousedown. 
* @type YAHOO.util.CustomEvent See <a href="YAHOO.util.Element.html#addListener">Element.addListener</a> for more information on listening for this event.
*/

/**
* @event b4EndDragEvent
* @description Fires before the endDragEvent. Returning false will cancel.
* @type YAHOO.util.CustomEvent See <a href="YAHOO.util.Element.html#addListener">Element.addListener</a> for more information on listening for this event.
*/

/**
* @event endDragEvent
* @description Fires on the mouseup event after a drag has been initiated (startDrag fired).
* @type YAHOO.util.CustomEvent See <a href="YAHOO.util.Element.html#addListener">Element.addListener</a> for more information on listening for this event.
*/

/**
* @event dragEvent
* @description Occurs every mousemove event while dragging.
* @type YAHOO.util.CustomEvent See <a href="YAHOO.util.Element.html#addListener">Element.addListener</a> for more information on listening for this event.
*/
/**
* @event b4DragEvent
* @description Fires before the dragEvent.
* @type YAHOO.util.CustomEvent See <a href="YAHOO.util.Element.html#addListener">Element.addListener</a> for more information on listening for this event.
*/
/**
* @event invalidDropEvent
* @description Fires when the dragged objects is dropped in a location that contains no drop targets.
* @type YAHOO.util.CustomEvent See <a href="YAHOO.util.Element.html#addListener">Element.addListener</a> for more information on listening for this event.
*/
/**
* @event b4DragOutEvent
* @description Fires before the dragOutEvent
* @type YAHOO.util.CustomEvent See <a href="YAHOO.util.Element.html#addListener">Element.addListener</a> for more information on listening for this event.
*/
/**
* @event dragOutEvent
* @description Fires when a dragged object is no longer over an object that had the onDragEnter fire. 
* @type YAHOO.util.CustomEvent See <a href="YAHOO.util.Element.html#addListener">Element.addListener</a> for more information on listening for this event.
*/
/**
* @event dragEnterEvent
* @description Occurs when the dragged object first interacts with another targettable drag and drop object.
* @type YAHOO.util.CustomEvent See <a href="YAHOO.util.Element.html#addListener">Element.addListener</a> for more information on listening for this event.
*/
/**
* @event b4DragOverEvent
* @description Fires before the dragOverEvent.
* @type YAHOO.util.CustomEvent See <a href="YAHOO.util.Element.html#addListener">Element.addListener</a> for more information on listening for this event.
*/
/**
* @event dragOverEvent
* @description Fires every mousemove event while over a drag and drop object.
* @type YAHOO.util.CustomEvent See <a href="YAHOO.util.Element.html#addListener">Element.addListener</a> for more information on listening for this event.
*/
/**
* @event b4DragDropEvent 
* @description Fires before the dragDropEvent
* @type YAHOO.util.CustomEvent See <a href="YAHOO.util.Element.html#addListener">Element.addListener</a> for more information on listening for this event.
*/
/**
* @event dragDropEvent
* @description Fires when the dragged objects is dropped on another.
* @type YAHOO.util.CustomEvent See <a href="YAHOO.util.Element.html#addListener">Element.addListener</a> for more information on listening for this event.
*/
});
/**
 * A DragDrop implementation that inserts an empty, bordered div into
 * the document that follows the cursor during drag operations.  At the time of
 * the click, the frame div is resized to the dimensions of the linked html
 * element, and moved to the exact location of the linked element.
 *
 * References to the "frame" element refer to the single proxy element that
 * was created to be dragged in place of all DDProxy elements on the
 * page.
 *
 * @class DDProxy
 * @extends YAHOO.util.DD
 * @constructor
 * @param {String} id the id of the linked html element
 * @param {String} sGroup the group of related DragDrop objects
 * @param {object} config an object containing configurable attributes
 *                Valid properties for DDProxy in addition to those in DragDrop: 
 *                   resizeFrame, centerFrame, dragElId
 */
YAHOO.util.DDProxy = function(id, sGroup, config) {
    if (id) {
        this.init(id, sGroup, config);
        this.initFrame(); 
    }
};

/**
 * The default drag frame div id
 * @property YAHOO.util.DDProxy.dragElId
 * @type String
 * @static
 */
YAHOO.util.DDProxy.dragElId = "ygddfdiv";

YAHOO.extend(YAHOO.util.DDProxy, YAHOO.util.DD, {

    /**
     * By default we resize the drag frame to be the same size as the element
     * we want to drag (this is to get the frame effect).  We can turn it off
     * if we want a different behavior.
     * @property resizeFrame
     * @type boolean
     */
    resizeFrame: true,

    /**
     * By default the frame is positioned exactly where the drag element is, so
     * we use the cursor offset provided by YAHOO.util.DD.  Another option that works only if
     * you do not have constraints on the obj is to have the drag frame centered
     * around the cursor.  Set centerFrame to true for this effect.
     * @property centerFrame
     * @type boolean
     */
    centerFrame: false,

    /**
     * Creates the proxy element if it does not yet exist
     * @method createFrame
     */
    createFrame: function() {
        var self=this, body=document.body;

        if (!body || !body.firstChild) {
            setTimeout( function() { self.createFrame(); }, 50 );
            return;
        }

        var div=this.getDragEl(), Dom=YAHOO.util.Dom;

        if (!div) {
            div    = document.createElement("div");
            div.id = this.dragElId;
            var s  = div.style;

            s.position   = "absolute";
            s.visibility = "hidden";
            s.cursor     = "move";
            s.border     = "2px solid #aaa";
            s.zIndex     = 999;
            s.height     = "25px";
            s.width      = "25px";

            var _data = document.createElement('div');
            Dom.setStyle(_data, 'height', '100%');
            Dom.setStyle(_data, 'width', '100%');
            /**
            * If the proxy element has no background-color, then it is considered to the "transparent" by Internet Explorer.
            * Since it is "transparent" then the events pass through it to the iframe below.
            * So creating a "fake" div inside the proxy element and giving it a background-color, then setting it to an
            * opacity of 0, it appears to not be there, however IE still thinks that it is so the events never pass through.
            */
            Dom.setStyle(_data, 'background-color', '#ccc');
            Dom.setStyle(_data, 'opacity', '0');
            div.appendChild(_data);

            // appendChild can blow up IE if invoked prior to the window load event
            // while rendering a table.  It is possible there are other scenarios 
            // that would cause this to happen as well.
            body.insertBefore(div, body.firstChild);
        }
    },

    /**
     * Initialization for the drag frame element.  Must be called in the
     * constructor of all subclasses
     * @method initFrame
     */
    initFrame: function() {
        this.createFrame();
    },

    applyConfig: function() {
        YAHOO.util.DDProxy.superclass.applyConfig.call(this);

        this.resizeFrame = (this.config.resizeFrame !== false);
        this.centerFrame = (this.config.centerFrame);
        this.setDragElId(this.config.dragElId || YAHOO.util.DDProxy.dragElId);
    },

    /**
     * Resizes the drag frame to the dimensions of the clicked object, positions 
     * it over the object, and finally displays it
     * @method showFrame
     * @param {int} iPageX X click position
     * @param {int} iPageY Y click position
     * @private
     */
    showFrame: function(iPageX, iPageY) {
        var el = this.getEl();
        var dragEl = this.getDragEl();
        var s = dragEl.style;

        this._resizeProxy();

        if (this.centerFrame) {
            this.setDelta( Math.round(parseInt(s.width,  10)/2), 
                           Math.round(parseInt(s.height, 10)/2) );
        }

        this.setDragElPos(iPageX, iPageY);

        YAHOO.util.Dom.setStyle(dragEl, "visibility", "visible"); 
    },

    /**
     * The proxy is automatically resized to the dimensions of the linked
     * element when a drag is initiated, unless resizeFrame is set to false
     * @method _resizeProxy
     * @private
     */
    _resizeProxy: function() {
        if (this.resizeFrame) {
            var DOM    = YAHOO.util.Dom;
            var el     = this.getEl();
            var dragEl = this.getDragEl();

            var bt = parseInt( DOM.getStyle(dragEl, "borderTopWidth"    ), 10);
            var br = parseInt( DOM.getStyle(dragEl, "borderRightWidth"  ), 10);
            var bb = parseInt( DOM.getStyle(dragEl, "borderBottomWidth" ), 10);
            var bl = parseInt( DOM.getStyle(dragEl, "borderLeftWidth"   ), 10);

            if (isNaN(bt)) { bt = 0; }
            if (isNaN(br)) { br = 0; }
            if (isNaN(bb)) { bb = 0; }
            if (isNaN(bl)) { bl = 0; }


            var newWidth  = Math.max(0, el.offsetWidth  - br - bl);                                                                                           
            var newHeight = Math.max(0, el.offsetHeight - bt - bb);


            DOM.setStyle( dragEl, "width",  newWidth  + "px" );
            DOM.setStyle( dragEl, "height", newHeight + "px" );
        }
    },

    // overrides YAHOO.util.DragDrop
    b4MouseDown: function(e) {
        this.setStartPosition();
        var x = YAHOO.util.Event.getPageX(e);
        var y = YAHOO.util.Event.getPageY(e);
        this.autoOffset(x, y);

        // This causes the autoscroll code to kick off, which means autoscroll can
        // happen prior to the check for a valid drag handle.
        // this.setDragElPos(x, y);
    },

    // overrides YAHOO.util.DragDrop
    b4StartDrag: function(x, y) {
        // show the drag frame
        this.showFrame(x, y);
    },

    // overrides YAHOO.util.DragDrop
    b4EndDrag: function(e) {
        YAHOO.util.Dom.setStyle(this.getDragEl(), "visibility", "hidden"); 
    },

    // overrides YAHOO.util.DragDrop
    // By default we try to move the element to the last location of the frame.  
    // This is so that the default behavior mirrors that of YAHOO.util.DD.  
    endDrag: function(e) {
        var DOM = YAHOO.util.Dom;
        var lel = this.getEl();
        var del = this.getDragEl();

        // Show the drag frame briefly so we can get its position
        // del.style.visibility = "";
        DOM.setStyle(del, "visibility", ""); 

        // Hide the linked element before the move to get around a Safari 
        // rendering bug.
        //lel.style.visibility = "hidden";
        DOM.setStyle(lel, "visibility", "hidden"); 
        YAHOO.util.DDM.moveToEl(lel, del);
        //del.style.visibility = "hidden";
        DOM.setStyle(del, "visibility", "hidden"); 
        //lel.style.visibility = "";
        DOM.setStyle(lel, "visibility", ""); 
    },

    toString: function() {
        return ("DDProxy " + this.id);
    }
/**
* @event mouseDownEvent
* @description Provides access to the mousedown event. The mousedown does not always result in a drag operation.
* @type YAHOO.util.CustomEvent See <a href="YAHOO.util.Element.html#addListener">Element.addListener</a> for more information on listening for this event.
*/

/**
* @event b4MouseDownEvent
* @description Provides access to the mousedown event, before the mouseDownEvent gets fired. Returning false will cancel the drag.
* @type YAHOO.util.CustomEvent See <a href="YAHOO.util.Element.html#addListener">Element.addListener</a> for more information on listening for this event.
*/

/**
* @event mouseUpEvent
* @description Fired from inside DragDropMgr when the drag operation is finished.
* @type YAHOO.util.CustomEvent See <a href="YAHOO.util.Element.html#addListener">Element.addListener</a> for more information on listening for this event.
*/

/**
* @event b4StartDragEvent
* @description Fires before the startDragEvent, returning false will cancel the startDrag Event.
* @type YAHOO.util.CustomEvent See <a href="YAHOO.util.Element.html#addListener">Element.addListener</a> for more information on listening for this event.
*/

/**
* @event startDragEvent
* @description Occurs after a mouse down and the drag threshold has been met. The drag threshold default is either 3 pixels of mouse movement or 1 full second of holding the mousedown. 
* @type YAHOO.util.CustomEvent See <a href="YAHOO.util.Element.html#addListener">Element.addListener</a> for more information on listening for this event.
*/

/**
* @event b4EndDragEvent
* @description Fires before the endDragEvent. Returning false will cancel.
* @type YAHOO.util.CustomEvent See <a href="YAHOO.util.Element.html#addListener">Element.addListener</a> for more information on listening for this event.
*/

/**
* @event endDragEvent
* @description Fires on the mouseup event after a drag has been initiated (startDrag fired).
* @type YAHOO.util.CustomEvent See <a href="YAHOO.util.Element.html#addListener">Element.addListener</a> for more information on listening for this event.
*/

/**
* @event dragEvent
* @description Occurs every mousemove event while dragging.
* @type YAHOO.util.CustomEvent See <a href="YAHOO.util.Element.html#addListener">Element.addListener</a> for more information on listening for this event.
*/
/**
* @event b4DragEvent
* @description Fires before the dragEvent.
* @type YAHOO.util.CustomEvent See <a href="YAHOO.util.Element.html#addListener">Element.addListener</a> for more information on listening for this event.
*/
/**
* @event invalidDropEvent
* @description Fires when the dragged objects is dropped in a location that contains no drop targets.
* @type YAHOO.util.CustomEvent See <a href="YAHOO.util.Element.html#addListener">Element.addListener</a> for more information on listening for this event.
*/
/**
* @event b4DragOutEvent
* @description Fires before the dragOutEvent
* @type YAHOO.util.CustomEvent See <a href="YAHOO.util.Element.html#addListener">Element.addListener</a> for more information on listening for this event.
*/
/**
* @event dragOutEvent
* @description Fires when a dragged object is no longer over an object that had the onDragEnter fire. 
* @type YAHOO.util.CustomEvent See <a href="YAHOO.util.Element.html#addListener">Element.addListener</a> for more information on listening for this event.
*/
/**
* @event dragEnterEvent
* @description Occurs when the dragged object first interacts with another targettable drag and drop object.
* @type YAHOO.util.CustomEvent See <a href="YAHOO.util.Element.html#addListener">Element.addListener</a> for more information on listening for this event.
*/
/**
* @event b4DragOverEvent
* @description Fires before the dragOverEvent.
* @type YAHOO.util.CustomEvent See <a href="YAHOO.util.Element.html#addListener">Element.addListener</a> for more information on listening for this event.
*/
/**
* @event dragOverEvent
* @description Fires every mousemove event while over a drag and drop object.
* @type YAHOO.util.CustomEvent See <a href="YAHOO.util.Element.html#addListener">Element.addListener</a> for more information on listening for this event.
*/
/**
* @event b4DragDropEvent 
* @description Fires before the dragDropEvent
* @type YAHOO.util.CustomEvent See <a href="YAHOO.util.Element.html#addListener">Element.addListener</a> for more information on listening for this event.
*/
/**
* @event dragDropEvent
* @description Fires when the dragged objects is dropped on another.
* @type YAHOO.util.CustomEvent See <a href="YAHOO.util.Element.html#addListener">Element.addListener</a> for more information on listening for this event.
*/

});
/**
 * A DragDrop implementation that does not move, but can be a drop 
 * target.  You would get the same result by simply omitting implementation 
 * for the event callbacks, but this way we reduce the processing cost of the 
 * event listener and the callbacks.
 * @class DDTarget
 * @extends YAHOO.util.DragDrop 
 * @constructor
 * @param {String} id the id of the element that is a drop target
 * @param {String} sGroup the group of related DragDrop objects
 * @param {object} config an object containing configurable attributes
 *                 Valid properties for DDTarget in addition to those in 
 *                 DragDrop: 
 *                    none
 */
YAHOO.util.DDTarget = function(id, sGroup, config) {
    if (id) {
        this.initTarget(id, sGroup, config);
    }
};

// YAHOO.util.DDTarget.prototype = new YAHOO.util.DragDrop();
YAHOO.extend(YAHOO.util.DDTarget, YAHOO.util.DragDrop, {
    toString: function() {
        return ("DDTarget " + this.id);
    }
});
YAHOO.register("dragdrop", YAHOO.util.DragDropMgr, {version: "2.7.0", build: "1796"});
/*
Copyright (c) 2009, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
version: 2.7.0
*/
/**
 * The selector module provides helper methods allowing CSS3 Selectors to be used with DOM elements.
 * @module selector
 * @title Selector Utility
 * @namespace YAHOO.util
 * @requires yahoo, dom
 */

(function() {
var Y = YAHOO.util;

/**
 * Provides helper methods for collecting and filtering DOM elements.
 * @namespace YAHOO.util
 * @class Selector
 * @static
 */

Y.Selector = {
    _foundCache: [],
    _regexCache: {},

    _re: {
        nth: /^(?:([-]?\d*)(n){1}|(odd|even)$)*([-+]?\d*)$/,
        attr: /(\[.*\])/g,
        urls: /^(?:href|src)/
    },

    /**
     * Default document for use queries 
     * @property document
     * @type object
     * @default window.document
     */
    document: window.document,
    /**
     * Mapping of attributes to aliases, normally to work around HTMLAttributes
     * that conflict with JS reserved words.
     * @property attrAliases
     * @type object
     */
    attrAliases: {
    },

    /**
     * Mapping of shorthand tokens to corresponding attribute selector 
     * @property shorthand
     * @type object
     */
    shorthand: {
        //'(?:(?:[^\\)\\]\\s*>+~,]+)(?:-?[_a-z]+[-\\w]))+#(-?[_a-z]+[-\\w]*)': '[id=$1]',
        '\\#(-?[_a-z]+[-\\w]*)': '[id=$1]',
        '\\.(-?[_a-z]+[-\\w]*)': '[class~=$1]'
    },

    /**
     * List of operators and corresponding boolean functions. 
     * These functions are passed the attribute and the current node's value of the attribute.
     * @property operators
     * @type object
     */
    operators: {
        '=': function(attr, val) { return attr === val; }, // Equality
        '!=': function(attr, val) { return attr !== val; }, // Inequality
        '~=': function(attr, val) { // Match one of space seperated words 
            var s = ' ';
            return (s + attr + s).indexOf((s + val + s)) > -1;
        },
        '|=': function(attr, val) { return attr === val || attr.slice(0, val.length + 1) === val + '-'; }, // Matches value followed by optional hyphen
        '^=': function(attr, val) { return attr.indexOf(val) === 0; }, // Match starts with value
        '$=': function(attr, val) { return attr.slice(-val.length) === val; }, // Match ends with value
        '*=': function(attr, val) { return attr.indexOf(val) > -1; }, // Match contains value as substring 
        '': function(attr, val) { return attr; } // Just test for existence of attribute
    },

    /**
     * List of pseudo-classes and corresponding boolean functions. 
     * These functions are called with the current node, and any value that was parsed with the pseudo regex.
     * @property pseudos
     * @type object
     */
    pseudos: {
        'root': function(node) {
            return node === node.ownerDocument.documentElement;
        },

        'nth-child': function(node, val) {
            return Y.Selector._getNth(node, val);
        },

        'nth-last-child': function(node, val) {
            return Y.Selector._getNth(node, val, null, true);
        },

        'nth-of-type': function(node, val) {
            return Y.Selector._getNth(node, val, node.tagName);
        },
         
        'nth-last-of-type': function(node, val) {
            return Y.Selector._getNth(node, val, node.tagName, true);
        },
         
        'first-child': function(node) {
            return Y.Selector._getChildren(node.parentNode)[0] === node;
        },

        'last-child': function(node) {
            var children = Y.Selector._getChildren(node.parentNode);
            return children[children.length - 1] === node;
        },

        'first-of-type': function(node, val) {
            return Y.Selector._getChildren(node.parentNode, node.tagName)[0];
        },
         
        'last-of-type': function(node, val) {
            var children = Y.Selector._getChildren(node.parentNode, node.tagName);
            return children[children.length - 1];
        },
         
        'only-child': function(node) {
            var children = Y.Selector._getChildren(node.parentNode);
            return children.length === 1 && children[0] === node;
        },

        'only-of-type': function(node) {
            return Y.Selector._getChildren(node.parentNode, node.tagName).length === 1;
        },

        'empty': function(node) {
            return node.childNodes.length === 0;
        },

        'not': function(node, simple) {
            return !Y.Selector.test(node, simple);
        },

        'contains': function(node, str) {
            var text = node.innerText || node.textContent || '';
            return text.indexOf(str) > -1;
        },
        'checked': function(node) {
            return node.checked === true;
        }
    },

    /**
     * Test if the supplied node matches the supplied selector.
     * @method test
     *
     * @param {HTMLElement | String} node An id or node reference to the HTMLElement being tested.
     * @param {string} selector The CSS Selector to test the node against.
     * @return{boolean} Whether or not the node matches the selector.
     * @static
    
     */
    test: function(node, selector) {
        node = Y.Selector.document.getElementById(node) || node;

        if (!node) {
            return false;
        }

        var groups = selector ? selector.split(',') : [];
        if (groups.length) {
            for (var i = 0, len = groups.length; i < len; ++i) {
                if ( Y.Selector._test(node, groups[i]) ) { // passes if ANY group matches
                    return true;
                }
            }
            return false;
        }
        return Y.Selector._test(node, selector);
    },

    _test: function(node, selector, token, deDupe) {
        token = token || Y.Selector._tokenize(selector).pop() || {};

        if (!node.tagName ||
            (token.tag !== '*' && node.tagName !== token.tag) ||
            (deDupe && node._found) ) {
            return false;
        }

        if (token.attributes.length) {
            var val,
                ieFlag,
                re_urls = Y.Selector._re.urls;

            if (!node.attributes || !node.attributes.length) {
                return false;
            }
            for (var i = 0, attr; attr = token.attributes[i++];) {
                ieFlag = (re_urls.test(attr[0])) ? 2 : 0;
                val = node.getAttribute(attr[0], ieFlag);
                if (val === null || val === undefined) {
                    return false;
                }
                if ( Y.Selector.operators[attr[1]] &&
                        !Y.Selector.operators[attr[1]](val, attr[2])) {
                    return false;
                }
            }
        }

        if (token.pseudos.length) {
            for (var i = 0, len = token.pseudos.length; i < len; ++i) {
                if (Y.Selector.pseudos[token.pseudos[i][0]] &&
                        !Y.Selector.pseudos[token.pseudos[i][0]](node, token.pseudos[i][1])) {
                    return false;
                }
            }
        }

        return (token.previous && token.previous.combinator !== ',') ?
                Y.Selector._combinators[token.previous.combinator](node, token) :
                true;
    },

    /**
     * Filters a set of nodes based on a given CSS selector. 
     * @method filter
     *
     * @param {array} nodes A set of nodes/ids to filter. 
     * @param {string} selector The selector used to test each node.
     * @return{array} An array of nodes from the supplied array that match the given selector.
     * @static
     */
    filter: function(nodes, selector) {
        nodes = nodes || [];

        var node,
            result = [],
            tokens = Y.Selector._tokenize(selector);

        if (!nodes.item) { // if not HTMLCollection, handle arrays of ids and/or nodes
            for (var i = 0, len = nodes.length; i < len; ++i) {
                if (!nodes[i].tagName) { // tagName limits to HTMLElements 
                    node = Y.Selector.document.getElementById(nodes[i]);
                    if (node) { // skip IDs that return null 
                        nodes[i] = node;
                    } else {
                    }
                }
            }
        }
        result = Y.Selector._filter(nodes, Y.Selector._tokenize(selector)[0]);
        return result;
    },

    _filter: function(nodes, token, firstOnly, deDupe) {
        var result = firstOnly ? null : [],
            foundCache = Y.Selector._foundCache;

        for (var i = 0, len = nodes.length; i < len; i++) {
            if (! Y.Selector._test(nodes[i], '', token, deDupe)) {
                continue;
            }

            if (firstOnly) {
                return nodes[i];
            }
            if (deDupe) {
                if (nodes[i]._found) {
                    continue;
                }
                nodes[i]._found = true;
                foundCache[foundCache.length] = nodes[i];
            }

            result[result.length] = nodes[i];
        }

        return result;
    },

    /**
     * Retrieves a set of nodes based on a given CSS selector. 
     * @method query
     *
     * @param {string} selector The CSS Selector to test the node against.
     * @param {HTMLElement | String} root optional An id or HTMLElement to start the query from. Defaults to Selector.document.
     * @param {Boolean} firstOnly optional Whether or not to return only the first match.
     * @return {Array} An array of nodes that match the given selector.
     * @static
     */
    query: function(selector, root, firstOnly) {
        var result = Y.Selector._query(selector, root, firstOnly);
        return result;
    },


    _query: function(selector, root, firstOnly, deDupe) {
        var result =  (firstOnly) ? null : [],
            node;

        if (!selector) {
            return result;
        }

        var groups = selector.split(','); // TODO: handle comma in attribute/pseudo

        if (groups.length > 1) {
            var found;
            for (var i = 0, len = groups.length; i < len; ++i) {
                found = arguments.callee(groups[i], root, firstOnly, true);
                result = firstOnly ? found : result.concat(found); 
            }
            Y.Selector._clearFoundCache();
            return result;
        }

        if (root && !root.nodeName) { // assume ID
            root = Y.Selector.document.getElementById(root);
            if (!root) {
                return result;
            }
        }

        root = root || Y.Selector.document;

        if (root.nodeName !== '#document') { // prepend with root selector
            Y.Dom.generateId(root); // TODO: cleanup after?
            selector = root.tagName + '#' + root.id + ' ' + selector;
            node = root;
            root = root.ownerDocument;
        }

        var tokens = Y.Selector._tokenize(selector);
        var idToken = tokens[Y.Selector._getIdTokenIndex(tokens)],
            nodes = [],
            id,
            token = tokens.pop() || {};
            
        if (idToken) {
            id = Y.Selector._getId(idToken.attributes);
        }

        // use id shortcut when possible
        if (id) {
            node = node || Y.Selector.document.getElementById(id);

            if (node && (root.nodeName === '#document' || Y.Dom.isAncestor(root, node))) {
                if ( Y.Selector._test(node, null, idToken) ) {
                    if (idToken === token) {
                        nodes = [node]; // simple selector
                    } else if (idToken.combinator === ' ' || idToken.combinator === '>') {
                        root = node; // start from here
                    }
                }
            } else {
                return result;
            }
        }

        if (root && !nodes.length) {
            nodes = root.getElementsByTagName(token.tag);
        }

        if (nodes.length) {
            result = Y.Selector._filter(nodes, token, firstOnly, deDupe); 
        }

        return result;
    },


    _clearFoundCache: function() {
        var foundCache = Y.Selector._foundCache;
        for (var i = 0, len = foundCache.length; i < len; ++i) {
            try { // IE no like delete
                delete foundCache[i]._found;
            } catch(e) {
                foundCache[i].removeAttribute('_found');
            }
        }
        foundCache = [];
    },


    _getRegExp: function(str, flags) {
        var regexCache = Y.Selector._regexCache;
        flags = flags || '';
        if (!regexCache[str + flags]) {
            regexCache[str + flags] = new RegExp(str, flags);
        }
        return regexCache[str + flags];
    },

    _getChildren: function() {
        if (document.documentElement.children) { // document for capability test
            return function(node, tag) {
                return (tag) ? node.children.tags(tag) : node.children || [];
            };
        } else {
            return function(node, tag) {
                if (node._children) {
                    return node._children;
                }
                var children = [],
                    childNodes = node.childNodes;

                for (var i = 0, len = childNodes.length; i < len; ++i) {
                    if (childNodes[i].tagName) {
                        if (!tag || childNodes[i].tagName === tag) {
                            children[children.length] = childNodes[i];
                        }
                    }
                }
                node._children = children;
                return children;
            };
        }
    }(),

    _combinators: {
        ' ': function(node, token) {
            while ( (node = node.parentNode) ) {
                if (Y.Selector._test(node, '', token.previous)) {
                    return true;
                }
            }  
            return false;
        },

        '>': function(node, token) {
            return Y.Selector._test(node.parentNode, null, token.previous);
        },

        '+': function(node, token) {
            var sib = node.previousSibling;
            while (sib && sib.nodeType !== 1) {
                sib = sib.previousSibling;
            }

            if (sib && Y.Selector._test(sib, null, token.previous)) {
                return true; 
            }
            return false;
        },

        '~': function(node, token) {
            var sib = node.previousSibling;
            while (sib) {
                if (sib.nodeType === 1 && Y.Selector._test(sib, null, token.previous)) {
                    return true;
                }
                sib = sib.previousSibling;
            }

            return false;
        }
    },


    /*
        an+b = get every _a_th node starting at the _b_th
        0n+b = no repeat ("0" and "n" may both be omitted (together) , e.g. "0n+1" or "1", not "0+1"), return only the _b_th element
        1n+b =  get every element starting from b ("1" may may be omitted, e.g. "1n+0" or "n+0" or "n")
        an+0 = get every _a_th element, "0" may be omitted 
    */
    _getNth: function(node, expr, tag, reverse) {
        Y.Selector._re.nth.test(expr);
        var a = parseInt(RegExp.$1, 10), // include every _a_ elements (zero means no repeat, just first _a_)
            n = RegExp.$2, // "n"
            oddeven = RegExp.$3, // "odd" or "even"
            b = parseInt(RegExp.$4, 10) || 0, // start scan from element _b_
            result = [],
            op;

        var siblings = Y.Selector._getChildren(node.parentNode, tag);

        if (oddeven) {
            a = 2; // always every other
            op = '+';
            n = 'n';
            b = (oddeven === 'odd') ? 1 : 0;
        } else if ( isNaN(a) ) {
            a = (n) ? 1 : 0; // start from the first or no repeat
        }

        if (a === 0) { // just the first
            if (reverse) {
                b = siblings.length - b + 1; 
            }

            if (siblings[b - 1] === node) {
                return true;
            } else {
                return false;
            }

        } else if (a < 0) {
            reverse = !!reverse;
            a = Math.abs(a);
        }

        if (!reverse) {
            for (var i = b - 1, len = siblings.length; i < len; i += a) {
                if ( i >= 0 && siblings[i] === node ) {
                    return true;
                }
            }
        } else {
            for (var i = siblings.length - b, len = siblings.length; i >= 0; i -= a) {
                if ( i < len && siblings[i] === node ) {
                    return true;
                }
            }
        }
        return false;
    },

    _getId: function(attr) {
        for (var i = 0, len = attr.length; i < len; ++i) {
            if (attr[i][0] == 'id' && attr[i][1] === '=') {
                return attr[i][2];
            }
        }
    },

    _getIdTokenIndex: function(tokens) {
        for (var i = 0, len = tokens.length; i < len; ++i) {
            if (Y.Selector._getId(tokens[i].attributes)) {
                return i;
            }
        }
        return -1;
    },

    _patterns: {
        tag: /^((?:-?[_a-z]+[\w-]*)|\*)/i,
        attributes: /^\[([a-z]+\w*)+([~\|\^\$\*!=]=?)?['"]?([^\]]*?)['"]?\]/i,
        pseudos: /^:([-\w]+)(?:\(['"]?(.+)['"]?\))*/i,
        combinator: /^\s*([>+~]|\s)\s*/
    },

    /**
        Break selector into token units per simple selector.
        Combinator is attached to left-hand selector.
     */
    _tokenize: function(selector) {
        var token = {},     // one token per simple selector (left selector holds combinator)
            tokens = [],    // array of tokens
            id,             // unique id for the simple selector (if found)
            found = false,  // whether or not any matches were found this pass
            patterns = Y.Selector._patterns,
            match;          // the regex match

        selector = Y.Selector._replaceShorthand(selector); // convert ID and CLASS shortcuts to attributes

        /*
            Search for selector patterns, store, and strip them from the selector string
            until no patterns match (invalid selector) or we run out of chars.

            Multiple attributes and pseudos are allowed, in any order.
            for example:
                'form:first-child[type=button]:not(button)[lang|=en]'
        */
        do {
            found = false; // reset after full pass
            for (var re in patterns) {
                if (YAHOO.lang.hasOwnProperty(patterns, re)) {
                    if (re != 'tag' && re != 'combinator') { // only one allowed
                        token[re] = token[re] || [];
                    }
                    if ( (match = patterns[re].exec(selector)) ) { // note assignment
                        found = true;
                        if (re != 'tag' && re != 'combinator') { // only one allowed
                            // capture ID for fast path to element
                            if (re === 'attributes' && match[1] === 'id') {
                                token.id = match[3];
                            }

                            token[re].push(match.slice(1));
                        } else { // single selector (tag, combinator)
                            token[re] = match[1];
                        }
                        selector = selector.replace(match[0], ''); // strip current match from selector
                        if (re === 'combinator' || !selector.length) { // next token or done
                            token.attributes = Y.Selector._fixAttributes(token.attributes);
                            token.pseudos = token.pseudos || [];
                            token.tag = token.tag ? token.tag.toUpperCase() : '*';
                            tokens.push(token);

                            token = { // prep next token
                                previous: token
                            };
                        }
                    }
                }
            }
        } while (found);

        return tokens;
    },


    _fixAttributes: function(attr) {
        var aliases = Y.Selector.attrAliases;
        attr = attr || [];
        for (var i = 0, len = attr.length; i < len; ++i) {
            if (aliases[attr[i][0]]) { // convert reserved words, etc
                attr[i][0] = aliases[attr[i][0]];
            }
            if (!attr[i][1]) { // use exists operator
                attr[i][1] = '';
            }
        }
        return attr;
    },

    _replaceShorthand: function(selector) {
        var shorthand = Y.Selector.shorthand;

        //var attrs = selector.match(Y.Selector._patterns.attributes); // pull attributes to avoid false pos on "." and "#"
        var attrs = selector.match(Y.Selector._re.attr); // pull attributes to avoid false pos on "." and "#"
        if (attrs) {
            selector = selector.replace(Y.Selector._re.attr, 'REPLACED_ATTRIBUTE');
        }
        for (var re in shorthand) {
            if (YAHOO.lang.hasOwnProperty(shorthand, re)) {
                selector = selector.replace(Y.Selector._getRegExp(re, 'gi'), shorthand[re]);
            }
        }

        if (attrs) {
            for (var i = 0, len = attrs.length; i < len; ++i) {
                selector = selector.replace('REPLACED_ATTRIBUTE', attrs[i]);
            }
        }
        return selector;
    }
};

if (YAHOO.env.ua.ie && YAHOO.env.ua.ie < 8) { // rewrite class for IE < 8
    Y.Selector.attrAliases['class'] = 'className';
    Y.Selector.attrAliases['for'] = 'htmlFor';
}

})();
YAHOO.register("selector", YAHOO.util.Selector, {version: "2.7.0", build: "1796"});
/*
Copyright (c) 2009, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
version: 2.7.0
*/
/**
 * Provides methods to parse JSON strings and convert objects to JSON strings.
 * @module json
 * @class JSON
 * @static
 */
YAHOO.lang.JSON = (function () {

var l = YAHOO.lang,

    /**
     * Replace certain Unicode characters that JavaScript may handle incorrectly
     * during eval--either by deleting them or treating them as line
     * endings--with escape sequences.
     * IMPORTANT NOTE: This regex will be used to modify the input if a match is
     * found.
     * @property _UNICODE_EXCEPTIONS
     * @type {RegExp}
     * @private
     */
    _UNICODE_EXCEPTIONS = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,

    /**
     * First step in the validation.  Regex used to replace all escape
     * sequences (i.e. "\\", etc) with '@' characters (a non-JSON character).
     * @property _ESCAPES
     * @type {RegExp}
     * @static
     * @private
     */
    _ESCAPES = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,

    /**
     * Second step in the validation.  Regex used to replace all simple
     * values with ']' characters.
     * @property _VALUES
     * @type {RegExp}
     * @static
     * @private
     */
    _VALUES  = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,

    /**
     * Third step in the validation.  Regex used to remove all open square
     * brackets following a colon, comma, or at the beginning of the string.
     * @property _BRACKETS
     * @type {RegExp}
     * @static
     * @private
     */
    _BRACKETS = /(?:^|:|,)(?:\s*\[)+/g,

    /**
     * Final step in the validation.  Regex used to test the string left after
     * all previous replacements for invalid characters.
     * @property _INVALID
     * @type {RegExp}
     * @static
     * @private
     */
    _INVALID  = /^[\],:{}\s]*$/,

    /**
     * Regex used to replace special characters in strings for JSON
     * stringification.
     * @property _SPECIAL_CHARS
     * @type {RegExp}
     * @static
     * @private
     */
    _SPECIAL_CHARS = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,

    /**
     * Character substitution map for common escapes and special characters.
     * @property _CHARS
     * @type {Object}
     * @static
     * @private
     */
    _CHARS = {
        '\b': '\\b',
        '\t': '\\t',
        '\n': '\\n',
        '\f': '\\f',
        '\r': '\\r',
        '"' : '\\"',
        '\\': '\\\\'
    };

/**
 * Traverses nested objects, applying a filter or reviver function to
 * each value.  The value returned from the function will replace the
 * original value in the key:value pair.  If the value returned is
 * undefined, the key will be omitted from the returned object.
 * @method _revive
 * @param data {MIXED} Any JavaScript data
 * @param reviver {Function} filter or mutation function
 * @return {MIXED} The results of the filtered/mutated data structure
 * @private
 */
function _revive(data, reviver) {
    var walk = function (o,key) {
        var k,v,value = o[key];
        if (value && typeof value === 'object') {
            for (k in value) {
                if (l.hasOwnProperty(value,k)) {
                    v = walk(value, k);
                    if (v === undefined) {
                        delete value[k];
                    } else {
                        value[k] = v;
                    }
                }
            }
        }
        return reviver.call(o,key,value);
    };

    return typeof reviver === 'function' ? walk({'':data},'') : data;
}

/**
 * Escapes a special character to a safe Unicode representation
 * @method _char
 * @param c {String} single character to escape
 * @return {String} safe Unicode escape
 */
function _char(c) {
    if (!_CHARS[c]) {
        _CHARS[c] =  '\\u'+('0000'+(+(c.charCodeAt(0))).toString(16)).slice(-4);
    }
    return _CHARS[c];
}

/**
 * Replace certain Unicode characters that may be handled incorrectly by
 * some browser implementations.
 * @method _prepare
 * @param s {String} parse input
 * @return {String} sanitized JSON string ready to be validated/parsed
 * @private
 */
function _prepare(s) {
    return s.replace(_UNICODE_EXCEPTIONS, _char);
}

/**
 * Four step determination whether a string is valid JSON.  In three steps,
 * escape sequences, safe values, and properly placed open square brackets
 * are replaced with placeholders or removed.  Then in the final step, the
 * result of all these replacements is checked for invalid characters.
 * @method _isValid
 * @param str {String} JSON string to be tested
 * @return {boolean} is the string safe for eval?
 * @static
 */
function _isValid(str) {
    return l.isString(str) &&
            _INVALID.test(str.
            replace(_ESCAPES,'@').
            replace(_VALUES,']').
            replace(_BRACKETS,''));
}

/**
 * Enclose escaped strings in quotes
 * @method _string
 * @param s {String} string to wrap
 * @return {String} '"'+s+'"' after s has had special characters escaped
 * @private
 */
function _string(s) {
    return '"' + s.replace(_SPECIAL_CHARS, _char) + '"';
}

/**
 * Worker function used by public stringify.
 * @method _stringify
 * @param h {Object} object holding the key
 * @param key {String} String key in object h to serialize
 * @param depth {Number} depth to serialize
 * @param w {Array|Function} array of whitelisted keys OR replacer function
 * @param pstack {Array} used to protect against recursion
 * @return {String} serialized version of o
 */
function _stringify(h,key,d,w,pstack) {
    var o = typeof w === 'function' ? w.call(h,key,h[key]) : h[key],
        i,len,j, // array iteration
        k,v,     // object iteration
        isArray, // forking in typeof 'object'
        a;       // composition array for performance over string concat

    if (o instanceof Date) {
        o = l.JSON.dateToString(o);
    } else if (o instanceof String || o instanceof Boolean || o instanceof Number) {
        o = o.valueOf();
    }

    switch (typeof o) {
        case 'string' : return _string(o);
        case 'number' : return isFinite(o) ? String(o) : 'null';
        case 'boolean': return String(o);
        case 'object' :
            // null
            if (o === null) {
                return 'null';
            }

            // Check for cyclical references
            for (i = pstack.length - 1; i >= 0; --i) {
                if (pstack[i] === o) {
                    return 'null';
                }
            }

            // Add the object to the processing stack
            pstack[pstack.length] = o;

            a = [];
            isArray = l.isArray(o);

            // Only recurse if we're above depth config
            if (d > 0) {
                // Array
                if (isArray) {
                    for (i = o.length - 1; i >= 0; --i) {
                        a[i] = _stringify(o,i,d-1,w,pstack) || 'null';
                    }

                // Object
                } else {
                    j = 0;
                    // Use whitelist keys if provided as an array
                    if (l.isArray(w)) {
                        for (i = 0, len = w.length; i < len; ++i) {
                            k = w[i];
                            v = _stringify(o,k,d-1,w,pstack);
                            if (v) {
                                a[j++] = _string(k) + ':' + v;
                            }
                        }
                    } else {
                        for (k in o) {
                            if (typeof k === 'string' && l.hasOwnProperty(o,k)) {
                                v = _stringify(o,k,d-1,w,pstack);
                                if (v) {
                                    a[j++] = _string(k) + ':' + v;
                                }
                            }
                        }
                    }

                    // sort object keys for easier readability
                    a.sort();
                }
            }

            // remove the object from the stack
            pstack.pop();

            return isArray ? '['+a.join(',')+']' : '{'+a.join(',')+'}';
    }

    return undefined; // invalid input
}

// Return the public API
return {
    /**
     * Four step determination whether a string is valid JSON.  In three steps,
     * escape sequences, safe values, and properly placed open square brackets
     * are replaced with placeholders or removed.  Then in the final step, the
     * result of all these replacements is checked for invalid characters.
     * @method isValid
     * @param str {String} JSON string to be tested
     * @return {boolean} is the string safe for eval?
     * @static
     */
    isValid : function (s) {
        return _isValid(_prepare(s));
    },

    /**
     * Parse a JSON string, returning the native JavaScript representation.
     * Only minor modifications from http://www.json.org/json2.js.
     * @param s {string} JSON string data
     * @param reviver {function} (optional) function(k,v) passed each key:value
     *          pair of object literals, allowing pruning or altering values
     * @return {MIXED} the native JavaScript representation of the JSON string
     * @throws SyntaxError
     * @method parse
     * @static
     */
    parse : function (s,reviver) {
        // sanitize
        s = _prepare(s);

        // Ensure valid JSON
        if (_isValid(s)) {
            // Eval the text into a JavaScript data structure, apply the
            // reviver function if provided, and return
            return _revive( eval('(' + s + ')'), reviver );
        }

        // The text is not valid JSON
        throw new SyntaxError('parseJSON');
    },

    /**
     * Converts an arbitrary value to a JSON string representation.
     * Cyclical object or array references are replaced with null.
     * If a whitelist is provided, only matching object keys will be included.
     * If a depth limit is provided, objects and arrays at that depth will
     * be stringified as empty.
     * @method stringify
     * @param o {MIXED} any arbitrary object to convert to JSON string
     * @param w {Array|Function} (optional) whitelist of acceptable object keys to include OR a function(value,key) to alter values before serialization
     * @param d {number} (optional) depth limit to recurse objects/arrays (practical minimum 1)
     * @return {string} JSON string representation of the input
     * @static
     */
    stringify : function (o,w,d) {
        if (o !== undefined) {
            // Ensure whitelist keys are unique (bug 2110391)
            if (l.isArray(w)) {
                w = (function (a) {
                    var uniq=[],map={},v,i,j,len;
                    for (i=0,j=0,len=a.length; i<len; ++i) {
                        v = a[i];
                        if (typeof v === 'string' && map[v] === undefined) {
                            uniq[(map[v] = j++)] = v;
                        }
                    }
                    return uniq;
                })(w);
            }

            // Default depth to POSITIVE_INFINITY
            d = d >= 0 ? d : 1/0;

            // process the input
            return _stringify({'':o},'',d,w,[]);
        }

        return undefined;
    },

    /**
     * Serializes a Date instance as a UTC date string.  Used internally by
     * stringify.  Override this method if you need Dates serialized in a
     * different format.
     * @method dateToString
     * @param d {Date} The Date to serialize
     * @return {String} stringified Date in UTC format YYYY-MM-DDTHH:mm:SSZ
     * @static
     */
    dateToString : function (d) {
        function _zeroPad(v) {
            return v < 10 ? '0' + v : v;
        }

        return d.getUTCFullYear()         + '-' +
            _zeroPad(d.getUTCMonth() + 1) + '-' +
            _zeroPad(d.getUTCDate())      + 'T' +
            _zeroPad(d.getUTCHours())     + ':' +
            _zeroPad(d.getUTCMinutes())   + ':' +
            _zeroPad(d.getUTCSeconds())   + 'Z';
    },

    /**
     * Reconstitute Date instances from the default JSON UTC serialization.
     * Reference this from a reviver function to rebuild Dates during the
     * parse operation.
     * @method stringToDate
     * @param str {String} String serialization of a Date
     * @return {Date}
     */
    stringToDate : function (str) {
        if (/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})Z$/.test(str)) {
            var d = new Date();
            d.setUTCFullYear(RegExp.$1, (RegExp.$2|0)-1, RegExp.$3);
            d.setUTCHours(RegExp.$4, RegExp.$5, RegExp.$6);
            return d;
        }
        return str;
    }
};

})();
YAHOO.register("json", YAHOO.lang.JSON, {version: "2.7.0", build: "1796"});
/*
Copyright (c) 2009, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
version: 2.7.0
*/
/**
 * Utilities for cookie management
 * @namespace YAHOO.util
 * @module cookie
 */
YAHOO.namespace("util");

/**
 * Cookie utility.
 * @class Cookie
 * @static
 */
YAHOO.util.Cookie = {
    
    //-------------------------------------------------------------------------
    // Private Methods
    //-------------------------------------------------------------------------
    
    /**
     * Creates a cookie string that can be assigned into document.cookie.
     * @param {String} name The name of the cookie.
     * @param {String} value The value of the cookie.
     * @param {encodeValue} encodeValue True to encode the value, false to leave as-is.
     * @param {Object} options (Optional) Options for the cookie.
     * @return {String} The formatted cookie string.
     * @method _createCookieString
     * @private
     * @static
     */
    _createCookieString : function (name /*:String*/, value /*:Variant*/, encodeValue /*:Boolean*/, options /*:Object*/) /*:String*/ {
    
        //shortcut
        var lang = YAHOO.lang;
    
        var text /*:String*/ = encodeURIComponent(name) + "=" + (encodeValue ? encodeURIComponent(value) : value);
        
    
        if (lang.isObject(options)){
            //expiration date
            if (options.expires instanceof Date){
                text += "; expires=" + options.expires.toGMTString();
            }
        
            //path
            if (lang.isString(options.path) && options.path != ""){
                text += "; path=" + options.path;
            }
    
            //domain
            if (lang.isString(options.domain) && options.domain != ""){
                text += "; domain=" + options.domain;
            }
            
            //secure
            if (options.secure === true){
                text += "; secure";
            }
        }
        
        return text;
    },
    
    /**
     * Formats a cookie value for an object containing multiple values.
     * @param {Object} hash An object of key-value pairs to create a string for.
     * @return {String} A string suitable for use as a cookie value.
     * @method _createCookieHash
     * @private
     * @static
     */
    _createCookieHashString : function (hash /*:Object*/) /*:String*/ {
        
        //shortcuts
        var lang = YAHOO.lang;
        
        if (!lang.isObject(hash)){
            throw new TypeError("Cookie._createCookieHashString(): Argument must be an object.");
        }
        
        var text /*:Array*/ = new Array();
        
        for (var key in hash){
            if (lang.hasOwnProperty(hash, key) && !lang.isFunction(hash[key]) && !lang.isUndefined(hash[key])){
                text.push(encodeURIComponent(key) + "=" + encodeURIComponent(String(hash[key])));
            }
        }
        
        return text.join("&");
    },
    
    /**
     * Parses a cookie hash string into an object.
     * @param {String} text The cookie hash string to parse. The string should already be URL-decoded.
     * @return {Object} An object containing entries for each cookie value.
     * @method _parseCookieHash
     * @private
     * @static
     */
    _parseCookieHash : function (text /*:String*/) /*:Object*/ {
    
        var hashParts /*:Array*/ = text.split("&"),
            hashPart /*:Array*/ = null,
            hash /*:Object*/ = new Object();
        
        if (text.length > 0){
            for (var i=0, len=hashParts.length; i < len; i++){
                hashPart = hashParts[i].split("=");
                hash[decodeURIComponent(hashPart[0])] = decodeURIComponent(hashPart[1]);
            }
        }
        
        return hash;
    },    
    
    /**
     * Parses a cookie string into an object representing all accessible cookies.
     * @param {String} text The cookie string to parse.
     * @param {Boolean} decode (Optional) Indicates if the cookie values should be decoded or not. Default is true.
     * @return {Object} An object containing entries for each accessible cookie.
     * @method _parseCookieString
     * @private
     * @static
     */
    _parseCookieString : function (text /*:String*/, decode /*:Boolean*/) /*:Object*/ {
    
        var cookies /*:Object*/ = new Object();        
        
        if (YAHOO.lang.isString(text) && text.length > 0) {
        
            var decodeValue = (decode === false ? function(s){return s;} : decodeURIComponent);
        
            if (/[^=]+=[^=;]?(?:; [^=]+=[^=]?)?/.test(text)){            
                var cookieParts /*:Array*/ = text.split(/;\s/g),
                    cookieName /*:String*/ = null,
                    cookieValue /*:String*/ = null,
                    cookieNameValue /*:Array*/ = null;
                
                for (var i=0, len=cookieParts.length; i < len; i++){
                
                    //check for normally-formatted cookie (name-value)
                    cookieNameValue = cookieParts[i].match(/([^=]+)=/i);
                    if (cookieNameValue instanceof Array){
                        try {
                            cookieName = decodeURIComponent(cookieNameValue[1]);
                            cookieValue = decodeValue(cookieParts[i].substring(cookieNameValue[1].length+1));
                        } catch (ex){
                            //ignore the entire cookie - encoding is likely invalid
                        }
                    } else {
                        //means the cookie does not have an "=", so treat it as a boolean flag
                        cookieName = decodeURIComponent(cookieParts[i]);
                        cookieValue = cookieName;
                    }
                    cookies[cookieName] = cookieValue;
                }
            }
        }
        
        return cookies;
    },    
    
    //-------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------

    /**
     * Returns the cookie value for the given name.
     * @param {String} name The name of the cookie to retrieve.
     * @param {Function} converter (Optional) A function to run on the value before returning
     *      it. The function is not used if the cookie doesn't exist.
     * @return {Variant} If no converter is specified, returns a string or null if
     *      the cookie doesn't exist. If the converter is specified, returns the value
     *      returned from the converter or null if the cookie doesn't exist.
     * @method get
     * @static
     */
    get : function (name /*:String*/, converter /*:Function*/) /*:Variant*/{
        
        var lang = YAHOO.lang;
        var cookies /*:Object*/ = this._parseCookieString(document.cookie);        
        
        if (!lang.isString(name) || name === ""){
            throw new TypeError("Cookie.get(): Cookie name must be a non-empty string.");
        }
        
        if (lang.isUndefined(cookies[name])) {
            return null;
        }
        
        if (!lang.isFunction(converter)){
            return cookies[name];
        } else {
            return converter(cookies[name]);
        }
    },
    
    /**
     * Returns the value of a subcookie.
     * @param {String} name The name of the cookie to retrieve.
     * @param {String} subName The name of the subcookie to retrieve.
     * @param {Function} converter (Optional) A function to run on the value before returning
     *      it. The function is not used if the cookie doesn't exist.
     * @return {Variant} If the cookie doesn't exist, null is returned. If the subcookie
     *      doesn't exist, null if also returned. If no converter is specified and the
     *      subcookie exists, a string is returned. If a converter is specified and the
     *      subcookie exists, the value returned from the converter is returned.
     * @method getSub
     * @static
     */
    getSub : function (name /*:String*/, subName /*:String*/, converter /*:Function*/) /*:Variant*/ {
    
        var lang = YAHOO.lang;    
        var hash /*:Variant*/ = this.getSubs(name);  

        if (hash !== null) {
            
            if (!lang.isString(subName) || subName === ""){
                throw new TypeError("Cookie.getSub(): Subcookie name must be a non-empty string.");
            }
            
            if (lang.isUndefined(hash[subName])){
                return null;
            }            
        
            if (!lang.isFunction(converter)){
                return hash[subName];
            } else {
                return converter(hash[subName]);
            }
        } else {
            return null;
        }
    
    },
    
    /**
     * Returns an object containing name-value pairs stored in the cookie with the given name.
     * @param {String} name The name of the cookie to retrieve.
     * @return {Object} An object of name-value pairs if the cookie with the given name
     *      exists, null if it does not.
     * @method getHash
     * @static
     */
    getSubs : function (name /*:String*/) /*:Object*/ {
        
        //check cookie name
        if (!YAHOO.lang.isString(name) || name === ""){
            throw new TypeError("Cookie.getSubs(): Cookie name must be a non-empty string.");
        }
        
        var cookies = this._parseCookieString(document.cookie, false);
        if (YAHOO.lang.isString(cookies[name])){
            return this._parseCookieHash(cookies[name]);
        }
        return null;
    },
    
    /**
     * Removes a cookie from the machine by setting its expiration date to
     * sometime in the past.
     * @param {String} name The name of the cookie to remove.
     * @param {Object} options (Optional) An object containing one or more
     *      cookie options: path (a string), domain (a string), 
     *      and secure (true/false). The expires option will be overwritten
     *      by the method.
     * @return {String} The created cookie string.
     * @method remove
     * @static
     */
    remove : function (name /*:String*/, options /*:Object*/) /*:String*/ {
        
        //check cookie name
        if (!YAHOO.lang.isString(name) || name === ""){
            throw new TypeError("Cookie.remove(): Cookie name must be a non-empty string.");
        }
        
        //set options
        options = options || {};
        options.expires = new Date(0);
        
        //set cookie
        return this.set(name, "", options);
    },

    /**
     * Removes a sub cookie with a given name.
     * @param {String} name The name of the cookie in which the subcookie exists.
     * @param {String} subName The name of the subcookie to remove.
     * @param {Object} options (Optional) An object containing one or more
     *      cookie options: path (a string), domain (a string), expires (a Date object),
     *      and secure (true/false). This must be the same settings as the original
     *      subcookie.
     * @return {String} The created cookie string.
     * @method removeSub
     * @static
     */
    removeSub : function(name /*:String*/, subName /*:String*/, options /*:Object*/) /*:String*/ {
    
        //check cookie name
        if (!YAHOO.lang.isString(name) || name === ""){
            throw new TypeError("Cookie.removeSub(): Cookie name must be a non-empty string.");
        }
        
        //check subcookie name
        if (!YAHOO.lang.isString(subName) || subName === ""){
            throw new TypeError("Cookie.removeSub(): Subcookie name must be a non-empty string.");
        }
        
        //get all subcookies for this cookie
        var subs = this.getSubs(name);
        
        //delete the indicated subcookie
        if (YAHOO.lang.isObject(subs) && YAHOO.lang.hasOwnProperty(subs, subName)){
            delete subs[subName];
            
            //reset the cookie
            return this.setSubs(name, subs, options);
        } else {
            return "";
        }
        
    },

    /**
     * Sets a cookie with a given name and value.
     * @param {String} name The name of the cookie to set.
     * @param {Variant} value The value to set for the cookie.
     * @param {Object} options (Optional) An object containing one or more
     *      cookie options: path (a string), domain (a string), expires (a Date object),
     *      and secure (true/false).
     * @return {String} The created cookie string.
     * @method set
     * @static
     */
    set : function (name /*:String*/, value /*:Variant*/, options /*:Object*/) /*:String*/ {
    
        var lang = YAHOO.lang;
    
        if (!lang.isString(name)){
            throw new TypeError("Cookie.set(): Cookie name must be a string.");
        }
        
        if (lang.isUndefined(value)){
            throw new TypeError("Cookie.set(): Value cannot be undefined.");
        }
        
    
        var text /*:String*/ = this._createCookieString(name, value, true, options);
        document.cookie = text;
        return text;
    },
        
    /**
     * Sets a sub cookie with a given name to a particular value.
     * @param {String} name The name of the cookie to set.
     * @param {String} subName The name of the subcookie to set.
     * @param {Variant} value The value to set.
     * @param {Object} options (Optional) An object containing one or more
     *      cookie options: path (a string), domain (a string), expires (a Date object),
     *      and secure (true/false).
     * @return {String} The created cookie string.
     * @method setSub
     * @static
     */
    setSub : function (name /*:String*/, subName /*:String*/, value /*:Variant*/, options /*:Object*/) /*:String*/ {
        
        var lang = YAHOO.lang;

        if (!lang.isString(name) || name === ""){
            throw new TypeError("Cookie.setSub(): Cookie name must be a non-empty string.");
        }

        if (!lang.isString(subName) || subName === ""){
            throw new TypeError("Cookie.setSub(): Subcookie name must be a non-empty string.");
        }
        
        if (lang.isUndefined(value)){
            throw new TypeError("Cookie.setSub(): Subcookie value cannot be undefined.");
        }

        var hash /*:Object*/ = this.getSubs(name);
        
        if (!lang.isObject(hash)){
            hash = new Object();
        }
        
        hash[subName] = value;        
        
        return this.setSubs(name, hash, options);
        
    },
    
    /**
     * Sets a cookie with a given name to contain a hash of name-value pairs.
     * @param {String} name The name of the cookie to set.
     * @param {Object} value An object containing name-value pairs.
     * @param {Object} options (Optional) An object containing one or more
     *      cookie options: path (a string), domain (a string), expires (a Date object),
     *      and secure (true/false).
     * @return {String} The created cookie string.
     * @method setSubs
     * @static
     */
    setSubs : function (name /*:String*/, value /*:Object*/, options /*:Object*/) /*:String*/ {
        
        var lang = YAHOO.lang;
        
        if (!lang.isString(name)){
            throw new TypeError("Cookie.setSubs(): Cookie name must be a string.");
        }
        
        if (!lang.isObject(value)){
            throw new TypeError("Cookie.setSubs(): Cookie value must be an object.");
        }
    
        var text /*:String*/ = this._createCookieString(name, this._createCookieHashString(value), false, options);
        document.cookie = text;
        return text;        
    }    

};

YAHOO.register("cookie", YAHOO.util.Cookie, {version: "2.7.0", build: "1796"});
/*!
Taobao JavaScript Framework base on YUI.
T-Bra or TB-ra whatever you like name it...
version 1.0
*/

// Mozilla 1.8 has support for indexOf, lastIndexOf, forEach, filter, map, some, every

/**
 * 获取元素在数组中的位置
 *
 * @param  Object    元素
 * @param  Intger    fromIndex - 起始位置
 * @link http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Objects:Array:indexOf
 * @return Intger
 */
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (obj, fromIndex) {
        if (fromIndex == null) {
            fromIndex = 0;
        } else if (fromIndex < 0) {
            fromIndex = Math.max(0, this.length + fromIndex);
        }
        for (var i = fromIndex; i < this.length; i++) {
            if (this[i] === obj)
                return i;
        }
        return -1;
    };
}

/**
 * 反向查找元素在数组中的位置
 *
 * @param  object    元素
 * @param  fromIndex 起始位置
 * @link http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Objects:Array:lastIndexOf
 * @return int
 */
if (!Array.prototype.lastIndexOf) {
    Array.prototype.lastIndexOf = function (obj, fromIndex) {
        if (fromIndex == null) {
            fromIndex = this.length - 1;
        } else if (fromIndex < 0) {
            fromIndex = Math.max(0, this.length + fromIndex);
        }
        for (var i = fromIndex; i >= 0; i--) {
            if (this[i] === obj)
                return i;
        }
        return -1;
    };
}


/**
 * 回调执行数组内的元素
 *
 * @param  fucntion Function to test each element of the array.
 * @link   http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Global_Objects:Array:forEach
 */
if (!Array.prototype.forEach) {
    Array.prototype.forEach = function(fun /*, thisp*/) {
        var len = this.length;
        if (typeof fun != "function") {
            throw new TypeError();
        }
        var thisp = arguments[1];
        for (var i = 0; i < len; i++) {
            if (i in this) {
                fun.call(thisp, this[i], i, this);
            }
        }
    };
}

/**
 * 过滤数组内的元素
 *
 * @param  fucntion Function to test each element of the array.
 * @link   http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Global_Objects:Array:filter
 * @return Array
 */
if (!Array.prototype.filter) {
    Array.prototype.filter = function(fun) {
        var len = this.length;
        if (typeof fun != "function") {
          throw new TypeError();
        }
        var res   = [];
        var thisp = arguments[1];
        for (var i = 0; i < len; i++) {
            if (i in this) {
                var val = this[i]; // in case fun mutates this
                if (fun.call(thisp, val, i, this)) {
                    res.push(val);
                }
            }
        }
        return res;
    };
}


/**
 * 映射执行数组内的元素并返回结果
 *
 * @param  fucntion Function to test each element of the array.
 * @link http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Global_Objects:Array:map
 * @return Array
 */
if (!Array.prototype.map) {
    Array.prototype.map = function(fun /*, thisp*/) {
        var len = this.length;
        if (typeof fun != "function") {
            throw new TypeError();
        }
        var res   = new Array(len);
        var thisp = arguments[1];
        for (var i = 0; i < len; i++) {
            if (i in this) {
                res[i] = fun.call(thisp, this[i], i, this);
            }
        }

        return res;
    };
}


/**
 * 测试是否有些数组的元素执行通过回调函数
 *
 * @param  fucntion Function to test each element of the array.
 * @link   http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Global_Objects:Array:some
 * @return bool
 */
if (!Array.prototype.some) {
    Array.prototype.some = function(fun /*, thisp*/) {
        var len = this.length;
        if (typeof fun != "function") {
            throw new TypeError();
        }

        var thisp = arguments[1];
        for (var i = 0; i < len; i++) {
            if (i in this && fun.call(thisp, this[i], i, this)) {
                return true;
            }
        }

        return false;
    };
}


/**
 * 测试是否数组的所有元素执行通过回调函数
 *
 * @param function Function to test for each element. 
 * @link  http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Objects:Array:every
 * @return bool
 */
if (!Array.prototype.every) {
    Array.prototype.every = function(fun) {
        var len = this.length;
        if (typeof fun != "function") {
            throw new TypeError();
        }
        var thisp = arguments[1];
        for (var i = 0; i < len; i++) {
            if (i in this && !fun.call(thisp, this[i], i, this)) {
                return false;
            }
        }
        return true;
    };
}

/**
 * 复制一个数组，Generic 化后也可用于将 arguments/NodeList 转化为数组。
 *
 * @return Array
 */
Array.prototype.copy = function () {
	var len = this.length;
	var res = new Array(len);
	for (var i = 0; i < len; i++) {
		res[i] = this[i];
	}
	return res;
};

/**
 * 移除数组中的指定元素
 * 为保持代码兼容性，保留此方法 
 */
Array.prototype.remove = function(elt) {
	var i = this.indexOf(elt);
    return (i != -1) ? this.splice(i, 1) : false;
};

/**
 * Generic化 indexOf/lastIndexOf/forEach/filter/map/some/every/copy 8个数组原型方法
 * 可使用 Array.xxxx 的形式调用，如：
 * 		arr.forEach(fun) 
 * 也可以改写为 
 * 		Array.forEach(arr, fun);
 * 同时，Array.xxxxx 的形式支持传递 arguments/NodeList 对象最为第一个参数 
 */
(function(){
	['indexOf','lastIndexOf','forEach','filter','map','some','every','copy'].forEach(
		function(m) {
			if (!Array[m]) {
				Array[m] = function(scope){
					return Array.prototype[m].apply(scope, Array.prototype.slice.call(arguments, 1));
				};
			}
		}
	);
})();


/***************** String ******************/
if (!String.prototype.toQueryParams) {
	String.prototype.toQueryParams = function() {
		var hash = {};
		var params = this.split('&');
		var rd = /([^=]*)=(.*)/;
		for (var j = 0; j < params.length; j++) {
			var match = rd.exec(params[j]);
			if (!match) continue;
			var key = decodeURIComponent(match[1]);
			var value = match[2]?decodeURIComponent(match[2]) : undefined;
			if (hash[key] !== undefined) {
				if (hash[key].constructor != Array)
					hash[key] = [hash[key]];
				if (value) 
					hash[key].push(value);
			} else {
				hash[key] = value;
			}
		}
		return hash;
	}
}

if (!String.prototype.trim) {
	String.prototype.trim = function(){ 
	    var re = /^\s+|\s+$/g;
	    return function(){ return this.replace(re, ""); };
	}();
}

if (!String.prototype.replaceAll) {
	String.prototype.replaceAll = function(from, to){
		return this.replace(new RegExp(from, 'gm'), to);
	}
}

/**
 * 取随机整数
 * @param {Object} n 最大整数
 */
Math.randomInt = function(n) {
	return Math.floor(Math.random() * (n + 1));	
}
/**
 * 常用变量
 */

$D = YAHOO.util.Dom;
$E = YAHOO.util.Event;
$ = $D.get;

_prev_TB = window.TB;
TB = YAHOO.namespace('TB');
if(_prev_TB) {
    YAHOO.lang.augmentObject(TB, _prev_TB);
}
//TB = window.TB || {};
TB.namespace = function() {
	var args = Array.prototype.slice.call(arguments, 0), i;
	for (i = 0; i < args.length; ++i) {
		if (args[i].indexOf('TB') != 0) {
			args[i] = 'TB.' + args[i];
		}
	}
	return YAHOO.namespace.apply(null, args);
}

/********* Env *********/
TB.namespace('env');
TB.env = {
	hostname: 'taobao.com',
	debug: false,
	yuipath: 'http://a.tbcdn.cn/yui/2.7.0/',
	lang: 'zh-cn' /*(navigator.userLanguage?navigator.userLanguage.toLowerCase():navigator.language.toLowerCase())*/
};

/******** Locale ********/
TB.namespace('locale');
TB.locale = {
	Messages: {},
	getMessage: function(key) {
		return TB.locale.Messages[key] || key;
	},
	setMessage: function(key, value) {
		TB.locale.Messages[key] = value;
	}
}
$M = TB.locale.getMessage;

/******** Trace *********/
TB.trace = function(msg) {
	if (!TB.env.debug) return;
	if (window.console) {
		window.console.debug(msg);
	} else {
		alert(msg);
	}
}

/********* TB.init *********/
TB.init = function() {
	this.namespace('widget', 'dom', 'bom', 'util', 'form', 'anim');

	if (location.hostname.indexOf('taobao.com') == -1) {
		TB.env.hostname = location.hostname;
		TB.env.debug = true;
	}

	var scripts = document.getElementsByTagName("script");
	var scriptName = /tbra(?:[\w\.\-]*?)\.js(?:$|\?(.*))/;
	var matchs;
	for (var i = 0; i < scripts.length; ++i) {
		if(matchs = scriptName.exec(scripts[i].src)) {
			TB.env['path'] = scripts[i].src.substring(0, matchs.index);
			if (matchs[1]) {
				var params = matchs[1].toQueryParams();
				for (n in params) {
					if (n == 't' || n == 'timestamp') {
						TB.env['timestamp'] = parseInt(params[n]);
						continue;
					}
					TB.env[n] = params[n];
				}				
			}
		}
	}
	YAHOO.util.Get.css(TB.env['path'] + 'assets/tbra.css' + (TB.env.timestamp?'?t='+TB.env.timestamp+'.css':''));	
}
TB.init();
/**
 * TB Common function
 */
TB.common = {
	/**
	 * 移除文字前后的空白字符
	 * 
	 * @method trim
	 * @param {String} str 
	 * @deprecated 使用String.prototpye.trim()来替代
	 */
	trim: function(str) {
		return str.replace(/(^\s*)|(\s*$)/g,''); 
	},

	/**
	 * 编码HTML (from prototype framework 1.4)
	 * @method escapeHTML
	 * @param {Object} str
	 */
	escapeHTML: function(str) {
		var div = document.createElement('div');
		var text = document.createTextNode(str);
		div.appendChild(text);
		return div.innerHTML;
	},

	/**
	 * 解码HTML (from prototype framework 1.4)
	 * @method unescapeHTML
	 * @param {Object} str
	 */
	unescapeHTML: function(str) {
		var div = document.createElement('div');
		div.innerHTML = str.replace(/<\/?[^>]+>/gi, '');
		return div.childNodes[0] ? div.childNodes[0].nodeValue : '';
	},
	
	/**
	 * 删除字符串中的(x)html中的标签信息
	 * @method stripTags
	 * @param {Object} str
	 */
	stripTags: function(str) {
    	return str.replace(/<\/?[^>]+>/gi, '');
  	},

	/**
	 * 转换 NodeList 或者 arguments 为数组
	 * @method toArray
	 * @param {Object} list
	 * @param {Object} start
	 * @return {Array} 转换后的数组，如果start大于list的容量，返回空数组
	 */
	toArray : function(list, start) {
		var array = [];
		for (var i = start || 0; i < list.length; i++) {
			array[array.length] = list[i];
		}
		return array;
	},

	/**
	 * 复制配置属性给某对象，如果对象已存在该配置，不进行覆盖
	 * @param {Object} obj 目标对象 
	 * @param {Object} config 包含属性/参数 对象
	 */	
	applyIf: function(obj, config) {
    	if(obj && config && typeof config == 'object'){
        	for(var p in config) {
				if (!YAHOO.lang.hasOwnProperty(obj, p))
            		obj[p] = config[p];
			}
    	}
    	return obj;
	},

	/**
	 * 复制配置属性给某对象，如果对象已存在该配置，将被覆盖为新属性
	 * @param {Object} obj 目标对象 
	 * @param {Object} config 包含属性/参数 对象
	 */		
	apply: function(obj, config) {
    	if(obj && config && typeof config == 'object'){
        	for(var p in config)
				obj[p] = config[p];
		}
		return obj;
	},
	
	/**
	 * 格式化字符串
	 * eg:
	 * 	TB.common.formatMessage('{0}天有{1}个小时', [1, 24]) 
	 *  or
	 *  TB.common.formatMessage('{day}天有{hour}个小时', {day:1, hour:24}}
	 * @param {Object} msg
	 * @param {Object} values
	 */
	formatMessage: function(msg, values, filter) {
		var pattern = /\{([\w-]+)?\}/g;
		return function(msg, values, filter) {
			return msg.replace(pattern, function(match, key) {
				return filter?filter(values[key], key):values[key];
			});	
		}
	}(),
	
	/**
	 * 解析URI
	 */
	parseUri: (function() {
		var keys = ['source', 'prePath', 'scheme', 'username', 'password', 'host', 'port', 'path', 'dir', 'file', 'query', 'fragment'];
		var re = /^((?:([^:\/?#.]+):)?(?:\/\/)?(?:([^:@]*):?([^:@]*)?@)?([^:\/?#]*)(?::(\d*))?)((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?/;	
		return function(sourceUri) {
			var uri = {};
			var uriParts = re.exec(sourceUri);
			for(var i = 0; i < uriParts.length; ++i){
				uri[keys[i]] = (uriParts[i] ? uriParts[i] : '');
			}
			return uri;
		}
	})()
};

TB.applyIf = TB.common.applyIf;
TB.apply = TB.common.apply;TB.locale.Messages={loading:"\u52a0\u8f7d\u4e2d...",pleaseWait:"\u6b63\u5728\u5904\u7406\uff0c\u8bf7\u7a0d\u5019...",ajaxError:"\u5bf9\u4e0d\u8d77\uff0c\u53ef\u80fd\u56e0\u4e3a\u7f51\u7edc\u6545\u969c\u5bfc\u81f4\u7cfb\u7edf\u53d1\u751f\u5f02\u5e38\u9519\u8bef\uff01",prevPageText:"\u4e0a\u4e00\u9875",nextPageText:"\u4e0b\u4e00\u9875",year:"\u5e74",month:"\u6708",day:"\u5929",hour:"\u5c0f\u65f6",minute:"\u5206\u949f",second:"\u79d2",timeoutText:"\u65f6\u95f4\u5230"};
/**
 * @author zexin.zhaozx
 */

(function() {
	var ua = navigator.userAgent.toLowerCase();
	var _isOpera = ua.indexOf('opera') != -1,
		_isSafari = ua.indexOf('safari') != -1,
		_isGecko = !_isOpera && !_isSafari && ua.indexOf('gecko') > -1,
		_isIE = !_isOpera && ua.indexOf('msie') != -1, 
		_isIE6 = !_isOpera && ua.indexOf('msie 6') != -1,
		_isIE7 = !_isOpera && ua.indexOf('msie 7') != -1;
		
	TB.bom = {
		isOpera: _isOpera,
		isSafari: _isSafari,
		isGecko: _isGecko,
		isIE: _isIE,
		isIE6: _isIE6,
		isIE7: _isIE7,
			
		/**
	     * 获取cookie
	     * @method getCookie
	     * @param {String} name cookie名称
	     * @return {String} cookie 的值或者空字符串
	     */	
		getCookie: function(name) {
			var value = document.cookie.match('(?:^|;)\\s*'+name+'=([^;]*)');
			return value ? unescape(value[1]) : '';
		},
	
	    /**
	     * 设置cookie
	     * @method setCookie
	     * @param {String} name cookie名称
		 * @param {String} value cookie的值
	     * @return {String} cookie 的值或者空字符串
	     */	
		setCookie: function(name, value, expire, domain, path) {
			value = escape(value);
			value += (domain) ? '; domain=' + domain : '';
			value += (path) ? "; path=" + path : '';
			if (expire){
				var date = new Date();
				date.setTime(date.getTime() + (expire * 86400000));
				value += "; expires=" + date.toGMTString();
			}
			document.cookie = name + "=" + value;
		},
	
		/**
		 * 删除cookie
		 * @method removeCookie
		 * @param {Object} name
		 */
		removeCookie: function(name) {
			this.setCookie(name, '', -1);
		},
	
		/**
		 * 提取当前hostname的domain.domain;
		 * 默认返回当前hostname的第一层父级域，如 www.xyx.taobao.com -> xyz.taoboa.com，store.taobao.com - > taobao.com
		 * 可传递一个参数n，指定取n级的父级域，如n=2, 则www.xyx.taobao.com -> taoboa.com
		 * 如果hostname本身只有二级域，或参数n过大，则总是返回二级域
		 * 
		 * 注意：类似sina.com.cn这样带国家区域的域名可能有误。
		 * 
		 * @method pickDocumentDomain
		 * @return expected document.domain value
		 */
		pickDocumentDomain: function() {
			var host = arguments[1] || location.hostname; 
			var da = host.split('.'), len = da.length;
			var deep = arguments[0]|| (len<3?0:1);
			if (deep>=len || len-deep<2)
				deep = len-2;
			return da.slice(deep).join('.');
		},
		
		/**
		 * 添加到收藏夹
		 * @param {Object} title
		 * @param {Object} url
		 */
		addBookmark: function(title, url) {
		    if (window.sidebar) {
		        window.sidebar.addPanel(title, url,"");
		    } else if( window.external ) {
		        window.external.AddFavorite( url, title);
		    } else {
				/* TODO */
			}
		}
	}
})();/**
 * DOM utilities
 * @TODO
 */
TB.dom = {
	
	/**
	 * insertAfter
	 * @param {Object} node
	 * @param {Object} refNode
	 * @deprecated use YAHOO.util.Dom.insertAfter
	 */
	insertAfter: function(node, refNode) {
		return YAHOO.util.Dom.insertAfter(node, refNode);
	},
	
	/**
	 * 根据tagName获取最近一个祖先节点
	 * @param {Object} el
	 * @param {Object} tag
	 * @deprecated use YAHOO.util.Dom.getAncestorByTagName
	 */
	getAncestorByTagName: function(el, tag) {
		return YAHOO.util.Dom.getAncestorByTagName(el, tag);
	},
	
	/**
	 * 根据class获取最近的一个祖先节点
	 * @param {Object} el
	 * @param {Object} cls
	 * @deprecated use YAHOO.util.Dom.getAncestorByClassName
	 */
	getAncestorByClassName: function(el, cls) {
		return YAHOO.util.Dom.getAncestorByClassName(el, cls);
	}, 
	
	/** 
	 * 获取之后的兄弟节点
	 * @param {Object} node
	 * @deprecated use YAHOO.util.Dom.getNextSibling
	 */	
	getNextSibling: function(node) {
		return YAHOO.util.Dom.getNextSibling(node);
	},
	
	/** 
	 * 获取之前的兄弟节点
	 * @param {Object} node
	 * @deprecated use YAHOO.util.Dom.getPreviousSibling
	 */
	getPreviousSibling: function(node) {
		return YAHOO.util.Dom.getPreviousSibling(node);	
	},
	
	/**
	 * 获取表单域的label
	 * @param {Object} el
	 * @param {Object} parent
	 */
	getFieldLabelHtml: function(el, parent) {
		var input = YAHOO.util.Dom.get(el), labels = (parent || input.parentNode).getElementsByTagName('label');
		for (var i = 0; i < labels.length; i++) {
			var forAttr = labels[i].htmlFor || labels[i].getAttribute('for')
			if (forAttr == input.id)
				return labels[i].innerHTML;
		}
		return null;
	},
	
	/**
	 * 获取iframe的document
	 * @param {Object} el
	 */
	getIframeDocument: function(el) {
		var iframe = YAHOO.util.Dom.get(el);
		return iframe.contentWindow? iframe.contentWindow.document : iframe.contentDocument;
	},

	/**
	 * 设置表单的action属性，处理表单中包含同名的field时的情况
	 * @param {Object} form  form 对象
	 * @param {Object} url  action url
	 */
	setFormAction: function(form, url) {
		form = YAHOO.util.Dom.get(form);
	    var actionInput = form.elements['action'];
	    var postSet;
	    if (actionInput) {
	        var ai = form.removeChild(actionInput);
	        postSet = function() {
	            form.appendChild(ai);
			}
	    }
	    form.action = url;
	    if (postSet)
	        postSet();
	    return true;
	},
	
	/**
	 * 添加样式文本
	 * @param {Object} cssText
	 * @param {Object} doc
	 */
	addCSS: function(cssText, doc) {
		doc = doc || document;
		var styleEl = doc.createElement('style');
		styleEl.type = "text/css";
		doc.getElementsByTagName('head')[0].appendChild(styleEl); //先appendChild，否则hack失效
		if (styleEl.styleSheet) {
			styleEl.styleSheet.cssText = cssText;
		} else {
			styleEl.appendChild(doc.createTextNode(cssText));
		}
	},
	
	/**
	 * 根据脚本名字，取得脚本参数
	 * @param {Object}||{RegExp}||{String} script
	 */
	getScriptParams: function(script) {
		var p = /\?(.*?)($|\.js)/;
		var m;
		//如果是 <script> tag
		if (YAHOO.lang.isObject(script) && script.tagName && script.tagName.toLowerCase()=='script') {
			if (script.src && (m = script.src.match(p))) {
				return m[1].toQueryParams();  
			}
		} else {
			//如果是 string， 转成 regexp
			if (YAHOO.lang.isString(script)) {
				script = new RegExp(script, 'i');
			}
			var scripts = document.getElementsByTagName("script");
			var matchs, ssrc;
			for (var i = 0; i < scripts.length; ++i) {
				ssrc = scripts[i].src;
				if (ssrc && script.test(ssrc) && (m = ssrc.match(p))) {
					return m[1].toQueryParams(); 
				}
			}
		}
	}	
	
}/** 状态指示器 */
TB.util.Indicator = new function() {

	var Y = YAHOO.util, Dom = Y.Dom, Lang = Y.Lang;

	var defConfig = {
		message: 'loading',
		useShim: false,
		useIFrame: false,
		centerIndicator: true
	}
	
	var prepareShim = function(target, useIFrame) {
		var shim = document.createElement('div');
		shim.className = 'tb-indic-shim';
		Dom.setStyle(shim, 'display', 'none');
		target.parentNode.insertBefore(shim, target);
		if (useIFrame) {
			var shimFrame = document.createElement('iframe');
			shimFrame.setAttribute("frameBorder", 0);
			shimFrame.className = 'tb-indic-shim-iframe';
			target.parentNode.insertBefore(shimFrame, target);
		}
		return shim;
	}	
	
	this.attach = function(target, config) {
		target = Dom.get(target);
		config = Lang.merge(defConfig, config||{});
		
		var indicator =  document.createElement('div');
		indicator.className = 'tb-indic';
		Dom.setStyle(indicator, 'display', 'none');
		Dom.setStyle(indicator, 'position', 'static');
		indicator.innerHTML = '<span>'+$M(config.message)+'</span>';
		
		if (config.useShim) {
			var shim = prepareShim(target, config.useIFrame);
			shim.appendChild(indicator);
		} else {
			target.parentNode.insertBefore(indicator, target);	
		}
		
		var handle = {};
		
		handle.show = function(xy) {
			if (config.useShim) {
				var region = Dom.getRegion(target);	
				
				var shim = indicator.parentNode;
				Dom.setStyle(shim, 'display', 'block');
				Dom.setXY(shim, [region[0], region[1]]);
				Dom.setStyle(shim, 'width', (region.right-region.left)+'px');
				Dom.setStyle(shim, 'height', (region.bottom-region.top)+'px');
				
				if (config.useIFrame) {
					var shimFrame = shim.nextSibling;
					Dom.setStyle(shimFrame, 'width', (region.right-region.left)+'px');
					Dom.setStyle(shimFrame, 'height', (region.bottom-region.top)+'px');
					Dom.setStyle(shimFrame, 'display', 'block');
				}
				
				Dom.setStyle(indicator, 'display', 'block');
				Dom.setStyle(indicator, 'position', 'absolute');
				if (config.centerIndicator) {
					Dom.setStyle(indicator, 'top', '50%');
					Dom.setStyle(indicator, 'left', '50%');
					indicator.style.marginTop = -(indicator.offsetHeight/2) + 'px';
					indicator.style.marginLeft = -(indicator.offsetWidth/2) + 'px';
				}
			} else {
				Dom.setStyle(indicator, 'display', '');
				if (xy) {
					Dom.setStyle(indicator, 'position', 'absolute');
					Dom.setXY(indicator, xy);
				}
			}
		};

		handle.hide = function() {
			if (config.useShim) {
				var shim = indicator.parentNode;
				Dom.setStyle(indicator, 'display', 'none');
				Dom.setStyle(shim, 'display', 'none');
				if (config.useIFrame)
					Dom.setStyle(indicator.parentNode.nextSibling, 'display', 'none');
				try {
					if (config.useIFrame)
						shim.parentNode.removeChild(shim.nextSibling);
					shim.parentNode.removeChild(shim);
				} catch (e) {}
			} else {
				Dom.setStyle(indicator, 'display', 'none');
				try {
					indicator.parentNode.removeChild(indicator);
				} catch (e) {}
			}
		};
		
		return handle;
	}
};
/**
 * security filter 
 *
 * created by yubo 2009-04-10
 */
var TB = TB || {}; // 让这个js保持原生态，直接引用就可使用
TB.util = TB.util || {};

TB.util.SecurityUtil = (function() {
    var hD = '0123456789ABCDEF';

    /**
     * 将十进制字符转换为十六进制
     */
    function d2h(d) {
        var h = hD.substr(d & 15, 1);

        while (d > 15) {
            d >>= 4;
            h = hD.substr(d & 15, 1) + h;
        }
        return h;
    }

    /**
     * 是不是安全字符
     * 包括大小写字母，数字，空格，英文逗号，英文点号
     */
    function isSafeChar(c) {
        return (c >= 97 && c <= 122) || (c >= 65 && c <= 90 ) ||
               (c >= 48 && c <= 57 ) || c == 32 || c == 44 || c == 46;
    }

    return {
        version: '1.2',

        /**
         * 转义html文本中的非安全字符
         */
        encodeHTML: function(str) {
            if (!str) return str;

            var out = '';
            for (var i = 0, len = str.length; i < len; ++i) {
                var c = str.charCodeAt(i);
                if (isSafeChar(c)) {
                    out += str.charAt(i);
                } else {
                    out += '&#' + c + ';';
                }
            }
            return out;
        },

        /**
         * 转义js文本中的非安全字符
         */
        encodeJS: function(str) {
            if (!str) return str;

            var out = '', hex;
            for (var i = 0, len = str.length; i < len; ++i) {
                var c = str.charCodeAt(i);

                if (isSafeChar(c)) {
                    out += str.charAt(i);
                } else if (c <= 127) {
                    hex = d2h(c);
                    if (hex.length < 2) {
                        hex = '0' + hex;
                    }
                    out += '\\x' + hex;
                } else {
                    hex = d2h(c);
                    while (hex.length < 4) {
                        hex = '0' + hex;
                    }
                    out += '\\u' + hex;
                }
            }
            return out;
        },

        /**
         * 让javascript等伪协议url失效
         */
        secureURI: function(uri) {
            var uriLC = uri.toLowerCase();

            // 采用白名单方案
            if (uriLC.indexOf('http://') == 0 ||
                uriLC.indexOf('https://') == 0 ||
                uriLC.indexOf('/') == 0 ||
                uriLC.indexOf('./') == 0) {
                return uri;
            }

            return './' + uri;
        }
    };
})();
/**
 * TBra Simple Popup 
 * 
 * @author xiaoma<xiaoma@taobao.com> , yuchun<yuchun@taobao.com>
 * 
 */

/**
	config 属性说明

	position: {String} [left|right|top|bottom]
	align: {String} [left|right|center|top|bottom]
	autoFit: {Boolean} 是否自适应窗口
	width: {Number} popup width 
	height: {Number} popup height
	offset: {Array} offset
	eventType: {String} [mouse|click] 鼠标移动触发还是点击触发
	disableClick: {Boolean}
	delay: {Number} 鼠标移动触发时间延迟
	onShow: {function} 显示回调函数
	onHide: {Function} 隐藏回调函数
 */
	
TB.widget.SimplePopup = new function() {
	var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = Y.Lang;

	var defConfig = {
		position: 'right',
		align: 'top',
		autoFit: true,
		eventType: 'mouse',
		delay: 0.1,
		disableClick: true,  /* stopEvent when eventType = mouse */
		width: 200,
		height: 200		
	};
	
	/**
	 * 事件处理器
	 * scope is handle
	 * @param {Object} ev
	 */	
	var triggerClickHandler = function(ev) {
		var target = Event.getTarget(ev);
		if (triggerClickHandler._target == target) {
			this.popup.style.display == 'block'? this.hide() : this.show();
		} else {
			this.show();
		}
		Event.preventDefault(ev);
		triggerClickHandler._target = target;
	}
	var triggerMouseOverHandler = function(ev) {
		clearTimeout(this._popupHideTimeId);
		var self = this;
		this._popupShowTimeId = setTimeout(function(){
			self.show();
		}, this.config.delay * 1000);
		if (this.config.disableClick && !this.trigger.onclick) {
			this.trigger.onclick = function(e) {
				Event.preventDefault(Event.getEvent(e));
			};
		}			
	}

	var triggerMouseOutHandler = function(ev) {
		clearTimeout(this._popupShowTimeId);
		var target = Event.getRelatedTarget(ev);
		if (this.popup != target && !Dom.isAncestor(this.popup, target)){
			this.delayHide();
		}
		Event.preventDefault(ev);
	}
	
	var popupMouseOverHandler = function(ev) {
		var handle = this.currentHandle? this.currentHandle : this;
		if (this._handles) { //如果 config.shareSinglePopup == true, 清除所有trigger上的setTimeout
			for (var i = 0, handles = this._handles; i < handles.length; ++i) {
				clearTimeout(handles[i]._popupHideTimeId);
			}
		} else {
			clearTimeout(handle._popupHideTimeId);
		}
	}

	var popupMouseOutHandler = function(ev) {
		var handle = this.currentHandle? this.currentHandle : this,
			target = Event.getRelatedTarget(ev);
		if (handle.popup != target && !Dom.isAncestor(handle.popup, target)){
			handle.delayHide();
		}
	}
	
	this.decorate = function(trigger, popup, config) {
		if (Lang.isArray(trigger) || (Lang.isObject(trigger) && trigger.length)) {
			config.shareSinglePopup = true;
			var groupHandle = {};
			groupHandle._handles = [];
			/* batch操作时处于简单考虑，不返回handle object */
			for (var i = 0; i < trigger.length; i++) {
				var h = this.decorate(trigger[i], popup, config);
				h._beforeShow = function(){
					groupHandle.currentHandle = this;
					return true;
				};
				groupHandle._handles[i] = h; 
			}
			if (config.eventType == 'mouse') {
				Event.on(popup, 'mouseover', popupMouseOverHandler, groupHandle, true);
				Event.on(popup, 'mouseout', popupMouseOutHandler, groupHandle, true);
			}			
			return groupHandle;
		}
		
		trigger = Dom.get(trigger);
		popup = Dom.get(popup);
		if (!trigger || !popup) return;
		config = Lang.merge(defConfig, config||{});
		/* 返回给调用者的控制器，只包含对调用者可见的方法/属性 */		
		var handle = {};		

		handle._popupShowTimeId = null;
		handle._popupHideTimeId = null;
		handle._beforeShow = function(){return true};

		var onShowEvent = new Y.CustomEvent("onShow", handle, false, Y.CustomEvent.FLAT);
		if (config.onShow) {
			onShowEvent.subscribe(config.onShow);	
		}
		var onHideEvent = new Y.CustomEvent("onHide", handle, false, Y.CustomEvent.FLAT);
		if (config.onHide) {
			onHideEvent.subscribe(config.onHide);	
		}			

		if (config.eventType == 'mouse') {
			Event.on(trigger, 'mouseover', triggerMouseOverHandler, handle, true);
			Event.on(trigger, 'mouseout', triggerMouseOutHandler, handle, true);
			/* batch 操作时，Popup 的鼠标事件只注册一次 */
			if (!config.shareSinglePopup) {
				Event.on(popup, 'mouseover', popupMouseOverHandler, handle, true);
				Event.on(popup, 'mouseout', popupMouseOutHandler, handle, true);
			}
		}
		else if (config.eventType == 'click') {
			Event.on(trigger, 'click', triggerClickHandler, handle, true);
		}

		Lang.augmentObject(handle, {
			popup: popup,
			trigger: trigger,
			config: config,
			show: function() {
				if (!this._beforeShow()) return;
				var pos = Dom.getXY(this.trigger);
				if (Lang.isArray(this.config.offset)) {
					pos[0] += parseInt(this.config.offset[0]);
					pos[1] += parseInt(this.config.offset[1]);
				}

				var  tw = this.trigger.offsetWidth, th = this.trigger.offsetHeight,
					pw = config.width, ph = config.height,
					dw = Dom.getViewportWidth(), dh = Dom.getViewportHeight(),
					sl = Dom.getDocumentScrollLeft(), st = Dom.getDocumentScrollTop(),
					l = pos[0], t = pos[1];
				if (config.position == 'left') {
					l = pos[0]-pw;
					t = (config.align == 'center')?(t-ph/2+th/2):(config.align == 'bottom')?(t+th-ph):t;//对齐定位
				} else if (config.position == 'right') {
					l = pos[0]+tw;
					t = (config.align == 'center')?(t-ph/2+th/2):(config.align == 'bottom')?(t+th-ph):t;//对齐定位
				} else if (config.position == 'bottom') {
					t = t+th;
					l = (config.align == 'center')?(l+tw/2-pw/2):(config.align == 'right')?(l+tw-pw):l;//对齐定位
				} else if (config.position == 'top') {
					t = t-ph;
					l = (config.align == 'center')?(l+tw/2-pw/2):(config.align == 'right')?(l+tw-pw):l;//对齐定位
				}
				if (t < 0) t = 0;//防止出界
				if (l < 0) l = 0;//防止出界
				
				if(this.config.autoFit) {
					if (t-st+ph > dh) {
						t = dh-ph+st-2; /* 2px 偏差 */
						if (t < 0) {
							t = 0;
						}
					}
				}
					
				this.popup.style.position = 'absolute';
				this.popup.style.top = t + 'px';
				this.popup.style.left = l + 'px';
				if (this.config.effect) {
					if (this.config.effect == 'fade') {
						Dom.setStyle(this.popup, 'opacity', 0);
						this.popup.style.display = 'block';
						var anim = new Y.Anim(this.popup, { opacity: {to: 1} }, 0.4);
						anim.animate();
					}
				} else {
					this.popup.style.display = 'block';
				}
				onShowEvent.fire();					
			},
			hide: function() {
				Dom.setStyle(this.popup, 'display', 'none');
				onHideEvent.fire();
			},
			delayHide: function() {
				var self = this;
		        this._popupHideTimeId = setTimeout(function(){
					self.hide();
				}, this.config.delay*1000);
			}			
		}, true);

		Dom.setStyle(popup, 'display', 'none');
		return handle;		
	}
}

/**
 * suggest.js
 * @author yubo@taobao.com
 */

var TB = TB || {};
(function() {
    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = YAHOO.lang;
    var head = document.getElementsByTagName('head')[0];
    var ie = YAHOO.env.ua.ie, ie6 = (ie === 6);

    /**
     * Suggest的默认配置
     */
    var defaultConfig = {
        /**
         * 悬浮提示层的class
         * 提示层的默认结构如下：
         * <div class="suggest-container">
         *     <ol>
         *         <li>
         *             <span class="suggest-key">...</span>
         *             <span class="suggest-result">...</span>
         *         </li>
         *     </ol>
         *     <div class="suggest-bottom">
         *         <a class="suggest-close-btn">...</a>
         *     </div>
         * </div>
         * @type String
         */
        containerClassName: 'suggest-container',

        /**
         * 提示层的宽度
         * 注意：默认情况下，提示层的宽度和input输入框的宽度保持一致
         * 示范取值：'200px', '10%'等，必须带单位
         * @type String
         */
        containerWidth: 'auto',

        /**
         * 提示层中，key元素的class
         * @type String
         */
        keyElClassName: 'suggest-key',

        /**
         * 提示层中，result元素的class
         * @type String
         */
        resultElClassName: 'suggest-result',

        /**
         * result的格式
         * @type String
         */
        resultFormat: '约%result%条结果',

        /**
         * 提示层中，选中项的class
         * @type String
         */
        selectedItemClassName: 'selected',

        /**
         * 提示层底部的class
         * @type String
         */
        bottomClassName: 'suggest-bottom',

        /**
         * 是否显示关闭按钮
         * @type Boolean
         */
        showCloseBtn: false,

        /**
         * 关闭按钮上的文字
         * @type String
         */
        closeBtnText: '关闭',

        /**
         * 关闭按钮的class
         * @type String
         */
        closeBtnClassName: 'suggest-close-btn',

        /**
         * 是否需要iframe shim
         * @type Boolean
         */
        useShim: ie6,

        /**
         * iframe shim的class
         * @type String
         */
        shimClassName: 'suggest-shim',

        /**
         * 样式style元素的id
         * @type String
         */
        styleElId: 'J_SuggestStyle',

        /**
         * 定时器的延时
         * @type Number
         */
        timerDelay: 200,

        /**
         * 初始化后，自动激活
         * @type Boolean
         */
        autoFocus: false,

        /**
         * 鼠标点击完成选择时，是否自动提交表单
         * @type Boolean
         */
        submitFormOnClickSelect: true
    };

    /**
     * 提示补全组件
     * @class TB.Suggest
     * @requires YAHOO.util.Dom
     * @requires YAHOO.util.Event
     * @constructor
     * @param {String|HTMLElement} textInput
     * @param {String} dataSource
     * @param {Object} config
     */
    TB.Suggest = function(textInput, dataSource, config) {
        /**
         * 文本输入框
         * @type HTMLElement
         */
        this.textInput = Dom.get(textInput);

        /**
         * 获取数据的URL 或 JSON格式的静态数据
         * @type {String|Object}
         */
        this.dataSource = dataSource;

        /**
         * JSON静态数据源
         * @type Object 格式为 {'query1' : [['key1', 'result1'], []], 'query2' : [[], []]}
         */
        this.JSONDataSource = Lang.isObject(dataSource) ? dataSource : null;

        /**
         * 通过jsonp返回的数据
         * @type Object
         */
        this.returnedData = null;

        /**
         * 配置参数
         * @type Object
         */
        this.config = Lang.merge(defaultConfig, config || {});

        /**
         * 存放提示信息的容器
         * @type HTMLElement
         */
        this.container = null;

        /**
         * 输入框的值
         * @type String
         */
        this.query = '';

        /**
         * 获取数据时的参数
         * @type String
         */
        this.queryParams = '';

        /**
         * 内部定时器
         * @private
         * @type Object
         */
        this._timer = null;

        /**
         * 计时器是否处于运行状态
         * @private
         * @type Boolean
         */
        this._isRunning = false;

        /**
         * 获取数据的script元素
         * @type HTMLElement
         */
        this.dataScript = null;

        /**
         * 数据缓存
         * @private
         * @type Object
         */
        this._dataCache = {};

        /**
         * 最新script的时间戳
         * @type String
         */
        this._latestScriptTime = '';

        /**
         * script返回的数据是否已经过期
         * @type Boolean
         */
        this._scriptDataIsOut = false;

        /**
         * 是否处于键盘选择状态
         * @private
         * @type Boolean
         */
        this._onKeyboardSelecting = false;

        /**
         * 提示层的当前选中项
         * @type Boolean
         */
        this.selectedItem = null;

        // init
        this._init();
    };

    TB.Suggest.prototype = {
        /**
         * 初始化方法
         * @protected
         */
        _init: function() {
            // init DOM
            this._initTextInput();
            this._initContainer();
            if (this.config.useShim) this._initShim();
            this._initStyle();

            // create events
            this.createEvent('beforeDataRequest');
            this.createEvent('onDataReturn');
            this.createEvent('beforeShow');
            this.createEvent('onItemSelect');

            // window resize event
            this._initResizeEvent();
        },

        /**
         * 初始化输入框
         * @protected
         */
        _initTextInput: function() {
            var instance = this;

            // turn off autocomplete
            this.textInput.setAttribute('autocomplete', 'off');

            // focus
            Event.on(this.textInput, 'focus', function() {
                instance.start();
            });

            // blur
            Event.on(this.textInput, 'blur', function() {
                instance.stop();
                instance.hide();
            });

            // auto focus
            if (this.config.autoFocus) this.textInput.focus();

            // keydown
            // 注：截至目前，在Opera9.64中，输入法开启时，依旧不会触发任何键盘事件
            var pressingCount = 0; // 持续按住某键时，连续触发的keydown次数。注意Opera只会触发一次。
            Event.on(this.textInput, 'keydown', function(ev) {
                var keyCode = ev.charCode || ev.keyCode;
                //console.log('keydown ' + keyCode);

                switch (keyCode) {
                    case 27: // ESC键，隐藏提示层并还原初始输入
                        instance.hide();
                        instance.textInput.value = instance.query;
                        break;
                    case 13: // ENTER键
                        // 提交表单前，先隐藏提示层并停止计时器
                        instance.textInput.blur(); // 这一句还可以阻止掉浏览器的默认提交事件

                        // 如果是键盘选中某项后回车，触发onItemSelect事件
                        if (instance._onKeyboardSelecting) {
                            if (instance.textInput.value == instance._getSelectedItemKey()) { // 确保值匹配
                                instance.fireEvent('onItemSelect', instance.textInput.value);
                            }
                        }

                        // 提交表单
                        instance._submitForm();

                        break;
                    case 40: // DOWN键
                    case 38: // UP键
                        // 按住键不动时，延时处理
                        if (pressingCount++ == 0) {
                            if (instance._isRunning) instance.stop();
                            instance._onKeyboardSelecting = true;
                            instance.selectItem(keyCode == 40);

                        } else if (pressingCount == 3) {
                            pressingCount = 0;
                        }
                        break;
                }

                // 非 DOWN/UP 键时，开启计时器
                if (keyCode != 40 && keyCode != 38) {
                    if (!instance._isRunning) {
                        // 1. 当网速较慢，js还未下载完时，用户可能就已经开始输入
                        //    这时，focus事件已经不会触发，需要在keyup里触发定时器
                        // 2. 非DOWN/UP键时，需要激活定时器
                        instance.start();
                    }
                    instance._onKeyboardSelecting = false;
                }
            });

            // reset pressingCount
            Event.on(this.textInput, 'keyup', function() {
                //console.log('keyup');
                pressingCount = 0;
            });
        },

        /**
         * 初始化提示层容器
         * @protected
         */
        _initContainer: function() {
            // create
            var container = document.createElement('div');
            container.className = this.config['containerClassName'];
            container.style.position = 'absolute';
            container.style.visibility = 'hidden';
            this.container = container;

            this._setContainerRegion();
            this._initContainerEvent();

            // append
            document.body.insertBefore(container, document.body.firstChild);
        },

        /**
         * 设置容器的left, top, width
         * @protected
         */
        _setContainerRegion: function() {
            var r = Dom.getRegion(this.textInput);
            var left = r.left, w = r.right - left - 2;  // 减去border的2px

			// bug fix: w 应该判断下是否大于 0, 后边设置 width 的时候如果小于 0, ie 下会报参数无效的错误
            w = w > 0 ? w : 0;
            
            // ie8兼容模式
            // document.documentMode:
            // 5 - Quirks Mode
            // 7 - IE7 Standards
            // 8 - IE8 Standards
            var docMode = document.documentMode;
            if (docMode === 7 && (ie === 7 || ie === 8)) {
                left -= 2;
            } else if (YAHOO.env.ua.gecko) { // firefox下左偏一像素
                left++;
            }

            this.container.style.left = left + 'px';
            this.container.style.top = r.bottom + 'px';

            if (this.config.containerWidth == 'auto') {
                this.container.style.width = w + 'px';
            } else {
                this.container.style.width = this.config.containerWidth;
            }
        },

        /**
         * 初始化容器事件
         * 子元素都不用设置事件，冒泡到这里统一处理
         * @protected
         */
        _initContainerEvent: function() {
            var instance = this;

            // 鼠标事件
            Event.on(this.container, 'mousemove', function(ev) {
                //console.log('mouse move');
                var target = Event.getTarget(ev);

                if (target.nodeName != 'LI') {
                    target = Dom.getAncestorByTagName(target, 'li');
                }
                if (Dom.isAncestor(instance.container, target)) {
                    if (target != instance.selectedItem) {
                        // 移除老的
                        instance._removeSelectedItem();
                        // 设置新的
                        instance._setSelectedItem(target);
                    }
                }
            });

            var mouseDownItem = null;
            this.container.onmousedown = function(e) {
                e = e || window.event;
                // 鼠标按下处的item
                mouseDownItem = e.target || e.srcElement;

                // 鼠标按下时，让输入框不会失去焦点
                // 1. for IE
                instance.textInput.onbeforedeactivate = function() {
                    window.event.returnValue = false;
                    instance.textInput.onbeforedeactivate = null;
                };
                // 2. for W3C
                return false;
            };

            // mouseup事件
            Event.on(this.container, 'mouseup', function(ev) {
                // 当mousedown在提示层，但mouseup在提示层外时，点击无效
                if (!instance._isInContainer(Event.getXY(ev))) return;
                var target = Event.getTarget(ev);
                // 在提示层A项处按下鼠标，移动到B处释放，不触发onItemSelect
                if (target != mouseDownItem) return;

                // 点击在关闭按钮上
                if (target.className == instance.config.closeBtnClassName) {
                    instance.hide();
                    return;
                }

                // 可能点击在li的子元素上
                if (target.nodeName != 'LI') {
                    target = Dom.getAncestorByTagName(target, 'li');
                }
                // 必须点击在container内部的li上
                if (Dom.isAncestor(instance.container, target)) {
                    instance._updateInputFromSelectItem(target);

                    // 触发选中事件
                    //console.log('on item select');
                    instance.fireEvent('onItemSelect', instance.textInput.value);

                    // 提交表单前，先隐藏提示层并停止计时器
                    instance.textInput.blur();

                    // 提交表单
                    instance._submitForm();
                }
            });
        },

        /**
         * click选择 or enter后，提交表单
         */
        _submitForm: function() {
            // 注：对于键盘控制enter选择的情况，由html自身决定是否提交。否则会导致输入法开启时，用enter选择英文时也触发提交
            if (this.config.submitFormOnClickSelect) {
                var form = this.textInput.form;
                if (!form) return;

                // 通过js提交表单时，不会触发onsubmit事件
                // 需要js自己触发
                if (document.createEvent) { // ie
                    var evObj = document.createEvent('MouseEvents');
                    evObj.initEvent('submit', true, false);
                    form.dispatchEvent(evObj);
                }
                else if (document.createEventObject) { // w3c
                    form.fireEvent('onsubmit');
                }

                form.submit();
            }
        },

        /**
         * 判断p是否在提示层内
         * @param {Array} p [x, y]
         */
        _isInContainer: function(p) {
            var r = Dom.getRegion(this.container);
            return p[0] >= r.left && p[0] <= r.right && p[1] >= r.top && p[1] <= r.bottom;
        },

        /**
         * 给容器添加iframe shim层
         * @protected
         */
        _initShim: function() {
            var iframe = document.createElement('iframe');
            iframe.src = 'about:blank';
            iframe.className = this.config.shimClassName;
            iframe.style.position = 'absolute';
            iframe.style.visibility = 'hidden';
            iframe.style.border = 'none';
            this.container.shim = iframe;

            this._setShimRegion();
            document.body.insertBefore(iframe, document.body.firstChild);
        },

        /**
         * 设置shim的left, top, width
         * @protected
         */
        _setShimRegion: function() {
            var container = this.container, shim = container.shim;
            if (shim) {
                shim.style.left = (parseInt(container.style.left) - 2) + 'px'; // 解决吞边线bug
                shim.style.top = container.style.top;
                shim.style.width = (parseInt(container.style.width) + 2) + 'px';
            }
        },

        /**
         * 初始化样式
         * @protected
         */
        _initStyle: function() {
            var styleEl = document.getElementById(this.config.styleElId);
            if (styleEl) return; // 防止多个实例时重复添加

            var style = ".suggest-container{background:white;border:1px solid #91A8B4;z-index:100001}";
            style += ".suggest-shim{z-index:100000}";
            style += ".suggest-container li{color:#404040;padding:1px 0 2px;font-size:12px;line-height:18px;float:left;width:100%}";
            style += ".suggest-container li.selected{background-color:#D5E2FF;cursor:default}";
            style += ".suggest-key{float:left;text-align:left;padding-left:5px}";
            style += ".suggest-result{float:right;text-align:right;padding-right:5px;color:green}";
            style += ".suggest-container li.selected span{color:#240055;cursor:default}";
            style += ".suggest-container li.selected .suggest-result{color:green}";
            style += ".suggest-bottom{padding:0 5px 5px}";
            style += ".suggest-close-btn{float:right}";
            style += ".suggest-container li,.suggest-bottom{overflow:hidden;zoom:1;clear:both}";
            /* hacks */
            style += ".suggest-container{*margin-left:2px;_margin-left:-2px;_margin-top:-3px}";

            styleEl = document.createElement('style');
            styleEl.id = this.config.styleElId;
            styleEl.type = 'text/css';
            head.appendChild(styleEl); // 先添加到DOM树中，都在cssText里的hack会失效

            if (styleEl.styleSheet) { // IE
                styleEl.styleSheet.cssText = style;
            } else { // W3C
                styleEl.appendChild(document.createTextNode(style));
            }
        },

        /**
         * window.onresize时，调整提示层的位置
         * @protected
         */
        _initResizeEvent: function() {
            var instance = this, resizeTimer;

            Event.on(window, 'resize', function() {
                if (resizeTimer) {
                    clearTimeout(resizeTimer);
                }

                resizeTimer = setTimeout(function() {
                    instance._setContainerRegion();
                    instance._setShimRegion();
                }, 50);
            });
        },

        /**
         * 启动计时器，开始监听用户输入
         */
        start: function() {
            TB.Suggest.focusInstance = this;

            var instance = this;
            instance._timer = setTimeout(function() {
                instance.updateData();
                instance._timer = setTimeout(arguments.callee, instance.config.timerDelay);
            }, instance.config.timerDelay);

            this._isRunning = true;
        },

        /**
         * 停止计时器
         */
        stop: function() {
            TB.Suggest.focusInstance = null;
            clearTimeout(this._timer);
            this._isRunning = false;
        },

        /**
         * 显示提示层
         */
        show: function() {
            if (this.isVisible()) return;
            var container = this.container, shim = container.shim;

            container.style.visibility = '';

            if (shim) {
                if (!shim.style.height) { // 第一次显示时，需要设定高度
                    var r = Dom.getRegion(container);
                    shim.style.height = (r.bottom - r.top - 2) + 'px';
                }
                shim.style.visibility = '';
            }
        },

        /**
         * 隐藏提示层
         */
        hide: function() {
            if (!this.isVisible()) return;
            var container = this.container, shim = container.shim;
            //console.log('hidden');

            if (shim) shim.style.visibility = 'hidden';
            container.style.visibility = 'hidden';
        },

        /**
         * 提示层是否显示
         */
        isVisible: function() {
            return this.container.style.visibility != 'hidden';
        },

        /**
         * 更新提示层的数据
         */
        updateData: function() {
            if (!this._needUpdate()) return;
            //console.log('update data');

            this._updateQueryValueFromInput();
            var q = this.query;

            // 1. 输入为空时，隐藏提示层
            if (!Lang.trim(q).length) {
                this._fillContainer('');
                this.hide();
                return;
            }

            if (typeof this._dataCache[q] != 'undefined') { // 2. 使用缓存数据
                //console.log('use cache');
                this.returnedData = 'using cache';
                this._fillContainer(this._dataCache[q]);
                this._displayContainer();

            } else if (this.JSONDataSource) { // 3. 使用JSON静态数据源
                this.handleResponse(this.JSONDataSource[q]);

            } else { // 4. 请求服务器数据
                this.requestData();
            }
        },

        /**
         * 是否需要更新数据
         * @protected
         * @return Boolean
         */
        _needUpdate: function() {
            // 注意：加入空格也算有变化
            return this.textInput.value != this.query;
        },

        /**
         * 通过script元素加载数据
         */
        requestData: function() {
            //console.log('request data via script');
            if (!ie) this.dataScript = null; // IE不需要重新创建script元素

            if (!this.dataScript) {
                var script = document.createElement('script');
                script.type = 'text/javascript';
                script.charset = 'utf-8';

                // jQuery ajax.js line 275:
                // Use insertBefore instead of appendChild  to circumvent an IE6 bug.
                // This arises when a base node is used.
                head.insertBefore(script, head.firstChild);
                this.dataScript = script;

                if (!ie) {
                    var t = new Date().getTime();
                    this._latestScriptTime = t;
                    script.setAttribute('time', t);

                    Event.on(script, 'load', function() {
                        //console.log('on load');
                        // 判断返回的数据是否已经过期
                        this._scriptDataIsOut = script.getAttribute('time') != this._latestScriptTime;
                    }, this, true);
                }
            }

            // 注意：没必要加时间戳，是否缓存由服务器返回的Header头控制
            this.queryParams = 'q=' + encodeURIComponent(this.query) + '&code=utf-8&callback=TB.Suggest.callback';
            this.fireEvent('beforeDataRequest', this.query);
            this.dataScript.src = this.dataSource + '?' + this.queryParams;
        },

        /**
         * 处理获取的数据
         * @param {Object} data
         */
        handleResponse: function(data) {
            //console.log('handle response');
            if (this._scriptDataIsOut) return; // 抛弃过期数据，否则会导致bug：1. 缓存key值不对； 2. 过期数据导致的闪屏

            this.returnedData = data;
            this.fireEvent('onDataReturn', data);

            // 格式化数据
            this.returnedData = this.formatData(this.returnedData);

            // 填充数据
            var content = '';
            var len = this.returnedData.length;
            if (len > 0) {
                var list = document.createElement('ol');
                for (var i = 0; i < len; ++i) {
                    var itemData = this.returnedData[i];
                    var li = this.formatItem(itemData['key'], itemData['result']);
                    // 缓存key值到attribute上
                    li.setAttribute('key', itemData['key']);
                    list.appendChild(li);
                }
                content = list;
            }
            this._fillContainer(content);

            // 有内容时才添加底部
            if (len > 0) this.appendBottom();

            // fire event
            if (Lang.trim(this.container.innerHTML)) {
                // 实际上是beforeCache，但从用户的角度看，是beforeShow
                this.fireEvent('beforeShow', this.container);
            }

            // cache
            this._dataCache[this.query] = this.container.innerHTML;

            // 显示容器
            this._displayContainer();
        },

        /**
         * 格式化输入的数据对象为标准格式
         * @param {Object} data 格式可以有3种：
         *  1. {'result' : [['key1', 'result1'], ['key2', 'result2'], ...]}
         *  2. {'result' : ['key1', 'key2', ...]}
         *  3. 1和2的组合
         *  4. 标准格式
         *  5. 上面1-4中，直接取o['result']的值
         * @return Object 标准格式的数据：
         *  [{'key' : 'key1', 'result' : 'result1'}, {'key' : 'key2', 'result' : 'result2'}, ...]
         */
        formatData: function(data) {
            var arr = [];
            if (!data) return arr;
            if (Lang.isArray(data['result'])) data = data['result'];
            var len = data.length;
            if (!len) return arr;

            var item;
            for (var i = 0; i < len; ++i) {
                item = data[i];

                if (Lang.isString(item)) { // 只有key值时
                    arr[i] = {'key' : item};
                } else if (Lang.isArray(item) && item.length == 2) { // ['key', 'result']
                    arr[i] = {'key' : item[0], 'result' : item[1]};
                } else {
                    arr[i] = item;
                }
            }
            return arr;
        },

        /**
         * 格式化输出项
         * @param {String} key 查询字符串
         * @param {Number} result 结果 可不设
         * @return {HTMLElement}
         */
        formatItem: function(key, result) {
            var li = document.createElement('li');

            var keyEl = document.createElement('span');
            keyEl.className = this.config.keyElClassName;
            keyEl.appendChild(document.createTextNode(key));
            li.appendChild(keyEl);

            if (typeof result != 'undefined') { // 可以没有
                var resultText = this.config.resultFormat.replace('%result%', result);
                if (Lang.trim(resultText)) { // 有值时才创建
                    var resultEl = document.createElement('span');
                    resultEl.className = this.config.resultElClassName;
                    resultEl.appendChild(document.createTextNode(resultText));
                    li.appendChild(resultEl);
                }
            }

            return li;
        },

        /**
         * 添加提示层底部
         */
        appendBottom: function() {
            var bottom = document.createElement('div');
            bottom.className = this.config.bottomClassName;

            if (this.config.showCloseBtn) {
                var closeBtn = document.createElement('a');
                closeBtn.href = 'javascript: void(0)';
                closeBtn.setAttribute('target', '_self'); // bug fix: 覆盖<base target="_blank" />，否则会弹出空白页面
                closeBtn.className = this.config.closeBtnClassName;
                closeBtn.appendChild(document.createTextNode(this.config.closeBtnText));

                // 没必要，点击时，输入框失去焦点，自动就关闭了
                /*
                 Event.on(closeBtn, 'click', function(ev) {
                 Event.stopEvent(ev);
                 this.hidden();
                 }, this, true);
                 */

                bottom.appendChild(closeBtn);
            }

            // 仅当有内容时才添加
            if (Lang.trim(bottom.innerHTML)) {
                this.container.appendChild(bottom);
            }
        },

        /**
         * 填充提示层
         * @protected
         * @param {String|HTMLElement} content innerHTML or Child Node
         */
        _fillContainer: function(content) {
            if (content.nodeType == 1) {
                this.container.innerHTML = '';
                this.container.appendChild(content);
            } else {
                this.container.innerHTML = content;
            }

            // 一旦重新填充了，selectedItem就没了，需要重置
            this.selectedItem = null;
        },

        /**
         * 根据contanier的内容，显示或隐藏容器
         */
        _displayContainer: function() {
            if (Lang.trim(this.container.innerHTML)) {
                this.show();
            } else {
                this.hide();
            }
        },

        /**
         * 选中提示层中的上/下一个条
         * @param {Boolean} down true表示down，false表示up
         */
        selectItem: function(down) {
            //console.log('select item ' + down);
            var items = this.container.getElementsByTagName('li');
            if (items.length == 0) return;
            if (!this.isVisible()) this.show(); // 有可能用ESC隐藏了，这里要确保显示
            var newSelectedItem;

            // 没有选中项时，选中第一/最后项
            if (!this.selectedItem) {
                newSelectedItem = items[down ? 0 : items.length - 1];
            } else {
                // 选中下/上一项
                newSelectedItem = Dom[down ? 'getNextSibling' : 'getPreviousSibling'](this.selectedItem);
                // 已经到了最后/前一项时，归位到输入框，并还原输入值
                if (!newSelectedItem) {
                    this.textInput.value = this.query;
                }
            }

            // 移除当前选中项
            this._removeSelectedItem();

            // 选中新项
            if (newSelectedItem) {
                this._setSelectedItem(newSelectedItem);
                this._updateInputFromSelectItem();
            }
        },

        /**
         * 移除选中项
         * @protected
         */
        _removeSelectedItem: function() {
            //console.log('remove selected item');
            Dom.removeClass(this.selectedItem, this.config.selectedItemClassName);
            this.selectedItem = null;
        },

        /**
         * 设置当前选中项
         * @protected
         * @param {HTMLElement} item
         */
        _setSelectedItem: function(item) {
            //console.log('set selected item');
            Dom.addClass((item), this.config.selectedItemClassName);
            this.selectedItem = (item);
        },

        /**
         * 获取提示层中选中项的key字符串
         * @protected
         */
        _getSelectedItemKey: function() {
            if (!this.selectedItem) return '';

            // getElementsByClassName比较损耗性能，改用缓存数据到attribute上方法
            //var keyEl = Dom.getElementsByClassName(this.config.keyElClassName, '*', this.selectedItem)[0];
            //return keyEl.innerHTML;

            return this.selectedItem.getAttribute('key');
        },

        /**
         * 将textInput的值更新到this.query
         * @protected
         */
        _updateQueryValueFromInput: function() {
            this.query = this.textInput.value;
        },

        /**
         * 将选中项的值更新到textInput
         * @protected
         */
        _updateInputFromSelectItem: function() {
            this.textInput.value = this._getSelectedItemKey(this.selectedItem);
        }

    };

    Lang.augmentProto(TB.Suggest, Y.EventProvider);

    /**
     * 当前激活的实例
     * @static
     */
    TB.Suggest.focusInstance = null;

    /**
     * 从jsonp中获取数据
     * @method callback
     */
    TB.Suggest.callback = function(data) {
        if (!TB.Suggest.focusInstance) return;
        // 使得先运行script.onload事件，然后再执行callback函数
        setTimeout(function() {
            TB.Suggest.focusInstance.handleResponse(data);
        }, 0);
    };

})();


/**
 * 小结：
 *
 * 整个组件代码，由两大部分组成：数据处理 + 事件处理
 *
 * 一、数据处理很core，但相对来说是简单的，由 requestData + handleResponse + formatData等辅助方法组成
 * 需要注意两点：
 *  a. IE中，改变script.src, 会自动取消掉之前的请求，并发送新请求。非IE中，必须新创建script才行。这是
 *     requestData方法中存在两种处理方式的原因。
 *  b. 当网速很慢，数据返回时，用户的输入可能已改变，已经有请求发送出去，需要抛弃过期数据。目前采用加时间戳
 *     的解决方案。更好的解决方案是，调整API，使得返回的数据中，带有query值。
 *
 * 二、事件处理看似简单，实际上有不少陷阱，分2部分：
 *  1. 输入框的focus/blur事件 + 键盘控制事件
 *  2. 提示层上的鼠标悬浮和点击事件
 * 需要注意以下几点：
 *  a. 因为点击提示层时，首先会触发输入框的blur事件，blur事件中调用hide方法，提示层一旦隐藏后，就捕获不到
 *     点击事件了。因此有了 this._mouseHovering 来排除这种情况，使得blur时不会触发hide，在提示层的点击
 *     事件中自行处理。（2009-06-18更新：采用mouseup来替代click事件，代码清晰简单了很多）
 *  b. 当鼠标移动到某项或通过上下键选中某项时，给this.selectedItem赋值；当提示层的数据重新填充时，重置
 *     this.selectedItem. 这种处理方式和google的一致，可以使得选中某项，隐藏，再次打开时，依旧选中原来
 *     的选中项。
 *  c. 在ie等浏览器中，输入框中输入ENTER键时，会自动提交表单。如果form.target="_blank", 自动提交和JS提交
 *     会打开两个提交页面。因此这里采取了在JS中不提交的策略，ENTER键是否提交表单，完全由HTML代码自身决定。这
 *     样也能使得组件很容易应用在不需要提交表单的场景中。（2009-06-18更新：可以通过blur()取消掉浏览器的默认
 *     Enter响应，这样能使得代码逻辑和mouseup的一致）
 *  d. onItemSelect 仅在鼠标点击选择某项 和 键盘选中某项回车 后触发。
 *  e. 当textInput会触发表单提交时，在enter keydown 和 keyup之间，就会触发提交。因此在keydown中捕捉事件。
 *     并且在keydown中能捕捉到持续DOWN/UP，在keyup中就不行了。
 *
 * 【得到的一些编程经验】：
 *  1. 职责单一原则。方法的职责要单一，比如hide方法和show方法，除了改变visibility, 就不要拥有其它功能。这
 *     看似简单，真要做到却并不容易。保持职责单一，保持简单的好处是，代码的整体逻辑更清晰，方法的可复用性也提
 *     高了。
 *  2. 小心事件处理。当事件之间有关联时，要仔细想清楚，设计好后再写代码。比如输入框的blur和提示层的click事件。
 *  3. 测试的重要性。目前是列出Test Cases，以后要尝试自动化。保证每次改动后，都不影响原有功能。
 *  4. 挑选正确的事件做正确的事，太重要了，能省去很多很多烦恼。
 *
 */
/**
 * @author xiaoma
 */
/** 简单滚动 */
TB.widget.SimpleScroll = new function() {
	
	var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = Y.Lang;	
 	var defConfig = {
		delay: 2,
		speed: 20,
		startDelay: 2,
		direction: 'vertical',	/* 'horizontal(h)' or 'vertical(v)'. defaults to vertical. */		
		disableAutoPlay: false, 
		distance: 'auto',
		scrollItemCount: 1  /** 随同一行滚动的li数量，默认1 */		
	}
	/**
	 * container 必须是一个 ul
	 * @param {Object} container
	 * @param {Object} config
	 */
	this.decorate = function(container, config) {
		container = Dom.get(container);
		config = Lang.merge(defConfig, config||{});
		var step = 2;
		if (config.speed < 20) {
			step = 5;
		}
		if (config.lineHeight) {
			config.distance = config.lineHeight;
		}
		
		var scrollTimeId = null, startTimeId = null, startDelayTimeId = null;
		/* 是否横向滚动 */
		var isHorizontal = (config.direction.toLowerCase() == 'horizontal') || (config.direction.toLowerCase() == 'h'); 
		
		/* 返回给调用者的控制器，只包含对调用者可见的方法/属性 */	
		var handle = {};
		handle._distance = 0;
		/* 空间上能否还可以滚动 */
		handle.scrollable = true;
		/* 本次预计滚动的距离 */
		handle.distance = config.distance;
		/* 每次滚动的距离 */
		handle._distance = 0;
		/* 鼠标移动上去时暂停 */
		handle.suspend = false;
		/* 暂停 */
		handle.paused = false;
	
		
		/* 内部使用事件 */
		var _onScrollEvent = new Y.CustomEvent("_onScroll", handle, false, Y.CustomEvent.FLAT);
		_onScrollEvent.subscribe(function() {
			var curLi = container.getElementsByTagName('li')[0];
			if (!curLi) { 
				this.scrollable = false;
				return;
			}
			this.distance = (config.distance == 'auto')?curLi[isHorizontal?'offsetWidth':'offsetHeight']:config.distance;
			with(container) { 
				if (isHorizontal)
					this.scrollable = (scrollWidth - scrollLeft - offsetWidth) >= this.distance;
				else 
					this.scrollable = (scrollHeight - scrollTop - offsetHeight) >= this.distance;
			}
		});
		
		/* 公开事件 */
		var onScrollEvent = new Y.CustomEvent("onScroll", handle, false, Y.CustomEvent.FLAT);
		if (config.onScroll) {
			onScrollEvent.subscribe(config.onScroll);
		} else {
			onScrollEvent.subscribe(function() {
				for (var i = 0; i < config.scrollItemCount; i++) {
					container.appendChild(container.getElementsByTagName('li')[0]);
				}
				container[isHorizontal?'scrollLeft':'scrollTop'] = 0;
			});
		}
		
		var scroll = function() {
			if (handle.suspend) return;
			handle._distance += step;
			var _d; 
			if ((_d = handle._distance % handle.distance) < step) {
				container[isHorizontal?'scrollLeft':'scrollTop'] += (step - _d);
				clearInterval(scrollTimeId);
				onScrollEvent.fire();
				_onScrollEvent.fire();
				startTimeId = null;
				if (handle.scrollable && !handle.paused) handle.play();
			}else{
				container[isHorizontal?'scrollLeft':'scrollTop'] += step;
			}
		}
		
		var start = function() {
			if (handle.paused) return;
			handle._distance = 0;
			scrollTimeId = setInterval(scroll, config.speed);
		}

		Event.on(container, 'mouseover', function(){handle.suspend=true;});
		Event.on(container, 'mouseout', function(){handle.suspend=false;});
		
		Lang.augmentObject(handle, {
			subscribeOnScroll: function(func, override) {
				if (override === true && onScrollEvent.subscribers.length > 0)
					onScrollEvent.unsubscribeAll();
				onScrollEvent.subscribe(func);
			},
			pause: function() {
				this.paused = true;
				clearTimeout(startTimeId);
				startTimeId = null;
			},
			play: function() {
				this.paused = false;
				if (startDelayTimeId) {clearTimeout(startDelayTimeId);}
				if (!startTimeId) {
					startTimeId = setTimeout(start, config.delay*1000);	
				}
			}
		});
		handle.onScroll = handle.subscribeOnScroll;
		
		/** 初始化移动距离并判断是否可滚动 */
		_onScrollEvent.fire();
		/** 自动开始滚动 */		
		if (!config.disableAutoPlay) {
			startDelayTimeId = setTimeout(function(){handle.play();}, config.startDelay*1000);
		}		
		return handle;
	}
};/**
 * TBra Slide 
 * 
 * 限制：幻灯片必须包括在<ul>中，每张幻灯片是一个<li>。
 * @author xiaoma<xiaoma@taobao.com>
 * 
 */
/* 幻灯片播放 */
(function() {
	var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = Y.Lang;
	
	var _stripTags = function(str) {
    	return str.replace(/<\/?[^>]+>/gi, '');
  	}

	TB.widget.Slide = function(container, config) {
		this.init(container, config);
	}
	/* 默认参数配置 */ 
	TB.widget.Slide.defConfig = {
		slidesClass: 'Slides',			/* 幻灯影片ul的className */
		triggersClass: 'SlideTriggers',		/* 触点的className */
		currentClass: 'Current',			/* 当前触点的className */
		eventType: 'click',					/* 触点接受的事件类型，默认是鼠标点击 */
		autoPlayTimeout: 5,					/* 自动播放时间间隔 */
		disableAutoPlay: false				/* 禁止自动播放 */
	};
	TB.widget.Slide.prototype = {
		/**
		 * 初始化对象属性和行为
		 * @method init 
		 * @param {Object} container 容器对象或ID
		 * @param {Object} config 配置参数
		 */
		init: function(container, config) {
			this.container = Dom.get(container);
			this.config = Lang.merge(TB.widget.Slide.defConfig, config||{});
			try {
				this.slidesUL = Dom.getElementsByClassName(this.config.slidesClass, 'ul', this.container)[0];
				
				if(!this.slidesUL) {
					//取第一个 ul 子节点
					this.slidesUL = Dom.getFirstChild(this.container, function(node) {
						return node.tagName.toLowerCase === 'ul';
					});
				}
				
				this.slides = Dom.getChildren(this.slidesUL); //只取直接的子<li>元素
				if (this.slides.length == 0) {
					throw new Error();
				}
			} catch (e) {
				throw new Error("can't find slides!");
			}
			this.delayTimeId = null;		/* eventType = 'mouse' 时，延迟的TimeId */
			this.autoPlayTimeId = null;		/* 自动播放TimeId */
			this.curSlide = -1;
			this.sliding = false;
			this.pause = false;
			this.onSlide = new Y.CustomEvent("onSlide", this, false, Y.CustomEvent.FLAT);
			if (Lang.isFunction(this.config.onSlide)){
				this.onSlide.subscribe(this.config.onSlide, this, true);
			}
			
			this.beforeSlide = new Y.CustomEvent("beforeSlide", this, false, Y.CustomEvent.FLAT);
			if (Lang.isFunction(this.config.beforeSlide)){
				this.beforeSlide.subscribe(this.config.beforeSlide, this, true);
			}			
			
			/* 指定tbra.css中设定的 class */
			Dom.addClass(this.container, 'tb-slide');
			Dom.addClass(this.slidesUL, 'tb-slide-list');
			Dom.setStyle(this.slidesUL, 'height', (this.config.slideHeight || this.container.offsetHeight) + 'px');
			
			this.initSlides(); /* 初始化幻灯片设置 */
			this.initTriggers();
			if (this.slides.length > 0)
				this.play(1);
			if (! this.config.disableAutoPlay){
				this.autoPlay();
			}
			if (Lang.isFunction(this.config.onInit)) {
				this.config.onInit.call(this);
			}
		},
		
		/**
		 * 根据幻灯片长度自动生成触点，包含在一个<ul>中，页面中CSS中必须有对应属性设置
		 * @method initTriggers 
		 */
		initTriggers: function() {
			var ul = document.createElement('ul');
			this.container.appendChild(ul);
			for (var i = 0; i < this.slides.length; i++) {
				var li = document.createElement('li');
				li.innerHTML = i+1;
				ul.appendChild(li);
			}
			Dom.addClass(ul, this.config.triggersClass);
			this.triggersUL = ul;
			if (this.config.eventType == 'mouse') {
				Event.on(this.triggersUL, 'mouseover', this.mouseHandler, this, true);
				Event.on(this.triggersUL, 'mouseout', function(e){
					clearTimeout(this.delayTimeId);
					this.pause = false;
				}, this, true);
			} else {
				Event.on(this.triggersUL, 'click', this.clickHandler, this, true);
			}
		},
		
		/**
		 * 初始化幻灯片
		 * @method initSlides 
		 */
		initSlides: function() {
			Event.on(this.slides, 'mouseover', function(){this.pause = true;}, this, true);
			Event.on(this.slides, 'mouseout', function(){this.pause = false;}, this, true);
			Dom.setStyle(this.slides, 'display', 'none');
		},
		
		/**
		 * 点击事件处理
		 * @param {Object} e Event对象
		 */
		clickHandler: function(e) {
			var t = Event.getTarget(e);
			var idx = parseInt(_stripTags(t.innerHTML));
			while(t != this.container) {
				if(t.nodeName.toUpperCase() == "LI") {
					 /* 如果还在滑动中,停止响应 */
					if (!this.sliding){
						this.play(idx, true);
					}
					break;
				} else {
					t = t.parentNode;
				}
			}		
		},
		
		/**
		 * 鼠标事件处理
		 * @param {Object} e Event 对象
		 */
		mouseHandler: function(e) {
			var t = Event.getTarget(e);
			var idx = parseInt(_stripTags(t.innerHTML));
			while(t != this.container) {
				if(t.nodeName.toUpperCase() == "LI") {
					var self = this;			
					this.delayTimeId = setTimeout(function() {
							self.play(idx, true);
							self.pause = true;
						}, (self.sliding?.5:.1)*1000);
					break;
				} else {
					t = t.parentNode;
				}
			}
		},
		
		/**
		 * 播放指定页的幻灯片
		 * @param {Object} n 页数，也就是触点数字值
		 * @param {Object} flag 如果flag=true，则是用户触发的，反之则为自动播放
		 */
		play: function(n, flag) {
			n = n - 1;
			if (n == this.curSlide) return;
			var curSlide = this.curSlide >= 0 ? this.curSlide : 0;
			if (flag && this.autoPlayTimeId)
				clearInterval(this.autoPlayTimeId);
			var triggersLis = this.triggersUL.getElementsByTagName('li');
			triggersLis[curSlide].className = ''; 
			triggersLis[n].className = this.config.currentClass;
			this.beforeSlide.fire(n);
			this.slide(n);
			this.curSlide = n;
			if (flag && !this.config.disableAutoPlay)
				this.autoPlay();
		},
		
		/**
		 * 切换幻灯片，最简单的切换就是隐藏/显示。
		 * 不同的效果可以覆盖此方法
		 * @see TB.widget.ScrollSlide
		 * @see TB.widget.FadeSlide
		 * @param {Object} n 页数
		 */
		slide: function(n) {
			var curSlide = this.curSlide >= 0 ? this.curSlide : 0;
			this.sliding = true;
			Dom.setStyle(this.slides[curSlide], 'display', 'none');
			Dom.setStyle(this.slides[n], 'display', 'block');
			this.sliding = false;
			this.onSlide.fire(n);
		},
		
		/**
		 * 设置自动播放
		 * @method autoPlay
		 */
		autoPlay: function() {
			var self = this;
			var callback = function() {
				if ( !self.pause && !self.sliding ) {
					var n = (self.curSlide+1) % self.slides.length + 1;
					self.play(n, false);
				}
			}
			this.autoPlayTimeId = setInterval(callback, this.config.autoPlayTimeout * 1000);
		}
	}
	
	/**
	 * 滚动效果的幻灯片播放器
	 * @param {Object} container
	 * @param {Object} config
	 */
	TB.widget.ScrollSlide = function(container, config){
		this.init(container, config);
	}
	YAHOO.extend(TB.widget.ScrollSlide, TB.widget.Slide, {
		/**
		 * 覆盖父类的行为，不隐藏幻灯片
		 * CSS中注意设置 slidesUL overflow:hidden，保证只显示一幅幻灯
		 */
		initSlides: function() {
			TB.widget.ScrollSlide.superclass.initSlides.call(this);
			Dom.setStyle(this.slides, 'display', '');
		},
		/**
		 * 覆盖父类的行为，使用滚动动画
		 * @param {Object} n
		 */
		slide: function(n) {
			var curSlide = this.curSlide >= 0 ? this.curSlide : 0;
			var args = { scroll: {by:[0, this.slidesUL.offsetHeight*(n-curSlide)]} };
			var anim = new Y.Scroll(this.slidesUL, args, .5, Y.Easing.easeOutStrong);
			anim.onComplete.subscribe(function(){
				this.sliding = false;
				this.onSlide.fire(n);
			}, this, true);
			anim.animate();
			this.sliding = true;
		}
	});
	
	/**
	 * 淡入淡出效果的幻灯片播放器
	 * @param {Object} container
	 * @param {Object} config
	 */
	TB.widget.FadeSlide = function(container, config){
		this.init(container, config);
	}
	YAHOO.extend(TB.widget.FadeSlide, TB.widget.Slide, {
		/**
		 * 覆盖父类的行为，设置幻灯片的position=absolute
		 */
		initSlides: function() {
			TB.widget.FadeSlide.superclass.initSlides.call(this);
			Dom.setStyle(this.slides, 'position', 'absolute');
			Dom.setStyle(this.slides, 'top', this.config.slideOffsetY||0);
			Dom.setStyle(this.slides, 'left', this.config.slideOffsetX||0);
			Dom.setStyle(this.slides, 'z-index', 1);
		},
		
		/**
		 * 覆盖父类的行为，使用淡入淡出动画
		 * @param {Object} n
		 */
		slide: function(n) {
			/* 第一次运行 */
			if (this.curSlide == -1) {
				Dom.setStyle(this.slides[n], 'display', 'block');
				this.onSlide.fire(n);
			} else {
				var curSlideLi = this.slides[this.curSlide];
				Dom.setStyle(curSlideLi, 'display', 'block');
				Dom.setStyle(curSlideLi, 'z-index', 10);
				var fade = new Y.Anim(curSlideLi, { opacity: { to: 0 } }, .5, Y.Easing.easeNone);
				fade.onComplete.subscribe(function(){
					Dom.setStyle(curSlideLi, 'z-index', 1);
					Dom.setStyle(curSlideLi, 'display', 'none');
					Dom.setStyle(curSlideLi, 'opacity', 1);
					this.sliding = false;
					this.onSlide.fire(n);
				}, this, true);
				
				Dom.setStyle(this.slides[n], 'display', 'block');
				
				fade.animate();			
				this.sliding = true;
			}
		}
	});	
	
})();

/**
 * Slide 的封装，通过 effect 参数，创建不同的Slide对象
 */
TB.widget.SimpleSlide = new function() {
	
	this.decorate = function(container, config) {
		if (!container) return;
		config = config || {};
		if (config.effect == 'scroll') {
			/** <li>下包含<iframe>时，firefox显示异常 */ 
			if (YAHOO.env.ua.gecko) {
				if (YAHOO.util.Dom.get(container).getElementsByTagName('iframe').length > 0) {
					return new TB.widget.Slide(container, config);
				}
			}
			return new TB.widget.ScrollSlide(container, config);
		}
		else if (config.effect == 'fade') {
			return new TB.widget.FadeSlide(container, config);
		}
		else {
			return new TB.widget.Slide(container, config);
		}
	}	
}/* 简单Tab切换 */
TB.widget.SimpleTab = new function() {
	var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = Y.Lang;
	var defConfig = {
		eventType: 'click',
		currentClass: 'Current',  /* li 当前选中状态时的className */
		tabClass: '',  /* 作为 tab 的element的 className */
		tabPanelClass: '',  /* 作为 tab panel 的element的 className */
		autoSwitchToFirst: true,  /* 是否默认选中第一个tab */
		stopEvent: true,  /* 停止事件传播 */
		delay: 0.1  /* available when eventType=mouse */
	};

	this.decorate = function(container, config) {
		container = Dom.get(container);
		config = Lang.merge(defConfig, config||{});
		/* 返回给调用者的控制器，只包含对调用者可见的方法/属性 */		
		var handle = {}, tab, tabPanels, tabTriggerBoxs, tabTriggers, delayTimeId;
		
		tab = Dom.getFirstChild(container);  //container下的第一个el(通常为<ul> or <ol>)被视为标签列表
		tabTriggerBoxs  = tab.getElementsByTagName('li');
		
		if (config.tabClass) { //如果参数指定了要被视作tab标签的class，则根据className 获取元素
			tabTriggers = Dom.getElementsByClassName(config.tabClass, '*', container);
		} else {  //否则获取 tab 下的所谓<a>作为tab标签
			tabTriggers = Array.copy(tab.getElementsByTagName('a')); /* 默认取tab下的<a> */
		}
		if (config.tabPanelClass) { //如果参数指定了要被视为tab面板的class,则根据className 获取元素
			tabPanels = Dom.getElementsByClassName(config.tabPanelClass, '*', container);
		} else { //否则直接取除第一个元素外的剩下元素作为面板
			tabPanels = Dom.getChildren(container).slice(1);
		}
		var onSwitchEvent = new Y.CustomEvent("onSwitch", null, false, Y.CustomEvent.FLAT);
		if (config.onSwitch) {
			onSwitchEvent.subscribe(config.onSwitch);
		}

		var focusHandler = function(ev) {
			if (delayTimeId)
				cacelHandler();
			var idx = tabTriggers.indexOf(this);
			handle.switchTab(idx);
			if (config.stopEvent) {
				try {
					Event.preventDefault(ev);
				}catch (e) {
					/* ignore */
				}
			}
			return !config.stopEvent;
		}
		var delayHandler = function(ev) {
			var target = this;
			delayTimeId = setTimeout(function(){
				focusHandler.call(target, ev);
			}, config.delay*1000);
			if (config.stopEvent)
				Event.preventDefault(ev);
			return !config.stopEvent;
		}
		var cacelHandler = function() {
			clearTimeout(delayTimeId);
		}
		if (config.eventType == 'mouse') {
			Event.on(tabTriggers, 'focus', focusHandler);
			Event.on(tabTriggers, 'mouseover', config.delay?delayHandler:focusHandler);
			Event.on(tabTriggers, 'mouseout', cacelHandler);
		}
		//else { // by yubo 2009-03-20  click 事件是始终要注册的，否则stopEvent不生效
		Event.on(tabTriggers, 'click', focusHandler);
		//}

		/* 定义公开的方法 */
		Lang.augmentObject(handle, {
			switchTab: function(idx) {
				Dom.setStyle(tabPanels, 'display', 'none');
				Dom.removeClass(tabTriggerBoxs, config.currentClass);
				Dom.addClass(tabTriggerBoxs[idx], config.currentClass);
				Dom.setStyle(tabPanels[idx], 'display', 'block');
				onSwitchEvent.fire(idx);
			},
			subscribeOnSwitch: function(func) {
				onSwitchEvent.subscribe(func);
			}
		}, true);
		handle.onSwitch = handle.subscribeOnSwitch;
		
		/*初始化操作*/
		Dom.setStyle(tabPanels, 'display', 'none');
		if (config.autoSwitchToFirst)
			handle.switchTab(0);
		
		/* 返回操作对象 */
		return handle;
	}
};
/**
 * @author zexin.zhaozx
 */
TB.widget.InputHint = new function() {
	var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = Y.Lang;

	var defConfig = {
		hintMessage: '',
		hintClass: 'tb-input-hint',
		appearOnce: false
	};
	var EMPTY_PATTERN = /^\s*$/;
	
	var focusHandler = function(ev, handle) {
		if (!handle.disabled)
			handle.disappear();
	}
	var blurHandler = function(ev, handle) {
		if (!handle.disabled)
			handle.appear();
	}
	
	this.decorate = function(inputField, config) {
		inputField = Dom.get(inputField);
		config = Lang.merge(defConfig, config || {});
		var hintMessage = config.hintMessage || inputField.title;
		var handle = {};
		handle.disabled = false;
		
		handle.disappear = function() {
			if (hintMessage == inputField.value) {
				inputField.value = '';
				Dom.removeClass(inputField, config.hintClass);
			}
		};
		
		handle.appear = function() {
			if (EMPTY_PATTERN.test(inputField.value) || hintMessage == inputField.value) {
				Dom.addClass(inputField, config.hintClass);
				inputField.value = hintMessage;				
			}
		}
		
		handle.purge = function() {
			this.disappear();
			Event.removeListener(inputField, 'focus', focusHandler);
			Event.removeListener(inputField, 'drop', focusHandler);
			Event.removeListener(inputField, 'blur', blurHandler);
		}
		
		/* 初始化 */
		if (!inputField.title)
			inputField.setAttribute("title", hintMessage);
		Event.on(inputField, 'focus', focusHandler, handle);
		Event.on(inputField, 'drop', focusHandler, handle); /* for ie/safari */
		
		if (!config.appearOnce)
			Event.on(inputField, 'blur', blurHandler, handle);
		
		/* 默认先显示 */
		handle.appear();
		return handle;
	}
}/**
 * @fileOverview TB.anim 基于YAHOO.util.Anim封装的动画效果
 * @name TB.anim
 * @example
	new TB.anim.Highlight(el, {
		startColor: '#ffff99'
	}).animate();
 */
 
/**
 * @constructor
 * @param {Object} el 应用动画的元素
 * @param {Object} [config]  配置参数
 */	
TB.anim.Highlight = function(el, config) {
	if (!el) return;
	this.init(el, config)
}

/**
 * 默认配置
 */
TB.anim.Highlight.defConfig = {
	/** 加亮开始时设置的背景色*/
	startColor: '#ffff99',
	/** 动画时长 */
	duration: .5,
	/** 是否保持原先的背景 */
	keepBackgroundImage: true
};

TB.anim.Highlight.prototype.init = function(el, config) {
	var Y = YAHOO.util, Dom = Y.Dom, Lang = Y.Lang;

	config = Lang.merge(TB.anim.Highlight.defConfig, config||{});

	var attr = {backgroundColor: {from: config.startColor}};
	var anim =	new Y.ColorAnim(el, attr, config.duration);
	var originBgColor = anim.getAttribute('backgroundColor');
	anim.attributes['backgroundColor']['to'] = originBgColor;

	if (config.keepBackgroundImage) {
		var originBg = Dom.getStyle(el, 'background-image');
		anim.onComplete.subscribe(function() {
			Dom.setStyle(el, 'background-image', originBg);
		});
	}
	
	/**
	 * onComplete 回调，直接引用被封装的 Anim 对象的 onComplete 事件
	 */	
	this.onComplete = anim.onComplete;
	
	/**
	 * 执行动画
	 */
	this.animate = function() {
		Dom.setStyle(el, 'background-image', 'none');
		anim.animate();
	}
};

/**
 * Countdown Timer
 * @author xiaoma<xiaoma@taobao.com>
 */
TB.util.CountdownTimer = new function() {
	
	var Y = YAHOO.util, Dom = Y.Dom, Lang = Y.Lang;
	
	var MINUTE = 60;
	var HOUR = MINUTE * 60;
	var DAY = HOUR*24;	
	
	var defConfig = {
		formatStyle: 'short', /* 'long' ： x天x小时x分x秒  or 'short' ：[x天x小时 | x小时x分 | x分x秒]  or custom */
		formatPattern: '',  /* for formatStyle == custom */
		hideZero: true, /* for formatStyle == 'long' : if day==0 then show x小时x分x秒，etc. */
		timeoutText: 'timeoutText',
		updatable: true
	};
	
	var leadingZero = function(n) {
		return ((n < 10) ? "0" : "") + n;
	}
	
	var genTimeFilter = function(lt) {
		return function(key, val) {
			switch(key) {
				case 'd': 
					return parseInt(lt / DAY);
				case 'dd':
					return leadingZero(parseInt(lt / DAY));
				case 'hh':
					return leadingZero(parseInt(lt % DAY / HOUR));
				case 'h':
					return parseInt(lt % DAY / HOUR);
				case 'mm':
					return leadingZero(parseInt(lt % DAY % HOUR / MINUTE));
				case 'm':
					return parseInt(lt % DAY % HOUR / MINUTE);
				case 'ss':
					return leadingZero(parseInt(lt % DAY % HOUR % MINUTE));
				case 's':
					return parseInt(lt % DAY % HOUR % MINUTE);				
			}
		}
	}
	
	this.attach = function(container, leftTime, config) {
		container = Dom.get(container);
		leftTime = parseInt(leftTime);
		config = Lang.merge(defConfig, config||{});
		var handle = {};
				
		var onStartEvent = new Y.CustomEvent("onStart", null, false, Y.CustomEvent.FLAT);
		if (config.onStart) {
			onStartEvent.subscribe(config.onStart);
		}
		var onEndEvent = new Y.CustomEvent("onEnd", null, false, Y.CustomEvent.FLAT);
		if (config.onEnd) {
			onEndEvent.subscribe(config.onEnd);
		}
		
		var currTime = parseInt(new Date().getTime()/1000);
		var endTime = currTime + leftTime;

		var updateTimer = function() {
			handle.update();			
		}
				
		handle.update = function() {
			var pattern = config.formatPattern, values = {}, nu = 1;
			if (config.formatStyle == 'long') {
				pattern = '{d}' + $M('day') + '{hh}' + $M('hour') + '{mm}' + $M('minute') + '{ss}' + $M('second');
			}			
			var lt = endTime - parseInt(new Date().getTime()/1000);
			if (lt <= 0) {
				container.innerHTML = $M(config.timeoutText);
				onEndEvent.fire();
				return;				
			}
			else if (lt > DAY) {
				if (config.formatStyle == 'short') {
					pattern = '{d}' + $M('day') + '{hh}' + $M('hour');
					nu = Math.floor(lt % DAY % HOUR) || HOUR;
				}
			}
			else if (lt > HOUR) {
				if (config.formatStyle == 'short') {
					pattern = '{hh}' + $M('hour') + '{mm}' + $M('minute');
					nu = Math.floor(lt % HOUR % MINUTE) || MINUTE;
				} else if (config.formatStyle == 'long' && config.hideZero) {
					pattern = '{hh}' + $M('hour') + '{mm}' + $M('minute') + '{ss}' + $M('second');
				}
			}
			else if (lt > 0) {
				if (config.formatStyle == 'short' || (config.formatStyle == 'long' && config.hideZero)) {
					pattern = '{mm}' + $M('minute') + '{ss}' + $M('second');
				}
			}
			
			container.innerHTML = Lang.substitute(pattern, values, genTimeFilter(lt)); 
			if (config.updatable && nu > 0)
				setTimeout(updateTimer, nu*1000);
		}
		
		handle.init = function() {
			this.update();
			onStartEvent.fire();
		}
				
		handle.init();
		return handle;
	}
}/* 简单分页 */
TB.util.Pagination = new function() {
	
	var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = Y.Lang;	
	
	var PAGE_SEPARATOR = '...'; /*页省略符号*/	

	/* 默认配置参数 */	
	var defConfig = {
		pageUrl: '',
		prevPageClass: 'PrevPage',  /*上一页<li>的className*/
		noPrevClass: 'NoPrev',       /*上一页不可用时<li>的className*/
		prevPageText: 'prevPageText',
		nextPageClass: 'NextPage',  /*下一页<li>的className*/
		nextPageText: 'nextPageText',
		noNextClass: 'NoNext',       /*下一页不可用时<li>的className*/		
		currPageClass: 'CurrPage',  /*当前页<li>的className*/
		pageParamName: 'page',		/*标识页数的参数名*/
		appendParams: '',   /*附带其他的参数*/
		pageBarMode: 'bound',  /*分页条的样式  bound | eye | line*/
		showIndicator: true,   /*显示加载提示图标*/
		cachePageData: false  /*缓存分页数据*/
	}
	
	/**
	 * 停止click事件传播，用于上/下一页不可用时，或者分页数据加载中时所有分页点都被禁用时
	 * @param {Object} ev  事件对象
	 */
	var cancelHandler = function(ev) {
		Event.stopEvent(ev);
	}
	
	/**
	 * 分页点击事件处理程序
	 * @param {Object} ev  	 事件对象
	 * @param {Object} args  参数格式为 [pageIndex, handle]
	 */
	var pageHandler = function(ev, args) {
		Event.stopEvent(ev);
		var target = Event.getTarget(ev);
		args[1].gotoPage(args[0]);
	}
	
	/**
	 * 构造"bound"形式的分页列表
	 * @param {Object} pageIndex  当前页
	 * @param {Object} pageCount  总页数
	 */
	var buildBoundPageList = function(pageIndex, pageCount) {
        var l = [];
        var leftStart = 1;
        var leftEnd = 2;
        var mStart = pageIndex - 2;
        var mEnd = pageIndex + 2;
        var rStart = pageCount - 1;
        var rEnd = pageCount;

        if (mStart <= leftEnd) {
            leftStart = 0;
            leftEnd = 0;
            mStart = 1;
        }

        if (mEnd >= rStart) {
            rStart = 0;
            rEnd = 0;
            mEnd = pageCount;
        }

        if (leftEnd > leftStart) {
            for (var i = leftStart; i <= leftEnd; ++i) {
            	l[l.length] = ""+i;
            }

            if ((leftEnd + 1) < mStart) {
            	l[l.length] = PAGE_SEPARATOR;
            }
        }

        for (var i = mStart; i <= mEnd; ++i) {
        	l[l.length] = ""+i;
        }

        if (rEnd > rStart) {
            if ((mEnd + 1) < rStart) {
            	l[l.length] = PAGE_SEPARATOR;
            }

            for (var i = rStart; i <= rEnd; ++i) {
            	l[l.length] = ""+i;
            }
        }
        return l;
	}
	
	/**
	 * 创建包括页符的<li> element
	 * @param {Object} idx   页符
	 * @param {Object} config
	 */
	var buildPageEntry = function(idx, config) {
		var liEl = document.createElement('li');
		if (idx != PAGE_SEPARATOR) {
			Dom.addClass(liEl, (idx=='prev')?config.prevPageClass:(idx=='next')?config.nextPageClass:'');
			var aEl = document.createElement('a');
			aEl.setAttribute('title',(idx == 'prev')?$M(config.prevPageText):(idx=='next')?$M(config.nextPageText):''+idx);
			aEl.href = buildPageUrl(idx, config) + '&t=' + new Date().getTime();
			aEl.innerHTML = (idx=='prev')?$M(config.prevPageText):(idx=='next')?$M(config.nextPageText):idx;
			liEl.appendChild(aEl);
		} else {
			/*如果是分页省略分隔符，直接显示省略号*/
			liEl.innerHTML = PAGE_SEPARATOR;
		}
		return liEl;
	}
	
	/**
	 * 构造页标Url
	 * @param {Object} idx
	 * @param {Object} config
	 */
	var buildPageUrl = function(idx, config) {
		var url = config.pageUrl + (config.pageUrl.lastIndexOf('?')!=-1?'&':'?') + config.pageParamName + '=' + idx;
		if (config.appendParams)
			url += '&' + config.appendParams;
		return url;
	}
	
	/**
	 * 接口函数
	 * @param {Object} pageBarContainer 分页条容器
	 * @param {Object} pageDataContainer  页面数据容器
	 * @param {Object} config 配置参数
	 */
	this.attach = function(pageBarContainer, pageDataContainer, config) {	
		pageBarContainer = Dom.get(pageBarContainer);
		pageDataContainer = Dom.get(pageDataContainer);
		config = Lang.merge(defConfig, config||{});
		
		/*数据缓存对象*/
		if (config.cachePageData) {
			var pageDataCache = {};
		}
		
		var ulEl = document.createElement('ul');
		pageBarContainer.appendChild(ulEl);
		
		var pageLoadEvent = new Y.CustomEvent('pageLoad', null, false, Y.CustomEvent.FLAT);
		
		var handle = {};
		
		/**
		 * 重新整理分页符
		 * @param {Object} pageObj  JSON格式的分页数据
		 * 
		 * 数据格式
		 * {
		 * 		"Pagination": {
		 * 			"PageIndex": 1, //当前页
		 * 			"PageCount" : 3 , //总页数
		 * 			"PageSize" : 100, //页面条目数
		 * 			"TotalCount" : 300, //条目总数（可选）
		 * 			"PageData" : "<html>" //编码后的html代码
		 * 		} 
		 * 	}
		 */
		handle.rebuildPageBar = function(pageObj) {
			if (!pageObj) return;

			this.pageIndex = parseInt(pageObj.PageIndex);
			this.totalCount = parseInt(pageObj.TotalCount);
			this.pageCount = parseInt(pageObj.PageCount);
			this.pageSize = parseInt(pageObj.PageSize);
			
			/* 清除page UL 内容并重新构造 */
			ulEl.innerHTML = '';
			
			/* 获取分页页码列表 */
			var list = this.repaginate();

			/* 上一页导航单元 */
			var prevLiEl = buildPageEntry('prev', config);
			if (!this.isPrevPageAvailable()) {
				Dom.addClass(prevLiEl, config.noPrevClass);
				Event.on(prevLiEl, 'click', cancelHandler);
			} else {
				Event.on(prevLiEl, 'click', pageHandler, [this.pageIndex-1, this]);
			}
			ulEl.appendChild(prevLiEl);			
			
			/* 循环构造分页符 */
			for (var i = 0; i < list.length; i++) {
				var liEl = buildPageEntry(list[i], config);
				if (list[i] == this.pageIndex) {
					Dom.addClass(liEl, config.currPageClass);
					Event.on(liEl, 'click', cancelHandler);
				} else {
					Event.on(liEl, 'click', pageHandler, [list[i], this]);				
				}
				ulEl.appendChild(liEl);
			}
			
			/* 下一页导航单元 */
			var nextLiEl = buildPageEntry('next', config);
			if (!this.isNextPageAvailable()) {
				Dom.addClass(nextLiEl, config.noNextClass);
				Event.on(nextLiEl, 'click', cancelHandler);
			} else {
				Event.on(nextLiEl, 'click', pageHandler, [this.pageIndex+1, this]);
			}			
			ulEl.appendChild(nextLiEl);
		}
		
		/**
		 * 构造分页页码表
		 */
		handle.repaginate = function() {
			var mode = config.pageBarMode;
			if (mode == 'bound') {
				/* 返回 bound 形式的分页条，间断性的显示页码 */
				return buildBoundPageList(parseInt(this.pageIndex), parseInt(this.pageCount));
			} else if (mode == 'line') {
				/* 返回 line 形式的分页条，显示所有页码 */
				var l = [];
				for (var i = 1; i <= this.pageCount; i++) {
					l.push(i);
				}
				return l;
			} else if (mode == 'eye') {
				/* 返回 eye 形式的分页条,只有向前向后的分页形式 */
				return [];
			}
		}
		
		/**
		 * 显示指定页码的数据
		 * @param {Object} idx  页码
		 */
		handle.gotoPage = function(idx) {
			this.disablePageBar();
			if (config.showIndicator) {
				Dom.setStyle(pageDataContainer, 'display', 'none');
				var indicator = TB.util.Indicator.attach(pageDataContainer, {message:$M('loading')});
				indicator.show();
			}
			var url = buildPageUrl(idx, config);
			
			/* 如果设置了数据缓存，而发现缓存数据已存在，直接显示缓存中的数据 */
			if (config.cachePageData) {
				if (pageDataCache[url]) {
					handle.showPage(pageDataCache[url]);
					return;
				}
			} 
			
			Y.Connect.asyncRequest('GET', url + '&t=' + new Date().getTime(), {
				success: function(req) {
					var resultSet = eval('(' + req.responseText + ')');
					handle.showPage(resultSet.Pagination);
					if (config.cachePageData) {
						pageDataCache[url] = resultSet.Pagination;	
					}
					if (config.showIndicator){
						indicator.hide();
						Dom.setStyle(pageDataContainer, 'display', 'block');
					}			
				},
				failure: function(req) {
					if (config.showIndicator){
						Dom.setStyle(pageDataContainer, 'display', 'block');						
						indicator.hide();
					}
					handle.rebuildPageBar();			
					alert($M('ajaxError'));
				}
			});	
		}
		
		handle.showPage = function(pageObj) {
			this._showPage(pageObj);
			this.rebuildPageBar(pageObj);
			pageLoadEvent.fire(pageObj);
		}
		
		handle._showPage = function(pageObj) {
			if (pageObj.PageData && Lang.isString(pageObj.PageData))
				pageDataContainer.innerHTML = pageObj.PageData;
		}

		/**
		 * 存在下一页？
		 */
		handle.isNextPageAvailable = function() {
			return this.pageIndex < this.pageCount;
		}

		/**
		 * 存在上一页?
		 */
		handle.isPrevPageAvailable = function() {
			return this.pageIndex > 1;
		}
		
		/**
		 * 禁用分页条，当用户点击某个分页符时，禁用整个分页条中所有<a>的点击操作，并设置其disabled=1
		 * @param {Object} bar
		 */
		handle.disablePageBar = function() {
			Dom.addClass(pageBarContainer, 'Disabled');
			/* 先重置所有onclick event handler */
			Event.purgeElement(pageBarContainer, true, 'click');
			var els = Array.copy(pageBarContainer.getElementsByTagName('a'));
			els.forEach(function(el, i){
				Event.on(el, 'click', cancelHandler);
				el.disabled = 1;
			});
		}		
		
		/**
		 * 注册页面数据加载完成后执行的回调函数
		 * @param {Object} callback
		 */
		handle.onPageLoad = function(callback) {
			if (Lang.isFunction(callback))
				pageLoadEvent.subscribe(callback);
		} 
		
		/**
		 * 设置query其他参数
		 * @param {Object} params
		 */
		handle.setAppendParams = function(params) {
			config.appendParams = params;
		}
		
		return handle;		
	}			
}/**
 * 构造queryString
 * @param {Object} maps
 */
TB.util.QueryData = function() {
	this.data = [];
	this.addField = function(input) {
		for(var i = 0; i < arguments.length; i++) {
			var field = arguments[i];
			if (field)
				this.add(field.name, encodeURIComponent(field.value));
		}
	}
	this.add = function(name, value) {
		this.data.push({"name":name, "value":value});
	}
	this.get = function(name) {
		for (var i = 0; i < this.data.length; i++) {
			if (this.data[i].name === name)
				return this.data[i].value;
		}
		return null;
	}
	this.toQueryString = function() {
		var qs = this.data.map(function(o, i) {
			return o.name + '=' + o.value;
		});
		return qs.join('&'); 			
	}
}/**
 * @author zexin.zhaozx
 */
TB.form.CheckboxGroup = new function() {
	var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = Y.Lang;
	var defConfig = {
		checkAllBox: 'CheckAll',
		checkAllBoxClass: 'tb:chack-all',
		checkOnInit: true /* 初始化时是否预处理 */
	}
	var getChecked = function(o, i) { return o.checked;	}
	var setChecked = function(o, i) {
		if (o.type && o.type.toLowerCase()=='checkbox')
			o.checked = true; 
	}
	var setUnchecked = function(o, i) {
		if (o.type && o.type.toLowerCase()=='checkbox')
			o.checked = false; 
	}
	
	this.attach = function(checkboxGroup, config) {
		config = Lang.merge(defConfig, config || {});
		/*返回给调用者的控制器，只包含对调用者可见的方法/属性*/	
		var handle = {};
		var onCheckEvent = new Y.CustomEvent('onCheck', handle, false, Y.CustomEvent.FLAT);			
	
		var checkboxes = [];
		if (checkboxGroup) {
			if(checkboxGroup.length)
				checkboxes = Array.copy(checkboxGroup);
			else
				checkboxes[0] = checkboxGroup; /*如果只有一个checkbox*/		
		}
		
		var checkAllBoxes = [];
		if (config.checkAllBoxClass) {
			checkAllBoxes = Dom.getElementsByClassName(config.checkAllBoxClass, null, checkboxes[0].form);
		}
		if (Dom.get(config.checkAllBox)) {
			checkAllBoxes.push(Dom.get(config.checkAllBox));
		}
 
		var doCheck = function() {
			var checkedBoxes = checkboxes.filter(getChecked);
			if (checkboxes.length == 0) {
				checkAllBoxes.forEach(setUnchecked);
			} else {
				checkAllBoxes.forEach((checkedBoxes.length == checkboxes.length)?setChecked:setUnchecked);
			}			
			handle._checkedBoxCount = checkedBoxes.length;
		}		
		var clickHandler = function(ev) {
			var checkbox = Event.getTarget(ev);
			doCheck();
			onCheckEvent.fire(checkbox);
			return true;
		}

		Lang.augmentObject(handle, {
			_checkedBoxCount : 0,
			
			onCheck: function(func) {
				onCheckEvent.subscribe(func);
			},
			
			isCheckAll: function() {
				return this._checkedBoxCount == checkboxes.length;				
			},
			isCheckNone: function() {
				return this._checkedBoxCount == 0;
			},
			isCheckSome: function() {
				return this._checkedBoxCount != 0;
			},
			isCheckSingle: function() {
				return this._checkedBoxCount == 1;
			},
			isCheckMulti: function() {
				return this._checkedBoxCount > 1;
			},			
			toggleCheckAll: function() {
				var allChecked = checkboxes.every(getChecked);
				checkboxes.forEach(allChecked?setUnchecked:setChecked);
				if (checkboxes.length == 0) {
					checkAllBoxes.forEach(setUnchecked);
				} else {
					checkAllBoxes.forEach(allChecked?setUnchecked:setChecked);
				}
				handle._checkedBoxCount = (allChecked)?0:checkboxes.length;
				checkboxes.forEach(function(o){
					onCheckEvent.fire(o);
				});
			},
			toggleChecked: function(checkbox) {
				checkbox.checked = !checkbox.checked;
				doCheck();
				onCheckEvent.fire(checkbox);
			},
			getCheckedBoxes: function() {
				return checkboxes.filter(getChecked);
			}
		});

		Event.on(checkboxes, 'click', clickHandler);
		if (config.onCheck && Lang.isFunction(config.onCheck)) 
			onCheckEvent.subscribe(config.onCheck, handle, true);
		if (checkAllBoxes.length > 0) {
			Event.on(checkAllBoxes, 'click', handle.toggleCheckAll);
		}
		if (config.checkOnInit) {
			doCheck();
			var checkOnInit = function() {
				checkboxes.forEach(function(o){
					onCheckEvent.fire(o);
				});
			}
			setTimeout(checkOnInit, 10);
		}
		return handle;
	}	 
}/**
 * @author zexin.zhaozx
 */
TB.form.TagAssistor = new function() {
	
	var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = Y.Lang;
	/**
	 * 默认配置参数
	 */
	var defConfig = {
		separator: ' ', /*默认分隔符是空格*/
		selectedClass: 'Selected'
	}
	
	/**
	 * 判断选中的tag是否在array中存在，如果存在返回true，反之false。
	 * @param {Object} tagArr
	 * @param {Object} tagEl
	 */
	var tagExists = function(tagArr, tagEl) {
		return tagArr.indexOf(Lang.trim(tagEl.innerHTML)) != -1;
	}
	
	var value2TagArray = function(textField, separator) {
		/*将连续的空格替换为单个空格，并去除首尾的空格*/
		var val = textField.value.replace(/\s+/g, ' ').trim();
		if (val.length > 0)
			return val.split(separator);
		else
			return [];
	}
	
	/**
	 * 指派给输入元素和备选tag的容器
	 * @param {Object} textField 必须是一个<input>或者<textarea>
	 * @param {Object} tagsContainer 放置备选tag的element，可能是一个ul或dl
	 * @param {Object} config 配置参数
	 */
	this.attach = function(textField, tagsContainer, config) {
		textField = Dom.get(textField);
		tagsContainer = Dom.get(tagsContainer);
		config = Lang.merge(defConfig, config || {});
		
		
		var triggers = Array.copy(tagsContainer.getElementsByTagName('a'));		
		
		/**
		 * 点击备选tag的事件处理程序
		 * @param {Object} ev
		 */
		var clickHandler = function(ev) {
			var tagArray = value2TagArray(textField, config.separator);
			var target = Event.getTarget(ev);
			/* tag已选中 */
			if (tagExists(tagArray, target)) {
				tagArray.remove(Lang.trim(target.innerHTML));
			} else {
				tagArray.push(Lang.trim(target.innerHTML));
			}
			updateClass(tagArray);
			textField.value = tagArray.join(config.separator);
		}
		
		var updateClass = function(tagArray) {
			triggers.forEach(function(o, i) {
				if (tagExists(tagArray, o)) {
					Dom.addClass(o, config.selectedClass);
				} else {
					Dom.removeClass(o, config.selectedClass);
				}						
			})						
		}
		
		var handle = {};
		/**
		 * 初始化的一些工作
		 */
		handle.init = function() {
			var tagArray = value2TagArray(textField, config.separator);

			/* 给每个	备选tag的<a> 注册事件处理程序 */
			triggers.forEach(function(o, i){
				if (tagExists(tagArray, o)) {
					Dom.addClass(o, config.selectedClass);
				}
				Event.on(o, 'click', clickHandler);
			});
			
			/* 监测每次的键盘动作，如果发现匹配或者不匹配的tag文字，增加或取消着重效果 */
			Event.on(textField, 'keyup', function(ev){
				var tagArray = value2TagArray(textField, config.separator);
				updateClass(tagArray);				
			});
		}
		handle.init();
	}
}
/**
 * 评分组件
 * 需要star-rating.css
 */

TB.widget.SimpleRating = new function() {
	
	var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = Y.Lang;

	var defConfig = {
		rateUrl: '',  /* 评分数据发送给的URL */
		rateParams: '',  /* 其他参数，格式k1=v1&k2=v2 */
		scoreParamName: 'score', /* 评论参数名 */
		topScore: 5,  /* 最高分 */
		currentRatingClass: 'current-rating'
	};

	var rateHandler = function(ev, handle) {
		Event.stopEvent(ev);
		var aEl = Event.getTarget(ev);
		var score = parseInt(aEl.innerHTML);
		try {
			aEl.blur();	
		} catch (e) {}
		handle.rate(score);
	}
	
	var updateCurrentRating = function(currentRatingLi, avg, config) {
		if (currentRatingLi) 
			currentRatingLi.innerHTML = avg;
			Dom.setStyle(currentRatingLi, 'width', avg*100/config.topScore + '%');
	} 
		
	this.decorate = function(ratingContainer, config) {
		ratingContainer = Dom.get(ratingContainer);  /* 一个<ul> */
		config = Lang.merge(defConfig, config || {});
		var currentRatingLi = Dom.getElementsByClassName(config.currentRatingClass, 'li', ratingContainer)[0];
		
		var onRateEvent = new Y.CustomEvent('onRate', null, false, Y.CustomEvent.FLAT);
		if (config.onRate)
			onRateEvent.subscribe(config.onRate);
		var handle = {};
		
		handle.init = function(avg) {
			/* 检查看是否需要显示当前的分数 */
			updateCurrentRating(currentRatingLi, avg, config);
		}
		
		handle.update = function(ret) {
			if (ret && ret.Average && currentRatingLi) {
				updateCurrentRating(currentRatingLi, ret.Average, config);
			}
			/* 只能评分一次 */
			Event.purgeElement(ratingContainer, true, 'click');
			/* 移除其他的li */
			for (var lis = ratingContainer.getElementsByTagName('li'), i = lis.length-1; i > 0; i--) {
				ratingContainer.removeChild(lis[i]);		
			}
			onRateEvent.fire(ret);
		}
		
		handle.rate = function(score) {
			var indicator = TB.util.Indicator.attach(ratingContainer, {message:$M('pleaseWait')});
			indicator.show();		
			ratingContainer.style.display = 'none';
			var postData = config.scoreParamName + '=' + score;
			if (config.rateParams) 
				postData += '&' + config.rateParams;
			Y.Connect.asyncRequest('POST', config.rateUrl, {
				success: function(req) {
					indicator.hide();
					ratingContainer.style.display = '';					
					var ret = eval('(' + req.responseText + ')');
					if (ret.Error) {
						alert(ret.Error.Message);
						return;
					} else {
						handle.update(ret);	
					}
				},
				failure: function(req) {
					indicator.hide();
					ratingContainer.style.display = '';							
					TB.trace($M('ajaxError'));
				}
			}, postData);				
		}
		
		handle.onRate = function(callback) {
			if (Lang.isFunction(callback))
				onRateEvent.subscribe(callback);		
		}				
		
		var triggers = ratingContainer.getElementsByTagName('a');
		for (var i = 0; i < triggers.length; i++) {
			Event.on(triggers[i], 'click', rateHandler, handle);
		}
				
		return handle;
	}
}