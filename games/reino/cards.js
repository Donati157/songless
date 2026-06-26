/* ===========================================================
   THE KING'S DECISION — conteúdo do jogo (dados)
   -----------------------------------------------------------
   Para ADICIONAR personagens: inclua em CHARS um id com
     { name, role, emoji, color, image:'img/arquivo.png' }
   O campo "image" é opcional — sem ele, mostra o emoji/cor.

   Para ADICIONAR eventos: inclua em EVENTS um objeto:
     {
       id:'unico', char:'idDoPersonagem',
       text:'Fala do personagem ao rei.',
       cond:(s)=> true,           // (opcional) quando pode aparecer
       once:true,                 // (opcional) só aparece uma vez
       weight:1,                  // (opcional) chance relativa
       yes:{ r:'resposta', e:{gold:+8,happy:+5}, set:['flag'], next:{id:'evt',in:[20,40]} },
       no:{  r:'resposta', e:{happy:-4} }
     }
   e = deltas dos atributos: auth,gold,happy,army,know,faith
   set = marca lembranças/flags ; next = agenda consequência futura
   =========================================================== */
window.KINGDOM = (function () {
  const STATS = [
    { k: "auth", name: "Autoridade", icon: "👑" },
    { k: "gold", name: "Ouro",       icon: "💰" },
    { k: "happy", name: "Felicidade",icon: "😊" },
    { k: "army", name: "Exército",   icon: "⚔️" },
    { k: "know", name: "Saber",      icon: "📚" },
    { k: "faith", name: "Fé",        icon: "⛪" },
  ];

  const CHARS = {
    advisor:   { name: "Lorde Aldric",  role: "Conselheiro Real", emoji: "🧙‍♂️", color: "#5b6cff", image: "" },
    farmer:    { name: "Mateus",        role: "Camponês",         emoji: "🧑‍🌾", color: "#6aa84f", image: "" },
    knight:    { name: "Sir Roland",    role: "Comandante",       emoji: "🛡️", color: "#b04a3a", image: "" },
    queen:     { name: "Rainha Isolde", role: "Rainha",           emoji: "👸", color: "#c77dba", image: "" },
    prince:    { name: "Príncipe Edras",role: "Herdeiro",         emoji: "🤴", color: "#d4a23a", image: "" },
    inventor:  { name: "Vera",          role: "Inventora",        emoji: "🔧", color: "#3aa6b0", image: "" },
    wizard:    { name: "Mestre Orin",   role: "Mago",             emoji: "🪄", color: "#8e5bff", image: "" },
    merchant:  { name: "Bartolomeu",    role: "Mercador",         emoji: "💼", color: "#caa64b", image: "" },
    priest:    { name: "Padre Anselmo", role: "Sacerdote",        emoji: "⛪", color: "#cfcfd6", image: "" },
    thief:     { name: "Lyra",          role: "Ladra",            emoji: "🗡️", color: "#7a7f8c", image: "" },
    hunter:    { name: "Garrick",       role: "Caçador de Dragões",emoji: "🐉", color: "#a3402f", image: "" },
    explorer:  { name: "Cíntia",        role: "Exploradora",      emoji: "🧭", color: "#3a8fb0", image: "" },
    smith:     { name: "Brenda",        role: "Ferreira",         emoji: "🔨", color: "#9c6b3a", image: "" },
    doctor:    { name: "Dra. Helena",   role: "Médica",           emoji: "⚕️", color: "#4fae8b", image: "" },
    jester:    { name: "Pip",           role: "Bobo da Corte",    emoji: "🃏", color: "#d65a9c", image: "" },
    envoy:     { name: "Emissário",     role: "Reino Vizinho",    emoji: "📜", color: "#b0853a", image: "" },
    spy:       { name: "A Sombra",      role: "Espiã",            emoji: "🕵️", color: "#566173", image: "" },
    peasants:  { name: "O Povo",        role: "Multidão",         emoji: "👥", color: "#8d93a0", image: "" },
  };

  // atalho p/ flags
  const has = (s, f) => s.flags.has(f);

  const EVENTS = [
    // ---------- ECONOMIA ----------
    { id: "market", char: "merchant", text: "Majestade, conceda-me licença para erguer um grande mercado na praça central. O reino prosperará... e eu também.",
      yes: { r: "As barracas se enchem de gente.", e: { gold: 7, happy: 5, auth: -2 }, set: ["market"], next: { id: "market_end", in: [18, 34] } },
      no:  { r: "O mercador parte resmungando.", e: { gold: -2, happy: -4 } } },
    { id: "market_end", char: "merchant", scheduledOnly: true, cond: (s) => has(s, "market"),
      text: "O mercado que abençoastes virou um império. Aceitai a vossa parte dos lucros... ou tudo será meu.",
      yes: { r: "Os cofres reais transbordam.", e: { gold: 16, auth: 4 } },
      no:  { r: "Ele fica com tudo — e com a lealdade do povo.", e: { gold: 4, happy: 6, auth: -6 } } },
    { id: "tax", char: "advisor", text: "Os cofres minguam, meu rei. Proponho aumentar os impostos sobre os camponeses.",
      yes: { r: "O ouro entra; o povo range os dentes.", e: { gold: 12, happy: -10, auth: 3 } },
      no:  { r: "O povo respira aliviado.", e: { gold: -4, happy: 7 } } },
    { id: "famine_relief", char: "farmer", cond: (s) => s.stats.happy < 45,
      text: "A colheita falhou no sul. Abrireis os celeiros reais para nos alimentar?",
      yes: { r: "Pão para todos. Eles não esquecerão.", e: { gold: -8, happy: 12, faith: 3 } },
      no:  { r: "A fome se espalha pelas aldeias.", e: { happy: -12, auth: -4 } } },

    // ---------- POLÍTICA ----------
    { id: "noble_feast", char: "advisor", text: "Os nobres exigem um banquete em sua homenagem. Recusar seria uma afronta.",
      yes: { r: "Vinho corre solto no salão.", e: { gold: -7, auth: 8, happy: 3 } },
      no:  { r: "Os nobres murmuram pelos corredores.", e: { auth: -8, gold: 2 }, set: ["nobles_angry"], next: { id: "noble_plot", in: [15, 30] } } },
    { id: "noble_plot", char: "spy", scheduledOnly: true, cond: (s) => has(s, "nobles_angry"),
      text: "Os nobres ofendidos tramam uma conspiração. Quereis que eu os silencie... discretamente?",
      yes: { r: "A trama some na calada da noite.", e: { auth: 6, happy: -4, gold: -4 } },
      no:  { r: "A conspiração ganha força.", e: { auth: -10, army: -4 } } },
    { id: "crown_marriage", char: "queen", cond: (s) => s.day > 6 && !has(s, "married_alliance"),
      text: "Um reino vizinho oferece aliança por casamento de nosso herdeiro. Aceitais unir as coroas?",
      yes: { r: "Sinos repicam pela aliança.", e: { auth: 6, gold: 6, army: 5 }, set: ["married_alliance"] },
      no:  { r: "A oferta é recusada com cortesia gélida.", e: { auth: -3, army: -3 }, set: ["snubbed_neighbor"] } },
    { id: "succession", char: "prince", cond: (s) => s.day > 20,
      text: "Pai, estou pronto para governar uma província. Confiais a mim esse poder?",
      yes: { r: "O jovem parte cheio de orgulho.", e: { auth: 5, know: 3, happy: 2 } },
      no:  { r: "Ele se sente menosprezado.", e: { happy: -3, auth: 2 } } },

    // ---------- GUERRA ----------
    { id: "border_attack", char: "knight", text: "A fronteira norte está sob ataque! Enviamos tropas para defendê-la?",
      yes: { r: "Os estandartes marcham ao norte.", e: { army: -6, gold: -6, auth: 6, happy: 4 } },
      no:  { r: "Aldeias fronteiriças são saqueadas.", e: { happy: -10, auth: -6, gold: -3 } } },
    { id: "recruit", char: "knight", text: "Precisamos de mais soldados. Autorizais o recrutamento nas aldeias?",
      yes: { r: "Jovens trocam o arado pela espada.", e: { army: 10, happy: -6, gold: -4 } },
      no:  { r: "O exército segue desfalcado.", e: { army: -2 } } },
    { id: "mercenaries", char: "merchant", cond: (s) => s.stats.army < 40,
      text: "Posso contratar mercenários estrangeiros — leais ao ouro, não à coroa.",
      yes: { r: "Lâminas alugadas reforçam as muralhas.", e: { army: 12, gold: -12, auth: -3 } },
      no:  { r: "Confiamos apenas nos nossos.", e: {} } },
    { id: "war_offer", char: "envoy", cond: (s) => s.stats.army > 60,
      text: "Vosso exército é temido. Um reino fraco ao leste se renderia se apenas marchásseis. Conquistamos?",
      yes: { r: "Terras anexadas sem grande luta.", e: { army: -4, gold: 14, auth: 8, happy: -5, faith: -3 } },
      no:  { r: "Poupamos o reino vizinho.", e: { faith: 5, happy: 4 } } },

    // ---------- RELIGIÃO ----------
    { id: "temple", char: "priest", text: "A fé do povo vacila. Construamos um grande templo na capital?",
      yes: { r: "Vitrais coloridos erguem-se ao céu.", e: { gold: -9, faith: 12, happy: 5 } },
      no:  { r: "O clero franze a testa.", e: { faith: -8 }, set: ["church_angry"] } },
    { id: "heresy", char: "priest", cond: (s) => s.stats.know > 55,
      text: "Os sábios pregam ideias que desafiam a doutrina. Devo proibir esses livros?",
      yes: { r: "Fogueiras consomem o conhecimento proibido.", e: { faith: 8, know: -10, happy: -3 } },
      no:  { r: "As ideias circulam livremente.", e: { know: 6, faith: -8 } } },
    { id: "blessing", char: "priest", cond: (s) => has(s, "church_angry"),
      text: "Reparai vossa falta: financiai uma peregrinação sagrada e o clero vos perdoará.",
      yes: { r: "O clero volta a sorrir.", e: { gold: -6, faith: 10 }, set: [] },
      no:  { r: "A igreja vos declara avarento.", e: { faith: -6, happy: -4 } } },

    // ---------- CIÊNCIA / SABER ----------
    { id: "invention", char: "inventor", text: "Inventei um moinho movido a água que triplica a farinha! Financiais minha oficina?",
      yes: { r: "Engrenagens giram pela primeira vez.", e: { gold: -7, know: 8, happy: 4 }, set: ["invented"], next: { id: "invention_end", in: [16, 30] } },
      no:  { r: "A inventora guarda seus planos.", e: { know: -3 } } },
    { id: "invention_end", char: "inventor", scheduledOnly: true, cond: (s) => has(s, "invented"),
      text: "O moinho que financiastes revolucionou o reino! Outras cidades imploram pela máquina.",
      yes: { r: "A engenhoca enriquece o reino.", e: { gold: 14, know: 6, happy: 5 } },
      no:  { r: "Guardamos o segredo só para nós.", e: { gold: 6, know: 8, happy: -3 } } },
    { id: "school", char: "advisor", text: "Fundemos uma escola para formar escribas e contadores?",
      yes: { r: "Crianças aprendem letras e números.", e: { gold: -6, know: 10, happy: 3 } },
      no:  { r: "O reino segue analfabeto.", e: { know: -4 } } },
    { id: "observatory", char: "wizard", cond: (s) => s.stats.know > 50,
      text: "As estrelas guardam segredos. Construímos uma torre de observação astral?",
      yes: { r: "Lentes apontam para o infinito.", e: { gold: -8, know: 12, faith: -4 } },
      no:  { r: "Os céus permanecem um mistério.", e: {} } },

    // ---------- DESASTRES / ALEATÓRIOS ----------
    { id: "fire", char: "peasants", text: "Fogo! As chamas devoram o bairro dos artesãos! Liberais ouro para reconstruir?",
      yes: { r: "Telhados novos cobrem a cidade.", e: { gold: -10, happy: 9, auth: 3 } },
      no:  { r: "Cinzas e ressentimento ficam.", e: { happy: -12, gold: 2 } } },
    { id: "plague", char: "doctor", cond: (s) => s.day > 10,
      text: "Uma peste se alastra. Posso impor quarentena rígida — dura, mas eficaz. Autorizais?",
      yes: { r: "As portas se fecham; a peste recua.", e: { happy: -6, gold: -5, know: 4 } },
      no:  { r: "A doença se espalha sem freio.", e: { happy: -14, army: -5 } } },
    { id: "drought", char: "farmer", text: "Uma seca castiga os campos. Cavamos canais de irrigação às custas da coroa?",
      yes: { r: "Água corre para as plantações.", e: { gold: -8, happy: 8, know: 3 } },
      no:  { r: "A terra racha e o gado morre.", e: { happy: -9, gold: -4 } } },
    { id: "festival", char: "jester", text: "O povo anda cabisbaixo, Majestade! Que tal um grande festival com música e vinho?",
      yes: { r: "Risadas ecoam pelas ruas.", e: { gold: -6, happy: 12, auth: 2 } },
      no:  { r: "Pip faz uma careca triste e sai.", e: { happy: -4 } } },
    { id: "treasure", char: "explorer", text: "Encontrei um mapa de tesouro nas ruínas do sul! Financiais a expedição?",
      yes: { r: "Cofres antigos são desenterrados.", e: { gold: -5, know: 3 }, next: { id: "treasure_end", in: [8, 18] } },
      no:  { r: "O mapa some no mercado negro.", e: { know: -2 } } },
    { id: "treasure_end", char: "explorer", scheduledOnly: true,
      text: "Voltei das ruínas! E não voltei de mãos vazias, meu rei...",
      yes: { r: "Ouro e relíquias enchem o salão!", e: { gold: 20, happy: 6, know: 5 } },
      no:  { r: "Recusais a divisão e ela some com tudo.", e: { gold: -4, happy: -5 } } },
    { id: "dragon", char: "hunter", cond: (s) => s.day > 25 && !has(s, "dragon_done"),
      text: "Um dragão pousou nas montanhas e queima vilarejos. Pago para caçá-lo. Mando-me à fera?",
      yes: { r: "Garrick parte com a lança em punho.", e: { gold: -10, army: -4 }, set: ["dragon_sent"], next: { id: "dragon_end", in: [6, 14] } },
      no:  { r: "O dragão continua a aterrorizar.", e: { happy: -10, faith: -4 }, set: ["dragon_done"] } },
    { id: "dragon_end", char: "hunter", scheduledOnly: true, cond: (s) => has(s, "dragon_sent"),
      text: "A fera está morta! Trago-vos sua cabeça e seu tesouro acumulado por séculos.",
      yes: { r: "O reino celebra o herói matador de dragões!", e: { gold: 18, happy: 14, auth: 8, faith: 4 }, set: ["dragon_done", "dragon_slain"] },
      no:  { r: "Negais a recompensa; o herói vira lenda contra vós.", e: { happy: -8, auth: -6 }, set: ["dragon_done"] } },

    // ---------- ENCONTROS / MORAL ----------
    { id: "thief_caught", char: "knight", text: "Pegamos uma ladra roubando o tesouro. Executamo-la como manda a lei?",
      yes: { r: "A justiça é dura e definitiva.", e: { auth: 6, happy: -5, faith: 2 }, set: ["thief_dead"] },
      no:  { r: "Vós a poupais. Ela some na multidão.", e: { auth: -4, happy: 4 }, set: ["thief_spared"], next: { id: "thief_return", in: [20, 40] } } },
    { id: "thief_return", char: "thief", scheduledOnly: true, cond: (s) => has(s, "thief_spared"),
      text: "Vós me poupastes uma vez. Agora trago segredos do reino inimigo. Confiais em mim?",
      yes: { r: "A ladra vira vossa melhor espiã.", e: { auth: 5, gold: 6, army: 4 } },
      no:  { r: "Ela some — talvez para o outro lado.", e: { auth: -3 } } },
    { id: "beggar", char: "peasants", text: "Um velho mendigo jura ser um rei deposto de terras distantes e pede abrigo.",
      yes: { r: "Dais-lhe um quarto e uma refeição quente.", e: { gold: -2, happy: 5, faith: 3 } },
      no:  { r: "Os guardas o expulsam ao frio.", e: { happy: -4, faith: -3 } } },
    { id: "jester_joke", char: "jester", text: "Posso fazer uma piada sobre os nobres no banquete de hoje? Prometo que (quase) ninguém se ofende.",
      yes: { r: "O salão explode em gargalhadas.", e: { happy: 7, auth: -4 } },
      no:  { r: "Pip engole a piada, contrariado.", e: { happy: -2, auth: 2 } } },
    { id: "smith_armor", char: "smith", text: "Forjei uma armadura real digna de lendas. Pagais o preço do aço élfico?",
      yes: { r: "A armadura reluz no trono.", e: { gold: -8, auth: 7, army: 4 } },
      no:  { r: "Uso ferro comum, então.", e: { auth: -2 } } },
    { id: "wizard_pact", char: "wizard", cond: (s) => s.day > 15,
      text: "Posso invocar um espírito que prevê colheitas e guerras — por um pequeno preço de vossa fé.",
      yes: { r: "Sombras sussurram o futuro.", e: { know: 10, gold: 6, faith: -10 } },
      no:  { r: "Rejeitais a magia obscura.", e: { faith: 6, know: -3 } } },
    { id: "spy_report", char: "spy", cond: (s) => s.day > 12,
      text: "Descobri um traidor entre vossos conselheiros. Devo agir sem provas?",
      yes: { r: "Um conselheiro desaparece. Era culpado?", e: { auth: 4, happy: -4, know: -3 } },
      no:  { r: "Exigis provas. A Sombra recua.", e: { auth: -2, know: 3 } } },
    { id: "explorer_sea", char: "explorer", cond: (s) => s.stats.gold > 55,
      text: "Quero zarpar além do mapa em busca de novas terras. Patrocinais minha frota?",
      yes: { r: "Velas somem no horizonte.", e: { gold: -12 }, next: { id: "treasure_end", in: [12, 22] } },
      no:  { r: "Ficamos em terra firme.", e: { know: -2 } } },
    { id: "doctor_study", char: "doctor", text: "Para curar melhor, preciso estudar os corpos dos mortos. A igreja condena. Autorizais?",
      yes: { r: "A medicina avança nas sombras.", e: { know: 9, faith: -7, happy: 2 } },
      no:  { r: "Respeitamos os mortos.", e: { faith: 5, know: -3 } } },
    { id: "rebellion", char: "peasants", cond: (s) => s.stats.happy < 30,
      text: "O povo está à beira da revolta! Reduzis os impostos para acalmá-los?",
      yes: { r: "A multidão se dispersa, satisfeita.", e: { gold: -10, happy: 14, auth: -3 } },
      no:  { r: "Mandais a guarda. O ódio cresce.", e: { happy: -8, auth: -6, army: -3 } } },
    { id: "envoy_trade", char: "envoy", text: "Meu reino propõe um pacto comercial. Abris vossas fronteiras ao nosso comércio?",
      yes: { r: "Caravanas cruzam as fronteiras.", e: { gold: 9, know: 4, army: -2 } },
      no:  { r: "Mantemos as portas fechadas.", e: { gold: -3, auth: 3 } } },
  ];

  // ---------- FINAIS ----------
  const ENDINGS = {
    auth_low:  { icon: "💀", title: "A Revolução", text: "Sem autoridade, os nobres e o povo se ergueram. Vossa coroa rolou pelas escadarias do castelo." },
    auth_high: { icon: "⚔️", title: "O Tirano", text: "Vosso punho de ferro sufocou todos. Reináveis pelo medo — até o exército decidir reinar por vós." },
    gold_low:  { icon: "🔥", title: "A Falência", text: "Os cofres secaram. Sem ouro, o reino se desfez em dívidas, fome e ruína." },
    gold_high: { icon: "💰", title: "O Rei Mercador", text: "Vossa fortuna virou lenda. Reis distantes pedem empréstimos à coroa mais rica do mundo." },
    happy_low: { icon: "🪓", title: "A Revolta Popular", text: "O povo cansou. Tochas cercaram o castelo numa noite sem fim para vós." },
    happy_high:{ icon: "🎉", title: "O Rei Amado", text: "Nenhum monarca foi tão querido. Vosso nome virou canção cantada por gerações." },
    army_low:  { icon: "🏴", title: "Conquistados", text: "Sem exército, as fronteiras ruíram. Outro estandarte agora tremula sobre o trono." },
    army_high: { icon: "🗡️", title: "O Senhor da Guerra", text: "Vossas legiões eram imparáveis — e perceberam que não precisavam mais de um rei." },
    know_low:  { icon: "🕯️", title: "A Era das Trevas", text: "A ignorância venceu. O reino afundou em superstição e estagnação." },
    know_high: { icon: "📚", title: "O Iluminismo", text: "Vossas escolas e torres iluminaram o mundo. Esta era levará vosso nome para sempre." },
    faith_low: { icon: "😈", title: "O Reino Sem Deus", text: "A fé morreu sob vosso reinado. O clero vos amaldiçoou e o povo perdeu o rumo." },
    faith_high:{ icon: "⛪", title: "A Teocracia", text: "A fé tomou conta de tudo. Os sacerdotes agora falam mais alto que a coroa." },
    legend:    { icon: "👑", title: "A Dinastia Eterna", text: "Sobrevivestes a tudo e mantivestes o reino em equilíbrio. Vossa linhagem reinará por séculos." },
    golden:    { icon: "🏆", title: "A Idade do Ouro", text: "Próspero, sábio, amado e forte — vosso reino entrou para a história como uma lenda dourada." },
  };

  // ---------- CONQUISTAS ----------
  const ACHV = [
    { id: "survive25",  icon: "🌅", name: "Sobrevivente",     cond: (s) => s.day >= 25 },
    { id: "survive50",  icon: "🏰", name: "Rei Estabelecido", cond: (s) => s.day >= 50 },
    { id: "survive100", icon: "⏳", name: "100 Dias no Trono", cond: (s) => s.day >= 100 },
    { id: "rich",       icon: "💎", name: "Cofres Cheios",     cond: (s) => s.stats.gold >= 90 },
    { id: "warlord",    icon: "⚔️", name: "Senhor da Guerra",  cond: (s) => s.stats.army >= 90 },
    { id: "scholar",    icon: "🧠", name: "Mente Brilhante",   cond: (s) => s.stats.know >= 90 },
    { id: "saint",      icon: "✨", name: "O Escolhido",       cond: (s) => s.stats.faith >= 90 },
    { id: "beloved",    icon: "❤️", name: "Rei Amado",         cond: (s) => s.stats.happy >= 90 },
    { id: "dragon",     icon: "🐉", name: "Mata-Dragões",      cond: (s) => s.flags.has("dragon_slain") },
    { id: "diplomat",   icon: "🤝", name: "Mestre Diplomata",  cond: (s) => s.flags.has("married_alliance") && s.stats.auth >= 60 },
  ];

  return { STATS, CHARS, EVENTS, ENDINGS, ACHV };
})();
