import $SB from "../index.js";

const {logFactory, $} = await import("./sbHelpers.bundled.js");
const { log, } = logFactory();
const printQuoted = str => `"${str}"`;
const toCode = (str, block) => `<code${block ? ` class="codeblock"` : ``}>${str}</code>`;
const escHtml = str => str.replace(/</g, `&lt;`);
const spacer = _ => log(`!!<p>&nbsp;</p>`);

console.clear();
demo();

function demo() {
  window.$SB = $SB; // use in console
  log(`!!<h2>ES stringbuilder PLUS</h2>
  <div>
    <div class="q">
    In many other languages, a programmer can choose to explicitly use a string view or a
    string builder where they really need them. But JS has the programmer either hoping the
    engine is smart enough, or using black magic to force it to do what they want.
    </div>
    <p>
      Cited from <a target="_blank" href="https://iliazeus.github.io/articles/js-string-optimizations-en/"
      >Exploring V8's strings: implementation and optimizations</a>.</p>
    <p>
      Consider the code here <i>black magic</i>. It delivers a way to build a string (actually
      a wrapped <code>String</code> instance making its internal string value <i>mutable</i>).
      Instances can use native String methods and a number of custom methods.
      <b>ES (EcmaScript) string builder PLUS</b> is programmed in a <a target="_blank"
        href="https://depth-first.com/articles/2019/03/04/class-free-object-oriented-programming"
        >class free object oriented</a> way.
    </p>
  </div>`);
  log(`!!<h3>String builder examples</h3>`);
  const fooBar = $SB`hello`.replace(`hello`, `hell o, `).repeat(3).firstUp;
  log(toCode(`import $SB from "./StringBuilderModule.js";
const fooBar = $SB\`hello\`
  .replace(\`hello\`, \`hell o \`)
  .repeat(3)
  .firstUp;`, true));
  log(
    `${toCode(`fooBar`)} ${printQuoted(fooBar)}`,
    `${toCode(`fooBar.length`)}: ${fooBar.length}`,
    `${toCode(`fooBar.at(0)`)} => ${printQuoted(fooBar.at(0))};`);
  log(
    `<code>fooBar.truncate(8, { wordBoundary: true, html: true }).quot("[,]")</code>`,
    `${toCode(`fooBar`)}: ${fooBar.truncate(8, {wordBoundary: true, html: true }).quot(`[,]`)}`);
  const isntit = `isn't that well ... ehr ... you know ...?`;
  fooBar.is`That's me ${isntit}`;
  log(
    `<code>const isntit = \`${isntit}\`</code>`,
    `<code>fooBar.is\`thats me, \${isntit}\`</code>`,
    `${toCode(`fooBar`)}: ${fooBar}`,
    `<code>fooBar.slice(10).toUpperCase()</code>: ${printQuoted(fooBar.slice(10).toUpperCase())}`);
    
  const barFoo = fooBar.clone.slice(-13, -5);
  log(
    `!!<h3>Continue with a clone</h3>`,
    toCode(`const barFoo = fooBar.clone.slice(-13, -5);`),
    `${toCode(`barFoo`)}: ${printQuoted(barFoo)} (<code>fooBar</code> still: ${printQuoted(fooBar)})`);

  barFoo.value = `I am barFoo, ${isntit}`;
  log(
    `<code>barFoo.value = \`I am barFoo, \${isntit}\`;</cod>`,
    `${toCode(`barFoo`)}: ${printQuoted(barFoo)}`);
  barFoo.slice(0, barFoo.indexOf(`ehr`));
  log(
    `<code>barFoo.slice(0, barFoo.indexOf(\`ehr\`));<code>`,
    `${toCode(`barFoo`)}: ${barFoo.quot4Print()}`
  );

  log(`!!<h3>By contract (only strings or numbers, otherwise empty)</h3>`)
  const fooBarred = $SB({no: `can do`});
  log(
    `<code>const fooBarred = $SB({no: \`can do\`});<code>`,
    `${toCode(`fooBarred`)} is an empty string (see console): ${fooBarred.quot4Print()}`
  );
  fooBarred.value = 42;
  log(
    `<code>fooBarred.value = 42;<code>`,
    `${toCode(`fooBarred`)} (number converted to string): ${printQuoted(fooBarred)}`
  );

  log(`!!<h3>Additional case getters</h3>`);
  const lorem = $SB`lorem ipsum dolor sit amet`;
  const lorem2 = lorem.clone.toLowerCase().wordsUp.replace(/\s/g, ``).toDashed;
  log(`${toCode("$SB`lorem ipsum dolor sit amet`.toUpper")} => ${lorem.toUpper.quot4Print()}`);
  log(`${toCode("$SB`LOREM IPSUM DOLOR SIT AMET`.toLower")} => ${lorem.toLower.quot4Print()}`);
  log(`${toCode("$SB`LOREM IPSUM DOLOR SIT AMET`.firstUp")} => ${lorem.toUpper.firstUp.quot4Print()}`);
  log(`${toCode("$SB`lorem ipsum dolor sit amet`.wordsUp")} => ${lorem.wordsUp.quot4Print()}`);
  log(`${toCode("$SB`loremIpsumDolorSitAmet`.toDashed")} => ${lorem2.quot4Print()}`);
  log(`${toCode("$SB`lorem-ipsum-dolor-sit-amet`.toCamel")} => ${lorem2.toCamel.quot4Print()}`);

  log(`!!<h3>Interpolate</h3>`);
  const someRows = [...Array(5)].map( (_, i) =>
    ({ row: `<tr><td>#${i+1}</td><td>cell ${i+1}.1</td><td>cell ${i+1}.2</td></tr>`}) );
  const tbl = $SB`{row}`
    .interpolate(...someRows)
    .prepend(`<table>{head}`)
    .interpolate({head: `<tr><th>#</th><th>col1</th><th>col2</th></tr>`})
    .append(`</table>`);
  const repX = escHtml("const tbl = $SB`{row}`##\
    .interpolate(...someRows)##\
    .prepend(`<table>{head}`)##\
    .interpolate({##\
      head: `<tr><th>#</th><th>col1</th><th>col2</th></tr>`})##\
    .append(`</table>`);")
    .replace(/##/g, `<br>`);
  const repY = `const someRows = [...Array(5)].map( (_, i) =>
  ( { row: ${escHtml(`\`<tr><td>#\${i+1}</td><td>cell \${
      i+1}.1</td><td>cell \${i+1}.2</td></tr>\``)} } );`;
  log(
    toCode(`${repY}<br>${repX}`, true),
    `${toCode(`tbl`)} =&gt; ${tbl}`);

  log(`!!<h3>Available custom getters and methods of a $SB instance</h3>
      <div>These are the 'extensions' one can use for a $SB instance.
      One can also use all (<i>not deprecated</i>) native
      <a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String"
      >String methods</a>. The result of these native methods can mostly be
      <a target="_blank" href="https://www.geeksforgeeks.org/method-chaining-in-javascript/">chained</a>.</div>`,
     `${toCode("$SB.describe")} =>
     <div class="local">${describe2HTML()}</div>`);

  styleIt();
  embed();

  log(`!!<button id="perfBttn">performance</button>`);
  $(`#perfBttn`).on(`click`, () => {
    $.Popup.show({ content: `<b>Working on it...</b>`, modal: true });
    setTimeout(_ => ($.Popup.removeModal(), testPerformance()), 10);
  });

  spacer();
}

function describe2HTML() {
  return `<ul class="sub"><li>${$SB.describe.map( v => {
    const [key, descr] = v.split(`[`);
    return `<code>${key.trim()}</code> [${descr}`;
  } ).join(`</li><li>`)}</li>`;
}

function testPerformance(n = 100_000) {
  let perf = performance.now();
  let str;
  for (let i = 0; i < n; i += 1) {
    str = $SB`hello world`.repeat(5).toUpperCase();
  }
  
  perf = performance.now() - perf;
  const sum = +(perf/1000).toFixed(3);
  let result = `<b>Performance</b>
    <div>Created ${n.toLocaleString()} instances using ${toCode("$SB`hello world`.repeat(5).toUpperCase()")}
    <br>=&gt; x̄ ${(perf/n/1000).toFixed(8)} seconds/instance, Σ ${
      sum.toLocaleString()} seconds</div>`;
  str = undefined;

  perf = performance.now();
  let something = $SB``;
  
  for (let i = 0; i < n; i += 1) {
    something.prepend(`hello `).append(`world`);
  }

  perf = performance.now() - perf;
  const sum2 = +(perf/1000).toFixed(3);
  result +=
    `<p>${n.toLocaleString()} times ${toCode("[instance].prepend(`hello `).append(`world`)")}
    <br>=&gt; x̄ ${(perf/n/1000).toFixed(8)} seconds/operation, Σ ${
      sum2.toLocaleString()} seconds</p>`;
  something = undefined;
  $.Popup.removeModal();
  $.Popup.show({content: result});
}

function styleIt() {
  $.editCssRules(
    `table { display: inline-block; vertical-align: text-top; border-collapse: collapse; }`,
    `td, th { border: 1px solid #c0c0c0}; padding: 0 4px;`,
    `#log2screen li div { font-family: 'gill sans', system-ui; }`,
    `code, div.local { font-family: roboto, monospace; }`,
    `.head div, .head p { font-weight: normal; padding-right: 2rem; }`,
    `.head h3 { margin-bottom: 0.3rem; }`,
    `div.q { display: inline-block;
      padding: 0 6rem 0px 2rem;
      font-family: Georgia, verdana;
      font-style: italic;
      color: #777; }`,
    `div.q:before {
      font-family: Georgia, verdana;
      content: '\\201C';
      position: absolute;
      font-size: 2rem;
      color: #c0c0c0;
      margin-left: -2rem;
      margin-top: 0.5rem;
     }`,
    `div.q::after {
      font-family: Georgia, verdana;
      content: '\\201D';
      margin-left: 1rem;
      font-size: 2rem;
      margin-top: 0.5rem;
      position: absolute;
      display: inline-block;
      color: #c0c0c0; }`, );
}

function embed() {
  $.editCssRules(
    `.container {
      inset: 0;
      position: absolute;
    }`,
    `#log2screen {
      max-width: 50vw;
      margin: 0 auto;
      @media (max-width: 1024px) {
        max-width: 90vw;
      }
      @media (min-width: 1024px) and (max-width: 1200px) {
        max-width: 80vw;
      }
      @media (min-width: 1200px) and (max-width: 1600px) {
        max-width: 70%;
      }
    }`,
  );
  $.div({cssClass: `container`, toDOM: 1}).append($(`#log2screen`));
}