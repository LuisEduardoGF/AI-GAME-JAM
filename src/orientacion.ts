export type RoutineAction = 'sell' | 'restock' | 'train' | 'rest' | 'talk' | 'close';

export const FIRST_DAY_LESSONS: readonly { action: RoutineAction; title: string; body: string }[] = [
  { action: 'sell', title: 'Tu primer pedido', body: 'Pulsa VENDER. El puesto paga tu entrenamiento y cada pedido aumenta el calor.' },
  { action: 'train', title: 'Del puesto al gimnasio', body: 'En el GIMNASIO pulsa ENTRENAR FUERZA. Ganarás daño y conservarás ese atributo esta noche.' },
  { action: 'rest', title: 'Recupera el aliento', body: 'Viaja a CASA y pulsa DESCANSAR. Recuperar energía te permite volver a entrenar.' },
  { action: 'talk', title: 'El barrio también cuenta', body: 'En el BARRIO pulsa HABLAR y elige CONTARLO. El vínculo importa cuando encuentres a Batata.' },
  { action: 'close', title: 'Tú decides cuándo dormir', body: 'Revisa la AGENDA o usa tus franjas restantes. CERRAR DÍA muestra qué cambia esta noche.' },
];

export const GUIDE_PAGES = [
  { title: 'PUESTO Y RUTINA', lines: [
    'VENDER gana monedas y calor a cambio de una papa. REPONER compra existencias.',
    'Viajar entre PUESTO, GIMNASIO, CASA y BARRIO es gratis. Cada acción usa una franja.',
    'Entrena en el gimnasio, descansa en casa y habla en el barrio. La FICHA explica tus atributos.',
  ] },
  { title: 'ENTRENAR CON CABEZA', lines: [
    'FUERZA aumenta el daño. VELOCIDAD mejora la esquiva y reduce daño al subir de nivel.',
    'El gimnasio cobra monedas y energía. DESCANSAR recupera energía y vida.',
    'Lo que no entrenaste pierde un punto por noche (mínimo 1). Revisa el cierre del día.',
  ] },
  { title: 'LEER EL COMBATE', lines: [
    'GOLPEAR o ESPACIO ataca. Espera a GOLPE LISTO entre golpes y lee el aviso del rival.',
    'BLOQUEAR reduce el golpe y recupera energía al recibirlo. Mueve el ratón al ver el aviso para esquivar.',
    'Con calor suficiente, tu golpe entra en LLAMAS. Gana daño y consume calor y energía.',
  ] },
  { title: 'FAMILIA Y CALENDARIO', lines: [
    'Yuca, Rábano y Batata esperan al cerrar sus días. No llegues con poca vida.',
    'HABLAR permite ganar vínculo, fuerza o recuperación. Cada respuesta usa una franja.',
    'El vínculo ayuda a reconciliarte con Batata. Al final decides el destino del puesto.',
  ] },
] as const;
