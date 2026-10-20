import fs from 'fs';
import path from 'path';
import { getConfig } from './config';

export interface LaunchBrowserResult {
  browser: any;
  browserType: 'camoufox-stealth';
}

import { execSync } from 'child_process';

/**
 * Launches Camoufox Stealth Browser (Firefox C++ Patched Engine) with Playwright
 * and wraps it to expose a Puppeteer-compatible API for existing bots.
 */
export async function launchCamoufoxBrowser(
  mode: 'headless' | 'headful' = 'headless',
  onLog?: (msg: string) => void,
  profileFolderOverride?: string
): Promise<LaunchBrowserResult> {
  let Camoufox: any;
  try {
    const modName = 'camoufox-js';
    const camoufoxModule = await (new Function('m', 'return import(m)'))(modName);
    Camoufox = camoufoxModule.Camoufox || camoufoxModule.default?.Camoufox || camoufoxModule.default;
  } catch (err: any) {
    try {
      const dynamicRequire = typeof module !== 'undefined' && module.require ? module.require.bind(module) : eval('require');
      const camoufoxPkg = dynamicRequire('camoufox' + '-js');
      Camoufox = camoufoxPkg.Camoufox || camoufoxPkg.default?.Camoufox || camoufoxPkg.default;
    } catch {
      throw new Error(`Camoufox engine gagal dimuat: ${err?.message || err}`);
    }
  }
  const config = getConfig();
  const log = onLog || console.log;

  let folderName = profileFolderOverride;
  if (!folderName) {
    const activeAccount = config.browserAccounts?.find(a => a.id === config.activeBrowserAccountId);
    folderName = activeAccount?.profileFolder ? `${activeAccount.profileFolder}-camoufox` : 'automation-profile-camoufox';
  } else if (!folderName.includes('camoufox')) {
    folderName = `${folderName}-camoufox`;
  }

  const profilePath = path.isAbsolute(folderName) ? folderName : path.join(/*turbopackIgnore: true*/ process.cwd(), folderName);
  const isHeadless = mode !== 'headful';

  if (!fs.existsSync(/*turbopackIgnore: true*/ profilePath)) {
    try {
      fs.mkdirSync(profilePath, { recursive: true });
    } catch {}
  }

  // Bersihkan stale singleton / lock files sebelum meluncurkan Camoufox
  cleanupStaleProfileLocks(profilePath);

  log(`🛡️ Meluncurkan Camoufox Stealth Browser (Firefox C++ Anti-Bot Engine)...`);

  let rawContext: any;
  try {
    rawContext = await Camoufox({
      headless: isHeadless,
      os: 'windows',
      humanize: true,
      user_data_dir: profilePath,
    });
  } catch (launchErr: any) {
    const errMsg = String(launchErr?.message || launchErr);
    // If it crashed or failed due to locked profile / exitCode 4294967295 / process exit, perform recovery and retry once
    if (
      errMsg.includes('4294967295') ||
      errMsg.includes('Failed to launch the browser process') ||
      errMsg.includes('exitCode') ||
      errMsg.includes('parent.lock')
    ) {
      log(`⚠️ Terdeteksi konflik proses/profile lock. Membersihkan kunci & mencoba ulang...`);
      cleanupStaleProfileLocks(profilePath);
      await new Promise(r => setTimeout(r, 600));
      rawContext = await Camoufox({
        headless: isHeadless,
        os: 'windows',
        humanize: true,
        user_data_dir: profilePath,
      });
    } else {
      throw launchErr;
    }
  }

  function wrapPage(page: any) {
    if (!page) return page;

    if (!page.setCookie) {
      page.setCookie = async (...cookies: any[]) => {
        const formatted = cookies.map(c => {
          let sameSite = c.sameSite;
          if (sameSite && typeof sameSite === 'string') {
            const lower = sameSite.toLowerCase();
            if (lower === 'lax') sameSite = 'Lax';
            else if (lower === 'strict') sameSite = 'Strict';
            else if (lower === 'none') sameSite = 'None';
            else sameSite = undefined;
          }
          return {
            name: c.name,
            value: c.value,
            domain: c.domain,
            path: c.path || '/',
            expires: typeof c.expires === 'number' ? c.expires : undefined,
            httpOnly: Boolean(c.httpOnly),
            secure: Boolean(c.secure),
            sameSite: sameSite
          };
        });
        return rawContext.addCookies(formatted);
      };
    }

    if (!page.setUserAgent) {
      page.setUserAgent = async () => {};
    }

    if (!page.waitForTimeout) {
      page.waitForTimeout = (ms: number) => new Promise(r => setTimeout(r, ms));
    }

    if (!page.setViewport) {
      page.setViewport = async (vp: { width: number; height: number }) => {
        if (typeof page.setViewportSize === 'function') {
          await page.setViewportSize({ width: vp.width, height: vp.height });
        }
      };
    }

    if (!page.evaluateOnNewDocument) {
      page.evaluateOnNewDocument = async (pageFunction: any, ...args: any[]) => {
        if (typeof page.addInitScript === 'function') {
          await page.addInitScript(pageFunction, ...args);
        }
      };
    }

    return page;
  }

  const browserWrapper = {
    _raw: rawContext,
    newPage: async () => {
      const page = await rawContext.newPage();
      return wrapPage(page);
    },
    pages: async () => {
      const pgs = rawContext.pages();
      return pgs.map(wrapPage);
    },
    close: async () => {
      await rawContext.close();
    },
    version: async () => {
      return 'Camoufox-Gecko-Stealth';
    },
    on: (event: string, handler: any) => {
      if (event === 'disconnected') {
        rawContext.on('close', handler);
      } else {
        rawContext.on(event, handler);
      }
      return browserWrapper;
    },
    isConnected: () => {
      if (typeof rawContext.isClosed === 'function') {
        return !rawContext.isClosed();
      }
      return true;
    }
  };

  log(`✅ Berhasil membuka Camoufox Stealth Browser [Firefox C++ Gecko Engine]`);
  return {
    browser: browserWrapper,
    browserType: 'camoufox-stealth'
  };
}

/**
 * Removes stale lock files and terminates orphan processes that are holding locks on the userDataDir.
 */
export function cleanupStaleProfileLocks(profilePath: string) {
  // 1. On Windows, terminate orphan camoufox processes instantly using taskkill /T (<20ms)
  if (process.platform === 'win32') {
    try {
      execSync('taskkill /F /IM camoufox.exe /T', { stdio: 'ignore' });
    } catch {
      // Non-blocking fallback if no processes exist
    }
  }

  // 2. Remove stale lock files safely using fs.rmSync
  const lockFiles = [
    'SingletonLock',
    'SingletonCookie',
    'SingletonSocket',
    'DevToolsActivePort',
    'lockfile',
    'parent.lock',
    '.parentlock'
  ];
  for (const file of lockFiles) {
    const fullPath = path.join(/*turbopackIgnore: true*/ profilePath, file);
    try {
      if (fs.existsSync(/*turbopackIgnore: true*/ fullPath)) {
        fs.rmSync(fullPath, { force: true });
      }
    } catch {}
  }
}

/**
 * Standard launcher that launches Camoufox Stealth Browser as the mandatory engine.
 * Retains function signature for full backwards compatibility across the application.
 */
export async function launchBrowserWithFallback(
  mode: 'headless' | 'headful' = 'headless',
  onLog?: (msg: string) => void,
  profileFolderOverride?: string
): Promise<LaunchBrowserResult> {
  return await launchCamoufoxBrowser(mode, onLog, profileFolderOverride);
}

