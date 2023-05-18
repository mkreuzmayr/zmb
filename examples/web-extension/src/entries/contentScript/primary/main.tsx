import browser from 'webextension-polyfill';
import { createZmb, handler } from 'zmb';
import { z } from 'zod';
import '../../enableDevHmr';

const zmb = createZmb(
  (resolver) => {
    browser.runtime.onMessage.addListener((request, _sender, sendResponse) => {
      resolver(request, sendResponse);
    });
  },
  {
    onPopupOpen: handler(
      z.object({
        url: z.string(),
      }),
      (data) => {
        console.log('onPopupOpen', data);

        // ... some content script logic
      }
    ),
  }
);

export type ContentScriptMessageBus = typeof zmb;
