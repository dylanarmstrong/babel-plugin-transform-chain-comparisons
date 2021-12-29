/**
 * Chain comparators like Python
 * https://docs.python.org/3/reference/expressions.html#comparisons
 *
 * This works by modifying how babel currently interpets these
 * as a nested binary expression on the left
*/

const { declare } = require('@babel/helper-plugin-utils');
const { types: t } = require('@babel/core');

module.exports = declare((api, options) => {
  api.assertVersion(7);

  return {
    name: 'transform-chain-comparisons',
    visitor: {
      BinaryExpression: function(path) {
        const { left, operator, right } = path.node;
        // Look for a nested BinaryExpression
        if (t.isBinaryExpression(left)) {
          // Avoid calling methods twice by creating variable
          // left.left will not be called twice, but left.right will
          // be as it will be placed in second BinaryExpression
          const id = path.scope.generateUidIdentifierBasedOnNode(path.node.id);
          let variable = null;
          if (t.isCallExpression(left.right) || t.isNewExpression(left.right)) {
            variable = t.variableDeclaration(
              'const',
              [
                t.variableDeclarator(
                  id,
                  left.right,
                ),
              ],
            );
          }

          path.replaceWith(
            t.logicalExpression(
              '&&',
              variable === null
                ? t.cloneNode(left)
                : t.binaryExpression(
                  left.operator,
                  t.cloneNode(left.left),
                  id,
                ),
              t.binaryExpression(
                operator,
                variable === null ? t.cloneNode(left.right) : id,
                t.cloneNode(right),
              ),
            ),
          );

          if (variable !== null) {
            path.getStatementParent().insertBefore(variable);
          }
        }
      },
    },
  };
});
