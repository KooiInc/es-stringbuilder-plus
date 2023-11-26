const natives =  nativeStringMethods();
const interpolate = interpolateFactory();

Object.defineProperty(StringBuilder, `describe`, { get() { return descriptionsGetter(); } });

export default function StringBuilder(str, ...args) {
  return Object.freeze(createInstance(byContract(str, ...args)));
};

function createInstance(instanceValue) {
  const initialValue = instanceValue;
  const instance = Object.assign({
    get length() { return instanceValue.length; },
    get initial() { return initialValue; },
    get value() { return instanceValue; },
    set value(v) { instanceValue = v; },
    get reset() { instanceValue = initialValue; return instance; },
    get clear() { instanceValue = ``; return instance; },
    get empty() { instanceValue = ``; return instance; },
    get clone() { return StringBuilder`${instanceValue}`; },
    get toUpper() { instanceValue = instanceValue.toUpperCase(); return instance; },
    get toLower() { instanceValue = instanceValue.toLowerCase(); return instance; },
    get firstUp() { instanceValue = ucFirst(instanceValue); return instance; },
    get wordsUp() { instanceValue = wordsFirstUp(instanceValue); return instance; },
    get toDashed() { instanceValue = toDashedNotation(instanceValue); return instance; },
    get toCamel() { instanceValue = toCamelcase(instanceValue); return instance; },
    quot4Print(quotes = `","`) { return quot(instanceValue, quotes); },
    is(newValue, ...args) { instanceValue = instanceValue.value ?? byContract(newValue, ...args); return instance; },
    quot(quotes = `"`) { instanceValue = quot(instanceValue, quotes); return instance; },
    indexOf(...args) { return indexOf(instanceValue, ...args); },
    lastIndexOf(...args) { return lastIndexOf(instanceValue, ...args); },
    toString() { return instanceValue; },
    valueOf() { return instanceValue; },
    at(pos) { return instanceValue.at(pos); },
    codePointAt(pos) { return instanceValue.codePointAt(pos); },
    charAt(pos) { return instanceValue.charAt(pos); },
    prepend(str2Prepend, ...args) { instanceValue = (str2Prepend.value ?? byContract(str2Prepend, args)) +
      instanceValue; return instance; },
    append(str2Append, ...args) {
        instanceValue += str2Append.value || byContract(str2Append, ...args);
        return instance; },
    truncate(at, { html = false, wordBoundary = false } = {} ) {
      instanceValue = truncate(instanceValue, {at, html, wordBoundary});
      return instance; },
    extract(start, end) { instanceValue = extract(instanceValue, start, end); return instance; },
    remove(start, end) { instanceValue = remove(instanceValue, start, end); return instance; },
    interpolate(...replacementTokens) {
      instanceValue = interpolate(instanceValue, ...replacementTokens);
      return instance; },
  });
  natives.chainable.forEach( key =>
    instance[key] = Object.getOwnPropertyDescriptor(String.prototype, key)?.value.length
      ? function(...args) { instanceValue = instanceValue[key]?.(...args); return instance; }
      : function() { instanceValue = instanceValue[key]?.(); return instance; } );
  natives.valueReturn.forEach( key => {
    const isFn = Object.getOwnPropertyDescriptor(String.prototype, key)?.value;
    if (!isFn) { return; }
    instance[key] = isFn.length
      ? function(...args) { return instanceValue[key]?.(...args); }
      : function() { return instanceValue[key]?.(); }
  });
  
  return instance;
}

function getExclusion() {
  // note:
  // trimLeft/-Right are redundant (use trimStart/-End),
  // indexOf, lastIndexOf, at, codePointAt and charAt are overridden.
  return `at,charAt,anchor,big,blink,bold,fixed,fontcolor,fontsize,italics,link,small,
          codePointAt,strike,sub,substr,sup,trimLeft,trimRight,indexOf,lastIndexOf`
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
  const checkReturnValue = (key, v) => v.value instanceof Function && typeof `abc`[key]() || `n/a`;
  const chainable = Object
    .entries(Object.getOwnPropertyDescriptors(String.prototype))
    .filter( ([key, v]) => !excluded[key] && checkReturnValue(key, v) === `string` )
    .map( ([key,]) => key );
  const valueReturn = Object
    .entries(Object.getOwnPropertyDescriptors(String.prototype))
    .filter( ([key, v]) => !excluded[key] && checkReturnValue(key, v) !== `string` )
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
  return `${first.toUpperCase()}${theRest.join(``)}`;
}

function descriptionsGetter() {
  const instanceProps = Object.entries(Object.getOwnPropertyDescriptors(StringBuilder``));
  const allProps = instanceProps
    .map( ([key, descr]) => {
      const allNatives = natives.chainable.concat(natives.valueReturn).filter(key => !/indexof/i.test(key));
      if (allNatives.find(nkey => key === nkey)) { return ``; }
      const props = [];
      const isMethod = !descr.get && !descr.set && descr.value instanceof Function;
      const fnString = String(descr.get ?? descr.value);
      const argsClause = isMethod ? descr.value.toString().match(/(\(.+?\))/)?.shift() ?? `()` : ``;
      if (descr.get) { props.push(`getter`); }
      if (descr.set) { props.push(`setter (mutates)`); }
      if (/instanceValue\s+?(=|\+=)/.test(fnString) || /empty|reset/.test(key)) { props.push(`mutates`); }
      if (/return instance;/.test(fnString) || key === `clone`)  { props.push(`chainable`); }
      if (!props.length || /initial|length|indexof/i.test(key)) { props.push(`returns a value (not mutating)`); }
      if (/^(indexof|lastindexof|at|charat|codepointat)$/i.test(key)) { props.push(`(native) override`)}
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