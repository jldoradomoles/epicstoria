export interface ColoringImage {
  file: string;
  title: string;
}

const BASE_PATH = 'images/juegos/colorea/';

const RAW_IMAGES: [string, string][] = [
  ['abbas-ibn-firnas', 'Abbas ibn Firnas'],
  ['anibal', 'Aníbal'],
  ['anne-bonny', 'Anne Bonny'],
  ['arquero-medieval', 'Arquero medieval'],
  ['arquimedes-y-la-anticitera', 'Arquímedes y la máquina de Anticitera'],
  ['asedio-medieval', 'Asedio medieval'],
  ['atenea-en-la-acropolis', 'Atenea en la Acrópolis'],
  ['carlota-lucumi', 'Carlota Lucumí'],
  ['centurion-romano-ante-la-fortaleza', 'Centurión romano ante la fortaleza'],
  ['ciudad-prohibida-china', 'La Ciudad Prohibida de China'],
  ['cleopatra', 'Cleopatra'],
  ['construccion-de-una-catedral-gotica-medieval', 'Construcción de una catedral gótica'],
  ['cristo-del-abismo', 'Cristo del Abismo'],
  ['cristobal-colon', 'Cristóbal Colón'],
  ['cuauhtemoc', 'Cuauhtémoc'],
  ['cuauhtemoc2', 'Cuauhtémoc, el último tlatoani'],
  ['descubrimiento-de-america', 'Descubrimiento de América'],
  ['desembarco-vikingo', 'Desembarco vikingo'],
  ['duelo-samurai-bajo-la-lluvia', 'Duelo samurái bajo la lluvia'],
  ['einstein-ensenando-frente-a-la-pizarra', 'Einstein enseñando frente a la pizarra'],
  ['ejercito-de-terracota-en-excavacion', 'Ejército de terracota en excavación'],
  ['el-primer-vuelo', 'El primer vuelo'],
  ['epico', 'Épico'],
  ['epicstoria', 'Epicstoria'],
  ['frida-kahlo', 'Frida Kahlo'],
  ['gladiadores-en-la-arena-romana', 'Gladiadores en la arena romana'],
  ['guerrero-mauri', 'Guerrero maorí'],
  ['guerrero-troyano', 'Guerrero troyano'],
  ['guerreros-zulues', 'Guerreros zulúes'],
  ['harriet-tubman', 'Harriet Tubman'],
  ['hipatia', 'Hipatia de Alejandría'],
  ['isabel-i-de-inglaterra', 'Isabel I de Inglaterra'],
  ['jane-goodall', 'Jane Goodall'],
  ['la-estatua-de-la-libertad', 'La Estatua de la Libertad'],
  ['locomotora', 'La locomotora de vapor'],
  ['lozen', 'Lozen'],
  ['lozen2', 'Lozen, guerrera apache'],
  ['marie-curie', 'Marie Curie'],
  ['mercado-mesoamericano', 'Mercado mesoamericano'],
  ['napoleon', 'Napoleón'],
  ['orfeo-y-euridice', 'Orfeo y Eurídice'],
  ['ramses-ii-ante-el-templo-de-abu-simbel', 'Ramsés II ante el templo de Abu Simbel'],
  ['samurai-entre-cerezos-y-templos', 'Samurái entre cerezos y templos'],
  ['sisi', 'Sisi'],
  ['sisi2', 'Sisi, emperatriz de Austria'],
  ['tomoe-gozen', 'Tomoe Gozen'],
  ['zeus', 'Zeus'],
];

export const COLORING_IMAGES: ColoringImage[] = RAW_IMAGES.map(([file, title]) => ({
  file: `${BASE_PATH}${file}.webp`,
  title,
}));
