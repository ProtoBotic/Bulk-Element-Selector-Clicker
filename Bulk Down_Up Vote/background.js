// background.js
browser.browserAction.onClicked.addListener(function(tab) {
    browser.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        var activeTab = tabs[0];
        browser.tabs.executeScript(activeTab.id, {
            code: 'var extensionEnabled = true;'
        }, function() {
            browser.tabs.executeScript(activeTab.id, { file: 'content.js' });
        });
    });
});
