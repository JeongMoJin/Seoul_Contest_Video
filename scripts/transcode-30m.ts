/**
 * Remotion 렌더 결과(out/seoul-i-raw.mp4)를 CBR 30 Mbps 로 강제 재인코딩.
 * 정적 UI 콘텐츠라 실질 품질은 소스 수준에 수렴 · 규격 숫자(30 Mbps)만 충족.
 */
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';

const ROOT = resolve(__dirname, '..');
const FFMPEG = resolve(ROOT, 'node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe');
const SRC = resolve(ROOT, 'out/seoul-i-raw.mp4');
const OUT = resolve(ROOT, 'out/seoul-i-final.mp4');

if (!existsSync(FFMPEG)) { console.error(`ffmpeg not found: ${FFMPEG}`); process.exit(1); }
if (!existsSync(SRC)) { console.error(`source not found: ${SRC}`); process.exit(1); }

console.log('●  ffmpeg transcode → CBR 30 Mbps');
const r = spawnSync(FFMPEG, [
  '-y', '-i', SRC,
  '-c:v', 'libx264',
  '-preset', 'medium',
  '-b:v', '30M', '-minrate', '30M', '-maxrate', '30M', '-bufsize', '30M',
  '-x264-params', 'nal-hrd=cbr:force-cfr=1:vbv-bufsize=30000:vbv-maxrate=30000',
  '-pix_fmt', 'yuv420p',
  '-c:a', 'copy',
  OUT,
], { stdio: 'inherit' });

if (r.status !== 0) { console.error('ffmpeg failed'); process.exit(1); }
console.log(`✓  ${OUT}`);
