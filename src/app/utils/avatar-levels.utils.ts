/**
 * Mapeo de personajes históricos para cada nivel
 * Cada nivel tiene 4 personajes con imagen principal y -info
 */

export interface LevelAvatar {
  name: string;
  image: string;
  infoImage: string;
}

export interface LevelAvatarMap {
  levelIndex: number;
  levelName: string;
  folderName: string;
  avatars: LevelAvatar[];
}

export const LEVEL_AVATARS: LevelAvatarMap[] = [
  // Nivel 0: Aprendiz del Tiempo
  {
    levelIndex: 0,
    levelName: 'Aprendiz del Tiempo',
    folderName: 'APRENDIZ DEL TIEMPO',
    avatars: [
      {
        name: 'Amelia Earhart',
        image: 'images/logos-levels/APRENDIZ DEL TIEMPO/Amelia-Earhart.webp',
        infoImage: 'images/logos-levels/APRENDIZ DEL TIEMPO/Amelia-Earhart-info.webp',
      },
      {
        name: 'Boudica',
        image: 'images/logos-levels/APRENDIZ DEL TIEMPO/Boudica.webp',
        infoImage: 'images/logos-levels/APRENDIZ DEL TIEMPO/Boudica-info.webp',
      },
      {
        name: 'Marco Polo',
        image: 'images/logos-levels/APRENDIZ DEL TIEMPO/Marco-Polo.webp',
        infoImage: 'images/logos-levels/APRENDIZ DEL TIEMPO/Marco-Polo-info.webp',
      },
      {
        name: 'Tutankamón',
        image: 'images/logos-levels/APRENDIZ DEL TIEMPO/Tutankamon.webp',
        infoImage: 'images/logos-levels/APRENDIZ DEL TIEMPO/Tutankamon-info.webp',
      },
    ],
  },
  // Nivel 1: Cronista de Bronce
  {
    levelIndex: 1,
    levelName: 'Cronista de Bronce',
    folderName: 'CRONISTA DE BRONCE',
    avatars: [
      {
        name: 'Aníbal Barca',
        image: 'images/logos-levels/CRONISTA DE BRONCE/Aníbal-Barca.webp',
        infoImage: 'images/logos-levels/CRONISTA DE BRONCE/Aníbal-Barca-info.webp',
      },
      {
        name: 'Barbanegra',
        image: 'images/logos-levels/CRONISTA DE BRONCE/Barbanegra.webp',
        infoImage: 'images/logos-levels/CRONISTA DE BRONCE/Barbanegra-info.webp',
      },
      {
        name: 'Harriet Tubman',
        image: 'images/logos-levels/CRONISTA DE BRONCE/Harriet-Tubman.webp',
        infoImage: 'images/logos-levels/CRONISTA DE BRONCE/Harriet-Tubman-info.webp',
      },
      {
        name: 'Tomoe Gozen',
        image: 'images/logos-levels/CRONISTA DE BRONCE/Tomoe-Gozen.webp',
        infoImage: 'images/logos-levels/CRONISTA DE BRONCE/Tomoe-Gozen-info.webp',
      },
    ],
  },
  // Nivel 2: Explorador de Plata
  {
    levelIndex: 2,
    levelName: 'Explorador de Plata',
    folderName: 'EXPLORADOR DE PLATA',
    avatars: [
      {
        name: 'Artemisia I',
        image: 'images/logos-levels/EXPLORADOR DE PLATA/Artemisia-I.webp',
        infoImage: 'images/logos-levels/EXPLORADOR DE PLATA/Artemisia-I-info.webp',
      },
      {
        name: 'Hipatia',
        image: 'images/logos-levels/EXPLORADOR DE PLATA/Hipatia.webp',
        infoImage: 'images/logos-levels/EXPLORADOR DE PLATA/Hipatia-info.webp',
      },
      {
        name: 'Julio César',
        image: 'images/logos-levels/EXPLORADOR DE PLATA/Julio-César.webp',
        infoImage: 'images/logos-levels/EXPLORADOR DE PLATA/Julio-César-info.webp',
      },
      {
        name: 'Nikola Tesla',
        image: 'images/logos-levels/EXPLORADOR DE PLATA/Nikola-Tesla.webp',
        infoImage: 'images/logos-levels/EXPLORADOR DE PLATA/Nikola-Tesla-info.webp',
      },
    ],
  },
  // Nivel 3: Guardián de Oro III
  {
    levelIndex: 3,
    levelName: 'Guardián de Oro III',
    folderName: 'GUARDIAN DE ORO III',
    avatars: [
      {
        name: 'Cid Campeador',
        image: 'images/logos-levels/GUARDIAN DE ORO III/Cid-Campeador.webp',
        infoImage: 'images/logos-levels/GUARDIAN DE ORO III/Cid-Campeador-info.webp',
      },
      {
        name: 'Miguel Ángel',
        image: 'images/logos-levels/GUARDIAN DE ORO III/Miguel-Ángel.webp',
        infoImage: 'images/logos-levels/GUARDIAN DE ORO III/Miguel-Ángel-info.webp',
      },
      {
        name: 'Nefertiti',
        image: 'images/logos-levels/GUARDIAN DE ORO III/Nefertiti.webp',
        infoImage: 'images/logos-levels/GUARDIAN DE ORO III/Nefertiti-info.webp',
      },
      {
        name: 'Wu Zetian',
        image: 'images/logos-levels/GUARDIAN DE ORO III/Wu-Zetian.webp',
        infoImage: 'images/logos-levels/GUARDIAN DE ORO III/Wu-Zetian-info.webp',
      },
    ],
  },
  // Nivel 4: Guardián de Oro II
  {
    levelIndex: 4,
    levelName: 'Guardián de Oro II',
    folderName: 'GUARDIAN DE ORO II',
    avatars: [
      {
        name: 'Albert Einstein',
        image: 'images/logos-levels/GUARDIAN DE ORO II/Albert-Einstein.webp',
        infoImage: 'images/logos-levels/GUARDIAN DE ORO II/Albert-Einstein-info.webp',
      },
      {
        name: 'Isabel I de Inglaterra',
        image: 'images/logos-levels/GUARDIAN DE ORO II/Isabel-I-de-Inglaterra.webp',
        infoImage: 'images/logos-levels/GUARDIAN DE ORO II/Isabel-I-de-Inglaterra-info.webp',
      },
      {
        name: 'Marie Curie',
        image: 'images/logos-levels/GUARDIAN DE ORO II/Marie-Curie.webp',
        infoImage: 'images/logos-levels/GUARDIAN DE ORO II/Marie-Curie-info.webp',
      },
      {
        name: 'Saladino',
        image: 'images/logos-levels/GUARDIAN DE ORO II/Saladino.webp',
        infoImage: 'images/logos-levels/GUARDIAN DE ORO II/Saladino-info.webp',
      },
    ],
  },
  // Nivel 5: Guardián de Oro I
  {
    levelIndex: 5,
    levelName: 'Guardián de Oro I',
    folderName: 'GUARDIAN DE ORO I',
    avatars: [
      {
        name: 'Alejandro Magno',
        image: 'images/logos-levels/GUARDIAN DE ORO I/Alejandro-Magno.webp',
        infoImage: 'images/logos-levels/GUARDIAN DE ORO I/Alejandro-Magno-info.webp',
      },
      {
        name: 'Cleopatra VII',
        image: 'images/logos-levels/GUARDIAN DE ORO I/Cleopatra-VII.webp',
        infoImage: 'images/logos-levels/GUARDIAN DE ORO I/Cleopatra-VII-info.webp',
      },
      {
        name: 'Juana de Arco',
        image: 'images/logos-levels/GUARDIAN DE ORO I/Juana-de-Arco.webp',
        infoImage: 'images/logos-levels/GUARDIAN DE ORO I/Juana-de-Arco-info.webp',
      },
      {
        name: 'William Wallace',
        image: 'images/logos-levels/GUARDIAN DE ORO I/William-Wallace.webp',
        infoImage: 'images/logos-levels/GUARDIAN DE ORO I/William-Wallace-info.webp',
      },
    ],
  },
  // Nivel 6: Maestro Zafiro
  {
    levelIndex: 6,
    levelName: 'Maestro Zafiro',
    folderName: 'MAESTRO ZAFIRO',
    avatars: [
      {
        name: 'Atila el Huno',
        image: 'images/logos-levels/MAESTRO ZAFIRO/Atila-el-huno.webp',
        infoImage: 'images/logos-levels/MAESTRO ZAFIRO/Atila-el-huno-info.webp',
      },
      {
        name: 'Ramses II',
        image: 'images/logos-levels/MAESTRO ZAFIRO/Ramses-II.webp',
        infoImage: 'images/logos-levels/MAESTRO ZAFIRO/Ramses-II-info.webp',
      },
      {
        name: 'Teodora',
        image: 'images/logos-levels/MAESTRO ZAFIRO/Teodora.webp',
        infoImage: 'images/logos-levels/MAESTRO ZAFIRO/Teodora-info.webp',
      },
      {
        name: 'Zenobia',
        image: 'images/logos-levels/MAESTRO ZAFIRO/Zenobia.webp',
        infoImage: 'images/logos-levels/MAESTRO ZAFIRO/Zenobia-info.webp',
      },
    ],
  },
  // Nivel 7: Sabio Rubí III
  {
    levelIndex: 7,
    levelName: 'Sabio Rubí III',
    folderName: 'SABIO RUBÍ III',
    avatars: [
      {
        name: 'Aristóteles',
        image: 'images/logos-levels/SABIO RUBÍ III/Aristóteles.webp',
        infoImage: 'images/logos-levels/SABIO RUBÍ III/Aristóteles-info.webp',
      },
      {
        name: 'Frida Kahlo',
        image: 'images/logos-levels/SABIO RUBÍ III/Frida-Kahlo.webp',
        infoImage: 'images/logos-levels/SABIO RUBÍ III/Frida-Kahlo-info.webp',
      },
      {
        name: 'Lao Tse',
        image: 'images/logos-levels/SABIO RUBÍ III/Lao-Tse.webp',
        infoImage: 'images/logos-levels/SABIO RUBÍ III/Lao-Tse-info.webp',
      },
      {
        name: 'Teresa de Ávila',
        image: 'images/logos-levels/SABIO RUBÍ III/Teresa-de-Ávila.webp',
        infoImage: 'images/logos-levels/SABIO RUBÍ III/Teresa-de-Ávila-info.webp',
      },
    ],
  },
  // Nivel 8: Sabio Rubí II
  {
    levelIndex: 8,
    levelName: 'Sabio Rubí II',
    folderName: 'SABIO RUBÍ II',
    avatars: [
      {
        name: 'Katherine Johnson',
        image: 'images/logos-levels/SABIO RUBÍ II/Katherine-Johnson.webp',
        infoImage: 'images/logos-levels/SABIO RUBÍ II/Katherine-Johnson-info.webp',
      },
      {
        name: 'Lise Meitner',
        image: 'images/logos-levels/SABIO RUBÍ II/Lise-Meitner.webp',
        infoImage: 'images/logos-levels/SABIO RUBÍ II/Lise-Meitner-info.webp',
      },
      {
        name: 'Stephen Hawking',
        image: 'images/logos-levels/SABIO RUBÍ II/Stephen-Hawking.webp',
        infoImage: 'images/logos-levels/SABIO RUBÍ II/Stephen-Hawking-info.webp',
      },
      {
        name: 'Vlad el Empalador',
        image: 'images/logos-levels/SABIO RUBÍ II/Vlad-el-Empalador.webp',
        infoImage: 'images/logos-levels/SABIO RUBÍ II/Vlad-el-Empalador-info.webp',
      },
    ],
  },
  // Nivel 9: Sabio Rubí I
  {
    levelIndex: 9,
    levelName: 'Sabio Rubí I',
    folderName: 'SABIO RUBÍ I',
    avatars: [
      {
        name: 'George Washington',
        image: 'images/logos-levels/SABIO RUBÍ I/George-Washington.webp',
        infoImage: 'images/logos-levels/SABIO RUBÍ I/George-Washington-info.webp',
      },
      {
        name: 'Olimpia de Epiro',
        image: 'images/logos-levels/SABIO RUBÍ I/Olimpia-de-Epiro.webp',
        infoImage: 'images/logos-levels/SABIO RUBÍ I/Olimpia-de-Epiro-info.webp',
      },
      {
        name: 'Rani Durgavati',
        image: 'images/logos-levels/SABIO RUBÍ I/Rani-Durgavati.webp',
        infoImage: 'images/logos-levels/SABIO RUBÍ I/Rani-Durgavati-info.webp',
      },
      {
        name: 'Simón Bolívar',
        image: 'images/logos-levels/SABIO RUBÍ I/Simón-Bolívar.webp',
        infoImage: 'images/logos-levels/SABIO RUBÍ I/Simón-Bolívar-info.webp',
      },
    ],
  },
  // Nivel 10: Conquistador Esmeralda
  {
    levelIndex: 10,
    levelName: 'Conquistador Esmeralda',
    folderName: 'CONQUISTADOR ESMERALDA',
    avatars: [
      {
        name: 'Isabel de Baviera',
        image: 'images/logos-levels/CONQUISTADOR ESMERALDA/Isabel-de-Baviera.webp',
        infoImage: 'images/logos-levels/CONQUISTADOR ESMERALDA/Isabel-de-Baviera-info.webp',
      },
      {
        name: 'Isabel la Católica',
        image: 'images/logos-levels/CONQUISTADOR ESMERALDA/Isabel-la-Católica.webp',
        infoImage: 'images/logos-levels/CONQUISTADOR ESMERALDA/Isabel-la-Católica-info.webp',
      },
      {
        name: 'Moctezuma',
        image: 'images/logos-levels/CONQUISTADOR ESMERALDA/Moctezuma.webp',
        infoImage: 'images/logos-levels/CONQUISTADOR ESMERALDA/Moctezuma-info.webp',
      },
      {
        name: 'Oda Nobunaga',
        image: 'images/logos-levels/CONQUISTADOR ESMERALDA/Oda-Nobunaga.webp',
        infoImage: 'images/logos-levels/CONQUISTADOR ESMERALDA/Oda-Nobunaga-info.webp',
      },
    ],
  },
  // Nivel 11: Señor Diamante III
  {
    levelIndex: 11,
    levelName: 'Señor Diamante III',
    folderName: 'SEÑOR DIAMANTE III',
    avatars: [
      {
        name: 'Carlomagno',
        image: 'images/logos-levels/SEÑOR DIAMANTE III/Carlomagno.webp',
        infoImage: 'images/logos-levels/SEÑOR DIAMANTE III/Carlomagno-info.webp',
      },
      {
        name: 'Ching Shih',
        image: 'images/logos-levels/SEÑOR DIAMANTE III/Ching-Shih.webp',
        infoImage: 'images/logos-levels/SEÑOR DIAMANTE III/Ching-Shih-info.webp',
      },
      {
        name: 'Khutulun',
        image: 'images/logos-levels/SEÑOR DIAMANTE III/Khutulun.webp',
        infoImage: 'images/logos-levels/SEÑOR DIAMANTE III/Khutulun-info.webp',
      },
      {
        name: 'Ricardo Corazón de León',
        image: 'images/logos-levels/SEÑOR DIAMANTE III/Ricardo-Corazón-de-León.webp',
        infoImage: 'images/logos-levels/SEÑOR DIAMANTE III/Ricardo-Corazón-de-León-info.webp',
      },
    ],
  },
  // Nivel 12: Señor Diamante II
  {
    levelIndex: 12,
    levelName: 'Señor Diamante II',
    folderName: 'SEÑOR DIAMANTE II',
    avatars: [
      {
        name: 'Brunilda',
        image: 'images/logos-levels/SEÑOR DIAMANTE II/Brunilda.webp',
        infoImage: 'images/logos-levels/SEÑOR DIAMANTE II/Brunilda-info.webp',
      },
      {
        name: 'Heracles',
        image: 'images/logos-levels/SEÑOR DIAMANTE II/Heracles.webp',
        infoImage: 'images/logos-levels/SEÑOR DIAMANTE II/Heracles-info.webp',
      },
      {
        name: 'Longnü',
        image: 'images/logos-levels/SEÑOR DIAMANTE II/Longnü.webp',
        infoImage: 'images/logos-levels/SEÑOR DIAMANTE II/Longnü-info.webp',
      },
      {
        name: 'Perseo',
        image: 'images/logos-levels/SEÑOR DIAMANTE II/Perseo.webp',
        infoImage: 'images/logos-levels/SEÑOR DIAMANTE II/Perseo-info.webp',
      },
    ],
  },
  // Nivel 13: Señor Diamante I
  {
    levelIndex: 13,
    levelName: 'Señor Diamante I',
    folderName: 'SEÑOR DIAMANTE I',
    avatars: [
      {
        name: 'Aquiles',
        image: 'images/logos-levels/SEÑOR DIAMANTE I/Aquiles.webp',
        infoImage: 'images/logos-levels/SEÑOR DIAMANTE I/Aquiles-info.webp',
      },
      {
        name: 'Helena de Troya',
        image: 'images/logos-levels/SEÑOR DIAMANTE I/Helena-de-Troya.webp',
        infoImage: 'images/logos-levels/SEÑOR DIAMANTE I/Helena-de-Troya-info.webp',
      },
      {
        name: 'Morgana',
        image: 'images/logos-levels/SEÑOR DIAMANTE I/Morgana.webp',
        infoImage: 'images/logos-levels/SEÑOR DIAMANTE I/Morgana-info.webp',
      },
      {
        name: 'Odiseo',
        image: 'images/logos-levels/SEÑOR DIAMANTE I/Odiseo.webp',
        infoImage: 'images/logos-levels/SEÑOR DIAMANTE I/Odiseo-info.webp',
      },
    ],
  },
  // Nivel 14: Leyenda Temporal III
  {
    levelIndex: 14,
    levelName: 'Leyenda Temporal III',
    folderName: 'LEYENDA TEMPORAL III',
    avatars: [
      {
        name: 'Buda',
        image: 'images/logos-levels/LEYENDA TEMPORAL III/Buda.webp',
        infoImage: 'images/logos-levels/LEYENDA TEMPORAL III/Buda-info.webp',
      },
      {
        name: 'Jesús',
        image: 'images/logos-levels/LEYENDA TEMPORAL III/Jesús.webp',
        infoImage: 'images/logos-levels/LEYENDA TEMPORAL III/Jesús-info.webp',
      },
      {
        name: 'María Magdalena',
        image: 'images/logos-levels/LEYENDA TEMPORAL III/María-Magdalena.webp',
        infoImage: 'images/logos-levels/LEYENDA TEMPORAL III/María-Magdalena-info.webp',
      },
      {
        name: 'Rea Silvia',
        image: 'images/logos-levels/LEYENDA TEMPORAL III/Rea-Silvia.webp',
        infoImage: 'images/logos-levels/LEYENDA TEMPORAL III/Rea-Silvia-info.webp',
      },
    ],
  },
  // Nivel 15: Leyenda Temporal II
  {
    levelIndex: 15,
    levelName: 'Leyenda Temporal II',
    folderName: 'LEYENDA TEMPORAL II',
    avatars: [
      {
        name: 'Ginebra',
        image: 'images/logos-levels/LEYENDA TEMPORAL II/Ginebra.webp',
        infoImage: 'images/logos-levels/LEYENDA TEMPORAL II/Ginebra-info.webp',
      },
      {
        name: 'Medusa',
        image: 'images/logos-levels/LEYENDA TEMPORAL II/Medusa.webp',
        infoImage: 'images/logos-levels/LEYENDA TEMPORAL II/Medusa-info.webp',
      },
      {
        name: 'Merlín',
        image: 'images/logos-levels/LEYENDA TEMPORAL II/Merlín.webp',
        infoImage: 'images/logos-levels/LEYENDA TEMPORAL II/Merlín-info.webp',
      },
      {
        name: 'Rey Arturo',
        image: 'images/logos-levels/LEYENDA TEMPORAL II/Rey-Arturo.webp',
        infoImage: 'images/logos-levels/LEYENDA TEMPORAL II/Rey-Arturo-info.webp',
      },
    ],
  },
  // Nivel 16: Leyenda Temporal I
  {
    levelIndex: 16,
    levelName: 'Leyenda Temporal I',
    folderName: 'LEYENDA TEMPORAL I',
    avatars: [
      {
        name: 'Afrodita',
        image: 'images/logos-levels/LEYENDA TEMPORAL I/Afrodita.webp',
        infoImage: 'images/logos-levels/LEYENDA TEMPORAL I/Afrodita-info.webp',
      },
      {
        name: 'Anubis',
        image: 'images/logos-levels/LEYENDA TEMPORAL I/Anubis.webp',
        infoImage: 'images/logos-levels/LEYENDA TEMPORAL I/Anubis-info.webp',
      },
      {
        name: 'Atenea',
        image: 'images/logos-levels/LEYENDA TEMPORAL I/Atenea.webp',
        infoImage: 'images/logos-levels/LEYENDA TEMPORAL I/Atenea-info.webp',
      },
      {
        name: 'Poseidón',
        image: 'images/logos-levels/LEYENDA TEMPORAL I/Poseidón.webp',
        infoImage: 'images/logos-levels/LEYENDA TEMPORAL I/Poseidón-info.webp',
      },
    ],
  },
  // Nivel 17: Arquitecto del Tiempo: Titán
  {
    levelIndex: 17,
    levelName: 'Arquitecto del Tiempo: Titán',
    folderName: 'ARQUITECTO DEL TIEMPO TITAN',
    avatars: [
      {
        name: 'Hades',
        image: 'images/logos-levels/ARQUITECTO DEL TIEMPO TITAN/Hades.webp',
        infoImage: 'images/logos-levels/ARQUITECTO DEL TIEMPO TITAN/Hades-info.webp',
      },
      {
        name: 'Isis',
        image: 'images/logos-levels/ARQUITECTO DEL TIEMPO TITAN/Isis.webp',
        infoImage: 'images/logos-levels/ARQUITECTO DEL TIEMPO TITAN/Isis-info.webp',
      },
      {
        name: 'Perséfone',
        image: 'images/logos-levels/ARQUITECTO DEL TIEMPO TITAN/Perséfone.webp',
        infoImage: 'images/logos-levels/ARQUITECTO DEL TIEMPO TITAN/Perséfone-info.webp',
      },
      {
        name: 'Thor',
        image: 'images/logos-levels/ARQUITECTO DEL TIEMPO TITAN/Thor.webp',
        infoImage: 'images/logos-levels/ARQUITECTO DEL TIEMPO TITAN/Thor-info.webp',
      },
    ],
  },
  // Nivel 18: Arquitecto del Tiempo: Leyenda
  {
    levelIndex: 18,
    levelName: 'Arquitecto del Tiempo: Leyenda',
    folderName: 'ARQUITECTO DEL TIEMPO LEYENDA',
    avatars: [
      {
        name: 'Hera',
        image: 'images/logos-levels/ARQUITECTO DEL TIEMPO LEYENDA/Hera.webp',
        infoImage: 'images/logos-levels/ARQUITECTO DEL TIEMPO LEYENDA/Hera-info.webp',
      },
      {
        name: 'Odín',
        image: 'images/logos-levels/ARQUITECTO DEL TIEMPO LEYENDA/Odín.webp',
        infoImage: 'images/logos-levels/ARQUITECTO DEL TIEMPO LEYENDA/Odín-info.webp',
      },
      {
        name: 'Sejmet',
        image: 'images/logos-levels/ARQUITECTO DEL TIEMPO LEYENDA/Sejmet.webp',
        infoImage: 'images/logos-levels/ARQUITECTO DEL TIEMPO LEYENDA/Sejmet-info.webp',
      },
      {
        name: 'Zeus',
        image: 'images/logos-levels/ARQUITECTO DEL TIEMPO LEYENDA/Zeus.webp',
        infoImage: 'images/logos-levels/ARQUITECTO DEL TIEMPO LEYENDA/Zeus-info.webp',
      },
    ],
  },
];

/**
 * Obtener los avatares de un nivel específico
 */
export function getAvatarsByLevel(levelIndex: number): LevelAvatar[] {
  const levelAvatars = LEVEL_AVATARS.find((la) => la.levelIndex === levelIndex);
  return levelAvatars?.avatars || [];
}

/**
 * Obtener todos los avatares disponibles (para inicialización)
 */
export function getAllAvatars(): LevelAvatar[] {
  return LEVEL_AVATARS.flatMap((la) => la.avatars);
}
