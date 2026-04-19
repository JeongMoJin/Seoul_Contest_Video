import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Sequence } from 'remotion';
import { loadFont as loadGaegu } from '@remotion/google-fonts/Gaegu';
import { loadFont as loadNoto } from '@remotion/google-fonts/NotoSansKR';
import { loadFont as loadMono } from '@remotion/google-fonts/JetBrainsMono';

const gaegu = loadGaegu();
const noto = loadNoto();
const mono = loadMono();

// 아웃트로 32초 구성 (DEMO_SEC 변경에 따라 OUTRO_SEC 이 조정되어도 각 Phase 는 비율이 아닌 절대 시간 기준)
//   0 ~ 8s    Phase A : face pulse + "서울이도 하루를 살아"
//   8 ~ 18s   Phase B : 대형 URL + 부연
//   18 ~ 끝   Phase C : 대회·폰트·데이터 출처 크레딧
export const Outro: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(180deg, #FBF7EE 0%, #F6EFE4 100%)',
      }}
    >
      <GlobalFade>
        <Sequence from={0} durationInFrames={fps * 8}>
          <PhaseA />
        </Sequence>

        <Sequence from={fps * 8} durationInFrames={fps * 10}>
          <PhaseB />
        </Sequence>

        <Sequence from={fps * 18} durationInFrames={fps * 14}>
          <PhaseC />
        </Sequence>
      </GlobalFade>
    </AbsoluteFill>
  );
};

const GlobalFade: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const fadeIn = interpolate(frame, [0, fps * 0.6], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - fps * 1.6, durationInFrames],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: Math.min(fadeIn, fadeOut) }}>
      {children}
    </div>
  );
};

const PhaseA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const faceSpring = spring({ frame, fps, config: { damping: 13, stiffness: 110, mass: 1 } });
  const faceScale = interpolate(faceSpring, [0, 1], [0.7, 1]);
  // breath 스타일 pulse (2초 주기)
  const pulse = Math.sin((frame / fps) * Math.PI) * 0.025 + 1;

  const titleIn = interpolate(frame, [fps * 0.7, fps * 1.4], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const localFade = interpolate(
    frame,
    [durationInFrames - fps * 0.6, durationInFrames],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        opacity: localFade,
      }}
    >
      <div style={{ transform: `scale(${faceScale * pulse})` }}>
        <SeouliFace size={260} />
      </div>
      <div
        style={{
          fontFamily: gaegu.fontFamily,
          fontSize: 96,
          color: '#3A2A1A',
          opacity: titleIn,
          transform: `translateY(${(1 - titleIn) * 22}px)`,
          fontWeight: 700,
          marginTop: 16,
        }}
      >
        서울이도 하루를 살아
      </div>
    </AbsoluteFill>
  );
};

const PhaseB: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const urlIn = interpolate(frame, [0, fps * 0.7], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const subIn = interpolate(frame, [fps * 1.2, fps * 1.8], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const localFade = interpolate(
    frame,
    [durationInFrames - fps * 0.6, durationInFrames],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        opacity: localFade,
      }}
    >
      <div
        style={{
          fontFamily: gaegu.fontFamily,
          fontSize: 36,
          color: '#7A6550',
          opacity: urlIn,
          letterSpacing: 2,
          marginBottom: 16,
        }}
      >
        지금 만나보세요
      </div>
      <div
        style={{
          fontFamily: mono.fontFamily,
          fontSize: 110,
          color: '#E8704A',
          fontWeight: 800,
          letterSpacing: -2,
          opacity: urlIn,
          transform: `translateY(${(1 - urlIn) * 22}px)`,
          textShadow: '0 6px 28px rgba(232, 112, 74, 0.25)',
        }}
      >
        seoul-i.vercel.app
      </div>
      <div
        style={{
          fontFamily: noto.fontFamily,
          fontSize: 30,
          color: '#3A2A1A',
          opacity: subIn,
          marginTop: 24,
          letterSpacing: 1,
        }}
      >
        원형 시계 · 25 자치구 친구들 · 건강검진표 PDF
      </div>
    </AbsoluteFill>
  );
};

const PhaseC: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleIn = interpolate(frame, [0, fps * 0.7], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const restIn = interpolate(frame, [fps * 1.0, fps * 1.6], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        gap: 18,
      }}
    >
      <div
        style={{
          fontFamily: noto.fontFamily,
          fontSize: 34,
          color: '#3A2A1A',
          fontWeight: 700,
          letterSpacing: 1,
          opacity: titleIn,
          textAlign: 'center',
        }}
      >
        2026 서울시 빅데이터 활용 경진대회 · 시각화 부문
      </div>
      <div
        style={{
          fontFamily: gaegu.fontFamily,
          fontSize: 44,
          color: '#E8704A',
          marginTop: 8,
          opacity: titleIn,
          fontWeight: 700,
        }}
      >
        진정모
      </div>
      <div
        style={{
          fontFamily: noto.fontFamily,
          fontSize: 22,
          color: '#7A6550',
          letterSpacing: 1.5,
          marginTop: 48,
          textAlign: 'center',
          lineHeight: 1.8,
          opacity: restIn,
        }}
      >
        Fonts · Pretendard (OFL) · Gaegu (OFL) · JetBrains Mono (OFL)
        <br />
        Data · 서울교통공사 지하철 · 서울 생활인구 · 기상청 ASOS
        <br />
        BGM · Cinematic Documentary Background by universfield (Pixabay License)
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
