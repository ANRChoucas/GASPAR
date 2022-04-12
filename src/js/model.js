/**
 * The structure of object tree, displayed in the left menu
 * (it is build from a request to the NEO4j DB)
 * @type {{}}
 */
export const tree = {};

/**
 * An array of categories. Filled when the object tree is built.
 * @type {*[]}
 */
export const ref_neo4j_categories = [];

/**
* Default colors for OSM items (used when the tree is hovered
* and also as default color when opening the clue box).
*/
export const default_tree_colors = new Map([
  ['pic', '#FF4500'], // OrangeRed
  ['col', '#FF4500'], // OrangeRed
  ['lac', '#4169E1'], // RoyalBlue
  ['parking', '#4169E1'], // RoyalBlue
  ['RIVER', '#483D8B'], // DarkSlateBlue
  ['PATHWAY', '#F4a460'], // SandyBrown
  ['sentier', '#2F4F4F'], // DarkSlateGray
  ['route', '#696969'], // DimGray
  ['SKILIFT', '#808080'], // Gray
  ['POWER', '#2F4F4F'], // DarkSlateGray
  ['CITY', '#FF0000'], // Red
  ['TOWN', '#FF0000'], // Red
  ['VILLAGE', '#FF0000'], // Red
  ['pylône électrique', 'black'],
  ['3 câbles', 'black'],
  ['6 câbles', 'indigo'],
]);

export const all_activities = [
  'Aucune',
  'Ski',
  'VTT',
  'Escalade',
  'Randonnée Pédestre',
  'Canyoning',
  'Spéléologie',
  'Parapente',
  'Autre Activité',
];

/**
 * All the spatial relations from the Ontologie des Relations de Localisation
 * that can be used in Ruitor and that will feed the clue panel.
 *
 * @type {[{
 *   comment: string,
 *   label: string,
 *   uri: string,
 *   tags: string[],
 *   worksProperly: boolean|undefined,
 *   modifiers: [{}]|undefined
 * }]}
 */
export const allRelationLocalisation = [
  {
    uri: 'http://www.semanticweb.org/mbunel/ontologies/Ornitho#AEstDe',
    comment: 'La cible se situe globalement à l’est du site, sans préciser si elle est à dans la partie est du site ou disjointe du site et à l’est de lui.',
    label: 'À l\'est de',
    tags: ['Direction', 'Orientation'],
  },
  {
    uri: 'http://www.semanticweb.org/mbunel/ontologies/Ornitho#AOuestDe',
    comment: 'La cible se situe globalement à l’Ouest du site, sans préciser si elle est à dans la partie ouest du site ou disjointe du site et à l’ouest de lui.',
    label: 'À l\'ouest de',
    tags: ['Direction', 'Orientation'],
  },
  {
    uri: 'http://www.semanticweb.org/mbunel/ontologies/Ornitho#AuNordDe',
    comment: 'La cible est au nord du site',
    label: 'Au nord de',
    tags: ['Direction', 'Orientation'],
  },
  {
    uri: 'http://www.semanticweb.org/mbunel/ontologies/Ornitho#AuSudDe',
    comment: 'La cible est au sud du site',
    label: 'Au sud de',
    tags: ['Direction', 'Orientation'],
  },
  {
    uri: 'http://www.semanticweb.org/mbunel/ontologies/Ornitho#AEstDeExterne',
    comment: 'La cible se situe à l’extérieur et à l\'est du site.',
    label: 'À l\'est de (externe)',
    tags: ['Direction', 'Orientation', 'Disjonction'],
  },
  {
    uri: 'http://www.semanticweb.org/mbunel/ontologies/Ornitho#AOuestDeExterne',
    comment: 'La cible se situe à l’extérieur et à l\'ouest du site.',
    label: 'À l\'ouest de (externe)',
    tags: ['Direction', 'Orientation', 'Disjonction'],
  },
  {
    uri: 'http://www.semanticweb.org/mbunel/ontologies/Ornitho#AuNordDeExterne',
    comment: 'La cible se situe à l’extérieur et au nord du site.',
    label: 'Au nord de (externe)',
    tags: ['Direction', 'Orientation', 'Disjonction'],
  },
  {
    uri: 'http://www.semanticweb.org/mbunel/ontologies/Ornitho#AuSudDeExterne',
    comment: 'La cible se situe à l’extérieur et au sud du site.',
    label: 'Au sud de (externe)',
    tags: ['Direction', 'Orientation', 'Disjonction'],
  },
  {
    uri: 'http://www.semanticweb.org/mbunel/ontologies/Ornitho#Proximal',
    comment: 'La cible est dans le site ou à proximité immédiate, qui peut être une proximité fonctionnelle (exemple de la personne qui fait la queue à la poste dans Bateman et al. 2010).',
    label: 'Proximal',
    tags: ['Proximité'],
  },
  {
    uri: 'http://www.semanticweb.org/mbunel/ontologies/Ornitho#AuxAlentoursDe',
    comment: 'La cible est suffisamment proche du site pour qu’on puisse considérer que le site reste un point de repère qui a un sens. La proximité qui pourrait s’en déduire est généralement dépendante d’un « rayonnement » qui pourrait êtrre affecté au site (lié à sa renommée, à sa taille typiquemnet pour un lieu habité, à sa saillance...). Il peut y avoir connexion topologique entre la cible et le site, ou pas. Exemple : « je suis dans le coin du mont-Blanc ».',
    label: 'Aux alentours de',
    tags: ['Proximité'],
    worksProperly: false,
  },
  {
    uri: 'http://www.semanticweb.org/mbunel/ontologies/Ornitho#SousProcheDe',
    comment: 'La cible est proche et a une altitude inférieure à celle du site.',
    label: 'Sous et proche de',
    tags: ['Proximité', 'Altitude'],
  },
  {
    uri: 'http://www.semanticweb.org/mbunel/ontologies/Ornitho#AuDessusProche',
    comment: 'La cible est proche et a une altitude supérieure à celle du site.',
    label: 'Au dessus et proche de',
    tags: ['Proximité', 'Altitude'],
    worksProperly: false,
  },
  {
    uri: 'http://www.semanticweb.org/mbunel/ontologies/Ornitho#AuDessusAltitude',
    comment: 'La cible a une altitude supérieure à celle du site. La distance entre le site est la cible n’est pas contraignante.',
    label: 'Au dessus d\'une altitude',
    tags: ['Altitude'],
    worksProperly: false,
  },
  {
    uri: 'http://www.semanticweb.org/mbunel/ontologies/Ornitho#ALaMemeAltitudeQue',
    comment: 'La cible est située à la même altitude que le site. Le site peut être une altitude absolue (=> donc plus ou moins une courbe de niveau ou un « plan de niveau »), ou un objet dont l’altitude sert donc de référence.',
    label: 'À la même altitude que',
    tags: ['Altitude'],
    worksProperly: false,
  },
  {
    uri: 'http://www.semanticweb.org/mbunel/ontologies/Ornitho#SousAltitude',
    comment: 'La cible a une altitude inférieure à celle du site. Sa distance au site n’est pas contrainte.',
    label: 'Sous une altitude',
    tags: ['Altitude'],
  },
  {
    uri: 'http://www.semanticweb.org/mbunel/ontologies/Ornitho#DansPlanimetrique',
    comment: 'La cible est située dans l’espace 2,5 D délimité par le site (qui est donc considéré comme délimitant une région sur la surface terrestre).',
    label: 'Dans planimétrique',
    tags: ['Contact'],
    modifiers: [
      {
        uri: 'http://www.semanticweb.org/mbunel/ontologies/Ornitho#Not',
        value: Number,
      },
    ],
  },
  {
    uri: 'http://www.semanticweb.org/mbunel/ontologies/Ornitho#HorsDePlanimetrique',
    comment: 'La cible est située en dehors de l’espace 2,5 D délimité par le site, qui est donc considéré comme délimitant une région sur la surface terrestre. Cette relation de localisation est mutuellement exclusive avec DansPlanimetrique, mais n\'en est pas le complémentaire.',
    label: 'Hors de planimétrique',
    tags: ['Disjonction'],
  },
  {
    uri: 'http://www.semanticweb.org/mbunel/ontologies/Ornitho#SousALAplombDe',
    comment: 'La cible est sous le site et à l\'aplomb de ce dernier.',
    label: 'Sous à l\'aplomb de',
    tags: ['Altitude', 'Vertical'],
    worksProperly: false,
  },
  {
    uri: 'http://www.semanticweb.org/mbunel/ontologies/Ornitho#ALaFrontiereDe',
    comment: '',
    label: 'À la frontière de',
    tags: ['Contact'],
  },
  {
    uri: 'http://www.semanticweb.org/mbunel/ontologies/Ornitho#EntreXetY',
    comment: '',
    label: 'Entre X et Y',
    tags: ['Proximité', 'Ternaire'],
    worksProperly: false,
  },
  {
    uri: 'http://www.semanticweb.org/mbunel/ontologies/Ornitho#DistanceQuantitativePlanimetrique',
    comment: '',
    label: 'Distance quantitative planimétrique',
    tags: ['Proximité'],
    modifiers: [
      {
        uri: 'http://www.semanticweb.org/mbunel/ontologies/Ornitho#EqDist',
        value: Number,
      },
    ],
  },
];
