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

    /* ===== COMMON BUTTONS ===== */
    'btn.readmore':         { en: 'Read more →',           zh: '阅读更多 →',          ja: '続きを読む →',         es: 'Leer más →' },
    'btn.viewguide':        { en: 'View Full Guide →',     zh: '查看完整攻略 →',      ja: '完全ガイドを見る →',    es: 'Ver guía completa →' },
    'btn.back':             { en: '← Back to Home',        zh: '← 返回首页',           ja: '← ホームへ戻る',        es: '← Volver al inicio' },
    'btn.gotop':            { en: 'Go to Top ↑',           zh: '回到顶部 ↑',           ja: 'トップへ ↑',           es: 'Volver arriba ↑' }
  };

  /* ============================================================
     GOOGLE TRANSLATE WIDGET — 全页正文翻译兜底
     ============================================================ */

  let googleTranslateLoaded = false;
  let googleTranslateReady = false;
  const pendingQueue = [];

  function loadGoogleTranslate() {
    if (googleTranslateLoaded) return;
    googleTranslateLoaded = true;

    // 隐藏 Google Translate 默认 UI（我们用自己的下拉菜单触发）
    const style = document.createElement('style');
    style.textContent = `
      .goog-te-banner-frame.skiptranslate { display: none !important; }
      body { top: 0 !important; }
      .goog-tooltip { display: none !important; }
      .goog-tooltip:hover { display: none !important; }
      .goog-text-highlight { background: none !important; box-shadow: none !important; }
      #google_translate_element { display: none !important; }
      .skiptranslate iframe, .goog-te-gadget { display: none !important; }
    `;
    document.head.appendChild(style);

    window.googleTranslateElementInit = function () {
      try {
        new google.translate.TranslateElement({
          pageLanguage: 'en',
          includedLanguages: 'zh-CN,ja,es,en',
          layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
          multilanguagePage: true
        }, 'google_translate_element');
        googleTranslateReady = true;
        // 处理排队的语言切换请求
        while (pendingQueue.length) {
          const cb = pendingQueue.shift();
          cb();
        }
      } catch (e) {
        console.warn('[i18n] Google Translate init failed:', e);
      }
    };

    // 隐藏容器
    const container = document.createElement('div');
    container.id = 'google_translate_element';
    container.style.display = 'none';
    document.body.appendChild(container);

    // 异步加载 translate_a/element.js
    const script = document.createElement('script');
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    script.defer = true;
    script.onerror = function () {
      console.warn('[i18n] Google Translate script failed to load. Check your network/VPN.');
    };
    document.body.appendChild(script);
  }

  function translatePageContent(lang) {
    if (lang === 'en') {
      // 切回英文：恢复到原状
      const select = document.querySelector('.goog-te-combo');
      if (select && select.value !== '') {
        select.value = '';
        select.dispatchEvent(new Event('change'));
        // 刷新页面以彻底还原（Google Translate 修改了 DOM）
        setTimeout(() => location.reload(), 50);
      }
      return;
    }
    // 非英语：注入翻译
    const doTranslate = () => {
      const select = document.querySelector('.goog-te-combo');
      if (select) {
        const target = GOOGLE_LANG_MAP[lang] || lang;
        if (select.value !== target) {
          select.value = target;
          select.dispatchEvent(new Event('change'));
        }
      } else {
        console.warn('[i18n] Google Translate widget not ready. data-i18n still applied.');
      }
    };
    if (googleTranslateReady) doTranslate();
    else pendingQueue.push(doTranslate);
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
    try { localStorage.setItem('duskfade-lang', lang); } catch (e) { /* ignore */ }
    applyLang(lang);
  }

  function applyLang(lang) {
    document.documentElement.lang = lang;

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

    // 3. 全页正文翻译（Google Translate widget）
    if (lang !== 'en') {
      loadGoogleTranslate();
      translatePageContent(lang);
      showI18nNotice(lang);
    } else {
      hideI18nNotice();
      // 退出翻译状态
      translatePageContent('en');
    }

    // 4. 更新标题/OG tags（可选）
    try {
      const langSel = { zh: 'zh-CN', ja: 'ja', es: 'es', en: 'en' };
      document.documentElement.lang = lang === 'zh' ? 'zh-CN' : lang;
    } catch (e) { /* ignore */ }
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
      '<span>🌐 已切换至 <strong>' + (langNames[lang] || lang) + '</strong>。整页正文正在通过 Google 翻译加载… 如有问题可点击这里查看 <a class="i18n-translate-link" href="' + buildGTUrl(lang) + '" target="_blank" rel="noopener">Google 翻译版</a></span>' +
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
})();
