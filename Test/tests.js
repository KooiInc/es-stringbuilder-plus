import $SB from "../index.js";
import { strict as assert }  from "assert";
const print = console.log.bind(console);
const results = {failed: 0, succeeded: 0};
const trial = ({lambda, expected, expectedIsString = true, notEqual = false} = {}) => {
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
  print($SB`-`.repeat(100).value);
  Object.entries(tests).forEach(([block, tests]) => {
      print(`\n** ${block}`);
      Object.keys(tests).forEach(key => {
        const tested = tests[key]();
        print(`   ${key} => ${tested}`);
      });
    }
  );
  
  print(`\n${$SB`-`.repeat(100)}\nTests failed: ${results.failed}\nTests succeeded: ${results.succeeded}`)
}

function allTests() {
  return {
    "By contract: only strings or numbers can be input for the constructor": {
      "Object literal": () => trial({lambda: () => basicString.as({}), expected: `{}`, notEqual: true}),
      "Object literal returns empty string": () => trial({lambda: () => basicString, expected: ``}),
      "Object as String input":  () => trial({lambda: () => basicString.as`{}`, expected: `{}`}),
      "Array literal":  () => trial({lambda: () => basicString.as([]), expected: `[]`, notEqual: true}),
      "Array literal returns empty string":  () => trial({lambda: () => basicString, expected: ``}),
      "RegExp literal": () => trial({lambda: () => basicString.as(/[a-z]/gi), expected: `/[a-z]/gi`, notEqual: true}),
      "RegExp literal returns empty string": () => trial({lambda: () => basicString.as(/[a-z]/gi), expected: ``}),
      "Null": () => trial({lambda: () => basicString.as(null), expected: `null`, notEqual: true}),
      "Null returns empty string": () => trial({lambda: () => basicString.as(null), expected: ``}),
      "Number": () => trial({lambda: () => basicString.as(42), expected: `42`}),
      "String literal (template tag)": () => trial({lambda: () => basicString.as`I am ok`, expected: `I am ok`}),
      "String literal (function call)": () => trial({lambda: () => basicString.as(`I am ok`), expected: `I am ok`}),
    },
    "Native String methods (non deprecated)": {
      "at": () => trial({lambda: () => basicString.as(442).at(1), expected: `4`}),
      "charAt": () => trial({lambda: () => basicString.as`442`.charAt(1), expected: `4`}),
      "charCodeAt": () => trial({lambda: () => basicString.as`hellö`.charCodeAt(4), expectedIsString: false, expected: 246}),
      "codePointCodeAt": () => trial({lambda: () => basicString.as`hell😁`.codePointAt(4), expected: 128513, expectedIsString: false}),
      "concat": () => trial({lambda: () => basicString.concat`😁`, expected: `hell😁😁`}),
      "endsWith": () => trial({lambda: () => basicString.endsWith`😁`, expectedIsString: false, expected: true}),
      "includes": () => trial({lambda: () => basicString.includes`😁`, expectedIsString: false, expected: true}),
      "indexOf": () => trial({lambda: () => basicString.indexOf(`l`), expectedIsString: false, expected: 2}),
      "indexOf (note: overridden)": () => trial({lambda: () => basicString.indexOf(`z`), expectedIsString: false, expected: undefined}),
      "isWellFormed": () => trial({lambda: () => basicString.isWellFormed(), expectedIsString: false, expected: true}),
      "isWellFormed (not)":  () => trial({lambda: () => basicString.clone.as`\uDFFFab`.isWellFormed(), expectedIsString: false, expected: false}),
      "lastIndexOf": () => trial({lambda: () => basicString.lastIndexOf(`l`), expectedIsString: false, expected: 3}),
      "lastIndexOf (note: overridden)": () => trial({lambda: () => basicString.lastIndexOf(`x`), expectedIsString: false, expected: undefined}),
      "localeCompare": () => trial({lambda: () => basicString.as`ö`.localeCompare(`ö`), expectedIsString: false, expected: 0}),
      "match": () => trial({lambda: () => basicString.as`hello`.match(/l/g).length, expectedIsString: false, expected: 2}),
      "matchAll": () => trial({lambda: () => basicString.repeat(3).matchAll(/ll/g).next().value.index, expectedIsString: false, expected: 2}),
      "normalize": () => trial({lambda: () => basicString.as`\u0041\u006d\u00e9\u006c\u0069\u0065`.normalize(), expected: `Amélie`}),
      "padEnd":  () => trial({lambda: () => basicString.padEnd(basicString.length + 1, `*` ), expected: `Amélie*`}),
      "padStart":  () => trial({lambda: () => basicString.padStart(basicString.length + 1,`*`), expected: `*Amélie*`}),
      "repeat": () => trial({lambda: () => basicString.as`😁`.repeat(2), expected: `😁😁`}),
      "replace": () => trial({lambda: () => basicString.as(41).replace(`1`, 2), expected: `42`}),
      "replaceAll": () => trial({lambda: () => basicString.as("hello").repeat(2).replaceAll(`hello`, `hello world`), expected: `hello worldhello world`}),
      "slice": () => trial({lambda: () => basicString.as(442).slice(1), expected: `42`}),
      "split": () => trial({lambda: () => basicString.as(442).split(``).join(`!`), expected: `4!4!2`}),
      "startsWith": () => trial({lambda: () => basicString.as`hello`.startsWith`h`, expectedIsString: false, expected: true}),
      "substring": () => trial({lambda: () => basicString.substring(1), expected: `ello`}),
      "toLocaleLowerCase": () => trial({lambda: () => basicString.as`İstanbul`.toLocaleLowerCase(`tr`), expected: `i̇stanbul`}),
      "toLocaleUpperCase": () => trial({lambda: () => basicString.as('Gesäß').toLocaleUpperCase(`de`), expected: `GESÄSS`}),
      "toLowerCase()": () => trial({lambda: () => basicString.as`HELlo`.toLowerCase(), expected: `hello`}),
      "toUpperCase()": () => trial({lambda: () => basicString.toUpperCase(), expected: `HELLO`}),
      "toWellFormed": () => trial({lambda: () => basicString.as`"ab\uD83D\uDE04c"`.toWellFormed(), expected: `"ab😄c"`}),
      "trim": () => trial({lambda: () => basicString.as`  hithere  `.trim(), expected: `hithere`}),
      "trimEnd": () => trial({lambda: () => basicString.as`  hithere  `.trimEnd(), expected: `  hithere`}),
      "trimStart": () => trial({lambda: () => basicString.trimStart(), expected: `hithere`}),
    },
    "Custom instance methods": {
      "append": () => trial({lambda: () => basicString.clear.append`test123`, expected: `test123`}),
      "as": () => trial({lambda: () => basicString.as`test456`, expected: `test456`}),
      "clear": () => trial({lambda: () => basicString.clear, expected: ``}),
      "clone": () => trial({lambda: () => basicString.clone.as(`was cloned`), expected: `was cloned`}),
      "empty": () => trial({lambda: () => basicString.empty, expected: ``}),
      "firstUp": () => trial({lambda: () => basicString.as`HELlo`.firstUp, expected: `Hello`}),
      "initial": () => trial({lambda: () => basicString.initial, expected: ``}),
      "interpolate": () => trial({lambda: () => basicString.as`{hello}`.interpolate([{hello: `hi `}, {hello: `world`}]), expected: `hi world`}),
      "is": () => trial({lambda: () => basicString.as`test789`, expected: `test789`}),
      "prepend": () => trial({lambda: () => basicString.prepend`prepended to `, expected: `prepended to test789`}),
      "quot": () => trial({lambda: () => basicString.quot(`<,>`), expected: `<prepended to test789>`}),
      "quot4Print": () => trial({lambda: () => basicString.quot4Print(`>,<`), expected: `><prepended to test789><`}),
      "remove": () => trial({lambda: () => basicString.remove(basicString.indexOf(`to`), -1), expected: `<prepended >`}),
      "reset": () => trial({lambda: () => basicString.reset, expected: ``}),
      "surroundWith": () => trial({lambda: () => basicString.surroundWith({l: `hello `, r: `world`}), expected: `hello world`}),
      "toCamel": () => trial({lambda: () => basicString.as`data-set-to-camel-case`.toCamel, expected: `dataSetToCamelCase`}),
      "toDashed": () => trial({lambda: () => basicString.toDashed, expected: `data-set-to-camel-case`}),
      "toLower": () => trial({lambda: () => basicString.as`HellO`.toLower, expected: `hello`}),
      "toUpper": () => trial({lambda: () => basicString.toUpper, expected: `HELLO`}),
      "truncate": () => trial({lambda: () => basicString.as`way too long this`.truncate(14), expected: `way too long t...`}),
      "truncate (word boundary)": () => trial({lambda: () => basicString.as`way too long this`.truncate(14, {wordBoundary: true}), expected: `way too long...`}),
      "value (get)": () => trial({lambda: () => basicString.value, expected: `way too long...`}),
      "value (set)": () => trial({lambda: () => (basicString.value = `hello again`, basicString), expected: `hello again`}),
      "wordsUp": () => trial({lambda: () => basicString.as`hello WORLD (ägain)`.wordsUp, expected: `Hello World (Ägain)`}),
    },
  }
}