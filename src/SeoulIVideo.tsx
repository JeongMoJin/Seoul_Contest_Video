import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig, useCurrentFrame, interpolate } from 'remotion';
import { Intro } from './scenes/Intro';
import { Demo } from './scenes/Demo';
import { Outro } from './scenes/Outro';

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

// 각 씬 길이 (초)
export const INTRO_SEC = 15;
export const DEMO_SEC = 180;
export const OUTRO_SEC = 20;

export const INTRO_FRAMES = INTRO_SEC * FPS;
export const DEMO_FRAMES = DEMO_SEC * FPS;
export const OUTRO_FRAMES = OUTRO_SEC * FPS;
export const TOTAL_FRAMES = INTRO_FRAMES + DEMO_FRAMES + OUTRO_FRAMES;

// BGM 파일이 없으면 런타임 에러가 나지 않도록 optional 처리
const HAS_BGM = false; // public/bgm.mp3 드롭 후 true로 바꾸기

export const SeoulIVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <Sequence from={0} durationInFrames={INTRO_FRAMES}>
        <Intro />
      </Sequence>

      <Sequence from={INTRO_FRAMES} durationInFrames={DEMO_FRAMES}>
        <Demo />
      </Sequence>

      <Sequence from={INTRO_FRAMES + DEMO_FRAMES} durationInFrames={OUTRO_FRAMES}>
        <Outro />
      </Sequence>

      {HAS_BGM && (
        <BGMTrack />
      )}
    </AbsoluteFill>
  );
};

const BGMTrack: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  // 마지막 3초 fade out
  const fadeStart = durationInFrames - 3 * FPS;
  const volume = interpolate(frame, [0, fadeStart, durationInFrames], [0.35, 0.35, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return <Audio src={staticFile('bgm.mp3')} volume={volume} />;
};
