# 배포(덮어쓰기) 가이드 — 에브리옵션 with GREEK

이 폴더의 내용으로 기존 사이트(`cha-bot-starterkit-2d.vercel.app`)를 **덮어써서** 배포하는 방법입니다.

> ⚠️ 덮어쓰면 그 URL의 기존 사이트는 이 버전으로 **교체**됩니다.
> 기존 버전을 남기고 싶으면 새 저장소/새 프로젝트로 배포하세요(맨 아래 참고).

---

## 무엇이 바뀌었나
- 기존 **카카오 로그인 · 챗봇(스트리밍/음성) · VRM 아바타**는 그대로 유지.
- 추가: **옵션 학습 패널**(용어 검색 · 용어 퀴즈 · 모의고사) — 상단 "📚 옵션 학습" 버튼.
  - 학습 패널의 "GREEK에게 물어보기"는 기존 챗봇으로 그대로 연결됩니다.
- 변경 파일: `src/App.jsx`, `index.html`
- 추가 파일: `src/components/LearningPanel.jsx`, `src/components/LearningPanel.module.css`, `public/greek.png`

---

## 방법 A. 로컬에서 git push (권장)

기존 사이트와 연결된 GitHub 저장소를 이미 갖고 있다고 가정합니다.

```bash
# 1) 기존 저장소를 클론 (이미 있으면 생략)
git clone <기존-저장소-URL> mybot
cd mybot

# 2) 이 zip의 내용으로 파일을 덮어쓴다
#    (이 가이드 폴더의 모든 파일을 저장소 루트로 복사. node_modules는 건드리지 않음)
#    macOS/Linux 예:
cp -R /압축푼경로/* .       # 숨김파일 포함하려면: cp -R /압축푼경로/. .

# 3) 변경 확인 후 커밋·푸시
git add .
git commit -m "에브리옵션 with GREEK: 옵션 학습 기능(용어·퀴즈·모의고사) 추가"
git push
```

push하면 Vercel이 자동으로 다시 빌드·배포하여 **같은 URL**에 반영됩니다.

---

## 방법 B. GitHub 웹에서 업로드

1. 기존 저장소 페이지 → **Add file → Upload files**
2. 이 폴더의 파일/폴더를 드래그해서 업로드(기존 파일은 덮어쓰기됨)
3. **Commit changes** → Vercel 자동 배포

---

## 배포 후 반드시 확인 (환경변수)

Vercel → 프로젝트 → **Settings → Environment Variables** 에 아래가 등록돼 있어야 작동합니다
(기존 사이트가 이미 작동 중이었다면 대부분 그대로 있을 겁니다):

| 변수 | 설명 |
|---|---|
| `VITE_KAKAO_JS_KEY` | 카카오 개발자 콘솔 → JavaScript 키 (카카오 로그인용) |
| `ONPREMISE_BASE_URL` | 챗봇/RAG 백엔드 주소 |
| `ONPREMISE_API_KEY` | 백엔드 API 키 |
| (선택) `OPENAI_API_KEY`, `VITE_CHAT_LOG_ENDPOINT` | `.env.example` 참고 |

환경변수를 바꿨으면 Vercel에서 **Redeploy** 한 번 눌러주세요.

### 카카오 로그인 도메인
카카오 개발자 콘솔 → 내 애플리케이션 → **카카오 로그인 → Redirect URI / 플랫폼(Web) 도메인** 에
이 사이트 주소(예: `https://cha-bot-starterkit-2d.vercel.app`)가 등록돼 있어야 로그인이 됩니다.

---

## 로컬에서 먼저 확인하려면
```bash
npm install
npm run dev      # http://localhost:5173
```

---

## 기존 버전을 남기고 새 URL로 배포하려면
1. 새 GitHub 저장소를 만들어 이 폴더를 올린다
2. Vercel → **Add New → Project** → 그 저장소 import
3. 위 환경변수 등록 + 카카오 Redirect URI에 새 주소 추가
4. Deploy → 예: `https://everyoption-greek.vercel.app`
