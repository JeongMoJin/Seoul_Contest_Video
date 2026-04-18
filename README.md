# seoul-i-video

> 2026 서울시 빅데이터 활용 경진대회 시연영상 파이프라인
> Playwright로 배포된 서울이 사이트를 자동 녹화 → Remotion으로 인트로/자막/아웃트로/BGM 합성.

## 파이프라인

```
[Playwright]  seoul-i.vercel.app 자동 조작 녹화
              └→ public/raw-demo.webm (또는 mp4)

[Remotion]    Intro(15s) + Demo(180s, raw + 자막) + Outro(20s) + BGM
              └→ out/seoul-i-final.mp4 (1920×1080 30fps H.264)
```

## 선결 조건

- Node.js 20+
- (권장) `ffmpeg` PATH — webm → mp4 자동 변환
- 배포된 서울이 프로덕션 URL 접속 가능

## 실행

### 1. 녹화
```bash
# 기본 (seoul-i.vercel.app)
npm run record

# 다른 URL이면
SEOUL_I_URL=https://my-preview.vercel.app npm run record
```
산출물: `public/raw-demo.webm` (+ ffmpeg 있으면 `raw-demo.mp4` 동시 생성)

### 2. Remotion Studio에서 타이밍 확인
```bash
npm start
# → http://localhost:3000 (Remotion Studio)
```
- 좌측 Composition list에서 `SeoulIVideo` 선택
- Timeline에서 Demo 씬 자막 타이밍이 raw 영상과 싱크 맞는지 확인
- `src/scenes/Demo.tsx`의 `captions` 배열 수정 후 즉시 반영

### 3. 최종 렌더링
```bash
npm run render
```
산출물: `out/seoul-i-final.mp4`

## BGM

`public/bgm.mp3` 를 드롭한 뒤 `src/SeoulIVideo.tsx`의 `HAS_BGM = true` 로 변경.
BGM 없으면 무음으로 진행.

**추천 무료 소스**:
- YouTube Audio Library (`youtube.com/audiolibrary`) — Acoustic/Calm 필터
- Pixabay Music (`pixabay.com/music`) — 무료 + 상업 이용 가능
- Artlist / Epidemic Sound — 유료지만 퀄리티 높음

## 커서

Playwright 녹화는 OS 커서가 찍히지 않음. `recorder/record.ts`에서 V2 accent 컬러(#E06856)
붉은 점 커서를 DOM에 주입해 합성.

## 커스터마이징

| 바꾸려는 것 | 위치 |
|---|---|
| 시나리오 (클릭·스크럽 순서) | `recorder/scenarios.ts` |
| 자막 타이밍·문구 | `src/scenes/Demo.tsx` `captions` 배열 |
| 인트로 문구/시간 | `src/scenes/Intro.tsx` |
| 아웃트로 URL/크레딧 | `src/scenes/Outro.tsx` |
| 전체 총 길이 | `src/SeoulIVideo.tsx` `INTRO_SEC/DEMO_SEC/OUTRO_SEC` |
| 1080p/4K 해상도 | `src/SeoulIVideo.tsx` `WIDTH/HEIGHT` |

## 체크포인트

1. **URL 확정** — `SEOUL_I_URL` 환경변수 or default (`seoul-i.vercel.app`)
2. **BGM** — `public/bgm.mp3` 드롭 + `HAS_BGM=true` or skip
3. **녹화 검수** — `public/raw-demo.mp4` 플레이백, 커서·스크럽·로딩 지연 점검
4. **자막 싱크** — Remotion Studio에서 timeline 맞춰 captions 타이밍 실측 재조정
5. **최종 렌더링** — `npm run render`, 완료 후 YouTube "일부 공개(Unlisted)"로 업로드

## 트러블슈팅

- **`record` 실행 중 셀렉터 miss** — 서울이 사이트 DOM이 바뀌었거나 모바일 레이아웃 렌더됨. scenarios.ts 셀렉터 업데이트.
- **Vercel cold start 초반 빈 화면** — `record.ts` 워밍업 로드 후 재방문 패턴 이미 적용. 지연 심하면 초기 `wait` ms 늘리기.
- **자막이 raw 영상 위에 안 올라감** — Demo.tsx의 `captions` from 프레임이 DEMO_FRAMES(5400) 초과했거나 `OffthreadVideo` 경로 확인.
- **한글 깨짐** — Remotion Studio는 Gaegu/NotoSansKR을 `@remotion/google-fonts`로 로드. 첫 렌더 시 네트워크 필요.

## 라이선스

- 폰트: Pretendard / Gaegu / JetBrains Mono / Noto Sans KR 모두 OFL
- 데이터: 서울 열린데이터광장 · 기상청 · 소방청
- 대회 출품작. 별도 고지 없이 사용 금지.
