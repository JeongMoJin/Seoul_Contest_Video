import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setCodec('h264');
Config.setPixelFormat('yuv420p');
// 비트레이트 상향 (1080p30 YouTube 권장치). CRF 대신 target bitrate 사용.
Config.setVideoBitrate('10M');
Config.setAudioBitrate('320k');
Config.setOverwriteOutput(true);
