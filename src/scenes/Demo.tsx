import React from 'react';
import { AbsoluteFill, OffthreadVideo, Sequence, staticFile } from 'remotion';
import { Caption } from '../components/Caption';

// Demo 씬 = raw-demo.mp4 (CDP screencast) 위에 자막 오버레이. 67.43s 영상 · DEMO_SEC 68.
// CDP 캡처는 wallclock 62.7s 이지만 출력이 67.43s 로 1.075x 늘어짐 (ffmpeg PTS 처리).
// 자막 타이밍은 scenario t= 로그를 1.075 배율 적용해 씬 이벤트와 재동기화.
//
// 실측 액션 타임라인 (scenario wallclock × 1.075 = 영상 내 시간):
//   2.01 → 2.16    scrub 08 → 18
//  11.73 → 12.61   pause at 18
//  12.93 → 13.90   scrub 18 → 03
//  22.45 → 24.13   pause at 03
//  24.27 → 26.09   일기 체류
//  31.27 → 33.62   스크롤 → 자치구
//  35.10 → 37.73   강남이 모달 open
//  39.24 → 42.18   /checkup 이동
//  39.95 → 42.95   checkup 상단
//  43.45 → 46.71   위험 신호 스크롤
//  45.97 → 49.42   위험 신호 체류
//  48.47 → 52.11   정책 제언 스크롤
//  50.98 → 54.80   정책 제언 체류
//  55.02 → 59.14   PDF hover
//  58.52 → 62.90   / 복귀
//  62.70 → 67.40   end

const captions: { from: number; dur: number; text: string }[] = [
  // 1.6 ~ 7.5s  '의인화' 훅
  { from: 48,   dur: 177, text: '서울을 한 명의 사람으로 본다면' },

  // 7.5 ~ 14s  08 → 18 스크럽
  { from: 226,  dur: 195, text: '08시 → 18시 · 서울이의 심장이 뛴다' },

  // 14 ~ 24s  18 → 03 스크럽 + 도달
  { from: 420,  dur: 290, text: '03시 · 서울이도 쉰다' },

  // 26 ~ 33.5s  일기 체류
  { from: 775,  dur: 225, text: '72편의 일기 · 서울이가 직접 말하는 하루' },

  // 35.5 ~ 42s  자치구 + 강남이 모달
  { from: 1065, dur: 195, text: '25 자치구 = 서울이의 25명의 친구' },

  // 43 ~ 47.5s  건강검진표 상단
  { from: 1290, dur: 135, text: '서울이 건강검진표 · 종합 점수' },

  // 48.5 ~ 53.5s  위험 신호
  { from: 1455, dur: 150, text: '이상치 탐지로 위험 시간대 찾아낸다' },

  // 54.5 ~ 59s  정책 제언
  { from: 1635, dur: 135, text: '근거 있는 정책 제언 3건' },

  // 59.5 ~ 63s  PDF hover + 복귀
  { from: 1785, dur: 105, text: '한국어 PDF 리포트 · 그대로 제출 가능' },

  // 63.5 ~ 67s  메인 최종
  { from: 1905, dur: 105, text: 'seoul-i.vercel.app' },
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
