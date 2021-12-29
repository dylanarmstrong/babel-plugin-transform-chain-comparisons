const { transform } = require('@babel/core');

const options = {
  plugins: [
    './lib/index.js',
  ],
};

// Small wrapper to avoid unnecessary code
const t = (s) => transform(s, options).code;

test('a == a == b', () => {
  expect(t('a == a == b')).toBe('a == a && a == b;');
});

test('a != b != c', () => {
  expect(t('a != b != c')).toBe('a != b && b != c;');
});

test('a < b > c', () => {
  expect(t('a < b > c')).toBe('a < b && b > c;');
});

test('a < await b', () => {
  expect(t('a < await b')).toBe('a < (await b);');
});

test('a < await b < c', () => {
  expect(t('a < await b < c')).toBe('a < (await b) && (await b) < c;');
});

// FIXME: this should be pulled into ref
test.skip('a < await f() < c', () => {
  expect(t('a < await f() < c')).toBe(
    `const _ref = await f();

a < _ref && _ref < c;`);
});

test('a < b < c', () => {
  expect(t('a < b < c')).toBe('a < b && b < c;');
});

test('a < f() < c', () => {
  expect(t('a < f() < c')).toBe(
    `const _ref = f();

a < _ref && _ref < c;`);
});

test('a < f() < g()', () => {
  expect(t('a < f() < g()')).toBe(
    `const _ref = f();

a < _ref && _ref < g();`);
});

test('f() < g() < h()', () => {
  expect(t('f() < g() < h()')).toBe(
    `const _ref = g();

f() < _ref && _ref < h();`);
});

// Still calls function same number of times
test('f() < f() < f()', () => {
  expect(t('f() < f() < f()')).toBe(
    `const _ref = f();

f() < _ref && _ref < f();`);
});

// This is just an annoying caveat
test('function sets value, f() < g() < g()', () => {
  expect(t(`
    let a = 0;
    const f = (n) => { a = n + 1; return -n; };
    const g = () => a;
    f(10) < g() < a;
  `)).toBe(`let a = 0;

const f = n => {
  a = n + 1;
  return -n;
};

const g = () => a;

const _ref = g();

f(10) < _ref && _ref < a;`);
});
