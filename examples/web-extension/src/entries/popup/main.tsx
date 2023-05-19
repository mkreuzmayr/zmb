import React from 'react';
import ReactDOM from 'react-dom';
import browser from 'webextension-polyfill';
import { createEmitter } from 'zmb';
import { ContentScriptMessageBus } from '../contentScript/primary/main';
import '../enableDevHmr';

function createContentScriptMessageBus(tabId: number) {
  return createEmitter<ContentScriptMessageBus>((request, resolve) => {
    browser.tabs.sendMessage(tabId, request).then(resolve);
  });
}

const [tab] = await browser.tabs.query({
  active: true,
  currentWindow: true,
});

if (tab.id && tab.url) {
  const contentScript = createContentScriptMessageBus(tab.id);

  contentScript.onPopupOpen({ url: tab.url });

  ReactDOM.render(
    <React.StrictMode>
      <div>{tab.url}</div>
    </React.StrictMode>,
    document.getElementById('app')
  );
}
