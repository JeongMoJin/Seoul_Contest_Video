import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Sequence } from 'remotion';
import { loadFont as loadGaegu } from '@remotion/google-fonts/Gaegu';
import { loadFont as loadNoto } from '@remotion/google-fonts/NotoSansKR';
import { loadFont as loadMono } from '@remotion/google-fonts/JetBrainsMono';
import { QRCode } from '../components/QRCode';

const gaegu = loadGaegu();
const noto = loadNoto();
const mono = loadMono();

// 아웃트로 44초 구성:
//   0 ~ 9s    Phase A : face pulse + "서울이도 하루를 살아" + 의인화 부제
//   9 ~ 23s   Phase B : 대형 URL + QR + 부연
//   23 ~ 44s  Phase C : 대회·폰트·데이터·BGM 크레딧
export const Outro: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(180deg, #FBF7EE 0%, #F6EFE4 100%)',
      }}
    >
      <GlobalFade>
        <Sequence from={0} durationInFrames={fps * 9}>
          <PhaseA />
        </Sequence>

        <Sequence from={fps * 9} durationInFrames={fps * 14}>
          <PhaseB />
        </Sequence>

        <Sequence from={fps * 23} durationInFrames={fps * 21}>
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

  const subIn = interpolate(frame, [fps * 2.0, fps * 2.6], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
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
      <div
        style={{
          fontFamily: noto.fontFamily,
          fontSize: 32,
          color: '#7A6550',
          opacity: subIn,
          transform: `translateY(${(1 - subIn) * 14}px)`,
          letterSpacing: 1.5,
          marginTop: 8,
        }}
      >
        도시가 아닌 한 사람으로
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
  const qrIn = interpolate(frame, [fps * 1.0, fps * 1.7], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const subIn = interpolate(frame, [fps * 1.5, fps * 2.1], [0, 1], {
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
        opacity: localFade,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 64,
        }}
      >
        {/* 좌측: 텍스트 스택 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <div
            style={{
              fontFamily: gaegu.fontFamily,
              fontSize: 36,
              color: '#7A6550',
              opacity: urlIn,
              letterSpacing: 2,
              marginBottom: 12,
            }}
          >
            지금 만나보세요
          </div>
          <div
            style={{
              fontFamily: mono.fontFamily,
              fontSize: 92,
              color: '#E8704A',
              fontWeight: 800,
              letterSpacing: -2,
              opacity: urlIn,
              transform: `translateY(${(1 - urlIn) * 22}px)`,
              textShadow: '0 6px 28px rgba(232, 112, 74, 0.25)',
              lineHeight: 1,
            }}
          >
            seoul-i.vercel.app
          </div>
          <div
            style={{
              fontFamily: noto.fontFamily,
              fontSize: 26,
              color: '#3A2A1A',
              opacity: subIn,
              marginTop: 20,
              letterSpacing: 1,
            }}
          >
            원형 시계 · 25 자치구 친구들 · 건강검진표 PDF
          </div>
        </div>

        {/* 우측: QR 카드 */}
        <div
          style={{
            opacity: qrIn,
            transform: `scale(${0.9 + qrIn * 0.1})`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 14,
            padding: 28,
            background: '#FFFFFF',
            borderRadius: 20,
            boxShadow: '0 10px 40px rgba(90, 60, 30, 0.12)',
            border: '1px solid #EFE4D1',
          }}
        >
          <div
            style={{
              fontFamily: mono.fontFamily,
              fontSize: 18,
              color: '#B4A189',
              letterSpacing: 6,
              fontWeight: 700,
            }}
          >
            SCAN
          </div>
          <QRCode value="https://seoul-i.vercel.app" size={280} color="#1A1A1A" />
          <div
            style={{
              fontFamily: mono.fontFamily,
              fontSize: 16,
              color: '#E8704A',
              letterSpacing: 1,
              fontWeight: 700,
            }}
          >
            seoul-i.vercel.app
          </div>
        </div>
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
