import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Sequence } from 'remotion';
import { loadFont as loadGaegu } from '@remotion/google-fonts/Gaegu';
import { loadFont as loadNoto } from '@remotion/google-fonts/NotoSansKR';

const gaegu = loadGaegu();
const noto = loadNoto();

// 8초 인트로 구성:
//   0 ~ 2.5s : 검정 배경 + "서울에는 매일 940만의 하루가"
//   2.5 ~ 5s : 검정 배경 + "우리는 '도시'로만 봤다"
//   5 ~ 8s   : 크림 배경 전환 + 서울이 얼굴 spring + 타이틀 + 서브타이틀
export const Intro: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <BgTransition />

      <Sequence from={0} durationInFrames={Math.round(fps * 2.5)}>
        <Line text="서울에는 매일 940만의 하루가" color="#FAF7F2" bg="transparent" />
      </Sequence>

      <Sequence from={Math.round(fps * 2.5)} durationInFrames={Math.round(fps * 2.5)}>
        <Line text="우리는 '도시'로만 봤다" color="#FAF7F2" bg="transparent" />
      </Sequence>

      <Sequence from={fps * 5} durationInFrames={fps * 3}>
        <LogoReveal />
      </Sequence>
    </AbsoluteFill>
  );
};

const BgTransition: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = interpolate(frame, [fps * 4.6, fps * 5.2], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const bg = `rgb(${lerp(11, 246, t)}, ${lerp(10, 239, t)}, ${lerp(8, 228, t)})`;
  return <AbsoluteFill style={{ background: bg }} />;
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const Line: React.FC<{ text: string; color: string; bg: string }> = ({ text, color, bg }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const inDur = Math.round(fps * 0.35);
  const outStart = durationInFrames - inDur;
  const opacity = interpolate(
    frame,
    [0, inDur, outStart, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  const y = interpolate(frame, [0, inDur], [14, 0], {
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
          fontFamily: gaegu.fontFamily,
          fontWeight: 700,
          fontSize: 72,
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
    config: { damping: 12, stiffness: 120, mass: 0.9 },
  });

  const scale = interpolate(springProg, [0, 1], [0.55, 1]);
  const opacity = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const pulse = Math.sin((frame / fps) * Math.PI * 1.6) * 0.02 + 1;

  const subIn = interpolate(frame, [fps * 1.4, fps * 2.0], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const subY = interpolate(frame, [fps * 1.4, fps * 2.0], [18, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
      }}
    >
      <div style={{ transform: `scale(${scale * pulse})`, opacity }}>
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
