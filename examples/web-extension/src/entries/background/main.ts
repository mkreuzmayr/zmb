import browser from 'webextension-polyfill';

browser.action.setBadgeBackgroundColor({ color: 'black' });
browser.action.setBadgeTextColor({ color: 'white' });

browser.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  console.log(changeInfo);

  if (changeInfo.url) {
    console.log(changeInfo.url);
  }
});
