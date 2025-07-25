import { initSentry } from './sentry';

initSentry();

/* eslint-disable no-console, prefer-rest-params, @typescript-eslint/ban-ts-comment */
// https://github.com/facebook/react/issues/11538#issuecomment-417504600
if (typeof Node === 'function' && Node.prototype) {
  const originalRemoveChild = Node.prototype.removeChild;
  const originalInsertBefore = Node.prototype.insertBefore;

  // @ts-ignore
  Node.prototype.removeChild = function (child) {
    if (child.parentNode !== this) {
      if (console) {
        console.error('Cannot remove a child from a different parent', child, this);
      }

      return child;
    }

    // @ts-ignore
    return originalRemoveChild.apply(this, arguments);
  };

  // @ts-ignore
  Node.prototype.insertBefore = function (newNode, referenceNode) {
    if (referenceNode && referenceNode.parentNode !== this) {
      if (console) {
        console.error('Cannot insert before a reference node from a different parent', referenceNode, this);
      }

      return newNode;
    }

    // @ts-ignore
    return originalInsertBefore.apply(this, arguments);
  };
}
