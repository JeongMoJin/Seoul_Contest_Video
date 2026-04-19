import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setCodec('h264');
Config.setPixelFormat('yuv420p');
// CRF 14 · 시각 무손실 수준. 소스 webm(920kbps VP8)의 정보량을 손실 없이 보존.
// 정적 UI 콘텐츠라 실측 출력은 4-6 Mbps 수준 (파일 ~60-90MB).
Config.setCrf(14);
Config.setAudioBitrate('320k');
Config.setOverwriteOutput(true);
