export interface CampusBuildingInfo {
  code: string;
  name: string;
  fullName: string;
  address: string;
  lat: number;
  lng: number;
}

export const PRZ_BUILDINGS: Record<string, CampusBuildingInfo> = {
  V: {
    code: 'V',
    name: 'Budynek V',
    fullName: 'Centrum Dydaktyczno-Konferencyjne (WEiI)',
    address: 'al. Powstańców Warszawy 12, Rzeszów',
    lat: 50.019044,
    lng: 21.989185,
  },
  L: {
    code: 'L',
    name: 'Budynek L',
    fullName: 'Wydział Budowy Maszyn i Lotnictwa',
    address: 'al. Powstańców Warszawy 8 / ul. W. Pola, Rzeszów',
    lat: 50.0215,
    lng: 21.9922,
  },
  Ł: {
    code: 'Ł',
    name: 'Budynek Ł',
    fullName: 'Centrum Sportu Akademickiego',
    address: 'ul. Mazowiecka 4d, Rzeszów',
    lat: 50.018317,
    lng: 21.980238,
  },
  A: {
    code: 'A',
    name: 'Budynek A',
    fullName: 'Gmach Główny Politechniki Rzeszowskiej (Rektorat)',
    address: 'al. Powstańców Warszawy 12, Rzeszów',
    lat: 50.02687,
    lng: 21.98532,
  },
  B: {
    code: 'B',
    name: 'Budynek B',
    fullName: 'Wydział Elektrotechniki i Informatyki',
    address: 'al. Powstańców Warszawy 12, Rzeszów',
    lat: 50.0168,
    lng: 21.9862,
  },
  C: {
    code: 'C',
    name: 'Budynek C',
    fullName: 'Wydział Chemiczny',
    address: 'al. Powstańców Warszawy 6, Rzeszów',
    lat: 50.0175,
    lng: 21.9875,
  },
  D: {
    code: 'D',
    name: 'Budynek D',
    fullName: 'Wydział Chemiczny / Elektrotechnika',
    address: 'al. Powstańców Warszawy 6, Rzeszów',
    lat: 50.02596,
    lng: 21.98364,
  },
  P: {
    code: 'P',
    name: 'Budynek P',
    fullName: 'Wydział Zarządzania',
    address: 'al. Powstańców Warszawy 10, Rzeszów',
    lat: 50.0158,
    lng: 21.9885,
  },
  S: {
    code: 'S',
    name: 'Budynek S',
    fullName: 'Centrum Sportu Akademickiego (Hala)',
    address: 'ul. Poznańska 2a, Rzeszów',
    lat: 50.019336,
    lng: 21.987342,
  },
  O: {
    code: 'O',
    name: 'Budynek O',
    fullName: 'Ośrodek Sportu i Rekreacji',
    address: 'ul. Poznańska, Rzeszów',
    lat: 50.0135,
    lng: 21.9825,
  },
  K: {
    code: 'K',
    name: 'Budynek K',
    fullName: 'Katedra Inżynierii Lotniczej i Kosmicznej',
    address: 'ul. Poznańska, Rzeszów',
    lat: 50.0148,
    lng: 21.9832,
  },
  F: {
    code: 'F',
    name: 'Budynek F',
    fullName: 'Wydział Elektrotechniki i Informatyki',
    address: 'ul. B. Prusa 12, Rzeszów',
    lat: 50.02606,
    lng: 21.98345,
  },
};

export const DISTANCE_MATRIX: Record<string, Record<string, number>> = {
  V: { L: 850, A: 280, B: 340, C: 420, D: 490, P: 250, S: 720, O: 790, K: 680 },
  L: { V: 850, A: 820, B: 760, C: 690, D: 620, P: 890, S: 1350, O: 1420, K: 1280 },
  A: { V: 280, L: 820, B: 90, C: 180, D: 260, P: 210, S: 520, O: 590, K: 480 },
  B: { V: 340, L: 760, A: 90, C: 120, D: 200, P: 180, S: 580, O: 650, K: 540 },
  C: { V: 420, L: 690, A: 180, B: 120, D: 110, P: 260, S: 670, O: 740, K: 630 },
  D: { V: 490, L: 620, A: 260, B: 200, C: 110, P: 320, S: 750, O: 820, K: 710 },
  P: { V: 250, L: 890, A: 210, B: 180, C: 260, D: 320, S: 650, O: 720, K: 610 },
  S: { V: 720, L: 1350, A: 520, B: 580, C: 670, D: 750, P: 650, O: 110, K: 160 },
};
