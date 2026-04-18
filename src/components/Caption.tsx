import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { loadFont } from '@remotion/google-fonts/Gaegu';

const { fontFamily } = loadFont();

interface CaptionProps {
  text: string;
  /** 옵션: 자막 위치 y (기본 하단). */
  y?: 'top' | 'center' | 'bottom';
}

export const Caption: React.FC<CaptionProps> = ({ text, y = 'bottom' }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  const inDur = Math.round(fps * 0.2);
  const outStart = durationInFrames - inDur;

  const opacity = interpolate(
    frame,
    [0, inDur, outStart, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  const translateY = interpolate(frame, [0, inDur], [20, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const justify =
    y === 'top' ? 'flex-start' : y === 'center' ? 'center' : 'flex-end';

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: justify,
        justifyContent: 'center',
        paddingBottom: y === 'bottom' ? 96 : 0,
        paddingTop: y === 'top' ? 96 : 0,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          fontFamily,
          fontSize: 44,
          color: '#FAF7F2',
          background: 'rgba(30, 22, 14, 0.78)',
          padding: '18px 36px',
          borderRadius: 12,
          maxWidth: 1400,
          textAlign: 'center',
          lineHeight: 1.35,
          letterSpacing: -0.3,
          opacity,
          transform: `translateY(${translateY}px)`,
          boxShadow: '0 10px 32px rgba(0,0,0,0.35)',
          fontWeight: 700,
        }}
      >
        {text}
      </div>
    </div>
  );
};
