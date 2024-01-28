(function () {
    var guiClosed = false, guiPopup = createGUIPopup(), isDragging = false, offset = { x: 0, y: 0 }, selectedElements = [], selectMultiple = false, interval = 1000, maxAlikeElements = 5;

    document.body.appendChild(guiPopup);
    addEventListeners();

    function createGUIPopup() {
        var popup = document.createElement('div');
        popup.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);padding:10px;background:#fff;border:2px solid #ccc;z-index:9999;cursor:default;box-shadow:0 4px 8px rgba(0,0,0,0.2);border-radius:8px;';

        popup.innerHTML = `
        <div id="elementActionsTitle" style="cursor:move;font-weight:bold;font-size:50px;display:flex;justify-content:center;align-items:center;padding:10px;color:#111111;font-size:16px;position:relative;border-bottom:2px solid #ccc;border-radius:8px 8px 0 0;">
            Element Actions
            <span id="closeButton" style="cursor:pointer;top:-5px;right:2px;position:absolute;font-weight:bold;font-size:12px;color:#111111;">x</span>
        </div>

        <div style="display:flex;justify-content:center;align-items:center;flex-wrap:wrap;margin-top:10px;">
            <button id="leftClickButton" style="color:#111111;background:#ecf0f1;border:1px solid #bdc3c7;padding:5px 10px;margin:5px;cursor:pointer;border-radius:4px;">Left Click</button>
            <button id="rightClickButton" style="color:#111111;background:#ecf0f1;border:1px solid #bdc3c7;padding:5px 10px;margin:5px;cursor:pointer;border-radius:4px;">Right Click</button>
        </div>

            <div style="color:#111111;display:flex;align-items:center;margin-top:10px;">
                <input type="checkbox" id="selectMultipleCheckbox" style="margin-right:5px;"> Enable Selection
                <button id="resetSelectionButton" style="color:#111111;background:#ecf0f1;border:1px solid #bdc3c7;padding:5px 10px;margin-left:5px;cursor:pointer;border-radius:4px;">Reset Selection</button>
            </div>

        <div style="margin-top:10px;display:flex;align-items:center;color:#111111;">
            <label style="color:#111111;margin-right:5px;">Interval (ms):</label>
            <input type="number" id="intervalInput" min="0" value="1000" style="color:#111111;background:#ecf0f1;border:1px solid #bdc3c7;padding:5px;border-radius:4px;">
        </div>

        <div style="margin-top:10px;display:flex;align-items:center;color:#111111;">
            <label style="color:#111111;margin-right:5px;">Max Alike Elements:</label>
            <input type="number" id="maxAlikeElementsInput" min="0" value="5" style="color:#111111;background:#ecf0f1;border:1px solid #bdc3c7;padding:5px;border-radius:4px;">
        </div>
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
            if (!selectMultiple) resetSelectedElements();
        });

        document.getElementById('resetSelectionButton').addEventListener('click', () => { resetSelectedElements(); });

        ['mousedown', 'mouseover', 'mouseout'].forEach(event => document.addEventListener(event, handleElementEvent));
        document.getElementById('elementActionsTitle').addEventListener('mousedown', (e) => { isDragging = true; offset = { x: e.clientX - guiPopup.getBoundingClientRect().left, y: e.clientY - guiPopup.getBoundingClientRect().top }; });
        document.addEventListener('mousemove', (e) => { if (isDragging) { guiPopup.style.left = e.clientX - offset.x + 'px'; guiPopup.style.top = e.clientY - offset.y + 'px'; } });
        document.addEventListener('mouseup', () => { isDragging = false; });

        // Add hover and click effects to buttons
        ['leftClickButton', 'rightClickButton'].forEach(buttonId => {
            const button = document.getElementById(buttonId);
            button.addEventListener('mouseenter', () => button.style.backgroundColor = '#d4d4d4');
            button.addEventListener('mouseleave', () => button.style.backgroundColor = '#ecf0f1');
            button.addEventListener('mousedown', () => button.style.boxShadow = 'inset 0 0 5px rgba(0,0,0,0.3)');
            button.addEventListener('mouseup', () => button.style.boxShadow = '');
        });
    }

    function preventPropagation(e) { e.stopPropagation(); }

    function resetSelectedElements() {
        selectedElements.forEach(element => element.style.outline = '');
        selectedElements = [];
    }

    function executeActions() {
        var actions = selectedElements.map(element => () => element.click());
        actions.reduce((chain, action) => chain.then(() => new Promise(resolve => { action(); setTimeout(resolve, interval); })), Promise.resolve());
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
        if (element.id) selector += '#' + element.id;
        else if (element.className) selector += '.' + element.className.replace(/\s+/g, '.');
        return selector;
    }
})();
