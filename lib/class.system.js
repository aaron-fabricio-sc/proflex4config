/*  Prototype JavaScript framework, version 1.7.3
 *  (c) 2005-2010 Sam Stephenson
 *
 *  Prototype is freely distributable under the terms of an MIT-style license.
 *  For details, see the Prototype web site: http://www.prototypejs.org/
 *
 *  Hint: The original Prototype.js library of ver. 1.7.3 has been stripped down
 *  to remaining class system only.
 *  The remaining part got some code optimizations to avoid JS prototyping.
 *  This has been done to prevent from massive overrides of ES5/6 native standards and
 *  to improve the performance.
 *
 *  $MOD$ class.system.js 4.3.1-210127-21-34ae33df-1a04bc7d
 *
 *--------------------------------------------------------------------------*/

/* Based on Alex Arnell's inheritance implementation. */
if(!window.Class) {
    const Class = (function() {
        const _FN_ = "function";
        const _SUPER_FN_ = "$super";
        
        function update(array, args) {
            let arrayLength = array.length,
                length = args.length;
            while(length--) {
                array[arrayLength + length] = args[length];
            }
            return array;
        }
        
        function argumentNames(f) {
            // NOTE: Since kojs 3.5.0 anyObservale.toString() now returns '[object Object]' instead of the function body itself as in the past!
            // This means that f.toString().match(/^[\s\(]*function[^(]*\(([^)]*)\)/) results to null in such a case -f is an ko.observable or subscrivable -
            // so we modify the code in order to prevent from NPE and assign an empty array instead to go on without any problems.
            let names = f.toString().match(/[\s\(]*[^(]*\(([^)]*)\)/);
            if(names !== null && names !== void 0) {
                names = names[1]
                    .replace(/\/\/.*?[\r\n]|\/\*(?:.|[\r\n])*?\*\//g, "")
                    .replace(/\s+/g, "")
                    .split(",");
            } else {
                names = [];
            }
            return names.length === 1 && !names[0] ? [] : names;
        }
        
        function wrap(f, wrapper) {
            let __method = f;
            return function() {
                let a = update([__method.bind(this)], arguments);
                return wrapper.apply(this, a);
            };
        }
        
        function emptyFunction() {
        }
        
        function subclass() {
        }
        
        function create() {
            let parent = null,
                properties = [...arguments];
            if(typeof properties[0] === _FN_) {
                parent = properties.shift();
            }
            
            function klass() {
                this.initialize.apply(this, arguments);
            }
            
            Object.assign(klass, Class.Methods);
            klass.superclass = parent;
            klass.subclasses = [];
            
            if(parent) {
                if(parent.toString().startsWith("class ")) {
                    klass.prototype = new parent();
                } else {
                    subclass.prototype = parent.prototype;
                    klass.prototype = new subclass();
                    parent.subclasses && parent.subclasses.push(klass);
                }
            }
            
            for(let i = 0, length = properties.length; i < length; i++) {
                klass.addMethods(properties[i]);
            }
            
            if(!klass.prototype.initialize) {
                klass.prototype.initialize = emptyFunction;
            }
            
            klass.prototype.constructor = klass;
            return klass;
        }
        
        function addMethods(source) {
            let ancestor = this.superclass && this.superclass.prototype,
                properties = Object.keys(source);
            
            for(let i = 0, length = properties.length; i < length; i++) {
                let property = properties[i],
                    value = source[property];
                if(ancestor && typeof value === _FN_ && argumentNames(value)[0] === _SUPER_FN_) {
                    let method = value;
                    value = (function(m) {
                        return function() {
                            if(m === "initialize" && !ancestor[m] && ancestor.constructor.toString().startsWith("class ")) {
                                // native class
                                return new ancestor.constructor(...arguments);
                                // const res = ancestor.constructor.constructor.call(this, ...arguments);
                                // return res;
                            }
                            return ancestor[m].apply(this, arguments);
                        };
                    })(property);
                    value = wrap(value, method);
                    
                    value.valueOf = (function(method) {
                        return function() {
                            return method.valueOf.call(method);
                        };
                    })(method);
                    
                    value.toString = (function(method) {
                        return function() {
                            return method.toString.call(method);
                        };
                    })(method);
                }
                this.prototype[property] = value;
            }
            
            return this;
        }
        
        return {
            create: create,
            Methods: {
                addMethods: addMethods
            }
        };
    })();
    
    window.Class = Class;
}
