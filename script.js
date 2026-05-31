/**
 * Calculator Web Application — script.js
 *
 * Display shows the FULL expression at all times:
 *   typing  →  "4"
 *   + pressed →  "4 +"
 *   typing  →  "4 + 4"
 *   = pressed →  "4 + 4 = 8"
 */

const calc = (() => {

  /* ── State ── */
  let left             = '';      // left-hand number (string)
  let right            = '';      // right-hand number (string)
  let operator         = '';      // '+' '-' '*' '/'
  let resultShown      = false;   // true after = is pressed

  /* ── DOM ── */
  const exprEl = document.getElementById('exprLine');

  /* ── Glyph map ── */
  const glyphs = { '+': '+', '-': '−', '*': '×', '/': '÷' };

  /* ── Format: add thousands commas ── */
  function fmt(str) {
    if (!str || str === '-') return str;
    const neg  = str.startsWith('-');
    const abs  = neg ? str.slice(1) : str;
    const [int, dec] = abs.split('.');
    const intFmt = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const result = dec !== undefined ? intFmt + '.' + dec : intFmt;
    return neg ? '−' + result : result;
  }

  /* ── Build and render the expression string ── */
  function render(showResult = false) {
    let html = '';

    if (showResult) {
      // Full expression:  4 + 4 = 8
      const resultVal = compute();
      const resultStr = resultVal !== null
        ? parseFloat(resultVal.toPrecision(12)).toString()
        : null;

      html =
        '<span class="num-token">'  + fmt(left)  + '</span>' +
        '<span class="op-token"> '  + glyphs[operator] + ' </span>' +
        '<span class="num-token">'  + fmt(right) + '</span>' +
        '<span class="op-token"> = </span>' +
        '<span class="res-token">'  + (resultStr !== null ? fmt(resultStr) : 'Error') + '</span>';

      exprEl.classList.add('has-result');
      exprEl.classList.remove('result-pop');
      void exprEl.offsetWidth;
      exprEl.classList.add('result-pop');

    } else if (operator) {
      // Partial expression:  "4 +"  or  "4 + 4"
      html =
        '<span class="num-token">'  + fmt(left)  + '</span>' +
        '<span class="op-token"> '  + glyphs[operator] + ' </span>' +
        (right ? '<span class="num-token">' + fmt(right) + '</span>' : '');

      exprEl.classList.remove('has-result');

    } else {
      // Just the current number being entered
      html = '<span class="num-token">' + (fmt(left) || '0') + '</span>';
      exprEl.classList.remove('has-result');
    }

    // Auto-shrink font for long expressions
    const rawLen = (left + operator + right).length;
    if      (rawLen > 16) exprEl.style.fontSize = '20px';
    else if (rawLen > 12) exprEl.style.fontSize = '26px';
    else if (rawLen > 8)  exprEl.style.fontSize = '30px';
    else                  exprEl.style.fontSize = '36px';

    exprEl.innerHTML = html;
  }

  /* ── Compute left op right ── */
  function compute() {
    const a = parseFloat(left.replace(/,/g, ''));
    const b = parseFloat(right.replace(/,/g, ''));
    if (isNaN(a) || isNaN(b)) return null;
    switch (operator) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return b === 0 ? null : a / b;
      default:  return null;
    }
  }

  /* ── Remove active highlight from all op buttons ── */
  function clearActiveOps() {
    ['+', '-', '*', '/'].forEach(o =>
      document.getElementById('op-' + o)?.classList.remove('active-op')
    );
  }

  /* ── Error ── */
  function showError() {
    exprEl.innerHTML = '<span style="color:var(--accent-red)">Error</span>';
    exprEl.classList.add('error-flash');
    setTimeout(() => exprEl.classList.remove('error-flash'), 400);
    left = ''; right = ''; operator = ''; resultShown = false;
    clearActiveOps();
  }

  /* ══ Public API ══ */
  return {

    digit(d) {
      if (resultShown) {
        // Start fresh after a completed  a op b = result
        left = d; right = ''; operator = ''; resultShown = false;
        clearActiveOps();
      } else if (operator) {
        // Typing the right-hand number
        if (right.replace('-','').length >= 12) return;
        right = (right === '0') ? d : right + d;
      } else {
        // Typing the left-hand number
        if (left.replace('-','').length >= 12) return;
        left = (left === '0' || left === '') ? d : left + d;
      }
      render();
    },

    dot() {
      if (resultShown) {
        left = '0.'; right = ''; operator = ''; resultShown = false;
        clearActiveOps(); render(); return;
      }
      if (operator) {
        if (!right.includes('.')) right = (right === '' ? '0' : right) + '.';
      } else {
        if (!left.includes('.'))  left  = (left  === '' ? '0' : left)  + '.';
      }
      render();
    },

    setOp(op) {
      if (resultShown) {
        // Chain from a previous result: use the result as new left
        const r = compute();
        if (r !== null) left = parseFloat(r.toPrecision(12)).toString();
        right = ''; resultShown = false;
      } else if (operator && right !== '') {
        // Chained operation: evaluate what we have, use as new left
        const r = compute();
        if (r === null) { showError(); return; }
        left  = parseFloat(r.toPrecision(12)).toString();
        right = '';
      }
      operator = op;
      clearActiveOps();
      document.getElementById('op-' + op)?.classList.add('active-op');
      render();
    },

    equals() {
      if (!operator || left === '' || right === '') return;
      const r = compute();
      if (r === null) { showError(); return; }
      render(true);   // shows  left op right = result
      // Store result as left so chaining works
      left         = parseFloat(r.toPrecision(12)).toString();
      resultShown  = true;
      clearActiveOps();
    },

    clear() {
      left = ''; right = ''; operator = ''; resultShown = false;
      clearActiveOps();
      exprEl.classList.remove('has-result');
      exprEl.style.fontSize = '36px';
      exprEl.innerHTML = '<span class="num-token">0</span>';
    },

    toggleSign() {
      if (operator) {
        if (right === '' || right === '0') return;
        right = right.startsWith('-') ? right.slice(1) : '-' + right;
      } else {
        if (left === '' || left === '0') return;
        left = left.startsWith('-') ? left.slice(1) : '-' + left;
      }
      render();
    },

    percent() {
      if (operator) {
        const n = parseFloat(right);
        if (isNaN(n)) return;
        right = parseFloat((n / 100).toPrecision(12)).toString();
      } else {
        const n = parseFloat(left);
        if (isNaN(n)) return;
        left = parseFloat((n / 100).toPrecision(12)).toString();
      }
      render();
    }
  };

})();

/* ── Keyboard Support ── */
document.addEventListener('keydown', (e) => {
  if (e.key >= '0' && e.key <= '9') calc.digit(e.key);
  else if (e.key === '.')            calc.dot();
  else if (e.key === '+')            calc.setOp('+');
  else if (e.key === '-')            calc.setOp('-');
  else if (e.key === '*')            calc.setOp('*');
  else if (e.key === '/') { e.preventDefault(); calc.setOp('/'); }
  else if (e.key === 'Enter' || e.key === '=') calc.equals();
  else if (e.key === 'Escape')       calc.clear();
  else if (e.key === '%')            calc.percent();
});