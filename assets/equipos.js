/* =========================================================================
   equipos.js — catálogo de clubes de las nueve ligas que sigue Seba.

   `id`    identificador del escudo en la CDN de API-Sports
   `c`     colores del club, para el escudo dibujado si la imagen no carga
   `alias` cómo se escribe en la práctica, para que el buscador lo encuentre

   Plantillas de la temporada 2025-26 (año 2025 en Brasil, Colombia y
   Argentina). Al cambiar de temporada hay que revisar ascensos y descensos.
   ========================================================================= */
window.EQUIPOS_CATALOGO = {

  /* --- Premier League · Inglaterra --- */
  premier: [
    { n: "AFC Bournemouth", id: 35, c: ['#DA291C', '#000000'], alias: ["bournemouth"] },
    { n: "Arsenal", id: 42, c: ['#EF0107', '#FFFFFF'] },
    { n: "Aston Villa", id: 66, c: ['#670E36', '#95BFE5'] },
    { n: "Brentford", id: 55, c: ['#E30613', '#FFFFFF'] },
    { n: "Brighton & Hove Albion", id: 51, c: ['#0057B8', '#FFFFFF'], alias: ["brighton"] },
    { n: "Burnley", id: 44, c: ['#6C1D45', '#99D6EA'] },
    { n: "Chelsea", id: 49, c: ['#034694', '#FFFFFF'] },
    { n: "Crystal Palace", id: 52, c: ['#C4122E', '#1B458F'] },
    { n: "Everton", id: 45, c: ['#003399', '#FFFFFF'] },
    { n: "Fulham", id: 36, c: ['#FFFFFF', '#000000'] },
    { n: "Leeds United", id: 63, c: ['#FFFFFF', '#1D428A'], alias: ["leeds"] },
    { n: "Liverpool", id: 40, c: ['#C8102E', '#FFFFFF'] },
    { n: "Manchester City", id: 50, c: ['#6CABDD', '#1C2C5B'], alias: ["man city", "city"] },
    { n: "Manchester United", id: 33, c: ['#DA291C', '#FBE122'], alias: ["man united", "united", "man utd"] },
    { n: "Newcastle United", id: 34, c: ['#241F20', '#FFFFFF'], alias: ["newcastle"] },
    { n: "Nottingham Forest", id: 65, c: ['#DD0000', '#FFFFFF'], alias: ["forest"] },
    { n: "Sunderland", id: 746, c: ['#EB172B', '#FFFFFF'] },
    { n: "Tottenham Hotspur", id: 47, c: ['#132257', '#FFFFFF'], alias: ["Tottenham", "spurs"] },
    { n: "West Ham United", id: 48, c: ['#7A263A', '#1BB1E7'], alias: ["west ham"] },
    { n: "Wolverhampton Wanderers", id: 39, c: ['#FDB913', '#231F20'], alias: ["wolves"] }
  ],

  /* --- LaLiga · España --- */
  laliga: [
    { n: "Athletic Club", id: 531, c: ['#EE2523', '#FFFFFF'], alias: ["athletic", "bilbao", "athletic bilbao"] },
    { n: "CA Osasuna", id: 727, c: ['#D91A21', '#0A346F'], alias: ["Osasuna"] },
    { n: "Club Atlético de Madrid", id: 530, c: ['#CB3524', '#FFFFFF'], alias: ["Atletico Madrid", "atlético madrid", "atleti", "colchoneros"] },
    { n: "Deportivo Alavés", id: 542, c: ['#0761AF', '#FFFFFF'], alias: ["alaves"] },
    { n: "Elche", id: 797, c: ['#05642C', '#FFFFFF'] },
    { n: "FC Barcelona", id: 529, c: ['#A50044', '#004D98'], alias: ["Barcelona"] },
    { n: "Getafe", id: 546, c: ['#005999', '#FFFFFF'] },
    { n: "Girona", id: 547, c: ['#CD2534', '#FFFFFF'] },
    { n: "Levante", id: 539, c: ['#B4053F', '#005CA5'] },
    { n: "RC Celta de Vigo", id: 538, c: ['#8AC3EE', '#E5254E'], alias: ["Celta Vigo"] },
    { n: "RCD Espanyol de Barcelona", id: 540, c: ['#ED1B35', '#FFCB30'], alias: ["Espanyol"] },
    { n: "RCD Mallorca", id: 798, c: ['#E20613', '#000000'], alias: ["Mallorca"] },
    { n: "Rayo Vallecano de Madrid", id: 728, c: ['#8F8333', '#D2232A'], alias: ["Rayo Vallecano"] },
    { n: "Real Betis Balompié", id: 543, c: ['#00954C', '#DB8C00'], alias: ["Real Betis"] },
    { n: "Real Madrid", id: 541, c: ['#FFFFFF', '#FEBE10'], alias: ["madrid"] },
    { n: "Real Oviedo", id: 718, c: ['#094CA1', '#FFFFFF'], alias: ["Oviedo"] },
    { n: "Real Sociedad de Fútbol", id: 548, c: ['#0056B3', '#D77723'], alias: ["Real Sociedad"] },
    { n: "Sevilla", id: 536, c: ['#FFFFFF', '#D6001C'], alias: ["sevilla fc"] },
    { n: "Valencia", id: 532, c: ['#FFFFFF', '#EE7A0E'], alias: ["valencia cf"] },
    { n: "Villarreal", id: 533, c: ['#FFD733', '#005187'], alias: ["submarino amarillo"] }
  ],

  /* --- Serie A · Italia --- */
  seriea: [
    { n: "AC Milan", id: 489, c: ['#FB090B', '#000000'], alias: ["milan", "ac milan"] },
    { n: "AC Pisa 1909", id: 801, c: ['#0067B5', '#1A1D1E'], alias: ["Pisa"] },
    { n: "ACF Fiorentina", id: 502, c: ['#59338A', '#E1231B'], alias: ["Fiorentina"] },
    { n: "AS Roma", id: 497, c: ['#8E1F2F', '#F0BC42'], alias: ["roma"] },
    { n: "Atalanta BC", id: 499, c: ['#0D68B1', '#000000'], alias: ["Atalanta"] },
    { n: "Bologna FC 1909", id: 500, c: ['#17529C', '#F04D43'], alias: ["Bologna"] },
    { n: "Cagliari Calcio", id: 490, c: ['#B01028', '#082242'], alias: ["Cagliari"] },
    { n: "Como 1907", id: 895, c: ['#114169', '#DCE3E9'], alias: ["como"] },
    { n: "FC Internazionale Milano", id: 505, c: ['#0068A8', '#000000'], alias: ["Inter", "inter", "inter de milan", "internazionale"] },
    { n: "Genoa CFC", id: 495, c: ['#002942', '#AB131C'], alias: ["Genoa"] },
    { n: "Hellas Verona", id: 504, c: ['#005395', '#FFD100'], alias: ["verona"] },
    { n: "Juventus", id: 496, c: ['#000000', '#FFFFFF'], alias: ["juve", "juventus fc"] },
    { n: "Parma Calcio 1913", id: 523, c: ['#FFD200', '#1B4094'], alias: ["Parma"] },
    { n: "SS Lazio", id: 487, c: ['#00AEEF', '#D4AE0F'], alias: ["Lazio"] },
    { n: "SSC Napoli", id: 492, c: ['#12A0D7', '#FFFFFF'], alias: ["Napoli", "napoles", "nápoles"] },
    { n: "Torino", id: 503, c: ['#8A1E03', '#FFFFFF'], alias: ["turin", "torino fc"] },
    { n: "US Cremonese", id: 520, c: ['#ED1C24', '#808285'], alias: ["Cremonese"] },
    { n: "US Lecce", id: 867, c: ['#FFF200', '#ED1B23'], alias: ["Lecce"] },
    { n: "US Sassuolo Calcio", id: 488, c: ['#0AA853', '#000000'], alias: ["Sassuolo"] },
    { n: "Udinese Calcio", id: 494, c: ['#B2B3B5', '#2F2A27'], alias: ["Udinese"] }
  ],

  /* --- Bundesliga · Alemania --- */
  bundesliga: [
    { n: "1. FC Heidenheim 1846", id: 180, c: ['#003E7E', '#ED1C24'], alias: ["FC Heidenheim"] },
    { n: "1. FC Köln", id: 192, c: ['#ED1C24', '#000000'], alias: ["colonia", "koln"] },
    { n: "1. FC Union Berlin", id: 182, c: ['#D42526', '#F1EC43'], alias: ["Union Berlin"] },
    { n: "1. FSV Mainz 05", id: 164, c: ['#C3141E', '#FFFFFF'], alias: ["FSV Mainz 05"] },
    { n: "Bayer 04 Leverkusen", id: 168, c: ['#E32221', '#000000'], alias: ["Bayer Leverkusen"] },
    { n: "Borussia Dortmund", id: 165, c: ['#FDE100', '#000000'], alias: ["dortmund", "bvb"] },
    { n: "Borussia Mönchengladbach", id: 163, c: ['#FFFFFF', '#000000'], alias: ["gladbach", "monchengladbach", "borussia gladbach"] },
    { n: "Eintracht Frankfurt", id: 169, c: ['#E1000F', '#000000'], alias: ["frankfurt"] },
    { n: "FC Augsburg", id: 170, c: ['#BA3733', '#46714D'] },
    { n: "FC Bayern München", id: 157, c: ['#DC052D', '#0066B2'], alias: ["Bayern Munich", "bayern", "bayern múnich", "munich"] },
    { n: "FC St. Pauli 1910", id: 186, c: ['#ED1C24', '#66442B'], alias: ["FC St. Pauli"] },
    { n: "Hamburger SV", id: 175, c: ['#1E5CB3', '#FFFFFF'] },
    { n: "RB Leipzig", id: 173, c: ['#DD0741', '#FFFFFF'] },
    { n: "SC Freiburg", id: 160, c: ['#FD1220', '#000000'] },
    { n: "SV Werder Bremen", id: 162, c: ['#1D9053', '#FFFFFF'], alias: ["Werder Bremen"] },
    { n: "TSG 1899 Hoffenheim", id: 167, c: ['#1961B5', '#FFFFFF'], alias: ["1899 Hoffenheim"] },
    { n: "VfB Stuttgart", id: 172, c: ['#E32219', '#FFFFFF'] },
    { n: "VfL Wolfsburg", id: 161, c: ['#65B32E', '#FFFFFF'] }
  ],

  /* --- Ligue 1 · Francia --- */
  ligue1: [
    { n: "AJ Auxerre", id: 108, c: ['#3F87C0', '#7FAFD5'], alias: ["Auxerre"] },
    { n: "AS Monaco", id: 91, c: ['#E51B22', '#FFFFFF'], alias: ["Monaco"] },
    { n: "Angers SCO", id: 77, c: ['#140E0B', '#4C4845'], alias: ["Angers"] },
    { n: "FC Lorient", id: 97, c: ['#EA670B', '#1B1615'], alias: ["Lorient"] },
    { n: "FC Metz", id: 112, c: ['#731013', '#FFFFFF'], alias: ["Metz"] },
    { n: "FC Nantes", id: 83, c: ['#FDDC00', '#00A558'], alias: ["Nantes"] },
    { n: "Le Havre", id: 111, c: ['#89C2EB', '#213255'] },
    { n: "Lille OSC", id: 79, c: ['#24216A', '#E01E13'], alias: ["Lille"] },
    { n: "OGC Nice", id: 84, c: ['#C09B5B', '#D3031C'], alias: ["Nice"] },
    { n: "Olympique Lyonnais", id: 80, c: ['#FFFFFF', '#0F23AA'], alias: ["lyon", "olympique lyon"] },
    { n: "Olympique de Marseille", id: 81, c: ['#FFFFFF', '#2FAEE0'], alias: ["Marseille", "marsella", "olympique marsella", "om"] },
    { n: "Paris FC", id: 114, c: ['#0A0F2D', '#0096CB'] },
    { n: "Paris Saint-Germain", id: 85, c: ['#004170', '#DA291C'], alias: ["psg", "paris"] },
    { n: "RC Strasbourg Alsace", id: 95, c: ['#009FE0', '#DA3039'], alias: ["Strasbourg"] },
    { n: "Racing Club de Lens", id: 116, c: ['#C71D22', '#FFD503'], alias: ["Lens"] },
    { n: "Stade Brestois 29", id: 106, c: ['#ED1C27', '#000000'] },
    { n: "Stade Rennais FC 1901", id: 94, c: ['#E23227', '#FDBC15'], alias: ["Rennes"] },
    { n: "Toulouse", id: 96, c: ['#3E2C56', '#FFFFFF'] }
  ],

  /* --- Liga BetPlay Dimayor · Colombia --- */
  betplay: [
    { n: "Alianza", id: 2881, c: ['#223E86', '#FFFFFF'], alias: ["Alianza FC"] },
    { n: "América de Cali", id: 1138, c: ['#D50032', '#FFFFFF'], alias: ["america", "america cali"] },
    { n: "Atlético Bucaramanga", id: 1131, c: ['#F3E638', '#005A13'], alias: ["bucaramanga"] },
    { n: "Atlético Junior", id: 1135, c: ['#B21117', '#1B2754'], alias: ["Junior", "junior", "junior de barranquilla", "junior barranquilla"] },
    { n: "Atlético Nacional", id: 1137, c: ['#009B3A', '#FFFFFF'], alias: ["nacional", "verdolaga"] },
    { n: "Boyacá Chicó", id: 20878, c: ['#0A60B9', '#FFFFFF'], alias: ["chico"] },
    { n: "Deportes Tolima", id: 1142, c: ['#92000A', '#CDA434'], alias: ["tolima"] },
    { n: "Deportivo Cali", id: 1127, c: ['#2A975E', '#FFFFFF'], alias: ["cali"] },
    { n: "Deportivo Pasto", id: 1126, c: ['#C71E26', '#212778'], alias: ["pasto"] },
    { n: "Deportivo Pereira", id: 1462, c: ['#F2E731', '#E30613'], alias: ["pereira"] },
    { n: "Envigado", id: 1129, c: ['#EF7F1A', '#009846'] },
    { n: "Fortaleza", id: 1147, c: ['#0362AB', '#F32B09'], alias: ["Fortaleza FC"] },
    { n: "Independiente Medellín", id: 1128, c: ['#E91B29', '#252C5E'], alias: ["medellin", "dim"] },
    { n: "La Equidad", id: 1134, c: ['#00A153', '#FFFFFF'], alias: ["equidad"] },
    { n: "Llaneros", id: 1464, c: ['#FFFFFF', '#000000'] },
    { n: "Millonarios", id: 1125, c: ['#003DA5', '#FFFFFF'], alias: ["millos", "millonarios fc"] },
    { n: "Once Caldas", id: 1136, c: ['#FFFFFF', '#000000'], alias: ["once"] },
    { n: "Santa Fe", id: 1139, c: ['#ED1E26', '#FFFFFF'] },
    { n: "Unión Magdalena", id: 1465, c: ['#E30613', '#002FA7'], alias: ["union magdalena"] },
    { n: "Águilas Doradas", id: 1144, c: ['#C6A845', '#131A30'], alias: ["aguilas", "rionegro", "Rionegro Aguilas"] }
  ],

  /* --- Brasileirão Série A · Brasil --- */
  brasileirao: [
    { n: "Botafogo", id: 120, c: ['#000000', '#FFFFFF'] },
    { n: "CA Mineiro", id: 1062, c: ['#231F20', '#FFD300'], alias: ["Atletico-MG", "atletico mineiro", "galo", "atlético mineiro"] },
    { n: "CR Flamengo", id: 127, c: ['#C22A1E', '#010103'], alias: ["Flamengo", "flamengo", "mengao"] },
    { n: "CR Vasco da Gama", id: 133, c: ['#000000', '#FFFFFF'], alias: ["Vasco DA Gama", "vasco"] },
    { n: "Ceará", id: 129, c: ['#000000', '#FFFFFF'] },
    { n: "Cruzeiro", id: 135, c: ['#1F3A93', '#FFFFFF'] },
    { n: "EC Bahia", id: 118, c: ['#0095DA', '#ED1C24'], alias: ["Bahia"] },
    { n: "EC Juventude", id: 152, c: ['#00A651', '#E7B733'], alias: ["Juventude"] },
    { n: "EC Vitória", id: 136, c: ['#EC3719', '#000000'], alias: ["Vitoria"] },
    { n: "Fluminense", id: 124, c: ['#870A28', '#00613C'] },
    { n: "Fortaleza", id: 154, c: ['#0362AB', '#F32B09'], alias: ["Fortaleza EC"] },
    { n: "Grêmio FBPA", id: 130, c: ['#0C94D3', '#000000'], alias: ["Gremio", "gremio"] },
    { n: "Mirassol", id: 7848, c: ['#EEED05', '#256C38'] },
    { n: "RB Bragantino", id: 794, c: ['#BD2A37', '#061A3C'], alias: ["bragantino"] },
    { n: "SC Corinthians Paulista", id: 131, c: ['#DF3126', '#000000'], alias: ["Corinthians", "corinthians", "timao"] },
    { n: "SC Internacional", id: 119, c: ['#E5050F', '#FFFFFF'], alias: ["Internacional"] },
    { n: "SC Recife", id: 123, c: ['#DA1921', '#FFD503'], alias: ["Sport Recife"] },
    { n: "SE Palmeiras", id: 121, c: ['#00703C', '#A9CFBE'], alias: ["Palmeiras", "palmeiras", "verdao"] },
    { n: "Santos", id: 128, c: ['#FFFFFF', '#000000'] },
    { n: "São Paulo", id: 126, c: ['#FFFFFF', '#FE0000'], alias: ["sao paulo", "sampa"] }
  ],

  /* --- Liga Profesional · Argentina --- */
  argentina: [
    { n: "Aldosivi", id: 463, c: ['#41A72A', '#FFDD00'] },
    { n: "Argentinos Juniors", id: 458, c: ['#E32021', '#FFFFFF'], alias: ["Argentinos JRS"] },
    { n: "Atlético Tucumán", id: 455, c: ['#66ACD7', '#FFFFFF'] },
    { n: "Banfield", id: 449, c: ['#03953F', '#FFFFFF'] },
    { n: "Barracas Central", id: 2432, c: ['#E30016', '#FFFFFF'] },
    { n: "Belgrano de Córdoba", id: 440, c: ['#1DBBEA', '#000000'], alias: ["Belgrano Cordoba"] },
    { n: "Boca Juniors", id: 451, c: ['#0A1F8F', '#FFC72C'], alias: ["boca", "xeneize"] },
    { n: "Central Córdoba SdE", id: 1065, c: ['#000000', '#FFFFFF'], alias: ["Central Cordoba de Santiago"] },
    { n: "Defensa y Justicia", id: 442, c: ['#FFDD00', '#00722D'] },
    { n: "Deportivo Riestra", id: 476, c: ['#000000', '#FFFFFF'] },
    { n: "Estudiantes", id: 450, c: ['#EC1B23', '#FFFFFF'], alias: ["Estudiantes L.P."] },
    { n: "Gimnasia de La Plata", id: 434, c: ['#121A61', '#FFFFFF'], alias: ["Gimnasia L.P."] },
    { n: "Godoy Cruz", id: 439, c: ['#0070D0', '#FFFFFF'] },
    { n: "Huracán", id: 445, c: ['#FFFFFF', '#E30613'] },
    { n: "Independiente", id: 453, c: ['#EC1C24', '#FFFFFF'] },
    { n: "Independiente Rivadavia", id: 473, c: ['#2A1972', '#FFFFFF'], alias: ["rivadavia", "Independ. Rivadavia"] },
    { n: "Instituto de Córdoba", id: 478, c: ['#FE0000', '#FFFFFF'], alias: ["Instituto Cordoba"] },
    { n: "Lanús", id: 446, c: ['#AB2A3E', '#FFFFFF'] },
    { n: "Newell's Old Boys", id: 457, c: ['#E30613', '#000000'], alias: ["newells", "ñuls"] },
    { n: "Platense", id: 1064, c: ['#4E3629', '#FFFFFF'] },
    { n: "Racing Club", id: 436, c: ['#029CDC', '#FFFFFF'], alias: ["racing"] },
    { n: "River Plate", id: 435, c: ['#FFFFFF', '#E1052D'], alias: ["river", "millonario"] },
    { n: "Rosario Central", id: 437, c: ['#0A3D72', '#FCD91F'], alias: ["central"] },
    { n: "San Lorenzo", id: 460, c: ['#263A54', '#EA202C'], alias: ["ciclon"] },
    { n: "San Martín de San Juan", id: 461, c: ['#008000', '#000000'], alias: ["San Martin S.J."] },
    { n: "Sarmiento de Junín", id: 474, c: ['#006D37', '#FFFFFF'], alias: ["Sarmiento Junin"] },
    { n: "Talleres de Córdoba", id: 456, c: ['#293255', '#737990'], alias: ["Talleres Cordoba"] },
    { n: "Tigre", id: 452, c: ['#1E448D', '#ED2A3C'] },
    { n: "Unión de Santa Fe", id: 441, c: ['#ED1C24', '#FFFFFF'], alias: ["Union Santa Fe"] },
    { n: "Vélez Sarsfield", id: 438, c: ['#FFFFFF', '#0161A8'], alias: ["velez"] }
  ],

  /* --- Süper Lig · Turquía --- */
  superlig: [
    { n: "Alanyaspor", id: 996, c: ['#F58220', '#42A13F'] },
    { n: "Antalyaspor", id: 1005, c: ['#EB232C', '#FFFFFF'] },
    { n: "Beşiktaş", id: 549, c: ['#000000', '#FFFFFF'], alias: ["besiktas"] },
    { n: "Eyüpspor", id: 3588, c: ['#603195', '#FFD800'] },
    { n: "Fatih Karagümrük", id: 3589, c: ['#EE2E24', '#000000'], alias: ["karagumruk"] },
    { n: "Fenerbahçe", id: 611, c: ['#FFED00', '#16354D'], alias: ["fener", "fenerbahce"] },
    { n: "Galatasaray", id: 645, c: ['#A90432', '#FBB717'], alias: ["gala", "galata"] },
    { n: "Gaziantep FK", id: 3573, c: ['#E73037', '#000000'], alias: ["gaziantep", "Gazişehir Gaziantep"] },
    { n: "Gençlerbirliği", id: 997, c: ['#E00712', '#000000'] },
    { n: "Göztepe", id: 994, c: ['#EE3124', '#FFE800'] },
    { n: "Kasımpaşa", id: 1004, c: ['#2F4BA6', '#EE253D'], alias: ["Kasimpasa"] },
    { n: "Kayserispor", id: 1001, c: ['#AD1122', '#FBBD1B'] },
    { n: "Kocaelispor", id: 7411, c: ['#077847', '#000000'] },
    { n: "Konyaspor", id: 607, c: ['#00804D', '#FFFFFF'] },
    { n: "Samsunspor", id: 3603, c: ['#C70A0C', '#FFFFFF'] },
    { n: "Trabzonspor", id: 998, c: ['#8B1538', '#73B8E8'] },
    { n: "Çaykur Rizespor", id: 1007, c: ['#009430', '#008BD0'], alias: ["rizespor"] },
    { n: "İstanbul Başakşehir", id: 564, c: ['#FF7B0D', '#002A54'] }
  ]
};
