export const TARGET_URL = process.env.SEOUL_I_URL ?? 'https://seoul-i.vercel.app';

export type Action =
  | { type: 'wait'; ms: number }
  | { type: 'move'; x: number; y: number; duration?: number }
  | { type: 'click'; selector: string }
  | { type: 'key'; key: string; times?: number; interval?: number }
  | { type: 'scrub'; fromHour: number; toHour: number; duration: number }
  | { type: 'scroll'; to: number; duration: number }
  | { type: 'goto'; path: string };

// 목표 demo 길이: 약 80초 (SeoulIVideo.tsx DEMO_SEC=80 과 싱크)
// 실측 후 DEMO_SEC 재조정 가능. 누적 시간 주석은 대략치.
export const scenario: Action[] = [
  // 0 ~ 2s   초기 메인 정지
  { type: 'wait', ms: 2000 },

  // 2 ~ 8s   08 → 18시 스크럽 (6초)
  { type: 'scrub', fromHour: 8, toHour: 18, duration: 6000 },
  { type: 'wait', ms: 1200 },

  // 8 ~ 16s  18 → 03시 스크럽 (6초)
  { type: 'scrub', fromHour: 18, toHour: 3, duration: 6000 },
  { type: 'wait', ms: 1800 },

  // 16 ~ 24s  일기 체류 — 스크럽 직후 SeouliDiary 를 8초 정지로 보여줌
  { type: 'wait', ms: 7000 },

  // 24 ~ 30s  자치구 섹션으로 부드러운 스크롤
  { type: 'scroll', to: 900, duration: 2500 },
  { type: 'wait', ms: 1300 },

  // 30 ~ 37s  강남이 카드 클릭 → 모달 체류 → 닫기
  { type: 'click', selector: 'button:has-text("강남이")' },
  { type: 'wait', ms: 3500 },
  { type: 'key', key: 'Escape' },
  { type: 'wait', ms: 600 },

  // 37 ~ 44s  /checkup 이동 + 상단 체류
  { type: 'goto', path: '/checkup' },
  { type: 'wait', ms: 3500 },

  // 44 ~ 52s  부문 스코어 → 위험 신호 스크롤
  { type: 'scroll', to: 550, duration: 2500 },
  { type: 'wait', ms: 2500 },

  // 52 ~ 60s  정책 제언 스크롤
  { type: 'scroll', to: 1150, duration: 2500 },
  { type: 'wait', ms: 2500 },

  // 60 ~ 66s  PDF 버튼 hover (실클릭 회피)
  { type: 'scroll', to: 0, duration: 1500 },
  { type: 'move', x: 1400, y: 80, duration: 1000 },
  { type: 'wait', ms: 2000 },

  // 66 ~ 72s  메인 복귀 최종 샷
  { type: 'goto', path: '/' },
  { type: 'wait', ms: 3500 },
];
