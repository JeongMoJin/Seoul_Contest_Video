import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig, useCurrentFrame, interpolate } from 'remotion';
import { Intro } from './scenes/Intro';
import { Demo } from './scenes/Demo';
import { Outro } from './scenes/Outro';

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

// 총 120초 타겟 (인트로 8 + 데모 64 + 아웃트로 48).
// raw-demo.webm 실측 63.24s (워밍업 분리 후 · scenario 62.7s) → DEMO_SEC=64.
export const INTRO_SEC = 8;
export const DEMO_SEC = 64;
export const OUTRO_SEC = 48;

export const INTRO_FRAMES = INTRO_SEC * FPS;
export const DEMO_FRAMES = DEMO_SEC * FPS;
export const OUTRO_FRAMES = OUTRO_SEC * FPS;
export const TOTAL_FRAMES = INTRO_FRAMES + DEMO_FRAMES + OUTRO_FRAMES;

// BGM: public/bgm.mp3 (universfield · Cinematic Documentary Background · Pixabay License)
const HAS_BGM = true;

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
