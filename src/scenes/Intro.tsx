import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Sequence } from 'remotion';
import { loadFont as loadGaegu } from '@remotion/google-fonts/Gaegu';
import { loadFont as loadNoto } from '@remotion/google-fonts/NotoSansKR';

const gaegu = loadGaegu();
const noto = loadNoto();

// 15초 인트로 구성:
//   0-3s:  검은 배경 + "서울에는 매일 940만 명의 하루가 오간다"
//   3-6s:  "하지만 우리는 서울을 '도시'로만 봤다"
//   6-10s: 크림 배경으로 전환 + "서울이" 로고 spring
//   10-15s: "도시가 아닌 한 사람" 서브타이틀 + face 펄스

export const Intro: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <BgTransition />

      <Sequence from={0} durationInFrames={fps * 3}>
        <Line text="서울에는 매일 940만 명의 하루가 오간다" color="#FAF7F2" bg="#0b0a08" />
      </Sequence>

      <Sequence from={fps * 3} durationInFrames={fps * 3}>
        <Line text="하지만 우리는 서울을 '도시'로만 봤다" color="#FAF7F2" bg="#0b0a08" />
      </Sequence>

      <Sequence from={fps * 6} durationInFrames={fps * 9}>
        <LogoReveal />
      </Sequence>
    </AbsoluteFill>
  );
};

const BgTransition: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = interpolate(frame, [fps * 5.5, fps * 7], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  // 검정 → 크림
  const bg = `rgb(${lerp(11, 246, t)}, ${lerp(10, 239, t)}, ${lerp(8, 228, t)})`;
  return <AbsoluteFill style={{ background: bg }} />;
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const Line: React.FC<{ text: string; color: string; bg: string }> = ({ text, color, bg }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const inDur = Math.round(fps * 0.4);
  const outStart = durationInFrames - inDur;
  const opacity = interpolate(
    frame,
    [0, inDur, outStart, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  const y = interpolate(frame, [0, inDur], [16, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill
      style={{
        background: bg,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 120,
      }}
    >
      <div
        style={{
          fontFamily: noto.fontFamily,
          fontWeight: 500,
          fontSize: 58,
          color,
          opacity,
          transform: `translateY(${y}px)`,
          letterSpacing: -1,
          textAlign: 'center',
          lineHeight: 1.3,
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

const LogoReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const springProg = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 110, mass: 0.9 },
  });

  const scale = interpolate(springProg, [0, 1], [0.6, 1]);
  const opacity = interpolate(frame, [0, fps * 0.6], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // 얼굴 호흡 (10-15s 구간의 5초에 걸쳐 1.5회 pulse)
  const pulse = Math.sin((frame / fps) * Math.PI * 1.2) * 0.015 + 1;

  const subIn = interpolate(frame, [fps * 2, fps * 2.6], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const subY = interpolate(frame, [fps * 2, fps * 2.6], [18, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
      }}
    >
      <div
        style={{
          transform: `scale(${scale * pulse})`,
          opacity,
        }}
      >
        <SeouliFace size={260} />
      </div>
      <div
        style={{
          fontFamily: noto.fontFamily,
          fontWeight: 800,
          fontSize: 160,
          color: '#3A2A1A',
          letterSpacing: -6,
          lineHeight: 1,
          opacity,
          transform: `scale(${scale})`,
          marginTop: 8,
        }}
      >
        서울이
      </div>
      <div
        style={{
          fontFamily: gaegu.fontFamily,
          fontSize: 42,
          color: '#7A6550',
          opacity: subIn,
          transform: `translateY(${subY}px)`,
          marginTop: 12,
        }}
      >
        도시가 아닌 한 사람
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
