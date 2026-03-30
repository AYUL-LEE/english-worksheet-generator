import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));

// API 라우트
app.post('/api/generate-worksheet', async (req, res) => {
  try {
    const handler = await import('./api/generate-worksheet.js');
    return handler.default(req, res);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 템플릿 미리보기 (목업 데이터)
app.get('/preview/:type', async (req, res) => {
  try {
    const { renderAllTypes, render_단어테스트, render_워크북_어법선택, render_워크북_어법수정, render_워크북_어휘선택, render_워크북_순서배열 } = await import(`./utils/templateRenderer.js?v=${Date.now()}`);
    const mockData = {
      passage: {
        original_text: 'H1_2509_30 For a species born in a time when resources were limited and dangers were great, our natural tendency to share and cooperate is complicated when resources are plenty and outside dangers are few. When we have less, we tend to be more open to sharing what we have. Certain nomadic tribes don\'t have much, yet they are happy to share because it is in their interest to do so. If you happen upon them in your travels, they will open up their homes and give you their food and hospitality.',
        english_title: 'The Wealth Paradox: Why Abundance Leads to Social Disconnection',
        korean_title: '풍요의 역설: 풍요가 사회적 단절로 이어지는 이유',
      },
      type_01_본문노트: {
        논리흐름: [
          { 소제목: '자원 부족 환경에서의 생존 전략인 공유와 협력', 내용: '인간은 자원이 한정된 환경에서 생존을 위해 협력하고 나누는 본능을 발달시켰다. 유목 부족의 사례와 같이 나눔은 미래의 위험에 대비한 상호 보장 기제이자 필수적인 생존 전략이다.' },
          { 소제목: '물질적 풍요가 초래하는 공유 의지의 감소와 폐쇄성', 내용: '자원이 풍족해지면 타인에 대한 의존도가 낮아지며 보안을 강화하고 울타리를 높이는 경향이 나타난다.' },
          { 소제목: '타인과의 접촉 감소로 인한 사회적 단절과 현실 왜곡', 내용: '물질적 욕망의 증가와 대인 접촉의 감소는 사회적 단절을 야기한다.' },
        ],
        웹툰캡션: [
          'People sharing food around a campfire in a sparse desert setting',
          'A wealthy person adding locks to a tall fence around a large house',
          'A crowd of people ignoring each other, each looking at their phone',
          'A person alone in a room surrounded by luxury goods, looking isolated',
        ],
      },
      type_03_문장해석: {
        sentences: [
          { num: 1, english: 'For a species born in a time when resources were limited and dangers were great, our natural tendency to share and cooperate is complicated when resources are plenty and outside dangers are few.', korean_natural: '자원이 한정되고 위험이 컸던 시대에 태어난 종으로서, 우리의 공유하고 협력하려는 자연적 성향은 자원이 풍부하고 외부 위험이 적을 때 복잡해진다.' },
          { num: 2, english: 'When we have less, we tend to be more open to sharing what we have.', korean_natural: '우리가 더 적게 가질 때, 우리는 가진 것을 나누는 데 더 열린 경향이 있다.' },
          { num: 3, english: 'Certain nomadic tribes don\'t have much, yet they are happy to share because it is in their interest to do so.', korean_natural: '일부 유목 부족은 많이 가지지 않지만, 그렇게 하는 것이 그들의 이익에 부합하기 때문에 기꺼이 나눈다.' },
          { num: 4, english: 'If you happen upon them in your travels, they will open up their homes and give you their food and hospitality.', korean_natural: '여행 중 그들을 우연히 만나면, 그들은 집을 열어 음식과 환대를 베풀 것이다.' },
          { num: 5, english: 'It\'s not just because they are nice people; it\'s because their survival depends on sharing, for they know that they may be the travelers in need of food and shelter another day.', korean_natural: '그들이 좋은 사람이라서가 아니라, 생존이 나눔에 달려 있기 때문이다. 언젠가 자신이 음식과 쉼터가 필요한 여행자가 될 수 있음을 알기 때문이다.' },
          { num: 6, english: 'Ironically, the more we have, the bigger our fences, the more sophisticated our security to keep people away and the less we want to share.', korean_natural: '아이러니하게도, 가진 것이 많을수록 울타리는 더 커지고, 보안은 더 정교해지며, 공유는 더 꺼리게 된다.' },
          { num: 7, english: 'Our desire for more, combined with our decreased physical interaction with the \'common folk,\' starts to create a disconnection or blindness to reality.', korean_natural: '더 많이 갖고자 하는 욕망과 평범한 사람들과의 신체적 접촉 감소가 결합되어 현실에 대한 단절과 무감각을 초래하기 시작한다.' },
        ],
      },
      type_08_핵심어휘: {
        words: [
          { num: 1, word: 'tendency', pos: 'n.', meanings: ['경향, 추세', '성향', '버릇'], synonyms: ['inclination', 'propensity', 'trend'], antonyms: ['aversion', 'disinclination'] },
          { num: 2, word: 'cooperate', pos: 'v.', meanings: ['협력하다', '협조하다'], synonyms: ['collaborate', 'work together'], antonyms: ['compete', 'oppose'] },
          { num: 3, word: 'nomadic', pos: 'adj.', meanings: ['유목의', '떠돌아다니는'], synonyms: ['wandering', 'migratory'], antonyms: ['settled', 'stationary'] },
          { num: 4, word: 'hospitality', pos: 'n.', meanings: ['환대', '후한 대접'], synonyms: ['welcome', 'generosity'], antonyms: ['hostility', 'coldness'] },
          { num: 5, word: 'abundance', pos: 'n.', meanings: ['풍요, 풍부', '넘침'], synonyms: ['plenty', 'surplus', 'wealth'], antonyms: ['scarcity', 'lack'] },
          { num: 6, word: 'complicated', pos: 'adj.', meanings: ['복잡한', '까다로운'], synonyms: ['complex', 'intricate'], antonyms: ['simple', 'straightforward'] },
        ],
      },
      type_워크북_어법선택: {
        passage_marked: "For a species 1[born/bearing] in a time 2[when/which] resources 3[were/was] limited and dangers 4[were/was] great, our natural tendency to share and cooperate is 5[complicated/complicating] when resources are 6[plenty/plentiful] and outside dangers are 7[few/little]. When we have 8[less/fewer], we tend to be more open to 9[sharing/share] what we have.",
        answers: [
          {num:1, answer:"born"}, {num:2, answer:"when"}, {num:3, answer:"were"},
          {num:4, answer:"were"}, {num:5, answer:"complicated"}, {num:6, answer:"plentiful"},
          {num:7, answer:"few"}, {num:8, answer:"less"}, {num:9, answer:"sharing"}
        ]
      },
      type_워크북_어법수정: {
        passage_marked: "For a species 1[borned] in a time when resources 2[was] limited and dangers were great, our natural tendency to share and cooperate 3[are] complicated when resources are plentiful. When we have less, we tend to be more open 4[share] what we have. Certain nomadic tribes don't have much, yet they are happy to share because it is in their interest 5[do] so.",
        answers: [
          {num:1, wrong:"borned", correct:"born"}, {num:2, wrong:"was", correct:"were"},
          {num:3, wrong:"are", correct:"is"}, {num:4, wrong:"share", correct:"to sharing"},
          {num:5, wrong:"do", correct:"to do"}
        ]
      },
      type_워크북_어휘선택: {
        passage_marked: "For a species born in a time when resources were 1[limited/abundant] and dangers were great, our natural 2[tendency/aversion] to share and cooperate is complicated when resources are plentiful. When we have less, we tend to be more 3[open/closed] to sharing what we have. Certain nomadic tribes don't have much, yet they are happy to 4[share/hoard] because it is in their 5[interest/danger] to do so.",
        answers: [
          {num:1, answer:"limited"}, {num:2, answer:"tendency"},
          {num:3, answer:"open"}, {num:4, answer:"share"}, {num:5, answer:"interest"}
        ]
      },
      type_워크북_순서배열: {
        sentences: [
          {label:"A", text:"When we have less, we tend to be more open to sharing what we have."},
          {label:"B", text:"Ironically, the more we have, the bigger our fences, the more sophisticated our security to keep people away and the less we want to share."},
          {label:"C", text:"For a species born in a time when resources were limited and dangers were great, our natural tendency to share and cooperate is complicated when resources are plenty and outside dangers are few."},
          {label:"D", text:"Certain nomadic tribes don't have much, yet they are happy to share because it is in their interest to do so."},
          {label:"E", text:"It's not just because they are nice people; it's because their survival depends on sharing."},
          {label:"F", text:"Our desire for more, combined with our decreased physical interaction with the 'common folk,' starts to create a disconnection or blindness to reality."},
          {label:"G", text:"If you happen upon them in your travels, they will open up their homes and give you their food and hospitality."}
        ],
        answer: "C-A-D-G-E-B-F"
      },
    };
    const mockPageTitle = '리얼고 1학년 26년 1학기 중간고사 대비';
    const results = renderAllTypes(mockData, null, mockPageTitle);
    const type = req.params.type;
    if (type === '단어테스트') {
      return res.send(render_단어테스트([mockData, mockData], mockPageTitle));
    }
    if (type === '워크북_어법선택') return res.send(render_워크북_어법선택([mockData], mockPageTitle));
    if (type === '워크북_어법수정') return res.send(render_워크북_어법수정([mockData], mockPageTitle));
    if (type === '워크북_어휘선택') return res.send(render_워크북_어휘선택([mockData], mockPageTitle));
    if (type === '워크북_순서배열') return res.send(render_워크북_순서배열([mockData], mockPageTitle));
    const html = results[type];
    if (!html) {
      return res.status(404).send(`템플릿 없음. 사용 가능: ${Object.keys(results).join(', ')}, 단어테스트`);
    }
    res.send(html);
  } catch (e) {
    res.status(500).send(`<pre>${e.stack}</pre>`);
  }
});

// API 라우트 추가
app.post('/api/generate-pdf', async (req, res) => {
  try {
    const handler = await import(`./api/generate-pdf.js?v=${Date.now()}`);
    return handler.default(req, res);
  } catch (error) {
    console.error('PDF API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 샘플 HTML 반환 (AI 호출 없이 목업 데이터로 HTML 생성 → 클라이언트에서 window.print() 사용)
app.get('/api/preview-html', async (req, res) => {
  try {
    const { renderAllTypes, render_단어테스트, render_워크북_어법선택, render_워크북_어법수정, render_워크북_어휘선택, render_워크북_순서배열 } = await import(`./utils/templateRenderer.js?v=${Date.now()}`);

    const mockData = {
      passage: {
        original_text: 'H1_2509_30 For a species born in a time when resources were limited and dangers were great, our natural tendency to share and cooperate is complicated when resources are plenty and outside dangers are few. When we have less, we tend to be more open to sharing what we have. Certain nomadic tribes don\'t have much, yet they are happy to share because it is in their interest to do so. If you happen upon them in your travels, they will open up their homes and give you their food and hospitality.',
        english_title: 'The Wealth Paradox: Why Abundance Leads to Social Disconnection',
        korean_title: '풍요의 역설: 풍요가 사회적 단절로 이어지는 이유',
      },
      type_01_본문노트: {
        논리흐름: [
          { 소제목: '자원 부족 환경에서의 생존 전략인 공유와 협력', 내용: '인간은 자원이 한정된 환경에서 생존을 위해 협력하고 나누는 본능을 발달시켰다. 유목 부족의 사례와 같이 나눔은 미래의 위험에 대비한 상호 보장 기제이자 필수적인 생존 전략이다.' },
          { 소제목: '물질적 풍요가 초래하는 공유 의지의 감소와 폐쇄성', 내용: '자원이 풍족해지면 타인에 대한 의존도가 낮아지며 보안을 강화하고 울타리를 높이는 경향이 나타난다.' },
          { 소제목: '타인과의 접촉 감소로 인한 사회적 단절과 현실 왜곡', 내용: '물질적 욕망의 증가와 대인 접촉의 감소는 사회적 단절을 야기한다.' },
        ],
        웹툰캡션: ['People sharing food around a campfire', 'A wealthy person adding locks to a tall fence', 'A crowd ignoring each other on phones', 'A person alone surrounded by luxury goods'],
      },
      type_03_문장해석: {
        sentences: [
          { num: 1, english: 'For a species born in a time when resources were limited and dangers were great, our natural tendency to share and cooperate is complicated when resources are plenty and outside dangers are few.', korean_natural: '자원이 한정되고 위험이 컸던 시대에 태어난 종으로서, 우리의 공유하고 협력하려는 자연적 성향은 자원이 풍부하고 외부 위험이 적을 때 복잡해진다.' },
          { num: 2, english: 'When we have less, we tend to be more open to sharing what we have.', korean_natural: '우리가 더 적게 가질 때, 우리는 가진 것을 나누는 데 더 열린 경향이 있다.' },
          { num: 3, english: 'Certain nomadic tribes don\'t have much, yet they are happy to share because it is in their interest to do so.', korean_natural: '일부 유목 부족은 많이 가지지 않지만, 그렇게 하는 것이 그들의 이익에 부합하기 때문에 기꺼이 나눈다.' },
          { num: 4, english: 'If you happen upon them in your travels, they will open up their homes and give you their food and hospitality.', korean_natural: '여행 중 그들을 우연히 만나면, 그들은 집을 열어 음식과 환대를 베풀 것이다.' },
          { num: 5, english: 'It\'s not just because they are nice people; it\'s because their survival depends on sharing, for they know that they may be the travelers in need of food and shelter another day.', korean_natural: '그들이 좋은 사람이라서가 아니라, 생존이 나눔에 달려 있기 때문이다.' },
          { num: 6, english: 'Ironically, the more we have, the bigger our fences, the more sophisticated our security to keep people away and the less we want to share.', korean_natural: '아이러니하게도, 가진 것이 많을수록 울타리는 더 커지고, 보안은 더 정교해지며, 공유는 더 꺼리게 된다.' },
          { num: 7, english: 'Our desire for more, combined with our decreased physical interaction with the \'common folk,\' starts to create a disconnection or blindness to reality.', korean_natural: '더 많이 갖고자 하는 욕망과 평범한 사람들과의 신체적 접촉 감소가 결합되어 현실에 대한 단절과 무감각을 초래한다.' },
        ],
      },
      type_08_핵심어휘: {
        words: [
          { num: 1, word: 'tendency', pos: 'n.', meanings: ['경향, 추세', '성향', '버릇'], synonyms: ['inclination', 'propensity'], antonyms: ['aversion', 'disinclination'] },
          { num: 2, word: 'cooperate', pos: 'v.', meanings: ['협력하다', '협조하다'], synonyms: ['collaborate', 'work together'], antonyms: ['compete', 'oppose'] },
          { num: 3, word: 'nomadic', pos: 'adj.', meanings: ['유목의', '떠돌아다니는'], synonyms: ['wandering', 'migratory'], antonyms: ['settled', 'stationary'] },
          { num: 4, word: 'hospitality', pos: 'n.', meanings: ['환대', '후한 대접'], synonyms: ['welcome', 'generosity'], antonyms: ['hostility', 'coldness'] },
          { num: 5, word: 'abundance', pos: 'n.', meanings: ['풍요, 풍부', '넘침'], synonyms: ['plenty', 'surplus'], antonyms: ['scarcity', 'lack'] },
          { num: 6, word: 'complicated', pos: 'adj.', meanings: ['복잡한', '까다로운'], synonyms: ['complex', 'intricate'], antonyms: ['simple', 'straightforward'] },
          { num: 7, word: 'sophisticated', pos: 'adj.', meanings: ['정교한', '세련된'], synonyms: ['advanced', 'refined'], antonyms: ['primitive', 'crude'] },
          { num: 8, word: 'disconnection', pos: 'n.', meanings: ['단절', '분리'], synonyms: ['separation', 'isolation'], antonyms: ['connection', 'bond'] },
        ],
      },
      type_09_한줄해석: { sentences: [] },
      type_워크북_어법선택: {
        passage_marked: "For a species 1[born/bearing] in a time 2[when/which] resources 3[were/was] limited and dangers 4[were/was] great, our natural tendency to share and cooperate is 5[complicated/complicating] when resources are 6[plentiful/plenty] and outside dangers are 7[few/little]. When we have 8[less/fewer], we tend to be more open to 9[sharing/share] what we have.",
        answers: [{num:1,answer:"born"},{num:2,answer:"when"},{num:3,answer:"were"},{num:4,answer:"were"},{num:5,answer:"complicated"},{num:6,answer:"plentiful"},{num:7,answer:"few"},{num:8,answer:"less"},{num:9,answer:"sharing"}]
      },
      type_워크북_어법수정: {
        passage_marked: "For a species 1[borned] in a time when resources 2[was] limited and dangers were great, our natural tendency to share and cooperate 3[are] complicated when resources are plentiful. When we have less, we tend to be more open 4[share] what we have. Certain nomadic tribes don't have much, yet they 5[is] happy to share.",
        answers: [{num:1,wrong:"borned",correct:"born"},{num:2,wrong:"was",correct:"were"},{num:3,wrong:"are",correct:"is"},{num:4,wrong:"share",correct:"to sharing"},{num:5,wrong:"is",correct:"are"}]
      },
      type_워크북_어휘선택: {
        passage_marked: "For a species born in a time when resources were 1[limited/abundant] and dangers were great, our natural 2[tendency/aversion] to share and cooperate is complicated when resources are plentiful. When we have less, we tend to be more 3[open/closed] to sharing. Certain nomadic tribes are happy to 4[share/hoard] because it is in their 5[interest/danger] to do so.",
        answers: [{num:1,answer:"limited"},{num:2,answer:"tendency"},{num:3,answer:"open"},{num:4,answer:"share"},{num:5,answer:"interest"}]
      },
      type_워크북_순서배열: {
        sentences: [
          {label:"A", text:"When we have less, we tend to be more open to sharing what we have."},
          {label:"B", text:"Ironically, the more we have, the bigger our fences, the more sophisticated our security to keep people away and the less we want to share."},
          {label:"C", text:"For a species born in a time when resources were limited and dangers were great, our natural tendency to share and cooperate is complicated when resources are plenty and outside dangers are few."},
          {label:"D", text:"Certain nomadic tribes don't have much, yet they are happy to share because it is in their interest to do so."},
          {label:"E", text:"It's not just because they are nice people; it's because their survival depends on sharing."},
          {label:"F", text:"Our desire for more, combined with our decreased physical interaction with the 'common folk,' starts to create a disconnection or blindness to reality."},
          {label:"G", text:"If you happen upon them in your travels, they will open up their homes and give you their food and hospitality."}
        ],
        answer: "C-A-D-G-E-B-F"
      },
    };

    const mockPageTitle = '[샘플] 리얼고 1학년 26년 1학기 중간고사 대비';
    const allPassages = [mockData];
    const results = renderAllTypes(mockData, null, mockPageTitle);

    const pageBreak = '<div style="page-break-after:always;"></div>';
    const sections = [
      results['01_본문노트'],
      pageBreak,
      results['03_문장해석'],
      pageBreak,
      results['08_핵심어휘'],
      pageBreak,
      render_단어테스트(allPassages, mockPageTitle),
      pageBreak,
      results['09_한줄해석'],
      pageBreak,
      render_워크북_어법선택(allPassages, mockPageTitle),
      pageBreak,
      render_워크북_어법수정(allPassages, mockPageTitle),
      pageBreak,
      render_워크북_어휘선택(allPassages, mockPageTitle),
      pageBreak,
      render_워크북_순서배열(allPassages, mockPageTitle),
    ];

    const combinedHTML = sections.filter(Boolean).join('\n');

    // HTML 직접 반환 (클라이언트에서 window.print()로 PDF 저장)
    const fullHTML = `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><style>@media print { @page { size: A4; margin: 0; } }</style></head><body>${combinedHTML}</body></html>`;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(fullHTML);

  } catch (e) {
    console.error('샘플 HTML 오류:', e);
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ 서버 실행: http://localhost:${PORT}`);
  console.log(`📂 브라우저에서 열기: http://localhost:${PORT}/index.html`);
});