## ECMAScript String Builder PLUS

`es-stringbuilder-plus` delivers a way to build a string (actually 
a wrapped `String` instance delivering a <i>mutable</i> string value).

Instances can use native String methods and a number of custom methods to change 
their internal value without the need for re-assigning.

<b>ECMAScript (ES) string builder PLUS</b> is programmed in a 
[class free object oriented](https://depth-first.com/articles/2019/03/04/class-free-object-oriented-programming) way.

[**DEMO & Tests**](https://kooiinc.github.io/es-stringbuilder-plus/Demo/)

Also on [NPM](https://www.npmjs.com/package/esstringbuilderplus)

### All custom instance getters and methods

**Notes** 
- The code follows [ES20XX](https://tc39.es/ecma262/2023/), so will work with all up to date modern browsers 
  and/or within later nodejs versions. 
- All (*not deprecated*)
  <a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String">native String methods</a>
  (e.g. `toUpperCase`) are converted and usable in the same way you would use them for a regular string.
- A string builder instance can be created using the imported 'constructor' (let's call it `$SB`).
  `$SB` can be called either as a regular function (e.g. `$SB("some string")`) or as a 
  [tagged template](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates)
  (e.g ``$SB`some string` ``). It can only receive a String or a Number. Any other parameter type will result in an instance 
  with an empty string as its value.
- ES String Builder PLUS is a lightweight stand alone module. We also have the more comprehensive [es-string-fiddler](https://github.com/KooiInc/es-string-fiddler) 
  module available. 
  That module delivers more functionality, e.g. methods to sanitize HTML strings, create Regular Expressions
  from multiline strings and extend the constructor with ones own custom methods.
- In the following the *custom* getters and methods of an instance are described. 
  - With 'value' the current value of a string builder instance is meant.
  - Value changing (mutating) getters and methods of an instance and the results of native String method calls are 'chainable'.
  - [Chainable](https://www.geeksforgeeks.org/method-chaining-in-javascript/) means the result can be followed by a new getter-/method-call (e.g. `[instance].toUpperCase().quot("[,]")`).
- The constructor enables creating user defined extensions, using `[constructor].addExtension`. 
  - syntax: `[constructor]..addExtension(name: string, function(me: instance, [...arguments]) {...}): function)`     
    when `...arguments` is empty, the extension will be a getter. Otherwise it will be a method. The first parameter
    is the instance to apply the extension function to. It is obligatory and must always be the first argument of 
    the extension function. The return value of the extension *function* may be a string or the (modified) instance.
    The user defined extension *method* for an instance returns itself. Thus it is is always chainable.
  - example 1 (`$SB` is the constructor):  
    ``$SB.addExtension(`sayOk`, me => me.prepend(`*OK* `));``  
    `sayOk` is now a getter
    ``const test = $SB`test123`.sayOk`` => `test.value`: "*OK * test123"
  - example 2:  
      ``$SB.addExtension(`replaceNumbersWith`, (me, replacement) => me.replace(/\d/g, replacement));``    
      ``const test = $SB`test123 4567`.replaceNumbersWith(0)`` => `test.value` => "test000 0000"  
      ``const test = $SB`test123 4567`.replaceNumbersWith(a => +a < 5 ? 0 : a)`` => `test.value` => "test000 0567"
      ``$SB.addExtension(`replaceFirstWord`, (me, replacement) =>``    
      &nbsp;&nbsp;&nbsp;&nbsp;``(me.indexOf(" ") ? replacement : "" ) + me.value.slice(me.indexOf(` `));``  
      ``const test = $SB`test123 4567`.replaceFirstWord(`123`)`` => `test.value` => "123 456"  
      ``const test = $SB`test1234567`.replaceFirstWord(`123`)`` => `test.value` => "test123456" 
---

- `append(str2Append)` [*mutates, chainable*] Appends [`str2Append`] to the value.
- `as(newValue)` [*mutates, chainable*] alias for `[instance].is`.
- `clear` [*getter, mutates, chainable*] Clears the value - effectively rendering it to an empty string.
- `clone` [*getter, chainable*] Creates a clone of the instance.
- `cloneWith(value: string or template string)` [*chainable*] Creates a clone of the instance. Either re-assign to
   a new value, or use as intermediate value. 
- `empty` [*getter, mutates, chainable*] Alias of `clear`. Clears the value, effectively rendering it to an empty string.
- `firstUp` [*getter, mutates, chainable*] Convert the first letter of the value to uppercase.
- `indexOf(stringToFindIndexOf: string|RegExp, [startPosition]: int)` [*native (override), returns a value (not mutating)*]   
   Returns the (zero based) index of the substring to find (optional starting at `[startPosition]`)  
   or `undefined` (instead of -1) when nothing was found. Furthermore `[stringToFindIndexOf]` may be a regular expression.
- `initial` [*getter, returns a value (not mutating)*] Retrieves the value the instance was instantiated with (see also `reset`). 
- `interpolate(...replacementTokens)` [*mutates, chainable*]
   Interpolates terms from the value with one or more replacement objects (`[replacementTokens]`). 
   see the GitHub [StringInterpolator](https://github.com/KooiInc/StringInterpolator) library or the demo for how to use.  
- `is(newValue: string/template string))` [*mutates, chainable*] Assigns `[newValue]` to the value.

  **Notes**: 
  - `[instance].is(...)` will *not* change the *initial instance value* (which is stored for use in `[instance].reset`).
  - to re-assign the instance value one can also use the setter `[instance].value = ...`
- `lastIndexOf(stringToFindIndexOf: string|RegExp, [beforePosition]: int)` [*native (override), returns a value (not mutating)*]   
  Returns the (zero based) index of the substring to find (optional before `[beforePosition]` in the string)  
  or `undefined` (instead of -1) when nothing was found. Furthermore `[stringToFindIndexOf]` may be a regular expression.
- `prepend(str2Prepend: string/template string)` [*mutates, chainable*]  inserts `[str2Prepend]` before the value.
- `quot(quotes = '"')` [*mutates, chainable*] Adds `[quotes]` to the start and end of the value.
   `[quotes]` can be one character, or a string of two comma separated characters/string (e.g. `"[,]"` or `"*start*,*end*"`).    
- `quot4Print(quotes = '"')` [*returns a value (not mutating)*] Equal to `quot`, but will *not* change the value.  
   This will return the value surrounded with the given `[quotes]`, e.g. for printing to screen.  
- `remove(start: number, end: number)` [*mutates, chainable*] Removes the part of the value from `[start]` 
   to `[end]`. If neither  `[start]` and/or `[end]` are given, nothing will happen to the value. If one of
   `[start]` or `[end]` is not given, the defaults are respectively 0 or the length of the value.  
  `[end]` can be negative (meaning `[end]` characters from the end of the value). 
- `reset` [*getter, mutates, chainable*] Sets the value back to the value the instance was instantiated with.
- `surroundWith({r: string (default ""), [r: string (default "")]})` [*mutates, chainable*]  
   Surround the value with strings from `[l]`(eft) and `[r]`(ight).
- `reverse` [*getter, mutates, chainable*] Reverses the value (e.g. `hello` => `olleh`). 
   Including strings containing Unicode ['surrogate pairs'](http://zuga.net/articles/text-what-is-a-unicode-surrogate-pair/) 
- `toCamel` [*getter, mutates, chainable*] converts a value with pattern `aaa-bbb` to camelCased notation (`aaaBbb`). 
- `toDashed` [*getter, mutates, chainable*] converts a value with pattern `aaaBbbCcc` to dashed notation (`aaa-bbb-ccc`)
- `toLower` [*getter, mutates, chainable*] alias for `String.prototype.toLowerCase`.
- `toUpper` [*getter, mutates, chainable*] alias for `String.prototype.toUpperCase`.
- `truncate(at:number, { html = false, wordBoundary = false } = {} )` [*mutates, chainable*] 
   Truncates the value from its start to  `[at]` and adds either `...` (`[html]` false) 
   or `&hellip` (`[html]` true) to it. When `[wordBoundary]` is true, truncates at the last word
   within the truncated result.  
- `value` [*getter, setter (mutates)*] Retrieves the actual instance value or sets it.
- `wordsUp` [*getter, mutates, chainable*] converts all first letters of words within the value to uppercase
