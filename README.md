# **SCT_WD_2**
🧮 **Calculator Web Application**

A fully functional, beautiful calculator built with HTML, CSS, and JavaScript.
Developed as Task 02 (Alternative) for the SkillCraft Technology internship program.

📁 **Project Structure**

calculator/

├── index.html   → Page structure & button layout

├── style.css    → Styling, theme, animations

├── script.js    → Calculator logic & keyboard support

└── README.md    → Project documentation


✨ **Features**

✅ Basic arithmetic — Addition, Subtraction, Multiplication, Division

✅ Decimal point input

✅ Percentage (%) conversion

✅ Positive / Negative toggle (+/−)

✅ Chained operations (e.g. 2 + 3 × 4)

✅ History line showing the running expression

✅ Division by zero error handling

✅ Full keyboard support

✅ Responsive font size for long numbers


🧩 **Technologies Used**

HTML5 — Semantic structure, button grid

CSS3 — Custom properties, Grid layout, transitions, keyframe animations

JavaScript  —  DOM API, keyboard events


**Event Listeners**

Each button → onclick handler

Global document.addEventListener('keydown', ...) for keyboard support

**Error Handling**

Division by zero → displays Div / 0 with a red flash animation

Input capped at 12 digits to prevent overflow
