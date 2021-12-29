# babel-plugin-transform-chain-operators

Add chained comparison operators like
[Python](https://docs.python.org/3/reference/expressions.html#comparisons)

## Install
```
npm install @dylanarmstrong/babel-plugin-transform-chain-comparisons
```

## Setup
In your `babel.config.json`, place the following:

```
  "plugins": [
    "@dylanarmstrong/babel-plugin-transform-chain-comparisons"
  ]
```

## Examples:
```
// Original
if (a < b < c) {}
// Transform
if (a < b && b < c) {}

// Original
if (a != b != c) {}
// Transform
if (a != b && b != c) {}

// Original
if (a < f() < g()) {}
// Transform
const ref1 = f();
if (a < ref1 && ref1 < g()) {}

// Original
if (f() < g() < h()) {}
// Transform
const ref1 = g();
if (f() < ref1 && ref1 < h()) {}
```

## Caveats:
1. `a != b != c` does not imply `a != c`
2. await operators are finicky, `a < await f() < b` will call `await f()` twice
   at the moment. This is intended to be fixed.
3. Functions cannot change a value that is relied on in a subsequent statement
  `f(10) < g() < c` with `c = 2`, `b = 1; g = () => b;`, and
  `f = (n) => { b = n; return 0; }`.
   This is because the expression `g()` is cached before any BinaryExpression
   is called. This is done intentionally to avoid double calling the `g()`
   method.
