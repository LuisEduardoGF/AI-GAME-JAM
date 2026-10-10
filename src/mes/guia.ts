import { AJUSTES, type CampaignMode } from './modelo';

export interface GuidePage {
  label: string;
  title: string;
  sections: readonly { title: string; body: string }[];
  tip: string;
}

/** Explicaciones del modo actual: consultar la guía no cambia la campaña. */
export function guidePages(mode: CampaignMode): readonly GuidePage[] {
  const demo = mode === 'demo';
  return [
    {
      label: 'Primeros pasos', title: 'TU PREPARACIÓN PELEA POR TI',
      sections: [
        { title: 'QUÉ BUSCAS', body: demo ? 'Prepara a Patata durante tres días y enfréntate a Don Yuca. Esta demo muestra el ciclo básico del juego.' : 'Reconstruye el puesto durante 30 días y enfrenta a Yuca, Rábano, General Remolacha y Batata.' },
        { title: 'TU PRIMER DÍA', body: 'Entrena en el gimnasio, vende un lote del puesto y descansa en casa. Reparte las seis franjas según lo que necesites.' },
        { title: 'ANTES DE SUBIR AL RING', body: 'Abre Habilidades, revisa tus técnicas equipadas y recupera vida y energía. Los golpes se ejecutan automáticamente.' },
      ],
      tip: 'Puedes empezar ya y volver a esta guía desde AYUDA o desde la pausa. Los temas del índice se pueden abrir en cualquier orden.',
    },
    {
      label: 'Rutina y lugares', title: 'ORGANIZA LAS SEIS FRANJAS',
      sections: [
        { title: 'CADA ACCIÓN CUENTA', body: 'Comprar, vender, entrenar, descansar, conversar o mejorar consumen una franja si se realizan. Viajar y consultar paneles son gratis.' },
        { title: 'CUATRO LUGARES', body: 'Puesto: víveres y mejoras. Gimnasio: atributos. Casa: descanso. Barrio: conversación para ganar vínculo y un punto de técnica.' },
        { title: 'CERRAR EL DÍA', body: 'La persiana abre una confirmación con el próximo encuentro. Puedes cerrar antes de gastar todo, pero pierdes las franjas restantes.' },
      ],
      tip: 'Las seis marcas del HUD muestran tus franjas disponibles. Una acción rechazada por falta de recursos no consume una franja.',
    },
    {
      label: 'Mercado y mejoras', title: 'UN PUESTO PARA FINANCIAR TU RUTINA',
      sections: [
        { title: 'COMPRA Y VENTA', body: 'Los precios mostrados son por unidad. COMPRA añade tres unidades; VENDE ofrece hasta tres, limitado por existencias y compradores.' },
        { title: 'OFERTA Y DEMANDA', body: 'Precios y demanda cambian cada día. Al vender se agotan compradores de ese producto; prueba otro vívere o espera al día siguiente.' },
        { title: 'INVIERTE CON CALMA', body: 'Puesto: mejores ventas y más demanda. Gimnasio: entrenamiento mejorado. Despensa: más capacidad y evita la pérdida nocturna de víveres.' },
      ],
      tip: 'Sin mejora de despensa se pierde una unidad de cada producto al pasar la noche. Guarda dinero para entrenar y decidir si pagas el cobro.',
    },
    {
      label: 'Atributos y descanso', title: 'DISTINGUE VIDA, ENERGÍA Y ESTAMINA',
      sections: [
        { title: 'TRES ATRIBUTOS', body: 'Fuerza aumenta daño. Agilidad acelera los golpes y mejora evasión. Resistencia aumenta vida, estamina y protección.' },
        { title: 'ENERGÍA FUERA DEL RING', body: 'Entrenar requiere dinero y dos de energía. Descansar en casa recupera hasta cinco de energía y doce de vida, y reduce calor.' },
        { title: 'RECUPERACIÓN Y DESGASTE', body: 'La noche recupera parte de vida y energía. Un atributo pierde un punto tras tres noches sin entrenarlo; alterna tu rutina.' },
      ],
      tip: 'Estamina es el aliento de la pelea; energía es la reserva diaria. Llegar con más energía te da más estamina al empezar el combate.',
    },
    {
      label: 'Estilos y habilidades', title: 'APRENDE, EQUIPA Y PREPARA TU PLAN',
      sections: [
        { title: 'TRES CAMINOS', body: 'Flameantes: daño y quemadura. Ardientes: ritmo y evasión. Flujo de Roca: guardia y aguante. Seleccionar un estilo añade su ventaja base.' },
        { title: 'APRENDER NO ES EQUIPAR', body: 'Entrenar y conversar dan puntos. Aprender exige puntos, atributo mínimo y, a veces, el nodo anterior. Después pulsa EQUIPAR.' },
        { title: 'HASTA TRES TÉCNICAS', body: 'Mezcla hasta tres técnicas de distintas ramas. Se activan por golpes; si coinciden, sale una: nivel mayor primero, alternando entre iguales.' },
      ],
      tip: 'Cambiar el estilo no cambia tus técnicas equipadas. Prepara el plan en la rutina o antes de la campana; durante la pelea queda fijo.',
    },
    {
      label: 'Combate automático', title: 'LEE EL ROUND Y APRENDE DE ÉL',
      sections: [
        { title: 'GOLPES, GUARDIA Y EVASIÓN', body: 'Patata ataca según sus atributos y técnicas. Guardia y evasión también son automáticas. No hay que pulsar un botón para golpear.' },
        { title: 'BARRAS Y CALOR', body: 'Vida indica cuánto resistes. Estamina se gasta al atacar y se regenera; si falta, esperas. Desde 85 de calor, tus ataques también te queman.' },
        { title: 'RITMO Y RESULTADO', body: '1×/2× cambia la reproducción, no el resultado. Gana quien baja la vida rival a cero; a los 60 s decide el porcentaje de vida restante.' },
      ],
      tip: 'Consulta la crónica para identificar técnicas, daño y recuperación. Esc detiene el combate. Rendirse cuenta como una derrota.',
    },
    {
      label: 'Cobros y jefes', title: 'EL CALENDARIO TE AYUDA A PREPARARTE',
      sections: [
        { title: 'UN COBRADOR CADA DOS DÍAS', body: 'Al cerrar un día par llega un esbirro. Puedes pagar si tienes dinero o defender el puesto peleando. Pagar evita ese combate.' },
        { title: 'ENCUENTROS IMPORTANTES', body: demo ? 'En la demo hay cobro al cerrar el día 2 y combate con Don Yuca al cerrar el 3. Al terminar puedes volver a empezar.' : 'Los jefes llegan los días 7, 14, 21 y 30. Un día puede tener cobro y jefe: resolver el cobro no elimina la pelea importante.' },
        { title: 'VICTORIA, DERROTA Y VÍNCULO', body: 'Ganar concede dinero y puntos. Perder tiene un coste, pero puedes continuar. Conversar aumenta vínculo y puede influir en el final mensual.' },
      ],
      tip: 'Revisa CALENDARIO antes de gastar tus últimas franjas. FICHA muestra el efecto de tus atributos para decidir qué entrenar.',
    },
    {
      label: 'Controles y guardado', title: 'CONSULTA, PAUSA Y RETOMA',
      sections: [
        { title: 'RATÓN, TÁCTIL Y TECLADO', body: 'Pulsa los botones con ratón o toque. Flechas o Tab cambian el foco; Enter o Espacio confirma. Esc cierra paneles o abre la pausa.' },
        { title: 'GUARDADO LOCAL', body: 'Las acciones guardan automáticamente en este navegador. GUARDAR Y SALIR vuelve al menú; CONTINUAR recupera una pelea en pausa.' },
        { title: 'SONIDO Y NUEVA PARTIDA', body: 'M silencia el sonido. En pausa ajustas música y efectos. Nueva partida pide confirmar porque reemplaza el guardado de ese modo.' },
      ],
      tip: `Demo (${AJUSTES.demoDays} días) y campaña (${AJUSTES.days} días) guardan por separado. Borrar los datos del navegador elimina la partida; no hay guardado en la nube.`,
    },
  ];
}
