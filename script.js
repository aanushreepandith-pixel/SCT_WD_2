/**
 * Calculator Web Application
 * Features: DOM manipulation, event listeners, keyboard input, error handling
 */

const calc = (() => {

  /* ── State ── */
  let current            = '0';   // number currently on screen
  let previous           = '';    // left-hand operand
  let operator           = null;  // pending operator  (+, -, *, /)
  let freshResult        = false; // true right after pressing =
  let waitingForOperand  = false; // true after an operator is pressed → next digit starts fresh

  /* ── DOM References ── */
  const mainEl = document.getElementById('mainDisplay');
  const histEl = document.getElementById('histLine');

  /* ── Helpers ── */

  // Format number with thousands commas
  function format(n) {
    let s = String(n);
    if (s.includes('e')) return s;           // leave scientific notation as-is
    const [int, dec] = s.split('.');
    const intFormatted = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return dec !== undefined ? intFormatted + '.' + dec : intFormatted;
  }

  // Map operator symbol to display glyph
  const glyphs = { '+': '+', '-': '−', '*': '×', '/': '÷' };

  // Remove active highlight from all operator buttons
  function clearActiveOps() {
    ['+', '-', '*', '/'].forEach(o => {
      document.getElementById('op-' + o)?.classList.remove('active-op');
    });
  }

  /* ── Render ── */
  function render(isResult = false) {
    const text = format(current);

    // Adjust font size for long numbers
    const rawLen = text.replace(/[,.\-]/g, '').length;
    if (rawLen > 9)     mainEl.style.fontSize = '26px';
    else if (rawLen > 7) mainEl.style.fontSize = '34px';
    else                 mainEl.style.fontSize = '42px';

    mainEl.textContent = text;

    if (isResult) {
      mainEl.classList.add('has-result');
      // Restart pop animation
      mainEl.classList.remove('result-pop');
      void mainEl.offsetWidth;           // force reflow
      mainEl.classList.add('result-pop');
    } else {
      mainEl.classList.remove('has-result');
    }
  }

  /* ── Compute ── */
  function compute() {
    const a = parseFloat(previous.replace(/,/g, ''));
    const b = parseFloat(current.replace(/,/g, ''));
    if (isNaN(a) || isNaN(b)) return null;

    switch (operator) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return b === 0 ? null : a / b;
      default:  return null;
    }
  }

  /* ── Error display ── */
  function showError(msg = 'Error') {
    current      = msg;
    operator     = null;
    previous     = '';
    freshResult  = true;
    histEl.textContent     = '';
    mainEl.textContent     = msg;
    mainEl.classList.remove('has-result');
    mainEl.classList.add('error-flash');
    setTimeout(() => mainEl.classList.remove('error-flash'), 400);
  }

  /* ── Public API ── */
  return {

    // Append a digit character to current number
    digit(d) {
      if (freshResult || waitingForOperand) {
        // Start a brand-new number after = or after an operator
        current            = d;
        freshResult        = false;
        waitingForOperand  = false;
      } else {
        const raw = current.replace(/,/g, '');
        if (raw.length >= 12) return;         // max 12 digits
        current = (current === '0') ? d : current + d;
      }
      render();
    },

    // Append decimal point
    dot() {
      if (freshResult || waitingForOperand) {
        current           = '0.';
        freshResult       = false;
        waitingForOperand = false;
        render();
        return;
      }
      if (!current.includes('.')) current += '.';
      render();
    },

    // Set the pending operator
    setOp(op) {
      // If an operator is already pending, compute intermediate result first
      if (operator && !freshResult) {
        const result = compute();
        if (result === null) { showError(); return; }

        const resultStr = parseFloat(result.toPrecision(12)).toString();
        histEl.textContent = format(current) + ' ' + glyphs[operator];
        current  = resultStr;
        previous = resultStr;
        render();
      } else {
        previous = current;
      }

      operator          = op;
      freshResult       = false;
      waitingForOperand = true;  // next digit must start a fresh number

      clearActiveOps();
      document.getElementById('op-' + op)?.classList.add('active-op');
      histEl.textContent = format(previous) + ' ' + glyphs[op];
    },

    // Calculate result
    equals() {
      if (!operator || previous === '') return;

      const result = compute();
      if (result === null) { showError('Div / 0'); return; }

      const resultStr = parseFloat(result.toPrecision(12)).toString();
      histEl.textContent =
        format(previous) + ' ' + glyphs[operator] + ' ' + format(current) + ' =';

      current           = resultStr;
      operator          = null;
      previous          = '';
      freshResult       = true;
      waitingForOperand = false;
      clearActiveOps();
      render(true);
    },

    // Clear / reset everything
    clear() {
      current           = '0';
      previous          = '';
      operator          = null;
      freshResult       = false;
      waitingForOperand = false;
      histEl.textContent = '';
      clearActiveOps();
      render();
    },

    // Toggle positive / negative
    toggleSign() {
      if (current === '0' || current === 'Error') return;
      current = current.startsWith('-') ? current.slice(1) : '-' + current;
      render();
    },

    // Convert to percentage
    percent() {
      const n = parseFloat(current.replace(/,/g, ''));
      if (isNaN(n)) return;
      current = parseFloat((n / 100).toPrecision(12)).toString();
      render();
    }
  };
})();

/* ── Keyboard Input Handler ── */
document.addEventListener('keydown', (e) => {
  if (e.key >= '0' && e.key <= '9') {
    calc.digit(e.key);
  } else if (e.key === '.') {
    calc.dot();
  } else if (e.key === '+') {
    calc.setOp('+');
  } else if (e.key === '-') {
    calc.setOp('-');
  } else if (e.key === '*') {
    calc.setOp('*');
  } else if (e.key === '/') {
    e.preventDefault();            // stop browser's quick-find
    calc.setOp('/');
  } else if (e.key === 'Enter' || e.key === '=') {
    calc.equals();
  } else if (e.key === 'Escape') {
    calc.clear();
  } else if (e.key === '%') {
    calc.percent();
  }
});