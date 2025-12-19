document.addEventListener("DOMContentLoaded", () => {
    
    // --- Get DOM Elements ---
    const mainDisplay = document.getElementById("main-display");
    const expressionDisplay = document.getElementById("expression-display");
    const calculator = document.querySelector(".calculator");
    const calcContainer = document.querySelector(".calculator-container");
    const sciKeys = document.getElementById("scientific-keys");
    const sciToggle = document.getElementById("sci-toggle");
    
    // History Panel
    const historyPanel = document.getElementById("history-panel");
    const historyToggle = document.getElementById("history-toggle");
    const historyCloseBtn = document.getElementById("history-close-btn");
    const historyList = document.getElementById("history-list");
    const clearHistoryBtn = document.getElementById("clear-history-btn");

    // --- Calculator State ---
    let currentExpression = ""; // The full string to be evaluated
    let displayValue = "0";     // The value shown on the main display
    let lastResult = null;      // Stores the last calculated result
    let history = [];           // Array to store history items
    
    // --- Event Listeners ---
    
    // Listen for all button clicks on the calculator
    calculator.addEventListener("click", (e) => {
        const target = e.target;
        
        // Use dataset to get key value for non-button clicks (like <i> icons)
        const key = target.closest("button")?.dataset.key;
        const id = target.id;

        if (key) {
            // This is a button with a data-key
            handleKey(key);
        } else if (id === "clear") {
            handleKey("Delete");
        } else if (id === "backspace") {
            handleKey("Backspace");
        } else if (id === "equals") {
            handleKey("Enter");
        }
    });

    // Keyboard Support
    window.addEventListener("keydown", (e) => {
        // Prevent default behavior for keys we're handling
        if ([
            "Enter", "Backspace", "Delete", "+", "-", "*", "/", "s", "c",
            "t", "l", "n", "^", "r", "p", "e", "(", ")", "%", "."
        ].includes(e.key) || (e.key >= "0" && e.key <= "9")) {
            e.preventDefault();
            handleKey(e.key);
        }
    });

    // UI Toggles
    sciToggle.addEventListener("click", toggleSciMode);
    historyToggle.addEventListener("click", toggleHistoryPanel);
    historyCloseBtn.addEventListener("click", () => toggleHistoryPanel(false));
    clearHistoryBtn.addEventListener("click", clearHistory);

    // --- Main Key Handling Function ---
    function handleKey(key) {
        if (key >= "0" && key <= "9") {
            handleNumber(key);
        } else if (key === ".") {
            handleDecimal();
        } else if (["+", "-", "*", "/", "%", "^"].includes(key)) {
            handleOperator(key);
        } else if (["s", "c", "t", "l", "n", "r"].includes(key)) {
            handleFunction(key);
        } else if (["p", "e"].includes(key)) {
            handleConstant(key);
        } else if (key === "(" || key === ")") {
            handleParentheses(key);
        } else if (key === "Enter") {
            calculate();
        } else if (key === "Backspace") {
            handleBackspace();
        } else if (key === "Delete") {
            clearAll();
        }
        updateDisplay();
    }

    // --- Input Handlers ---

    function handleNumber(num) {
        if (displayValue === "0" || lastResult !== null) {
            displayValue = num;
        } else {
            displayValue += num;
        }
        currentExpression += num;
        lastResult = null;
    }

    function handleDecimal() {
        if (lastResult !== null) {
            displayValue = "0.";
            currentExpression = "0.";
            lastResult = null;
            return;
        }
        if (!displayValue.includes(".")) {
            displayValue += ".";
            currentExpression += ".";
        }
    }

    function handleOperator(op) {
        if (lastResult !== null) {
            currentExpression = lastResult.toString(); // Start new calc with last result
            lastResult = null;
        }
        
        // Add spaces for readability in the expression display
        currentExpression += ` ${op} `;
        displayValue = "0"; // Reset display for next number
    }

    function handleFunction(key) {
        const funcMap = {
            "s": "sin(", "c": "cos(", "t": "tan(",
            "l": "log(", "n": "ln(", "r": "sqrt("
        };
        currentExpression += funcMap[key];
        lastResult = null;
    }

    function handleConstant(key) {
        const constMap = { "p": "π", "e": "e" };
        currentExpression += constMap[key];
        lastResult = null;
    }

    function handleParentheses(paren) {
        currentExpression += paren;
        lastResult = null;
    }

    // --- Calculation & Clearing ---

    function calculate() {
        if (!currentExpression) return;
        
        try {
            // Prepare the expression for safe evaluation
            let evalExpression = prepareExpression(currentExpression);
            
            // Use Function constructor for safer evaluation than eval()
            const result = new Function('return ' + evalExpression)();

            if (isNaN(result) || !isFinite(result)) {
                throw new Error("Invalid calculation");
            }
            
            const formattedResult = parseFloat(result.toFixed(10));
            addHistory(currentExpression, formattedResult);
            
            displayValue = formattedResult.toString();
            currentExpression = formattedResult.toString(); // Allow chaining
            lastResult = formattedResult;

        } catch (error) {
            displayValue = "Error";
            currentExpression = "";
            lastResult = null;
        }
    }

    function prepareExpression(expr) {
        // Replaces user-friendly names with JavaScript Math object methods
        return expr
            .replace(/π/g, "Math.PI")
            .replace(/e/g, "Math.E")
            .replace(/sin\(/g, "Math.sin(Math.PI / 180 *") // Convert degrees to radians
            .replace(/cos\(/g, "Math.cos(Math.PI / 180 *")
            .replace(/tan\(/g, "Math.tan(Math.PI / 180 *")
            .replace(/log\(/g, "Math.log10(")
            .replace(/ln\(/g, "Math.log(")
            .replace(/sqrt\(/g, "Math.sqrt(")
            .replace(/\^/g, "**") // Power operator
            .replace(/ /g, ""); // Remove all spaces
    }

    function handleBackspace() {
        if (lastResult !== null) return; // Don't backspace a result

        if (currentExpression.endsWith(" ")) {
            // Remove operator and spaces
            currentExpression = currentExpression.slice(0, -3);
        } else {
            currentExpression = currentExpression.slice(0, -1);
        }
        
        if (displayValue.length > 1) {
            displayValue = displayValue.slice(0, -1);
        } else {
            displayValue = "0";
        }
    }

    function clearAll() {
        currentExpression = "";
        displayValue = "0";
        lastResult = null;
        updateDisplay();
    }

    // --- UI Update ---
    function updateDisplay() {
        mainDisplay.textContent = displayValue;
        // Show a more readable version of the expression
        expressionDisplay.textContent = currentExpression.replace(/ /g, "").replace(/\*\*/g, "^");
    }

    // --- UI Toggles ---
    function toggleSciMode() {
        calculator.classList.toggle("sci-active");
        sciToggle.classList.toggle("active");
    }

    function toggleHistoryPanel(forceShow) {
        if (forceShow === true) {
            historyPanel.classList.add("show");
            calcContainer.classList.add("history-active");
            historyToggle.classList.add("active");
        } else if (forceShow === false) {
            historyPanel.classList.remove("show");
            calcContainer.classList.remove("history-active");
            historyToggle.classList.remove("active");
        } else {
            // Regular toggle
            historyPanel.classList.toggle("show");
            calcContainer.classList.toggle("history-active");
            historyToggle.classList.toggle("active");
        }
    }

    // --- History Logic ---
    function addHistory(expression, result) {
        const item = { expression, result };
        history.unshift(item); // Add to the beginning
        if (history.length > 20) {
            history.pop(); // Keep list size manageable
        }
        updateHistoryUI();
    }

    function updateHistoryUI() {
        if (history.length === 0) {
            historyList.innerHTML = "<li>No history yet</li>";
            return;
        }
        
        historyList.innerHTML = history
            .map(item => `<li>${item.expression.replace(/\*\*/g, "^")} = <strong>${item.result}</strong></li>`)
            .join("");
    }

    function clearHistory() {
        history = [];
        updateHistoryUI();
    }

    // Initial display update
    updateDisplay();
});