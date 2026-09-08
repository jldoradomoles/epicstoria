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
        image: 'images/logos-levels/APRENDIZ DEL TIEMPO/Amelia-Earhart.jpg',
        infoImage: 'images/logos-levels/APRENDIZ DEL TIEMPO/Amelia-Earhart-info.jpg',
      },
      {
        name: 'Boudica',
        image: 'images/logos-levels/APRENDIZ DEL TIEMPO/Boudica.jpg',
        infoImage: 'images/logos-levels/APRENDIZ DEL TIEMPO/Boudica-info.jpg',
      },
      {
        name: 'Marco Polo',
        image: 'images/logos-levels/APRENDIZ DEL TIEMPO/Marco-Polo.jpg',
        infoImage: 'images/logos-levels/APRENDIZ DEL TIEMPO/Marco-Polo-info.jpg',
      },
      {
        name: 'Tutankamón',
        image: 'images/logos-levels/APRENDIZ DEL TIEMPO/Tutankamon.jpg',
        infoImage: 'images/logos-levels/APRENDIZ DEL TIEMPO/Tutankamon-info.jpg',
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
        image: 'images/logos-levels/CRONISTA DE BRONCE/Aníbal-Barca.jpg',
        infoImage: 'images/logos-levels/CRONISTA DE BRONCE/Aníbal-Barca-info.jpg',
      },
      {
        name: 'Barbanegra',
        image: 'images/logos-levels/CRONISTA DE BRONCE/Barbanegra.jpg',
        infoImage: 'images/logos-levels/CRONISTA DE BRONCE/Barbanegra-info.jpg',
      },
      {
        name: 'Harriet Tubman',
        image: 'images/logos-levels/CRONISTA DE BRONCE/Harriet-Tubman.jpg',
        infoImage: 'images/logos-levels/CRONISTA DE BRONCE/Harriet-Tubman-info.jpg',
      },
      {
        name: 'Tomoe Gozen',
        image: 'images/logos-levels/CRONISTA DE BRONCE/Tomoe-Gozen.jpg',
        infoImage: 'images/logos-levels/CRONISTA DE BRONCE/Tomoe-Gozen-info.jpg',
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
        image: 'images/logos-levels/EXPLORADOR DE PLATA/Artemisia-I.jpg',
        infoImage: 'images/logos-levels/EXPLORADOR DE PLATA/Artemisia-I-info.jpg',
      },
      {
        name: 'Hipatia',
        image: 'images/logos-levels/EXPLORADOR DE PLATA/Hipatia.jpg',
        infoImage: 'images/logos-levels/EXPLORADOR DE PLATA/Hipatia-info.jpg',
      },
      {
        name: 'Julio César',
        image: 'images/logos-levels/EXPLORADOR DE PLATA/Julio-César.jpg',
        infoImage: 'images/logos-levels/EXPLORADOR DE PLATA/Julio-César-info.jpg',
      },
      {
        name: 'Nikola Tesla',
        image: 'images/logos-levels/EXPLORADOR DE PLATA/Nikola-Tesla.jpg',
        infoImage: 'images/logos-levels/EXPLORADOR DE PLATA/Nikola-Tesla-info.jpg',
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
        image: 'images/logos-levels/GUARDIAN DE ORO III/Cid-Campeador.jpg',
        infoImage: 'images/logos-levels/GUARDIAN DE ORO III/Cid-Campeador-info.jpg',
      },
      {
        name: 'Miguel Ángel',
        image: 'images/logos-levels/GUARDIAN DE ORO III/Miguel-Ángel.jpg',
        infoImage: 'images/logos-levels/GUARDIAN DE ORO III/Miguel-Ángel-info.jpg',
      },
      {
        name: 'Nefertiti',
        image: 'images/logos-levels/GUARDIAN DE ORO III/Nefertiti.jpg',
        infoImage: 'images/logos-levels/GUARDIAN DE ORO III/Nefertiti-info.jpg',
      },
      {
        name: 'Wu Zetian',
        image: 'images/logos-levels/GUARDIAN DE ORO III/Wu-Zetian.jpg',
        infoImage: 'images/logos-levels/GUARDIAN DE ORO III/Wu-Zetian-info.jpg',
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
        image: 'images/logos-levels/GUARDIAN DE ORO II/Albert-Einstein.jpg',
        infoImage: 'images/logos-levels/GUARDIAN DE ORO II/Albert-Einstein-info.jpg',
      },
      {
        name: 'Isabel I de Inglaterra',
        image: 'images/logos-levels/GUARDIAN DE ORO II/Isabel-I-de-Inglaterra.jpg',
        infoImage: 'images/logos-levels/GUARDIAN DE ORO II/Isabel-I-de-Inglaterra-info.jpg',
      },
      {
        name: 'Marie Curie',
        image: 'images/logos-levels/GUARDIAN DE ORO II/Marie-Curie.jpg',
        infoImage: 'images/logos-levels/GUARDIAN DE ORO II/Marie-Curie-info.jpg',
      },
      {
        name: 'Saladino',
        image: 'images/logos-levels/GUARDIAN DE ORO II/Saladino.jpg',
        infoImage: 'images/logos-levels/GUARDIAN DE ORO II/Saladino-info.jpg',
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
        image: 'images/logos-levels/GUARDIAN DE ORO I/Alejandro-Magno.jpg',
        infoImage: 'images/logos-levels/GUARDIAN DE ORO I/Alejandro-Magno-info.jpg',
      },
      {
        name: 'Cleopatra VII',
        image: 'images/logos-levels/GUARDIAN DE ORO I/Cleopatra-VII.jpg',
        infoImage: 'images/logos-levels/GUARDIAN DE ORO I/Cleopatra-VII-info.jpg',
      },
      {
        name: 'Juana de Arco',
        image: 'images/logos-levels/GUARDIAN DE ORO I/Juana-de-Arco.jpg',
        infoImage: 'images/logos-levels/GUARDIAN DE ORO I/Juana-de-Arco-info.jpg',
      },
      {
        name: 'William Wallace',
        image: 'images/logos-levels/GUARDIAN DE ORO I/William-Wallace.jpg',
        infoImage: 'images/logos-levels/GUARDIAN DE ORO I/William-Wallace-info.jpg',
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
        image: 'images/logos-levels/MAESTRO ZAFIRO/Atila-el-huno.jpg',
        infoImage: 'images/logos-levels/MAESTRO ZAFIRO/Atila-el-huno-info.jpg',
      },
      {
        name: 'Ramses II',
        image: 'images/logos-levels/MAESTRO ZAFIRO/Ramses-II.jpg',
        infoImage: 'images/logos-levels/MAESTRO ZAFIRO/Ramses-II-info.jpg',
      },
      {
        name: 'Teodora',
        image: 'images/logos-levels/MAESTRO ZAFIRO/Teodora.jpg',
        infoImage: 'images/logos-levels/MAESTRO ZAFIRO/Teodora-info.jpg',
      },
      {
        name: 'Zenobia',
        image: 'images/logos-levels/MAESTRO ZAFIRO/Zenobia.jpg',
        infoImage: 'images/logos-levels/MAESTRO ZAFIRO/Zenobia-info.jpg',
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
        image: 'images/logos-levels/SABIO RUBÍ III/Aristóteles.jpg',
        infoImage: 'images/logos-levels/SABIO RUBÍ III/Aristóteles-info.jpg',
      },
      {
        name: 'Frida Kahlo',
        image: 'images/logos-levels/SABIO RUBÍ III/Frida-Kahlo.jpg',
        infoImage: 'images/logos-levels/SABIO RUBÍ III/Frida-Kahlo-info.jpg',
      },
      {
        name: 'Lao Tse',
        image: 'images/logos-levels/SABIO RUBÍ III/Lao-Tse.jpg',
        infoImage: 'images/logos-levels/SABIO RUBÍ III/Lao-Tse-info.jpg',
      },
      {
        name: 'Teresa de Ávila',
        image: 'images/logos-levels/SABIO RUBÍ III/Teresa-de-Ávila.jpg',
        infoImage: 'images/logos-levels/SABIO RUBÍ III/Teresa-de-Ávila-info.jpg',
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
        image: 'images/logos-levels/SABIO RUBÍ II/Katherine-Johnson.jpg',
        infoImage: 'images/logos-levels/SABIO RUBÍ II/Katherine-Johnson-info.jpg',
      },
      {
        name: 'Lise Meitner',
        image: 'images/logos-levels/SABIO RUBÍ II/Lise-Meitner.jpg',
        infoImage: 'images/logos-levels/SABIO RUBÍ II/Lise-Meitner-info.jpg',
      },
      {
        name: 'Stephen Hawking',
        image: 'images/logos-levels/SABIO RUBÍ II/Stephen-Hawking.jpg',
        infoImage: 'images/logos-levels/SABIO RUBÍ II/Stephen-Hawking-info.jpg',
      },
      {
        name: 'Vlad el Empalador',
        image: 'images/logos-levels/SABIO RUBÍ II/Vlad-el-Empalador.jpg',
        infoImage: 'images/logos-levels/SABIO RUBÍ II/Vlad-el-Empalador-info.jpg',
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
        image: 'images/logos-levels/SABIO RUBÍ I/George-Washington.jpg',
        infoImage: 'images/logos-levels/SABIO RUBÍ I/George-Washington-info.jpg',
      },
      {
        name: 'Olimpia de Epiro',
        image: 'images/logos-levels/SABIO RUBÍ I/Olimpia-de-Epiro.jpg',
        infoImage: 'images/logos-levels/SABIO RUBÍ I/Olimpia-de-Epiro-info.jpg',
      },
      {
        name: 'Rani Durgavati',
        image: 'images/logos-levels/SABIO RUBÍ I/Rani-Durgavati.jpg',
        infoImage: 'images/logos-levels/SABIO RUBÍ I/Rani-Durgavati-info.jpg',
      },
      {
        name: 'Simón Bolívar',
        image: 'images/logos-levels/SABIO RUBÍ I/Simón-Bolívar.jpg',
        infoImage: 'images/logos-levels/SABIO RUBÍ I/Simón-Bolívar-info.jpg',
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
        image: 'images/logos-levels/CONQUISTADOR ESMERALDA/Isabel-de-Baviera.jpg',
        infoImage: 'images/logos-levels/CONQUISTADOR ESMERALDA/Isabel-de-Baviera-info.jpg',
      },
      {
        name: 'Isabel la Católica',
        image: 'images/logos-levels/CONQUISTADOR ESMERALDA/Isabel-la-Católica.jpg',
        infoImage: 'images/logos-levels/CONQUISTADOR ESMERALDA/Isabel-la-Católica-info.jpg',
      },
      {
        name: 'Moctezuma',
        image: 'images/logos-levels/CONQUISTADOR ESMERALDA/Moctezuma.jpg',
        infoImage: 'images/logos-levels/CONQUISTADOR ESMERALDA/Moctezuma-info.jpg',
      },
      {
        name: 'Oda Nobunaga',
        image: 'images/logos-levels/CONQUISTADOR ESMERALDA/Oda-Nobunaga.jpg',
        infoImage: 'images/logos-levels/CONQUISTADOR ESMERALDA/Oda-Nobunaga-info.jpg',
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
        image: 'images/logos-levels/SEÑOR DIAMANTE III/Carlomagno.jpg',
        infoImage: 'images/logos-levels/SEÑOR DIAMANTE III/Carlomagno-info.jpg',
      },
      {
        name: 'Ching Shih',
        image: 'images/logos-levels/SEÑOR DIAMANTE III/Ching-Shih.jpg',
        infoImage: 'images/logos-levels/SEÑOR DIAMANTE III/Ching-Shih-info.jpg',
      },
      {
        name: 'Khutulun',
        image: 'images/logos-levels/SEÑOR DIAMANTE III/Khutulun.jpg',
        infoImage: 'images/logos-levels/SEÑOR DIAMANTE III/Khutulun-info.jpg',
      },
      {
        name: 'Ricardo Corazón de León',
        image: 'images/logos-levels/SEÑOR DIAMANTE III/Ricardo-Corazón-de-León.jpg',
        infoImage: 'images/logos-levels/SEÑOR DIAMANTE III/Ricardo-Corazón-de-León-info.jpg',
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
        image: 'images/logos-levels/SEÑOR DIAMANTE II/Brunilda.jpg',
        infoImage: 'images/logos-levels/SEÑOR DIAMANTE II/Brunilda-info.jpg',
      },
      {
        name: 'Heracles',
        image: 'images/logos-levels/SEÑOR DIAMANTE II/Heracles.jpg',
        infoImage: 'images/logos-levels/SEÑOR DIAMANTE II/Heracles-info.jpg',
      },
      {
        name: 'Longnü',
        image: 'images/logos-levels/SEÑOR DIAMANTE II/Longnü.jpg',
        infoImage: 'images/logos-levels/SEÑOR DIAMANTE II/Longnü-info.jpg',
      },
      {
        name: 'Perseo',
        image: 'images/logos-levels/SEÑOR DIAMANTE II/Perseo.jpg',
        infoImage: 'images/logos-levels/SEÑOR DIAMANTE II/Perseo-info.jpg',
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
        image: 'images/logos-levels/SEÑOR DIAMANTE I/Aquiles.jpg',
        infoImage: 'images/logos-levels/SEÑOR DIAMANTE I/Aquiles-info.jpg',
      },
      {
        name: 'Helena de Troya',
        image: 'images/logos-levels/SEÑOR DIAMANTE I/Helena-de-Troya.jpg',
        infoImage: 'images/logos-levels/SEÑOR DIAMANTE I/Helena-de-Troya-info.jpg',
      },
      {
        name: 'Morgana',
        image: 'images/logos-levels/SEÑOR DIAMANTE I/Morgana.jpg',
        infoImage: 'images/logos-levels/SEÑOR DIAMANTE I/Morgana-info.jpg',
      },
      {
        name: 'Odiseo',
        image: 'images/logos-levels/SEÑOR DIAMANTE I/Odiseo.jpg',
        infoImage: 'images/logos-levels/SEÑOR DIAMANTE I/Odiseo-info.jpg',
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
        image: 'images/logos-levels/LEYENDA TEMPORAL III/Buda.jpg',
        infoImage: 'images/logos-levels/LEYENDA TEMPORAL III/Buda-info.jpg',
      },
      {
        name: 'Jesús',
        image: 'images/logos-levels/LEYENDA TEMPORAL III/Jesús.jpg',
        infoImage: 'images/logos-levels/LEYENDA TEMPORAL III/Jesús-info.jpg',
      },
      {
        name: 'María Magdalena',
        image: 'images/logos-levels/LEYENDA TEMPORAL III/María-Magdalena.jpg',
        infoImage: 'images/logos-levels/LEYENDA TEMPORAL III/María-Magdalena-info.jpg',
      },
      {
        name: 'Rea Silvia',
        image: 'images/logos-levels/LEYENDA TEMPORAL III/Rea-Silvia.jpg',
        infoImage: 'images/logos-levels/LEYENDA TEMPORAL III/Rea-Silvia-info.jpg',
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
        image: 'images/logos-levels/LEYENDA TEMPORAL II/Ginebra.jpg',
        infoImage: 'images/logos-levels/LEYENDA TEMPORAL II/Ginebra-info.jpg',
      },
      {
        name: 'Medusa',
        image: 'images/logos-levels/LEYENDA TEMPORAL II/Medusa.jpg',
        infoImage: 'images/logos-levels/LEYENDA TEMPORAL II/Medusa-info.jpg',
      },
      {
        name: 'Merlín',
        image: 'images/logos-levels/LEYENDA TEMPORAL II/Merlín.jpg',
        infoImage: 'images/logos-levels/LEYENDA TEMPORAL II/Merlín-info.jpg',
      },
      {
        name: 'Rey Arturo',
        image: 'images/logos-levels/LEYENDA TEMPORAL II/Rey-Arturo.jpg',
        infoImage: 'images/logos-levels/LEYENDA TEMPORAL II/Rey-Arturo-info.jpg',
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
        image: 'images/logos-levels/LEYENDA TEMPORAL I/Afrodita.jpg',
        infoImage: 'images/logos-levels/LEYENDA TEMPORAL I/Afrodita-info.jpg',
      },
      {
        name: 'Anubis',
        image: 'images/logos-levels/LEYENDA TEMPORAL I/Anubis.jpg',
        infoImage: 'images/logos-levels/LEYENDA TEMPORAL I/Anubis-info.jpg',
      },
      {
        name: 'Atenea',
        image: 'images/logos-levels/LEYENDA TEMPORAL I/Atenea.jpg',
        infoImage: 'images/logos-levels/LEYENDA TEMPORAL I/Atenea-info.jpg',
      },
      {
        name: 'Poseidón',
        image: 'images/logos-levels/LEYENDA TEMPORAL I/Poseidón.jpg',
        infoImage: 'images/logos-levels/LEYENDA TEMPORAL I/Poseidón-info.jpg',
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
        image: 'images/logos-levels/ARQUITECTO DEL TIEMPO TITAN/Hades.jpg',
        infoImage: 'images/logos-levels/ARQUITECTO DEL TIEMPO TITAN/Hades-info.jpg',
      },
      {
        name: 'Isis',
        image: 'images/logos-levels/ARQUITECTO DEL TIEMPO TITAN/Isis.jpg',
        infoImage: 'images/logos-levels/ARQUITECTO DEL TIEMPO TITAN/Isis-info.jpg',
      },
      {
        name: 'Perséfone',
        image: 'images/logos-levels/ARQUITECTO DEL TIEMPO TITAN/Perséfone.jpg',
        infoImage: 'images/logos-levels/ARQUITECTO DEL TIEMPO TITAN/Perséfone-info.jpg',
      },
      {
        name: 'Thor',
        image: 'images/logos-levels/ARQUITECTO DEL TIEMPO TITAN/Thor.jpg',
        infoImage: 'images/logos-levels/ARQUITECTO DEL TIEMPO TITAN/Thor-info.jpg',
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
        image: 'images/logos-levels/ARQUITECTO DEL TIEMPO LEYENDA/Hera.jpg',
        infoImage: 'images/logos-levels/ARQUITECTO DEL TIEMPO LEYENDA/Hera-info.jpg',
      },
      {
        name: 'Odín',
        image: 'images/logos-levels/ARQUITECTO DEL TIEMPO LEYENDA/Odín.jpg',
        infoImage: 'images/logos-levels/ARQUITECTO DEL TIEMPO LEYENDA/Odín-info.jpg',
      },
      {
        name: 'Sejmet',
        image: 'images/logos-levels/ARQUITECTO DEL TIEMPO LEYENDA/Sejmet.jpg',
        infoImage: 'images/logos-levels/ARQUITECTO DEL TIEMPO LEYENDA/Sejmet-info.jpg',
      },
      {
        name: 'Zeus',
        image: 'images/logos-levels/ARQUITECTO DEL TIEMPO LEYENDA/Zeus.jpg',
        infoImage: 'images/logos-levels/ARQUITECTO DEL TIEMPO LEYENDA/Zeus-info.jpg',
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
