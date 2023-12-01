const natives =  nativeStringMethods();
const interpolate = interpolateFactory();
const userExtensions = {};

Object.defineProperty(StringBuilder, `describe`, { get() { return descriptionsGetter(); } });
Object.defineProperty(StringBuilder, `describeAll`, { get() { return descriptionsGetter(true); } });
Object.defineProperty(StringBuilder, `addExtension`, {value: (name, fn) => userExtensions[name] = fn});

export default StringBuilder;

function StringBuilder(str, ...args) {
  const instanceValue = byContract(str, ...args);
  const values = {initial: instanceValue, instanceValue,};
  return Object.freeze(instantiate(values));
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

function instantiate(values) {
  const instance = {
    get length() { return instance.value.length; },
    get initial() { return values.initialValue; },
    get value() { return values.instanceValue; },
    set value(v) { instance.is(v); },
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
    quot4Print(quotes = `","`) { return quot(instance.value, quotes); },
    is(newValue, ...args) { values.instanceValue = byContract(newValue, ...args) ?? instance.value; return instance; },
    quot(quotes = `"`) { return instance.is(quot(instance.value, quotes)); },
    surroundWith({l = ``, r = ``} = {}) { return instance.is(quot(instance.value, l.concat(`,${r}`))); },
    indexOf(...args) { return indexOf(instance.value, ...args); },
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
  
  Object.entries(Object.getOwnPropertyDescriptors(userExtensions))
    .forEach( ([key, meth]) => {
        const getOrValue = meth.value.length === 1 ? `get` : `value`;
        Object.defineProperty( instance, key, { [getOrValue]: (...args) => {
            const nwValue = meth.value(instance, ...args);
            return instance.is(nwValue?.value ?? nwValue);
          }
        } );
      }
    );
  
  return reRouteNatives(instance, values);
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
    .split(/[- ]/)
    .map( (str, i) => i && `${ucFirst(str)}` || str )
    .join(``);
}

function toDashedNotation(str2Convert) {
  return str2Convert.replace(/[A-Z]/g, a => `-${a.toLowerCase()}`).replace(/^-|-$/, ``);
}

function wordsFirstUp(str) {
  return str.replace(/\b[^\s|_]/gi, a => ucFirst(a));
}

function nativeStringMethods() {
  const excluded = getExclusion();
  const excludeFromChainRE = /^(at|charAt|codePointAt)$/i;
  const checkReturnValue = (key, v) => v.value instanceof Function && typeof `abc`[key]() || `n/a`;
  const chainable = Object
    .entries(Object.getOwnPropertyDescriptors(String.prototype))
    .filter( ([key, v]) =>
      !excluded[key] && !excludeFromChainRE.test(key) && checkReturnValue(key, v) === `string` )
    .map( ([key,]) => key );
  const valueReturn = Object
    .entries(Object.getOwnPropertyDescriptors(String.prototype))
    .filter( ([key, v]) =>
      !excluded[key] && (excludeFromChainRE.test(key) || checkReturnValue(key, v) !== `string`) )
    .map( ([key,]) => key );
  
  return { chainable, valueReturn }
}

function quot(str, chr = `","`) {
  const [c1, c2] = chr.split(`,`);
  return `${c1}${str}${c2 ?? c1}`;
}

function truncate( str, {at, html = false, wordBoundary = false} = {} ) {
  if (str.length <= at) { return str; }
  let subString = str.slice(0, at);
  const endsWith = html ? "&hellip;" : `...`;
  const lastWordBoundary = [...subString.matchAll(/\b([\s'".,?!;:)\]])/g)]?.pop()?.index;
  subString = wordBoundary ? subString.slice(0, lastWordBoundary) : subString;
  return subString + endsWith;
}

function remove(str, start, end) {
  const toRemove = str.slice(start || 0, end || str.length);
  return str.replace(toRemove, ``);
}

function isStringOrTemplate(str) {
  str = str?.constructor === Number ? String(str) : str;
  return str?.constructor === String || str?.raw;
}

function byContract(str, ...args) {
  const isMet = isStringOrTemplate(str);
  if (!isMet) { console.info(`✘ String contract not met: input [${String(str)?.slice(0, 15)
  }] not a (template) string or number`) }
  return !isMet ? `` : str.raw ? String.raw({ raw: str }, ...args) : str ?? ``;
}

// (last)indexOf should deliver undefined if nothing was found.
// SEE https://youtu.be/99Zacm7SsWQ?t=2101
function indexOf(str, findMe, fromIndex) {
  const index = str.indexOf(findMe, fromIndex);
  return index < 0 ? undefined : index;
}

function lastIndexOf(str, findMe, beforeIndex) {
  const index = str.lastIndexOf(findMe, beforeIndex);
  return index < 0 ? undefined : index;
}

function ucFirst([first, ...theRest]) {
  return `${first.toUpperCase()}${theRest.join(``)}`;
}

function descriptionsGetter(full = false) {
  const instanceProps = Object.entries(Object.getOwnPropertyDescriptors(StringBuilder``));
  const allProps = instanceProps
    .map( ([key, descr]) => {
      const allNatives = natives.chainable.concat(natives.valueReturn).filter(key => !/indexof/i.test(key));
      if (!full && allNatives.find(nkey => key === nkey)) { return ``; }
      const props = [];
      const isMethod = !descr.get && !descr.set && descr.value instanceof Function;
      const fnString = String(descr.get ?? descr.value).replace(/\s{2}/g, ` `);
      const argsClause = isMethod ? descr.value.toString().match(/(\(.+?\))/)?.shift() ?? `()` : ``;
      if (descr.get) { props.push(`getter`); }
      if (descr.set) { props.push(`setter (mutates)`); }
      if (/return instance\.is|\=>.+instance\.is/.test(fnString) || /empty|reset|is/.test(key)) { props.push(`mutates`); }
      if (/return instance[^\.value]/.test(fnString) || key === `clone`)  { props.push(`chainable`); }
      if (!props.length || /initial|length|indexof/i.test(key)) { props.push(`returns a value (not mutating)`); }
      if (/^(indexof|lastindexof)$/i.test(key)) { props.push(`(native) override`)}
      return /name|prototype/i.test(key) ? `` : `${key}${argsClause} [${props.join(`, `)}]`;
    })
    .filter(v => v.length);
  return allProps.sort( (a, b) => a.localeCompare(b));
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