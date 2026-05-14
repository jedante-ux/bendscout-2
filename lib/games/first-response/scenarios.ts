export interface ResponseOption {
  text: string;
  correct?: boolean;
}

export interface ResponseScenario {
  id: string;
  emoji: string;
  /** Etiqueta corta de la categoría de emergencia. */
  tag: string;
  /** Descripción de la escena de emergencia, en 1-2 frases. */
  prompt: string;
  options: ResponseOption[];
  /** Explicación corta para mostrar tras responder. */
  explanation: string;
}

/**
 * Escenarios de primera respuesta scout. Cada uno tiene 4 opciones
 * y exactamente 1 correcta. La idea es decidir RÁPIDO la acción
 * inicial correcta — no el procedimiento completo.
 */
export const SCENARIOS: ResponseScenario[] = [
  {
    id: "quemadura-leve",
    emoji: "🔥",
    tag: "Quemadura",
    prompt:
      "Un compañero se quema la mano con la olla del fogón. La piel está roja, sin ampollas. ¿Qué haces primero?",
    options: [
      { text: "Aplicar hielo directo sobre la quemadura" },
      { text: "Enfriar con agua corriente fría 10–20 minutos", correct: true },
      { text: "Untarle pasta dental o aceite" },
      { text: "Reventar cualquier ampolla que aparezca" },
    ],
    explanation:
      "El agua corriente fría (no helada) baja la temperatura sin dañar la piel. Hielo y remedios caseros empeoran la quemadura.",
  },
  {
    id: "atragantamiento",
    emoji: "😶",
    tag: "Atragantamiento",
    prompt:
      "Una scout se atraganta con un trozo de manzana. Tose con fuerza y respira. ¿Qué haces?",
    options: [
      { text: "Darle palmadas fuertes en la espalda enseguida" },
      { text: "Hacerle la maniobra de Heimlich ya mismo" },
      { text: "Animarla a seguir tosiendo y vigilarla", correct: true },
      { text: "Darle agua para empujar el trozo" },
    ],
    explanation:
      "Si tose y respira, la vía aérea no está bloqueada. Tu trabajo es animarla a toser y solo intervenir si deja de toser o se pone azul.",
  },
  {
    id: "herida-sangrante",
    emoji: "🩸",
    tag: "Hemorragia",
    prompt:
      "Un compañero se cortó la pierna con una rama y sangra mucho. ¿Cuál es tu primer paso?",
    options: [
      { text: "Aplicar presión directa con un paño limpio", correct: true },
      { text: "Hacerle un torniquete por encima del corte" },
      { text: "Lavar con alcohol antes de tapar" },
      { text: "Levantarle la pierna y esperar a que pare" },
    ],
    explanation:
      "Presión directa firme y sostenida con un paño limpio detiene la mayoría de hemorragias. El torniquete es último recurso.",
  },
  {
    id: "esguince-tobillo",
    emoji: "🦶",
    tag: "Esguince",
    prompt:
      "Tu compañero pisa mal y se tuerce el tobillo. Le duele e hincha. ¿Qué haces primero?",
    options: [
      { text: "Forzarlo a caminar para 'estirar'" },
      { text: "Reposo, hielo, compresión y elevación", correct: true },
      { text: "Tirar fuerte del pie para 'acomodarlo'" },
      { text: "Aplicar calor para relajar el músculo" },
    ],
    explanation:
      "RICE (Reposo, Hielo, Compresión, Elevación) en las primeras 48 h reduce inflamación y dolor. Calor y manipulación empeoran.",
  },
  {
    id: "picadura-abeja",
    emoji: "🐝",
    tag: "Picadura",
    prompt:
      "A un scout sin alergia conocida le pica una abeja en el brazo. ¿Qué haces primero?",
    options: [
      { text: "Apretar con los dedos para sacar el aguijón" },
      {
        text: "Raspar el aguijón con el borde de una tarjeta",
        correct: true,
      },
      { text: "Aplicar barro o saliva sobre la picadura" },
      { text: "Cortar la zona para 'drenar' el veneno" },
    ],
    explanation:
      "Raspar lateralmente evita inyectar más veneno del saco. Apretar con pinzas o dedos exprime más toxina.",
  },
  {
    id: "desmayo",
    emoji: "😵",
    tag: "Desmayo",
    prompt:
      "Una scout se desmaya en la formación. Respira normal. ¿Qué haces?",
    options: [
      { text: "Sentarla con la cabeza entre las piernas" },
      { text: "Acostarla y elevar sus piernas", correct: true },
      { text: "Echarle agua fría en la cara" },
      { text: "Darle de tomar agua de inmediato" },
    ],
    explanation:
      "Elevar las piernas devuelve sangre al cerebro. Nunca des líquidos a alguien inconsciente.",
  },
  {
    id: "insolacion",
    emoji: "🥵",
    tag: "Golpe de calor",
    prompt:
      "Tras una caminata larga al sol, un compañero está rojo, mareado y sin sudar. ¿Qué haces primero?",
    options: [
      { text: "Llevarlo a la sombra y enfriarlo con agua", correct: true },
      { text: "Darle una bebida muy fría de golpe" },
      { text: "Cubrirlo con una manta para 'sudar la fiebre'" },
      { text: "Hacerlo correr para activar la circulación" },
    ],
    explanation:
      "El golpe de calor es urgente: sombra, enfriar con agua/paños mojados y pedir ayuda. Abrigar empeora la temperatura corporal.",
  },
  {
    id: "fractura-brazo",
    emoji: "🦴",
    tag: "Fractura",
    prompt:
      "Sospechas que un compañero se quebró el antebrazo al caer. ¿Qué haces?",
    options: [
      { text: "Tirar del brazo para 'acomodar' el hueso" },
      { text: "Inmovilizar tal como quedó y pedir ayuda", correct: true },
      { text: "Hacer que mueva los dedos para comprobar" },
      { text: "Vendar muy fuerte para que no se mueva" },
    ],
    explanation:
      "Nunca intentes recolocar un hueso. Inmoviliza en la posición en la que quedó, evalúa pulso y traslada.",
  },
  {
    id: "hipotermia",
    emoji: "🥶",
    tag: "Hipotermia",
    prompt:
      "Un scout cayó al río y tirita sin control. ¿Qué haces primero?",
    options: [
      { text: "Frotarle la piel con fuerza para calentarlo" },
      { text: "Darle alcohol o café muy caliente" },
      {
        text: "Quitarle la ropa mojada y abrigarlo en seco",
        correct: true,
      },
      { text: "Meterlo en agua muy caliente de inmediato" },
    ],
    explanation:
      "Ropa seca, abrigo y bebidas tibias dulces. El alcohol baja más la temperatura central; el agua hirviendo provoca shock.",
  },
  {
    id: "mordedura-serpiente",
    emoji: "🐍",
    tag: "Mordedura",
    prompt:
      "A un compañero lo mordió una serpiente en la pierna. ¿Qué haces?",
    options: [
      { text: "Succionar el veneno con la boca" },
      {
        text: "Mantenerlo quieto, inmovilizar la pierna y buscar ayuda",
        correct: true,
      },
      { text: "Hacer un torniquete bien apretado" },
      { text: "Cortar la herida en cruz para drenar" },
    ],
    explanation:
      "Quietud + inmovilización retrasa la difusión del veneno. Succionar, cortar o torniquetar suma daño sin sacar veneno.",
  },
  {
    id: "ahogo-piscina",
    emoji: "🌊",
    tag: "Ahogamiento",
    prompt:
      "Ves a alguien hundirse en el río y tú no eres buen nadador. ¿Qué haces?",
    options: [
      { text: "Lanzarte al agua a sacarlo enseguida" },
      {
        text: "Lanzarle algo que flote y pedir ayuda gritando",
        correct: true,
      },
      { text: "Esperar a ver si sale solo" },
      { text: "Ir a buscar ayuda lejos sin avisar a nadie" },
    ],
    explanation:
      "Si no sabes rescatar, no entres. Lanza un flotador, una cuerda o una rama y pide ayuda. Salvar a uno no vale dos víctimas.",
  },
  {
    id: "convulsion",
    emoji: "⚡",
    tag: "Convulsión",
    prompt:
      "Un scout sufre una convulsión en el suelo. ¿Qué haces?",
    options: [
      { text: "Meterle algo en la boca para que no se la muerda" },
      { text: "Sujetarlo con fuerza para que pare" },
      {
        text: "Apartar objetos cerca y proteger su cabeza",
        correct: true,
      },
      { text: "Echarle agua para que reaccione" },
    ],
    explanation:
      "Nunca metas objetos en la boca ni sujetes. Aparta peligros, protege la cabeza y, al acabar, ponlo de lado.",
  },
  {
    id: "ojo-cuerpo-extrano",
    emoji: "👁️",
    tag: "Ojo",
    prompt:
      "A una scout le entró una astilla clavada en el ojo. ¿Qué haces primero?",
    options: [
      { text: "Sacarla con los dedos rápido" },
      { text: "Frotar el ojo para que salga sola" },
      {
        text: "Cubrir el ojo sin tocar la astilla y buscar ayuda",
        correct: true,
      },
      { text: "Enjuagar con mucha presión de agua" },
    ],
    explanation:
      "Nunca extraigas objetos clavados en el ojo. Cubre sin presionar y traslada al servicio médico.",
  },
  {
    id: "rcp-adulto",
    emoji: "❤️",
    tag: "RCP",
    prompt:
      "Encuentras a alguien inconsciente que no respira. Ya pediste ayuda. ¿Qué haces?",
    options: [
      { text: "Esperar sentado a que llegue la ambulancia" },
      { text: "Darle agua para 'despertarlo'" },
      {
        text: "Iniciar compresiones torácicas fuertes y rápidas",
        correct: true,
      },
      { text: "Levantarle las piernas y abrigarlo" },
    ],
    explanation:
      "Sin respiración: compresiones ya. Centro del pecho, 5-6 cm de profundidad, ~100-120/min. Cada minuto sin RCP reduce 10% la supervivencia.",
  },
  {
    id: "alergia-grave",
    emoji: "🥜",
    tag: "Alergia",
    prompt:
      "Tras comer, una compañera alérgica se hincha, le cuesta respirar y trae su autoinyector. ¿Qué haces?",
    options: [
      { text: "Esperar a ver si se le pasa solo" },
      { text: "Darle un antihistamínico oral y nada más" },
      {
        text: "Ayudarla a usar el autoinyector y llamar emergencias",
        correct: true,
      },
      { text: "Hacerla vomitar lo que comió" },
    ],
    explanation:
      "Anafilaxia: adrenalina del autoinyector es lo único que detiene la reacción. Llama emergencias siempre, incluso si mejora.",
  },
  {
    id: "electrocucion",
    emoji: "⚡",
    tag: "Electricidad",
    prompt:
      "Ves a un compañero pegado a un cable pelado, sacudiéndose. ¿Qué haces primero?",
    options: [
      { text: "Tirar de él con tus manos enseguida" },
      {
        text: "Cortar la corriente antes de tocarlo",
        correct: true,
      },
      { text: "Echarle agua para enfriarlo" },
      { text: "Empujarlo con un objeto metálico" },
    ],
    explanation:
      "Si lo tocas con la corriente activa, te electrocutas también. Corta la energía o sepáralo con material aislante (madera, plástico seco).",
  },
  {
    id: "intoxicacion",
    emoji: "🍄",
    tag: "Intoxicación",
    prompt:
      "Un scout comió un hongo silvestre y empieza con vómitos y mareo. ¿Qué haces?",
    options: [
      { text: "Provocarle el vómito metiéndole los dedos" },
      { text: "Darle leche para 'cortar' el veneno" },
      {
        text: "Llamar a emergencias y guardar restos del hongo",
        correct: true,
      },
      { text: "Esperar a que se le pase con agua" },
    ],
    explanation:
      "No induzcas vómito ni des nada por boca sin indicación médica. Llama a emergencias y lleva una muestra para identificar el tóxico.",
  },
];
