<div align="center">
  <h3>
    🚍
    <br />
    zmb
    <br />
    <a href="https://www.npmjs.com/package/zmb">
      <img src="https://img.shields.io/npm/v/zmb.svg" alt="zmb npm package" />
    </a>
  </h3>
</div>

# Zod Message Bus

`zmb` is a lightweight and library to provide type-safety when passing messages between different contexts of your application.
It provides a simple interface for sending and receiving messages based on a defined protocol.

> The library is built on top of [Zod](https://github.com/colinhacks/zod), a TypeScript-first schema validation library and has taken inspiration from [trpc](https://github.com/trpc/trpc)

`zmb` is split into two parts, a **handler** and an **emitter**.

- **Handler** for receiving and processing messages
- **Emitter** for sending messages

The emitter derives it´s behavior from the handler that defines the structure of the messages that can be received.

## Installation

```sh
npm install zod zmb
# or
pnpm add zod zmb
```

## Usage

### Creating a Message Bus

**The example uses the `webextension-polyfill` for browser extension context messaging, but you can use anything you want.**

The following message bus is used to communicate between the content script and popup script context.
We define the event `onPopupOpen`, it takes an object with the single property `message` of type `string`.

**`contentScript.ts`**

```typescript
import browser from 'webextension-polyfill';
import { createZmb, handler } from 'zmb';
import { z } from 'zod';

const zmb = createZmb(
  // this function is called once to register
  // the listener for incoming messages
  (resolver) => {
    browser.runtime.onMessage.addListener((request, _sender, sendResponse) => {
      resolver(request, sendResponse);
    });
  },
  // object that defines events that
  // can be received via the handler function
  {
    onPopupOpen: handler(
      z.object({
        message: z.string(),
      }),
      (data) => {
        console.log('onPopupOpen', data);

        // ... some content script logic
      }
    ),
  }
);

// export the type of the message bus to be used in the popup script
export type ContentScriptMessageBus = typeof zmb;
```

Once you have defined your message bus handler, you can create an emitter that can be used to send messages by importing the type of the message bus.

**`popupScript.ts`**

```typescript
import browser from 'webextension-polyfill';
import { createEmitter } from 'zmb';

// import the type of the message bus from the content script
import { ContentScriptMessageBus } from '../path/to/contentScript';

function createContentScriptMessageBus(tabId: number) {
  return createEmitter<ContentScriptMessageBus>(
    // this function is inovked on every message send
    (request, resolve) => {
      browser.runtime.sendMessage(request).then(resolve);
    }
  );
}

const [tab] = await browser.tabs.query({
  active: true,
  currentWindow: true,
});

if (tab.id && tab.url) {
  const contentScript = createContentScriptMessageBus(tab.id);

  contentScript.onPopupOpen({ message: 'hello world!' });

  // ... some popup rendering logic
}
```
