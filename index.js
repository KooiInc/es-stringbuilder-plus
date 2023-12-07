const natives =  getNativeStringMethodKeys();
const interpolate = interpolateFactory();
const userExtensions = {};
let forTest = false;

Object.defineProperties(StringBuilder, {
  describe: { get() { return descriptionsGetter(); } },
  //describeObj: { get() { return descriptionsObjGetter(); } },
  hasUserExtensions: { get() { return Object.keys(userExtensions).length > 0; } },
  addExtension: { value: addUserExtension },
  removeUsrExtension: { value: removeUserExtension },
  removeAllUsrExtensions: { get() { return (removeAllUserExtensions(), true); } }
});

export { StringBuilder as default };

function StringBuilder(str, ...args) {
  const instanceValue = byContract(str, ...args);
  const values = {initialValue: instanceValue, forTest: false, instanceValue,};
  return Object.freeze(instantiate(values));
}

function instantiate(values) {
  const instance = {
    get length() { return instance.value.length; },
    get initial() { return values.initialValue; },
    get value() { return String(values.instanceValue); },
    set value(v) { instance.is(v); },
    set test(v) { forTest = v; },
    get reset() { return instance.is(values.initialValue); },
    get clear() { return instance.is(``); },
    get empty() { return instance.is(``); },
    get clone() { return StringBuilder`${instance.value}`; },
    get toUpper() { return instance.is(instance.value.toUpperCase()); },
    get toLower() { return instance.is(instance.value.toLowerCase()); },
    get firstUp() { return instance.is(ucFirst(instance.value)); },
    get wordsUp() { return instance.is(wordsFirstUp(instance.value)); },
    get toDashed() { return instance.is(toDashedNotation(instance.value)); },
    get toCamel() { return instance.is(toCamelcase(instance.value)); },
    cloneWith(newValue, ...args) { return instance.clone.is(newValue, ...args); },
    quot4Print(quotes = `","`) { return quot(instance.value, quotes); },
    is(newValue, ...args) { values.instanceValue = byContract(newValue, ...args) ?? instance.value; return instance; },
    as(newValue, ...args) { return instance.is(newValue, ...args); },
    quot(quotes = `"`) { return instance.is(quot(instance.value, quotes)); },
    surroundWith({l = ``, r = ``} = {}) { return instance.is(quot(instance.value, l.concat(`,${r}`))); },
    indexOf(...args) { return  indexOf(instance.value, ...args); },
    lastIndexOf(...args) { return lastIndexOf(instance.value, ...args); },
    toString() { return instance.value; },
    valueOf() { return instance.value; },
    prepend(str2Prepend, ...args) {
      return instance.is( (str2Prepend.value ?? byContract(str2Prepend, args)).concat(instance.value) ); },
    append(str2Append, ...args) {
      return instance.is(instance.value.concat(str2Append.value ?? byContract(str2Append, ...args)) ); },
    truncate(at, { html = false, wordBoundary = false } = {} ) {
      return instance.is(truncate(instance.value, {at, html, wordBoundary})); },
    remove(start, end) { return instance.is(remove(instance.value, start, end)); },
    interpolate(...replacementTokens) { return instance.is(interpolate(instance.value, ...replacementTokens)); },
  };
  reRouteUserDefined(instance, values);
  
  return reRouteNatives(instance, values);
}

function reRouteUserDefined(instance) {
  Object.entries(Object.getOwnPropertyDescriptors(userExtensions))
    .forEach( ([key, meth]) => {
        const getOrValue = meth.value.length === 1 ? `get` : `value`;
        Object.defineProperty( instance, key, { [getOrValue]: (...args) => {
            const nwValue = meth.value(instance, ...args);
            
            return meth.value.clone
              ? instance.cloneWith(nwValue?.value ?? nwValue)
              : instance.is(nwValue?.value ?? nwValue);
          }
        } );
      }
    );
}

function reRouteNatives(instance, values) {
  natives.chainable.forEach( key =>
    instance[key] = Object.getOwnPropertyDescriptor(String.prototype, key)?.value.length
      ? function(...args) { return instance.is(values.instanceValue[key]?.(...args)); }
      : function() { return instance.is(values.instanceValue[key]?.()); } );
  natives.valueReturn.forEach( key => {
    const isFn = Object.getOwnPropertyDescriptor(String.prototype, key)?.value;
    if (!isFn) { return; }
    instance[key] = isFn.length
      ? function(...args) { return values.instanceValue[key]?.(...args); }
      : function() { return values.instanceValue[key]?.(); }
  });
  
  return instance;
}

function addUserExtension(name, fn, asClone = false) {
  fn.clone = asClone;
  userExtensions[name] = fn;
}

function removeUserExtension(name) {
  if (name in userExtensions) {
    delete userExtensions[name];
  }
}

function removeAllUserExtensions(name) {
  Object.keys(userExtensions).forEach(key => removeUserExtension(key));
}

function getExclusion() {
  // notes:
  // - trimLeft/-Right are redundant (use trimStart/-End),
  // - indexOf and lastIndexOf are overridden.
  return `anchor,big,blink,bold,fixed,fontcolor,fontsize,italics,link,small,
          strike,sub,substr,sup,trimLeft,trimRight,indexOf,lastIndexOf`
    .split(`,`)
    .reduce( (acc, key) => ({...acc, [key.trim()]: true}), {});
}

function toCamelcase(str2Convert) {
  return str2Convert.toLowerCase()
    .trim()
    .split(`-`)
    .map( (v, i) => i && `${v[0].toUpperCase()}${v.slice(1)}` || v)
    .join(``);
}

function toDashedNotation(str2Convert) {
  return str2Convert
    .replace(/[A-Z]./g, a => `-${a.toLowerCase()}`)
    .replace(/^-|-$/, ``);
}

function ucFirst(value) {
  const startSpaces = value.match(/^\s+/);
  value = value.trimStart();
  return (startSpaces?.[0] ?? ``) + value[0].toUpperCase() + value.slice(1).toLowerCase();
}

function wordsFirstUp(str) {
  str = str.toLowerCase().split(``);
  let parsed = ``;
  let prev;
  
  while (str.length) {
    const chr = str.shift();
    parsed += /\p{L}/u.test(chr) && (!prev || !/\p{L}|_/u.test(prev))
      ? chr.toUpperCase() : chr;
    prev = chr;
  }
  
  return parsed;
}

function getNativeStringMethodKeys() {
  const excluded = getExclusion();
  const excludeFromChainRE = /^(at|charAt|codePointAt)$/i;
  const allNativeStringDescriptors = Object.entries(Object.getOwnPropertyDescriptors(String.prototype));
  const checkReturnValue = (key, v) => v.value instanceof Function && typeof `abc`[key]() || `n/a`;
  const chainable = allNativeStringDescriptors.filter( ([key, v]) =>
      !excluded[key] && !excludeFromChainRE.test(key) && checkReturnValue(key, v) === `string` )
    .map( ([key,]) => key );
  const valueReturn = allNativeStringDescriptors.filter( ([key, v]) =>
      !excluded[key] && (excludeFromChainRE.test(key) || checkReturnValue(key, v) !== `string`) )
    .map( ([key,]) => key );
  
  return { chainable, valueReturn }
}

function quot(str, chr = `","`) {
  const [c1, c2] = chr.split(`,`);
  return `${c1}${str}${c2 ?? c1}`;
}

function truncate( str, {at, html = false, wordBoundary = false} = {} ) {
  if (!at || !(+at) || str.length <= at) { return str; }
  let subString = str.slice(0, at);
  const endsWith = html ? "&hellip;" : `...`;
  const lastWordBoundary = [...subString.matchAll(/\b([\s'".,?!;:)\]])/g)]?.pop()?.index;
  subString = wordBoundary ? subString.slice(0, lastWordBoundary) : subString;
  return subString + endsWith;
}

function remove(str, start, end) {
  return str.replace(str.slice(start || 0, end || str.length), ``);
}

function isStringOrTemplate(str) {
  str = str?.constructor === Number ? String(str) : str;
  return str?.constructor === String || str?.raw;
}

function byContract(str, ...args) {
  const isMet = isStringOrTemplate(str);
  if (!isMet && !forTest) { console.info(`✘ String contract not met: input [${
    String(str)?.slice(0, 15)}] not a (template) string or number`); }
  return String(!isMet ? `` : str.raw ? String.raw({ raw: str }, ...args) : str ?? ``);
}

// (last)indexOf should deliver undefined if nothing was found.
// SEE https://youtu.be/99Zacm7SsWQ?t=2101
function indexOf(str, findMe, fromIndex) {
  if (findMe?.constructor === RegExp) {
    return indexOfRE(str, findMe, fromIndex);
  }
  const index = str.indexOf(findMe, +fromIndex);
  return index < 0 ? undefined : index;
}

function lastIndexOf(str, findMe, beforeIndex) {
  if (findMe?.constructor === RegExp) {
    return lastIndexOfRE(str, findMe, beforeIndex);
  }
  const index = `${str}`.lastIndexOf(findMe, +beforeIndex);
  return index < 0 ? undefined : index;
}

function lastIndexOfRE(str, findMe, position) {
  if (findMe?.constructor === RegExp) {
    if (!findMe.global) {
      findMe = RegExp(findMe, findMe.flags.concat(`g`));
    }
    const matches = str.matchAll(findMe);
    return typeof position === `number` ?
      [...matches]?.filter(m => m.index <= position)?.pop()?.index :
      [...matches]?.pop()?.index;
  }
  
  return undefined;
}

function indexOfRE(str, findRegExp, beforeIndex) {
  if (findRegExp?.constructor === RegExp) {
    if (!findRegExp.global) {
      findRegExp = RegExp(findRegExp, findRegExp.flags.concat(`g`));
    }
    const matches = str.matchAll(findRegExp);
    return typeof beforeIndex === `number` ?
      [...matches]?.filter(m => m.index >= beforeIndex)?.[0]?.index :
      [...matches]?.[0]?.index;
  }
  
  return undefined;
}

function descriptionsGetter() {
  const instanceProps = Object.entries(Object.getOwnPropertyDescriptors(StringBuilder``))
    .filter( ([key, ]) => !/valueOf|toString/.test(key));
  const userXtensions = Object.keys(userExtensions);
  const allNatives = natives.chainable.concat(natives.valueReturn).filter( v => !/indexof/i.test(v) );
  const allProps = {};
  instanceProps
    .forEach( ([key, descr]) => {
      if (/name|prototype|test/i.test(key) || allNatives.find(nkey => key === nkey)) { return; }
      allProps[key] = {};
      const props = allProps[key];
      const isValueReturn = /^(tostring|valueof|initial|length|indexof|lastindexof|clone|quot4Print)$/i.test(key);
      const isMethod = !descr.get && !descr.set && descr.value instanceof Function;
      const argsClause = isMethod ? descr.value.toString().match(/(\(.+?\))/)?.shift() ?? `()` : ``;
      const methodStringified = String(descr.get ?? descr.value).replace(/\s{2}/g, ` `).trim();
      const isUserExtension = userXtensions.find(ky => ky === key);
      const isChainable = isUserExtension || /return instance|^(empty|reset|is)/i.test(methodStringified);
      props.callSign = `${key}${argsClause}`;
      props.getter = `get` in descr;
      props.method = `value` in descr;
      props.setter = `set` in descr;
      props.override = /indexof/i.test(key);
      props.valueReturn = isValueReturn;
      props.isUserExtension = isUserExtension;
      props.isChainable = isChainable;
      props.mutates = isChainable;
    });
    Object.defineProperty(allProps, `stringify`, {get() { return stringify(); } });
    return allProps;
    
    function stringify() {
      const result = [];
      const checkFirst = (str) => /\[[a-z]/i.test(str) ? `, ` : ``;
      const propsFiltered = Object.entries(allProps)
        .filter( ([key,]) => key !== `stringify` );
      propsFiltered.forEach( ([, prop]) => {
        let propStr = StringBuilder`${prop.callSign} [`;
        if (prop.getter) { propStr.append(`${checkFirst(propStr)}getter`); }
        if (prop.setter) { propStr.append(`${checkFirst(propStr)}setter`); }
        if (prop.method) { propStr.append(`${checkFirst(propStr)}method`); }
        if (prop.override) { propStr.append(`${checkFirst(propStr)}native override`); }
        if (prop.isUserExtension) { propStr.append(`${checkFirst(propStr)}user extension`); }
        if (prop.valueReturn) { propStr.append(`${checkFirst(propStr)}value return (not mutating)`); }
        if (prop.isChainable) { propStr.append(`${checkFirst(propStr)}chainable (mutates)`); }
        if (prop.mutates && !prop.isChainable) { propStr.append(`${checkFirst(propStr)}mutates`); }
        result.push(propStr.append`]`.value);
      });
      
      return result.sort( (a, b) => a.localeCompare(b) );
    }
}

function interpolateFactory() {
  const {isStringOrNumber, isObject, invalidate, replacement, replacer, replace} = {
    isStringOrNumber: v => [String, Number].find(vv => vv === Object.getPrototypeOf( v ?? {} )?.constructor),
    isObject: v => Object.getPrototypeOf( v ?? `` )?.constructor === Object,
    invalidate: (defaultReplacer, key) => defaultReplacer ?? `{${key}}`,
    replacement: (key, t, defaultReplacer) =>
      !isStringOrNumber(t[key]) || (!defaultReplacer && `${t[key]}`.trim() === ``)
        ? invalidate(defaultReplacer, key) : t[key] ?? invalidate(defaultReplacer, key),
    replacer: (token, defaultReplacer) => (...args) =>
      replacement( args.find(a => a.key).key ?? `_`, token, defaultReplacer ),
    replace: (str, token, defaultReplacer) =>
      str.replace( /\{(?<key>[a-z_\d]+)}/gim, replacer(token, defaultReplacer) ),
  };
  const interpolate = (str, defaultReplacer, ...tokens) => tokens.flat()
    .reduce( (acc, token) =>
      acc.concat(!isObject(token) ? `` : replace(str, token, defaultReplacer )), ``);
  
  return (str, ...tokens) => {
    const defaultReplacer = isStringOrNumber(tokens[0]) ? String(tokens.shift()) : undefined;
    return interpolate(str, defaultReplacer, ...tokens)
  }
}