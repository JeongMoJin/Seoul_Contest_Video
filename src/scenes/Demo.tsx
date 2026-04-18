import React from 'react';
import { AbsoluteFill, OffthreadVideo, Sequence, staticFile } from 'remotion';
import { Caption } from '../components/Caption';

// Demo 씬은 raw-demo.mp4 위에 자막을 얹는다. 180초 구간.
// from/dur 단위: 프레임 (30fps). raw-demo.mp4 실측 타임라인에 맞춰 조정.
// 초기값은 scenarios.ts 기준 예상치.
// 편집 팁: Remotion Studio에서 timeline 보며 captions 배열만 조정하면 됨.

const FPS = 30;
const s = (sec: number) => Math.round(sec * FPS);

const captions: { from: number; dur: number; text: string }[] = [
  // 0-6s: 초기 대기 + 스크럽 준비 — 자막 없음

  // 6-14s: 08시 → 18시 스크럽 구간
  { from: s(6), dur: s(8), text: '오전 8시 — 출근 인파로 서울이의 심장이 뛴다' },

  // 15-25s: 18시 도달, 혈류/긴장 고조
  { from: s(15), dur: s(8), text: '오후 6시, 퇴근 — 도심 순환이 느려진다' },

  // 26-36s: 18시 → 03시 스크럽
  { from: s(26), dur: s(8), text: '새벽 3시 — 서울이도 쉰다. 119만이 깨어있는 시간' },

  // 37-44s: 스크롤 자치구 섹션
  { from: s(37), dur: s(7), text: '서울이는 혼자가 아니다 · 25 친구들' },

  // 45-55s: 강남 모달 + 순회
  { from: s(45), dur: s(6), text: '강남이 — 테헤란로 또 막혀' },

  // 52-58s: 다음 친구
  { from: s(52), dur: s(5), text: '각자 다른 하루를 살아도, 우리는 같은 도시' },

  // 58-75s: /checkup 이동 + 스크롤
  { from: s(58), dur: s(8), text: '🏥 서울이 건강검진표 — 종합 점수' },

  { from: s(68), dur: s(6), text: '위험 시간대 탐지 · z-score > 2' },

  // 75-90s: 정책 제언 스크롤
  { from: s(75), dur: s(8), text: '처방 — 심야 순찰 · 열섬 완화 · 퇴근 순환 개선' },

  { from: s(84), dur: s(5), text: 'PDF 다운로드 지원 · 한글 완벽 임베드' },

  // 90-95s: 메인 복귀
  { from: s(92), dur: s(5), text: '7종 오픈데이터 · 24시간 · 25자치구' },
];

export const Demo: React.FC = () => {
  return (
    <AbsoluteFill>
      <OffthreadVideo src={staticFile('raw-demo.mp4')} />

      {captions.map((c, i) => (
        <Sequence key={i} from={c.from} durationInFrames={c.dur}>
          <Caption text={c.text} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
