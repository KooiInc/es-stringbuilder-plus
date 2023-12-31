import $SB from "../index.js";
import { strict as assert }  from "assert";
import StringBuilder from "../index.js";
const print = console.log.bind(console);
const results = {failed: 0, succeeded: 0};
let firstWord;
$SB.addExtension(`userGetterTest`, instance => instance.value + ` got it`);
$SB.addExtension(`userMethodTest`, (instance, extraText) => instance.value + extraText);
$SB.addExtension(`toCodeElement`, (instance, codeText) => instance.is(`<code>${codeText}</code>`));
$SB.addExtension(`italic`, instance => instance.is(`<i>${instance.value}</i>`));
$SB.addExtension(`clone2FirstWord`, instance => instance.value.slice(0, instance.indexOf(` `)), true);
const basicString = $SB``;
basicString.test = true;
const instanceProps = Object.getOwnPropertyDescriptors($SB``);
runTests();

function assertThrows(lambda, expected) {
  try { return lambda(); }
  catch(err) {
    return err.name === expected
      ? { isOk: true, message: err.message, type: err.name }
      : { isOk: false, type: err.name }
  }
}

function runTests() {
  const tests = retrieveAllTests();
  print(`- The constructor is $SB`);
  print(`- Some tests use a predefined instance, called "basicString", assigned as\n    const basicString = $SB\`\`;`);
  print(`- Instances can be created using a function call $SB(...) or tagged template $SB\`\``);
  print($SB`-`.repeat(20).value);
  
  Object.entries(tests).forEach(([block, tests], i) => {
      print(!i  ? `** ${block}` : `\n** ${block}`);
      Object.keys(tests).forEach(key => {
        const tested = test(tests[key]);
        print(`   * ${key} =>\n     ${tested}`);
      });
    }
  );
  
  testDescriptions();
  
  print(`${$SB`-`.repeat(20)}\nTests failed: ${results.failed}\nTests succeeded: ${results.succeeded}`)
}

function testDescriptions() {
  const dummy = $SB``;
  const instanceProps = Object.getOwnPropertyDescriptors(dummy);
  const descriptions = Object.entries($SB.describe)
    .sort( ([key1,], [key2, ]) => key1.localeCompare(key2));
  
  print(`\n** [Constructor].describe`)
  print(`   Using`)
  print(`   [const instanceProps = Object.getOwnPropertyDescriptors($SB\`\`);]`);
  print(`   [const descriptions = $SB.describe;] (entries, sorted on key)`)
  print(`   [(entries)descriptions.forEach( ([key, descriptionItem]) => {...});]`);
  print(`   For every descriptionItem of [$SB.describe] check if it's what we expect`);
  
  descriptions.forEach( ([key, descriptionItem]) => {
    let tested = test( {lambda: () => key in instanceProps, expectedIsString: false, expected: true} );

    print(`   * [${key}] =>\n     ${tested}`);
    tested = test( {
      lambda: () => descriptionItem.getter && `get` in instanceProps[key],
      expectedIsString: false,
      expected: descriptionItem.getter } );
    print(`     - is getter =>\n       ${tested}`);
    
    tested = test( {
      lambda: () => descriptionItem.method && `value` in instanceProps[key],
      expectedIsString: false,
      expected: descriptionItem.method ?? false } );
    print(`     - is method =>\n       ${tested}`);
    
    tested = test( {
      lambda: () => descriptionItem.override && key in String.prototype,
      expectedIsString: false,
      expected: descriptionItem.override } );
    print(`     - is override of native String method/getter =>\n       ${tested}`);
  });
}

function test({lambda, expected, expectedIsString = true, notEqual = false, throws = false} = {}) {
  const testFnStr = lambda.toString().trim().slice(6);
  let msg = `${testFnStr} ${notEqual ? `!==` : `===`} ${ expectedIsString ? `"${expected}"` : expected }`;
  
  if (throws) {
    const throwsProbe = assertThrows(lambda, expected);
    
    const isOk = throwsProbe.isOk && expected === throwsProbe.type;
    msg = isOk ? `${testFnStr} thrown ${expected} as expected` : ` thrown error, but not ${expected}`;
    results.succeeded += +isOk;
    results.failed += +!isOk;
    
    return isOk
      ? `\u{1F5F8} `.concat(`${msg}`).concat(`\n        With error message: "${throwsProbe.message}"`)
      : `\u2718 ${msg}`
        .concat(`\n        Expected: ${expected}, observed: ${
          throwsProbe.type}`);
  }
  
  const testValue = throws ? lambda : expectedIsString ? lambda().toString() : lambda();
  const kindOfTest = throws ? `throws` : notEqual ? `notEqual` : `equal`;
  expected = throws ? {} : expected;
  
  try {
    assert[kindOfTest](testValue, expected);
    results.succeeded += 1;
    return `\u{1F5F8} `.concat(msg);
  } catch(err) {
    results.failed += 1;
    return `\u2718 ${msg}\n     Expected: "${err.expected}"; received: "${err.actual}"`;
  }
}

function retrieveAllTests() {
  return {
    "By contract: only (template) strings or numbers can be input for the constructor.\n   Otherwise the instance string value is an empty string": {
      "Template string is suitable": {lambda: () => $SB`I am ok`, expected: `I am ok`},
      "String literal (function call) is suitable": {lambda: () => $SB(`I am ok`), expected: `I am ok`},
      "Empty template string is suitable": {lambda: () => $SB``, expected: ``},
      "Empty String literal (function call) is suitable": {lambda: () => $SB(``), expected: ``},
      "Number is suitable": {lambda: () => $SB(42), expected: `42`},
      "Object literal returns empty string": {lambda: () => $SB({foo: 1}), expected: ``},
      "Array literal returns empty string": {lambda: () => $SB([1, 2, 3]), expected: ``},
      "RegExp literal returns empty string": {lambda: () => $SB(/[a-z]/gi), expected: ``},
      "null returns empty string": {lambda: () => $SB(null), expected: ``},
      "undefined returns empty string": {lambda: () => $SB(undefined), expected: ``},
      "no parameter returns empty string": {lambda: () => $SB(), expected: ``},
      "Map returns empty string": {lambda: () => $SB(new Map), expected: ``},
      "Function returns empty string": { lambda: () => $SB(() => {}), expected: `` },
    },
    "Custom instance methods": {
      "[instance].append": {lambda: () => $SB``.append`test123`, expected: `test123`},
      "[instance].as (alias for is)": {lambda: () => $SB``.as`test456`, expected: `test456`},
      "[instance].clear": {lambda: () => $SB`hello`.clear, expected: ``},
      "[instance].clone": {lambda: () => basicString.clone.as`was cloned`, expected: `was cloned`},
      "basicString not mutated after clone": {lambda: () => basicString, expected: ``,},
      "[instance].cloneWith": {lambda: () => basicString.cloneWith(`I Am Clone`), expected: `I Am Clone`},
      "basicString not mutated after cloneWith": {lambda: () => basicString, expected: ``},
      "[instance].empty": {lambda: () => $SB`hello`.empty, expected: ``},
      "[instance].firstUp": {lambda: () => $SB`HELlo`.firstUp, expected: `Hello`},
      "[instance].firstUp with diacrit": {lambda: () => $SB`ünderscore`.firstUp, expected: `Ünderscore`},
      "[instance].initial": {lambda: () => basicString.initial, expected: ``},
      "[instance].interpolate": { lambda: () => { const hi = {hi: `hello`}; return $SB`{hi}`.interpolate(hi); }, expected: `hello` },
      "[instance].interpolate multiple": { lambda: () => $SB`{hello}`.interpolate({hello: `hi `}, {hello: `there`}), expected: `hi there` },
      "[instance].is": {lambda: () => $SB``.is`test789`, expected: `test789`},
      "[instance].prepend": {lambda: () => $SB`test789`.prepend`prepended to `, expected: `prepended to test789`},
      "[instance].quot": {lambda: () => $SB`test`.quot(`<,>`), expected: `<test>`},
      "[instance].quot4Print": {lambda: () => basicString.as`<test>`.quot4Print(`>,<`), expected: `><test><`},
      "[instance].quot4Print basicString not mutated": {lambda: () => basicString, expected: `<test>`},
      "[instance].remove": { lambda: () => basicString.as`test789`.prepend`prepended to `.remove(basicString.indexOf(`to`), -7), expected: `prepended test789`},
      "[instance].reset": {lambda: () => basicString.reset, expected: ``},
      "[instance].reverse": {lambda: () => $SB`foo 𝌆 bar mañaña`.reverse, expected: `añañam rab 𝌆 oof`},
      "[instance].surroundWith": { lambda: () => basicString.surroundWith({l: `hello `, r: `world`}), expected: `hello world` },
      "[instance].toCamel": { lambda: () => $SB`data-set-to-camel-case`.toCamel, expected: `dataSetToCamelCase` },
      "[instance].toDashed": {lambda: () => $SB`dataSetToCamelCase`.toDashed, expected: `data-set-to-camel-case`},
      "[instance].toLower": {lambda: () => $SB`HellO`.toLower, expected: `hello`},
      "[instance].toUpper": {lambda: () => $SB`HellO`.toUpper, expected: `HELLO`},
      "[instance].truncate": {
        lambda: () => $SB`way too long this`.truncate(15),
        expected: `way too long th...`
      },
      "[instance].truncate for html (&hellip; instead of ...)": {
        lambda: () => $SB`way too long this`.truncate(15, {html: true}),
        expected: `way too long th&hellip;`
      },
      "[instance].truncate on nearest word boundary": {
        lambda: () => $SB`way too long this`.truncate(15, {wordBoundary: true}),
        expected: `way too long...`
      },
      "[instance].value (get)": {lambda: () => $SB`hello`.value, expected: `hello`},
      "[instance].value (set)": {
        lambda: () => (basicString.value = `hello again`, basicString),
        expected: `hello again`
      },
      "[instance].wordsUp": {lambda: () => $SB`hello WORLD again`.wordsUp, expected: `Hello World Again`},
      "[instance].wordsUp with diacrits/non word characters": {
        lambda: () => $SB`hello-[WORLD] (ägain)`.wordsUp,
        expected: `Hello-[World] (Ägain)`
      },
    },
    "User defined extensions": {
      "$SB.addExtension(`userGetterTest`, instance => instance.value + ` got it`)":
        {lambda: () => $SB`ok`.userGetterTest, expected: `ok got it`},
      "$SB.addExtension(`userMethodTest`, (instance, extraText) => instance.value + extraText)":
        {lambda: () => $SB`ok`.userGetterTest.userMethodTest(` and bye!`), expected: `ok got it and bye!`},
      "$SB.addExtension(`toCodeElement`, (instance, codeText) => instance.is(`&lt;code>${codeText}&lt;/code>`))":
        {lambda: () => basicString.toCodeElement(`const test123;`), expected: `<code>const test123;</code>`},
      "$SB.addExtension(`italic`, instance => instance.is(`&lt;i>${instance.value}&lt;/i>`));":
        {lambda: () => $SB`Hello World`.italic, expected: `<i>Hello World</i>`},
      "$SB.addExtension(`clone2FirstWord`, instance => instance.value.slice(0, instance.indexOf(` `)), true);":
        {lambda: () => (firstWord = basicString.as`Hello World`.clone2FirstWord, firstWord), expected: `Hello`},
      "After .clone2FirstWord, basicString should not have changed":
        {lambda: () => basicString.value, expected: `Hello World`},
    },
    "Native (non deprecated) String methods": {
      "[instance].at": {lambda: () => $SB(442).at(1), expected: `4`},
      "[instance].charAt": {lambda: () => $SB`442`.charAt(1), expected: `4`},
      "[instance].charCodeAt": {
        lambda: () => $SB`hellö`.charCodeAt(4),
        expectedIsString: false,
        expected: 246
      },
      "[instance].codePointCodeAt": {
        lambda: () => $SB`hell😁`.codePointAt(4),
        expected: 128513,
        expectedIsString: false
      },
      "[instance].concat": {lambda: () => $SB`hell😁`.concat`😁`, expected: `hell😁😁`},
      "[instance].endsWith": {lambda: () => $SB`hell😁`.endsWith`😁`, expectedIsString: false, expected: true},
      "[instance].includes": {lambda: () => $SB`hell😁`.includes`😁`, expectedIsString: false, expected: true},
      "[instance].indexOf": {lambda: () => $SB`hell😁`.indexOf(`l`), expectedIsString: false, expected: 2},
      "[instance].indexOf (fromIndex)":
        {lambda: () => $SB`hello`.indexOf(`l`, 5), expectedIsString: false, expected: undefined},
      "[instance].indexOf (override: return undefined if not found)": {
        lambda: () => $SB`hello`.indexOf(`z`),
        expectedIsString: false,
        expected: undefined
      },
      "[instance].indexOf (override can use regular expression)": {
        lambda: () => $SB`Hello World`.indexOf(/\W/),
        expectedIsString: false,
        expected: 5
      },
      "[instance].indexOf (regular expression, fromIndex)": {
        lambda: () => $SB`Hello World`.indexOf(/\W/, 4),
        expected: 5,
        expectedIsString: false,
      },
      "[instance].isWellFormed": {lambda: () => basicString.isWellFormed(), expectedIsString: false, expected: true},
      "[instance].isWellFormed (not)": {
        lambda: () => $SB`\uDFFFab`.isWellFormed(),
        expectedIsString: false,
        expected: false
      },
      "[instance].lastIndexOf":
        {lambda: () => $SB`Hello World`.lastIndexOf(`l`), expectedIsString: false, expected: 9},
      "[instance].lastIndexOf (position)":
        {lambda: () => $SB`Hello World`.lastIndexOf(`l`, 7), expectedIsString: false, expected: 3},
      "[instance].lastIndexOf (override: return undefined if nothing found)": {
        lambda: () => $SB`Hello World`.lastIndexOf(`x`),
        expectedIsString: false,
        expected: undefined
      },
      "[instance].lastIndexOf (override: can use regular expression)": {
        lambda: () => $SB`Hello World`.lastIndexOf(/\W/),
        expectedIsString: false,
        expected: 5
      },
      "[instance].lastIndexOf (regular expression and position)": {
        lambda: () => $SB`Hello World`.lastIndexOf(/\W/, 6),
        expectedIsString: false,
        expected: 5
      },
      "[instance].lastIndexOf (regular expression and (impossible) position)": {
        lambda: () => $SB`Hello World`.lastIndexOf(/\W/, 4),
        expectedIsString: false,
        expected: undefined
      },
      "[instance].localeCompare": {
        lambda: () => $SB`ö`.localeCompare(`ö`),
        expectedIsString: false,
        expected: 0
      },
      "[instance].match": {
        lambda: () => $SB`hello`.match(/l/g).length,
        expectedIsString: false,
        expected: 2
      },
      "[instance].matchAll": {
        lambda: () => $SB`hello`.repeat(3).matchAll(/ll/g).next().value.index,
        expectedIsString: false,
        expected: 2
      },
      "[instance].normalize": {
        lambda: () => $SB`\u0041\u006d\u00e9\u006c\u0069\u0065`.normalize(),
        expected: `Amélie`
      },
      "[instance].padEnd": {lambda: () => $SB`Amélie`.padEnd(7, `*`), expected: `Amélie*`},
      "[instance].padStart": {lambda: () => $SB`Amélie*`.padStart(8, `*`), expected: `*Amélie*`},
      "[instance].repeat": {lambda: () => $SB`😁`.repeat(3), expected: `😁😁😁`},
      "[instance].replace": {lambda: () => $SB(41).replace(`1`, 2), expected: `42`},
      "[instance].replaceAll": {
        lambda: () => $SB("hello").repeat(2).replaceAll(`hello`, `hello world`),
        expected: `hello worldhello world`
      },
      "[instance].slice": {lambda: () => $SB(442).slice(1), expected: `42`},
      "[instance].split": {lambda: () => $SB(442).split(``).join(`!`), expected: `4!4!2`},
      "[instance].startsWith": {
        lambda: () => $SB`hello`.startsWith`h`,
        expectedIsString: false,
        expected: true
      },
      "[instance].substring": {lambda: () => $SB`hello`.substring(1), expected: `ello`},
      "[instance].toLocaleLowerCase": {
        lambda: () => $SB`GEsäSS`.toLocaleLowerCase(`de`),
        expected: `gesäss`
      },
      "[instance].toLocaleUpperCase": {
        lambda: () => $SB('Gesäß').toLocaleUpperCase(`de`),
        expected: `GESÄSS`
      },
      "[instance].toLowerCase()": {lambda: () => $SB`HELlo`.toLowerCase(), expected: `hello`},
      "[instance].toUpperCase()": {lambda: () => $SB`hello`.toUpperCase(), expected: `HELLO`},
      "[instance].toWellFormed": {lambda: () => $SB`ab\uD83D\uDE04c`.toWellFormed(), expected: `ab😄c`},
      "[instance].trim": {lambda: () => $SB`  hithere  `.trim(), expected: `hithere`},
      "[instance].trimEnd": {lambda: () => $SB`  hithere  `.trimEnd(), expected: `  hithere`},
      "[instance].trimStart": {lambda: () => $SB`  hithere  `.trimStart(), expected: `hithere  `},
    },
    "Miscellaneous": {
      "Instances are frozen": { lambda: () => Object.isFrozen($SB``), expected: true, expectedIsString: false},
      "Instances are frozen, so cannot add properties (throws TypeError)": {
        lambda: () => {const t = $SB``; t.noCando = 42;}, throws: true, expected: `TypeError`, dontEscapeHtml: true},
      "[instance].nonExistingProperty": {lambda: () => $SB``.nonExistingProperty, expected: undefined, expectedIsString: false},
      "[constructor].describe.stringify": {
        lambda: () => {const d = $SB.describe.stringify; return Array.isArray(d) && /interpolate\(/.test(`${d}`);},
        expected: true,
        expectedIsString: false
      },
      "[constructor].removeUsrExtension": {
        lambda: () => { $SB.removeUsrExtension(`clone2FirstWord`); return $SB``.cloneFirstWord; },
        expected: undefined,
        expectedIsString: false
      },
      "[constructor].removeAllUsrExtensions": {
        lambda: () => { $SB.removeAllUsrExtensions; return $SB.hasUserExtensions },
        expected: false,
        expectedIsString: false
      }
    }
  };
}