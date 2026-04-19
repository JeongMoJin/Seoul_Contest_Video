import React from 'react';
import { AbsoluteFill, OffthreadVideo, Sequence, staticFile } from 'remotion';
import { Caption } from '../components/Caption';

// Demo 씬 = raw-demo.mp4 위에 자막 오버레이.
// from/dur 단위 = 프레임 (30fps). Demo 내부 상대 시간 기준.
// scenarios.ts 의 실측 타임라인과 싱크를 맞춰야 하며, Remotion Studio 프리뷰에서 미세 조정.
const captions: { from: number; dur: number; text: string }[] = [
  // 0 ~ 16s  시간 스크럽 (08→18→03)
  { from: 30,   dur: 90,  text: '08시 · 심장이 가장 뛰는 시간' },
  { from: 180,  dur: 90,  text: '18시 · 도심 순환이 느려진다' },
  { from: 330,  dur: 90,  text: '03시 · 서울이도 쉰다' },

  // 16 ~ 24s  일기 영역 체류
  { from: 450,  dur: 180, text: '72편의 일기 · 1인칭 감정의 언어로' },

  // 24 ~ 37s  자치구 섹션 + 강남이 모달
  { from: 690,  dur: 180, text: '25명의 친구 · 25개 자치구 페르소나' },

  // 37 ~ 52s  건강검진표
  { from: 1080, dur: 180, text: '서울이 건강검진표 · 종합 69점' },
  { from: 1380, dur: 180, text: '이상치 탐지 → 근거 있는 정책 제언 3건' },

  // 56 ~ 66s  데이터 투명성
  { from: 1680, dur: 180, text: '실데이터 3종 + 4월 서울의 하루' },

  // 63 ~ 67s  URL 안내 (demo 69s 안에 수렴)
  { from: 1900, dur: 120, text: 'seoul-i.vercel.app' },
];

export const Demo: React.FC = () => {
  return (
    <AbsoluteFill>
      <OffthreadVideo src={staticFile('raw-demo.webm')} />

      {captions.map((c, i) => (
        <Sequence key={i} from={c.from} durationInFrames={c.dur}>
          <Caption text={c.text} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
