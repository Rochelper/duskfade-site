/**
 * Duskfade Wiki — i18n Multi-Language System
 * Supports: English (en), 中文 (zh), 日本語 (ja), Español (es)
 * Uses data-i18n attributes on HTML elements
 * Persists choice in localStorage
 */
(function () {
  'use strict';

  const LANGS = ['en', 'zh', 'ja', 'es'];

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
                          zh: 'Duskfade 攻略百科 — 粉丝制作。Duskfade 是 Weird Beluga 的商标。',
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
    'stat1.value': { en: 'Released',     zh: '已发售',     ja: '発売中',       es: 'Disponible' },
    'stat1.label': { en: 'Aug 13, 2026', zh: '2026年8月13日', ja: '2026年8月13日', es: '13 Ago, 2026' },
    'stat2.value': { en: '$23.99',       zh: '$23.99',     ja: '$23.99',       es: '$23.99' },
    'stat2.label': { en: '20% off at launch', zh: '首发8折', ja: '発売記念20%オフ', es: '20% de descuento' },
    'stat3.value': { en: '5',            zh: '5',          ja: '5',            es: '5' },
    'stat3.label': { en: 'Main Bosses',  zh: '主要 Boss',   ja: 'メインボス',    es: 'Jefes principales' },
    'stat4.value': { en: '25',           zh: '25',         ja: '25',           es: '25' },
    'stat4.label': { en: 'Achievements', zh: '成就',       ja: 'アチーブメント',  es: 'Logros' },
    'stat5.value': { en: '100%',         zh: '100%',       ja: '100%',         es: '100%' },
    'stat5.label': { en: 'Free & Updated', zh: '免费且持续更新', ja: '無料・更新中', es: 'Gratis y actualizado' },

    /* ===== SECTION HEADERS (index.html) ===== */
    'sec.starthere':      { en: 'Start Here',       zh: '从这里开始',     ja: 'ここから始める',       es: 'Empieza aquí' },
    'sec.starthere_desc': { en: 'New to Duskfade? Begin with these essential guides.',
                            zh: 'Duskfade 新手？从这些核心指南开始。',
                            ja: 'Duskfade 初心者？まずはここから。',
                            es: '¿Nuevo en Duskfade? Comienza con estas guías esenciales.' },
    'sec.trailer':        { en: 'Official Trailer', zh: '官方预告片',     ja: '公式トレーラー',       es: 'Tráiler oficial' },
    'sec.screenshots':    { en: 'Screenshots',      zh: '游戏截图',       ja: 'スクリーンショット',    es: 'Capturas de pantalla' },
    'sec.screenshots_desc':{en:'Explore the clockpunk world of Duskfade — ethereal forests, underwater realms, sunlit dunes, and cloudy heights.',
                            zh:'探索 Duskfade 的钟表朋克世界——空灵森林、水下王国、阳光沙丘和云端高地。',
                            ja:'Duskfade の時計朋克ワールドを探索しよう——幻想の森、水中の王国、陽光の砂丘、雲の高み。',
                            es:'Explora el mundo clockpunk de Duskfade — bosques etéreos, reinos submarinos, dunas soleadas y alturas nubladas.' },
    'sec.features':       { en: 'What This Wiki Covers', zh: '百科内容涵盖', ja: 'Wikiの内容', es: 'Contenido de la Wiki' },
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

    /* ===== TRAILER LABEL ===== */
    'trailer.label': { en: 'Duskfade — Out Now', zh: 'Duskfade — 现已发售', ja: 'Duskfade — 発売中', es: 'Duskfade — Ya disponible' },

    /* ===== ABOUT SECTION ===== */
    'about.btn_review': { en: 'Read Full Review →', zh: '阅读完整评测 →', ja: 'フルレビューを読む →', es: 'Leer análisis completo →' },
    'about.btn_steam':  { en: 'View on Steam →',    zh: 'Steam 商店 →',    ja: 'Steamで見る →',    es: 'Ver en Steam →' },

    /* ===== CALLOUT ===== */
    'callout.newplayers_title': { en: 'For New Players', zh: '给新玩家的建议', ja: '初心者へ', es: 'Para nuevos jugadores' },

    /* ===== PAGE HERO (inner pages) ===== */
    'ph.boss.title':       { en: 'Boss Strategies',           zh: 'Boss 攻略',           ja: 'ボス攻略',             es: 'Estrategias de jefes' },
    'ph.boss.desc':        { en: 'All 5 bosses with phase-by-phase tactics', zh: '全部 5 个 Boss 分阶段攻略', ja: '全5ボスのフェーズ別攻略', es: 'Los 5 jefes con tácticas por fases' },
    'ph.walkthrough.title':{ en: 'Full Walkthrough',          zh: '完整流程攻略',        ja: '完全攻略チャート',      es: 'Guía completa' },
    'ph.walkthrough.desc': { en: 'Complete story from Clock Tower to finale', zh: '从钟楼塔到结局的完整剧情', ja: '時計塔から結末までの完全ストーリー', es: 'Historia completa de la Torre al final' },
    'ph.collectibles.title':{en: 'Collectible Locations',    zh: '收集品位置',          ja: '収集品の場所',          es: 'Ubicación de coleccionables' },
    'ph.collectibles.desc':{ en: 'Every hidden item and secret', zh: '所有隐藏道具与秘密', ja: '全隠しアイテムと秘密', es: 'Todos los objetos ocultos y secretos' },
    'ph.weapons.title':    { en: 'Weapons & Minutero',        zh: '武器与 Minutero',     ja: '武器とミヌテロ',       es: 'Armas y Minutero' },
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
    'ph.review.desc':      { en: 'Our take on the clockpunk soulslike', zh: '我们对这款钟表朋克类魂游戏的评价', ja: '時計朋克ソウルライクの評価', es: 'Nuestra opinión del soulslike clockpunk' },
    'ph.characters.title': { en: 'Characters & Lore',         zh: '角色与背景故事',      ja: 'キャラクターとLore',   es: 'Personajes y lore' },
    'ph.characters.desc':  { en: 'Zirian, Allira, and the world of Duskfade', zh: '齐利安、阿莉拉与 Duskfade 的世界', ja: 'ジリアン、アリーラとDuskfadeの世界', es: 'Zirian, Allira y el mundo de Duskfade' },
    'ph.about.title':      { en: 'About This Wiki',           zh: '关于本站',            ja: 'このWikiについて',     es: 'Acerca de esta Wiki' },
    'ph.about.desc':       { en: 'About the site and its creator', zh: '关于本站及其创建者', ja: 'サイトと作者について', es: 'Sobre el sitio y su creador' },
    'ph.contact.title':    { en: 'Contact Us',                zh: '联系我们',            ja: 'お問い合わせ',         es: 'Contáctanos' },
    'ph.contact.desc':     { en: 'Get in touch with the team', zh: '与团队取得联系',     ja: 'チームに連絡する',     es: 'Ponte en contacto con el equipo' },

    /* ===== TRANSLATION NOTICE ===== */
    'notice.text': { en: '', zh: '页面正文内容为英文。', ja: 'ページ本文は英語です。', es: 'El contenido principal está en inglés.' },
    'notice.link': { en: '', zh: '使用 Google 翻译全文 →', ja: 'Google翻訳で全文を翻訳 →', es: 'Traducir con Google Translate →' }
  };

  /* ===== LANGUAGE SWITCHER LOGIC ===== */

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

    // Update all [data-i18n] elements
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      const key = el.getAttribute('data-i18n');
      if (T[key] && T[key][lang]) {
        el.textContent = T[key][lang];
      }
    });

    // Update all [data-i18n-html] elements (allows HTML content)
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      const key = el.getAttribute('data-i18n-html');
      if (T[key] && T[key][lang]) {
        el.innerHTML = T[key][lang];
      }
    });

    // Update language switcher dropdown
    document.querySelectorAll('.lang-switcher').forEach(function (sel) {
      sel.value = lang;
    });

    // Show/hide translation notice for non-English
    const notice = document.getElementById('i18n-notice');
    if (notice) {
      notice.style.display = (lang !== 'en') ? 'block' : 'none';
      // Update Google Translate link
      const link = notice.querySelector('.i18n-translate-link');
      if (link) {
        const tl = { zh: 'zh-CN', ja: 'ja', es: 'es' };
        const currentUrl = window.location.href;
        link.href = 'https://translate.google.com/translate?sl=en&tl=' + (tl[lang] || lang) + '&u=' + encodeURIComponent(currentUrl);
      }
    }
  }

  // Initialize on DOM ready
  function init() {
    const savedLang = getLang();
    applyLang(savedLang);

    // Bind language switcher change events
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
})();
