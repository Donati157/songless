// ===== Catálogo Atenis Games (apenas jogos reais e jogáveis) =====
const CATEGORIES = [
  { id: "todos",   name: "Início",     icon: "🏠" },
  { id: "corrida", name: "Corrida",    icon: "🏎️" },
  { id: "cartas",  name: "Paciência",  icon: "🃏" },
];

const GAMES = [
  {
    id: "car3d",
    title: "City Drive 3D",
    short: "Dirija por uma cidade 3D viva com física de carro de verdade.",
    cat: "corrida",
    catName: "Corrida",
    rating: 4.8,
    plays: "6.3M",
    dev: "Atenis Studios",
    tags: ["Cidade", "Carros", "Simulação", "Direção", "Drift"],
    grad: "linear-gradient(135deg,#c0392b,#7a140f)",
    accent: "#ff5a4d",
    icon: "🏎️",
    playable: true,
    embed: "",
    src: "games/car3d/index.html",
    flags: ["TOP"],
    about: [
      "City Drive 3D coloca você ao volante numa cidade 3D gerada em tempo real: ruas com faixas, cruzamentos com semáforos, calçadas, prédios com janelas, postos, postes de luz e trânsito de carros com IA circulando pela malha viária.",
      "O destaque é a pegada de direção: o carro tem peso. A aceleração sobe de forma gradual (de 0 a 100 km/h em torno de 10 segundos), a esterçada fica mais suave em alta velocidade, a frenagem exige distância e o traseiro perde aderência de forma progressiva quando você puxa o freio de mão para derrapar.",
      "Suspensão com transferência de peso (o carro mergulha ao frear e senta ao acelerar), câmera com atraso, FOV dinâmico e tremor reforçam a sensação de velocidade. Tudo direto no navegador, sem instalar nada.",
    ],
    controls: [
      { k: "W / ↑", a: "Acelerar" },
      { k: "S / ↓", a: "Frear / Ré" },
      { k: "A · D", a: "Virar (mais suave em alta)" },
      { k: "Espaço", a: "Freio de mão (drift)" },
      { k: "Toque", a: "Piloto automático on/off" },
    ],
    features: [
      { i: "🏙️", t: "Cidade viva", d: "Ruas, cruzamentos, calçadas, prédios, posto e postes de luz." },
      { i: "⚖️", t: "Física com peso", d: "Aceleração gradual, inércia e momento de um carro real." },
      { i: "🛞", t: "Aderência progressiva", d: "Frenagem com distância e drift que exige controle." },
      { i: "🚦", t: "Trânsito com IA", d: "Carros circulando e parando nos semáforos." },
      { i: "🎢", t: "Suspensão", d: "Mergulha ao frear, senta ao acelerar, inclina nas curvas." },
      { i: "🎥", t: "Câmera dinâmica", d: "Atraso, FOV que abre na velocidade e tremor." },
    ],
  },
  {
    id: "paciencia",
    title: "Paciência",
    short: "O clássico Klondike, repaginado com o visual Atenis.",
    cat: "cartas",
    catName: "Cartas",
    rating: 4.9,
    plays: "9.1M",
    dev: "Atenis Studios",
    tags: ["Cartas", "Klondike", "Clássico", "Mesa"],
    grad: "linear-gradient(135deg,#1e6fb8,#0c3b66)",
    accent: "#4f9dff",
    icon: "🃏",
    playable: true,
    embed: "",
    src: "games/paciencia/index.html",
    flags: ["NEW"],
    about: [
      "Paciência é o eterno Klondike — aquele que acompanha gerações — reconstruído do zero com a identidade visual da Atenis: mesa em degradê azul-marinho, cartas nítidas e naipes de alto contraste.",
      "Organize as 52 cartas nas quatro bases, do Ás ao Rei por naipe, montando sequências descendentes de cores alternadas nas colunas. Compre do monte, planeje suas jogadas e limpe a mesa.",
      "Com desfazer ilimitado, auto-resolver e controles que funcionam tanto no toque quanto no desktop, é a Paciência mais confortável pra jogar a qualquer hora.",
    ],
    controls: [
      { k: "Clique", a: "Selecionar e mover carta" },
      { k: "Clique duplo", a: "Enviar carta para a base" },
      { k: "Monte", a: "Comprar nova carta" },
      { k: "U", a: "Desfazer jogada" },
      { k: "⚡ Auto", a: "Auto-resolver" },
    ],
    features: [
      { i: "🃏", t: "Klondike clássico", d: "Regras tradicionais, do Ás ao Rei nas bases." },
      { i: "↩️", t: "Desfazer ilimitado", d: "Volte quantas jogadas quiser sem perder o jogo." },
      { i: "⚡", t: "Auto-resolver", d: "Finaliza automaticamente quando o jogo está ganho." },
      { i: "⏱️", t: "Cronômetro & jogadas", d: "Acompanhe tempo e número de movimentos." },
      { i: "📱", t: "Toque & desktop", d: "Clique-e-clique fluido em qualquer tela." },
      { i: "🏆", t: "Tela de vitória", d: "Celebração ao limpar toda a mesa." },
    ],
  },
];

// utilidades
const byId = (id) => GAMES.find((g) => g.id === id);
const catCount = (cat) => GAMES.filter((g) => g.cat === cat).length;
