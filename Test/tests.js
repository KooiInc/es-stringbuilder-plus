import $SB from "../index.js";
import { strict as assert }  from "assert";
const print = console.log.bind(console);
const results = {failed: 0, succeeded: 0};
const test = ({lambda, expected, expectedIsString = true, notEqual = false} = {}) => {
  const testFnStr = lambda.toString().trim().slice(6);
  const msg = `${testFnStr} ${notEqual ? `!==` : `===`} ${ expectedIsString ? `"${expected}"` : expected }`;
  
  if (expected === `undefined`) {
    results.failed += 1;
    return `${msg} NOT OK! not expected value given)`;
  }
  
  const testValue = expectedIsString ? lambda().toString() : lambda();
  const testEq = notEqual ? `notEqual` : `equal`;
  try {
    assert[testEq](testValue, expected);
    results.succeeded += 1;
    return msg.concat(` OK!`);
  } catch(err) {
    results.failed += 1;
    return `${msg} NOT OK!\n     Expected: "${err.expected}"; received: "${err.actual}"`;
  }
}

const basicString = $SB``;
basicString.test = true;
runTests();

function runTests() {
  const tests = allTests();
  print(`- The constructor is $SB`);
  print(`- All tests use "basicString", assigned as\n    const basicString = $SB\`\`;`);
  print(`- Instances can be created using a function call $SB(...) or tagged template $SB\`\``);
  print($SB`-`.repeat(20).value);
  Object.entries(tests).forEach(([block, tests], i) => {
      print(!i  ? `** ${block}` : `\n** ${block}`);
      Object.keys(tests).forEach(key => {
        const tested = tests[key]();
        print(`   - ${key} =>\n      ${tested}`);
      });
    }
  );
  
  print(`${$SB`-`.repeat(20)}\nTests failed: ${results.failed}\nTests succeeded: ${results.succeeded}`)
}

function allTests() {
  return {
    "By contract: only strings or numbers can be input for the constructor": {
      "Object literal": () => test({lambda: () => basicString.as({}), expected: `{}`, notEqual: true}),
      "Object literal returns empty string": () => test({lambda: () => basicString, expected: ``}),
      "Array literal":  () => test({lambda: () => basicString.as([]), expected: `[]`, notEqual: true}),
      "Array literal returns empty string":  () => test({lambda: () => basicString, expected: ``}),
      "RegExp literal": () => test({lambda: () => basicString.as(/[a-z]/gi), expected: `/[a-z]/gi`, notEqual: true}),
      "RegExp literal returns empty string": () => test({lambda: () => basicString.as(/[a-z]/gi), expected: ``}),
      "null": () => test({lambda: () => basicString.as(null), expected: `null`, notEqual: true}),
      "null returns empty string": () => test({lambda: () => basicString.as(null), expected: ``}),
      "undefined returns empty string": () => test({lambda: () => basicString.as(undefined), expected: ``}),
      "Number": () => test({lambda: () => basicString.as(42), expected: `42`}),
      "String literal (template tag)": () => test({lambda: () => basicString.as`I am ok`, expected: `I am ok`}),
      "String literal (function call)": () => test({lambda: () => basicString.as(`I am ok`), expected: `I am ok`}),
      "Empty String literal (template tag)": () => test({lambda: () => basicString.as``, expected: ``}),
    },
    "Native (non deprecated) String methods": {
      "at": () => test({lambda: () => basicString.as(442).at(1), expected: `4`}),
      "charAt": () => test({lambda: () => basicString.as`442`.charAt(1), expected: `4`}),
      "charCodeAt": () => test({lambda: () => basicString.as`hellö`.charCodeAt(4), expectedIsString: false, expected: 246}),
      "codePointCodeAt": () => test({lambda: () => basicString.as`hell😁`.codePointAt(4), expected: 128513, expectedIsString: false}),
      "concat": () => test({lambda: () => basicString.concat`😁`, expected: `hell😁😁`}),
      "endsWith": () => test({lambda: () => basicString.endsWith`😁`, expectedIsString: false, expected: true}),
      "includes": () => test({lambda: () => basicString.includes`😁`, expectedIsString: false, expected: true}),
      "indexOf": () => test({lambda: () => basicString.indexOf(`l`), expectedIsString: false, expected: 2}),
      "indexOf (note: overridden)": () => test({lambda: () => basicString.indexOf(`z`), expectedIsString: false, expected: undefined}),
      "isWellFormed": () => test({lambda: () => basicString.isWellFormed(), expectedIsString: false, expected: true}),
      "isWellFormed (not)":  () => test({lambda: () => basicString.clone.as`\uDFFFab`.isWellFormed(), expectedIsString: false, expected: false}),
      "lastIndexOf": () => test({lambda: () => basicString.lastIndexOf(`l`), expectedIsString: false, expected: 3}),
      "lastIndexOf (note: overridden)": () => test({lambda: () => basicString.lastIndexOf(`x`), expectedIsString: false, expected: undefined}),
      "localeCompare": () => test({lambda: () => basicString.as`ö`.localeCompare(`ö`), expectedIsString: false, expected: 0}),
      "match": () => test({lambda: () => basicString.as`hello`.match(/l/g).length, expectedIsString: false, expected: 2}),
      "matchAll": () => test({lambda: () => basicString.repeat(3).matchAll(/ll/g).next().value.index, expectedIsString: false, expected: 2}),
      "normalize": () => test({lambda: () => basicString.as`\u0041\u006d\u00e9\u006c\u0069\u0065`.normalize(), expected: `Amélie`}),
      "padEnd":  () => test({lambda: () => basicString.padEnd(basicString.length + 1, `*` ), expected: `Amélie*`}),
      "padStart":  () => test({lambda: () => basicString.padStart(basicString.length + 1,`*`), expected: `*Amélie*`}),
      "repeat": () => test({lambda: () => basicString.as`😁`.repeat(2), expected: `😁😁`}),
      "replace": () => test({lambda: () => basicString.as(41).replace(`1`, 2), expected: `42`}),
      "replaceAll": () => test({lambda: () => basicString.as("hello").repeat(2).replaceAll(`hello`, `hello world`), expected: `hello worldhello world`}),
      "slice": () => test({lambda: () => basicString.as(442).slice(1), expected: `42`}),
      "split": () => test({lambda: () => basicString.as(442).split(``).join(`!`), expected: `4!4!2`}),
      "startsWith": () => test({lambda: () => basicString.as`hello`.startsWith`h`, expectedIsString: false, expected: true}),
      "substring": () => test({lambda: () => basicString.substring(1), expected: `ello`}),
      "toLocaleLowerCase": () => test({lambda: () => basicString.as`İstanbul`.toLocaleLowerCase(`tr`), expected: `i̇stanbul`}),
      "toLocaleUpperCase": () => test({lambda: () => basicString.as('Gesäß').toLocaleUpperCase(`de`), expected: `GESÄSS`}),
      "toLowerCase()": () => test({lambda: () => basicString.as`HELlo`.toLowerCase(), expected: `hello`}),
      "toUpperCase()": () => test({lambda: () => basicString.toUpperCase(), expected: `HELLO`}),
      "toWellFormed": () => test({lambda: () => basicString.as`ab\uD83D\uDE04c`.toWellFormed(), expected: `ab😄c`}),
      "trim": () => test({lambda: () => basicString.as`  hithere  `.trim(), expected: `hithere`}),
      "trimEnd": () => test({lambda: () => basicString.as`  hithere  `.trimEnd(), expected: `  hithere`}),
      "trimStart": () => test({lambda: () => basicString.trimStart(), expected: `hithere`}),
    },
    "Custom instance methods": {
      "append": () => test({lambda: () => basicString.clear.append`test123`, expected: `test123`}),
      "as (alias for is)": () => test({lambda: () => basicString.as`test456`, expected: `test456`}),
      "clear": () => test({lambda: () => basicString.clear, expected: ``}),
      "clone": () => test({lambda: () => basicString.clone.as(`was cloned`), expected: `was cloned`}),
      "basicString not mutated after clone": () => test({lambda: () => basicString, expected: `was cloned`, notEqual: true}),
      "empty": () => test({lambda: () => basicString.empty, expected: ``}),
      "firstUp": () => test({lambda: () => basicString.as`HELlo`.firstUp, expected: `Hello`}),
      "firstUp with diacrit": () => test({lambda: () => basicString.as`ünderscore`.firstUp, expected: `Ünderscore`}),
      "initial": () => test({lambda: () => basicString.initial, expected: ``}),
      "interpolate": () => test({lambda: () => {const hi = {hi:`hello`}; return basicString.as`{hi}`.interpolate(hi);}, expected: `hello`}),
      "interpolate multiple": () => test({lambda: () => basicString.as`{hello}`.interpolate({hello: `hi `}, {hello: `there`}), expected: `hi there`}),
      "is": () => test({lambda: () => basicString.is`test789`, expected: `test789`}),
      "prepend": () => test({lambda: () => basicString.prepend`prepended to `, expected: `prepended to test789`}),
      "quot": () => test({lambda: () => basicString.quot(`<,>`), expected: `<prepended to test789>`}),
      "quot4Print": () => test({lambda: () => basicString.quot4Print(`>,<`), expected: `><prepended to test789><`}),
      "quot4Print basicString not mutated": () => test({lambda: () => basicString, expected: `<prepended to test789>`}),
      "remove": () => test({lambda: () => basicString.remove(basicString.indexOf(`to`) - 1, -1), expected: `<prepended>`}),
      "reset": () => test({lambda: () => basicString.reset, expected: ``}),
      "surroundWith": () => test({lambda: () => basicString.surroundWith({l: `hello `, r: `world`}), expected: `hello world`}),
      "toCamel": () => test({lambda: () => basicString.as`data-set-to-camel-case`.toCamel, expected: `dataSetToCamelCase`}),
      "toDashed": () => test({lambda: () => basicString.toDashed, expected: `data-set-to-camel-case`}),
      "toLower": () => test({lambda: () => basicString.as`HellO`.toLower, expected: `hello`}),
      "toUpper": () => test({lambda: () => basicString.toUpper, expected: `HELLO`}),
      "truncate": () => test({lambda: () => basicString.as`way too long this`.truncate(15), expected: `way too long th...`}),
      "truncate for html": () => test({lambda: () => basicString.as`way too long this`.truncate(15, {html: true}), expected: `way too long th&hellip;`}),
      "truncate on nearest word boundary": () => test({lambda: () => basicString.as`way too long this`.truncate(15, {wordBoundary: true}), expected: `way too long...`}),
      "value (get)": () => test({lambda: () => basicString.value, expected: `way too long...`}),
      "value (set)": () => test({lambda: () => (basicString.value = `hello again`, basicString), expected: `hello again`}),
      "wordsUp": () => test({lambda: () => basicString.as`hello WORLD again`.wordsUp, expected: `Hello World Again`}),
      "wordsUp with diacrits/non word characters": () => test({lambda: () => basicString.as`hello-[WORLD] (ägain)`.wordsUp, expected: `Hello-[World] (Ägain)`}),
    },
  }
}