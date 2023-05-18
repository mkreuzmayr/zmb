import pkg from '../package.json';

const sharedManifest = {
  content_scripts: [
    {
      js: ['src/entries/contentScript/primary/main.tsx'],
      matches: ['*://*/*'],
      run_at: 'document_start',
    },
  ],
  icons: {
    // 16: 'icons/16.png',
    // 19: 'icons/19.png',
    // 32: 'icons/32.png',
    // 38: 'icons/38.png',
    // 48: 'icons/48.png',
    // 64: 'icons/64.png',
    // 96: 'icons/96.png',
    // 128: 'icons/128.png',
    // 256: 'icons/256.png',
    // 512: 'icons/512.png',
  },
  options_ui: {
    page: 'src/entries/options/index.html',
    open_in_tab: true,
  },
  permissions: ['activeTab', 'storage'],
};

const browserAction = {
  default_icon: {
    // 16: 'icons/16.png',
    // 19: 'icons/19.png',
    // 32: 'icons/32.png',
    // 38: 'icons/38.png',
  },
  default_popup: 'src/entries/popup/index.html',
};

function getManifestV2() {
  return {
    ...sharedManifest,
    background: {
      scripts: ['src/entries/background/script.ts'],
      persistent: false,
    },
    browser_action: browserAction,
    options_ui: {
      ...sharedManifest.options_ui,
      chrome_style: false,
    },
    permissions: [...sharedManifest.permissions, '*://*/*'],
  };
}

function getManifestV3(isFirefox: boolean) {
  const background = isFirefox
    ? {
        scripts: ['src/entries/background/script.ts'],
      }
    : {
        service_worker: 'src/entries/background/serviceWorker.ts',
      };

  return {
    ...sharedManifest,
    action: browserAction,
    background,
    host_permissions: ['*://*/*'],
    ...(isFirefox && {
      browser_specific_settings: {
        gecko: {
          id: 'test@example.com',
          strict_min_version: '109.0',
        },
      },
    }),
  };
}

type ManifestV3 = Omit<chrome.runtime.ManifestV3, 'background'> & {
  background?:
    | chrome.runtime.ManifestV3['background']
    | {
        scripts: string[];
      };

  browser_specific_settings?: {
    gecko: {
      id: string;
      strict_min_version: string;
    };
  };
};

export function getManifest(
  manifestVersion: number,
  isFirefox: boolean
): chrome.runtime.ManifestV2 | ManifestV3 {
  const manifest = {
    author: pkg.author,
    description: pkg.description,
    name: pkg.displayName ?? pkg.name,
    version: pkg.version,
  };

  switch (manifestVersion) {
    case 2:
      return {
        ...manifest,
        ...getManifestV2(),
        manifest_version: 2,
      };

    case 3:
      return {
        ...manifest,
        ...getManifestV3(isFirefox),
        manifest_version: 3,
      };

    default:
      throw new Error(
        `Missing manifest definition for manifestVersion ${manifestVersion}`
      );
  }
}
