/**
 * Duskfade Wiki — i18n Multi-Language System v2
 * Supports: English (en), 中文 (zh), 日本語 (ja), Español (es)
 *
 * Strategy:
 *   1. data-i18n attributes — 精细翻译（导航、按钮、统计、section 标题等）
 *   2. Google Translate Element widget — 自动翻译所有未翻译的英文正文
 *   3. localStorage 持久化用户选择
 *
 * 用户切换非英语时：
 *   - 立刻应用 data-i18n（导航/按钮/标题 → 中文/日文/西文）
 *   - 同时调用 Google Translate widget 翻译整页 DOM 正文
 */
(function () {
  'use strict';

  const LANGS = ['en', 'zh', 'ja', 'es'];
  const GOOGLE_LANG_MAP = { zh: 'zh-CN', ja: 'ja', es: 'es' };

  /* ============================================================
     精细翻译字典（精选 120+ 关键 UI 文本，确保高质量翻译）
     ============================================================ */
  const T = {
    /* ===== NAVIGATION ===== */
    'nav.home':         { en: 'Home',         zh: '首页',     ja: 'ホーム',       es: 'Inicio' },
    'nav.bosses':       { en: 'Bosses',       zh: 'Boss攻略', ja: 'ボス',         es: 'Jefes' },
    'nav.walkthrough':  { en: 'Walkthrough',  zh: '流程攻略', ja: '攻略チャート',  es: 'Guía' },
    'nav.collectibles': { en: 'Collectibles', zh: '收集品',   ja: '収集品',       es: 'Coleccionables' },
    'nav.weapons':      { en: 'Weapons',      zh: '武器',     ja: '武器',         es: 'Armas' },
    'nav.tierlist':     { en: 'Tier List',    zh: '强度榜',   ja: 'ティアリスト',  es: 'Tier List' },
    'nav.beginner':     { en: 'Beginner',     zh: '新手指南', ja: '初心者',       es: 'Principiante' },

    /* ===== FOOTER ===== */
    'footer.home':      { en: 'Home',     zh: '首页',   ja: 'ホーム',   es: 'Inicio' },
    'footer.about':     { en: 'About',    zh: '关于',   ja: '概要',     es: 'Acerca de' },
    'footer.contact':   { en: 'Contact',  zh: '联系',   ja: 'お問い合わせ', es: 'Contacto' },
    'footer.review':    { en: 'Review',   zh: '评测',   ja: 'レビュー', es: 'Análisis' },
    'footer.sitemap':   { en: 'Sitemap',  zh: '站点地图', ja: 'サイトマップ', es: 'Mapa del sitio' },
    'footer.disclaimer':{ en: 'Duskfade Guide & Wiki — Fan-made resource. Duskfade is a trademark of Weird Beluga.',
                          zh: 'Duskfade 攻略百科 — 粉丝制作资源。Duskfade 是 Weird Beluga 的商标。',
                          ja: 'Duskfade Guide & Wiki — ファン制作リソース。Duskfade は Weird Beluga の商標です。',
                          es: 'Duskfade Guide & Wiki — Recurso de fans. Duskfade es una marca registrada de Weird Beluga.' },
    'footer.tag':       { en: '⏰ The clock never stops. Neither do we.',
                          zh: '⏰ 时钟永不停歇，我们也是。',
                          ja: '⏰ 時計は止まらない。私たちも同じ。',
                          es: '⏰ El reloj nunca se detiene. Nosotros tampoco.' },

    /* ===== HERO (index.html) ===== */
    'hero.badge':       { en: 'Fan-Made Community Wiki',
                          zh: '粉丝制作社区百科',
                          ja: 'ファン制作コミュニティWiki',
                          es: 'Wiki comunitaria de fans' },
    'hero.desc':        { en: 'Shatter the shackles of time as you jump, swing, and slash through a fantastic world. Zirian, accompanied by his mechanical Cuckoo, must save his sister from a mysterious Clock Tower that has plunged the land into eternal night.',
                          zh: '打破时间的枷锁，在奇幻世界中跳跃、摆荡、斩击。齐利安带着他的机械布谷鸟，必须从神秘的钟楼塔中拯救他的妹妹——那座钟楼已将大地陷入永夜。',
                          ja: '時間の鎖を打ち砕き、幻想的な世界を駆け抜けろ。ジリアンは機械仕掛けのカッコウと共に、大地を永遠の夜に沈めた謎の時計塔から妹を救い出さなければならない。',
                          es: 'Rompe las cadenas del tiempo mientras saltas, balanceas y luchas a través de un mundo fantástico. Zirian, acompañado por su cuco mecánico, debe salvar a su hermana de una misteriosa Torre del Reloj que ha sumido la tierra en una noche eterna.' },
    'hero.btn1':        { en: 'Start Beginner Guide →',  zh: '新手指南 →',     ja: '初心者ガイド →',     es: 'Guía para principiantes →' },
    'hero.btn2':        { en: 'Boss Strategies',          zh: 'Boss攻略',       ja: 'ボス攻略',           es: 'Estrategias de jefes' },
    'hero.btn3':        { en: 'Collectible Maps',         zh: '收集品地图',     ja: '収集品マップ',       es: 'Mapas de coleccionables' },
    'hero.trailer':     { en: 'Watch Official Trailer',   zh: '观看官方预告片',  ja: '公式トレーラーを見る', es: 'Ver tráiler oficial' },

    /* ===== STATS BAR ===== */
    'stat1.label': { en: 'Aug 13, 2026', zh: '2026年8月13日', ja: '2026年8月13日', es: '13 Ago, 2026' },
    'stat1.value': { en: 'Released',     zh: '已发售',     ja: '発売中',       es: 'Disponible' },
    'stat2.label': { en: '20% off at launch', zh: '首发8折', ja: '発売記念20%オフ', es: '20% de descuento' },
    'stat2.value': { en: '$23.99',       zh: '$23.99',     ja: '$23.99',       es: '$23.99' },
    'stat3.label': { en: 'Main Bosses',  zh: '主要 Boss',   ja: 'メインボス',    es: 'Jefes principales' },
    'stat3.value': { en: '5',            zh: '5',          ja: '5',            es: '5' },
    'stat4.label': { en: 'Achievements', zh: '成就',       ja: 'アチーブメント',  es: 'Logros' },
    'stat4.value': { en: '25',           zh: '25',         ja: '25',           es: '25' },
    'stat5.label': { en: 'Free & Updated', zh: '免费且持续更新', ja: '無料・更新中', es: 'Gratis y actualizado' },
    'stat5.value': { en: '100%',         zh: '100%',       ja: '100%',         es: '100%' },

    /* ===== SECTION HEADERS (index.html) ===== */
    'sec.starthere':      { en: 'Start Here',       zh: '从这里开始',     ja: 'ここから始める',       es: 'Empieza aquí' },
    'sec.starthere_desc': { en: 'New to Duskfade? Begin with these essential guides.',
                            zh: 'Duskfade 新手？从这些核心指南开始。',
                            ja: 'Duskfade 初心者？まずはこれらの必須ガイドから。',
                            es: '¿Nuevo en Duskfade? Comienza con estas guías esenciales.' },
    'sec.trailer':        { en: 'Official Trailer', zh: '官方预告片',     ja: '公式トレーラー',       es: 'Tráiler oficial' },
    'sec.screenshots':    { en: 'Screenshots',      zh: '游戏截图',       ja: 'スクリーンショット',    es: 'Capturas de pantalla' },
    'sec.screenshots_desc':{en:'Explore the clockpunk world of Duskfade — ethereal forests, underwater realms, sunlit dunes, and cloudy heights.',
                            zh:'探索 Duskfade 的钟表朋克世界——空灵森林、水下王国、阳光沙丘和云端高地。',
                            ja:'Duskfade の時計朋くワールドを探索しよう——幻想の森、水中の王国、陽光の砂丘、雲の高み。',
                            es:'Explora el mundo clockpunk de Duskfade — bosques etéreos, reinos submarinos, dunas soleadas y alturas nubladas.' },
    'sec.features':       { en: 'What This Wiki Covers', zh: '百科内容涵盖', ja: 'Wikiの内容', es: 'Lo que cubre esta Wiki' },
    'sec.about':          { en: 'About Duskfade',       zh: '关于 Duskfade', ja: 'Duskfadeについて', es: 'Acerca de Duskfade' },

    /* ===== HERO META CARDS (3 cards under hero buttons) ===== */
    'hero.meta.dev_label':  { en: 'DEVELOPER', zh: '开发商',     ja: '開発者',   es: 'DESARROLLADOR' },
    'hero.meta.dev_value':  { en: 'Weird Beluga', zh: 'Weird Beluga', ja: 'Weird Beluga', es: 'Weird Beluga' },
    'hero.meta.rel_label':  { en: 'RELEASE',    zh: '发售日期',     ja: '発売日',   es: 'LANZAMIENTO' },
    'hero.meta.rel_value':  { en: 'Aug 13, 2026', zh: '2026年8月13日', ja: '2026年8月13日', es: '13 Ago, 2026' },
    'hero.meta.foc_label':  { en: 'FOCUS',      zh: '类型',         ja: 'ジャンル', es: 'ENFOQUE' },
    'hero.meta.foc_value':  { en: 'Clockpunk Soulslike', zh: '钟表朋克类魂', ja: '時計朋くソウルライク', es: 'Soulslike clockpunk' },

    /* ===== DATA STRIP (5-column Steam data) ===== */
    'data.ach_label':       { en: 'Steam Achievements', zh: 'Steam 成就',     ja: 'Steam アチーブメント', es: 'Logros de Steam' },
    'data.boss_label':      { en: 'Main Bosses',         zh: '主要 Boss',     ja: 'メインボス',          es: 'Jefes principales' },
    'data.reg_label':       { en: 'Regions + Tick Town', zh: '区域 + 钟摆镇', ja: 'エリア + ティックタウン', es: 'Regiones + Tick Town' },
    'data.price_label':     { en: '20% Launch Discount', zh: '首发 8 折',     ja: '発売20%オフ',          es: '20% de descuento de lanzamiento' },
    'data.lang_label':      { en: 'Supported Languages', zh: '支持语言',     ja: '対応言語',             es: 'Idiomas compatibles' },
    'data.source':          { en: 'Duskfade Steam page figures as of launch week. Prices and review totals update over time.',
                              zh: '数据来源于 Duskfade Steam 页面（发售当周）。价格与评测数会随时间更新。',
                              ja: 'Duskfade Steam ページの発売週データ。価格とレビュー数は随時更新されます。',
                              es: 'Datos de la página de Steam de Duskfade de la semana de lanzamiento. Los precios y reseñas se actualizan con el tiempo.' },
    'data.steam_link':      { en: 'Check Steam →', zh: '查看 Steam →', ja: 'Steam を確認 →', es: 'Ver en Steam →' },

    /* ===== KEYWORD HUB ===== */
    'hub.badge':            { en: 'Keyword hub', zh: '关键词中心',     ja: 'キーワードハブ',     es: 'Centro de palabras clave' },
    'hub.title':            { en: 'Duskfade searches routed to useful pages',
                              zh: 'Duskfade 搜索直达实用页面',
                              ja: 'Duskfade の検索を実用ページへ',
                              es: 'Búsquedas de Duskfade enrutadas a páginas útiles' },
    'hub.subtitle':         { en: 'Every guide you might land on from Google, organised by the exact phrase you typed.',
                              zh: '从 Google 跳转进来的每条搜索，都按你输入的关键词直达对应攻略页。',
                              ja: 'Google から来るすべての検索を、入力したキーワード別に整理して直接お届け。',
                              es: 'Cada guía a la que llegues desde Google, organizada por la frase exacta que escribiste.' },
    'hub.btn':              { en: 'Browse guides →', zh: '浏览全部攻略 →', ja: '全ガイドを見る →',   es: 'Ver todas las guías →' },
    'hub.kw1':              { en: 'Duskfade beginner guide',   zh: 'Duskfade 新手指南',   ja: 'Duskfade 初心者ガイド',   es: 'Guía para principiantes de Duskfade' },
    'hub.kw1_d':            { en: 'First-hour survival, time-freeze timing, and combat fundamentals.',
                              zh: '首小时生存、时间冻结节奏和战斗基础。',
                              ja: '最初の1時間の生存、時間凍結のタイミング、戦闘の基礎。',
                              es: 'Supervivencia de la primera hora, tiempo de congelación y fundamentos de combate.' },
    'hub.kw2':              { en: 'Duskfade boss strategies',  zh: 'Duskfade Boss 攻略',  ja: 'Duskfade ボス攻略',      es: 'Estrategias de jefes de Duskfade' },
    'hub.kw2_d':            { en: 'All 5 bosses with phase-by-phase tactics and counter windows.',
                              zh: '5 个 Boss 全部含分阶段战术与反击窗口。',
                              ja: '5 体全ボスのフェーズ別戦術と反撃タイミング。',
                              es: 'Los 5 jefes con tácticas por fases y ventanas de contraataque.' },
    'hub.kw3':              { en: 'Duskfade walkthrough',      zh: 'Duskfade 流程攻略',   ja: 'Duskfade 攻略チャート',   es: 'Guía completa de Duskfade' },
    'hub.kw3_d':            { en: 'Demo + full game route through Tick Town and the four regions.',
                              zh: 'Demo + 完整游戏的钟摆镇与四大区域路线。',
                              ja: '体験版 + 完全攻略のティックタウンと 4 つのエリア順路。',
                              es: 'Demo + ruta completa por Tick Town y las cuatro regiones.' },
    'hub.kw4':              { en: 'Duskfade collectibles',     zh: 'Duskfade 收集品',     ja: 'Duskfade 収集品',         es: 'Coleccionables de Duskfade' },
    'hub.kw4_d':            { en: 'Rainbow Ingots, Clock Heart Pieces, Void Echoes, and lore notes.',
                              zh: '彩虹锭、钟表心碎片、虚空回响、剧情笔记。',
                              ja: 'レインボーインゴット、時計の心臓のかけら、虚無エコー、Lore メモ。',
                              es: 'Lingotes arcoíris, Piezas de Corazón de Reloj, Ecos del Vacío y notas de lore.' },
    'hub.kw5':              { en: 'Duskfade weapons',          zh: 'Duskfade 武器',       ja: 'Duskfade 武器',           es: 'Armas de Duskfade' },
    'hub.kw5_d':            { en: 'The Minutero and Upgrade Gears — full arsenal and locations.',
                              zh: '分针剑与升级齿轮 — 完整武器库与位置。',
                              ja: 'ミヌテロとアップグレードギア — 全武器と入手場所。',
                              es: 'El Minutero y los Engranajes de Mejora — arsenal completo y ubicaciones.' },
    'hub.kw6':              { en: 'Duskfade tier list',        zh: 'Duskfade 强度榜',     ja: 'Duskfade ティアリスト',   es: 'Tier List de Duskfade' },
    'hub.kw6_d':            { en: 'S / A / B / C ranked weapons, abilities, and boss difficulty.',
                              zh: 'S / A / B / C 级武器、能力与 Boss 难度排名。',
                              ja: '武器、アビリティ、ボス難易度を S / A / B / C でランク付け。',
                              es: 'Armas, habilidades y dificultad de jefes clasificadas S / A / B / C.' },
    'hub.kw7':              { en: 'Duskfade review',           zh: 'Duskfade 评测',       ja: 'Duskfade レビュー',       es: 'Análisis de Duskfade' },
    'hub.kw7_d':            { en: 'Our take on the clockpunk soulslike — what works, what stumbles.',
                              zh: '我们对这款钟表朋克类魂游戏的评价 — 亮点与不足。',
                              ja: '時計朋くソウルライクの評価 — 良い点と物足りない点。',
                              es: 'Nuestra opinión del soulslike clockpunk — lo que funciona y lo que falla.' },
    'hub.kw8':              { en: 'Duskfade demo guide',       zh: 'Duskfade Demo 指南',  ja: 'Duskfade デモガイド',     es: 'Guía de la demo de Duskfade' },
    'hub.kw8_d':            { en: 'What the demo covers, download tips, and progress-not-carried caveat.',
                              zh: 'Demo 内容、下载小贴士、进度不可继承的注意事项。',
                              ja: '体験版の内容、ダウンロードのヒント、進捗が引き継がれない注意。',
                              es: 'Qué cubre la demo, consejos de descarga y el aviso de progreso no guardado.' },
    'hub.kw9':              { en: 'Duskfade characters',       zh: 'Duskfade 角色',       ja: 'Duskfade キャラクター',   es: 'Personajes de Duskfade' },
    'hub.kw9_d':            { en: 'Zirian, Allira, Cuckoo, and the lore of the Master Clockmakers.',
                              zh: '齐利安、阿莉拉、布谷鸟与大师钟表匠的传说。',
                              ja: 'ジリアン、アリーラ、カッコウ、マスター時計師の伝承。',
                              es: 'Zirian, Allira, Cuckoo y la historia de los Maestros Relojeros.' },
    'hub.kw10':             { en: 'Duskfade Wrath boss',        zh: 'Duskfade 愤怒 Boss',   ja: 'Duskfade レイスボス',     es: 'Jefe Wrath de Duskfade' },
    'hub.kw10_d':           { en: 'First boss of Mount Cinder — lunge, slam, projectiles, and the hook-shot center phase.',
                              zh: '熔岩山的第一位 Boss — 突进、砸地、弹幕与钩索中心阶段。',
                              ja: 'マウント・シンダー最初のボス — 突進、叩きつけ、弾幕、フックショット中心フェーズ。',
                              es: 'Primer jefe de Mount Cinder — embestida, golpe, proyectiles y fase central de gancho.' },
    'hub.kw11':             { en: 'Duskfade Sorrow boss',       zh: 'Duskfade 悲伤 Boss',   ja: 'Duskfade ソローボス',     es: 'Jefe Sorrow de Duskfade' },
    'hub.kw11_d':           { en: 'Second boss in the Ethereal Forest — slow, telegraphed attacks to learn on.',
                              zh: '空灵森林的第二位 Boss — 缓慢且有明显预兆，适合练手。',
                              ja: 'エーテル森林の2番目のボス — ゆっくりした予備動作で練習向き。',
                              es: 'Segundo jefe del Bosque Etereo — ataques lentos y telegrafiados para practicar.' },
    'hub.kw12':             { en: 'Allira (Duskfade)',          zh: '阿莉拉（Duskfade）',   ja: 'アリーラ（Duskfade）',    es: 'Allira (Duskfade)' },
    'hub.kw12_d':           { en: "Zirian's sister, imprisoned in the Clock Tower, and the story's emotional core.",
                              zh: '齐利安的妹妹，被囚于钟楼，也是故事的情感核心。',
                              ja: 'ジリアンの妹、時計塔に囚われ、物語の感情的核。',
                              es: 'La hermana de Zirian, prisionera en la Torre del Reloj y el núcleo emocional.' },

    /* ===== SCENARIO CHOICE ===== */
    'scn.title':            { en: 'Pick the guide that solves your current problem',
                              zh: '选能解决你当前问题的攻略',
                              ja: '今の悩みを解決するガイドを選ぼう',
                              es: 'Elige la guía que resuelva tu problema actual' },
    'scn.lead':             { en: 'Duskfade runs are not decided by one fight alone. Use this as a route map — jump into the page that matches your blocker instead of reading every guide in order.',
                              zh: 'Duskfade 一局游戏的胜负从来不是一场战斗决定的。把这里当路线图 —— 直接跳到匹配你卡点的页面，不必按顺序读。',
                              ja: 'Duskfade の勝敗は 1 つの戦闘だけでは決まらない。これをルートマップとして使おう — ブロック箇所に合うページに飛べばOK。',
                              es: 'Las partidas de Duskfade no se deciden en un solo combate. Usa esto como un mapa — salta a la página que coincida con tu bloqueo.' },
    'scn1.h':               { en: 'First time playing',     zh: '第一次玩',     ja: '初めてプレイ',      es: 'Primera vez jugando' },
    'scn1.p':               { en: 'Time-freeze timing, early buys, and surviving the opening hour.',
                              zh: '时间冻结节奏、优先购买与首小时生存。',
                              ja: '時間凍結のタイミング、初期買い物、最初の1時間の生存。',
                              es: 'Tiempo de congelación, compras tempranas y supervivencia de la primera hora.' },
    'scn1.a':               { en: 'Open Beginner Guide →',  zh: '进入新手指南 →',  ja: '初心者ガイドを開く →', es: 'Abrir guía para principiantes →' },
    'scn2.h':               { en: 'Stuck on a boss',        zh: '卡在某个 Boss',  ja: 'ボスで詰まった',      es: 'Atascado en un jefe' },
    'scn2.p':               { en: 'Wrath, Sorrow, Fear, Jealousy, Despair — phase-by-phase counters.',
                              zh: '愤怒、悲伤、恐惧、嫉妒、绝望 —— 分阶段克制。',
                              ja: 'Wrath、Sorrow、Fear、Jealousy、Despair — フェーズ別対策。',
                              es: 'Wrath, Sorrow, Fear, Jealousy, Despair — contraataques por fase.' },
    'scn2.a':               { en: 'Open Boss Strategies →', zh: '进入 Boss 攻略 →',  ja: 'ボス攻略を開く →',    es: 'Abrir estrategias de jefes →' },
    'scn3.h':               { en: 'Missing collectibles',   zh: '找不到收集品',    ja: '収集品が見つからない', es: 'Faltan coleccionables' },
    'scn3.p':               { en: 'Rainbow Ingots, Clock Heart Pieces, and Void Echoes — every region mapped.',
                              zh: '彩虹锭、钟表心碎片、虚空回响 —— 各区域全标记。',
                              ja: 'レインボーインゴット、時計の心臓のかけら、虚無エコー — 全エリア地図付き。',
                              es: 'Lingotes arcoíris, Piezas de Corazón de Reloj y Ecos del Vacío — cada región mapeada.' },
    'scn3.a':               { en: 'Open Collectible Maps →',zh: '进入收集品地图 →',  ja: '収集品マップを開く →', es: 'Abrir mapas de coleccionables →' },
    'scn4.h':               { en: 'Going for 100%',         zh: '目标全成就',      ja: '100% を目指す',      es: 'Apuntando al 100%' },
    'scn4.p':               { en: 'All 25 Steam achievements including the missable Time Anchor ones.',
                              zh: '全部 25 个 Steam 成就，包含易遗漏的 Time Anchor 成就。',
                              ja: '全 25 個の Steam アチーブメント（Time Anchor のような取り逃し含む）。',
                              es: 'Los 25 logros de Steam, incluidos los que se pueden perder como Time Anchor.' },
    'scn4.a':               { en: 'Open Achievements →',    zh: '进入成就攻略 →',  ja: 'アチーブメントを開く →', es: 'Abrir logros →' },

    /* ===== CONTENT GROUPS (3 columns) ===== */
    'grp.title':            { en: 'Win by mastering the time-freeze dodge',
                              zh: '掌握时间冻结闪避，赢得游戏',
                              ja: '時間凍結回避をマスターして勝利を掴め',
                              es: 'Gana dominando la esquiva de congelación de tiempo' },
    'grp.lead':             { en: 'Duskfade rewards tight decisions. Stop rushing, layer your abilities, and choose the next region around health — not greed. This wiki keeps every guide source-checked so you always know what is current.',
                              zh: 'Duskfade 奖励谨慎决策。停止冒进，叠加能力，按血量而非贪婪选择下一区域。本 Wiki 所有攻略均经来源核对，让你掌握最新可靠信息。',
                              ja: 'Duskfade は慎重な判断を評価する。無理をせず、能力を重ね、次のエリアを体力で選ぼう — 欲張らずに。この Wiki は全ガイドの出典を確認し、最新情報を提供する。',
                              es: 'Duskfade recompensa decisiones ajustadas. Deja de correr, apila habilidades y elige la siguiente región por salud — no por codicia. Esta wiki mantiene cada guía verificada para que siempre sepas qué es actual.' },
    'grp1.t':               { en: 'Core Mechanics',         zh: '核心机制',       ja: 'コアメカニクス',  es: 'Mecánicas centrales' },
    'grp2.t':               { en: 'Combat Systems',         zh: '战斗系统',       ja: '戦闘システム',    es: 'Sistemas de combate' },
    'grp3.t':               { en: 'Collectibles & Progress',zh: '收集与进度',     ja: '収集と進行',      es: 'Coleccionables y progreso' },

    /* ===== FEATURE CARDS ===== */
    'feat.weapons':       { en: 'Weapons',    zh: '武器',     ja: '武器',     es: 'Armas' },
    'feat.weapons_d':     { en: 'Complete arsenal breakdown with stats and locations.',
                            zh: '完整武器库解析，含属性与获取位置。',
                            ja: '全武器のステータスと入手場所。',
                            es: 'Arsenal completo con estadísticas y ubicaciones.' },
    'feat.abilities':     { en: 'Abilities',  zh: '能力',     ja: 'アビリティ', es: 'Habilidades' },
    'feat.abilities_d':   { en: 'All unlockable abilities with recommended skill order.',
                            zh: '所有可解锁能力及推荐加点顺序。',
                            ja: '全アビリティとおすすめ習得順。',
                            es: 'Todas las habilidades desbloqueables con orden recomendado.' },
    'feat.achievements':  { en: 'Achievements', zh: '成就',   ja: 'アチーブメント', es: 'Logros' },
    'feat.achievements_d':{ en: '25 Steam Achievements unlocked, including missable ones.',
                            zh: '25 个 Steam 成就解锁，包含易遗漏成就。',
                            ja: '25個のSteamアチーブメント（見逃し含む）。',
                            es: '25 logros de Steam, incluidos los que se pueden perder.' },
    'feat.tierlist':      { en: 'Tier List',  zh: '强度榜',   ja: 'ティアリスト', es: 'Tier List' },
    'feat.tierlist_d':    { en: 'S / A / B / C ranked weapons and abilities.',
                            zh: 'S / A / B / C 级武器与能力排名。',
                            ja: 'S / A / B / C ランクの武器とアビリティ。',
                            es: 'Armas y habilidades clasificadas S / A / B / C.' },
    'feat.characters':    { en: 'Characters', zh: '角色',     ja: 'キャラクター', es: 'Personajes' },
    'feat.characters_d':  { en: 'Zirian, Allira, and the lore of the Minutero.',
                            zh: '齐利安、阿莉拉与时计守护者的故事。',
                            ja: 'ジリアン、アリーラ、ミヌテロの物語。',
                            es: 'Zirian, Allira y la historia del Minutero.' },
    'feat.demo':          { en: 'Demo Guide', zh: 'Demo指南', ja: 'デモガイド', es: 'Guía de demo' },
    'feat.demo_d':        { en: 'Tips for the public demo before launch.',
                            zh: '发售前公开 Demo 的攻略技巧。',
                            ja: '発売前体験版の攻略ヒント。',
                            es: 'Consejos para la demo pública antes del lanzamiento.' },

    /* ===== CARD GRID (Start Here) ===== */
    'card1.tag':   { en: 'Beginner',     zh: '新手',     ja: '初心者',     es: 'Principiante' },
    'card1.title': { en: "Beginner's Guide", zh: '新手指南', ja: '初心者ガイド', es: 'Guía para principiantes' },
    'card1.desc':  { en: 'Master the time-freeze dodge, learn combat basics, and survive your first hour.',
                     zh: '掌握时间冻结闪避，学习战斗基础，挺过第一个小时。',
                     ja: '時間凍結回避をマスターし、戦闘の基礎を学び、最初の1時間を生き延びろ。',
                     es: 'Domina la esquiva de congelación de tiempo, aprende los básicos de combate y sobrevive la primera hora.' },
    'card1.arrow': { en: 'Read more →',  zh: '阅读更多 →', ja: '続きを読む →', es: 'Leer más →' },
    'card2.tag':   { en: 'Bosses',       zh: 'Boss',     ja: 'ボス',       es: 'Jefes' },
    'card2.title': { en: 'Boss Strategies', zh: 'Boss攻略', ja: 'ボス攻略', es: 'Estrategias de jefes' },
    'card2.desc':  { en: 'All 5 bosses with phase-by-phase tactics: Wrath, Sorrow, Fear, Jealousy, Despair.',
                     zh: '全部 5 个 Boss 分阶段攻略：愤怒、悲伤、恐惧、嫉妒、绝望。',
                     ja: '全5ボスのフェーズ別攻略：Wrath、Sorrow、Fear、Jealousy、Despair。',
                     es: 'Los 5 jefes con tácticas por fases: Wrath, Sorrow, Fear, Jealousy, Despair.' },
    'card2.arrow': { en: 'Read more →',  zh: '阅读更多 →', ja: '続きを読む →', es: 'Leer más →' },
    'card3.tag':   { en: 'Walkthrough',  zh: '流程',     ja: '攻略チャート', es: 'Guía' },
    'card3.title': { en: 'Full Walkthrough', zh: '完整流程攻略', ja: '完全攻略チャート', es: 'Guía completa' },
    'card3.desc':  { en: 'Complete story walkthrough from Clock Tower to the final confrontation.',
                     zh: '从钟楼塔到最终决战的完整剧情流程。',
                     ja: '時計塔から最終決戦までの完全ストーリー攻略。',
                     es: 'Guía completa de la historia desde la Torre del Reloj hasta el enfrentamiento final.' },
    'card3.arrow': { en: 'Read more →',  zh: '阅读更多 →', ja: '続きを読む →', es: 'Leer más →' },
    'card4.tag':   { en: 'Collectibles', zh: '收集品',   ja: '収集品',     es: 'Coleccionables' },
    'card4.title': { en: 'Collectible Locations', zh: '收集品位置', ja: '収集品の場所', es: 'Ubicación de coleccionables' },
    'card4.desc':  { en: 'Every hidden item, lore note, and secret collectible mapped out.',
                     zh: '所有隐藏道具、剧情笔记和秘密收集品位置。',
                     ja: 'すべての隠しアイテム、loreメモ、秘密の収集品。',
                     es: 'Todos los objetos ocultos, notas de lore y coleccionables secretos.' },
    'card4.arrow': { en: 'Read more →',  zh: '阅读更多 →', ja: '続きを読む →', es: 'Leer más →' },

    /* ===== ABOUT SECTION (index.html) ===== */
    'about.developed_by':     { en: 'is a 3D action-platformer developed by',     zh: '是一款 3D 动作平台游戏，由',     ja: 'は3Dアクションメ platform developed by',     es: 'es un platform de acción en 3D desarrollado por' },
    'about.published_by':     { en: 'and published by',                            zh: '开发、',                          ja: 'が開発し、',                     es: 'y publicado por' },
    'about.released_on':      { en: ', released on',                               zh: '发布，已于',                      ja: 'が販売、',                       es: ', lanzado el' },
    'about.on_steam':         { en: 'on Steam',                                    zh: '登陆 Steam',                      ja: 'でSteamで配信中',                es: 'en Steam' },
    'about.master_blend':     { en: 'Master a seamless blend of dynamic platforming and fast-paced combat — jump, dash, grapple, and glide through thrilling challenges that rekindle the magic of classic action platformer favourites.',
                                  zh: '体验动态平台跳跃与快节奏战斗的完美融合——跳跃、冲刺、抓钩、滑翔，挑战让人重温经典动作平台游戏魔力的关卡。',
                                  ja: 'ダイナミックなプラットフォームとテンポの速い戦闘のシームレスな融合をマスターしよう——ジャンプ、ダッシュ、グラップル、グライドで、古典的なアクション platform の魔法を呼び起こすスリリングなチャレンジへ。',
                                  es: 'Domina una combinación perfecta de plataformas dinámicas y combate rápido — salta, esquiva, usa el gancho y planea a través de desafíos emocionantes que reavivan la magia de los plataformas de acción clásicos.' },
    'about.explore_realm':    { en: 'Explore stunning realms shaped by the Master Clockmakers, each filled with mystery, magic, breathtaking vistas, and endearing characters. Navigate ethereal forests, underwater realms, sunlit dunes and cloudy heights — the world of Duskfade is alive and teems with secrets for you to uncover.',
                                  zh: '探索由大师钟表匠打造的奇幻领域，每一处都充满神秘、魔法、令人屏息的景观和讨人喜爱的角色。漫步于空灵森林、水下王国、阳光沙丘和云端之巅——Duskfade 的世界充满生机，等你来揭开它的秘密。',
                                  ja: 'マスター時計師が作り上げた stunning な領域を探索しよう——神秘、魔法、息をのむような景色、愛らしいキャラクターが満ちている。幻想の森、水中の王国、陽光の砂丘、雲の高みを進む——Duskfade の世界は生きており、秘密が満ちている。',
                                  es: 'Explora reinos asombrosos moldeados por los Maestros Relojeros, cada uno lleno de misterio, magia, vistas impresionantes y personajes entrañables. Navega por bosques etéreos, reinos submarinos, dunas soleadas y alturas nubladas — el mundo de Duskfade está vivo y rebosa de secretos por descubrir.' },
    'about.coming_of_age':    { en: 'Experience a powerful coming-of-age journey filled with heart, loss, and the courage to face the unknown. Join a cast of charming characters to face down long forgotten foes, each embodying an emotional hurdle.',
                                  zh: '体验一场充满爱、失去与勇气的成长之旅，勇敢面对未知。加入一群讨人喜爱的角色，面对被遗忘已久的敌人，每位敌人都象征着一道情感难关。',
                                  ja: '心、失意、そして未知に立ち向かう勇気に満ちた力強い成長の旅を体験しよう。魅力的なキャラクターたちと共に、長い間忘れられていた敵に立ち向かい、それぞれが感情的なハードルとなる。',
                                  es: 'Experimenta un poderoso viaje de madurez lleno de corazón, pérdida y el valor de enfrentar lo desconocido. Únete a un elenco de personajes encantadores para enfrentar enemigos olvidados, cada uno personificando un obstáculo emocional.' },
    'about.callout_body':     { en: 'Don\'t skip the time-freeze tutorial. It\'s the single most important skill in the game, and most bosses have attacks that are nearly impossible to dodge without it. Practice on the Sorrow boss first — its slow, telegraphed attacks are perfect for learning the timing.',
                                  zh: '不要跳过时间冻结教程。这是游戏中最重要的技能，没有它大多数 Boss 的攻击几乎无法躲避。先练习悲伤 Boss——它的攻击缓慢、有明显预兆动作，最适合新手练手。',
                                  ja: '時間凍結のチュートリアルはスキップしないでください。これはゲームで最も重要なスキルであり、ほとんどのボスの攻撃はそれがなければほぼ回避できません。まず Sorrow ボスで練習しましょう — スローテンポで予備動作がはっきりしているのでタイミング習得に最適です。',
                                  es: 'No te saltes el tutorial de congelación de tiempo. Es la habilidad más importante del juego, y la mayoría de los jefes tienen ataques casi imposibles de esquivar sin ella. Practica primero con el jefe Sorrow — sus ataques lentos y telegrafiados son perfectos para aprender el timing.' },
    'about.btn_review':       { en: 'Read Full Review →', zh: '阅读完整评测 →', ja: 'フルレビューを読む →', es: 'Leer análisis completo →' },
    'about.btn_steam':        { en: 'View on Steam →',    zh: 'Steam 商店 →',    ja: 'Steamで見る →',    es: 'Ver en Steam →' },
    'stat.developer':         { en: 'Developer',  zh: '开发商', ja: '開発者', es: 'Desarrollador' },
    'stat.publisher':         { en: 'Publisher',  zh: '发行商', ja: 'パブリッシャー', es: 'Editor' },
    'stat.genre':             { en: 'Genre',      zh: '类型',   ja: 'ジャンル', es: 'Género' },
    'stat.tags':              { en: 'Tags',       zh: '标签',   ja: 'タグ', es: 'Etiquetas' },

    /* ===== TRAILER LABEL ===== */
    'trailer.label': { en: 'Duskfade — Out Now', zh: 'Duskfade — 现已发售', ja: 'Duskfade — 発売中', es: 'Duskfade — Ya disponible' },

    /* ===== PAGE HERO (inner pages) ===== */
    'ph.boss.title':       { en: 'Boss Strategies',           zh: 'Boss 攻略',           ja: 'ボス攻略',             es: 'Estrategias de jefes' },
    'ph.boss.desc':        { en: 'All 5 bosses with phase-by-phase tactics', zh: '全部 5 个 Boss 分阶段攻略', ja: '全5ボスのフェーズ別攻略', es: 'Los 5 jefes con tácticas por fases' },
    'ph.walkthrough.title':{ en: 'Full Walkthrough',          zh: '完整流程攻略',        ja: '完全攻略チャート',      es: 'Guía completa' },
    'ph.walkthrough.desc': { en: 'Complete story from Clock Tower to finale', zh: '从钟楼塔到结局的完整剧情', ja: '時計塔から結末までの完全ストーリー', es: 'Historia completa de la Torre al final' },
    'ph.collectibles.title':{en: 'Collectible Locations',    zh: '收集品位置',          ja: '収集品の場所',          es: 'Ubicación de coleccionables' },
    'ph.collectibles.desc':{ en: 'Every hidden item and secret', zh: '所有隐藏道具与秘密', ja: '全隠しアイテムと秘密', es: 'Todos los objetos ocultos y secretos' },
    'ph.weapons.title':    { en: 'Weapons & Minutero',        zh: '武器与时计守护者',     ja: '武器とミヌテロ',       es: 'Armas y Minutero' },
    'ph.weapons.desc':     { en: 'Complete arsenal and upgrade guide', zh: '完整武器库与升级指南', ja: '全武器と強化ガイド', es: 'Arsenal completo y guía de mejora' },
    'ph.abilities.title':  { en: 'Abilities Guide',           zh: '能力指南',            ja: 'アビリティガイド',      es: 'Guía de habilidades' },
    'ph.abilities.desc':   { en: 'All unlockable skills and recommended order', zh: '所有可解锁技能与推荐顺序', ja: '全アビリティとおすすめ順', es: 'Todas las habilidades y orden recomendado' },
    'ph.achievements.title':{en: 'Achievements Guide',        zh: '成就指南',            ja: 'アチーブメントガイド',  es: 'Guía de logros' },
    'ph.achievements.desc':{ en: 'All 25 achievements including missable ones', zh: '全部 25 个成就（含易遗漏）', ja: '全25個のアチーブメント（見逃し含む）', es: 'Los 25 logros incluidos los que se pueden perder' },
    'ph.tierlist.title':   { en: 'Tier List',                 zh: '强度排行榜',          ja: 'ティアリスト',         es: 'Tier List' },
    'ph.tierlist.desc':    { en: 'S / A / B / C ranked weapons and abilities', zh: 'S / A / B / C 级武器与能力排名', ja: 'S/A/B/C ランクの武器とアビリティ', es: 'Armas y habilidades clasificadas S/A/B/C' },
    'ph.beginner.title':   { en: "Beginner's Guide",          zh: '新手指南',            ja: '初心者ガイド',         es: 'Guía para principiantes' },
    'ph.beginner.desc':    { en: 'Master the time-freeze dodge and combat basics', zh: '掌握时间冻结闪避与战斗基础', ja: '時間凍結回避と戦闘の基礎をマスター', es: 'Domina la esquiva de congelación y los básicos' },
    'ph.demo.title':       { en: 'Demo Guide',                zh: 'Demo 指南',          ja: 'デモガイド',           es: 'Guía de demo' },
    'ph.demo.desc':        { en: 'Tips and tricks for the public demo', zh: '公开 Demo 的技巧与提示', ja: '体験版のヒントとコツ', es: 'Consejos y trucos para la demo' },
    'ph.review.title':     { en: 'Duskfade Review',           zh: 'Duskfade 评测',       ja: 'Duskfade レビュー',    es: 'Análisis de Duskfade' },
    'ph.review.desc':      { en: 'Our take on the clockpunk soulslike', zh: '我们对这款钟表朋克类魂游戏的评价', ja: '時計朋くソウルライクの評価', es: 'Nuestra opinión del soulslike clockpunk' },
    'ph.characters.title': { en: 'Characters & Lore',         zh: '角色与背景故事',      ja: 'キャラクターとLore',   es: 'Personajes y lore' },
    'ph.characters.desc':  { en: 'Zirian, Allira, and the world of Duskfade', zh: '齐利安、阿莉拉与 Duskfade 的世界', ja: 'ジリアン、アリーラとDuskfadeの世界', es: 'Zirian, Allira y el mundo de Duskfade' },
    'ph.about.title':      { en: 'About This Wiki',           zh: '关于本站',            ja: 'このWikiについて',     es: 'Acerca de esta Wiki' },
    'ph.about.desc':       { en: 'About the site and its creator', zh: '关于本站及其创建者', ja: 'サイトと作者について', es: 'Sobre el sitio y su creador' },
    'ph.contact.title':    { en: 'Contact Us',                zh: '联系我们',            ja: 'お問い合わせ',         es: 'Contáctanos' },
    'ph.contact.desc':     { en: 'Get in touch with the team', zh: '与团队取得联系',     ja: 'チームに連絡する',     es: 'Ponte en contacto con el equipo' },
    'ph.wrath.title':      { en: 'Wrath — Boss Guide',        zh: '愤怒 — Boss 攻略',     ja: 'レイス — ボス攻略',     es: 'Wrath — Guía de Jefe' },
    'ph.wrath.desc':       { en: 'The first boss of Mount Cinder. Anger made machine.', zh: '熔岩山的第一位 Boss。愤怒化作了机器。', ja: 'マウント・シンダーの最初のボス。怒りの機械。', es: 'El primer jefe de Mount Cinder. La ira hecha máquina.' },
    'ph.sorrow.title':     { en: 'Sorrow — Boss Guide',       zh: '悲伤 — Boss 攻略',     ja: 'ソロー — ボス攻略',     es: 'Sorrow — Guía de Jefe' },
    'ph.sorrow.desc':      { en: 'The second boss of the Ethereal Forest. Grief, made gentle enough to learn on.', zh: '空灵森林的第二位 Boss。悲伤，温柔得适合练手。', ja: 'エーテル森林の2番目のボス。悲しみ、練習にちょうどいい。', es: 'El segundo jefe del Bosque Etereo. La pena, lo bastante suave para aprender.' },
    'ph.allira.title':     { en: 'Allira',                    zh: '阿莉拉',              ja: 'アリーラ',             es: 'Allira' },
    'ph.allira.desc':      { en: "Zirian's sister, and the reason the journey begins.", zh: '齐利安的妹妹，也是这趟旅程开始的原因。', ja: 'ジリアンの妹、旅の始まりの理由。', es: 'La hermana de Zirian, y la razón por la que empieza el viaje.' },
    'ph.timefreeze.title': { en: 'The Time-Freeze Dodge',     zh: '时间冻结闪避',        ja: '時間停止回避',         es: 'Esquiva de Congelación Temporal' },
    'ph.timefreeze.desc':  { en: 'The clockpunk twist the whole combat is built around — and the one skill that turns every boss from a wall into a rhythm.',
                             zh: '整个战斗系统的钟表朋克核心转折——也是把每个 Boss 从铜墙铁壁变成可破解节奏的那一项技能。',
                             ja: '戦闘全体の時計朋く核心。すべてのボスを壁からリズムへと変える唯一の技能。',
                             es: 'El giro clockpunk en el que se basa todo el combate — la habilidad que convierte a cada jefe de muro en ritmo.' },
    'ph.cuckoo.title':     { en: 'Cuckoo',                    zh: '布谷鸟',              ja: 'カッコウ',             es: 'Cuckoo' },
    'ph.cuckoo.desc':      { en: "Zirian's sassy mechanical companion — built by Allira, and more useful in a fight than its size suggests.",
                             zh: '齐利安那只毒舌机械鸟伙伴——由阿莉拉制造，在战斗中比它的体型有用得多。',
                             ja: 'ジリアンの気の強い機械の相棒 — アリーラが作り、見た目以上に戦闘で役立つ。',
                             es: 'La sarcástica compañera mecánica de Zirian — construida por Allira y más útil en combate de lo que su tamaño sugiere.' },
    'ph.zirian.title':     { en: 'Zirian — Character Guide',     zh: '齐利安 — 角色指南',     ja: 'ジリアン — キャラクターガイド', es: 'Zirian — Guía de Personaje' },
    'ph.zirian.desc':      { en: "Duskfade's protagonist — the apprentice who wields the Minutero to save his sister.",
                             zh: 'Duskfade 的主角——挥舞时计守护者、誓要拯救妹妹的学徒。',
                             ja: 'Duskfadeの主人公 — ミヌテロを握り、妹を救う見習い。',
                             es: 'El protagonista de Duskfade — el aprendiz que empuña el Minutero para salvar a su hermana.' },
    'ph.fear.title':       { en: 'Fear — Boss Guide',            zh: '恐惧 — Boss 攻略',      ja: 'フィアー — ボス攻略',          es: 'Fear — Guía de Jefe' },
    'ph.fear.desc':        { en: 'The third boss of the Underwater Realm. Terror made palpable — and the fight that tests your nerve.',
                             zh: '水下领域的第三位 Boss。恐惧化为实体——一场考验胆量的战斗。',
                             ja: 'アンダーウォーター・レルムの3番目のボス。恐怖の化身 — 胆力が試される戦い。',
                             es: 'El tercer jefe del Reino Submarino. El terror hecho palpable — y la pelea que pone a prueba tus nervios.' },

    /* ===== COMMON BUTTONS ===== */
    'btn.readmore':         { en: 'Read more →',           zh: '阅读更多 →',          ja: '続きを読む →',         es: 'Leer más →' },
    'btn.viewguide':        { en: 'View Full Guide →',     zh: '查看完整攻略 →',      ja: '完全ガイドを見る →',    es: 'Ver guía completa →' },
    'btn.back':             { en: '← Back to Home',        zh: '← 返回首页',           ja: '← ホームへ戻る',        es: '← Volver al inicio' },
    'btn.gotop':            { en: 'Go to Top ↑',           zh: '回到顶部 ↑',           ja: 'トップへ ↑',           es: 'Volver arriba ↑' }
  };

  /* ============================================================
     GOOGLE TRANSLATE WIDGET — 全页正文翻译兜底
     ============================================================ */

  /* ============================================================
     GOOGLE TRANSLATE COOKIE — 全页正文翻译兜底

     原理：
       1. Google Translate Element 脚本会根据 `googtrans` cookie
          决定是否自动翻译页面。
       2. 用户切换语言时，我们设置 cookie 然后刷新页面；脚本在
          页面加载时读取 cookie 并自动完成整页翻译。
       3. 切回英文时清除 cookie 并刷新，页面恢复原始英文。
       4. data-i18n 在 DOMContentLoaded 时再次应用，覆盖/补充
          导航、按钮、标题等关键 UI 的中文/日文/西文。
     ============================================================ */

  let googleTranslateLoaded = false;

  function injectGoogleTranslateStyles() {
    const id = 'i18n-gt-hide-styles';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
      .goog-te-banner-frame.skiptranslate { display: none !important; }
      body { top: 0 !important; position: static !important; }
      .goog-tooltip, .goog-tooltip:hover { display: none !important; }
      .goog-text-highlight { background: none !important; box-shadow: none !important; }
      #google_translate_element { display: none !important; height: 0 !important; }
      .skiptranslate iframe, .goog-te-gadget, .goog-te-gadget-simple { display: none !important; }
    `;
    document.head.appendChild(style);
  }

  function loadGoogleTranslate() {
    if (googleTranslateLoaded) return;
    googleTranslateLoaded = true;

    injectGoogleTranslateStyles();

    window.googleTranslateElementInit = function () {
      try {
        new google.translate.TranslateElement({
          pageLanguage: 'en',
          includedLanguages: 'zh-CN,ja,es,en',
          layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
          multilanguagePage: true
        }, 'google_translate_element');
      } catch (e) {
        console.warn('[i18n] Google Translate init failed:', e);
      }
    };

    const container = document.createElement('div');
    container.id = 'google_translate_element';
    container.style.display = 'none';
    document.body.appendChild(container);

    const script = document.createElement('script');
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    script.defer = true;
    script.onerror = function () {
      console.warn('[i18n] Google Translate script failed to load. Check your network/VPN.');
    };
    document.body.appendChild(script);
  }

  function getCookieDomain() {
    const host = location.hostname;
    if (!host || host === 'localhost' || host === '127.0.0.1') return '';
    // 同时写入根域和当前域，确保生效
    return host.replace(/^www\./, '');
  }

  function setGoogTransCookie(lang) {
    const target = GOOGLE_LANG_MAP[lang] || lang;
    const value = '/en/' + target;
    const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
    const domain = getCookieDomain();
    document.cookie = 'googtrans=' + value + '; path=/; expires=' + expires;
    if (domain) {
      document.cookie = 'googtrans=' + value + '; path=/; domain=.' + domain + '; expires=' + expires;
    }
  }

  function clearGoogTransCookie() {
    const expires = 'Thu, 01 Jan 1970 00:00:00 UTC';
    const domain = getCookieDomain();
    document.cookie = 'googtrans=; path=/; expires=' + expires;
    if (domain) {
      document.cookie = 'googtrans=; path=/; domain=.' + domain + '; expires=' + expires;
    }
  }

  function getGoogTransCookie() {
    const m = document.cookie.match(/(?:^|; )googtrans=([^;]+)/);
    return m ? decodeURIComponent(m[1]) : '';
  }

  /* ============================================================
     CORE LOGIC — 状态、应用、持久化
     ============================================================ */

  function getLang() {
    try {
      const saved = localStorage.getItem('duskfade-lang');
      if (saved && LANGS.includes(saved)) return saved;
    } catch (e) { /* ignore */ }
    return 'en';
  }

  function setLang(lang) {
    if (!LANGS.includes(lang)) lang = 'en';
    if (lang === getLang()) return;

    try { localStorage.setItem('duskfade-lang', lang); } catch (e) { /* ignore */ }

    // 通过 cookie + reload 让 Google Translate 在页面加载时自动翻译/还原
    if (lang === 'en') {
      clearGoogTransCookie();
    } else {
      setGoogTransCookie(lang);
    }
    location.reload();
  }

  function applyLang(lang) {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : lang;

    // 1. 应用 data-i18n 精细翻译
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      const key = el.getAttribute('data-i18n');
      if (T[key] && T[key][lang]) {
        el.textContent = T[key][lang];
      }
    });
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      const key = el.getAttribute('data-i18n-html');
      if (T[key] && T[key][lang]) {
        el.innerHTML = T[key][lang];
      }
    });

    // 2. 同步下拉菜单
    document.querySelectorAll('.lang-switcher').forEach(function (sel) {
      sel.value = lang;
    });

    // 3. 非英语时显示提示，并确保 Google Translate 脚本已加载
    if (lang !== 'en') {
      showI18nNotice(lang);
      loadGoogleTranslate();
    } else {
      hideI18nNotice();
    }
  }

  /* ============================================================
     FLOATING TRANSLATION NOTICE
     ============================================================ */
  function showI18nNotice(lang) {
    let notice = document.getElementById('i18n-notice');
    if (!notice) return;

    const langNames = { zh: '中文', ja: '日本語', es: 'Español' };
    notice.style.display = 'flex';
    notice.innerHTML =
      '<span>🌐 已切换至 <strong>' + (langNames[lang] || lang) + '</strong>。页面已刷新并由 Google 翻译自动加载整页译文。如显示不完整，可点击 <a class="i18n-translate-link" href="' + buildGTUrl(lang) + '" target="_blank" rel="noopener">Google 翻译版</a></span>' +
      '<button id="i18n-close" style="background:none;border:none;color:var(--text-dim);cursor:pointer;font-size:1.1rem;padding:0 4px;" title="关闭">✕</button>';

    const closeBtn = document.getElementById('i18n-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        notice.style.display = 'none';
      });
    }
  }

  function hideI18nNotice() {
    const notice = document.getElementById('i18n-notice');
    if (notice) notice.style.display = 'none';
  }

  function buildGTUrl(lang) {
    const tl = GOOGLE_LANG_MAP[lang] || lang;
    return 'https://translate.google.com/translate?sl=en&tl=' + tl + '&u=' + encodeURIComponent(location.href);
  }

  /* ============================================================
     INIT
     ============================================================ */
  function init() {
    const savedLang = getLang();
    applyLang(savedLang);

    document.querySelectorAll('.lang-switcher').forEach(function (sel) {
      sel.value = savedLang;
      sel.addEventListener('change', function () {
        setLang(this.value);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // 全局切换接口（方便开发者调用）
  window.duskfadeSetLang = setLang;
  window.duskfadeGetLang = getLang;

  /* ============================================================
     GA4 ENGAGED-READING EVENT
     阅读满 60 秒触发，便于在 GA4 后台将其标记为“关键事件”
     （路径：GA4 → 管理 → 关键事件 → 新建 key event = read_60s）
     ============================================================ */
  setTimeout(function () {
    try {
      if (typeof gtag === 'function') {
        gtag('event', 'read_60s', { page_title: document.title, page_location: location.href });
      }
    } catch (e) { /* ignore */ }
  }, 60000);
})();
