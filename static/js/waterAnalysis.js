import { getParameterDescription, getColor, suggestWaterFilter, getSelectedParameters, getPremiumParameters } from '/static/js/utils.js';
export let map = null;
export function getDistance(lat1, lon1, lat2, lon2) {
    try {
        const R = 6371; // Promień Ziemi w kilometrach
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c; // Odległość w kilometrach
        return distance.toFixed(2); // Zaokrąglamy do 2 miejsc po przecinku
    } catch (error) {
        console.error('Błąd w getDistance:', error);
        return Infinity;
    }
}

export const waterStations = {
    "Grudziądz": {
        average: { pH: 0, twardosc: 0, azotany: 0, zelazo: 0, fluorki: 0, chlor: 0, chlorki: 0, siarczany: 0, potas: 0, metnosc: 0, barwa: 0, mangan: 0 },
        stations: [
            {
                name: "SUW Hallera",
                coords: [53.4870, 18.7570],
                address: "ul. Hallera 79",
                data: {
                    pH: "7.4",
                    twardosc: "139.6",
                    azotany: "5.5",
                    chlor: "0.02",
                    fluorki: "0.28",
                    zelazo: "0.02",
                    mangan: "0.005",
                    chlorki: "50",
                    siarczany: "0",
                    potas: "0",
                    metnosc: "0.20",
                    barwa: "10"
                },
                history: [
                    {
                        date: "2025-03-01",
                        pH: 7.4,
                        twardosc: 162.8,
                        azotany: 7.0,
                        chlor: 0.02,
                        fluorki: 0.28,
                        zelazo: 0.02,
                        mangan: 0.005,
                        chlorki: 68,
                        siarczany: 0,
                        potas: 0,
                        metnosc: 0.26,
                        barwa: 10
                    }
                ]
            }
        ],
        measurementPoints: [
            {
                name: "Punkt pomiarowy Hallera",
                coords: [53.4870, 18.7570],
                address: "ul. Hallera 79",
                data: {
                    pH: "7.4",
                    twardosc: "139.6",
                    azotany: "5.5",
                    chlor: "0.02",
                    fluorki: "0.28",
                    zelazo: "0.02",
                    mangan: "0.005",
                    chlorki: "50",
                    siarczany: "0",
                    potas: "0",
                    metnosc: "0.20",
                    barwa: "10"
                }
            }
        ],
        zones: {
            "Błonie": "SUW Hallera",
            "Chełmińskie": "SUW Hallera",
            "Lotnisko": "SUW Hallera",
            "Mniszek": "SUW Hallera",
            "Osiedle Tarpno": "SUW Hallera",
            "Osiedle Strzemięcin": "SUW Hallera",
            "Osiedle Rządz": "SUW Hallera",
            "Osiedle Kopernika": "SUW Hallera",
            "Osiedle Kawalerii": "SUW Hallera",
            "Osiedle Śródmieście": "SUW Hallera",
            "Osiedle Piaski": "SUW Hallera",
            "Osiedle Węgrowo": "SUW Hallera",
            "Osiedle Zielone": "SUW Hallera",
            "Osiedle Południe": "SUW Hallera",
            "Osiedle Marusza": "SUW Hallera"
        }
    },
    "Wałbrzych": {
        average: { pH: 0, twardosc: 0, azotany: 0, zelazo: 0, fluorki: 0, chlor: 0, chlorki: 0, siarczany: 0, potas: 0, metnosc: 0, barwa: 0, mangan: 0 },
        stations: [
            {
                name: "SUW Mała Woda",
                coords: [50.8414, 16.0347],
                address: "Marciszów",
                data: {
                    pH: "0",
                    twardosc: "0",
                    azotany: "0",
                    zelazo: "0",
                    fluorki: "0",
                    chlor: "0",
                    chlorki: "0",
                    siarczany: "0",
                    potas: "0",
                    metnosc: "0",
                    barwa: "0",
                    mangan: "0",
                    magnez: "0"
                },
                history: []
            },
            {
                name: "SUW Szyb Pokój",
                coords: [50.7206, 16.3597],
                address: "Jedlina-Zdrój",
                data: {
                    pH: "0",
                    twardosc: "0",
                    azotany: "0",
                    zelazo: "0",
                    fluorki: "0",
                    chlor: "0",
                    chlorki: "0",
                    siarczany: "0",
                    potas: "0",
                    metnosc: "0",
                    barwa: "0",
                    mangan: "0",
                    magnez: "0"
                },
                history: []
            },
            {
                name: "Ujęcie Unisław Śląski",
                coords: [50.7125, 16.2248],
                address: "Unisław Śląski",
                data: {
                    pH: "0",
                    twardosc: "0",
                    azotany: "0",
                    zelazo: "0",
                    fluorki: "0",
                    chlor: "0",
                    chlorki: "0",
                    siarczany: "0",
                    potas: "0",
                    metnosc: "0",
                    barwa: "0",
                    mangan: "0",
                    magnez: "0"
                },
                history: []
            }
        ],
        measurementPoints: [],
        info: "Wałbrzyskie Przedsiębiorstwo Wodociągów i Kanalizacji Sp. z o.o. poinformowało, że nie jest zobowiązane do podawania parametrów wody. Jeśli mieszkasz w Wałbrzychu, możesz samodzielnie zlecić badanie wody – skontaktuj się z nami, a pomożemy!",
        zones: {
            "Biały Kamień": "SUW Mała Woda",
            "Śródmieście": "SUW Mała Woda",
            "Gaj": "SUW Mała Woda",
            "Glinik Nowy": "SUW Mała Woda",
            "Glinik Stary": "SUW Mała Woda",
            "Konradów": "SUW Szyb Pokój",
            "Kozice": "Ujęcie Unisław Śląski",
            "Książ": "SUW Szyb Pokój",
            "Lubiechów": "Ujęcie Unisław Śląski",
            "Nowe Miasto": "SUW Mała Woda",
            "Nowy Poniatów": "SUW Mała Woda",
            "Osiedle Wanda": "SUW Mała Woda",
            "Piaskowa Góra": "SUW Mała Woda",
            "Podgórze I": "SUW Mała Woda",
            "Podgórze II": "SUW Mała Woda",
            "Podzamcze": "SUW Mała Woda",
            "Poniatów": "SUW Mała Woda",
            "Rusinowa": "SUW Mała Woda",
            "Sobięcin": "SUW Mała Woda",
            "Stary Zdrój": "SUW Mała Woda",
            "Szczawienko": "SUW Szyb Pokój"
        }
    },
    "Bydgoszcz": {
        average: {
            pH: 0,
            twardosc: 0,
            azotany: 0,
            zelazo: 0,
            fluorki: 0,
            chlor: 0,
            chlorki: 0,
            siarczany: 0,
            potas: 0,
            metnosc: 0,
            barwa: 0,
            magnez: 0
        },
        stations: [
            {
                name: "SUW Czyżkówko",
                coords: [53.1300, 17.9400],
                address: "ul. Toruńska 103",
                data: {
                    pH: "7.8",
                    twardosc: "196",
                    azotany: "1.1",
                    chlor: "<0.01",
                    fluorki: "0.13",
                    zelazo: "<0.01",
                    mangan: "<0.004",
                    chlorki: "15",
                    siarczany: "32",
                    potas: "Brak danych",
                    metnosc: "0.10",
                    barwa: "<2",
                    magnez: "7.65"
                },
                history: []
            },
            {
                name: "SUW Las Gdański",
                coords: [53.1500, 18.1200],
                address: "ul. Gdańska 242",
                data: {
                    pH: "7.9",
                    twardosc: "410",
                    azotany: "2.1",
                    chlor: "Brak danych",
                    fluorki: "0.23",
                    zelazo: "<0.02",
                    mangan: "0.04",
                    chlorki: "29",
                    siarczany: "94",
                    potas: "Brak danych",
                    metnosc: "0.09",
                    barwa: "<5",
                    magnez: "28.9"
                },
                history: []
            }
        ],
        measurementPoints: [],
        zones: {
            "Biedaszkowo": "SUW Czyżkówko",
            "Błonie": "SUW Czyżkówko",
            "Czyżkówko": "SUW Czyżkówko",
            "Flisy": "SUW Czyżkówko",
            "Glinki": "SUW Czyżkówko",
            "Górzyskowo": "SUW Czyżkówko",
            "Jachcice": "SUW Czyżkówko",
            "Kapuściska": "SUW Czyżkówko",
            "Miedzyń": "SUW Czyżkówko",
            "Okole": "SUW Czyżkówko",
            "Opławiec": "SUW Czyżkówko",
            "Osowa Góra": "SUW Czyżkówko",
            "Piaski": "SUW Czyżkówko",
            "Smukała": "SUW Czyżkówko",
            "Szwederowo": "SUW Czyżkówko",
            "Wilczak": "SUW Czyżkówko",
            "Wyżyny": "SUW Czyżkówko",
            "Wzgórze Wolności": "SUW Czyżkówko",
            "Brdyujście": "SUW Las Gdański",
            "Fordon": "SUW Las Gdański",
            "Osiedle Leśne": "SUW Las Gdański",
            "Zimne Wody": "SUW Las Gdański"
        }
    },
    "Toruń": {
        average: { pH: 0, twardosc: 0, azotany: 0, zelazo: 0, fluorki: 0, chlor: 0, chlorki: 0, siarczany: 0, potas: 0, metnosc: 0, barwa: 0, magnez: 0 },
        stations: [
            {
                name: "SUW Przy Kaszowniku",
                coords: [53.0135, 18.5985],
                address: "ul. Przy Kaszowniku 27",
                data: {
                    pH: "7.40",
                    twardosc: "110.4",
                    azotany: "6.3",
                    chlor: "0.036",
                    fluorki: "0.19",
                    zelazo: "0.02",
                    mangan: "0.005",
                    chlorki: "0",
                    siarczany: "0",
                    potas: "0",
                    metnosc: "0.236",
                    barwa: "5",
                    magnez: "0"
                },
                history: []
            }
        ],
        measurementPoints: [
            {
                name: "Punkt Rubinowo",
                coords: [53.0130, 18.6120],
                address: "ul. Niesiołowskiego 8E",
                data: {
                    pH: "7.40",
                    twardosc: "112",
                    azotany: "20",
                    chlor: "0.03",
                    fluorki: "0.17",
                    zelazo: "0.02",
                    mangan: "0.005",
                    chlorki: "0",
                    siarczany: "0",
                    potas: "0",
                    metnosc: "0.20",
                    barwa: "5",
                    magnez: "0"
                }
            },
            {
                name: "Punkt Śródmieście",
                coords: [53.0138, 18.6045],
                address: "ul. Gagarina 152",
                data: {
                    pH: "7.40",
                    twardosc: "108",
                    azotany: "4.2",
                    chlor: "0.04",
                    fluorki: "0.19",
                    zelazo: "0.02",
                    mangan: "0.005",
                    chlorki: "0",
                    siarczany: "0",
                    potas: "0",
                    metnosc: "0.22",
                    barwa: "5",
                    magnez: "0"
                }
            },
            {
                name: "Punkt Bydgoskie",
                coords: [53.0040, 18.5980],
                address: "ul. Parkowa 22",
                data: {
                    pH: "7.40",
                    twardosc: "112",
                    azotany: "4.2",
                    chlor: "0.03",
                    fluorki: "0.19",
                    zelazo: "0.02",
                    mangan: "0.005",
                    chlorki: "0",
                    siarczany: "0",
                    potas: "0",
                    metnosc: "0.22",
                    barwa: "5",
                    magnez: "0"
                }
            }
        ],
        zones: {
            "Barbarka": "SUW Przy Kaszowniku",
            "Bielany": "SUW Przy Kaszowniku",
            "Bielawy": "SUW Przy Kaszowniku",
            "Bydgoskie Przedmieście": "SUW Przy Kaszowniku",
            "Chełmińskie Przedmieście": "SUW Przy Kaszowniku",
            "Czerniewice": "SUW Przy Kaszowniku",
            "Glinki": "SUW Przy Kaszowniku",
            "Grębocin nad Strugą": "SUW Przy Kaszowniku",
            "Jakubskie Przedmieście": "SUW Przy Kaszowniku",
            "Kaszczorek": "SUW Przy Kaszowniku",
            "Katarzynka": "SUW Przy Kaszowniku",
            "Koniuchy": "SUW Przy Kaszowniku",
            "Mokre": "SUW Przy Kaszowniku",
            "Na Skarpie": "SUW Przy Kaszowniku",
            "Piaski": "SUW Przy Kaszowniku",
            "Podgórz": "SUW Przy Kaszowniku",
            "Rubinkowo": "SUW Przy Kaszowniku",
            "Rudak": "SUW Przy Kaszowniku",
            "Rybaki": "SUW Przy Kaszowniku",
            "Stare Miasto": "SUW Przy Kaszowniku",
            "Starotoruńskie Przedmieście": "SUW Przy Kaszowniku",
            "Stawki": "SUW Przy Kaszowniku",
            "Winnica": "SUW Przy Kaszowniku",
            "Wrzosy": "SUW Przy Kaszowniku"
        }
    },
    "Zielona Góra": {
    average: {
        pH: 7.68,
        twardosc: 193.2,
        azotany: 2.3,
        zelazo: 0.05,
        mangan: 0.0044,
        fluorki: 0,
        chlorki: 25.38,
        siarczany: 57.4,
        potas: 0,
        metnosc: 0.308,
        barwa: 6.06,
        magnez: 4.073
    },
    stations: [
        {
            name: "SUW Zawada",
            coords: [51.9550, 15.5000],
            address: "ul. Kożuchowska 35, Zawada",
            data: {
                pH: 7.6,
                twardosc: 126,
                azotany: 2.5,
                fluorki: 0,
                zelazo: 0.05,
                mangan: 0.022,
                chlorki: 3.4,
                siarczany: 0,
                potas: 0,
                metnosc: 0.58,
                barwa: 17,
                magnez: 0
            },
            health: {
                pH: "pH w normie (6.5–9.5) – bezpieczne dla zdrowia.",
                twardosc: "Twardość poniżej optimum (<150 mg/l) – dobra dla cery.",
                azotany: "Azotany w normie (<50 mg/l) – bezpieczne dla dzieci.",
                fluorki: "Fluorki w normie (<1.5 mg/l) – bezpieczne dla zębów.",
                zelazo: "Żelazo w normie (<0.2 mg/l) – nie wpływa na smak ani zdrowie.",
                mangan: "Mangan w normie (<0.05 mg/l) – bezpieczny poziom.",
                chlorki: "Chlorki w normie (<250 mg/l) – nie wpływają na zdrowie.",
                metnosc: "Mętność poniżej normy (<1 NTU) – woda przejrzysta.",
                barwa: "Barwa w normie (<15 mgPt/dm³) – nie wpływa na wygląd wody."
            },
            filterRecommendation: "Wysoki chlor (2.3 mg/l) – zalecamy filtr smakowy (109 zł) dla lepszego smaku wody.",
            history: []
        },
        {
            name: "SUW Zatonie",
            coords: [51.9100, 15.5400],
            address: "Zatonie",
            data: {
                pH: 7.8,
                twardosc: 171,
                azotany: 0.8,
                fluorki: 0,
                zelazo: 0.05,
                mangan: 0,
                chlorki: 14.5,
                siarczany: 38,
                potas: 0,
                metnosc: 0.24,
                barwa: 4.0,
                magnez: 0
            },
            health: {
                pH: "pH w normie (6.5–9.5) – bezpieczne dla zdrowia.",
                twardosc: "Twardość powyżej optimum (<150 mg/l) – może wysuszać cerę, szczególnie u kobiet.",
                azotany: "Brak azotanów – woda bardzo bezpieczna dla dzieci.",
                fluorki: "Fluorki w normie (<1.5 mg/l) – bezpieczne dla zębów.",
                zelazo: "Żelazo w normie (<0.2 mg/l) – nie wpływa na smak ani zdrowie.",
                mangan: "Mangan w normie (<0.05 mg/l) – bezpieczny poziom.",
                chlorki: "Chlorki w normie (<250 mg/l) – nie wpływają na zdrowie.",
                metnosc: "Mętność poniżej normy (<1 NTU) – woda przejrzysta.",
                barwa: "Barwa w normie (<15 mgPt/dm³) – nie wpływa na wygląd wody."
            },
            filterRecommendation: "Wysoki chlor (0.86 mg/l) i umiarkowana twardość (171 mg/l) – zalecamy filtr premium (129 zł) dla pełnej ochrony.",
            history: []
        },
        {
            name: "SUW Ochla",
            coords: [51.8900, 15.4700],
            address: "Ochla",
            data: {
                pH: 7.6,
                twardosc: 268,
                azotany: 4.1,
                fluorki: 0,
                zelazo: 0.05,
                mangan: 0,
                chlorki: 78,
                siarczany: 86,
                potas: 0,
                metnosc: 0.28,
                barwa: 3.3,
                magnez: 10.7
            },
            health: {
                pH: "pH w normie (6.5–9.5) – bezpieczne dla zdrowia.",
                twardosc: "Twardość wysoka (>150 mg/l) – może wysuszać cerę, szczególnie u kobiet.",
                azotany: "Azotany w normie (<50 mg/l) – bezpieczne dla dzieci.",
                fluorki: "Fluorki w normie (<1.5 mg/l) – bezpieczne dla zębów.",
                zelazo: "Żelazo w normie (<0.2 mg/l) – nie wpływa na smak ani zdrowie.",
                mangan: "Mangan w normie (<0.05 mg/l) – bezpieczny poziom.",
                chlorki: "Chlorki w normie (<250 mg/l) – nie wpływają na zdrowie.",
                metnosc: "Mętność poniżej normy (<1 NTU) – woda przejrzysta.",
                barwa: "Barwa w normie (<15 mgPt/dm³) – nie wpływa na wygląd wody."
            },
            filterRecommendation: "Wysoki chlor (4.12 mg/l) i wysoka twardość (268 mg/l) – zalecamy filtr premium (129 zł) dla pełnej ochrony.",
            history: []
        },
        {
            name: "SUW Zacisze",
            coords: [51.9400, 15.5200],
            address: "Zacisze",
            data: {
                pH: 7.8,
                twardosc: 220,
                azotany: 1.3,
                fluorki: 0,
                zelazo: 0.05,
                mangan: 0,
                chlorki: 11,
                siarczany: 64,
                potas: 0,
                metnosc: 0.20,
                barwa: 3.0,
                magnez: 0
            },
            health: {
                pH: "pH w normie (6.5–9.5) – bezpieczne dla zdrowia.",
                twardosc: "Twardość wysoka (>150 mg/l) – może wysuszać cerę, szczególnie u kobiet.",
                azotany: "Azotany w normie (<50 mg/l) – bezpieczne dla dzieci.",
                fluorki: "Fluorki w normie (<1.5 mg/l) – bezpieczne dla zębów.",
                zelazo: "Żelazo w normie (<0.2 mg/l) – nie wpływa na smak ani zdrowie.",
                mangan: "Mangan w normie (<0.05 mg/l) – bezpieczny poziom.",
                chlorki: "Chlorki w normie (<250 mg/l) – nie wpływają na zdrowie.",
                metnosc: "Mętność poniżej normy (<1 NTU) – woda przejrzysta.",
                barwa: "Barwa w normie (<15 mgPt/dm³) – nie wpływa na wygląd wody."
            },
            filterRecommendation: "Wysoki chlor (0.76 mg/l) i wysoka twardość (220 mg/l) – zalecamy filtr premium (129 zł) dla pełnej ochrony.",
            history: []
        },
        {
            name: "SUW Jarogniewice",
            coords: [51.9700, 15.4800],
            address: "Jarogniewice",
            data: {
                pH: 7.6,
                twardosc: 181,
                azotany: 3.6,
                fluorki: 0,
                zelazo: 0.05,
                mangan: 0,
                chlorki: 20.0,
                siarczany: 99,
                potas: 0,
                metnosc: 0.24,
                barwa: 3.0,
                magnez: 9.66
            },
            health: {
                pH: "pH w normie (6.5–9.5) – bezpieczne dla zdrowia.",
                twardosc: "Twardość wysoka (>150 mg/l) – może wysuszać cerę, szczególnie u kobiet.",
                azotany: "Azotany w normie (<50 mg/l) – bezpieczne dla dzieci.",
                fluorki: "Fluorki w normie (<1.5 mg/l) – bezpieczne dla zębów.",
                zelazo: "Żelazo w normie (<0.2 mg/l) – nie wpływa na smak ani zdrowie.",
                mangan: "Mangan w normie (<0.05 mg/l) – bezpieczny poziom.",
                chlorki: "Chlorki w normie (<250 mg/l) – nie wpływają na zdrowie.",
                metnosc: "Mętność poniżej normy (<1 NTU) – woda przejrzysta.",
                barwa: "Barwa w normie (<15 mgPt/dm³) – nie wpływa na wygląd wody."
            },
            filterRecommendation: "Wysoki chlor (0.81 mg/l) i wysoka twardość (181 mg/l) – zalecamy filtr premium (129 zł) dla pełnej ochrony.",
            history: []
        }
    ],
    measurementPoints: [],
    zones: {
        "Zatonie": "SUW Zatonie",
        "Drzonków": "SUW Zatonie",
        "Sucha": "SUW Zatonie",
        "Ługowo": "SUW Zatonie",
        "Barcikowice": "SUW Zatonie",
        "Racula": "SUW Zatonie",
        "Ochla": "SUW Ochla",
        "Kiełpin": "SUW Ochla",
        "Barcikowiczki": "SUW Ochla",
        "Centrum": "SUW Zawada",
        "Osiedle Piastowskie": "SUW Zawada",
        "Osiedle Pomorskie": "SUW Zawada",
        "Osiedle Braniborskie": "SUW Zawada",
        "Osiedle Zastalowskie": "SUW Zawada",
        "Osiedle Łużyckie": "SUW Zawada",
        "Osiedle Przyjaźni": "SUW Zawada",
        "Osiedle Zacisze": "SUW Zacisze",
        "Osiedle Śląskie": "SUW Zatonie",
        "Osiedle Mazurskie": "SUW Zatonie",
        "Osiedle Warmińskie": "SUW Zatonie",
        "Osiedle Kaszubskie": "SUW Zatonie",
        "Osiedle Dolina Zielona": "SUW Zatonie",
        "Osiedle Leśne": "SUW Zatonie",
        "Osiedle Słoneczne": "SUW Zatonie",
        "Osiedle Morelowe": "SUW Zatonie",
        "Osiedle Przylesie": "SUW Zatonie",
        "Osiedle Raculka": "SUW Zatonie"
    },
    info: "Brak szczegółowych danych o strefach zaopatrywania dla większości miasta. Dane dla SUW Zawada (zaopatruje ~60% Zielonej Góry) są domyślne.",
    fun_facts: {
        water_sources: "SUW Zawada korzysta z ujęcia wody z rzeki Obrzycy."
    }
},
"Gorzów Wielkopolski": {
    average: {
        pH: 0,
        twardosc: 0,
        azotany: 0,
        zelazo: 0,
        fluorki: 0,
        chlor: 0,
        chlorki: 0,
        siarczany: 0,
        potas: 0,
        metnosc: 0,
        barwa: 0,
        mangan: 0,
        magnez: 0
    },
    stations: [
        {
            name: "SUW Centralny",
            coords: [52.7325, 15.2369],
            address: "ul. Sikorskiego 1",
            data: {
                pH: "7.4",
                twardosc: "294",
                azotany: "1.10",
                fluorki: "Brak danych",
                zelazo: "<0.040",
                chlor: "0.20",
                mangan: "<0.025",
                chlorki: "32.2",
                siarczany: "Brak danych",
                potas: "Brak danych",
                metnosc: "0.15",
                barwa: "5",
                magnez: "Brak danych"
            },
            history: []
        },
        {
            name: "SUW Kłodawa",
            coords: [52.8000, 15.2167],
            address: "Kłodawa",
            data: {
                pH: "7.3",
                twardosc: "267",
                azotany: "0.82",
                fluorki: "Brak danych",
                zelazo: "<0.040",
                chlor: "0.15",
                mangan: "0.03",
                chlorki: "24.9",
                siarczany: "Brak danych",
                potas: "Brak danych",
                metnosc: "0.16",
                barwa: "<5",
                magnez: "Brak danych"
            },
            history: []
        },
        {
            name: "SUW Siedlice",
            coords: [52.7000, 15.3000],
            address: "Siedlice",
            data: {
                pH: "7.4",
                twardosc: "301",
                azotany: "1.08",
                fluorki: "Brak danych",
                zelazo: "<0.040",
                chlor: "0.05",
                mangan: "<0.025",
                chlorki: "33.6",
                siarczany: "Brak danych",
                potas: "Brak danych",
                metnosc: "0.43",
                barwa: "5",
                magnez: "Brak danych"
            },
            history: []
        },
        {
            name: "SUW Maszewo",
            coords: [52.6833, 15.3833],
            address: "Maszewo",
            data: {
                pH: "7.6",
                twardosc: "183",
                azotany: "0.99",
                fluorki: "Brak danych",
                zelazo: "<0.040",
                chlor: "<0.05",
                mangan: "<0.025",
                chlorki: "12.4",
                siarczany: "Brak danych",
                potas: "Brak danych",
                metnosc: "0.11",
                barwa: "10",
                magnez: "Brak danych"
            },
            history: []
        },
        {
            name: "SUW Kosynierów Gdyńskich",
            coords: [52.7500, 15.2500],
            address: "Kosynierów Gdyńskich",
            data: {
                pH: "7.5",
                twardosc: "412",
                azotany: "1.53",
                fluorki: "Brak danych",
                zelazo: "0.051",
                chlor: "0.16",
                mangan: "<0.025",
                chlorki: "32.2",
                siarczany: "Brak danych",
                potas: "Brak danych",
                metnosc: "0.59",
                barwa: "5",
                magnez: "Brak danych"
            },
            history: []
        },
        {
            name: "SUW Ursus",
            coords: [52.7400, 15.2600],
            address: "Ursus",
            data: {
                pH: "7.4",
                twardosc: "292",
                azotany: "1.02",
                fluorki: "Brak danych",
                zelazo: "<0.040",
                chlor: "<0.05",
                mangan: "<0.025",
                chlorki: "34.3",
                siarczany: "Brak danych",
                potas: "Brak danych",
                metnosc: "0.10",
                barwa: "5",
                magnez: "Brak danych"
            },
            history: []
        },
        {
            name: "SUW Piłsudskiego",
            coords: [52.7600, 15.2700],
            address: "Piłsudskiego",
            data: {
                pH: "7.4",
                twardosc: "294",
                azotany: "1.10",
                fluorki: "Brak danych",
                zelazo: "<0.040",
                chlor: "0.20",
                mangan: "<0.025",
                chlorki: "32.2",
                siarczany: "Brak danych",
                potas: "Brak danych",
                metnosc: "0.15",
                barwa: "5",
                magnez: "Brak danych"
            },
            history: []
        }
    ],
    measurementPoints: [
        {
            name: "Punkt Mickiewicza 50A",
            coords: [52.7320, 15.2400],
            address: "ul. Mickiewicza 50A, Gorzów Wielkopolski",
            data: {
                pH: 7.4,
                twardosc: 289,
                azotany: 1.06,
                fluorki: 0,
                zelazo: 0.04,
                chlor: 0.05,
                mangan: 0.025,
                chlorki: 35.6,
                siarczany: 0,
                potas: 0,
                metnosc: 0.15,
                barwa: 6,
                magnez: 0
            }
        }
    ],
    zones: {
        "Centrum": "SUW Centralny",
        "Śródmieście": "SUW Centralny",
        "Zakanale": "SUW Centralny",
        "Górczyn": "SUW Kosynierów Gdyńskich", // Domyślny SUW dla Górczyna, ale Ursus i Piłsudskiego dostępne w dropdownie
        "Kłodawa": "SUW Kłodawa",
        "Siedlice": "SUW Siedlice",
        "Maszewo": "SUW Maszewo"
    },
    info: "Woda w Gorzowie pochodzi z kilku SUW-ów. Górczyn obejmuje SUW Kosynierów Gdyńskich, Ursus i Piłsudskiego – wybierz w dropdownie, aby porównać dane. Twoja woda pochodzi z najbliższego SUW-a."
},
"Legnica": {
    average: { pH: 0, twardosc: 0, azotany: 0, zelazo: 0, fluorki: 0, chlor: 0, chlorki: 0, siarczany: 0, potas: 0, metnosc: 0, barwa: 0, mangan: 0 },
    stations: [
        {
            name: "ZPW Przybków",
            coords: [51.1833, 16.1333],
            address: "ul. Nowodworska 1, 59-220 Legnica",
            data: {
                pH: "7.3",
                twardosc: "226",
                azotany: "4.8",
                chlor: "0.079",
                fluorki: "0",
                zelazo: "0.015",
                mangan: "0.015",
                chlorki: "0",
                siarczany: "55",
                potas: "0",
                metnosc: "0.12",
                barwa: "2.5",
                magnez: "18"
            },
            history: []
        }
    ],
    measurementPoints: [],
    zones: {
        "Centrum": "ZPW Przybków",
        "Tarninów": "ZPW Przybków",
        "Piekary": "ZPW Przybków",
        "Kartuzy": "ZPW Przybków",
        "Stare Miasto": "ZPW Przybków",
        "Fabryczna": "ZPW Przybków",
        "Złotoryjska": "ZPW Przybków",
        "Bielany": "ZPW Przybków",
        "Osiedle Kopernika": "ZPW Przybków",
        "Osiedle Piekary": "ZPW Przybków",
        "Osiedle Tarninów": "ZPW Przybków",
        "Osiedle Zosinek": "ZPW Przybków",
        "Osiedle Sienkiewicza": "ZPW Przybków",
        "Osiedle Asnyka": "ZPW Przybków",
        "Osiedle Ptasie": "ZPW Przybków",
        "Osiedle Przybyszów": "ZPW Przybków",
        "Osiedle Słoneczne": "ZPW Przybków",
        "Osiedle Nad Stawem": "ZPW Przybków",
        "Osiedle Zielone": "ZPW Przybków"
    },
    info: "Woda w Legnicy pochodzi z ZPW Przybków, uzdatniana z Kaczawy przez stawy infiltracyjne. Brak zones, wszystkie dzielnice przypisane do jedynej stacji."
},
"Radom": {
    average: { pH: 0, twardosc: 0, azotany: 0, zelazo: 0, fluorki: 0, chlor: 0, chlorki: 0, siarczany: 0, potas: 0, metnosc: 0, barwa: 0, mangan: 0 },
    stations: [
        {
            name: "SUW Malczew",
            coords: [51.3800, 21.1300],
            address: "ul. Wiernicka 30, 26-600 Radom",
            data: {
                pH: "7.5",
                twardosc: "218",
                azotany: "0",
                chlor: "0.17",
                fluorki: "0",
                zelazo: "0.033",
                mangan: "0",
                chlorki: "0",
                siarczany: "0",
                potas: "0",
                metnosc: "0.34",
                barwa: "2.5"
            },
            history: []
        },
        {
            name: "SUW Shawnów",
            coords: [51.4050, 21.1750],
            address: "ul. Wapienna 43, 26-600 Radom",
            data: {
                pH: "7.2",
                twardosc: "316",
                azotany: "0",
                chlor: "0.18",
                fluorki: "0",
                zelazo: "0.078",
                mangan: "0",
                chlorki: "0",
                siarczany: "0",
                potas: "0",
                metnosc: "0.65",
                barwa: "2.5"
            },
            history: []
        },
        {
            name: "SUW Potkanów",
            coords: [51.4300, 21.1500],
            address: "ul. Warszawska 15, 26-600 Radom",
            data: {
                pH: "7.3",
                twardosc: "345",
                azotany: "0",
                chlor: "0.22",
                fluorki: "0",
                zelazo: "0.01",
                mangan: "0",
                chlorki: "0",
                siarczany: "0",
                potas: "0",
                metnosc: "0.39",
                barwa: "2.5"
            },
            history: []
        },
        {
            name: "SUW Lesiów",
            coords: [51.4500, 21.2000],
            address: "Lesiów, gm. Jastrzębia",
            data: {
                pH: "7.4",
                twardosc: "354",
                azotany: "0",
                chlor: "0.13",
                fluorki: "0",
                zelazo: "0.01",
                mangan: "0",
                chlorki: "0",
                siarczany: "0",
                potas: "0",
                metnosc: "0.29",
                barwa: "2.5"
            },
            history: []
        },
        {
            name: "SUW Firlej",
            coords: [51.4400, 21.1800],
            address: "ul. Błękitna 18, 26-600 Radom",
            data: {
                pH: "7.2",
                twardosc: "309",
                azotany: "0",
                chlor: "0.28",
                fluorki: "0",
                zelazo: "0.01",
                mangan: "0",
                chlorki: "0",
                siarczany: "0",
                potas: "0",
                metnosc: "0.20",
                barwa: "2.5"
            },
            history: []
        }
    ],
    measurementPoints: [
        {
            name: "Punkt 25-Czerwca",
            coords: [51.4000, 21.1500],
            address: "ul. 25-Czerwca 70, 26-600 Radom",
            data: {
                pH: "7.2",
                twardosc: "342",
                azotany: "0",
                chlor: "0.17",
                fluorki: "0",
                zelazo: "0.01",
                mangan: "0",
                chlorki: "0",
                siarczany: "0",
                potas: "0",
                metnosc: "0.26",
                barwa: "2.5"
            }
        },
        {
            name: "Punkt Obózisko",
            coords: [51.4100, 21.1450],
            address: "ul. Warszawska 2, 26-600 Radom",
            data: {
                pH: "7.7",
                twardosc: "345",
                azotany: "0",
                chlor: "0.15",
                fluorki: "0",
                zelazo: "0.01",
                mangan: "0",
                chlorki: "0",
                siarczany: "0",
                potas: "0",
                metnosc: "0.20",
                barwa: "2.5"
            }
        },
        {
            name: "Punkt Białostocka",
            coords: [51.3900, 21.1700],
            address: "ul. Białostocka 39, 26-600 Radom",
            data: {
                pH: "7.2",
                twardosc: "290",
                azotany: "0",
                chlor: "0.16",
                fluorki: "0",
                zelazo: "0.01",
                mangan: "0",
                chlorki: "0",
                siarczany: "0",
                potas: "0",
                metnosc: "0.25",
                barwa: "2.5"
            }
        }
    ],
    zones: {
        "Malczew": "SUW Malczew",
        "Gołębiów": "SUW Malczew",
        "Zamłynie": "SUW Malczew",
        "Śródmieście": "SUW Malczew",
        "Halinów": "SUW Shawnów",
        "Ustronie": "SUW Shawnów",
        "Wacyn": "SUW Shawnów",
        "Potkanów": "SUW Potkanów",
        "Północ": "SUW Potkanów",
        "Lesiów": "SUW Lesiów",
        "Firlej": "SUW Firlej",
        "Rajec": "SUW Firlej"
    },
    info: "Woda w Radomiu pochodzi z 5 SUW: Malczew, Shawnów, Potkanów, Lesiów i Firlej, zaopatrujących różne dzielnice miasta."
},
"Plock": {
    average: {
        pH: 7.3,
        twardosc: 238,
        azotany: 0.01,
        chlorki: 0.01,
        zelazo: 0.01,
        mangan: 0.01,
        chlor: 0,
        fluorki: 0,
        siarczany: 0,
        potas: 0,
        metnosc: 0,
        barwa: 0,
        magnez: 0
    },
    stations: [
        {
            name: "Wodociąg Płock (ul. Górna 56B)",
            coords: [52.5469, 19.7065],
            address: "ul. Górna 56B, Płock",
            data: {
                pH: 7.3,
                twardosc: 255.5,
                azotany: 0.01,
                chlorki: 0.01,
                zelazo: 0.01,
                mangan: 0.01,
                metnosc: 0.20,
                barwa: 2,
                chlor: 0,
                fluorki: 0,
                potas: 0,
                siarczany: 0,
                magnez: 0
            },
            history: []
        },
        {
            name: "Wodociąg Góry",
            coords: [52.5500, 19.7200],
            address: "Góry, gm. Płock",
            data: {
                pH: 7.3,
                twardosc: 264.5,
                azotany: 0.01,
                chlorki: 0.01,
                zelazo: 0.01,
                mangan: 0.01,
                metnosc: 0.20,
                barwa: 2,
                chlor: 0,
                fluorki: 0,
                potas: 0,
                siarczany: 0,
                magnez: 0
            },
            history: []
        }
    ],
    measurementPoints: [],
    zones: {
        "Śródmieście": "Wodociąg Płock",
        "Podolszyce": "Wodociąg Płock",
        "Międzytorze": "Wodociąg Płock",
        "Radziwie": "Wodociąg Płock",
        "Winiary": "Wodociąg Płock",
        "Imielnica": "Wodociąg Płock",
        "Trzepowo": "Wodociąg Płock",
        "Borowiczki": "Wodociąg Płock",
        "Skarpa": "Wodociąg Płock",
        "Zielony Jar": "Wodociąg Płock",
        "Wielka Płyta": "Wodociąg Płock",
        "Tysiąclecia": "Wodociąg Płock",
        "Podgórze": "Wodociąg Płock",
        "Osiedle Dworcowa": "Wodociąg Płock",
        "Osiedle Kochanowskiego": "Wodociąg Płock",
        "Osiedle Łukasiewicza": "Wodociąg Płock",
        "Osiedle Miodowa": "Wodociąg Płock",
        "Osiedle Skarpa": "Wodociąg Płock",
        "Osiedle Wyszogrodzka": "Wodociąg Płock",
        "Osiedle Zielony Jar": "Wodociąg Płock",
        "Góry": "Wodociąg Góry"
    },
    info: "Woda w Płocku pochodzi z dwóch SUW: Wodociąg Płock i Wodociąg Góry, zaopatrujących całe miasto. Brak danych o chlorkach, azotanach, żelazie i manganie – zalecamy kontakt z Wodociągami Płockimi."
},
"Koszalin": {
    average: {
        pH: 7.8,
        twardosc: 242.5,
        azotany: 0.515,
        chlorki: 29.05,
        zelazo: 0.06,
        mangan: 0.015,
        chlor: 0,
        fluorki: 0,
        siarczany: 0,
        potas: 0,
        metnosc: 0,
        barwa: 0,
        magnez: 0
    },
    stations: [
        {
            name: "SUW Koszalin (Podgórna)",
            coords: [54.1895, 16.1722],
            address: "ul. Podgórna, Koszalin",
            data: {
                pH: 7.7,
                twardosc: 330,
                azotany: 0.47,
                chlorki: 51.3,
                zelazo: 0.06,
                mangan: 7.5,
                metnosc: 0.20,
                barwa: 5,
                siarczany: 89.7,
                olow: 0.10,
                kadm: 0.10,
                chrom: 0.10,
                chlor: 0,
                fluorki: 0,
                potas: 0,
                magnez: 0
            },
            history: []
        },
        {
            name: "SUW Mostowo",
            coords: [54.1500, 16.2000],
            address: "Mostowo, gm. Koszalin",
            data: {
                pH: 7.9,
                twardosc: 155,
                azotany: 0.56,
                chlorki: 6.8,
                zelazo: 0.06,
                mangan: 7.5,
                metnosc: 0.20,
                barwa: 5,
                siarczany: 15.6,
                chlor: 0,
                fluorki: 0,
                potas: 0,
                magnez: 0
            },
            history: []
        }
    ],
    measurementPoints: [
        {
            name: "Punkt kontrolny - ul. Filtrowa 1",
            coords: [54.1900, 16.1700],
            address: "ul. Filtrowa 1, Koszalin",
            data: {
                pH: 7.5,
                twardosc: 319,
                azotany: 0.68,
                chlorki: 36.2,
                zelazo: 0.06,
                mangan: 12.5,
                metnosc: 0.20,
                barwa: 5,
                siarczany: 82.9,
                chlor: 0,
                fluorki: 0,
                potas: 0,
                magnez: 0
            }
        },
        {
            name: "Punkt kontrolny - Góra Chełmska (zbiornik)",
            coords: [54.2000, 16.1800],
            address: "Góra Chełmska, Koszalin",
            data: {
                pH: 7.6,
                twardosc: 210,
                azotany: 0.41,
                chlorki: 39.8,
                zelazo: 0.06,
                mangan: 20,
                metnosc: 0.20,
                barwa: 5,
                siarczany: 92.8,
                chlor: 0,
                fluorki: 0,
                potas: 0,
                magnez: 0
            }
        },
        {
            name: "Punkt kontrolny - ul. Podgórna 28 (hydrofornia)",
            coords: [54.1950, 16.1750],
            address: "ul. Podgórna 28, Koszalin",
            data: {
                pH: 7.5,
                twardosc: 332,
                azotany: 0.68,
                chlorki: 39.8,
                zelazo: 0.06,
                mangan: 13,
                metnosc: 0.20,
                barwa: 5,
                siarczany: 92.8,
                chlor: 0,
                fluorki: 0,
                potas: 0,
                magnez: 0
            }
        },
        {
            name: "Punkt kontrolny - ul. BoWiD 15 (komora)",
            coords: [54.1800, 16.1600],
            address: "ul. BoWiD 15, Koszalin",
            data: {
                pH: 8.2,
                twardosc: 166,
                azotany: 0.68,
                chlorki: 36.2,
                zelazo: 0.06,
                mangan: 13,
                metnosc: 0.20,
                barwa: 5,
                siarczany: 82.9,
                chlor: 0,
                fluorki: 0,
                potas: 0,
                magnez: 0
            }
        },
        {
            name: "Punkt kontrolny - ul. BoWiD – Mieszka I-go (komora)",
            coords: [54.1850, 16.1650],
            address: "ul. BoWiD – Mieszka I-go, Koszalin",
            data: {
                pH: 7.9,
                twardosc: 179,
                azotany: 0.68,
                chlorki: 36.2,
                zelazo: 0.06,
                mangan: 13,
                metnosc: 0.72,
                barwa: 5,
                siarczany: 82.9,
                chlor: 0,
                fluorki: 0,
                potas: 0,
                magnez: 0
            }
        },
        {
            name: "Punkt kontrolny - ul. Niepodległości 44–46 (Szpital)",
            coords: [54.1750, 16.1550],
            address: "ul. Niepodległości 44–46, Koszalin",
            data: {
                pH: 7.3,
                twardosc: 337,
                azotany: 0.68,
                chlorki: 36.2,
                zelazo: 0.06,
                mangan: 13,
                metnosc: 0.20,
                barwa: 5,
                siarczany: 82.9,
                chlor: 0,
                fluorki: 0,
                potas: 0,
                magnez: 0
            }
        },
        {
            name: "Punkt kontrolny - wodociągowa 01000 Manowo",
            coords: [54.1300, 16.2100],
            address: "wodociągowa 01000 Manowo",
            data: {
                pH: 7.8,
                twardosc: 204,
                azotany: 0.68,
                chlorki: 36.2,
                zelazo: 0.06,
                mangan: 13,
                metnosc: 0.20,
                barwa: 5,
                siarczany: 82.9,
                chlor: 0,
                fluorki: 0,
                potas: 0,
                magnez: 0
            }
        },
        {
            name: "Punkt kontrolny - ul. Powstańców Wielkopolskich 14 (hydrofornia)",
            coords: [54.1700, 16.1500],
            address: "ul. Powstańców Wielkopolskich 14, Koszalin",
            data: {
                pH: 7.7,
                twardosc: 216,
                azotany: 0.68,
                chlorki: 36.2,
                zelazo: 0.06,
                mangan: 13,
                metnosc: 0.20,
                barwa: 5,
                siarczany: 82.9,
                chlor: 0,
                fluorki: 0,
                potas: 0,
                magnez: 0
            }
        }
    ],
    zones: {
        "Śródmieście": "SUW Koszalin (Podgórna)",
        "Rokosowo": "SUW Koszalin (Podgórna)",
        "Na Skarpie": "SUW Koszalin (Podgórna)",
        "Przylesie": "SUW Koszalin (Podgórna)",
        "Morskie": "SUW Koszalin (Podgórna)",
        "Lubiatowo": "SUW Koszalin (Podgórna)",
        "Raduszka": "SUW Koszalin (Podgórna)",
        "Kotarwice": "SUW Koszalin (Podgórna)",
        "Jamno": "SUW Koszalin (Podgórna)",
        "Łabusz": "SUW Koszalin (Podgórna)",
        "Wilkowo": "SUW Koszalin (Podgórna)",
        "Kretomino": "SUW Koszalin (Podgórna)",
        "Sarzyno": "SUW Koszalin (Podgórna)",
        "Dzierżęcino": "SUW Koszalin (Podgórna)",
        "Zagórzyno": "SUW Koszalin (Podgórna)",
        "Chełmoniewo": "SUW Koszalin (Podgórna)",
        "Niekłonice": "SUW Koszalin (Podgórna)",
        "Stary Koszalin": "SUW Koszalin (Podgórna)",
        "Nowe Bielice": "SUW Koszalin (Podgórna)",
        "Stare Bielice": "SUW Koszalin (Podgórna)",
        "Mostowo": "SUW Mostowo"
    },
    info: "Woda w Koszalinie pochodzi z dwóch SUW: Koszalin (Podgórna) i Mostowo, zaopatrujących całe miasto."
},
"Olsztyn": {
    average: { pH: 7.46, twardosc: 267.2, azotany: 2.6, zelazo: 0.0378, mangan: 32, chlor: 0, fluorki: 0.378, chlorki: 9.86, siarczany: 15.68, potas: 0, metnosc: 0.144, barwa: 9.2, magnez: 12.4 },
    stations: [
        {
            name: "SUW Karolin",
            coords: [53.765, 20.466],
            address: "ul. Kalinowskiego",
            data: { pH: 7.4, twardosc: 283, azotany: 2.6, zelazo: 0.057, mangan: 48, chlor: 0, fluorki: 0.26, chlorki: 17.9, siarczany: 27, potas: 0, metnosc: 0.21, barwa: 10, magnez: 10 },
            history: []
        },
        {
            name: "SUW Zachód",
            coords: [53.769, 20.452],
            address: "ul. Leśna",
            data: { pH: 7.6, twardosc: 239, azotany: 2.8, zelazo: 0.035, mangan: 27, chlor: 0, fluorki: 0.52, chlorki: 13.2, siarczany: 6, potas: 0, metnosc: 0.14, barwa: 9, magnez: 14 },
            history: []
        },
        {
            name: "SUW Kortowo",
            coords: [53.757, 20.456],
            address: "ul. Słoneczna",
            data: { pH: 7.4, twardosc: 272, azotany: 2.4, zelazo: 0.031, mangan: 26, chlor: 0, fluorki: 0.33, chlorki: 7.6, siarczany: 20.3, potas: 0, metnosc: 0.11, barwa: 8, magnez: 13 },
            history: []
        },
        {
            name: "SUW Jaroty",
            coords: [53.747, 20.475],
            address: "ul. Jarocka",
            data: { pH: 7.4, twardosc: 307, azotany: 2.3, zelazo: 0.037, mangan: 32, chlor: 0, fluorki: 0.27, chlorki: 5.4, siarczany: 20.1, potas: 0, metnosc: 0.14, barwa: 9, magnez: 11 },
            history: []
        },
        {
            name: "SUW Likusy",
            coords: [53.805, 20.465],
            address: "ul. Bałtycka",
            data: { pH: 7.5, twardosc: 235, azotany: 2.9, zelazo: 0.029, mangan: 27, chlor: 0, fluorki: 0.51, chlorki: 5.2, siarczany: 5, potas: 0, metnosc: 0.12, barwa: 10, magnez: 14 },
            history: []
        }
    ],
    measurementPoints: [],
    zones: {
        "Karolin": "SUW Karolin",
        "Wojska Polskiego": "SUW Karolin",
        "Podgrodzie": "SUW Zachód",
        "Zielona Dolina": "SUW Zachód",
        "Kortowo": "SUW Kortowo",
        "Dajtki": "SUW Kortowo",
        "Jaroty": "SUW Jaroty",
        "Pieczewo": "SUW Jaroty",
        "Likusy": "SUW Likusy",
        "Redykajny": "SUW Likusy"
    },
    info: "Dane z PWiK Olsztyn, marzec 2025. Przypisanie do dzielnic oparte na lokalizacji SUW. Twoja woda najprawdopodobniej pochodzi z pokazanej stacji, ale dane mogą się różnić.",
    norms: {
        polish: { pH: "6.5–9.5", twardosc: "60–500", azotany: "<50", zelazo: "<0.2", mangan: "<0.05", chlorki: "<250", metnosc: "<1", barwa: "<15", chlor: "<0.3", fluorki: "<1.5" },
        who: { azotany: "≤50", zelazo: "≤0.3", mangan: "≤0.4", fluorki: "≤1.5" },
        german: { twardosc: "<150", azotany: "≤50", pH: "6.5–9.5" }
    }
},
"Lublin": {
    average: {
        pH: 7.28,
        twardosc: 363.5,
        azotany: 9.46,
        zelazo: 0.051,
        mangan: 0.009,
        chlor: 0.21,
        fluorki: 0.4,
        chlorki: 28.56,
        siarczany: 44.25,
        potas: 0.01,
        metnosc: 0.25,
        barwa: 4.9,
        magnez: 18.05
    },
    stations: [
        {
            name: "SUW Zemborzycka-Dziesiąta",
            coords: [51.185, 22.563],
            address: "ul. Zemborzycka, Lublin",
            data: {
                pH: 7.3,
                twardosc: 332,
                azotany: 11,
                chlor: 0.22,
                fluorki: 0.4,
                zelazo: 0.039,
                mangan: 0.009,
                chlorki: 21.5,
                siarczany: 39,
                potas: 0.01,
                metnosc: 0.19,
                barwa: 4.9,
                magnez: 10.4
            },
            history: []
        },
        {
            name: "SUW Zemborzycka-Stawinek",
            coords: [51.190, 22.570],
            address: "ul. Zemborzycka, Lublin",
            data: {
                pH: 7.4,
                twardosc: 378,
                azotany: 7,
                chlor: 0.23,
                fluorki: 0.4,
                zelazo: 0.039,
                mangan: 0.009,
                chlorki: 28,
                siarczany: 44,
                potas: 0.01,
                metnosc: 0.24,
                barwa: 4.9,
                magnez: 23.2
            },
            history: []
        },
        {
            name: "SUW Choiny",
            coords: [51.200, 22.580],
            address: "ul. Choiny, Lublin",
            data: {
                pH: 7.3,
                twardosc: 354,
                azotany: 12,
                chlor: 0.22,
                fluorki: 0.4,
                zelazo: 0.039,
                mangan: 0.009,
                chlorki: 25,
                siarczany: 42,
                potas: 0.01,
                metnosc: 0.19,
                barwa: 4.9,
                magnez: 11.1
            },
            history: []
        },
        {
            name: "SUW Wrotków",
            coords: [51.210, 22.590],
            address: "ul. Wrotków, Lublin",
            data: {
                pH: 7.3,
                twardosc: 289,
                azotany: 4.9,
                chlor: 0.22,
                fluorki: 0.4,
                zelazo: 0.063,
                mangan: 0.009,
                chlorki: 11,
                siarczany: 15,
                potas: 0.01,
                metnosc: 0.19,
                barwa: 4.9,
                magnez: 13.9
            },
            history: []
        },
        {
            name: "SUW Bursaki",
            coords: [51.220, 22.600],
            address: "ul. Bursaki, Lublin",
            data: {
                pH: 7.3,
                twardosc: 428,
                azotany: 27,
                chlor: 0.14,
                fluorki: 0.4,
                zelazo: 0.039,
                mangan: 0.009,
                chlorki: 43,
                siarczany: 54,
                potas: 0.01,
                metnosc: 0.33,
                barwa: 4.9,
                magnez: 23.3
            },
            history: []
        },
        {
            name: "SUW Ruta",
            coords: [51.230, 22.610],
            address: "ul. Ruta, Lublin",
            data: {
                pH: 7.3,
                twardosc: 324,
                azotany: 10,
                chlor: 0.23,
                fluorki: 0.4,
                zelazo: 0.039,
                mangan: 0.009,
                chlorki: 18,
                siarczany: 37,
                potas: 0.01,
                metnosc: 0.19,
                barwa: 4.9,
                magnez: 9.7
            },
            history: []
        },
        {
            name: "SUW Centralna",
            coords: [51.240, 22.620],
            address: "ul. Centralna, Lublin",
            data: {
                pH: 7.1,
                twardosc: 380,
                azotany: 1.9,
                chlor: 0.22,
                fluorki: 0.4,
                zelazo: 0.067,
                mangan: 0.009,
                chlorki: 34,
                siarczany: 45,
                potas: 0.01,
                metnosc: 0.43,
                barwa: 4.9,
                magnez: 20.6
            },
            history: []
        },
        {
            name: "SUW Mełgiewska",
            coords: [51.250, 22.630],
            address: "ul. Mełgiewska, Lublin",
            data: {
                pH: 7.2,
                twardosc: 423,
                azotany: 1.9,
                chlor: 0.18,
                fluorki: 0.4,
                zelazo: 0.079,
                mangan: 0.009,
                chlorki: 48,
                siarczany: 78,
                potas: 0.01,
                metnosc: 0.19,
                barwa: 4.9,
                magnez: 32.2
            },
            history: []
        }
    ],
    measurementPoints: [],
    zones: {
        "Dziesiąta": "SUW Zemborzycka-Dziesiąta",
        "Kośminek": "SUW Zemborzycka-Dziesiąta",
        "Za Cukrownią": "SUW Zemborzycka-Dziesiąta",
        "Zemborzyce": "SUW Zemborzycka-Stawinek",
        "Głusk": "SUW Zemborzycka-Stawinek",
        "Wieniawa": "SUW Choiny",
        "Kalinowszczyzna": "SUW Choiny",
        "Wrotków": "SUW Wrotków",
        "Bronowice": "SUW Wrotków",
        "Czechów Południowy": "SUW Bursaki",
        "Czechów Północny": "SUW Bursaki",
        "Felin": "SUW Ruta",
        "Hajdów-Zadębie": "SUW Ruta",
        "Śródmieście": "SUW Centralna",
        "Stare Miasto": "SUW Centralna",
        "Tatary": "SUW Mełgiewska",
        "Rury": "SUW Mełgiewska"
    },
    info: "Woda w Lublinie pochodzi z 8 SUW, zaopatrujących różne dzielnice miasta. Średnia twardość jest wysoka – może wysuszać cerę, szczególnie u kobiet (zalecamy filtr zmiękczający 99 zł). Azotany w normie, bezpieczne dla dzieci. Mangan i żelazo niskie, nie wpływają na smak. pH neutralne, bezpieczne."
},
"Częstochowa": {
    average: {
        pH: "0",
        twardosc: "0",
        azotany: "0",
        zelazo: "0",
        fluorki: "0",
        chlor: "0",
        chlorki: "0",
        siarczany: "0",
        potas: "0",
        metnosc: "0",
        barwa: "0",
        mangan: "0",
        magnez: "0"
    },
    stations: [
        {
            name: "SDW Mirów",
            coords: [50.8216, 19.1167],
            address: "Rejon Mirów, 42-208",
            data: {
                pH: "7.6",
                twardosc: "189",
                azotany: "18.2",
                fluorki: "<0.20",
                zelazo: "0.041",
                mangan: "0",
                chlorki: "17.9",
                siarczany: "3.79",
                potas: "1.58",
                metnosc: "0.14",
                barwa: "<5",
                magnez: "1.94",
                chlor: "0"
            },
            history: []
        },
        {
            name: "SUW Wielki Bór",
            coords: [50.8389, 19.1458],
            address: "Ul. Łomżyńska 134, 42-280",
            data: {
                pH: "7.6",
                twardosc: "192",
                azotany: "41.7",
                fluorki: "<0.20",
                zelazo: "0.063",
                mangan: "0",
                chlorki: "26.4",
                siarczany: "78.4",
                potas: "1.18",
                metnosc: "0.33",
                barwa: "<5",
                magnez: "3.41",
                chlor: "0"
            },
            history: []
        },
        {
            name: "SDW Rząsawa",
            coords: [50.7847, 19.0942],
            address: "Rejon Rząsawa, 42-209",
            data: {
                pH: "7.7",
                twardosc: "198",
                azotany: "17.3",
                fluorki: "<0.20",
                zelazo: "0.051",
                mangan: "0",
                chlorki: "23.8",
                siarczany: "58.0",
                potas: "1.52",
                metnosc: "0.29",
                barwa: "<5",
                magnez: "3.28",
                chlor: "0"
            },
            history: []
        },
        {
            name: "SUW Wierzchowisko",
            coords: [50.8733, 19.2233],
            address: "Kolonia Wierzchowisko, 42-233",
            data: {
                pH: "7.5",
                twardosc: "221",
                azotany: "39.2",
                fluorki: "<0.20",
                zelazo: "0.041",
                mangan: "0",
                chlorki: "36.8",
                siarczany: "57.5",
                potas: "1.51",
                metnosc: "0.11",
                barwa: "<5",
                magnez: "3.89",
                chlor: "0"
            },
            history: []
        }
    ],
    measurementPoints: [],
    zones: {
        "Mirów": "SDW Mirów",
        "Podjasnogórska": "SDW Mirów",
        "Śródmieście": "SDW Mirów",
        "Kiedrzyn": "SUW Wielki Bór",
        "Wyczerpy – Aniołów": "SUW Wielki Bór",
        "Północ": "SUW Wielki Bór",
        "Zawodzie – Dąbie": "SDW Rząsawa",
        "Tysiąclecie": "SUW Wierzchowisko"
    },
    info: "Data from the second half of 2024."
}
};

export const bottleData = {
    "Nałęczowianka": {
        wapn: { value: 130, norm: "Korzystna: >150 mg/l", color: "orange", desc: "Wapń: Dobry dla kości, ale trochę mało!" },
        magnez: { value: 24, norm: "Korzystna: >50 mg/l", color: "orange", desc: "Magnez: Pomaga w stresie, ale mogłoby być więcej!" },
        sod: { value: 10, norm: "<20 mg/l (niskosodowa)", color: "green", desc: "Sód: Niski, super dla ciśnienia!" },
        pH: { value: 7.4, norm: "4.5–9.5", color: "green", desc: "pH: Neutralne, spoko dla żołądka!" },
        potas: { value: 5, norm: "<20 mg/l", color: "green", desc: "Potas: W normie, wspiera serce!" },
        fluorki: { value: 0.3, norm: "<1.5 mg/l", color: "green", desc: "Fluorki: W normie, dobre dla zębów!" },
        mikroplastik: { desc: "<span style='color: #ff6200; font-weight: bold;'>Badania (Nature, 2024): każda woda butelkowana ma ~100 cząstek mikroplastiku na litr – filtr to pewność!</span>" }
    },
    "Muszynianka": {
        wapn: { value: 207, norm: "Korzystna: >150 mg/l", color: "green", desc: "Wapń: Super dla kości!" },
        magnez: { value: 37, norm: "Korzystna: >50 mg/l", color: "orange", desc: "Magnez: Pomaga w stresie, ale mogłoby być więcej!" },
        sod: { value: 85, norm: "<20 mg/l (niskosodowa)", color: "orange", desc: "Sód: Trochę za wysoki – filtr eko pomoże!" },
        pH: { value: 5.8, norm: "4.5–9.5", color: "orange", desc: "pH: Lekko kwaśne, może wpływać na smak – filtr smakowy poprawi komfort!" },
        potas: { value: 5, norm: "<20 mg/l", color: "green", desc: "Potas: W normie, wspiera serce!" },
        fluorki: { value: 0.1, norm: "<1.5 mg/l", color: "green", desc: "Fluorki: W normie, dobre dla zębów!" },
        mikroplastik: { desc: "<span style='color: #ff6200; font-weight: bold;'>Badania (Nature, 2024): każda woda butelkowana ma ~100 cząstek mikroplastiku na litr – filtr to pewność!</span>" }
    },
    "Cisowianka": {
        wapn: { value: 122, norm: "Korzystna: >150 mg/l", color: "orange", desc: "Wapń: Dobry dla kości, ale trochę mało!" },
        magnez: { value: 22, norm: "Korzystna: >50 mg/l", color: "orange", desc: "Magnez: OK, ale więcej by pomogło!" },
        sod: { value: 11, norm: "<20 mg/l (niskosodowa)", color: "green", desc: "Sód: Niski, super dla zdrowia!" },
        pH: { value: 7.1, norm: "4.5–9.5", color: "green", desc: "pH: Neutralne, w sam raz!" },
        potas: { value: 3, norm: "<20 mg/l", color: "green", desc: "Potas: W normie, wspiera mięśnie!" },
        fluorki: { value: 0.3, norm: "<1.5 mg/l", color: "green", desc: "Fluorki: W normie, wspiera zęby!" },
        mikroplastik: { desc: "<span style='color: #ff6200; font-weight: bold;'>Badania (Nature, 2024): każda woda butelkowana ma ~100 cząstek mikroplastiku na litr – filtr to pewność!</span>" }
    },
    "Staropolanka": {
        wapn: { value: 96, norm: "Korzystna: >150 mg/l", color: "orange", desc: "Wapń: Trochę za mało dla super efektu!" },
        magnez: { value: 25, norm: "Korzystna: >50 mg/l", color: "orange", desc: "Magnez: OK, ale więcej by pomogło!" },
        sod: { value: 15, norm: "<20 mg/l (niskosodowa)", color: "green", desc: "Sód: Niski, świetny dla zdrowia!" },
        pH: { value: 7.2, norm: "4.5–9.5", color: "green", desc: "pH: Neutralne, w sam raz!" },
        potas: { value: 4, norm: "<20 mg/l", color: "green", desc: "Potas: W normie, wspiera mięśnie!" },
        fluorki: { value: 0.2, norm: "<1.5 mg/l", color: "green", desc: "Fluorki: W normie, wspiera zęby!" },
        mikroplastik: { desc: "<span style='color: #ff6200; font-weight: bold;'>Badania (Nature, 2024): każda woda butelkowana ma ~100 cząstek mikroplastiku na litr – filtr to pewność!</span>" }
    },
    "Żywiec Zdrój": {
        wapn: { value: 50, norm: "Korzystna: >150 mg/l", color: "orange", desc: "Wapń: Trochę za mało dla super efektu!" },
        magnez: { value: 20, norm: "Korzystna: >50 mg/l", color: "orange", desc: "Magnez: OK, ale więcej by pomogło!" },
        sod: { value: 12, norm: "<20 mg/l (niskosodowa)", color: "green", desc: "Sód: Niski, świetny dla zdrowia!" },
        pH: { value: 7.0, norm: "4.5–9.5", color: "green", desc: "pH: Neutralne, w sam raz!" },
        potas: { value: 4, norm: "<20 mg/l", color: "green", desc: "Potas: W normie, wspiera mięśnie!" },
        fluorki: { value: 0.2, norm: "<1.5 mg/l", color: "green", desc: "Fluorki: W normie, wspiera zęby!" },
        mikroplastik: { desc: "<span style='color: #ff6200; font-weight: bold;'>Badania (Nature, 2024): każda woda butelkowana ma ~100 cząstek mikroplastiku na litr – filtr to pewność!</span>" }
    },
    "Polaris": {
        wapn: { value: 82, norm: "Korzystna: >150 mg/l", color: "orange", desc: "Wapń: Trochę za mało dla super efektu!" },
        magnez: { value: 18, norm: "Korzystna: >50 mg/l", color: "orange", desc: "Magnez: Niski, filtr mineralizujący może uzupełnić!" },
        sod: { value: 14, norm: "<20 mg/l (niskosodowa)", color: "green", desc: "Sód: Niski, świetny dla zdrowia!" },
        pH: { value: 7.3, norm: "4.5–9.5", color: "green", desc: "pH: Neutralne, w sam raz!" },
        potas: { value: 3, norm: "<20 mg/l", color: "green", desc: "Potas: W normie, wspiera mięśnie!" },
        fluorki: { value: 0.2, norm: "<1.5 mg/l", color: "green", desc: "Fluorki: W normie, wspiera zęby!" },
        mikroplastik: { desc: "<span style='color: #ff6200; font-weight: bold;'>Badania (Nature, 2024): każda woda butelkowana ma ~100 cząstek mikroplastiku na litr – filtr to pewność!</span>" }
    }
};

export function calculateCityAverages() {
    try {
        for (let city in waterStations) {
            const stations = waterStations[city].stations || [];
            const avg = { pH: 0, twardosc: 0, azotany: 0, zelazo: 0, fluorki: 0, chlor: 0, mangan: 0 };
            const displayValues = { pH: [], twardosc: [], azotany: [], zelazo: [], fluorki: [], chlor: [], mangan: [] };
            const count = stations.length;

            if (count === 0) {
                waterStations[city].average = avg;
                continue;
            }

            stations.forEach(station => {
                const params = ['pH', 'twardosc', 'azotany', 'zelazo', 'fluorki', 'chlor', 'mangan'];
                params.forEach(param => {
                    let value = station.data[param];
                    let displayValue = value;

                    if (typeof value === 'string') {
                        if (value.includes('–')) {
                            const range = value.split('–').map(v => parseFloat(v));
                            value = (range[0] + range[1]) / 2;
                            displayValue = `${value.toFixed(2)}`;
                        } else if (value.includes('<')) {
                            const match = value.match(/<([\d.]+)/);
                            if (match) {
                                const boundary = parseFloat(match[1]);
                                if (param === 'mangan') {
                                    // Wartość w µg/l, więc połowa granicy w µg/l
                                    value = boundary / 2;
                                    displayValue = `<${boundary}`;
                                } else {
                                    value = boundary / 2;
                                    displayValue = `<${boundary}`;
                                }
                            } else {
                                value = 0;
                                displayValue = 'Brak danych';
                            }
                        } else {
                            value = parseFloat(value);
                            displayValue = value;
                        }
                    } else {
                        value = parseFloat(value) || 0;
                        displayValue = value;
                    }

                    avg[param] += value;
                    displayValues[param].push(displayValue);
                });
            });

            const finalAvg = {};
            Object.keys(avg).forEach(param => {
                const values = displayValues[param];
                const allSame = values.every(val => val === values[0]);
                if (allSame && typeof values[0] === 'string' && values[0].includes('<')) {
                    finalAvg[param] = values[0];
                } else {
                    finalAvg[param] = count > 0 ? (avg[param] / count).toFixed(2) : 0;
                }
            });

            waterStations[city].average = finalAvg;

            console.log(`Miasto: ${city}, Średnia twardość: ${waterStations[city].average.twardosc} mg/l, Chlor: ${waterStations[city].average.chlor}, Fluorki: ${waterStations[city].average.fluorki}`);
        }
    } catch (error) {
        console.error('Błąd w calculateCityAverages:', error);
    }
}
calculateCityAverages();

export function checkWater(inputId) {
    let resultDiv; // Deklarujemy zmienną na poziomie funkcji
    try {
      // Przypisujemy wartość w zależności od inputId
      resultDiv = inputId === 'city' ? document.getElementById('city-result') : document.getElementById('bottle-result');
      if (!resultDiv) return;
  
      if (inputId === 'city') {
        const city = document.getElementById('city').value.trim();
        if (!city) {
          resultDiv.innerHTML = "Proszę wpisać miasto!";
          return;
        }
        const data = waterStations[city]?.average;
        if (!data) {
          resultDiv.innerHTML = "Brak danych dla tego miasta.";
          return;
        }
        let result = `<h3>Jakość wody w ${city}</h3>`;
        const selectedParams = getSelectedParameters(data);
        const parameters = selectedParams.map(param => {
          const color = getColor(param.name, param.value);
          const displayValue = param.displayValue === 'Brak danych' ? 'Brak danych' : param.name === 'mangan' ? `${param.displayValue}` : `${param.displayValue} ${param.unit}`;
          return `<div class="parameter"><span class="dot ${color}"></span> ${param.name.charAt(0).toUpperCase() + param.name.slice(1)}: ${displayValue} (norma: ${param.norm}) – ${getParameterDescription(param.name, param.value, color)}</div>`;
        });
        result += `Jakość wody:<br>${parameters.join('')}`;
        if (waterStations[city]?.info) {
          result += `<div class="note">${waterStations[city].info}</div>`;
        }
        resultDiv.innerHTML = result;
      } else if (inputId === 'bottle') {
        const bottle = document.getElementById('bottle').value.trim();
        if (!bottle) {
          resultDiv.innerHTML = "Proszę wpisać nazwę wody butelkowanej!";
          return;
        }
        const data = bottleData[bottle];
        if (!data) {
          resultDiv.innerHTML = "Brak danych dla tej wody butelkowanej.";
          return;
        }
        let result = `<h3>Jakość wody ${bottle}</h3>`;
        const parameters = [
          `<div class="parameter"><span class="dot ${getColor('pH', data.pH.value)}"></span> pH: ${data.pH.value.toFixed(2)} (${data.pH.norm}) – ${data.pH.desc}</div>`,
          `<div class="parameter"><span class="dot ${getColor('wapn', data.wapn.value)}"></span> Wapń: ${data.wapn.value.toFixed(2)} mg/l (${data.wapn.norm}) – ${data.wapn.desc}</div>`,
          `<div class="parameter"><span class="dot ${getColor('magnez', data.magnez.value)}"></span> Magnez: ${data.magnez.value.toFixed(2)} mg/l (${data.magnez.norm}) – ${data.magnez.desc}</div>`,
          `<div class="parameter"><span class="dot ${getColor('sod', data.sod.value)}"></span> Sód: ${data.sod.value.toFixed(2)} mg/l (${data.sod.norm}) – ${data.sod.desc}</div>`,
          `<div class="parameter"><span class="dot ${getColor('fluorki', data.fluorki.value)}"></span> Fluorki: ${data.fluorki.value.toFixed(2)} mg/l (${data.fluorki.norm}) – ${data.fluorki.desc}</div>`,
          `<div class="parameter">${data.mikroplastik.desc}</div>`
        ];
        result += `Jakość wody:<br>${parameters.join('')}`;
        resultDiv.innerHTML = result;
      }
    } catch (error) {
      console.error('Błąd w checkWater:', error);
      if (resultDiv) { // Teraz resultDiv jest zdefiniowane
        resultDiv.innerHTML = "Wystąpił błąd – sprawdź konsolę (F12).";
      }
    }
  }
  export async function findWaterStation() {
    const isPremium = localStorage.getItem('isPremium') === 'true';
    try {
        if (!isPremium) {
            alert('Funkcja dostępna tylko dla użytkowników Premium! Przejdź na Premium za 9,99 zł/mc na https://x.ai/grok.');
            return;
        }

        const streetInput = document.getElementById('street');
        const cityInput = document.getElementById('city-premium');
        const waterInfo = document.getElementById('waterInfo');
        if (!streetInput || !cityInput || !waterInfo) {
            console.error('Brak wymaganych elementów HTML: street, city-premium, waterInfo');
            return;
        }

        const street = streetInput.value.trim();
        const city = cityInput.value.trim();

        if (!city) {
            waterInfo.innerHTML = "Proszę wpisać miasto!";
            return;
        }
        if (!street) {
            waterInfo.innerHTML = "Proszę wpisać ulicę!";
            return;
        }

        const stations = waterStations[city]?.stations || [];
        const measurementPoints = waterStations[city]?.measurementPoints || [];
        const zones = waterStations[city]?.zones || null;
        if (stations.length === 0 && measurementPoints.length === 0) {
            if (city.toLowerCase() === 'wałbrzych' || city.toLowerCase() === 'walbrzych') {
                waterInfo.innerHTML = "Odmowa podania danych przez Wałbrzyskie Przedsiębiorstwo Wodociągów i Kanalizacji Sp. z o.o.";
                return;
            }
            if (waterStations[city]?.info) {
                waterInfo.innerHTML = waterStations[city].info;
            } else {
                waterInfo.innerHTML = "Brak danych dla tego miasta.";
            }
            return;
        }

        const mapElement = document.getElementById('map');
        if (!mapElement || !window.map) {
            console.error('Mapa nie jest zainicjalizowana: brak elementu #map lub obiektu window.map');
            waterInfo.innerHTML += '<p>Problem z załadowaniem mapy – sprawdź konsolę (F12).</p>';
            return;
        }

        mapElement.style.display = 'block';
        let userLat = 52.7325, userLon = 15.2369;
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(street + ', ' + city + ', Polska')}&format=json&limit=1`);
        const data = await response.json();
        if (data.length > 0) {
            userLat = parseFloat(data[0].lat);
            userLon = parseFloat(data[0].lon);
            console.log(`Geokodowanie udane: ${street}, ${city} -> [${userLat}, ${userLon}]`);
        } else {
            console.warn(`Geokodowanie nieudane dla: ${street}, ${city}. Używam domyślnych współrzędnych.`);
        }

        window.map.setView([userLat, userLon], 14);
        window.map.invalidateSize();
        window.map.eachLayer(layer => {
            if (layer instanceof L.Marker) window.map.removeLayer(layer);
        });
        L.marker([userLat, userLon]).addTo(window.map).bindPopup(`Lokalizacja: ${street}, ${city}`).openPopup();

        let closestStation = null;
        let minStationDistance = Infinity;
        stations.forEach(station => {
            const distance = parseFloat(getDistance(userLat, userLon, station.coords[0], station.coords[1]));
            if (distance < minStationDistance) {
                minStationDistance = distance;
                closestStation = station;
            }
        });

        let closestPoint = null;
        let minPointDistance = Infinity;
        measurementPoints.forEach(point => {
            const distance = parseFloat(getDistance(userLat, userLon, point.coords[0], point.coords[1]));
            if (distance < minPointDistance) {
                minPointDistance = distance;
                closestPoint = point;
            }
        });

        let waterInfoHTML = `<h3>Wyniki dla adresu: ${street}, ${city}</h3>`;
        if (closestStation) {
            window.map.setView(closestStation.coords, 14);
            L.marker(closestStation.coords).addTo(window.map).bindPopup(`${closestStation.name} (${closestStation.address})`).openPopup();

            const params = {
                pH: parseFloat(closestStation.data.pH) || 0,
                twardosc: parseFloat(closestStation.data.twardosc) || 0,
                azotany: parseFloat(closestStation.data.azotany) || 0,
                metnosc: parseFloat(closestStation.data.metnosc) || 0,
                chlor: parseFloat(closestStation.data.chlor) || 0,
                fluorki: parseFloat(closestStation.data.fluorki) || 0,
                zelazo: parseFloat(closestStation.data.zelazo) || 0,
                mangan: parseFloat(closestStation.data.mangan) || 0,
                chlorki: parseFloat(closestStation.data.chlorki) || 0,
                siarczany: parseFloat(closestStation.data.siarczany) || 0,
                barwa: parseFloat(closestStation.data.barwa) || 0,
                magnez: parseFloat(closestStation.data.magnez) || 0,
                potas: parseFloat(closestStation.data.potas) || 0
            };

            const basicParams = getSelectedParameters(params);
            const premiumParams = getPremiumParameters(params);
            const allParams = [...basicParams, ...premiumParams];
            const parameters = allParams.map(param => {
                const normUnit = param.name === 'mangan' ? ' µg/l' : param.name === 'metnosc' ? ' NTU' : param.name === 'barwa' ? ' mgPt/dm³' : ' mg/l';
                const color = getColor(param.name, param.value);
                const displayValue = param.displayValue === 'Brak danych' ? 'Brak danych' : param.name === 'mangan' ? `${param.displayValue}` : `${param.displayValue} ${param.unit}`;
                return `<div class="parameter"><span class="dot ${color}"></span> ${param.name.charAt(0).toUpperCase() + param.name.slice(1)}: ${displayValue} (norma: ${param.norm}${normUnit}) – ${getParameterDescription(param.name, param.value, color)}</div>`;
            });

            waterInfoHTML += `<h4>Najbliższa stacja SUW: ${closestStation.name} (${closestStation.address})</h4><p>Odległość: ${minStationDistance} km</p><p class="note">To najbliższa stacja uzdatniania wody na podstawie Twojej lokalizacji.</p>Jakość wody:<br>${parameters.join('')}`;
            const filterRec = suggestWaterFilter(params);
            waterInfoHTML += `<p><strong>Rekomendacja:</strong> ${filterRec.summary}</p>`;
        } else {
            waterInfoHTML += `<p>Brak stacji SUW dla tego miasta.</p>`;
        }

        if (closestPoint) {
            const pointParams = {
                pH: parseFloat(closestPoint.data.pH) || 0,
                twardosc: parseFloat(closestPoint.data.twardosc) || 0,
                azotany: parseFloat(closestPoint.data.azotany) || 0,
                metnosc: parseFloat(closestPoint.data.metnosc) || 0,
                chlor: parseFloat(closestPoint.data.chlor) || 0,
                fluorki: parseFloat(closestPoint.data.fluorki) || 0,
                zelazo: parseFloat(closestPoint.data.zelazo) || 0,
                mangan: parseFloat(closestPoint.data.mangan) || 0,
                chlorki: parseFloat(closestPoint.data.chlorki) || 0,
                siarczany: parseFloat(closestPoint.data.siarczany) || 0,
                barwa: parseFloat(closestPoint.data.barwa) || 0,
                magnez: parseFloat(closestPoint.data.magnez) || 0,
                potas: parseFloat(closestPoint.data.potas) || 0
            };

            const pointBasicParams = getSelectedParameters(pointParams);
            const pointPremiumParams = getPremiumParameters(pointParams);
            const pointAllParams = [...pointBasicParams, ...pointPremiumParams];
            const pointParameters = pointAllParams.map(param => {
                const normUnit = param.name === 'mangan' ? ' µg/l' : param.name === 'metnosc' ? ' NTU' : param.name === 'barwa' ? ' mgPt/dm³' : ' mg/l';
                const color = getColor(param.name, param.value);
                const displayValue = param.displayValue === 'Brak danych' ? 'Brak danych' : param.name === 'mangan' ? `${param.displayValue}` : `${param.displayValue} ${param.unit}`;
                return `<div class="parameter"><span class="dot ${color}"></span> ${param.name.charAt(0).toUpperCase() + param.name.slice(1)}: ${displayValue} (norma: ${param.norm}${normUnit}) – ${getParameterDescription(param.name, param.value, color)}</div>`;
            });

            waterInfoHTML += `<h4>Najbliższy punkt pomiarowy: ${closestPoint.name} (${closestPoint.address})</h4><p>Odległość: ${minPointDistance} km</p><p class="note">Dane z punktów pomiarowych mogą być bardziej precyzyjne dla Twojej lokalizacji.</p>Jakość wody:<br>${pointParameters.join('')}`;
            const pointFilterRec = suggestWaterFilter(pointParams);
            waterInfoHTML += `<p><strong>Rekomendacja:</strong> ${pointFilterRec.summary}</p>`;
            L.marker(closestPoint.coords).addTo(window.map).bindPopup(`${closestPoint.name} (${closestPoint.address})`);
        } else {
            waterInfoHTML += `<p>Brak punktów pomiarowych dla tego miasta.</p>`;
        }

        if (zones && Object.keys(zones).length > 0) {
            waterInfoHTML += `
                <p class="note">Jeśli chcesz zobaczyć dane dla innej dzielnicy, wybierz ją poniżej:</p>
                <select id="district-select">
                    <option value="">Wybierz dzielnicę (opcjonalne)</option>
                    ${Object.keys(zones).map(z => `<option value="${z}">${z}</option>`).join('')}
                </select>
                <button id="show-district-data">Pokaż dane dla wybranej dzielnicy</button>
                <div id="station-info"></div>
            `;
        }

        waterInfo.innerHTML = waterInfoHTML;

        const showDistrictButton = document.getElementById('show-district-data');
        if (showDistrictButton) {
            const newButton = showDistrictButton.cloneNode(true);
            showDistrictButton.parentNode.replaceChild(newButton, showDistrictButton);
            newButton.addEventListener('click', () => showDistrictData(userLat, userLon));
        }
    } catch (error) {
        console.error('Błąd w findWaterStation:', error);
        document.getElementById('waterInfo').innerHTML = "Wystąpił błąd – sprawdź konsolę (F12).";
    }
}

export function showDistrictData(userLat, userLon) {
    try {
        const city = document.getElementById('city-premium')?.value?.trim();
        const districtSelect = document.getElementById('district-select');
        const stationInfo = document.getElementById('station-info');
        if (!city || !districtSelect || !stationInfo) {
            console.error('Brak wymaganych elementów HTML: city-premium, district-select, station-info');
            return;
        }

        const selectedDistrict = districtSelect.value;
        if (!selectedDistrict) {
            stationInfo.innerHTML = '<p>Proszę wybrać dzielnicę!</p>';
            return;
        }

        const stations = waterStations[city]?.stations || [];
        const measurementPoints = waterStations[city]?.measurementPoints || [];
        const zones = waterStations[city]?.zones || {};
        const stationName = zones[selectedDistrict];
        const station = stations.find(s => s.name === stationName);

        if (!station) {
            stationInfo.innerHTML = '<p>Brak danych dla wybranej dzielnicy!</p>';
            return;
        }

        const distance = parseFloat(getDistance(userLat, userLon, station.coords[0], station.coords[1]));
        window.map.setView(station.coords, 14);
        window.map.eachLayer(layer => {
            if (layer instanceof L.Marker) window.map.removeLayer(layer);
        });
        L.marker(station.coords).addTo(window.map).bindPopup(`${station.name} (${station.address})`).openPopup();
        L.marker([userLat, userLon]).addTo(window.map).bindPopup(`Twoja lokalizacja: ${document.getElementById('street').value.trim()}, ${city}`);

        const params = {
            pH: parseFloat(station.data.pH) || 0,
            twardosc: parseFloat(station.data.twardosc) || 0,
            azotany: parseFloat(station.data.azotany) || 0,
            metnosc: parseFloat(station.data.metnosc) || 0,
            chlor: parseFloat(station.data.chlor) || 0,
            fluorki: parseFloat(station.data.fluorki) || 0,
            zelazo: parseFloat(station.data.zelazo) || 0,
            mangan: parseFloat(station.data.mangan) || 0,
            chlorki: parseFloat(station.data.chlorki) || 0,
            siarczany: parseFloat(station.data.siarczany) || 0,
            barwa: parseFloat(station.data.barwa) || 0,
            magnez: parseFloat(station.data.magnez) || 0,
            potas: parseFloat(station.data.potas) || 0
        };

        const basicParams = getSelectedParameters(params);
        const premiumParams = getPremiumParameters(params);
        const allParams = [...basicParams, ...premiumParams];
        const parameters = allParams.map(param => {
            const normUnit = param.name === 'mangan' ? ' µg/l' : param.name === 'metnosc' ? ' NTU' : param.name === 'barwa' ? ' mgPt/dm³' : ' mg/l';
            const color = getColor(param.name, param.value);
            const displayValue = param.displayValue === 'Brak danych' ? 'Brak danych' : param.name === 'mangan' ? param.displayValue : `${param.displayValue} ${param.unit}`;
            return `<div class="parameter"><span class="dot ${color}"></span> ${param.name.charAt(0).toUpperCase() + param.name.slice(1)}: ${displayValue} (norma: ${param.norm}${normUnit}) – ${getParameterDescription(param.name, param.value, color)}</div>`;
        });

        let result = `<h4>Stacja SUW dla dzielnicy ${selectedDistrict}: ${station.name} (${station.address})</h4><p>Odległość: ${distance} km</p><p class="note">Dane dla wybranej dzielnicy mogą różnić się od domyślnych wyników powyżej.</p>Jakość wody:<br>${parameters.join('')}`;
        const filterRec = suggestWaterFilter(params);
        result += `<p><strong>Rekomendacja:</strong> ${filterRec.summary}</p>`;

        let closestPoint = null;
        let minPointDistance = Infinity;
        const relevantPoints = measurementPoints.filter(point => {
            const pointDistricts = Object.keys(zones).filter(d => zones[d] === stationName);
            return pointDistricts.includes(selectedDistrict);
        });
        relevantPoints.forEach(point => {
            const distance = parseFloat(getDistance(userLat, userLon, point.coords[0], point.coords[1]));
            if (distance < minPointDistance) {
                minPointDistance = distance;
                closestPoint = point;
            }
        });

        if (closestPoint) {
            const pointParams = {
                pH: parseFloat(closestPoint.data.pH) || 0,
                twardosc: parseFloat(closestPoint.data.twardosc) || 0,
                azotany: parseFloat(closestPoint.data.azotany) || 0,
                metnosc: parseFloat(closestPoint.data.metnosc) || 0,
                chlor: parseFloat(closestPoint.data.chlor) || 0,
                fluorki: parseFloat(closestPoint.data.fluorki) || 0,
                zelazo: parseFloat(closestPoint.data.zelazo) || 0,
                mangan: parseFloat(closestPoint.data.mangan) || 0,
                chlorki: parseFloat(closestPoint.data.chlorki) || 0,
                siarczany: parseFloat(closestPoint.data.siarczany) || 0,
                barwa: parseFloat(closestPoint.data.barwa) || 0,
                magnez: parseFloat(closestPoint.data.magnez) || 0,
                potas: parseFloat(closestPoint.data.potas) || 0
            };

            const pointBasicParams = getSelectedParameters(pointParams);
            const pointPremiumParams = getPremiumParameters(pointParams);
            const pointAllParams = [...pointBasicParams, ...pointPremiumParams];
            const pointParameters = pointAllParams.map(param => {
                const normUnit = param.name === 'mangan' ? ' µg/l' : param.name === 'metnosc' ? ' NTU' : param.name === 'barwa' ? ' mgPt/dm³' : ' mg/l';
                const color = getColor(param.name, param.value);
                const displayValue = param.displayValue === 'Brak danych' ? 'Brak danych' : param.name === 'mangan' ? param.displayValue : `${param.displayValue} ${param.unit}`;
                return `<div class="parameter"><span class="dot ${color}"></span> ${param.name.charAt(0).toUpperCase() + param.name.slice(1)}: ${displayValue} (norma: ${param.norm}${normUnit}) – ${getParameterDescription(param.name, param.value, color)}</div>`;
            });

            result += `<h4>Najbliższy punkt pomiarowy w dzielnicy ${selectedDistrict}: ${closestPoint.name} (${closestPoint.address})</h4><p>Odległość: ${minPointDistance} km</p><p class="note">Dane z punktów pomiarowych mogą być bardziej precyzyjne dla Twojej lokalizacji.</p>Jakość wody:<br>${pointParameters.join('')}`;
            const pointFilterRec = suggestWaterFilter(pointParams);
            result += `<p><strong>Rekomendacja:</strong> ${pointFilterRec.summary}</p>`;
            L.marker(closestPoint.coords).addTo(window.map).bindPopup(`${closestPoint.name} (${closestPoint.address})`);
        }

        result += '<div class="note">Dane zależą od wodociągów. Skontaktuj się z nimi dla dokładniejszych informacji.</div>';
        stationInfo.innerHTML = result;
    } catch (error) {
        console.error('Błąd w showDistrictData:', error);
        document.getElementById('station-info').innerHTML = "Wystąpił błąd – sprawdź konsolę (F12).";
    }
}
export function showAllSUW() {
    const isPremium = localStorage.getItem('isPremium') === 'true';
    try {
        if (!isPremium) {
            alert('Funkcja dostępna tylko dla użytkowników Premium! Przejdź na Premium za 9,99 zł/mc na https://x.ai/grok.');
            return;
        }

        const city = document.getElementById('city-premium')?.value?.trim();
        const waterInfo = document.getElementById('waterInfo');
        if (!city || !waterInfo) {
            console.error('Brak wymaganych elementów HTML: city-premium, waterInfo');
            return;
        }

        const stations = waterStations[city]?.stations || [];
        const measurementPoints = waterStations[city]?.measurementPoints || [];
        if (stations.length === 0 && measurementPoints.length === 0) {
            if (waterStations[city]?.info) {
                waterInfo.innerHTML = waterStations[city].info;
            } else {
                waterInfo.innerHTML = "Brak danych dla tego miasta.";
            }
            return;
        }

        let result = `<h3>Wyniki dla miasta: ${city}</h3>`;
        if (stations.length === 1) {
            result += `<p>To miasto ma tylko jeden SUW – dane poniżej.</p>`;
        }

        stations.forEach(station => {
            const params = {
                pH: parseFloat(station.data.pH) || 0,
                twardosc: parseFloat(station.data.twardosc) || 0,
                azotany: parseFloat(station.data.azotany) || 0,
                metnosc: parseFloat(station.data.metnosc) || 0,
                chlor: parseFloat(station.data.chlor) || 0,
                mangan: parseFloat(station.data.mangan) || 0,
                zelazo: parseFloat(station.data.zelazo) || 0,
                fluorki: parseFloat(station.data.fluorki) || 0
            };
            const selectedParams = getSelectedParameters(params);
            const sixthParam = selectedParams.find(param => param.name === 'mangan') ? 'mangan' : selectedParams.find(param => param.name === 'zelazo') ? 'zelazo' : 'fluorki';
            const sixthParamData = selectedParams.find(param => param.name === sixthParam);
            const parameters = [
                `<div class="parameter"><span class="dot ${getColor('pH', params.pH)}"></span> pH: ${params.pH.toFixed(2)} (norma: 6.5–9.5) – ${getParameterDescription('pH', params.pH, getColor('pH', params.pH))}</div>`,
                `<div class="parameter"><span class="dot ${getColor('twardosc', params.twardosc)}"></span> Twardość: ${params.twardosc.toFixed(2)} mg/l (norma: 60–500) – ${getParameterDescription('twardosc', params.twardosc, getColor('twardosc', params.twardosc))}</div>`,
                `<div class="parameter"><span class="dot ${getColor('azotany', params.azotany)}"></span> Azotany: ${params.azotany.toFixed(2)} mg/l (norma: <50) – ${getParameterDescription('azotany', params.azotany, getColor('azotany', params.azotany))}</div>`,
                `<div class="parameter"><span class="dot ${getColor('metnosc', params.metnosc)}"></span> Mętność: ${params.metnosc.toFixed(2)} NTU (norma: <1) – ${getParameterDescription('metnosc', params.metnosc, getColor('metnosc', params.metnosc))}</div>`,
                `<div class="parameter"><span class="dot ${getColor('chlor', params.chlor)}"></span> Chlor wolny: ${params.chlor.toFixed(2)} mg/l (norma: <0.3) – ${getParameterDescription('chlor', params.chlor, getColor('chlor', params.chlor))}</div>`,
                isPremium && !sixthParamData
                    ? `<div class="parameter">${sixthParam.charAt(0).toUpperCase() + sixthParam.slice(1)}: Brak danych</div>`
                    : `<div class="parameter"><span class="dot ${getColor(sixthParam, sixthParamData.value)}"></span> ${sixthParam.charAt(0).toUpperCase() + sixthParam.slice(1)}: ${sixthParamData.displayValue} (norma: ${sixthParamData.norm}${sixthParam === 'mangan' ? ' µg/l' : sixthParamData.unit ? ` ${sixthParamData.unit}` : ''}) – ${getParameterDescription(sixthParam, sixthParamData.value, getColor(sixthParam, sixthParamData.value))}</div>`
            ];
            result += `<h4>Stacja SUW: ${station.name} (${station.address})</h4>Jakość wody:<br>${parameters.join('')}`;
            const filterRec = suggestWaterFilter(params);
            result += `<p><strong>Rekomendacja:</strong> ${filterRec.summary}</p>`;
        });

        waterInfo.innerHTML = result;
    } catch (error) {
        console.error('Błąd w showAllSUW:', error);
        document.getElementById('waterInfo').innerHTML = "Wystąpił błąd – sprawdź konsolę (F12).";
    }
}


export function showAllMeasurementPoints() {
    try {
        const city = document.getElementById('city-premium')?.value?.trim();
        const waterInfo = document.getElementById('waterInfo');
        if (!city || !waterInfo) {
            console.error('Brak wymaganych elementów HTML: city-premium, waterInfo');
            return;
        }

        const measurementPoints = waterStations[city]?.measurementPoints || [];
        if (measurementPoints.length === 0) {
            if (waterStations[city]?.info) {
                waterInfo.innerHTML = waterStations[city].info;
            } else {
                waterInfo.innerHTML = "Brak punktów pomiarowych dla tego miasta.";
            }
            return;
        }

        let result = `<h3>Punkty pomiarowe w ${city}</h3>`;
        measurementPoints.forEach(point => {
            const params = point.data;
            const parameters = [
                `<div class="parameter"><span class="dot ${getColor('pH', params.pH)}"></span> pH: ${params.pH} (norma: 6.5–9.5) – ${getParameterDescription('pH', params.pH, getColor('pH', params.pH), params.azotany)}</div>`,
                `<div class="parameter"><span class="dot ${getColor('twardosc', params.twardosc)}"></span> Twardość: ${params.twardosc} mg/l (optymalnie: <120 mg/l) – ${getParameterDescription('twardosc', params.twardosc, getColor('twardosc', params.twardosc), params.azotany)}</div>`,
                `<div class="parameter"><span class="dot ${getColor('azotany', params.azotany)}"></span> Azotany: ${params.azotany} mg/l (norma: <50 mg/l) – ${getParameterDescription('azotany', params.azotany, getColor('azotany', params.azotany), params.azotany)}</div>`,
                `<div class="parameter"><span class="dot ${getColor('chlor', params.chlor)}"></span> Chlor wolny: ${params.chlor} mg/l (norma: <0.3 mg/l) – ${getParameterDescription('chlor', params.chlor, getColor('chlor', params.chlor), params.azotany)}</div>`,
                `<div class="parameter"><span class="dot ${getColor('fluorki', params.fluorki)}"></span> Fluorki: ${params.fluorki} mg/l (norma: <1.5 mg/l) – ${getParameterDescription('fluorki', params.fluorki, getColor('fluorki', params.fluorki), params.azotany)}</div>`,
                `<div class="parameter"><span class="dot ${getColor('zelazo', params.zelazo)}"></span> Żelazo: ${params.zelazo} mg/l (norma: <0.2 mg/l) – ${getParameterDescription('zelazo', params.zelazo, getColor('zelazo', params.zelazo), params.azotany)}</div>`,
                `<div class="parameter"><span class="dot ${getColor('mangan', params.mangan)}"></span> Mangan: ${params.mangan} (norma: <50 µg/l) – ${getParameterDescription('mangan', params.mangan, getColor('mangan', params.mangan), params.azotany)}</div>`,
                `<div class="parameter"><span class="dot ${getColor('chlorki', params.chlorki)}"></span> Chlorki: ${params.chlorki} mg/l (norma: <250 mg/l) – ${getParameterDescription('chlorki', params.chlorki, getColor('chlorki', params.chlorki), params.azotany)}</div>`,
                `<div class="parameter"><span class="dot ${getColor('metnosc', params.metnosc)}"></span> Mętność: ${params.metnosc} NTU (norma: <1 NTU) – ${getParameterDescription('metnosc', params.metnosc, getColor('metnosc', params.metnosc), params.azotany)}</div>`,
                `<div class="parameter"><span class="dot ${getColor('barwa', params.barwa)}"></span> Barwa: ${params.barwa} mgPt/dm³ (norma: <15 mgPt/dm³) – ${getParameterDescription('barwa', params.barwa, getColor('barwa', params.barwa), params.azotany)}</div>`
            ];
            result += `<h4>Punkt pomiarowy: ${point.name} (${point.address})</h4>Jakość wody:<br>${parameters.join('')}`;
        });

        waterInfo.innerHTML = result;
    } catch (error) {
        console.error('Błąd w showAllMeasurementPoints:', error);
        document.getElementById('waterInfo').innerHTML = "Wystąpił błąd – sprawdź konsolę (F12).";
    }
}

export function displayHistory() {
    try {
        const city = document.getElementById('city-premium')?.value?.trim();
        const waterInfo = document.getElementById('waterInfo');
        if (!city || !waterInfo) {
            console.error('Brak wymaganych elementów HTML: city-premium, waterInfo');
            return;
        }

        const stations = waterStations[city]?.stations || [];
        if (stations.length === 0) {
            if (waterStations[city]?.info) {
                waterInfo.innerHTML = waterStations[city].info;
            } else {
                waterInfo.innerHTML = "Brak danych dla tego miasta.";
            }
            return;
        }

        let result = `<h3>Historia pomiarów w ${city}</h3>`;
        stations.forEach(station => {
            result += `<h4>${station.name} (${station.address})</h4>`;
            if (station.history && station.history.length > 0) {
                station.history.forEach(entry => {
                    const parameters = [
                        `<div class="parameter"><span class="dot"></span> pH: ${entry.pH} (norma: 6.5–9.5) – ${getParameterDescription('pH', entry.pH, null, entry.azotany)}</div>`,
                        `<div class="parameter"><span class="dot"></span> Twardość: ${entry.twardosc} mg/l (optymalnie: <120 mg/l) – ${getParameterDescription('twardosc', entry.twardosc, null, entry.azotany)}</div>`,
                        `<div class="parameter"><span class="dot"></span> Azotany: ${entry.azotany} mg/l (norma: <50 mg/l) – ${getParameterDescription('azotany', entry.azotany, null, entry.azotany)}</div>`,
                        `<div class="parameter"><span class="dot"></span> Chlor wolny: ${entry.chlor} mg/l (norma: <0.3 mg/l) – ${getParameterDescription('chlor', entry.chlor, null, entry.azotany)}</div>`,
                        `<div class="parameter"><span class="dot"></span> Fluorki: ${entry.fluorki} mg/l (norma: <1.5 mg/l) – ${getParameterDescription('fluorki', entry.fluorki, null, entry.azotany)}</div>`,
                        `<div class="parameter"><span class="dot"></span> Żelazo: ${entry.zelazo} mg/l (norma: <0.2 mg/l) – ${getParameterDescription('zelazo', entry.zelazo, null, entry.azotany)}</div>`,
                        `<div class="parameter"><span class="dot"></span> Mangan: ${entry.mangan} µg/l (norma: <50 µg/l) – ${getParameterDescription('mangan', entry.mangan, null, entry.azotany)}</div>`,
                        `<div class="parameter"><span class="dot"></span> Chlorki: ${entry.chlorki} mg/l (norma: <250 mg/l) – ${getParameterDescription('chlorki', entry.chlorki, null, entry.azotany)}</div>`,
                        `<div class="parameter"><span class="dot"></span> Mętność: ${entry.metnosc} NTU (norma: <1 NTU) – ${getParameterDescription('metnosc', entry.metnosc, null, entry.azotany)}</div>`,
                        `<div class="parameter"><span class="dot"></span> Barwa: ${entry.barwa} mgPt/dm³ (norma: <15 mgPt/dm³) – ${getParameterDescription('barwa', entry.barwa, null, entry.azotany)}</div>`
                    ];
                    result += `<p>Data: ${entry.date}</p>Jakość wody:<br>${parameters.join('')}`;
                });
            } else {
                result += `<p>Brak historii pomiarów dla tej stacji.</p>`;
            }
        });

        waterInfo.innerHTML = result;

        waterInfo.querySelectorAll('.parameter').forEach(paramDiv => {
            const text = paramDiv.textContent;
            const colorMatch = text.match(/red-dot|orange-dot|green-dot/);
            if (colorMatch) {
                const dot = paramDiv.querySelector('.dot');
                if (dot) dot.classList.add(colorMatch[0]);
            }
        });
    } catch (error) {
        console.error('Błąd w displayHistory:', error);
        document.getElementById('waterInfo').innerHTML = "Wystąpił błąd – sprawdź konsolę (F12).";
    }
}
delete waterStations['Płock'];