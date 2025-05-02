import { waterStations, bottleData } from './waterAnalysis.js';
import { getColor } from './utils.js';
import { currentUser } from './main.js';

export let userRatings = [
    { waterType: "kranowa", waterName: "Koszalin", rating: 4, username: "WodnyFan", timestamp: "2025-04-22 10:00:00" },
    { waterType: "butelkowana", waterName: "Nałęczowianka", rating: 5, username: "AquaManiak", timestamp: "2025-04-22 10:05:00" },
    { waterType: "kranowa", waterName: "Olsztyn", rating: 3, username: "WodnyFan", timestamp: "2025-04-23 09:00:00" }
];

export function generateRanking(parameter = "twardosc") {
    try {
        const rankingsDiv = document.getElementById('rankings');
        if (!rankingsDiv) return;

        let ranking = Object.keys(waterStations).map(city => ({
            city,
            value: parseFloat(waterStations[city].average[parameter])
        }));

        ranking.sort((a, b) => {
            if (parameter === "pH") {
                return Math.abs(a.value - 7) - Math.abs(b.value - 7);
            }
            return a.value - b.value;
        });

        let result = `<h3>Ranking miast (${parameter})</h3>`;
        result += `<h4>5 najlepszych:</h4><ol>`;
        ranking.slice(0, 5).forEach((item, index) => {
            let medal = '';
            if (index === 0) {
                medal = `<svg width="40" height="40" viewBox="0 0 24 24"><path d="M12 2C10 2 9 4 9 6C9 8 10 10 12 12C14 10 15 8 15 6C15 4 14 2 12 2Z M12 14C10 14 6 16 6 20C6 22 12 22 12 22C12 22 18 22 18 20C18 16 14 14 12 14Z" fill="#FFD700"/></svg>`;
            } else if (index === 1) {
                medal = `<svg width="40" height="40" viewBox="0 0 24 24"><path d="M12 2C10 2 9 4 9 6C9 8 10 10 12 12C14 10 15 8 15 6C15 4 14 2 12 2Z M12 14C10 14 6 16 6 20C6 22 12 22 12 22C12 22 18 22 18 20C18 16 14 14 12 14Z" fill="#C0C0C0"/></svg>`;
            } else if (index === 2) {
                medal = `<svg width="40" height="40" viewBox="0 0 24 24"><path d="M12 2C10 2 9 4 9 6C9 8 10 10 12 12C14 10 15 8 15 6C15 4 14 2 12 2Z M12 14C10 14 6 16 6 20C6 22 12 22 12 22C12 22 18 22 18 20C18 16 14 14 12 14Z" fill="#CD7F32"/></svg>`;
            }
            result += `<li>${item.city}: ${item.value} ${parameter === "twardosc" || parameter === "azotany" || parameter === "zelazo" || parameter === "mangan" || parameter === "fluorki" || parameter === "potas" ? "mg/l" : ""} ${medal}</li>`;
        });
        result += "</ol><h4>5 najgorszych:</h4><ol>";
        ranking.slice(-5).reverse().forEach((item, index) => {
            let warning = '';
            if (index === 0) {
                warning = '<span style="color: #FF0000;">💧</span> <span style="color: #FF0000;">– Za twarda!</span>';
            } else if (index === 1) {
                warning = '<span style="color: #FF0000;">🚱</span> <span style="color: #FF0000;">– Za twarda!</span>';
            } else if (index === 2) {
                warning = '<span style="color: #FF0000;">🔴</span> <span style="color: #FF0000;">– Za twarda!</span>';
            } else if (index === 3) {
                warning = '<span style="color: #FF0000;">😕</span> <span style="color: #FF0000;">– Za twarda!</span>';
            } else {
                warning = '<span style="color: #FF0000;">⚠️</span> <span style="color: #FF0000;">– Za twarda!</span>';
            }
            result += `<li>${item.city}: ${item.value} ${parameter === "twardosc" || parameter === "azotany" || parameter === "zelazo" || parameter === "mangan" || parameter === "fluorki" || parameter === "potas" ? "mg/l" : ""} ${warning}</li>`;
        });
        result += "</ol>";

        rankingsDiv.innerHTML = result;
    } catch (error) {
        console.error('Błąd w generateRanking:', error);
        document.getElementById('rankings').innerHTML = "Wystąpił błąd – sprawdź konsolę (F12).";
    }
}

export function generateSUWRanking(city, parameter) {
    try {
        const rankingsDiv = document.getElementById('rankings');
        if (!rankingsDiv) {
            console.error('Brak elementu #rankings');
            return;
        }

        if (localStorage.getItem('isPremium') !== 'true') {
            rankingsDiv.innerHTML = `<p>Tylko dla Premium! Przejdź na Premium za 9,99 zł/mc na <a href="https://x.ai/grok">x.ai/grok</a>.</p>`;
            return;
        }

        const stations = waterStations[city]?.stations || [];
        if (stations.length === 0) {
            rankingsDiv.innerHTML = `<h3>Brak danych dla ${city}</h3>`;
            return;
        }

        let ranking = stations.map(station => {
            let value = station.data[parameter];
            if (typeof value === 'string' && value.includes("–")) {
                const range = value.split("–");
                value = (parseFloat(range[0]) + parseFloat(range[1])) / 2;
            } else {
                value = parseFloat(value);
            }
            return { name: station.name, address: station.address, value };
        });

        ranking.sort((a, b) => {
            if (parameter === "pH") {
                return Math.abs(a.value - 7) - Math.abs(b.value - 7);
            }
            return a.value - b.value;
        });

        let result = `<h3>Ranking SUW w ${city} (${parameter})</h3>`;
        result += `<ol>`;
        ranking.forEach((item, index) => {
            const unit = parameter === "twardosc" || parameter === "azotany" || parameter === "zelazo" || parameter === "mangan" || parameter === "fluorki" || parameter === "potas" ? "mg/l" : "";
            const color = getColor(parameter, item.value);
            let warning = '';
            if (index === ranking.length - 1 && color === "red") {
                warning = '<span style="color: #f44336;"> – Za wysoka wartość!</span>';
            } else if (index === 1 && color === "orange") {
                warning = '<span style="color: #ff9800;"> – Rozważ filtr!</span>';
            }
            result += `<li>${item.name} (${item.address}): ${item.value.toFixed(2)} ${unit} <span class="dot ${color}"></span> ${warning}</li>`;
        });
        result += `</ol>`;

        rankingsDiv.innerHTML = result;
    } catch (error) {
        console.error('Błąd w generateSUWRanking:', error);
        document.getElementById('rankings').innerHTML = "Wystąpił błąd – sprawdź konsolę (F12).";
    }
}

export function submitUserRating() {
    try {
        if (!currentUser) {
            alert('Proszę się zalogować!');
            return;
        }

        const waterType = document.getElementById('water-type').value;
        const waterName = document.getElementById('water-name').value.trim();
        const rating = parseInt(document.getElementById('water-rating').value);

        if (!waterName) {
            alert('Proszę wpisać nazwę wody!');
            return;
        }

        userRatings.push({
            waterType: waterType,
            waterName: waterName,
            rating: rating,
            username: currentUser,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
        });

        document.getElementById('water-name').value = '';
        displayUserRankings();
    } catch (error) {
        console.error('Błąd w submitUserRating:', error);
        alert('Wystąpił błąd – sprawdź konsolę (F12).');
    }
}

export function displayUserRankings(filterType = "wszystkie") {
    try {
        const rankingsDiv = document.getElementById('user-rankings');
        if (!rankingsDiv) return;

        let filteredRatings = userRatings;
        if (filterType === "kranowa") {
            filteredRatings = userRatings.filter(rating => rating.waterType === "kranowa");
        } else if (filterType === "butelkowana") {
            filteredRatings = userRatings.filter(rating => rating.waterType === "butelkowana");
        }

        const aggregatedRatings = {};
        filteredRatings.forEach(rating => {
            const key = `${rating.waterType}-${rating.waterName}`;
            if (!aggregatedRatings[key]) {
                aggregatedRatings[key] = {
                    waterType: rating.waterType,
                    waterName: rating.waterName,
                    ratings: [],
                    total: 0,
                    count: 0
                };
            }
            aggregatedRatings[key].ratings.push(rating);
            aggregatedRatings[key].total += rating.rating;
            aggregatedRatings[key].count += 1;
        });

        const rankedWaters = Object.values(aggregatedRatings).map(item => {
            const average = item.total / item.count;
            return {
                waterType: item.waterType,
                waterName: item.waterName,
                averageRating: average.toFixed(1),
                count: item.count
            };
        });
        rankedWaters.sort((a, b) => b.averageRating - a.averageRating);

        let result = `<h3>Ranking wód według użytkowników (${filterType === "kranowa" ? "Woda kranowa" : filterType === "butelkowana" ? "Woda butelkowana" : "Wszystkie wody"})</h3>`;
        result += `<ol>`;
        rankedWaters.forEach((item, index) => {
            let medal = '';
            if (index === 0) {
                medal = `<svg width="32" height="32" viewBox="0 0 24 24"><path d="M12 2C10 2 9 4 9 6C9 8 10 10 12 12C14 10 15 8 15 6C15 4 14 2 12 2Z M12 14C10 14 6 16 6 20C6 22 12 22 12 22C12 22 18 22 18 20C18 16 14 14 12 14Z" fill="#FFD700"/></svg>`;
            } else if (index === 1) {
                medal = `<svg width="32" height="32" viewBox="0 0 24 24"><path d="M12 2C10 2 9 4 9 6C9 8 10 10 12 12C14 10 15 8 15 6C15 4 14 2 12 2Z M12 14C10 14 6 16 6 20C6 22 12 22 12 22C12 22 18 22 18 20C18 16 14 14 12 14Z" fill="#C0C0C0"/></svg>`;
            } else if (index === 2) {
                medal = `<svg width="32" height="32" viewBox="0 0 24 24"><path d="M12 2C10 2 9 4 9 6C9 8 10 10 12 12C14 10 15 8 15 6C15 4 14 2 12 2Z M12 14C10 14 6 16 6 20C6 22 12 22 12 22C12 22 18 22 18 20C18 16 14 14 12 14Z" fill="#CD7F32"/></svg>`;
            }
            result += `
                <li class="user-ranking-item">
                    ${item.waterType === 'kranowa' ? 'Kranówka' : 'Butelkowana'} – ${item.waterName}: 
                    <span class="rating">${item.averageRating} / 5</span> 
                    (${item.count} ocen) ${medal}
                </li>`;
        });
        result += `</ol>`;

        rankingsDiv.innerHTML = result;
    } catch (error) {
        console.error('Błąd w displayUserRankings:', error);
        document.getElementById('user-rankings').innerHTML = "Wystąpił błąd – sprawdź konsolę (F12).";
    }
}

export function generateBottleRanking(parameter = "wapn") {
    try {
        const rankingsDiv = document.getElementById('bottle-rankings'); // Zmieniamy na #bottle-rankings
        if (!rankingsDiv) {
            console.error('Brak elementu #bottle-rankings');
            return;
        }

        let ranking = Object.keys(bottleData).map(bottle => ({
            bottle,
            value: parseFloat(bottleData[bottle][parameter].value)
        }));

        ranking.sort((a, b) => {
            if (parameter === "pH") {
                return Math.abs(a.value - 7) - Math.abs(b.value - 7);
            } else if (parameter === "sod" || parameter === "fluorki") {
                return a.value - b.value;
            }
            return b.value - a.value;
        });

        let result = `<h3>Ranking wód butelkowanych (${parameter})</h3>`;
        result += `<h4>Top wód:</h4><ol>`;
        ranking.forEach((item, index) => {
            let medal = '';
            if (index === 0) {
                medal = `<svg width="40" height="40" viewBox="0 0 24 24"><path d="M12 2C10 2 9 4 9 6C9 8 10 10 12 12C14 10 15 8 15 6C15 4 14 2 12 2Z M12 14C10 14 6 16 6 20C6 22 12 22 12 22C12 22 18 22 18 20C18 16 14 14 12 14Z" fill="#FFD700"/></svg>`;
            } else if (index === 1) {
                medal = `<svg width="40" height="40" viewBox="0 0 24 24"><path d="M12 2C10 2 9 4 9 6C9 8 10 10 12 12C14 10 15 8 15 6C15 4 14 2 12 2Z M12 14C10 14 6 16 6 20C6 22 12 22 12 22C12 22 18 22 18 20C18 16 14 14 12 14Z" fill="#C0C0C0"/></svg>`;
            } else if (index === 2) {
                medal = `<svg width="40" height="40" viewBox="0 0 24 24"><path d="M12 2C10 2 9 4 9 6C9 8 10 10 12 12C14 10 15 8 15 6C15 4 14 2 12 2Z M12 14C10 14 6 16 6 20C6 22 12 22 12 22C12 22 18 22 18 20C18 16 14 14 12 14Z" fill="#CD7F32"/></svg>`;
            }
            result += `<li>${item.bottle}: ${item.value} ${parameter === "wapn" || parameter === "magnez" || parameter === "sod" || parameter === "potas" || parameter === "fluorki" ? "mg/l" : ""} <span class="dot ${bottleData[item.bottle][parameter].color}"></span> ${medal}</li>`;
        });
        result += `</ol>`;

        rankingsDiv.innerHTML = result;
    } catch (error) {
        console.error('Błąd w generateBottleRanking:', error);
        document.getElementById('bottle-rankings').innerHTML = "Wystąpił błąd – sprawdź konsolę (F12)."; // Zmieniamy na #bottle-rankings
    }
}

export function displayUserBottleRankings() {
    try {
        const rankingsDiv = document.getElementById('user-rankings');
        if (!rankingsDiv) return;

        const bottleRatings = userRatings.filter(rating => rating.waterType === "butelkowana");
        const aggregatedRatings = {};
        bottleRatings.forEach(rating => {
            const key = `${rating.waterType}-${rating.waterName}`;
            if (!aggregatedRatings[key]) {
                aggregatedRatings[key] = {
                    waterType: rating.waterType,
                    waterName: rating.waterName,
                    ratings: [],
                    total: 0,
                    count: 0
                };
            }
            aggregatedRatings[key].ratings.push(rating);
            aggregatedRatings[key].total += rating.rating;
            aggregatedRatings[key].count += 1;
        });

        const rankedWaters = Object.values(aggregatedRatings).map(item => {
            const average = item.total / item.count;
            return {
                waterType: item.waterType,
                waterName: item.waterName,
                averageRating: average.toFixed(1),
                count: item.count
            };
        });
        rankedWaters.sort((a, b) => b.averageRating - a.averageRating);

        let result = `<h3>Ranking wód butelkowanych według użytkowników</h3>`;
        result += `<ol>`;
        rankedWaters.forEach((item, index) => {
            let medal = '';
            if (index === 0) {
                medal = `<svg width="32" height="32" viewBox="0 0 24 24"><path d="M12 2C10 2 9 4 9 6C9 8 10 10 12 12C14 10 15 8 15 6C15 4 14 2 12 2Z M12 14C10 14 6 16 6 20C6 22 12 22 12 22C12 22 18 22 18 20C18 16 14 14 12 14Z" fill="#FFD700"/></svg>`;
            } else if (index === 1) {
                medal = `<svg width="32" height="32" viewBox="0 0 24 24"><path d="M12 2C10 2 9 4 9 6C9 8 10 10 12 12C14 10 15 8 15 6C15 4 14 2 12 2Z M12 14C10 14 6 16 6 20C6 22 12 22 12 22C12 22 18 22 18 20C18 16 14 14 12 14Z" fill="#C0C0C0"/></svg>`;
            } else if (index === 2) {
                medal = `<svg width="32" height="32" viewBox="0 0 24 24"><path d="M12 2C10 2 9 4 9 6C9 8 10 10 12 12C14 10 15 8 15 6C15 4 14 2 12 2Z M12 14C10 14 6 16 6 20C6 22 12 22 12 22C12 22 18 22 18 20C18 16 14 14 12 14Z" fill="#CD7F32"/></svg>`;
            }
            result += `
                <li class="user-ranking-item">
                    ${item.waterName}: 
                    <span class="rating">${item.averageRating} / 5</span> 
                    (${item.count} ocen) ${medal}
                </li>`;
        });
        result += `</ol>`;

        rankingsDiv.innerHTML = result;
    } catch (error) {
        console.error('Błąd w displayUserBottleRankings:', error);
        document.getElementById('user-rankings').innerHTML = "Wystąpił błąd – sprawdź konsolę (F12).";
    }
}