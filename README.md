# babel-plugin-transform-chain-operators

Add chained comparison operators like
[Python](https://docs.python.org/c/reference/expressions.html#comparisons)

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
if (a < f() < g()) {}
// Transform
const ref1 = f();
if (a < ref1 && ref1 < g()) {}

// Original
if (f() < g() < h()) {}
const ref1 = g();
if (f() < ref1 && ref1 < h()) {}
```

## Caveats:
1. `a != b != c` does not imply a != c
2. await operators are finicky, `a < await f() < b`
3. ```
// As the second value is kept in a variable to avoid
// Calling it twice, that value can be wrong if
// It depends on a value called by the first variable
// Original
let a = 0;
const f = (n) => { a = n + 1; return -n; };
const g = () => a;
f(10) < g() < a;

// Transform:
```
