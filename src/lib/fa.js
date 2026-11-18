// Persian digit helpers. The book writes the decimal separator as "/" (e.g. ۰/۷۵).
const FA = '۰۱۲۳۴۵۶۷۸۹';
const AR = '٠١٢٣٤٥٦٧٨٩';

/** digits -> Persian digits (leaves everything else alone) */
export const faDigits = (v) => String(v).replace(/[0-9]/g, (d) => FA[d]);

/** a number-like string -> Persian digits, "." -> "/" */
export const faNum = (v) => faDigits(String(v).replace(/\./g, '/'));

/** Persian/Arabic digits and "/" or "٫" separators -> ASCII "1234." */
export const toAscii = (s) =>
  String(s)
    .replace(/[۰-۹]/g, (d) => String(FA.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(AR.indexOf(d)))
    .replace(/[\/٫,]/g, '.');

/** Free text with numbers inside ("0.2 یعنی 2 ستون") -> Persian digits, decimal point as "/" */
export const faText = (s) => faDigits(String(s).replace(/(\d)\.(\d)/g, '$1/$2'));
