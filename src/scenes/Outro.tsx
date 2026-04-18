import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { loadFont as loadGaegu } from '@remotion/google-fonts/Gaegu';
import { loadFont as loadNoto } from '@remotion/google-fonts/NotoSansKR';
import { loadFont as loadMono } from '@remotion/google-fonts/JetBrainsMono';

const gaegu = loadGaegu();
const noto = loadNoto();
const mono = loadMono();

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const faceSpring = spring({ frame, fps, config: { damping: 14, stiffness: 100, mass: 1 } });
  const faceScale = interpolate(faceSpring, [0, 1], [0.7, 1]);

  const titleIn = interpolate(frame, [fps * 0.6, fps * 1.4], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const urlIn = interpolate(frame, [fps * 1.6, fps * 2.4], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const creditIn = interpolate(frame, [fps * 2.6, fps * 3.4], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // 마지막 2초 전체 페이드아웃
  const fadeOut = interpolate(
    frame,
    [durationInFrames - fps * 2, durationInFrames],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(180deg, #FBF7EE 0%, #F6EFE4 100%)',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        opacity: fadeOut,
      }}
    >
      <div style={{ transform: `scale(${faceScale})` }}>
        <SeouliFace size={240} />
      </div>

      <div
        style={{
          fontFamily: gaegu.fontFamily,
          fontSize: 96,
          color: '#3A2A1A',
          opacity: titleIn,
          transform: `translateY(${(1 - titleIn) * 20}px)`,
          fontWeight: 700,
          marginTop: 8,
        }}
      >
        서울이도 하루를 살아
      </div>

      <div
        style={{
          fontFamily: mono.fontFamily,
          fontSize: 38,
          color: '#E8704A',
          letterSpacing: 4,
          opacity: urlIn,
          transform: `translateY(${(1 - urlIn) * 18}px)`,
          fontWeight: 700,
          marginTop: 28,
        }}
      >
        seoul-i.vercel.app
      </div>

      <div
        style={{
          fontFamily: noto.fontFamily,
          fontSize: 22,
          color: '#7A6550',
          letterSpacing: 2,
          opacity: creditIn,
          marginTop: 56,
          textAlign: 'center',
          lineHeight: 1.7,
        }}
      >
        2026 서울시 빅데이터 활용 경진대회 · 시각화 부문
        <br />
        <span style={{ fontSize: 16, color: '#B4A189', letterSpacing: 1 }}>
          Fonts: Pretendard (OFL) · Gaegu (OFL) · JetBrains Mono (OFL)
          <br />
          Data: 서울 열린데이터광장 · 기상청 · 소방청
        </span>
      </div>
    </AbsoluteFill>
  );
};

const SeouliFace: React.FC<{ size: number }> = ({ size }) => {
  const r = size / 2;
  const eyeY = r - size * 0.06;
  const eyeDx = size * 0.18;
  const cheekR = size * 0.07;
  const strokeW = size * 0.035;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={r} cy={r} r={r - 1} fill="#FFE0C7" stroke="#3A2A1A" strokeWidth={1.5} />
      <circle cx={r - eyeDx - size * 0.03} cy={r + size * 0.08} r={cheekR} fill="#FFB8A8" opacity={0.55} />
      <circle cx={r + eyeDx + size * 0.03} cy={r + size * 0.08} r={cheekR} fill="#FFB8A8" opacity={0.55} />
      <path
        d={`M ${r - eyeDx - size * 0.05} ${eyeY} Q ${r - eyeDx} ${eyeY - size * 0.05} ${r - eyeDx + size * 0.05} ${eyeY}`}
        stroke="#3A2A1A"
        strokeWidth={strokeW}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M ${r + eyeDx - size * 0.05} ${eyeY} Q ${r + eyeDx} ${eyeY - size * 0.05} ${r + eyeDx + size * 0.05} ${eyeY}`}
        stroke="#3A2A1A"
        strokeWidth={strokeW}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M ${r - size * 0.08} ${r + size * 0.12} Q ${r} ${r + size * 0.2} ${r + size * 0.08} ${r + size * 0.12}`}
        stroke="#3A2A1A"
        strokeWidth={size * 0.035}
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
};
