import { getColor, getParameterDescription } from './utils.js';

export let map = null;

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
        ]
    },
    "Wałbrzych": {
        average: { pH: 0, twardosc: 0, azotany: 0, zelazo: 0, fluorki: 0, chlor: 0, chlorki: 0, siarczany: 0, potas: 0, metnosc: 0, barwa: 0, mangan: 0 },
        stations: [
            {
                name: "Brak danych",
                coords: [50.7714, 16.2843],
                address: "Wałbrzyskie Przedsiębiorstwo Wodociągów i Kanalizacji Sp. z o.o., ul. Zatorze 7",
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
                    mangan: "0"
                },
                history: []
            }
        ],
        measurementPoints: [],
        info: "Wałbrzyskie Przedsiębiorstwo Wodociągów i Kanalizacji Sp. z o.o. poinformowało, że nie jest zobowiązane do podawania parametrów wody. Jeśli mieszkasz w Wałbrzychu, możesz samodzielnie zlecić badanie wody – skontaktuj się z nami, a pomożemy!"
    },
    "Bydgoszcz": {
        average: { pH: 0, twardosc: 0, azotany: 0, zelazo: 0, fluorki: 0, chlor: 0, chlorki: 0, siarczany: 0, potas: 0, metnosc: 0, barwa: 0, magnez: 0 },
        stations: [
            {
                name: "SUW Czyżkówko",
                coords: [53.1300, 17.9400],
                address: "ul. Toruńska 103",
                data: {
                    pH: "7.8",
                    twardosc: "78.4",
                    azotany: "1.1",
                    chlor: "0.30",
                    fluorki: "0.13",
                    zelazo: "0.01",
                    mangan: "0.01",
                    chlorki: "6.68",
                    siarczany: "32",
                    potas: "0",
                    metnosc: "0.10",
                    barwa: "2",
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
                    twardosc: "164",
                    azotany: "2.1",
                    chlor: "0",
                    fluorki: "0.23",
                    zelazo: "0.02",
                    mangan: "0.01",
                    chlorki: "64.8",
                    siarczany: "94",
                    potas: "0",
                    metnosc: "0.09",
                    barwa: "5",
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
        ]
    },
    "Zielona Góra": {
        average: { pH: 0, twardosc: 0, azotany: 0, zelazo: 0, fluorki: 0, chlor: 0, chlorki: 0, siarczany: 0, potas: 0, metnosc: 0, barwa: 0, mangan: 0, magnez: 0 },
        stations: [
            {
                name: "SUW Zawada",
                coords: [51.9550, 15.5000],
                address: "ul. Kożuchowska 35, Zawada",
                data: {
                    pH: "7.6",
                    twardosc: "126",
                    azotany: "2.5",
                    chlor: "2.3",
                    fluorki: "0",
                    zelazo: "0.05",
                    mangan: "0.022",
                    chlorki: "3.4",
                    siarczany: "0",
                    potas: "0",
                    metnosc: "0.58",
                    barwa: "17",
                    magnez: "0"
                },
                history: []
            },
            {
                name: "SUW Zatonie",
                coords: [51.9100, 15.5400],
                address: "Zatonie",
                data: {
                    pH: "7.8",
                    twardosc: "171",
                    azotany: "0",
                    chlor: "0.86",
                    fluorki: "0",
                    zelazo: "0.05",
                    mangan: "0",
                    chlorki: "14.5",
                    siarczany: "38",
                    potas: "0",
                    metnosc: "0.24",
                    barwa: "4.0",
                    magnez: "0"
                },
                history: []
            },
            {
                name: "SUW Ochla",
                coords: [51.8900, 15.4700],
                address: "Ochla",
                data: {
                    pH: "7.6",
                    twardosc: "268",
                    azotany: "4.1",
                    chlor: "4.12",
                    fluorki: "0",
                    zelazo: "0.05",
                    mangan: "0",
                    chlorki: "78",
                    siarczany: "86",
                    potas: "0",
                    metnosc: "0.28",
                    barwa: "3.3",
                    magnez: "10.7"
                },
                history: []
            },
            {
                name: "SUW Zacisze",
                coords: [51.9400, 15.5200],
                address: "Zacisze",
                data: {
                    pH: "7.8",
                    twardosc: "220",
                    azotany: "1.3",
                    chlor: "0.76",
                    fluorki: "0",
                    zelazo: "0.05",
                    mangan: "0",
                    chlorki: "11",
                    siarczany: "64",
                    potas: "0",
                    metnosc: "0.20",
                    barwa: "3.0",
                    magnez: "0"
                },
                history: []
            },
            {
                name: "SUW Jarogniewice",
                coords: [51.9700, 15.4800],
                address: "Jarogniewice",
                data: {
                    pH: "7.6",
                    twardosc: "181",
                    azotany: "3.6",
                    chlor: "0.81",
                    fluorki: "0",
                    zelazo: "0.05",
                    mangan: "0",
                    chlorki: "20.0",
                    siarczany: "99",
                    potas: "0",
                    metnosc: "0.24",
                    barwa: "3.0",
                    magnez: "9.66"
                },
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
            "Barcikowiczki": "SUW Ochla"
        },
        info: "Brak szczegółowych danych o strefach zaopatrywania dla większości miasta. Dane dla SUW Zawada (zaopatruje ~60% Zielonej Góry) są domyślne.",
        fun_facts: {
            water_sources: "SUW Zawada korzysta z ujęcia wody z rzeki Obrzycy."
        }
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
            let stations = waterStations[city].stations;
            let avg = { pH: 0, twardosc: 0, azotany: 0, zelazo: 0, mangan: 0, potas: 0, siarczany: 0, metnosc: 0, chlor: 0, fluorki: 0 };
            let count = stations.length;

            stations.forEach(station => {
                if (typeof station.data.pH === 'string') {
                    if (station.data.pH.includes("–")) {
                        const pHRange = station.data.pH.split("–");
                        avg.pH += (parseFloat(pHRange[0]) + parseFloat(pHRange[1])) / 2;
                    } else {
                        avg.pH += parseFloat(station.data.pH);
                    }
                } else {
                    avg.pH += station.data.pH;
                }

                if (typeof station.data.twardosc === 'string') {
                    if (station.data.twardosc.includes("–")) {
                        const twardoscRange = station.data.twardosc.split("–");
                        avg.twardosc += (parseFloat(twardoscRange[0]) + parseFloat(twardoscRange[1])) / 2;
                    } else {
                        avg.twardosc += parseFloat(station.data.twardosc);
                    }
                } else {
                    avg.twardosc += station.data.twardosc;
                }

                if (typeof station.data.azotany === 'string') {
                    if (station.data.azotany.includes("–")) {
                        const azotanyRange = station.data.azotany.split("–");
                        avg.azotany += (parseFloat(azotanyRange[0]) + parseFloat(azotanyRange[1])) / 2;
                    } else {
                        avg.azotany += parseFloat(station.data.azotany);
                    }
                } else {
                    avg.azotany += station.data.azotany;
                }

                if (typeof station.data.zelazo === 'string') {
                    if (station.data.zelazo.includes("–")) {
                        const zelazoRange = station.data.zelazo.split("–");
                        avg.zelazo += (parseFloat(zelazoRange[0]) + parseFloat(zelazoRange[1])) / 2;
                    } else {
                        avg.zelazo += parseFloat(station.data.zelazo);
                    }
                } else {
                    avg.zelazo += station.data.zelazo;
                }

                if (station.data.mangan) {
                    if (typeof station.data.mangan === 'string') {
                        if (station.data.mangan.includes("–")) {
                            const manganRange = station.data.mangan.split("–");
                            avg.mangan += (parseFloat(manganRange[0]) + parseFloat(manganRange[1])) / 2;
                        } else {
                            avg.mangan += parseFloat(station.data.mangan);
                        }
                    } else {
                        avg.mangan += station.data.mangan;
                    }
                }

                if (station.data.potas) {
                    if (typeof station.data.potas === 'string') {
                        if (station.data.potas.includes("–")) {
                            const potasRange = station.data.potas.split("–");
                            avg.potas += (parseFloat(potasRange[0]) + parseFloat(potasRange[1])) / 2;
                        } else {
                            avg.potas += parseFloat(station.data.potas);
                        }
                    } else {
                        avg.potas += station.data.potas;
                    }
                }

                if (station.data.siarczany) {
                    if (typeof station.data.siarczany === 'string') {
                        if (station.data.siarczany.includes("–")) {
                            const siarczanyRange = station.data.siarczany.split("–");
                            avg.siarczany += (parseFloat(siarczanyRange[0]) + parseFloat(siarczanyRange[1])) / 2;
                        } else {
                            avg.siarczany += parseFloat(station.data.siarczany);
                        }
                    } else {
                        avg.siarczany += station.data.siarczany;
                    }
                }

                if (station.data.metnosc) {
                    if (typeof station.data.metnosc === 'string') {
                        if (station.data.metnosc.includes("–")) {
                            const metnoscRange = station.data.metnosc.split("–");
                            avg.metnosc += (parseFloat(metnoscRange[0]) + parseFloat(metnoscRange[1])) / 2;
                        } else {
                            avg.metnosc += parseFloat(station.data.metnosc);
                        }
                    } else {
                        avg.metnosc += station.data.metnosc;
                    }
                }

                if (station.data.chlor) {
                    if (typeof station.data.chlor === 'string') {
                        if (station.data.chlor.includes("–")) {
                            const chlorRange = station.data.chlor.split("–");
                            avg.chlor += (parseFloat(chlorRange[0]) + parseFloat(chlorRange[1])) / 2;
                        } else {
                            avg.chlor += parseFloat(station.data.chlor);
                        }
                    } else {
                        avg.chlor += station.data.chlor;
                    }
                }

                if (station.data.fluorki) {
                    if (typeof station.data.fluorki === 'string') {
                        if (station.data.fluorki.includes("–")) {
                            const fluorkiRange = station.data.fluorki.split("–");
                            avg.fluorki += (parseFloat(fluorkiRange[0]) + parseFloat(fluorkiRange[1])) / 2;
                        } else {
                            avg.fluorki += parseFloat(station.data.fluorki);
                        }
                    } else {
                        avg.fluorki += station.data.fluorki;
                    }
                }
            });

            waterStations[city].average = {
                pH: count > 0 ? (avg.pH / count).toFixed(2) : 0,
                twardosc: count > 0 ? (avg.twardosc / count).toFixed(2) : 0,
                azotany: count > 0 ? (avg.azotany / count).toFixed(2) : 0,
                zelazo: count > 0 ? (avg.zelazo / count).toFixed(2) : 0,
                mangan: count > 0 ? (avg.mangan / count).toFixed(2) : 0,
                potas: count > 0 ? (avg.potas / count).toFixed(2) : 0,
                siarczany: count > 0 ? (avg.siarczany / count).toFixed(2) : 0,
                metnosc: count > 0 ? (avg.metnosc / count).toFixed(2) : 0,
                chlor: count > 0 ? (avg.chlor / count).toFixed(2) : 0,
                fluorki: count > 0 ? (avg.fluorki / count).toFixed(2) : 0
            };
            console.log(`Miasto: ${city}, Średnia twardość: ${waterStations[city].average.twardosc} mg/l, Chlor: ${waterStations[city].average.chlor}, Fluorki: ${waterStations[city].average.fluorki}`);
        }
    } catch (error) {
        console.error('Błąd w calculateCityAverages:', error);
    }
}
calculateCityAverages();

export function checkWater(inputId) {
    try {
        let resultDiv;
if (inputId === 'city') {
    resultDiv = document.getElementById('city-result');
} else if (inputId === 'bottle') {
    resultDiv = document.getElementById('bottle-result');
}
        if (!resultDiv) return;

        let city; // Definiujemy city na poziomie funkcji
        let data, result = '';
        if (inputId === 'city') {
            city = document.getElementById('city').value.trim(); // Przypisujemy wartość
            if (!city) {
                resultDiv.innerHTML = "Proszę wpisać miasto!";
                return;
            }
            data = waterStations[city]?.average;
            if (!data || parseFloat(data.pH) === 0) {
                resultDiv.innerHTML = "Brak danych dla tego miasta lub dane są niekompletne.";
                return;
            }
            result = `<h3>Jakość wody w ${city}</h3>`;
        } else if (inputId === 'bottle') {
            const bottle = document.getElementById('bottle').value.trim();
            if (!bottle) {
               resultDiv.innerHTML = "Proszę wpisać nazwę wody butelkowanej!";
                return;
            }
            data = bottleData[bottle];
            if (!data) {
                resultDiv.innerHTML = "Brak danych dla tej wody butelkowanej.";
                return;
            }
            result = `<h3>Jakość wody ${bottle}</h3>`;
        }

        const pHColor = getColor("pH", parseFloat(data.pH));
        const twardoscColor = getColor("twardosc", parseFloat(data.twardosc));
        const azotanyColor = getColor("azotany", parseFloat(data.azotany));
        const chlorColor = getColor("chlor", parseFloat(data.chlor));
        const fluorkiColor = getColor("fluorki", parseFloat(data.fluorki));

        let parameters = [
            `<div class="parameter"><span class="dot ${pHColor}"></span> pH: ${parseFloat(data.pH).toFixed(2)} (norma: 6.5–9.5) – ${getParameterDescription('pH', parseFloat(data.pH), pHColor)}</div>`,
            `<div class="parameter"><span class="dot ${twardoscColor}"></span> Twardość: ${parseFloat(data.twardosc).toFixed(2)} mg/l (optymalnie: <120 mg/l) – ${getParameterDescription('twardosc', parseFloat(data.twardosc), twardoscColor)}</div>`,
            `<div class="parameter"><span class="dot ${azotanyColor}"></span> Azotany: ${parseFloat(data.azotany).toFixed(2)} mg/l (norma: <50 mg/l) – ${getParameterDescription('azotany', parseFloat(data.azotany), azotanyColor)}</div>`,
            `<div class="parameter"><span class="dot ${chlorColor}"></span> Chlor wolny: ${parseFloat(data.chlor).toFixed(2)} mg/l (norma: <0.3 mg/l) – ${getParameterDescription('chlor', parseFloat(data.chlor), chlorColor)}</div>`,
            `<div class="parameter"><span class="dot ${fluorkiColor}"></span> Fluorki: ${parseFloat(data.fluorki).toFixed(2)} mg/l (norma: <1.5 mg/l) – ${getParameterDescription('fluorki', parseFloat(data.fluorki), fluorkiColor)}</div>`
        ];

        if (inputId === 'bottle') {
            parameters = [
                `<div class="parameter"><span class="dot ${data.pH.color}"></span> pH: ${data.pH.value.toFixed(2)} (${data.pH.norm}) – ${data.pH.desc}</div>`,
                `<div class="parameter"><span class="dot ${data.wapn.color}"></span> Wapń: ${data.wapn.value.toFixed(2)} mg/l (${data.wapn.norm}) – ${data.wapn.desc}</div>`,
                `<div class="parameter"><span class="dot ${data.magnez.color}"></span> Magnez: ${data.magnez.value.toFixed(2)} mg/l (${data.magnez.norm}) – ${data.magnez.desc}</div>`,
                `<div class="parameter"><span class="dot ${data.sod.color}"></span> Sód: ${data.sod.value.toFixed(2)} mg/l (${data.sod.norm}) – ${data.sod.desc}</div>`,
                `<div class="parameter"><span class="dot ${data.fluorki.color}"></span> Fluorki: ${data.fluorki.value.toFixed(2)} mg/l (${data.fluorki.norm}) – ${data.fluorki.desc}</div>`,
                `<div class="parameter">${data.mikroplastik.desc}</div>`
            ];
        }

        result += `Jakość wody:<br>${parameters.join('')}`;
        if (inputId === 'city' && waterStations[city]?.info) {
            result += `<div class="note">${waterStations[city].info}</div>`;
        }
        resultDiv.innerHTML = result;
    } catch (error) {
        console.error('Błąd w checkWater:', error);
        document.getElementById('waterInfo').innerHTML = "Wystąpił błąd – sprawdź konsolę (F12).";
    }
}

export function showDistrictData(street, city, zones, stations, measurementPoints, map) {
    try {
        const districtSelect = document.getElementById('district-select');
        const waterInfo = document.getElementById('waterInfo');
        if (!districtSelect || !waterInfo) return;

        const selectedDistrict = districtSelect.value;
        if (!selectedDistrict) {
            waterInfo.innerHTML = `
                <h3>Wyniki dla adresu: ${street}, ${city}</h3>
                <p>Wybierz swoją dzielnicę, aby zobaczyć dane:</p>
                <select id="district-select">
                    <option value="">Wybierz dzielnicę</option>
                    ${Object.keys(zones).map(district => `<option value="${district}">${district}</option>`).join('')}
                </select>
                <button id="show-district-data">Pokaż dane</button>
            `;
            document.getElementById('show-district-data').addEventListener('click', () => showDistrictData(street, city, zones, stations, measurementPoints, map));
            return;
        }

        const stationName = zones[selectedDistrict];
        let closestStation = stations.find(station => station.name === stationName);
        let closestPoint = null;
        let minPointDistance = Infinity;

        if (!closestStation) {
            waterInfo.innerHTML = `
                <h3>Wyniki dla adresu: ${street}, ${city}</h3>
                <p>Twoja dzielnica (${selectedDistrict}) ma wodę mieszaną z różnych SUW.</p>
            `;
            const avgData = waterStations[city].average;
            const parameters = [
                `<div class="parameter"><span class="dot ${getColor('pH', parseFloat(avgData.pH))}"></span> pH: ${parseFloat(avgData.pH).toFixed(2)} (norma: 6.5–9.5) – ${getParameterDescription('pH', parseFloat(avgData.pH), getColor('pH', parseFloat(avgData.pH)))}</div>`,
                `<div class="parameter"><span class="dot ${getColor('twardosc', parseFloat(avgData.twardosc))}"></span> Twardość: ${parseFloat(avgData.twardosc).toFixed(2)} mg/l (optymalnie: <120 mg/l) – ${getParameterDescription('twardosc', parseFloat(avgData.twardosc), getColor('twardosc', parseFloat(avgData.twardosc)))}</div>`,
                `<div class="parameter"><span class="dot ${getColor('azotany', parseFloat(avgData.azotany))}"></span> Azotany: ${parseFloat(avgData.azotany).toFixed(2)} mg/l (norma: <50 mg/l) – ${getParameterDescription('azotany', parseFloat(avgData.azotany), getColor('azotany', parseFloat(avgData.azotany)))}</div>`,
                `<div class="parameter"><span class="dot ${getColor('chlor', parseFloat(avgData.chlor))}"></span> Chlor wolny: ${parseFloat(avgData.chlor).toFixed(2)} mg/l (norma: <0.3 mg/l) – ${getParameterDescription('chlor', parseFloat(avgData.chlor), getColor('chlor', parseFloat(avgData.chlor)))}</div>`,
                `<div class="parameter"><span class="dot ${getColor('fluorki', parseFloat(avgData.fluorki))}"></span> Fluorki: ${parseFloat(avgData.fluorki).toFixed(2)} mg/l (norma: <1.5 mg/l) – ${getParameterDescription('fluorki', parseFloat(avgData.fluorki), getColor('fluorki', parseFloat(avgData.fluorki)))}</div>`
            ];
            waterInfo.innerHTML += `
                Jakość wody (średnia dla miasta):<br>
                ${parameters.join('')}
            `;
            return;
        }

        if (map) {
            map.eachLayer(layer => {
                if (layer instanceof L.Marker) map.removeLayer(layer);
            });
            if (closestStation) {
                L.marker(closestStation.coords)
                    .addTo(map)
                    .bindPopup(`${closestStation.name} (${closestStation.address})`)
                    .openPopup();
            }
        }

        let result = `<h3>Wyniki dla adresu: ${street}, ${city}</h3>`;
        result += `<p>Dzielnica: ${selectedDistrict}</p>`;
        if (city === "Grudziądz") {
            result += '<p class="note">W Grudziądzu próbki wody są pobierane bezpośrednio na SUW Hallera 79, co zapewnia dokładne dane o jakości wody uzdatnionej.</p>';
        }

        if (closestStation) {
            const pH = parseFloat(closestStation.data.pH).toFixed(2);
            const twardosc = parseFloat(closestStation.data.twardosc).toFixed(2);
            const azotany = parseFloat(closestStation.data.azotany).toFixed(2);
            const chlor = parseFloat(closestStation.data.chlor).toFixed(2);
            const fluorki = parseFloat(closestStation.data.fluorki).toFixed(2);
            const zelazo = parseFloat(closestStation.data.zelazo).toFixed(2);
            const mangan = parseFloat(closestStation.data.mangan).toFixed(2);
            const chlorki = parseFloat(closestStation.data.chlorki).toFixed(2);
            const siarczany = parseFloat(closestStation.data.siarczany).toFixed(2);
            const metnosc = parseFloat(closestStation.data.metnosc).toFixed(2);
            const barwa = parseFloat(closestStation.data.barwa).toFixed(2);
            const magnez = parseFloat(closestStation.data.magnez || 0).toFixed(2);
            const parameters = [
                `<div class="parameter"><span class="dot ${getColor('pH', pH)}"></span> pH: ${pH} (norma: 6.5–9.5) – ${getParameterDescription('pH', pH, getColor('pH', pH))}</div>`,
                `<div class="parameter"><span class="dot ${getColor('twardosc', twardosc)}"></span> Twardość: ${twardosc} mg/l (optymalnie: <120 mg/l) – ${getParameterDescription('twardosc', twardosc, getColor('twardosc', twardosc))}</div>`,
                `<div class="parameter"><span class="dot ${getColor('azotany', azotany)}"></span> Azotany: ${azotany} mg/l (norma: <50 mg/l) – ${getParameterDescription('azotany', azotany, getColor('azotany', azotany))}</div>`,
                `<div class="parameter"><span class="dot ${getColor('chlor', chlor)}"></span> Chlor wolny: ${chlor} mg/l (norma: <0.3 mg/l) – ${getParameterDescription('chlor', chlor, getColor('chlor', chlor))}</div>`,
                `<div class="parameter"><span class="dot ${getColor('fluorki', fluorki)}"></span> Fluorki: ${fluorki} mg/l (norma: <1.5 mg/l) – ${getParameterDescription('fluorki', fluorki, getColor('fluorki', fluorki))}</div>`,
                `<div class="parameter"><span class="dot ${getColor('zelazo', zelazo)}"></span> Żelazo: ${zelazo} mg/l (norma: <0.2 mg/l) – ${getParameterDescription('zelazo', zelazo, getColor('zelazo', zelazo))}</div>`,
                `<div class="parameter"><span class="dot ${getColor('mangan', mangan)}"></span> Mangan: ${mangan} mg/l (norma: <0.05 mg/l) – ${getParameterDescription('mangan', mangan, getColor('mangan', mangan))}</div>`,
                `<div class="parameter"><span class="dot ${getColor('chlorki', chlorki)}"></span> Chlorki: ${chlorki} mg/l (norma: <250 mg/l) – ${getParameterDescription('chlorki', chlorki, getColor('chlorki', chlorki))}</div>`,
                `<div class="parameter"><span class="dot ${getColor('siarczany', siarczany)}"></span> Siarczany: ${siarczany} mg/l (norma: <250 mg/l) – ${getParameterDescription('siarczany', siarczany, getColor('siarczany', siarczany))}</div>`,
                `<div class="parameter"><span class="dot ${getColor('metnosc', metnosc)}"></span> Mętność: ${metnosc} NTU (norma: <1 NTU) – ${getParameterDescription('metnosc', metnosc, getColor('metnosc', metnosc))}</div>`,
                `<div class="parameter"><span class="dot ${getColor('barwa', barwa)}"></span> Barwa: ${barwa} mgPt/dm³ (norma: <15 mgPt/dm³) – ${getParameterDescription('barwa', barwa, getColor('barwa', barwa))}</div>`,
                `<div class="parameter"><span class="dot ${getColor('magnez', magnez)}"></span> Magnez: ${magnez} mg/l (korzysna: >50 mg/l) – ${getParameterDescription('magnez', magnez, getColor('magnez', magnez))}</div>`
            ];
            result += `
                <h4>Najbliższa stacja SUW: ${closestStation.name} (${closestStation.address})</h4>
                Jakość wody:<br>
                ${parameters.join('')}
            `;
        }

        measurementPoints.forEach(point => {
            const distance = getDistance(closestStation.coords[0], closestStation.coords[1], point.coords[0], point.coords[1]);
            if (distance < minPointDistance) {
                minPointDistance = distance;
                closestPoint = point;
            }
        });

        if (closestPoint) {
            const pH = parseFloat(closestPoint.data.pH).toFixed(2);
            const twardosc = parseFloat(closestPoint.data.twardosc).toFixed(2);
            const azotany = parseFloat(closestPoint.data.azotany).toFixed(2);
            const chlor = parseFloat(closestPoint.data.chlor).toFixed(2);
            const fluorki = parseFloat(closestPoint.data.fluorki).toFixed(2);
            const zelazo = parseFloat(closestPoint.data.zelazo).toFixed(2);
            const mangan = parseFloat(closestPoint.data.mangan).toFixed(2);
            const chlorki = parseFloat(closestPoint.data.chlorki).toFixed(2);
            const siarczany = parseFloat(closestPoint.data.siarczany).toFixed(2);
            const metnosc = parseFloat(closestPoint.data.metnosc).toFixed(2);
            const barwa = parseFloat(closestPoint.data.barwa).toFixed(2);
            const magnez = parseFloat(closestPoint.data.magnez || 0).toFixed(2);
            const parameters = [
                `<div class="parameter"><span class="dot ${getColor('pH', pH)}"></span> pH: ${pH} (norma: 6.5–9.5) – ${getParameterDescription('pH', pH, getColor('pH', pH))}</div>`,
                `<div class="parameter"><span class="dot ${getColor('twardosc', twardosc)}"></span> Twardość: ${twardosc} mg/l (optymalnie: <120 mg/l) – ${getParameterDescription('twardosc', twardosc, getColor('twardosc', twardosc))}</div>`,
                `<div class="parameter"><span class="dot ${getColor('azotany', azotany)}"></span> Azotany: ${azotany} mg/l (norma: <50 mg/l) – ${getParameterDescription('azotany', azotany, getColor('azotany', azotany))}</div>`,
                `<div class="parameter"><span class="dot ${getColor('chlor', chlor)}"></span> Chlor wolny: ${chlor} mg/l (norma: <0.3 mg/l) – ${getParameterDescription('chlor', chlor, getColor('chlor', chlor))}</div>`,
                `<div class="parameter"><span class="dot ${getColor('fluorki', fluorki)}"></span> Fluorki: ${fluorki} mg/l (norma: <1.5 mg/l) – ${getParameterDescription('fluorki', fluorki, getColor('fluorki', fluorki))}</div>`,
                `<div class="parameter"><span class="dot ${getColor('zelazo', zelazo)}"></span> Żelazo: ${zelazo} mg/l (norma: <0.2 mg/l) – ${getParameterDescription('zelazo', zelazo, getColor('zelazo', zelazo))}</div>`,
                `<div class="parameter"><span class="dot ${getColor('mangan', mangan)}"></span> Mangan: ${mangan} mg/l (norma: <0.05 mg/l) – ${getParameterDescription('mangan', mangan, getColor('mangan', mangan))}</div>`,
                `<div class="parameter"><span class="dot ${getColor('chlorki', chlorki)}"></span> Chlorki: ${chlorki} mg/l (norma: <250 mg/l) – ${getParameterDescription('chlorki', chlorki, getColor('chlorki', chlorki))}</div>`,
                `<div class="parameter"><span class="dot ${getColor('siarczany', siarczany)}"></span> Siarczany: ${siarczany} mg/l (norma: <250 mg/l) – ${getParameterDescription('siarczany', siarczany, getColor('siarczany', siarczany))}</div>`,
                `<div class="parameter"><span class="dot ${getColor('metnosc', metnosc)}"></span> Mętność: ${metnosc} NTU (norma: <1 NTU) – ${getParameterDescription('metnosc', metnosc, getColor('metnosc', metnosc))}</div>`,
                `<div class="parameter"><span class="dot ${getColor('barwa', barwa)}"></span> Barwa: ${barwa} mgPt/dm³ (norma: <15 mgPt/dm³) – ${getParameterDescription('barwa', barwa, getColor('barwa', barwa))}</div>`,
                `<div class="parameter"><span class="dot ${getColor('magnez', magnez)}"></span> Magnez: ${magnez} mg/l (korzysna: >50 mg/l) – ${getParameterDescription('magnez', magnez, getColor('magnez', magnez))}</div>`
            ];
            result += `
                <h4>Najbliższy punkt pomiarowy: ${closestPoint.name} (${closestPoint.address})</h4>
                Odległość: ${(minPointDistance * 111).toFixed(2)} km<br>
                Jakość wody:<br>
                ${parameters.join('')}
            `;
            if (map) {
                L.marker(closestPoint.coords, { icon: L.divIcon({ className: 'measurement-point', html: '<div style="background-color: blue; width: 10px; height: 10px; border-radius: 50%;"></div>' }) })
                    .addTo(map)
                    .bindPopup(`${closestPoint.name} (${closestPoint.address})`);
            }
        }

        result += '<div class="note">Dane zależą od wodociągów. Skontaktuj się z nimi dla dokładniejszych informacji.</div>';
        waterInfo.innerHTML = result;
    } catch (error) {
        console.error('Błąd w showDistrictData:', error);
        const waterInfo = document.getElementById('waterInfo');
        if (waterInfo) {
            waterInfo.innerHTML = "Wystąpił błąd – sprawdź konsolę (F12).";
        }
    }
}

export async function findWaterStation() {
    try {
        const isPremium = localStorage.getItem('isPremium') === 'true';
        if (!isPremium) {
            alert('Funkcja dostępna tylko dla użytkowników Premium! Przejdź na Premium za 9,99 zł/mc na https://x.ai/grok.');
            return;
        }

        const streetInput = document.getElementById('street');
        const cityInput = document.getElementById('city-premium');
        const waterInfo = document.getElementById('waterInfo');
        if (!streetInput || !cityInput || !waterInfo) return;

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
            if (waterStations[city]?.info) {
                waterInfo.innerHTML = waterStations[city].info;
            } else {
                waterInfo.innerHTML = "Brak danych dla tego miasta.";
            }
            return;
        }

        const mapElement = document.getElementById('map');
        if (mapElement && map) {
            mapElement.style.display = 'block';
            map.setView([stations[0]?.coords[0] || 54.1750, stations[0]?.coords[1] || 16.1750], 12);
            setTimeout(() => map.invalidateSize(), 200);
        }

        let closestStation = null;
        let closestPoint = null;
        let minStationDistance = Infinity;
        let minPointDistance = Infinity;

        if (zones) {
            waterInfo.innerHTML = `
                <h3>Wyniki dla adresu: ${street}, ${city}</h3>
                <p>Wybierz swoją dzielnicę, aby zobaczyć dane:</p>
                <select id="district-select">
                    <option value="">Wybierz dzielnicę</option>
                    ${Object.keys(zones).map(district => `<option value="${district}">${district}</option>`).join('')}
                </select>
                <button id="show-district-data">Pokaż dane</button>
            `;
            document.getElementById('show-district-data').addEventListener('click', () => showDistrictData(street, city, zones, stations, measurementPoints, map));
        } else {
            let userLat = 54.1750, userLon = 16.1750;
            const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(street + ', ' + city + ', Polska')}&format=json&limit=1`);
            const data = await response.json();
            if (data.length > 0) {
                userLat = parseFloat(data[0].lat);
                userLon = parseFloat(data[0].lon);
            }

            stations.forEach(station => {
                const distance = getDistance(userLat, userLon, station.coords[0], station.coords[1]);
                if (distance < minStationDistance) {
                    minStationDistance = distance;
                    closestStation = station;
                }
            });

            measurementPoints.forEach(point => {
                const distance = getDistance(userLat, userLon, point.coords[0], point.coords[1]);
                if (distance < minPointDistance) {
                    minPointDistance = distance;
                    closestPoint = point;
                }
            });

            if (map) {
                map.eachLayer(layer => {
                    if (layer instanceof L.Marker) map.removeLayer(layer);
                });
                if (closestStation) {
                    L.marker(closestStation.coords)
                        .addTo(map)
                        .bindPopup(`${closestStation.name} (${closestStation.address})`)
                        .openPopup();
                }
                if (closestPoint) {
                    L.marker(closestPoint.coords, { icon: L.divIcon({ className: 'measurement-point', html: '<div style="background-color: blue; width: 10px; height: 10px; border-radius: 50%;"></div>' }) })
                        .addTo(map)
                        .bindPopup(`${closestPoint.name} (${closestPoint.address})`);
                }
            }

            let result = `<h3>Wyniki dla adresu: ${street}, ${city}</h3>`;
            if (city === "Grudziądz") {
                result += '<p class="note">W Grudziądzu próbki wody są pobierane bezpośrednio na SUW Hallera 79, co zapewnia dokładne dane o jakości wody uzdatnionej.</p>';
            }

            if (closestStation) {
                const pH = parseFloat(closestStation.data.pH).toFixed(2);
                const twardosc = parseFloat(closestStation.data.twardosc).toFixed(2);
                const azotany = parseFloat(closestStation.data.azotany).toFixed(2);
                const chlor = parseFloat(closestStation.data.chlor).toFixed(2);
                const fluorki = parseFloat(closestStation.data.fluorki).toFixed(2);
                const zelazo = parseFloat(closestStation.data.zelazo).toFixed(2);
                const mangan = parseFloat(closestStation.data.mangan).toFixed(2);
                const chlorki = parseFloat(closestStation.data.chlorki).toFixed(2);
                const siarczany = parseFloat(closestStation.data.siarczany).toFixed(2);
                const metnosc = parseFloat(closestStation.data.metnosc).toFixed(2);
                const barwa = parseFloat(closestStation.data.barwa).toFixed(2);
                const magnez = parseFloat(closestStation.data.magnez || 0).toFixed(2);
                const parameters = [
                    `<div class="parameter"><span class="dot ${getColor('pH', pH)}"></span> pH: ${pH} (norma: 6.5–9.5) – ${getParameterDescription('pH', pH, getColor('pH', pH))}</div>`,
                    `<div class="parameter"><span class="dot ${getColor('twardosc', twardosc)}"></span> Twardość: ${twardosc} mg/l (optymalnie: <120 mg/l) – ${getParameterDescription('twardosc', twardosc, getColor('twardosc', twardosc))}</div>`,
                    `<div class="parameter"><span class="dot ${getColor('azotany', azotany)}"></span> Azotany: ${azotany} mg/l (norma: <50 mg/l) – ${getParameterDescription('azotany', azotany, getColor('azotany', azotany))}</div>`,
                    `<div class="parameter"><span class="dot ${getColor('chlor', chlor)}"></span> Chlor wolny: ${chlor} mg/l (norma: <0.3 mg/l) – ${getParameterDescription('chlor', chlor, getColor('chlor', chlor))}</div>`,
                    `<div class="parameter"><span class="dot ${getColor('fluorki', fluorki)}"></span> Fluorki: ${fluorki} mg/l (norma: <1.5 mg/l) – ${getParameterDescription('fluorki', fluorki, getColor('fluorki', fluorki))}</div>`,
                    `<div class="parameter"><span class="dot ${getColor('zelazo', zelazo)}"></span> Żelazo: ${zelazo} mg/l (norma: <0.2 mg/l) – ${getParameterDescription('zelazo', zelazo, getColor('zelazo', zelazo))}</div>`,
                    `<div class="parameter"><span class="dot ${getColor('mangan', mangan)}"></span> Mangan: ${mangan} mg/l (norma: <0.05 mg/l) – ${getParameterDescription('mangan', mangan, getColor('mangan', mangan))}</div>`,
                    `<div class="parameter"><span class="dot ${getColor('chlorki', chlorki)}"></span> Chlorki: ${chlorki} mg/l (norma: <250 mg/l) – ${getParameterDescription('chlorki', chlorki, getColor('chlorki', chlorki))}</div>`,
                    `<div class="parameter"><span class="dot ${getColor('siarczany', siarczany)}"></span> Siarczany: ${siarczany} mg/l (norma: <250 mg/l) – ${getParameterDescription('siarczany', siarczany, getColor('siarczany', siarczany))}</div>`,
                    `<div class="parameter"><span class="dot ${getColor('metnosc', metnosc)}"></span> Mętność: ${metnosc} NTU (norma: <1 NTU) – ${getParameterDescription('metnosc', metnosc, getColor('metnosc', metnosc))}</div>`,
                    `<div class="parameter"><span class="dot ${getColor('barwa', barwa)}"></span> Barwa: ${barwa} mgPt/dm³ (norma: <15 mgPt/dm³) – ${getParameterDescription('barwa', barwa, getColor('barwa', barwa))}</div>`,
                    `<div class="parameter"><span class="dot ${getColor('magnez', magnez)}"></span> Magnez: ${magnez} mg/l (korzyść: >50 mg/l) – ${getParameterDescription('magnez', magnez, getColor('magnez', magnez))}</div>`
                ];
                result += `
                    <h4>Najbliższa stacja SUW: ${closestStation.name} (${closestStation.address})</h4>
                    Odległość: ${(minStationDistance * 111).toFixed(2)} km<br>
                    Jakość wody:<br>
                    ${parameters.join('')}
                `;
            } else {
                result += '<p>Brak stacji SUW dla tego miasta.</p>';
            }

            if (closestPoint) {
                const pH = parseFloat(closestPoint.data.pH).toFixed(2);
                const twardosc = parseFloat(closestPoint.data.twardosc).toFixed(2);
                const azotany = parseFloat(closestPoint.data.azotany).toFixed(2);
                const chlor = parseFloat(closestPoint.data.chlor).toFixed(2);
                const fluorki = parseFloat(closestPoint.data.fluorki).toFixed(2);
                const zelazo = parseFloat(closestPoint.data.zelazo).toFixed(2);
                const mangan = parseFloat(closestPoint.data.mangan).toFixed(2);
                const chlorki = parseFloat(closestPoint.data.chlorki).toFixed(2);
                const siarczany = parseFloat(closestPoint.data.siarczany).toFixed(2);
                const metnosc = parseFloat(closestPoint.data.metnosc).toFixed(2);
                const barwa = parseFloat(closestPoint.data.barwa).toFixed(2);
                const magnez = parseFloat(closestPoint.data.magnez || 0).toFixed(2);
                const parameters = [
                    `<div class="parameter"><span class="dot ${getColor('pH', pH)}"></span> pH: ${pH} (norma: 6.5–9.5) – ${getParameterDescription('pH', pH, getColor('pH', pH))}</div>`,
                    `<div class="parameter"><span class="dot ${getColor('twardosc', twardosc)}"></span> Twardość: ${twardosc} mg/l (optymalnie: <120 mg/l) – ${getParameterDescription('twardosc', twardosc, getColor('twardosc', twardosc))}</div>`,
                    `<div class="parameter"><span class="dot ${getColor('azotany', azotany)}"></span> Azotany: ${azotany} mg/l (norma: <50 mg/l) – ${getParameterDescription('azotany', azotany, getColor('azotany', azotany))}</div>`,
                    `<div class="parameter"><span class="dot ${getColor('chlor', chlor)}"></span> Chlor wolny: ${chlor} mg/l (norma: <0.3 mg/l) – ${getParameterDescription('chlor', chlor, getColor('chlor', chlor))}</div>`,
                    `<div class="parameter"><span class="dot ${getColor('fluorki', fluorki)}"></span> Fluorki: ${fluorki} mg/l (norma: <1.5 mg/l) – ${getParameterDescription('fluorki', fluorki, getColor('fluorki', fluorki))}</div>`,
                    `<div class="parameter"><span class="dot ${getColor('zelazo', zelazo)}"></span> Żelazo: ${zelazo} mg/l (norma: <0.2 mg/l) – ${getParameterDescription('zelazo', zelazo, getColor('zelazo', zelazo))}</div>`,
                    `<div class="parameter"><span class="dot ${getColor('mangan', mangan)}"></span> Mangan: ${mangan} mg/l (norma: <0.05 mg/l) – ${getParameterDescription('mangan', mangan, getColor('mangan', mangan))}</div>`,
                    `<div class="parameter"><span class="dot ${getColor('chlorki', chlorki)}"></span> Chlorki: ${chlorki} mg/l (norma: <250 mg/l) – ${getParameterDescription('chlorki', chlorki, getColor('chlorki', chlorki))}</div>`,
                    `<div class="parameter"><span class="dot ${getColor('siarczany', siarczany)}"></span> Siarczany: ${siarczany} mg/l (norma: <250 mg/l) – ${getParameterDescription('siarczany', siarczany, getColor('siarczany', siarczany))}</div>`,
                    `<div class="parameter"><span class="dot ${getColor('metnosc', metnosc)}"></span> Mętność: ${metnosc} NTU (norma: <1 NTU) – ${getParameterDescription('metnosc', metnosc, getColor('metnosc', metnosc))}</div>`,
                    `<div class="parameter"><span class="dot ${getColor('barwa', barwa)}"></span> Barwa: ${barwa} mgPt/dm³ (norma: <15 mgPt/dm³) – ${getParameterDescription('barwa', barwa, getColor('barwa', barwa))}</div>`,
                    `<div class="parameter"><span class="dot ${getColor('magnez', magnez)}"></span> Magnez: ${magnez} mg/l (korzyść: >50 mg/l) – ${getParameterDescription('magnez', magnez, getColor('magnez', magnez))}</div>`
                ];
                result += `
                    <h4>Najbliższy punkt pomiarowy: ${closestPoint.name} (${closestPoint.address})</h4>
                    Odległość: ${(minPointDistance * 111).toFixed(2)} km<br>
                    Jakość wody:<br>
                    ${parameters.join('')}
                `;
            } else {
                result += '<p>Brak punktów pomiarowych dla tego miasta.</p>';
            }

            result += '<div class="note">Odległości są szacunkowe. Skontaktuj się z wodociągami dla dokładnych danych.</div>';
            if (city === "Zielona Góra" && waterStations[city]?.fun_facts?.water_sources) {
                result += `<div class="fun-fact">Ciekawostka: ${waterStations[city].fun_facts.water_sources}</div>`;
            }
            waterInfo.innerHTML = result;
        }
    } catch (error) {
        console.error('Błąd w findWaterStation:', error);
        document.getElementById('waterInfo').innerHTML = "Wystąpił błąd – sprawdź konsolę (F12).";
    }
}

export function getDistance(lat1, lon1, lat2, lon2) {
    try {
        const dx = lat1 - lat2;
        const dy = lon1 - lon2;
        return Math.sqrt(dx * dx + dy * dy);
    } catch (error) {
        console.error('Błąd w getDistance:', error);
        return Infinity;
    }
}

export function showAllStations() {
    try {
        const waterInfo = document.getElementById('waterInfo');
        if (!waterInfo) return;

        let result = '<h3>Wszystkie stacje uzdatniania wody:</h3>';
        for (const city in waterStations) {
            const stations = waterStations[city].stations || [];
            if (stations.length > 0) {
                result += `<h4>${city}</h4>`;
                result += '<div class="stations-grid">';
                stations.forEach(station => {
                    result += `
                        <div class="station-card">
                            <h4>${station.name} (${station.address})</h4>
                            <div class="parameter"><span class="dot ${getColor('pH', parseFloat(station.data.pH))}"></span> pH: ${station.data.pH}</div>
                            <div class="parameter"><span class="dot ${getColor('twardosc', parseFloat(station.data.twardosc))}"></span> Twardość: ${station.data.twardosc} mg/l</div>
                            <div class="parameter"><span class="dot ${getColor('azotany', parseFloat(station.data.azotany))}"></span> Azotany: ${station.data.azotany} mg/l</div>
                            <div class="parameter"><span class="dot ${getColor('zelazo', parseFloat(station.data.zelazo))}"></span> Żelazo: ${station.data.zelazo} mg/l</div>
                            <div class="parameter"><span class="dot ${getColor('mangan', parseFloat(station.data.mangan))}"></span> Mangan: ${station.data.mangan} mg/l</div>
                        </div>
                    `;
                });
                result += '</div>';
            }
        }
        document.getElementById('waterInfo').innerHTML = result; // Tutaj zmieniliśmy na 'all-suw'
    } catch (error) {
        console.error('Błąd w showAllStations:', error);
        document.getElementById('waterInfo').innerHTML = "Wystąpił błąd – sprawdź konsolę (F12).";
    }
}

export function showAllSUW() {
    try {
        const cityInput = document.getElementById('city-premium');
        const waterInfo = document.getElementById('waterInfo');
        if (!cityInput || !waterInfo) return;

        const city = cityInput.value.trim();
        if (!city) {
            alert("Wpisz miasto!");
            return;
        }

        const stations = waterStations[city]?.stations || [];
        if (stations.length === 0) {
            waterInfo.innerHTML = "Brak stacji SUW dla tego miasta.";
            return;
        }

        const mapElement = document.getElementById('map');
        if (mapElement && map) {
            mapElement.style.display = 'block';
            map.setView([stations[0].coords[0], stations[0].coords[1]], 12);
            setTimeout(() => map.invalidateSize(), 200);
            map.eachLayer(layer => {
                if (layer instanceof L.Marker) map.removeLayer(layer);
            });
        }

        let result = `<h3>Stacje uzdatniania wody w ${city}</h3>`;
        result += `<div class="stations-grid">`;
        stations.forEach(station => {
            const pH = parseFloat(station.data.pH).toFixed(2);
            const twardosc = parseFloat(station.data.twardosc).toFixed(2);
            const azotany = parseFloat(station.data.azotany).toFixed(2);
            const chlor = parseFloat(station.data.chlor).toFixed(2);
            const fluorki = parseFloat(station.data.fluorki).toFixed(2);
            const zelazo = parseFloat(station.data.zelazo).toFixed(2);
            const mangan = parseFloat(station.data.mangan).toFixed(2);
            const chlorki = parseFloat(station.data.chlorki).toFixed(2);
            const siarczany = parseFloat(station.data.siarczany).toFixed(2);
            const metnosc = parseFloat(station.data.metnosc).toFixed(2);
            const barwa = parseFloat(station.data.barwa).toFixed(2);
            const magnez = parseFloat(station.data.magnez || 0).toFixed(2);
            const parameters = [
                `<div class="parameter"><span class="dot ${getColor('pH', pH)}"></span> pH: ${pH} (norma: 6.5–9.5) – ${getParameterDescription('pH', pH, getColor('pH', pH))}</div>`,
                `<div class="parameter"><span class="dot ${getColor('twardosc', twardosc)}"></span> Twardość: ${twardosc} mg/l (optymalnie: <120 mg/l) – ${getParameterDescription('twardosc', twardosc, getColor('twardosc', twardosc))}</div>`,
                `<div class="parameter"><span class="dot ${getColor('azotany', azotany)}"></span> Azotany: ${azotany} mg/l (norma: <50 mg/l) – ${getParameterDescription('azotany', azotany, getColor('azotany', azotany))}</div>`,
                `<div class="parameter"><span class="dot ${getColor('chlor', chlor)}"></span> Chlor wolny: ${chlor} mg/l (norma: <0.3 mg/l) – ${getParameterDescription('chlor', chlor, getColor('chlor', chlor))}</div>`,
                `<div class="parameter"><span class="dot ${getColor('fluorki', fluorki)}"></span> Fluorki: ${fluorki} mg/l (norma: <1.5 mg/l) – ${getParameterDescription('fluorki', fluorki, getColor('fluorki', fluorki))}</div>`,
                `<div class="parameter"><span class="dot ${getColor('zelazo', zelazo)}"></span> Żelazo: ${zelazo} mg/l (norma: <0.2 mg/l) – ${getParameterDescription('zelazo', zelazo, getColor('zelazo', zelazo))}</div>`,
                `<div class="parameter"><span class="dot ${getColor('mangan', mangan)}"></span> Mangan: ${mangan} mg/l (norma: <0.05 mg/l) – ${getParameterDescription('mangan', mangan, getColor('mangan', mangan))}</div>`,
                `<div class="parameter"><span class="dot ${getColor('chlorki', chlorki)}"></span> Chlorki: ${chlorki} mg/l (norma: <250 mg/l) – ${getParameterDescription('chlorki', chlorki, getColor('chlorki', chlorki))}</div>`,
                `<div class="parameter"><span class="dot ${getColor('siarczany', siarczany)}"></span> Siarczany: ${siarczany} mg/l (norma: <250 mg/l) – ${getParameterDescription('siarczany', siarczany, getColor('siarczany', siarczany))}</div>`,
                `<div class="parameter"><span class="dot ${getColor('metnosc', metnosc)}"></span> Mętność: ${metnosc} NTU (norma: <1 NTU) – ${getParameterDescription('metnosc', metnosc, getColor('metnosc', metnosc))}</div>`,
                `<div class="parameter"><span class="dot ${getColor('barwa', barwa)}"></span> Barwa: ${barwa} mgPt/dm³ (norma: <15 mgPt/dm³) – ${getParameterDescription('barwa', barwa, getColor('barwa', barwa))}</div>`,
                `<div class="parameter"><span class="dot ${getColor('magnez', magnez)}"></span> Magnez: ${magnez} mg/l (korzysna: >50 mg/l) – ${getParameterDescription('magnez', magnez, getColor('magnez', magnez))}</div>`
            ];
            result += `
                <div class="station-card">
                    <h4>${station.name} (${station.address})</h4>
                    Jakość wody:<br>
                    ${parameters.join('')}
                </div>
            `;
            if (map) {
                L.marker(station.coords)
                    .addTo(map)
                    .bindPopup(`${station.name} (${station.address})`);
            }
        });
        result += `</div>`;
        document.getElementById('all-suw').innerHTML = result;
    } catch (error) {
        console.error('Błąd w showAllSUW:', error);
        document.getElementById('waterInfo').innerHTML = "Wystąpił błąd – sprawdź konsolę (F12).";
    }
}

export function showAllMeasurementPoints() {
    try {
        const cityInput = document.getElementById('city-premium');
        const waterInfo = document.getElementById('waterInfo');
        if (!cityInput || !waterInfo) return;

        const city = cityInput.value.trim();
        if (!city) {
            alert("Wpisz miasto!");
            return;
        }

        const measurementPoints = waterStations[city]?.measurementPoints || [];
        if (measurementPoints.length === 0) {
            waterInfo.innerHTML = "Brak punktów pomiarowych dla tego miasta.";
            return;
        }

        const mapElement = document.getElementById('map');
        if (mapElement && map) {
            mapElement.style.display = 'block';
            map.setView([measurementPoints[0].coords[0], measurementPoints[0].coords[1]], 12);
            setTimeout(() => map.invalidateSize(), 200);
            map.eachLayer(layer => {
                if (layer instanceof L.Marker) map.removeLayer(layer);
            });
        }

        let result = `<h3>Punkty pomiarowe w ${city}</h3>`;
        result += `<div class="stations-grid">`;
        measurementPoints.forEach(point => {
            const pH = parseFloat(point.data.pH).toFixed(2);
            const twardosc = parseFloat(point.data.twardosc).toFixed(2);
            const azotany = parseFloat(point.data.azotany).toFixed(2);
            const chlor = parseFloat(point.data.chlor).toFixed(2);
            const fluorki = parseFloat(point.data.fluorki).toFixed(2);
            const zelazo = parseFloat(point.data.zelazo).toFixed(2);
            const mangan = parseFloat(point.data.mangan).toFixed(2);
            const chlorki = parseFloat(point.data.chlorki).toFixed(2);
            const siarczany = parseFloat(point.data.siarczany).toFixed(2);
            const metnosc = parseFloat(point.data.metnosc).toFixed(2);
            const barwa = parseFloat(point.data.barwa).toFixed(2);
            const magnez = parseFloat(point.data.magnez || 0).toFixed(2);
            const parameters = [
                `<div class="parameter"><span class="dot ${getColor('pH', pH)}"></span> pH: ${pH} (norma: 6.5–9.5) – ${getParameterDescription('pH', pH, getColor('pH', pH))}</div>`,
                `<div class="parameter"><span class="dot ${getColor('twardosc', twardosc)}"></span> Twardość: ${twardosc} mg/l (optymalnie: <120 mg/l) – ${getParameterDescription('twardosc', twardosc, getColor('twardosc', twardosc))}</div>`,
                `<div class="parameter"><span class="dot ${getColor('azotany', azotany)}"></span> Azotany: ${azotany} mg/l (norma: <50 mg/l) – ${getParameterDescription('azotany', azotany, getColor('azotany', azotany))}</div>`,
                `<div class="parameter"><span class="dot ${getColor('chlor', chlor)}"></span> Chlor wolny: ${chlor} mg/l (norma: <0.3 mg/l) – ${getParameterDescription('chlor', chlor, getColor('chlor', chlor))}</div>`,
                `<div class="parameter"><span class="dot ${getColor('fluorki', fluorki)}"></span> Fluorki: ${fluorki} mg/l (norma: <1.5 mg/l) – ${getParameterDescription('fluorki', fluorki, getColor('fluorki', fluorki))}</div>`,
                `<div class="parameter"><span class="dot ${getColor('zelazo', zelazo)}"></span> Żelazo: ${zelazo} mg/l (norma: <0.2 mg/l) – ${getParameterDescription('zelazo', zelazo, getColor('zelazo', zelazo))}</div>`,
                `<div class="parameter"><span class="dot ${getColor('mangan', mangan)}"></span> Mangan: ${mangan} mg/l (norma: <0.05 mg/l) – ${getParameterDescription('mangan', mangan, getColor('mangan', mangan))}</div>`,
                `<div class="parameter"><span class="dot ${getColor('chlorki', chlorki)}"></span> Chlorki: ${chlorki} mg/l (norma: <250 mg/l) – ${getParameterDescription('chlorki', chlorki, getColor('chlorki', chlorki))}</div>`,
                `<div class="parameter"><span class="dot ${getColor('siarczany', siarczany)}"></span> Siarczany: ${siarczany} mg/l (norma: <250 mg/l) – ${getParameterDescription('siarczany', siarczany, getColor('siarczany', siarczany))}</div>`,
                `<div class="parameter"><span class="dot ${getColor('metnosc', metnosc)}"></span> Mętność: ${metnosc} NTU (norma: <1 NTU) – ${getParameterDescription('metnosc', metnosc, getColor('metnosc', metnosc))}</div>`,
                `<div class="parameter"><span class="dot ${getColor('barwa', barwa)}"></span> Barwa: ${barwa} mgPt/dm³ (norma: <15 mgPt/dm³) – ${getParameterDescription('barwa', barwa, getColor('barwa', barwa))}</div>`,
                `<div class="parameter"><span class="dot ${getColor('magnez', magnez)}"></span> Magnez: ${magnez} mg/l (korzysna: >50 mg/l) – ${getParameterDescription('magnez', magnez, getColor('magnez', magnez))}</div>`
            ];
            result += `
                <div class="station-card">
                    <h4>${point.name} (${point.address})</h4>
                    Jakość wody:<br>
                    ${parameters.join('')}
                </div>
            `;
            if (map) {
                L.marker(point.coords, { icon: L.divIcon({ className: 'measurement-point', html: '<div style="background-color: blue; width: 10px; height: 10px; border-radius: 50%;"></div>' }) })
                    .addTo(map)
                    .bindPopup(`${point.name} (${point.address})`);
            }
        });
        result += `</div>`;
        document.getElementById('all-points').innerHTML = result;
    } catch (error) {
        console.error('Błąd w showAllMeasurementPoints:', error);
        document.getElementById('waterInfo').innerHTML = "Wystąpił błąd – sprawdź konsolę (F12).";
    }
}

export function displayHistory(city) {
    try {
        const historyDiv = document.getElementById('history');
        if (!historyDiv) return;
        const stations = waterStations[city]?.stations || [];
        const cityAverage = waterStations[city]?.average || null;
        let result = `<h3>Historia parametrów wody w ${city}</h3>`;

        if (stations.length === 0) {
            result += "Brak danych dla tego miasta.";
            historyDiv.innerHTML = result;
            return;
        }

        result += `<div class="stations-grid">`;
        let hasHistory = false;
        stations.forEach(station => {
            const history = station.history || [];
            const currentData = station.data || {};
            if (history.length > 0) {
                hasHistory = true;
                result += `<div class="station-card"><h4>${station.name} (${station.address})</h4>`;
                result += `<div class="history-container">`;
                result += `<div class="history-data"><div class="history-label">Historyczne</div>`;
                history.forEach(record => {
                    result += `<div class="parameter-history"><strong>${record.date}</strong></div>`;
                    const parameters = [
                        { key: 'pH', label: 'pH', unit: '', norm: '6.5–9.5' },
                        { key: 'twardosc', label: 'Twardość', unit: 'mg/l', norm: '<120 mg/l' },
                        { key: 'azotany', label: 'Azotany', unit: 'mg/l', norm: '<50 mg/l' },
                        { key: 'chlor', label: 'Chlor wolny', unit: 'mg/l', norm: '<0.3 mg/l' },
                        { key: 'fluorki', label: 'Fluorki', unit: 'mg/l', norm: '<1.5 mg/l' }
                    ];
                    const variableParams = [
                        { key: 'zelazo', label: 'Żelazo', unit: 'mg/l', norm: '<0.2 mg/l' },
                        { key: 'mangan', label: 'Mangan', unit: 'mg/l', norm: '<0.05 mg/l' },
                        { key: 'chlorki', label: 'Chlorki', unit: 'mg/l', norm: '<250 mg/l' },
                        { key: 'siarczany', label: 'Siarczany', unit: 'mg/l', norm: '<250 mg/l' },
                        { key: 'metnosc', label: 'Mętność', unit: 'NTU', norm: '<1 NTU' },
                        { key: 'barwa', label: 'Barwa', unit: 'mgPt/dm³', norm: '<15 mgPt/dm³' },
                        { key: 'magnez', label: 'Magnez', unit: 'mg/l', norm: 'Korzystna: >50 mg/l' }
                    ].filter(param => record[param.key] !== undefined);
                    parameters.concat(variableParams.slice(0, 7)).forEach(param => {
                        const value = record[param.key] !== undefined ? parseFloat(record[param.key]).toFixed(2) : 'Brak danych';
                        result += `<div class="parameter-history">${param.label}: ${value}${param.unit}</div>`;
                    });
                });
                result += `</div>`;
                result += `<div class="current-data"><div class="current-label">Obecne</div>`;
                const currentParameters = [
                    { key: 'pH', label: 'pH', unit: '', norm: '6.5–9.5' },
                    { key: 'twardosc', label: 'Twardość', unit: 'mg/l', norm: '<120 mg/l' },
                    { key: 'azotany', label: 'Azotany', unit: 'mg/l', norm: '<50 mg/l' },
                    { key: 'chlor', label: 'Chlor wolny', unit: 'mg/l', norm: '<0.3 mg/l' },
                    { key: 'fluorki', label: 'Fluorki', unit: 'mg/l', norm: '<1.5 mg/l' }
                ];
                const currentVariableParams = [
                    { key: 'zelazo', label: 'Żelazo', unit: 'mg/l', norm: '<0.2 mg/l' },
                    { key: 'mangan', label: 'Mangan', unit: 'mg/l', norm: '<0.05 mg/l' },
                    { key: 'chlorki', label: 'Chlorki', unit: 'mg/l', norm: '<250 mg/l' },
                    { key: 'siarczany', label: 'Siarczany', unit: 'mg/l', norm: '<250 mg/l' },
                    { key: 'metnosc', label: 'Mętność', unit: 'NTU', norm: '<1 NTU' },
                    { key: 'barwa', label: 'Barwa', unit: 'mgPt/dm³', norm: '<15 mgPt/dm³' },
                    { key: 'magnez', label: 'Magnez', unit: 'mg/l', norm: 'Korzystna: >50 mg/l' }
                ].filter(param => currentData[param.key] !== undefined);
                currentParameters.concat(currentVariableParams.slice(0, 7)).forEach(param => {
                    let current = currentData[param.key];
                    if (typeof current === 'string') {
                        current = current.includes('–')
                            ? ((parseFloat(current.split('–')[0]) + parseFloat(current.split('–')[1])) / 2).toFixed(2)
                            : parseFloat(current).toFixed(2);
                    } else {
                        current = current ? parseFloat(current).toFixed(2) : 'Brak danych';
                    }
                    const color = getColor(param.key, current);
                    const lastHistoricalValue = history.length > 0 && history[0][param.key] !== undefined ? parseFloat(history[0][param.key]) : null;
                    let trend = '';
                    if (lastHistoricalValue !== null) {
                        if (parseFloat(current) > lastHistoricalValue) {
                            trend = ' <span style="color: red;">▲</span>';
                        } else if (parseFloat(current) < lastHistoricalValue) {
                            trend = ' <span style="color: green;">▼</span>';
                        } else {
                            trend = ' <span style="color: gray;">—</span>';
                        }
                    }
                    result += `<div class="parameter-history"><span class="dot ${color}"></span>${param.label}: ${current}${param.unit}${trend}</div>`;
                });
                result += `</div></div></div>`;
            }
        });
        result += `</div>`;

        if (hasHistory && cityAverage) {
            result += `<h4>Średnie dla ${city}</h4><div class="stations-grid"><div class="station-card">`;
            const cityParams = [
                { key: 'pH', label: 'pH', unit: '', norm: '6.5–9.5' },
                { key: 'twardosc', label: 'Twardość', unit: 'mg/l', norm: '<120 mg/l' },
                { key: 'azotany', label: 'Azotany', unit: 'mg/l', norm: '<50 mg/l' },
                { key: 'chlor', label: 'Chlor wolny', unit: 'mg/l', norm: '<0.3 mg/l' },
                { key: 'fluorki', label: 'Fluorki', unit: 'mg/l', norm: '<1.5 mg/l' },
                { key: 'zelazo', label: 'Żelazo', unit: 'mg/l', norm: '<0.2 mg/l' },
                { key: 'mangan', label: 'Mangan', unit: 'mg/l', norm: '<0.05 mg/l' },
                { key: 'chlorki', label: 'Chlorki', unit: 'mg/l', norm: '<250 mg/l' },
                { key: 'siarczany', label: 'Siarczany', unit: 'mg/l', norm: '<250 mg/l' },
                { key: 'metnosc', label: 'Mętność', unit: 'NTU', norm: '<1 NTU' },
                { key: 'barwa', label: 'Barwa', unit: 'mgPt/dm³', norm: '<15 mgPt/dm³' },
                { key: 'magnez', label: 'Magnez', unit: 'mg/l', norm: 'Korzystna: >50 mg/l' }
            ].filter(param => cityAverage[param.key] > 0);
            result += `<div class="history-container">`;
            result += `<div class="history-data"><div class="history-label">Historyczne</div>`;
            cityParams.forEach(param => {
                let historicalSum = 0, historicalCount = 0;
                stations.forEach(station => {
                    (station.history || []).forEach(entry => {
                        if (entry[param.key]) {
                            historicalSum += parseFloat(entry[param.key]);
                            historicalCount++;
                        }
                    });
                });
                const historical = historicalCount > 0 ? (historicalSum / historicalCount).toFixed(2) : 'Brak danych';
                result += `<div class="parameter-history">${param.label}: ${historical}${param.unit}</div>`;
            });
            result += `</div>`;
            result += `<div class="current-data"><div class="current-label">Obecne</div>`;
            cityParams.forEach(param => {
                const current = parseFloat(cityAverage[param.key]).toFixed(2);
                const color = getColor(param.key, current);
                let historicalSum = 0, historicalCount = 0;
                stations.forEach(station => {
                    (station.history || []).forEach(entry => {
                        if (entry[param.key]) {
                            historicalSum += parseFloat(entry[param.key]);
                            historicalCount++;
                        }
                    });
                });
                const historical = historicalCount > 0 ? (historicalSum / historicalCount).toFixed(2) : null;
                let trend = '';
                if (historical !== null) {
                    if (parseFloat(current) > historical) {
                        trend = ' <span style="color: red;">▲</span>';
                    } else if (parseFloat(current) < historical) {
                        trend = ' <span style="color: green;">▼</span>';
                    } else {
                        trend = ' <span style="color: gray;">—</span>';
                    }
                }
                result += `<div class="parameter-history"><span class="dot ${color}"></span>${param.label}: ${current}${param.unit}${trend}</div>`;
            });
            result += `</div></div></div></div>`;
        } else if (!hasHistory) {
            result += `<p>Brak danych historycznych dla tego miasta.</p>`;
        }

        historyDiv.innerHTML = result;
    } catch (error) {
        console.error('Błąd w displayHistory:', error);
        document.getElementById('history').innerHTML = "Wystąpił błąd – sprawdź konsolę (F12).";
    }
}