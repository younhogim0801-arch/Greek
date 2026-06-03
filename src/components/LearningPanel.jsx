import { useState } from 'react'
import styles from './LearningPanel.module.css'

/* ──────────────────────────────────────────────────────────────
   에브리옵션 with GREEK — 학습 패널
   기존 스타터킷(카카오 로그인 + VRM 아바타 + 스트리밍 챗봇)은 그대로 두고,
   용어 검색 / 용어 퀴즈 / 모의고사 3가지 학습 기능만 추가합니다.
   "GREEK에게 물어보기"는 props.onAsk(질문) → App의 sendMessage로 연결되어
   기존 챗봇(/api/chat-stream)이 답합니다.
   ────────────────────────────────────────────────────────────── */

const GREEK_AVATAR = '/greek.png'  // public/greek.png

// 로컬 용어 사전 (검색 → 결과 카드)
const GLOSSARY = [
  { term: '콜옵션', cat: '콜/풋', one: '정해진 가격에 살 수 있는 권리', easy: "기초자산을 미래에 '미리 정한 가격'으로 살 수 있는 권리예요. 가격이 오를수록 이 권리의 가치가 커집니다.", ex: '삼성전자를 7만원에 살 권리를 샀는데 주가가 8만원이 되면 이익.' },
  { term: '풋옵션', cat: '콜/풋', one: '정해진 가격에 팔 수 있는 권리', easy: "기초자산을 '미리 정한 가격'으로 팔 수 있는 권리예요. 하락에 대비하는 보험처럼 쓰입니다.", ex: '주가 하락이 걱정될 때 풋을 사두면 떨어져도 정해진 가격에 팔 수 있어요.' },
  { term: '행사가격', cat: '기초', one: '옵션을 행사할 때 적용되는 미리 정한 가격', easy: '옵션 계약에서 사거나 팔기로 약속한 가격이에요. 스트라이크(Strike)라고도 합니다.', ex: '행사가 100인 콜은 주가가 100을 넘어야 이익이 나기 시작해요.' },
  { term: '프리미엄', cat: '기초', one: '옵션을 사기 위해 지불하는 가격', easy: '옵션이라는 권리를 사는 데 내는 돈이에요. 매수자의 최대 손실은 이 프리미엄으로 제한됩니다.', ex: '콜옵션 프리미엄 5를 내면, 아무리 손해 봐도 손실은 5예요.' },
  { term: '만기일', cat: '기초', one: '옵션 권리를 행사할 수 있는 마지막 날', easy: '이 날이 지나면 옵션의 권리는 사라져요. 만기에 가까울수록 시간가치는 빠르게 줄어듭니다.', ex: '국내 코스피200 옵션은 보통 매월 둘째 주 목요일이 만기예요.' },
  { term: '내재가치', cat: '기초', one: '지금 당장 행사하면 얻는 이익', easy: '옵션을 지금 행사했을 때 실제로 남는 이익이에요. 외가격 옵션의 내재가치는 0입니다.', ex: '행사가 100 콜인데 주가가 110이면 내재가치는 10.' },
  { term: '시간가치', cat: '기초', one: '만기까지 남은 시간이 주는 추가 가치', easy: '아직 가격이 더 움직일 수 있다는 기대 때문에 붙는 가치예요. 시간이 지날수록 줄어듭니다(세타).', ex: '같은 등가격 옵션도 만기가 멀수록 시간가치가 커요.' },
  { term: '델타', cat: '그릭스', one: '기초자산 1 변화당 옵션 가격의 변화', easy: '주가가 1 움직일 때 옵션 가격이 얼마나 따라 움직이는지예요. 방향 민감도라고 생각하면 쉬워요.', ex: '델타 0.5인 콜은 주가가 1000원 오르면 약 500원 올라요.' },
  { term: '감마', cat: '그릭스', one: '기초자산 변화에 따른 델타의 변화율', easy: '델타가 얼마나 빠르게 변하는지예요. 감마가 크면 델타가 민감하게 출렁입니다.', ex: '등가격·만기 임박 옵션은 감마가 커서 변동이 급격해요.' },
  { term: '세타', cat: '그릭스', one: '시간이 지남에 따른 옵션 가치의 감소', easy: '하루가 지날 때마다 옵션 가치가 줄어드는 정도예요. 매수자에겐 시간이라는 세금 같은 존재죠.', ex: '주가가 그대로여도 하루 지나면 세타만큼 가치가 빠져요.' },
  { term: '베가', cat: '그릭스', one: '변동성 변화에 대한 옵션 가격의 민감도', easy: '시장의 출렁임(변동성)이 커지면 옵션 가격이 얼마나 오르는지예요.', ex: '실적 발표 전 변동성이 커지면 베가 때문에 옵션값이 비싸져요.' },
  { term: '로', cat: '그릭스', one: '금리 변화에 대한 옵션 가격의 민감도', easy: '금리가 변할 때 옵션 가격이 얼마나 영향을 받는지예요. 보통 영향이 가장 작은 그릭입니다.', ex: '금리가 크게 오르면 콜 가치가 약간 올라가는 식이에요.' },
  { term: '내재변동성', cat: '그릭스', one: '시장이 예상하는 미래의 변동성', easy: '옵션 가격에 반영된, 앞으로 얼마나 출렁일지에 대한 시장의 기대예요. IV라고 부릅니다.', ex: 'IV가 높으면 옵션이 비싸고, 큰 변동을 예상한다는 뜻.' },
  { term: '등가격', cat: '기초', one: '행사가와 현재가가 거의 같은 상태', easy: 'ATM(At The Money). 시간가치가 가장 크고 감마도 큰 구간이에요.', ex: '주가 100, 행사가 100이면 등가격.' },
  { term: '내가격', cat: '기초', one: '지금 행사하면 이익인 상태', easy: 'ITM(In The Money). 내재가치가 있는 옵션이에요.', ex: '행사가 100 콜인데 주가가 110이면 내가격.' },
  { term: '외가격', cat: '기초', one: '지금 행사하면 이익이 없는 상태', easy: 'OTM(Out of The Money). 내재가치가 0이고 시간가치만 있어요. 만기에 외가격이면 가치는 0.', ex: '행사가 100 콜인데 주가가 90이면 외가격.' },
  { term: '커버드 콜', cat: '전략', one: '보유 주식에 콜을 팔아 프리미엄을 버는 전략', easy: '들고 있는 주식에 콜옵션을 팔아 매달 프리미엄 수익을 얻는 안정 지향 전략이에요.', ex: '주가가 크게 안 오를 것 같을 때 추가 수익을 노려요.' },
  { term: '불 콜 스프레드', cat: '전략', one: '콜을 사고 더 높은 콜을 팔아 비용을 줄인 상승 전략', easy: '완만한 상승을 노릴 때 써요. 수익도 손실도 제한된 안정형 상승 베팅입니다.', ex: '행사가 100 콜 매수 + 110 콜 매도.' },
  { term: '베어 풋 스프레드', cat: '전략', one: '풋을 사고 더 낮은 풋을 팔아 비용을 줄인 하락 전략', easy: '완만한 하락을 노릴 때 써요. 불 콜 스프레드의 거울상입니다.', ex: '행사가 100 풋 매수 + 90 풋 매도.' },
  { term: '롱 스트래들', cat: '전략', one: '같은 행사가의 콜·풋을 동시에 사는 변동성 전략', easy: '방향은 몰라도 크게 움직일 것에 베팅해요. 오르든 내리든 충분히 움직이면 이익.', ex: '실적 발표처럼 큰 변동이 예상될 때.' },
  { term: '아이언 콘도르', cat: '전략', one: '양쪽에 옵션을 팔아 횡보장에서 버는 전략', easy: '주가가 좁은 박스권에서 움직일 때, 가만히 있으면 버는 구조를 만들어요.', ex: '변동이 적을 거라 볼 때 위·아래로 옵션을 매도.' },
  { term: '프로텍티브 풋', cat: '전략', one: '보유 주식에 풋을 더해 하락을 방어하는 보험 전략', easy: '주식을 들고 풋을 사두면 하락 손실에 바닥이 생겨요. 상승 이익은 그대로 누립니다.', ex: '급락이 걱정될 때 보유 주식에 풋을 추가.' },
  { term: '증거금', cat: '제도·자격', one: '옵션 매도 시 예치하는 담보', easy: '옵션을 팔(매도) 때 손실 위험에 대비해 미리 맡겨두는 돈이에요.', ex: '매도 포지션은 손실이 클 수 있어 증거금이 필요해요.' },
  { term: '청산', cat: '제도·자격', one: '보유 포지션을 반대매매로 정리하는 것', easy: '가지고 있던 옵션을 반대로 거래해 포지션을 닫는 거예요.', ex: '매수했던 콜을 다시 팔아 청산.' },
]

const TERM_EXAMPLES = ['델타', '내재변동성', '불 콜 스프레드', '프로텍티브 풋', '행사가격', '아이언 콘도르']

// 모의고사 풀 (20문제)
const EXAM = [
  { q: "콜옵션 '매수자'가 이익을 보는 상황은?", a: ['기초자산 가격 하락', '기초자산 가격 상승', '가격 변동 없음', '만기 연장'], c: 1, k: '콜옵션', w: "콜옵션은 '살 권리'라 시장가가 행사가보다 높이 오를수록 이익이 커집니다." },
  { q: "풋옵션 '매수자'가 이익을 보는 상황은?", a: ['기초자산 가격 상승', '기초자산 가격 하락', '변동 없음', '금리 상승'], c: 1, k: '풋옵션', w: "풋옵션은 '팔 권리'라 시장가가 행사가보다 낮아질수록 이익이 커집니다." },
  { q: "'세타(Θ)'가 의미하는 것은?", a: ['방향 민감도', '시간에 따른 가치 감소', '변동성 민감도', '금리 민감도'], c: 1, k: '세타', w: "세타는 시간이 흐르며 옵션 가치가 줄어드는 정도. 매수자에겐 '시간이라는 세금'이에요." },
  { q: "'델타(Δ)'가 의미하는 것은?", a: ['시간 가치 감소', '기초자산 1변화당 옵션 가격 변화', '변동성 민감도', '금리 민감도'], c: 1, k: '델타', w: '델타는 기초자산이 1 움직일 때 옵션 가격이 얼마나 따라 움직이는지 — 방향 민감도입니다.' },
  { q: '주식을 보유한 채 하락 위험만 방어하려면?', a: ['콜옵션 매도', '프로텍티브 풋', '롱 스트래들', '콜옵션 매수'], c: 1, k: '프로텍티브 풋', w: '보유 주식에 풋을 더하면 하락에 바닥(보험)을 만들면서 상승 이익은 그대로 누립니다.' },
  { q: "방향은 모르지만 '큰 변동성'을 예상할 때 적합한 전략은?", a: ['불 콜 스프레드', '커버드 콜', '롱 스트래들', '아이언 콘도르'], c: 2, k: '롱 스트래들', w: '롱 스트래들은 콜·풋을 동시에 사서 오르든 내리든 크게만 움직이면 이익이 납니다.' },
  { q: '주가가 좁은 박스권에서 횡보할 때 수익을 노리는 전략은?', a: ['롱 스트래들', '아이언 콘도르', '롱 콜', '프로텍티브 풋'], c: 1, k: '아이언 콘도르', w: "아이언 콘도르는 양쪽에 옵션을 팔아 '가만히 있으면 버는' 횡보장 전략입니다." },
  { q: '다른 조건이 같을 때 시간가치가 가장 큰 옵션은?', a: ['만기 임박한 깊은 외가격', '만기 충분히 남은 등가격', '만기 임박한 내가격', '만기가 지난 옵션'], c: 1, k: '시간가치', w: '시간가치는 만기가 많이 남고 등가격일 때 가장 큽니다.' },
  { q: '내재변동성(IV) 상승이 예상될 때 일반적으로 유리한 포지션은?', a: ['옵션 매도', '옵션 매수', '전혀 무관', '예금'], c: 1, k: '베가', w: '변동성이 오르면 옵션 가격(특히 매수 포지션)이 오르는 경향이 있어 매수가 유리합니다.' },
  { q: "콜옵션 '매수자'의 최대 손실은?", a: ['무제한', '지불한 프리미엄', '행사가격만큼', '0'], c: 1, k: '프리미엄', w: '옵션 매수자의 손실은 지불한 프리미엄으로 제한됩니다.' },
  { q: "(무방비) 콜옵션 '매도자'가 지는 위험은?", a: ['손실이 항상 제한적', '손실이 매우 커질 수 있음', '위험이 전혀 없음', '프리미엄만 손실'], c: 1, k: '증거금', w: '주가가 크게 오르면 매도자의 손실은 이론상 매우 커질 수 있어 증거금이 필요합니다.' },
  { q: '커버드 콜 전략의 주된 목적은?', a: ['보유 주식에서 추가 프리미엄 수익', '주가 폭등에 베팅', '하락 방어', '변동성 매수'], c: 0, k: '커버드 콜', w: '보유 주식에 콜을 팔아 프리미엄 수익을 얻는 안정 지향 전략입니다.' },
  { q: "'등가격(ATM)'의 뜻으로 옳은 것은?", a: ['행사가와 현재가가 거의 같음', '지금 행사하면 큰 이익', '지금 행사하면 큰 손해', '만기가 지난 상태'], c: 0, k: '등가격', w: 'ATM은 행사가와 현재가가 거의 일치하는 상태입니다.' },
  { q: '만기 시점에 외가격(OTM) 옵션의 가치는?', a: ['프리미엄만큼', '0', '행사가격만큼', '무한대'], c: 1, k: '외가격', w: '외가격 옵션은 행사할 이유가 없어 만기에 가치가 0이 됩니다.' },
  { q: "'감마(Γ)'가 큰 옵션의 특징은?", a: ['델타가 빠르게 변한다', '시간 감소가 없다', '변동성과 무관하다', '금리에만 반응한다'], c: 0, k: '감마', w: '감마는 델타의 변화 속도라, 감마가 크면 델타가 민감하게 출렁입니다.' },
  { q: '불 콜 스프레드의 최대 손실은?', a: ['무제한', '지불한 순비용으로 제한', '행사가만큼', '0'], c: 1, k: '불 콜 스프레드', w: '스프레드는 손익이 모두 제한되어, 최대 손실은 지불한 순비용입니다.' },
  { q: "'내재변동성(IV)'이 의미하는 것은?", a: ['과거 실제 변동성', '시장이 예상하는 미래 변동성', '무위험 금리', '배당률'], c: 1, k: '내재변동성', w: 'IV는 옵션 가격에 반영된, 시장이 기대하는 미래 변동성입니다.' },
  { q: "'행사가격(Strike)'의 뜻은?", a: ['현재 시장가', '미리 정해 둔 매매 가격', '지불한 프리미엄', '만기일'], c: 1, k: '행사가격', w: '행사가격은 옵션을 행사할 때 적용되는 미리 약속한 가격입니다.' },
  { q: '롱 스트래들이 손실을 보는 경우는?', a: ['주가가 크게 오를 때', '주가가 크게 내릴 때', '주가가 거의 안 움직일 때', '변동성이 급등할 때'], c: 2, k: '롱 스트래들', w: '양방향 매수라, 주가가 거의 움직이지 않으면 낸 프리미엄만큼 손실이 납니다.' },
  { q: '프로텍티브 풋의 효과로 옳은 것은?', a: ['상승 이익을 포기', '하락 손실에 바닥을 만든다', '수익이 무제한 줄어듦', '배당이 늘어남'], c: 1, k: '프로텍티브 풋', w: '보유 주식의 하락 손실에 바닥(보험)을 만들어 주는 전략입니다.' },
]

const shuffle = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]] } return a }
const pickN = (arr, n) => shuffle(arr).slice(0, n)
const norm = (s) => (s || '').replace(/\s+/g, '').toLowerCase()

export default function LearningPanel({ open, onClose, onAsk }) {
  const [tab, setTab] = useState('glossary')
  if (!open) return null
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.head}>
          <img src={GREEK_AVATAR} alt="GREEK" />
          <div className={styles.ttl}>옵션 학습<small>EveryOption with GREEK</small></div>
          <button className={styles.close} onClick={onClose}>✕</button>
        </div>
        <div className={styles.tabs}>
          <div className={`${styles.tab} ${tab === 'glossary' ? styles.on : ''}`} onClick={() => setTab('glossary')}>용어 검색</div>
          <div className={`${styles.tab} ${tab === 'vocab' ? styles.on : ''}`} onClick={() => setTab('vocab')}>용어 퀴즈</div>
          <div className={`${styles.tab} ${tab === 'exam' ? styles.on : ''}`} onClick={() => setTab('exam')}>모의고사</div>
        </div>
        <div className={styles.body}>
          {tab === 'glossary' && <Glossary onAsk={onAsk} />}
          {tab === 'vocab' && <VocabQuiz />}
          {tab === 'exam' && <MockExam />}
        </div>
      </div>
    </div>
  )
}

/* ── 용어 검색 ── */
function Glossary({ onAsk }) {
  const [q, setQ] = useState('')
  const [res, setRes] = useState(null)
  const [missTerm, setMiss] = useState('')
  const lookup = (term) => {
    const t = (term ?? q).trim()
    if (!t) return
    setQ(t)
    const nq = norm(t)
    const hit = GLOSSARY.find(g => norm(g.term) === nq)
      || GLOSSARY.find(g => norm(g.term).includes(nq) || nq.includes(norm(g.term)))
    if (hit) { setRes(hit); setMiss('') } else { setRes(null); setMiss(t) }
  }
  return (
    <div>
      <div className={styles.eyebrow}>용어 검색</div>
      <div className={styles.h1}>모르는 옵션 용어, 검색하면 바로</div>
      <div className={styles.sub}>용어를 입력하면 한 줄 정의 · 쉬운 설명 · 예시를 보여드려요. 사전에 없으면 GREEK 챗봇이 답합니다.</div>
      <div className={styles.searchRow}>
        <div className={styles.searchBox}>
          <span style={{ color: 'var(--gold)' }}>🔍</span>
          <input value={q} placeholder="예: 델타, 내재변동성, 불 콜 스프레드…" onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && lookup()} />
        </div>
        <button className={styles.btn} disabled={!q.trim()} onClick={() => lookup()}>검색</button>
      </div>
      <div className={styles.chips}>{TERM_EXAMPLES.map(t => <span className={styles.chip} key={t} onClick={() => lookup(t)}>{t}</span>)}</div>

      {res && (
        <div className={styles.card}>
          <span className={styles.cat}>{res.cat}</span>
          <h2>{res.term}</h2>
          <div className={styles.one}>{res.one}</div>
          <p className={styles.easy}>{res.easy}</p>
          <div className={styles.ex}>예시 — {res.ex}</div>
          <button className={styles.btn + ' ' + styles.ghost} style={{ marginTop: 18 }} onClick={() => onAsk?.(`'${res.term}'를 더 쉽게, 예시를 들어 설명해줘`)}>✦ GREEK에게 더 묻기</button>
        </div>
      )}
      {missTerm && (
        <div className={styles.card}>
          <h2 style={{ fontSize: 20 }}>'{missTerm}' 는 사전에 없네요</h2>
          <p className={styles.easy}>GREEK 챗봇에게 직접 물어보면 바로 설명해 드려요.</p>
          <button className={styles.btn} style={{ marginTop: 14 }} onClick={() => onAsk?.(`'${missTerm}'가 무슨 뜻이야? 옵션 초보도 이해하게 쉽게 설명해줘`)}>✦ GREEK에게 물어보기</button>
        </div>
      )}
      <div className={styles.note}>※ 검색은 내장 사전 기반이며, 그 외 질문은 기존 챗봇으로 연결됩니다.</div>
    </div>
  )
}

/* ── 용어 퀴즈 ── */
function buildVocab() {
  return pickN(GLOSSARY, 5).map(t => {
    const others = shuffle(GLOSSARY.filter(g => g.term !== t.term)).slice(0, 3).map(g => g.one)
    const opts = shuffle([t.one, ...others])
    return { term: t.term, options: opts, correct: opts.indexOf(t.one) }
  })
}
function VocabQuiz() {
  const [round, setRound] = useState(buildVocab)
  const [ans, setAns] = useState({})
  const [done, setDone] = useState(false)
  const score = round.reduce((a, qq, i) => a + (ans[i] === qq.correct ? 1 : 0), 0)
  const reset = () => { setRound(buildVocab()); setAns({}); setDone(false) }
  return (
    <div>
      <div className={styles.eyebrow}>용어 퀴즈 · 매번 새로운 5문제</div>
      <div className={styles.h1}>뜻을 정확히 알고 있나요?</div>
      <div className={styles.sub}>용어 사전에서 5문제가 랜덤 출제됩니다. 올바른 뜻을 고르세요.</div>
      <div style={{ marginTop: 18 }}>
        {round.map((qq, i) => (
          <div className={styles.q} key={i}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>Q{i + 1}. <span style={{ color: 'var(--gold)' }}>{qq.term}</span> 의 뜻은?</div>
            {qq.options.map((opt, j) => {
              const sel = ans[i] === j; let cls = styles.opt + (sel ? ' ' + styles.sel : '')
              if (done) { if (j === qq.correct) cls = styles.opt + ' ' + styles.right; else if (sel) cls = styles.opt + ' ' + styles.wrong }
              return <div key={j} className={cls} onClick={() => !done && setAns(a => ({ ...a, [i]: j }))}><span className={styles.mk}>{'ABCD'[j]}</span>{opt}</div>
            })}
          </div>
        ))}
      </div>
      {!done
        ? <button className={styles.btn} disabled={Object.keys(ans).length < round.length} onClick={() => setDone(true)}>채점하기 →</button>
        : (<div className={styles.diag}>
          <span className={styles.score}>{score}/{round.length}</span>
          <span style={{ marginLeft: 12, fontSize: 14 }}>{score === round.length ? '완벽해요! 용어는 확실히 잡혔네요.' : '좋아요 — 새 문제로 한 번 더 다져볼까요?'}</span>
          <div><button className={styles.btn + ' ' + styles.ghost} style={{ marginTop: 16 }} onClick={reset}>↻ 새 문제로 다시</button></div>
        </div>)}
    </div>
  )
}

/* ── 모의고사 ── */
function MockExam() {
  const N = 5
  const [picked, setPicked] = useState(() => pickN(EXAM.map((_, i) => i), N))
  const [ans, setAns] = useState({})
  const [done, setDone] = useState(false)
  const round = picked.map(i => EXAM[i])
  const score = round.reduce((a, qq, i) => a + (ans[i] === qq.c ? 1 : 0), 0)
  const wrong = round.filter((qq, i) => done && ans[i] !== qq.c)
  const reset = () => { setPicked(pickN(EXAM.map((_, i) => i), N)); setAns({}); setDone(false) }
  return (
    <div>
      <div className={styles.eyebrow}>모의고사 · {EXAM.length}문제 풀에서 {N}문제 랜덤 출제</div>
      <div className={styles.h1}>자격시험 족집게 모의고사</div>
      <div className={styles.sub}>매번 다른 {N}문제가 출제됩니다. 채점 후 틀린 개념만 콕 집어 진단해 드려요.</div>
      <div style={{ marginTop: 18 }}>
        {round.map((qq, i) => (
          <div className={styles.q} key={i}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>Q{i + 1}. {qq.q}</div>
            {qq.a.map((opt, j) => {
              const sel = ans[i] === j; let cls = styles.opt + (sel ? ' ' + styles.sel : '')
              if (done) { if (j === qq.c) cls = styles.opt + ' ' + styles.right; else if (sel) cls = styles.opt + ' ' + styles.wrong }
              return <div key={j} className={cls} onClick={() => !done && setAns(a => ({ ...a, [i]: j }))}><span className={styles.mk}>{'ABCD'[j]}</span>{opt}</div>
            })}
            {done && <div className={styles.why}>💡 {qq.w}</div>}
          </div>
        ))}
      </div>
      {!done
        ? <button className={styles.btn} disabled={Object.keys(ans).length < round.length} onClick={() => setDone(true)}>채점하고 진단받기 →</button>
        : (<div className={styles.diag}>
          <span className={styles.score}>{score}/{round.length}</span>
          <span style={{ marginLeft: 12, fontSize: 14 }}>{score === round.length ? '완벽해요! 실전 거래로 넘어갈 준비가 됐어요.' : '잘했어요 — 아래 개념만 보강하면 됩니다.'}</span>
          {wrong.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 12, color: 'var(--rose)', fontWeight: 600, marginBottom: 8 }}>📌 오답 진단 — 복습 권장 개념</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{wrong.map((qq, i) => <span className={styles.pill} key={i}>{qq.k}</span>)}</div>
            </div>
          )}
          <div><button className={styles.btn + ' ' + styles.ghost} style={{ marginTop: 16 }} onClick={reset}>↻ 새 문제로 다시</button></div>
        </div>)}
    </div>
  )
}
