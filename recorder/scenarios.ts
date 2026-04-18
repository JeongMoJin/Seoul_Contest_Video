export const TARGET_URL = process.env.SEOUL_I_URL ?? 'https://seoul-i.vercel.app';

export type Action =
  | { type: 'wait'; ms: number }
  | { type: 'move'; x: number; y: number; duration?: number }
  | { type: 'click'; selector: string }
  | { type: 'key'; key: string; times?: number; interval?: number }
  | { type: 'scrub'; fromHour: number; toHour: number; duration: number }
  | { type: 'scroll'; to: number; duration: number }
  | { type: 'goto'; path: string };

// 약 95~100초 분량 시나리오.
// SeoulIVideo.tsx의 DEMO_SEC과 맞추어야 싱크가 유지됨.
// 필요시 DEMO_SEC을 녹화 길이에 맞게 조정.
export const scenario: Action[] = [
  // 초기 hero 대기
  { type: 'wait', ms: 3000 },

  // 시간 스크럽 08시 → 18시 (8초)
  { type: 'scrub', fromHour: 8, toHour: 18, duration: 8000 },
  { type: 'wait', ms: 1500 },

  // 18시 → 03시 (8초)
  { type: 'scrub', fromHour: 18, toHour: 3, duration: 8000 },
  { type: 'wait', ms: 2000 },

  // 03시 일기 여운
  { type: 'wait', ms: 2500 },

  // 자치구 섹션으로 스크롤
  { type: 'scroll', to: 900, duration: 2500 },
  { type: 'wait', ms: 1500 },

  // 강남 카드 클릭 → 모달
  { type: 'click', selector: 'button:has-text("강남이")' },
  { type: 'wait', ms: 2500 },

  // 다음 친구 (오른쪽 화살표 2회)
  { type: 'key', key: 'ArrowRight', times: 2, interval: 1200 },
  { type: 'wait', ms: 1500 },

  // 모달 닫기
  { type: 'key', key: 'Escape' },
  { type: 'wait', ms: 800 },

  // /checkup 으로 이동
  { type: 'goto', path: '/checkup' },
  { type: 'wait', ms: 2500 },

  // 부문별 → 위험 신호 → 처방 스크롤
  { type: 'scroll', to: 600, duration: 3000 },
  { type: 'wait', ms: 2500 },
  { type: 'scroll', to: 1200, duration: 3000 },
  { type: 'wait', ms: 3000 },

  // PDF 버튼 hover (실제 클릭은 피함)
  { type: 'scroll', to: 0, duration: 1500 },
  { type: 'move', x: 1700, y: 70, duration: 800 },
  { type: 'wait', ms: 1500 },

  // 메인 복귀
  { type: 'goto', path: '/' },
  { type: 'wait', ms: 3000 },
];
