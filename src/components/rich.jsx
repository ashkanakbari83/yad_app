import { Fragment } from 'react';
import { Frac } from './ui.jsx';
import { faText } from '../lib/fa.js';

/** Child-facing text -> nodes. "{7|10}" becomes a stacked fraction, so a fraction is never confused
 *  with the "/" decimal sign; everything else goes through faText (Persian digits, "/" as point). */
export function rich(s) {
  if (typeof s !== 'string') return s;
  return s.split(/(\{[^|{}]+\|[^|{}]+\})/).map((part, i) => {
    const m = /^\{([^|{}]+)\|([^|{}]+)\}$/.exec(part);
    return m ? <Frac key={i} n={faText(m[1])} d={faText(m[2])} size={0.95} /> : <Fragment key={i}>{faText(part)}</Fragment>;
  });
}
