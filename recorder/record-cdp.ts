/**
 * record-cdp.ts — Chrome DevTools Protocol screencast 로 고품질 녹화.
 *
 * Playwright 의 recordVideo (VP8 ~920kbps) 한계를 우회.
 *   CDP Page.startScreencast → JPEG quality 90 프레임 → ffmpeg libx264 CRF 14 직접 인코딩.
 *
 * 결과: raw-demo.mp4 약 10-20 Mbps (원본 시각 정보 최대 보존).
 *
 * 실행: `npm run record:cdp`
 */
import { chromium, Page } from 'playwright';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import { scenario, TARGET_URL, Action } from './scenarios';

const ROOT = resolve(__dirname, '..');
const FFMPEG = resolve(ROOT, 'node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe');
const OUT_DIR = resolve(ROOT, 'public');
const OUT_MP4 = resolve(OUT_DIR, 'raw-demo.mp4');
const FRAMES_DIR = resolve(OUT_DIR, '.frames-cdp');

const CURSOR_SCRIPT = `
(function() {
  const style = document.createElement('style');
  style.textContent = \`
    * { cursor: none !important; }
    #__cc_cursor {
      position: fixed; width: 22px; height: 22px;
      background: rgba(224, 104, 86, 0.92);
      border: 2px solid #FDFAF3;
      border-radius: 50%;
      pointer-events: none;
      z-index: 2147483647;
      box-shadow: 0 2px 8px rgba(0,0,0,0.28);
      transform: translate(-50%, -50%);
      transition: transform 0.08s ease-out;
    }
    #__cc_cursor.click { transform: translate(-50%, -50%) scale(1.45); }
  \`;
  document.head.appendChild(style);
  const dot = document.createElement('div');
  dot.id = '__cc_cursor';
  dot.style.left = '50%';
  dot.style.top = '50%';
  document.body.appendChild(dot);
  window.addEventListener('mousemove', (e) => {
    dot.style.left = e.clientX + 'px';
    dot.style.top = e.clientY + 'px';
  }, { passive: true });
  window.addEventListener('mousedown', () => dot.classList.add('click'));
  window.addEventListener('mouseup', () => dot.classList.remove('click'));
})();
`;

async function main() {
  if (!existsSync(FFMPEG)) {
    console.error(`ffmpeg not found: ${FFMPEG}`);
    process.exit(1);
  }
  await fs.mkdir(OUT_DIR, { recursive: true });
  // 기존 프레임 정리
  if (existsSync(FRAMES_DIR)) {
    for (const f of await fs.readdir(FRAMES_DIR)) await fs.unlink(resolve(FRAMES_DIR, f));
  } else {
    await fs.mkdir(FRAMES_DIR, { recursive: true });
  }

  console.log(`▶  target: ${TARGET_URL}`);
  const browser = await chromium.launch({
    headless: true,
    args: ['--window-size=1920,1080'],
  });

  // warm-up (녹화 밖)
  console.log('◦  warm-up (not recorded)...');
  const warm = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const warmPage = await warm.newPage();
  await warmPage.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 60000 });
  await warmPage.goto(`${TARGET_URL}/checkup`, { waitUntil: 'networkidle', timeout: 30000 });
  await warm.close();

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });
  await context.addInitScript(CURSOR_SCRIPT);

  const page = await context.newPage();
  await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(300);

  // CDP screencast → 디스크 저장 (ffmpeg 은 시나리오 종료 후 실측 fps 로 인코딩)
  const client = await context.newCDPSession(page);
  let frameCount = 0;
  const writePromises: Promise<void>[] = [];

  client.on('Page.screencastFrame', ({ data, sessionId }) => {
    const idx = frameCount++;
    const path = resolve(FRAMES_DIR, `f_${String(idx).padStart(6, '0')}.jpg`);
    const buf = Buffer.from(data, 'base64');
    writePromises.push(fs.writeFile(path, buf));
    client.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
  });

  await client.send('Page.startScreencast', {
    format: 'jpeg',
    quality: 90,
    maxWidth: 1920,
    maxHeight: 1080,
    everyNthFrame: 1,
  });

  console.log(`●  recording ${scenario.length} actions`);
  const t0 = Date.now();
  for (let i = 0; i < scenario.length; i++) {
    const a = scenario[i];
    const t = ((Date.now() - t0) / 1000).toFixed(2);
    console.log(`    [${i + 1}/${scenario.length}] t=${t}s  ${a.type}`);
    await executeAction(page, a);
  }
  const tEnd = ((Date.now() - t0) / 1000).toFixed(2);
  console.log(`⏱  scenario ${tEnd}s · frames ${frameCount}`);

  await client.send('Page.stopScreencast').catch(() => {});
  // 남은 프레임 쓰기 대기
  await Promise.all(writePromises);

  await page.close();
  await context.close();
  await browser.close();

  // 실측 fps = 프레임 수 / scenario 경과시간
  const elapsed = Number(tEnd);
  const realFps = frameCount / elapsed;
  console.log(`●  encoding ${frameCount} frames @ ${realFps.toFixed(2)} fps → ${OUT_MP4}`);

  const r = spawnSync(FFMPEG, [
    '-y',
    '-framerate', realFps.toFixed(3),
    '-i', resolve(FRAMES_DIR, 'f_%06d.jpg'),
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '14',
    '-pix_fmt', 'yuv420p',
    '-r', '30',
    OUT_MP4,
  ], { stdio: 'inherit' });
  if (r.status !== 0) {
    console.error('ffmpeg encode failed');
    process.exit(1);
  }

  // 프레임 디렉토리 정리
  for (const f of await fs.readdir(FRAMES_DIR)) await fs.unlink(resolve(FRAMES_DIR, f));
  await fs.rmdir(FRAMES_DIR);

  console.log(`✓  saved: ${OUT_MP4}`);
}

async function executeAction(page: Page, action: Action): Promise<void> {
  switch (action.type) {
    case 'wait':
      await page.waitForTimeout(action.ms);
      return;
    case 'move':
      await page.mouse.move(action.x, action.y, { steps: 30 });
      await page.waitForTimeout(action.duration ?? 300);
      return;
    case 'click':
      try {
        await page.locator(action.selector).first().click({ timeout: 10000 });
      } catch (e) {
        console.warn(`   click miss: ${action.selector}`, (e as Error).message);
      }
      return;
    case 'key': {
      const times = action.times ?? 1;
      const gap = action.interval ?? 500;
      for (let i = 0; i < times; i++) {
        await page.keyboard.press(action.key);
        if (i < times - 1) await page.waitForTimeout(gap);
      }
      return;
    }
    case 'goto':
      await page.goto(`${TARGET_URL}${action.path}`, { waitUntil: 'networkidle', timeout: 30000 });
      return;
    case 'scrub': {
      const slider = page.locator('input[type="range"]').first();
      const box = await slider.boundingBox();
      if (!box) { console.warn('   scrub miss: slider not found'); return; }
      const steps = 40;
      const fromX = box.x + (box.width * action.fromHour) / 24;
      const toX = box.x + (box.width * action.toHour) / 24;
      const cy = box.y + box.height / 2;
      await page.mouse.move(fromX, cy);
      await page.mouse.down();
      const stepMs = action.duration / steps;
      for (let i = 1; i <= steps; i++) {
        const x = fromX + ((toX - fromX) * i) / steps;
        await page.mouse.move(x, cy, { steps: 5 });
        await page.waitForTimeout(stepMs);
      }
      await page.mouse.up();
      return;
    }
    case 'scroll':
      await page.evaluate(`
        (function(to, duration) {
          return new Promise(function(resolve) {
            var start = window.scrollY;
            var delta = to - start;
            var startTime = performance.now();
            function step(now) {
              var elapsed = now - startTime;
              var t = Math.min(elapsed / duration, 1);
              var e = t < 0.5 ? 2*t*t : -1 + (4-2*t)*t;
              window.scrollTo(0, start + delta * e);
              if (t < 1) requestAnimationFrame(step);
              else resolve();
            }
            requestAnimationFrame(step);
          });
        })(${action.to}, ${action.duration})
      `);
      return;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
