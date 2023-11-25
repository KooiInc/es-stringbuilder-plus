## Ecmascript String Builder PLUS

`es-stringbuilder-plus` delivers a way to build a string (actually 
a custom `String` instance making its internal string value <i>mutable</i>).

Instances can use native String methods and a number of custom methods.
<b>ES string builder PLUS</b> is programmed in a 
[class free object oriented](https://depth-first.com/articles/2019/03/04/class-free-object-oriented-programming) way.

### All instance getters and methods
<ul>
  <li><code>append(str2Append, ...args)</code> [mutates, chainable]</li>
  <li><code>at(pos)</code> [returns a value (not mutating)]</li>
  <li><code>charAt(pos)</code> [returns a value (not mutating)]</li>
  <li><code>clear</code> [getter, mutates, chainable]</li>
  <li><code>clone</code> [getter, chainable]</li>
  <li><code>concat(...args)</code> [mutates, chainable]</li>
  <li><code>empty</code> [getter, mutates, chainable]</li>
  <li><code>extract(start, end)</code> [mutates, chainable]</li>
  <li><code>firstUp</code> [getter, mutates, chainable]</li>
  <li><code>indexOf(...args)</code> [returns a value (not mutating)]</li>
  <li><code>interpolate(...replacementTokens)</code> [mutates, chainable]</li>
  <li><code>is(newValue, ...args)</code> [mutates, chainable]</li>
  <li><code>lastIndexOf(...args)</code> [returns a value (not mutating)]</li>
  <li><code>length</code> [getter, returns a value (not mutating)]</li>
  <li><code>normalize()</code> [mutates, chainable]</li>
  <li><code>nthIndexOf(term2Find, nth)</code> [returns a value (not mutating)]</li>
  <li><code>padEnd(...args)</code> [mutates, chainable]</li>
  <li><code>padStart(...args)</code> [mutates, chainable]</li>
  <li><code>prepend(str2Prepend, ...args)</code> [mutates, chainable]</li>
  <li><code>prototype</code> [returns a value (not mutating)]</li>
  <li><code>quot(quotes = `","`)</code> [mutates, chainable]</li>
  <li><code>quot4Print(quotes = `","`)</code> [returns a value (not mutating)]</li>
  <li><code>remove(start, end)</code> [mutates, chainable]</li>
  <li><code>repeat(...args)</code> [mutates, chainable]</li>
  <li><code>replace(...args)</code> [mutates, chainable]</li>
  <li><code>replaceAll(...args)</code> [mutates, chainable]</li>
  <li><code>reset</code> [getter, mutates, chainable]</li>
  <li><code>slice(...args)</code> [mutates, chainable]</li>
  <li><code>substring(...args)</code> [mutates, chainable]</li>
  <li><code>toCamel</code> [getter, mutates, chainable]</li>
  <li><code>toDashed</code> [getter, mutates, chainable]</li>
  <li><code>toLocaleLowerCase()</code> [mutates, chainable]</li>
  <li><code>toLocaleUpperCase()</code> [mutates, chainable]</li>
  <li><code>toLower</code> [getter, mutates, chainable]</li>
  <li><code>toLowerCase()</code> [mutates, chainable]</li>
  <li><code>toString()</code> [returns a value (not mutating)]</li>
  <li><code>toUpper</code> [getter, mutates, chainable]</li>
  <li><code>toUpperCase()</code> [mutates, chainable]</li>
  <li><code>toWellFormed()</code> [mutates, chainable]</li>
  <li><code>trim()</code> [mutates, chainable]</li>
  <li><code>trimEnd()</code> [mutates, chainable]</li>
  <li><code>trimStart()</code> [mutates, chainable]</li>
  <li><code>truncate(at, { html = false, wordBoundary = false } = {} )</code> [mutates, chainable]</li>
  <li><code>value</code> [getter, setter (mutates)]</li>
  <li><code>valueOf()</code> [returns a value (not mutating)]</li>
  <li><code>wordsUp</code> [getter, mutates, chainable]</li>
</ul>