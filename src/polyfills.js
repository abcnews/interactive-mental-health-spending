// Polyfills
import 'core-js/features/symbol';
import 'regenerator-runtime/runtime.js';
import 'intersection-observer';
import 'polyfill-array-includes';
import 'nodelist-foreach-polyfill';

if (!String.prototype.startsWith) {
  Object.defineProperty(String.prototype, 'startsWith', {
    value: function (search, rawPos) {
      var pos = rawPos > 0 ? rawPos | 0 : 0;
      return this.substring(pos, pos + search.length) === search;
    },
  });
}
