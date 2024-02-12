(function () {
  var guiClosed = false, guiPopup = createGUIPopup(), isDragging = false, offset = { x: 0, y: 0 }, selectedElements = [], selectMultiple = false, addRandom = false, interval = 1000, maxAlikeElements = 5;

  document.body.appendChild(guiPopup);
  addEventListeners();

  function createGUIPopup() {
    var popup = document.createElement('div');
    popup.style.cssText = 'top: 50%;left: 50%;width: 200px;height: fit-content;transform: translate(-50%, -50%);padding: 20px;background-color: #3e3e3e; color: #fff; position: fixed;box-shadow: 0 -2px 15px  rgba(196, 26, 26, 0.455);;border-radius: 8px;overflow: hidden; z-index: 9998; padding: 10px; text-align: center; border: 2px solid #000000;';

    popup.innerHTML = `

        <style>
        /* popup.css */
    
    
        #elementActionsTitle {
          cursor: move;
          height: 20px;
          margin: -10px -10px 10px -10px;
          padding: 10px;
          color: #ab0101;
          background-color: #000000;
          font-size: 20px;
          font-weight: bold;
          text-decoration:  underline;
        }
    
        #closeButton {
          cursor: pointer;
          top: 5px;
          right: 7px;
          position: absolute;
          font-weight: bold;
          font-size: 12px;
          color: #ffffff;
        }
    
        #leftClickButton,
        #rightClickButton,
        #resetSelectionButton {
          color: #d50000;
          background: #000000;
          font-weight: bold;
          padding: 5px;
          cursor: pointer;
          border: none;
          border-radius: 5px;
          margin-bottom: 10px;
    
        }
    
        #leftClickButton:hover,
        #rightClickButton:hover,
        #resetSelectionButton:hover {
          background: #d50000;
          color: #000000;
        }
    
        #leftClickButton:active,
        #rightClickButton:active,
        #resetSelectionButton:active {
          background-color: #1500ff;
        }
    
    
        #elementActions {
          border-bottom: 2px solid #5d5d5d;
          margin-bottom: 20px;
        }
    
        label {
          color: #898989;
        }
    
        #info {
          display: flex;
          align-items: center;
          margin-top: 10px;
          gap: 5px;
        }
    
        .input-field,
        #resetSelectionButton {
          position: fixed;
          right: 10px;
          margin-left: 5px;
          border-radius: 5px;
          width: 50px;
          padding: 2px;
    
        }

        #feedbackarea {
          margin-top: 10px;
          padding: 5px;
          background-color: #000000;
          color: #ffffff;
          border-radius: 5px;
        }
      </style>
    
    </head>
    
    <body>
      <div id="popup-container">
        <div id="elementActionsTitle">Element Actions
          <span id="closeButton">x</span>
        </div>
    
        <div id="elementActions">
          <button id="leftClickButton">Left Click</button>
          <button id="rightClickButton">Right Click</button>
        </div>
    
        <div id="info">
          <input type="checkbox" id="selectMultipleCheckbox"> Enable Select
          <button id="resetSelectionButton">Reset</button>
        </div>
    
        <div id="info">
          <label>Interval (ms):</label>
          <input type="number" id="intervalInput" min="0" value="1000" class="input-field">
        </div>
        
        <div id="info">
          <input type="checkbox" id="randomCheckbox"> Add Random Delay
        </div>
    
        <div id="info">
          <label>Max Alike Elements:</label>
          <input type="number" id="maxAlikeElementsInput" min="0" value="5" class="input-field">
        </div>

        <div id="feedbackarea">
        <p id="feedback">Feedback</p>
        </div>

      </div>
    </body>
    
        `;
    return popup;
  }

  function addEventListeners() {
    ['elementActionsTitle', 'leftClickButton', 'rightClickButton', 'intervalInput', 'maxAlikeElementsInput'].forEach(id => document.getElementById(id).addEventListener('mousedown', preventPropagation));

    ['intervalInput', 'maxAlikeElementsInput'].forEach(id => document.getElementById(id).addEventListener('input', function () { this.id === 'intervalInput' ? interval = +this.value : maxAlikeElements = +this.value; }));

    document.getElementById('closeButton').addEventListener('click', () => { guiClosed = true; document.body.removeChild(guiPopup); });
    document.getElementById('leftClickButton').addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); if (!guiClosed) executeActions(); });
    document.getElementById('rightClickButton').addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); if (!guiClosed) executeActions(); });

    document.getElementById('selectMultipleCheckbox').addEventListener('change', function () {
      selectMultiple = this.checked;
    });

    document.getElementById('randomCheckbox').addEventListener('change', function () {
      addRandom = this.checked;
    });

    document.getElementById('resetSelectionButton').addEventListener('click', () => { resetSelectedElements(); });

    ['mousedown', 'mouseover', 'mouseout'].forEach(event => document.addEventListener(event, handleElementEvent));
    document.getElementById('elementActionsTitle').addEventListener('mousedown', (e) => { isDragging = true; offset = { x: e.clientX - guiPopup.getBoundingClientRect().left, y: e.clientY - guiPopup.getBoundingClientRect().top }; });
    document.addEventListener('mousemove', (e) => { if (isDragging) { guiPopup.style.left = e.clientX - offset.x + 'px'; guiPopup.style.top = e.clientY - offset.y + 'px'; } });
    document.addEventListener('mouseup', () => { isDragging = false; });

    // Add hover and click effects to buttons
    document.querySelectorAll('.action-button').forEach(button => {
      button.addEventListener('mouseenter', () => button.style.backgroundColor = '#d4d4d4');
      button.addEventListener('mouseleave', () => button.style.backgroundColor = '#ecf0f1');
      button.addEventListener('mousedown', () => button.style.boxShadow = 'inset 0 0 5px rgba(0,0,0,0.3)');
      button.addEventListener('mouseup', () => button.style.boxShadow = '');
    });
    document.getElementById('randomCheckbox').addEventListener('mouseover', function(event) {
      showTooltip(event, 'Add a random delay (0 - 500ms) between each click.\nUsed to avoid bot detection.');
    document.getElementById('randomCheckbox').addEventListener('mouseout', hideTooltip);
    });
    
    document.getElementById('selectMultipleCheckbox').addEventListener('mouseover', function(event) {
      showTooltip(event, 'Start selecting elements.');
    document.getElementById('selectMultipleCheckbox').addEventListener('mouseout', hideTooltip);
    });

    document.getElementById('resetSelectionButton').addEventListener('mouseover', function(event) {
      showTooltip(event, 'Reset selected elements and outlines to none.');
    document.getElementById('resetSelectionButton').addEventListener('mouseout', hideTooltip);
    });

    document.getElementById('maxAlikeElementsInput').addEventListener('mouseover', function(event) {
      showTooltip(event, 'Maximum number of similar elements to be selected at the same time.');
    document.getElementById('maxAlikeElementsInput').addEventListener('mouseout', hideTooltip);
    });
  }

  function preventPropagation(e) { e.stopPropagation(); }

  function resetSelectedElements() {
    selectedElements.forEach(element => element.style.outline = '');
    selectedElements = [];
  }

  var addRandom = false; // Flag to indicate whether to add random delay

  document.getElementById('randomBtn').addEventListener('change', function () {
    addRandom = this.checked;
  });

  async function executeActions() {
    var actions = selectedElements.map(element => () => element.click());
    for (const [index, action] of actions.entries()) {
      var delay = interval;
      if (addRandom) {
        // Generate a random delay between 0ms to 500ms
        const randomDelay = Math.random() * 500;
        delay += randomDelay;
      }

      await new Promise(resolve => {
        action();
        setTimeout(resolve, delay);
      });

      // Display the delay in the feedback message
      document.getElementById('feedback').innerText = `Clicked element ${index + 1}. Delay: ${delay}ms`;

    }
    setTimeout(() => {
      document.getElementById('feedback').innerText = 'All Elements Clicked';
    }, 1000);
  }


  function handleElementEvent(event) {
    if (event.target.tagName.toLowerCase() === 'a') event.preventDefault();

    var target = event.target;
    var selector = getSelector(target);

    if (selectMultiple && !guiClosed && event.type === 'mousedown') {
      var alikeElements = Array.from(document.querySelectorAll(selector));
      var startIndex = alikeElements.indexOf(target);
      var count = 0;

      alikeElements.forEach((element, index) => {
        if (index >= startIndex && count < maxAlikeElements) {
          element.style.outline = (element.style.outlineColor !== 'blue') ? '2px solid blue' : '';
          if (element.style.outlineColor === 'blue') {
            selectedElements.push(element);
            count++;
          } else {
            selectedElements = selectedElements.filter(selected => selected !== element);
            count--;
          }
        } else {
          element.style.outline = '';
        }
      });
    } else if (!guiClosed && selectMultiple && (event.type === 'mouseover' || event.type === 'mouseout')) {
      var alikeElements = Array.from(document.querySelectorAll(selector));
      var startIndex = alikeElements.indexOf(target);
      var count = 0;

      alikeElements.forEach((element, index) => {
        if (index >= startIndex && count < maxAlikeElements) {
          if (!selectedElements.includes(element)) {
            element.style.outline = (event.type === 'mouseover') ? '2px solid red' : '';
            count++;
          }
        } else {
          element.style.outline = '';
        }
      });
    }
  }

  function getSelector(element) {
    var selector = element.tagName.toLowerCase();
    if (element.id) {
        selector += '#' + element.id;
    } else if (element.classList.length > 0) {
        selector += '.' + Array.from(element.classList).join('.');
    }
    return selector;
}


function showTooltip(event, tooltipContent) {
  var target = event.target;
  var tooltip = document.createElement('div');
  tooltip.className = 'tooltip'; // Add a class for styling
  tooltip.innerText = tooltipContent;
  tooltip.style.cssText = 'position: absolute; font-size: 8px; transform: translateY(-50%); background-color: rgba(0, 0, 0, 0.8); color: #fff; padding: 5px 10px; border-radius: 5px; z-index: 9999;';
  
  // Calculate the position of the tooltip relative to the target element
  var targetRect = target.getBoundingClientRect();
  tooltip.style.top = (targetRect.top + targetRect.height / 2) + 'px';
  tooltip.style.right = (window.innerWidth - targetRect.left + 5) + 'px';

  document.body.appendChild(tooltip);
}

function hideTooltip() {
  var tooltip = document.querySelector('.tooltip');
  if (tooltip) {
    tooltip.parentNode.removeChild(tooltip);
  }
}


})();
