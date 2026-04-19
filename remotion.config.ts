import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setCodec('h264');
Config.setPixelFormat('yuv420p');
// 1차 렌더: 품질 우선(CRF 10 · 근사 무손실). 2차 transcode 로 CBR 50M 강제.
Config.setCrf(10);
Config.setAudioBitrate('320k');
Config.setOverwriteOutput(true);
