const natives =  nativeStringMethods();
const interpolate = interpolateFactory();

Object.defineProperty(StringBuilder, `describe`, { get() { return descriptionsGetter(); } });

export default function StringBuilder(str, ...args) {
  return Object.freeze(createInstance(byContract(str, ...args)));
};

function createInstance(instanceValue) {
  const instanceFunction = function() {};
  const initialValue = instanceValue;
  const customMethods = {
    get length() { return instanceValue.length; },
    get initial() { return initialValue; },
    get value() { return instanceValue; },
    set value(v) { instanceValue = v; },
    get reset() { instanceValue = initialValue; return instanceFunction; },
    get clear() { instanceValue = ``; return instanceFunction; },
    get empty() { instanceValue = ``; return instanceFunction; },
    get clone() { return StringBuilder`${instanceValue}`; },
    get toUpper() { instanceValue = instanceValue.toUpperCase(); return instanceFunction; },
    get toLower() { instanceValue = instanceValue.toLowerCase(); return instanceFunction; },
    get firstUp() { instanceValue = ucFirst(instanceValue); return instanceFunction; },
    get wordsUp() { instanceValue = wordsFirstUp(instanceValue); return instanceFunction; },
    get toDashed() { instanceValue = toDashedNotation(instanceValue); return instanceFunction; },
    get toCamel() { instanceValue = toCamelcase(instanceValue); return instanceFunction; },
    quot4Print(quotes = `","`) { return quot(instanceValue, quotes); },
    is(newValue, ...args) { instanceValue = byContract(newValue, ...args); return instanceFunction; },
    quot(quotes = `"`) { instanceValue = quot(instanceValue, quotes); return instanceFunction; },
    indexOf(...args) { return indexOf(instanceValue, ...args); },
    lastIndexOf(...args) { return lastIndexOf(instanceValue, ...args); },
    toString() { return instanceValue; },
    valueOf() { return instanceValue; },
    at(pos) { return instanceValue.at(pos); },
    charAt(pos) { return instanceValue.charAt(pos); },
    prepend(str2Prepend, ...args) { instanceValue = byContract(str2Prepend, args) + instanceValue; return instanceFunction; },
    append(str2Append, ...args) { instanceValue += byContract(str2Append, ...args); return instanceFunction; },
    truncate(at, { html = false, wordBoundary = false } = {} ) {
      instanceValue = truncate(instanceValue, {at, html, wordBoundary});
      return instanceFunction; },
    extract(start, end) { instanceValue = extract(instanceValue, start, end); return instanceFunction; },
    remove(start, end) { instanceValue = remove(instanceValue, start, end); return instanceFunction; },
    interpolate(...replacementTokens) { instanceValue = interpolate(instanceValue, ...replacementTokens); return instanceFunction; },
  };
  natives.forEach( key =>
    instanceFunction[key] = Object.getOwnPropertyDescriptor(String.prototype, key)?.value.length
      ? function(...args) {
          instanceValue = instanceValue[key]?.(...args);
          return instanceFunction; }
      : function() {
          instanceValue = instanceValue[key]?.();
          return instanceFunction; } );
  Object.entries(Object.getOwnPropertyDescriptors(customMethods))
   .forEach(([key, value]) => Object.defineProperty(instanceFunction, key, value) );

  return instanceFunction;
}

function getDeprecated() {
  // note: trimLeft/-Right are redundant
  return `anchor,big,blink,bold,fixed,fontcolor,fontsize,italics,link,small,strike,sub,substr,sup,trimLeft,trimRight`
    .split(`,`)
    .reduce( (acc, key) => ({...acc, [key]: true}), {});
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
  const deprecated = getDeprecated();
  const checkReturnValue = (key, v) => v.value instanceof Function && typeof `abc`[key]() || `n/a`;
  const allMethodsReturningAString = Object
    .entries(Object.getOwnPropertyDescriptors(String.prototype))
    .filter( ([key, v]) => !deprecated[key] && checkReturnValue(key, v) === `string` )
    .map( ([key,]) => key );

  return allMethodsReturningAString;
}

function quot(str, chr = `","`) {
  const [c1, c2] = chr.split(`,`);
  return `${c1}${str}${c2 ?? c1}`;
}

function truncate( str, {at, html = false, wordBoundary = false} = {} ) {
  if (str.length <= at) { return str; }
  const subString = str.slice(at);
  const endwith = html ? "&hellip;" : `...`;
  const lastWordBoundary = [...subString.matchAll(/\b([\s'".,?!;:)\]])/g)]?.pop().index;
  
  return (wordBoundary
    ? subString.slice(0, lastWordBoundary)
    : subString) + endwith;
}

function extract(str, start, end) {
  return str.slice(start || 0, end || str.length);
}

function remove(str, start, end) {
  const toRemove = str.slice(start || 0, end || str.length);
  return str.replace(toRemove, ``);
}

function isStringOrTemplate(str) {
  str = str?.constructor === Number ? String(str) : str;
  return str?.isProxied || str?.constructor === String || str?.raw;
}

function byContract(str, ...args) {
  const isMet = isStringOrTemplate(str);
  if (!isMet) { console.info(`✘ String contract not met: input [${String(str)?.slice(0, 15)
    }] not a (template) string or number`) };
  return !isMet ? `` : str.raw ? String.raw({ raw: str }, ...args) : str ?? ``;
}

// (last)indexOf should deliver undefined if nothing was found.
// SEE https://youtu.be/99Zacm7SsWQ?t=2101
function indexOf(str, findMe, fromIndex) {
  const index = str.indexOf(findMe, fromIndex);
  return index < 0 ? undefined : index;
};

function lastIndexOf(str, findMe, beforeIndex) {
  const index = str.lastIndexOf(findMe, beforeIndex);
  return index < 0 ? undefined : index;
};

function nthIndexOf(str, nth, findMe) {
  const allMatches = str.matchAll(findMe);
  return [...allMatches]?.find((_, i) => i + 1 === nth)?.index;
}

function ucFirst([first, ...theRest]) {
  return `${first.toUpperCase()}${theRest.join(``).toLowerCase()}`;
}

function descriptionsGetter() {
  const instanceProps = Object.entries(Object.getOwnPropertyDescriptors(StringBuilder``));
  const allProps = instanceProps
    .map( ([key, descr]) => {
      // no natives
      if (natives.find(nkey => key === nkey)) { return ``; }
      const props = [];
      const isMethod = !descr.get && !descr.set && descr.value instanceof Function;
      const fnString = String(descr.get ?? descr.value);
      const argsClause = isMethod ? descr.value.toString().match(/(\(.+?\))/)?.shift() ?? `()` : ``;
      if (descr.get) { props.push(`getter`); }
      if (descr.set) { props.push(`setter (mutates)`); }
      if (/instanceValue\s+?(=|\+=)/.test(fnString) || /empty|reset/.test(key)) { props.push(`mutates`); }
      if (/return (mutableStringInstance|instanceFunction)/.test(fnString) || key === `clone`)  { props.push(`chainable`); }
      if (!props.length || /initial|length/i.test(key)) { props.push(`returns a value (not mutating)`); }
      if (/indexof|valueof|tostring/i.test(key)) { props.push(`(native) override`)}
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