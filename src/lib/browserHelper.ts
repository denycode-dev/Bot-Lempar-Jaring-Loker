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

export interface StuckResolutionResult {
  actionTaken: 'dismissed_popup' | 'ai_resolved' | 'skipped_captcha' | 'none';
  shouldSkip: boolean;
  message: string;
}

/**
 * Universal Recovery & Anti-Stuck Handler (Watchdog):
 * Tier 1: Heuristic Auto-Dismiss for annoying modals (0 tokens, instant)
 * Tier 2: Check for blocking CAPTCHA / verification (graceful skip to protect account)
 * Tier 3: AI Form Inspector (if AI active and stuck > 8s)
 */
export async function handleStuckFormAndPopups(
  page: any,
  options: {
    onLog?: (msg: string) => void;
    enableAiInspector?: boolean;
    candidateContext?: string;
    jobTitle?: string;
    company?: string;
  } = {}
): Promise<StuckResolutionResult> {
  const log = options.onLog || (() => {});

  try {
    // 1. TIER 1: HEURISTIC MODAL & POPUP DISMISSAL (0 Token, 0.1s)
    const dismissResult = await page.evaluate(() => {
      // Check for common close / dismiss buttons in active dialogs/modals
      const selectors = [
        'button[aria-label*="close" i]',
        'button[aria-label*="tutup" i]',
        'button[aria-label*="batal" i]',
        'button[data-testid*="close" i]',
        'button[data-automation*="close" i]',
        '.modal-close',
        '.modal__close',
        '[data-modal-close]',
        'button[aria-label="Dismiss"]',
        'button[aria-label="Dismiss alert"]',
      ];

      for (const sel of selectors) {
        const btn = document.querySelector(sel) as HTMLElement;
        if (btn && btn.offsetParent !== null) {
          btn.click();
          return { clicked: true, text: btn.getAttribute('aria-label') || sel };
        }
      }

      // Check for buttons by visible text inside modal dialogs
      const dialogs = document.querySelectorAll('[role="dialog"], .artdeco-modal, [class*="modal"], [class*="Modal"], [class*="dialog"]');
      if (dialogs.length > 0) {
        const lastDialog = dialogs[dialogs.length - 1];
        const buttons = Array.from(lastDialog.querySelectorAll('button, a[role="button"]')) as HTMLElement[];
        
        // Negative / Dismissive actions
        const dismissiveRegex = /^(nanti saja|batal|lewati|tutup|not now|maybe later|skip|dismiss|cancel|close|no thanks)$/i;
        for (const btn of buttons) {
          const txt = (btn.textContent || '').trim();
          if (dismissiveRegex.test(txt) && btn.offsetParent !== null) {
            btn.click();
            return { clicked: true, text: txt };
          }
        }

        // Affirmative Consent / Agree actions (Terms, data privacy consent)
        const consentRegex = /^(saya setuju|setuju & lanjutkan|i agree|agree|agree & continue|accept all|terima semua|lanjutkan)$/i;
        for (const btn of buttons) {
          const txt = (btn.textContent || '').trim();
          if (consentRegex.test(txt) && btn.offsetParent !== null) {
            btn.click();
            return { clicked: true, text: txt };
          }
        }
      }

      return { clicked: false, text: '' };
    });

    if (dismissResult.clicked) {
      log(`🧹 [Watchdog] Berhasil menutup/konfirmasi pop-up interupsi: "${dismissResult.text}"`);
      await new Promise(r => setTimeout(r, 1000));
      return {
        actionTaken: 'dismissed_popup',
        shouldSkip: false,
        message: `Menutup modal: ${dismissResult.text}`,
      };
    }

    // 2. TIER 2: CAPTCHA / SECURITY CHECKPOINT DETECTION
    const hasCaptcha = await page.evaluate(() => {
      const captchaSelectors = [
        'iframe[src*="recaptcha"]',
        'iframe[src*="turnstile"]',
        'iframe[src*="hcaptcha"]',
        '#cf-challenge-running',
        '#challenge-stage',
        '.g-recaptcha',
        '[data-sitekey]'
      ];
      return captchaSelectors.some(sel => !!document.querySelector(sel));
    });

    if (hasCaptcha) {
      log(`🛡️ [Watchdog] Verifikasi keamanan (CAPTCHA/Cloudflare) terdeteksi. Melewati loker ini demi keamanan akun...`);
      return {
        actionTaken: 'skipped_captcha',
        shouldSkip: true,
        message: 'CAPTCHA terdeteksi - loker dilewati untuk keamanan akun',
      };
    }

    // 3. TIER 3: AI FORM INSPECTOR (If enabled & available)
    if (options.enableAiInspector) {
      try {
        const { captureFormDomSnapshot, inspectFormWithAi, applyAiFormActions } = require('./aiFormInspector');
        const snapshot = await captureFormDomSnapshot(page);
        if (snapshot && snapshot.elementMap.length > 0) {
          const plan = await inspectFormWithAi({
            platform: 'Job Portal',
            jobTitle: options.jobTitle || 'Job Application',
            company: options.company || 'Target Company',
            candidateProfileContext: options.candidateContext || '',
            domSnippet: snapshot.htmlSnippet,
            stepHint: 'Stuck Form Recovery',
          });

          if (plan) {
            const applied = await applyAiFormActions(page, plan, log);
            if (applied) {
              return {
                actionTaken: 'ai_resolved',
                shouldSkip: false,
                message: `AI memecahkan form macet: "${plan.formGoal}"`,
              };
            }
          }
        }
      } catch (aiErr: any) {
        log(`⚠️ [Watchdog AI] Gagal menjalankan AI Form Inspector: ${aiErr?.message || aiErr}`);
      }
    }

    return {
      actionTaken: 'none',
      shouldSkip: false,
      message: 'Tidak ada tindakan pemulihan yang diperlukan',
    };
  } catch (err: any) {
    return {
      actionTaken: 'none',
      shouldSkip: false,
      message: err?.message || String(err),
    };
  }
}

