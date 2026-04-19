import { chromium, Page } from 'playwright';
import { scenario, TARGET_URL, Action } from './scenarios';
import path from 'node:path';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'public');
const OUT_WEBM = path.join(OUT_DIR, 'raw-demo.webm');
const OUT_MP4 = path.join(OUT_DIR, 'raw-demo.mp4');

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
  await fs.mkdir(OUT_DIR, { recursive: true });

  console.log(`▶  target: ${TARGET_URL}`);
  const browser = await chromium.launch({
    headless: true, // 녹화는 headless로 (CI/백그라운드 가능)
    args: ['--window-size=1920,1080'],
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: OUT_DIR,
      size: { width: 1920, height: 1080 },
    },
  });

  await context.addInitScript(CURSOR_SCRIPT);

  const page = await context.newPage();

  // 워밍업 (Vercel cold start 대응)
  console.log('◦  warm-up load...');
  await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500);
  // 실제 녹화 시작점으로 다시 이동 (캐시된 뒤 로드라 깔끔)
  await page.goto(TARGET_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  console.log(`●  recording ${scenario.length} actions`);
  let idx = 0;
  for (const action of scenario) {
    idx += 1;
    console.log(`    [${idx}/${scenario.length}] ${action.type}`);
    await executeAction(page, action);
  }

  const video = page.video();
  await page.close();
  await context.close();
  await browser.close();

  if (video) {
    const rawPath = await video.path();
    // Playwright는 .webm으로 저장. 정해진 이름으로 옮기고 mp4 변환 시도.
    try {
      if (existsSync(OUT_WEBM)) await fs.unlink(OUT_WEBM);
      await fs.rename(rawPath, OUT_WEBM);
      console.log(`✓  saved: ${OUT_WEBM}`);
    } catch (e) {
      console.error('failed to move video:', e);
    }

    const hasFfmpeg = spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' }).status === 0;
    if (hasFfmpeg) {
      console.log('●  converting webm → mp4 ...');
      const r = spawnSync(
        'ffmpeg',
        ['-y', '-i', OUT_WEBM, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', OUT_MP4],
        { stdio: 'inherit' },
      );
      if (r.status === 0) console.log(`✓  saved: ${OUT_MP4}`);
      else console.error('ffmpeg failed');
    } else {
      console.log('!  ffmpeg not found — webm은 남겨둠.');
      console.log('   Remotion의 OffthreadVideo는 webm도 재생 가능.');
      console.log('   필요시 수동 변환: ffmpeg -i raw-demo.webm -c:v libx264 raw-demo.mp4');
    }
  }
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
      // 슬라이더 찾기 — TimeScrubber의 input[type=range]
      const slider = page.locator('input[type="range"]').first();
      const box = await slider.boundingBox();
      if (!box) {
        console.warn('   scrub miss: slider not found');
        return;
      }
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
      // 문자열 기반 evaluate — tsx 가 주입하는 __name 헬퍼 미존재 우회.
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
