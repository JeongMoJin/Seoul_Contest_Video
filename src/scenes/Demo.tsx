import React from 'react';
import { AbsoluteFill, OffthreadVideo, Sequence, staticFile } from 'remotion';
import { Caption } from '../components/Caption';

// Demo 씬 = raw-demo.webm 위에 자막 오버레이. 63.24s 영상 · DEMO_SEC 64.
// 자막 타이밍은 recorder/record.ts 가 찍어준 action t= 로그에 정확히 동기화됨.
// 내러티브 방향: "서울을 한 명의 사람으로 의인화했다" — "서울이" 가 반복 등장해 각인.
//
// 실측 액션 타임라인 (scenario-relative 초):
//   0.00    main 정지
//   2.01    scrub 08 → 18
//  11.73    pause at 18
//  12.93    scrub 18 → 03
//  22.45    pause at 03
//  24.27    일기 체류
//  31.27    스크롤 → 자치구
//  33.78    자치구 그리드
//  35.10    강남이 모달 open
//  38.63    모달 close
//  39.24    /checkup 이동
//  39.95    checkup 상단 (종합 점수)
//  43.45    스크롤 → 위험 신호
//  45.97    위험 신호 체류
//  48.47    스크롤 → 정책 제언
//  50.98    정책 제언 체류
//  53.50    스크롤 top
//  55.02    PDF 버튼 hover
//  58.52    / 복귀
//  59.20    메인 최종
//  62.70    end (63.24s webm)

const captions: { from: number; dur: number; text: string }[] = [
  // 1.5 ~ 7s  '의인화' 훅 — 메인 정지 + 스크럽 초입
  { from: 45,   dur: 165, text: '서울을 한 명의 사람으로 본다면' },

  // 7 ~ 13s  출근·퇴근 스크럽 중
  { from: 210,  dur: 180, text: '08시 → 18시 · 서울이의 심장이 뛴다' },

  // 13 ~ 22s  저녁 → 새벽 스크럽 + 03시 도달
  { from: 390,  dur: 270, text: '03시 · 서울이도 쉰다' },

  // 24 ~ 31s  일기 체류 (7s)
  { from: 720,  dur: 210, text: '72편의 일기 · 서울이가 직접 말하는 하루' },

  // 33 ~ 38.5s  자치구 그리드 + 강남이 모달
  { from: 990,  dur: 165, text: '25 자치구 = 서울이의 25명의 친구' },

  // 40 ~ 44s  /checkup 상단
  { from: 1200, dur: 120, text: '서울이 건강검진표 · 종합 점수' },

  // 45.5 ~ 50s  위험 신호 스크롤
  { from: 1365, dur: 135, text: '이상치 탐지로 위험 시간대 찾아낸다' },

  // 51 ~ 55s  정책 제언 체류
  { from: 1530, dur: 120, text: '근거 있는 정책 제언 3건' },

  // 55.5 ~ 59s  PDF hover
  { from: 1665, dur: 105, text: '한국어 PDF 리포트 · 그대로 제출 가능' },

  // 60 ~ 63s  메인 최종
  { from: 1800, dur: 90,  text: 'seoul-i.vercel.app' },
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
