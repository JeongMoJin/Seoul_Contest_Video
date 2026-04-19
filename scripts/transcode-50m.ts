/**
 * Remotion 으로 렌더된 out/seoul-i-raw.mp4 를 ffmpeg CBR 50M 로 강제 재인코딩.
 *
 * 주의: 소스 webm 자체가 920 kbps VP8 이므로 50M 은 시각 품질 개선이 아닌
 * "제출 규격 숫자 충족" 용. 오디오는 그대로 copy.
 */
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';

const ROOT = resolve(__dirname, '..');
const FFMPEG = resolve(ROOT, 'node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe');
const SRC = resolve(ROOT, 'out/seoul-i-raw.mp4');
const OUT = resolve(ROOT, 'out/seoul-i-final.mp4');

if (!existsSync(FFMPEG)) {
  console.error(`ffmpeg not found at ${FFMPEG}`);
  process.exit(1);
}
if (!existsSync(SRC)) {
  console.error(`source not found: ${SRC}`);
  process.exit(1);
}

console.log('●  ffmpeg transcode → CBR 50 Mbps');
// x264 CBR 강제 패딩 — nal-hrd=cbr + vbv 버퍼 50M 고정.
// 정적 UI 콘텐츠라 내용상 비트는 남지만 HRD 규약대로 50 Mbps 로 채움.
const r = spawnSync(FFMPEG, [
  '-y',
  '-i', SRC,
  '-c:v', 'libx264',
  '-preset', 'medium',
  '-b:v', '50M',
  '-minrate', '50M',
  '-maxrate', '50M',
  '-bufsize', '50M',
  '-x264-params', 'nal-hrd=cbr:force-cfr=1:vbv-bufsize=50000:vbv-maxrate=50000',
  '-pix_fmt', 'yuv420p',
  '-c:a', 'copy',
  OUT,
], { stdio: 'inherit' });

if (r.status !== 0) {
  console.error('ffmpeg transcode failed');
  process.exit(1);
}
console.log(`✓  ${OUT}`);
