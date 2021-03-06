'use strict';

/**
 * A collection of core utility functions.
 * @const
 */

let compatibilityModeData_;

/**
 * Counter for unique id.
 * @type {Number}
 * @private
 */
let uniqueIdCounter_ = 1;

/**
 * Unique id property prefix.
 * @type {String}
 * @protected
 */
export const UID_PROPERTY = `core_${(Math.random() * 1e9) >>> 0}`;

/**
 * When defining a class Foo with an abstract method bar(), you can do:
 * Foo.prototype.bar = abstractMethod
 *
 * Now if a subclass of Foo fails to override bar(), an error will be thrown
 * when bar() is invoked.
 *
 * @type {!Function}
 * @throws {Error} when invoked to indicate the method should be overridden.
 */
export function abstractMethod() {
	throw Error('Unimplemented abstract method');
}

/**
 * Disables Metal.js's compatibility mode.
 */
export function disableCompatibilityMode() {
	compatibilityModeData_ = undefined;
}

/**
 * Enables Metal.js's compatibility mode with the following features from rc
 * and 1.x versions:
 *     - Using "key" to reference component instances. In the current version
 *       this should be done via "ref" instead. This allows old code still
 *       using "key" to keep working like before. NOTE: this may cause
 *       problems, since "key" is meant to be used differently. Only use this
 *       if it's not possible to upgrade the code to use "ref" instead.
 * @param {Object=} data Optional object with data to specify more
 *     details, such as:
 *         - renderers {Array} the template renderers that should be in
 *           compatibility mode, either their constructors or strings
 *           representing them (e.g. 'soy' or 'jsx'). By default, all the ones
 *           that extend from IncrementalDomRenderer.
 * @type {Object}
 */
export function enableCompatibilityMode(data = {}) {
	compatibilityModeData_ = data;
}

/**
 * Returns the data used for compatibility mode, or nothing if it hasn't been
 * enabled.
 * @return {Object}
 */
export function getCompatibilityModeData() {
	// Compatibility mode can be set via the __METAL_COMPATIBILITY__ global var.
	if (compatibilityModeData_ === undefined) {
		if (typeof window !== 'undefined' && window.__METAL_COMPATIBILITY__) {
			enableCompatibilityMode(window.__METAL_COMPATIBILITY__);
		}
	}
	return compatibilityModeData_;
}

/**
 * Returns the first argument if it's truthy, or the second otherwise.
 * @param {*} a
 * @param {*} b
 * @return {*}
 * @protected
 */
function getFirstTruthy_(a, b) {
	return a || b;
}

/**
 * Gets the name of the given function. If the current browser doesn't
 * support the `name` property, like IE11, this will calculate it from the function's
 * content string.
 * @param {!function()} fn
 * @return {string}
 */
export function getFunctionName(fn) {
	if (!fn.name) {
		const str = fn.toString();
		fn.name = str.substring(9, str.indexOf('('));
	}
	return fn.name;
}

/**
 * Gets the value of a static property in the given class. The value will be
 * inherited from ancestors as expected, unless a custom merge function is given,
 * which can change how the super classes' value for that property will be merged
 * together.
 * The final merged value will be stored in another property, so that it won't
 * be recalculated even if this function is called multiple times.
 * @param {!function()} ctor Class constructor.
 * @param {string} propertyName Property name to be merged.
 * @param {function(*, *):*=} mergeFn Function that receives the merged
 *     value of the property so far and the next value to be merged to it.
 *     Should return these two merged together. If not passed the final property
 *     will be the first truthy value among ancestors.
 * @return {Object}
 */
export function getStaticProperty(
	ctor,
	propertyName,
	mergeFn = getFirstTruthy_
) {
	const mergedName = propertyName + '_MERGED';
	if (!ctor.hasOwnProperty(mergedName)) {
		// eslint-disable-next-line
		let merged = ctor.hasOwnProperty(propertyName)
			? ctor[propertyName]
			: null;
		if (ctor.__proto__ && !ctor.__proto__.isPrototypeOf(Function)) {
			merged = mergeFn(
				merged,
				getStaticProperty(ctor.__proto__, propertyName, mergeFn)
			);
		}
		ctor[mergedName] = merged;
	}
	return ctor[mergedName];
}

/**
 * Gets an unique id. If `object` argument is passed, the object is
 * mutated with an unique id. Consecutive calls with the same object
 * reference won't mutate the object again, instead the current object uid
 * returns. See {@link UID_PROPERTY}.
 * @param {Object=} object Optional object to be mutated with the uid. If
 *     not specified this method only returns the uid.
 * @param {boolean=} noInheritance Optional flag indicating if this
 *     object's uid property can be inherited from parents or not.
 * @throws {Error} when invoked to indicate the method should be overridden.
 * @return {number}
 */
export function getUid(object, noInheritance) {
	if (object) {
		let id = object[UID_PROPERTY];
		if (noInheritance && !object.hasOwnProperty(UID_PROPERTY)) {
			id = null;
		}
		return id || (object[UID_PROPERTY] = uniqueIdCounter_++);
	}
	return uniqueIdCounter_++;
}

/**
 * The identity function. Returns its first argument.
 * @param {*=} returnValue The single value that will be returned.
 * @return {?} The first argument.
 */
export function identityFunction(returnValue) {
	return returnValue;
}

/**
 * Returns true if the specified value is a boolean.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is boolean.
 */
export function isBoolean(val) {
	return typeof val === 'boolean';
}

/**
 * Returns true if the specified value is not undefined.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is defined.
 */
export function isDef(val) {
	return val !== undefined;
}

/**
 * Returns true if value is not undefined or null.
 * @param {*} val
 * @return {boolean}
 */
export function isDefAndNotNull(val) {
	return isDef(val) && !isNull(val);
}

/**
 * Returns true if value is a document.
 * @param {*} val
 * @return {boolean}
 */
export function isDocument(val) {
	return val && typeof val === 'object' && val.nodeType === 9;
}

/**
 * Returns true if value is a document-fragment.
 * @param {*} val
 * @return {boolean}
 */
export function isDocumentFragment(val) {
	return val && typeof val === 'object' && val.nodeType === 11;
}

/**
 * Returns true if value is a dom element.
 * @param {*} val
 * @return {boolean}
 */
export function isElement(val) {
	return val && typeof val === 'object' && val.nodeType === 1;
}

/**
 * Returns true if the specified value is a function.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is a function.
 */
export function isFunction(val) {
	return typeof val === 'function';
}

/**
 * Returns true if value is null.
 * @param {*} val
 * @return {boolean}
 */
export function isNull(val) {
	return val === null;
}

/**
 * Returns true if the specified value is a number.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is a number.
 */
export function isNumber(val) {
	return typeof val === 'number';
}

/**
 * Returns true if value is a window.
 * @param {*} val
 * @return {boolean}
 */
export function isWindow(val) {
	return val !== null && val === val.window;
}

/**
 * Returns true if the specified value is an object. This includes arrays
 * and functions.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is an object.
 */
export function isObject(val) {
	const type = typeof val;
	return (type === 'object' && val !== null) || type === 'function';
}

/**
 * Returns true if value is a Promise.
 * @param {*} val
 * @return {boolean}
 */
export function isPromise(val) {
	return val && typeof val === 'object' && typeof val.then === 'function';
}

/**
 * Returns true if value is a string.
 * @param {*} val
 * @return {boolean}
 */
export function isString(val) {
	return typeof val === 'string' || val instanceof String;
}

/**
 * Sets to true if running inside Node.js environment with extra check for
 * `process.browser` to skip Karma runner environment. Karma environment has
 * `process` defined even though it runs on the browser.
 * @param {?Object} options Contains `checkEnv` property which if true, checks
 * the NODE_ENV variable. If NODE_ENV equals 'test', the function returns false.
 * @return {boolean}
 */
export function isServerSide(options = {checkEnv: true}) {
	let serverSide = typeof process !== 'undefined' && !process.browser;
	if (serverSide && options.checkEnv) {
		serverSide =
			typeof process.env !== 'undefined' &&
			process.env.NODE_ENV !== 'test';
	}
	return serverSide;
}

/**
 * Null function used for default values of callbacks, etc.
 * @return {void} Nothing.
 */
export function nullFunction() {}
