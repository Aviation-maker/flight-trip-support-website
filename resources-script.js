// Flight Resources Dashboard - JavaScript

let map; // Global map variable

// ============================================
// TAB SWITCHING FUNCTIONALITY
// ============================================

document.querySelectorAll('.resource-tab-btn').forEach(button => {
    button.addEventListener('click', () => {
        const tabName = button.getAttribute('data-tab');
        
        // Remove active class from all tabs and buttons
        document.querySelectorAll('.resource-tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.resource-tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add active class to clicked tab and button
        document.getElementById(tabName).classList.add('active');
        button.classList.add('active');
        
        // Initialize map if flight tracker tab is opened
        if (tabName === 'flight-tracker' && !map) {
            initializeMap();
        }
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});

// ============================================
// 1. LIVE FLIGHT TRACKER (OpenSky Network API)
// ============================================

let tracker = {
    map: null,
    marker: null,
    updateInterval: null,
    currentICAO: null
};

function initializeMap() {
    if (map) return; // Map already initialized
    
    map = L.map('flight-map').setView([20, 0], 3);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);
    
    tracker.map = map;
}

document.getElementById('track-btn').addEventListener('click', trackAircraft);
document.getElementById('icao-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') trackAircraft();
});

async function trackAircraft() {
    const icao = document.getElementById('icao-input').value.trim().toUpperCase();
    const messageEl = document.getElementById('tracker-message');
    
    if (!icao || icao.length !== 6) {
        showMessage('Please enter a valid 6-character ICAO address', 'error', messageEl);
        return;
    }
    
    messageEl.innerHTML = '<div class="loading"></div> Searching for aircraft...';
    
    try {
        // OpenSky Network API - Get all flights
        const response = await fetch('https://opensky-network.org/api/states/all');
        
        if (!response.ok) {
            throw new Error('Failed to fetch flight data');
        }
        
        const data = await response.json();
        const aircraft = data.states.find(flight => flight[0] && flight[0].toUpperCase() === icao);
        
        if (!aircraft) {
            showMessage('Aircraft not found. Make sure the ICAO address is correct and the aircraft is currently in flight.', 'error', messageEl);
            return;
        }
        
        // Extract data
        const callsign = aircraft[1] ? aircraft[1].trim() : 'N/A';
        const latitude = aircraft[6];
        const longitude = aircraft[5];
        const altitude = aircraft[7];
        const speed = aircraft[9];
        const track = aircraft[10];
        const verticalRate = aircraft[11];
        
        // Display data
        document.getElementById('callsign').textContent = callsign || 'N/A';
        document.getElementById('icao').textContent = aircraft[0];
        document.getElementById('latitude').textContent = latitude ? latitude.toFixed(4) : 'N/A';
        document.getElementById('longitude').textContent = longitude ? longitude.toFixed(4) : 'N/A';
        document.getElementById('altitude').textContent = altitude ? altitude.toFixed(0) : 'N/A';
        document.getElementById('speed').textContent = speed ? speed.toFixed(2) : 'N/A';
        document.getElementById('track').textContent = track ? track.toFixed(2) + '°' : 'N/A';
        document.getElementById('vertical-rate').textContent = verticalRate ? verticalRate.toFixed(2) + ' m/s' : 'N/A';
        
        // Show data section
        document.getElementById('flight-data').style.display = 'block';
        
        // Update map
        if (!map) initializeMap();
        
        if (latitude && longitude) {
            // Center map on aircraft
            map.setView([latitude, longitude], 8);
            
            // Remove old marker
            if (tracker.marker) {
                map.removeLayer(tracker.marker);
            }
            
            // Add new marker
            const rotationAngle = track || 0;
            tracker.marker = L.marker([latitude, longitude], {
                title: callsign
            }).bindPopup(`<b>${callsign}</b><br>ICAO: ${aircraft[0]}<br>Altitude: ${altitude ? altitude.toFixed(0) + 'm' : 'N/A'}<br>Speed: ${speed ? speed.toFixed(2) + ' m/s' : 'N/A'}`).addTo(map);
            
            document.getElementById('map-container').style.display = 'block';
        }
        
        showMessage(`✅ Successfully tracked ${callsign}! Data updated.`, 'success', messageEl);
        
    } catch (error) {
        console.error('Error:', error);
        showMessage('Error: ' + error.message + '. Please try again later.', 'error', messageEl);
    }
}

// ============================================
// 2. AIRPORT INFORMATION
// ============================================

document.getElementById('airport-btn').addEventListener('click', searchAirport);
document.getElementById('airport-code').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchAirport();
});

async function searchAirport() {
    const code = document.getElementById('airport-code').value.trim().toUpperCase();
    const messageEl = document.getElementById('airport-message');
    
    if (!code || code.length < 3) {
        showMessage('Please enter a valid airport code (IATA or ICAO)', 'error', messageEl);
        return;
    }
    
    messageEl.innerHTML = '<div class="loading"></div> Searching airport data...';
    
    try {
        // Using AeroDataBox data (via hardcoded database for free version)
        const airportDatabase = {
            'JFK': { name: 'John F. Kennedy International Airport', iata: 'JFK', icao: 'KJFK', city: 'New York', country: 'United States', tz: 'America/New_York' },
            'KJFK': { name: 'John F. Kennedy International Airport', iata: 'JFK', icao: 'KJFK', city: 'New York', country: 'United States', tz: 'America/New_York' },
            'LAX': { name: 'Los Angeles International Airport', iata: 'LAX', icao: 'KLAX', city: 'Los Angeles', country: 'United States', tz: 'America/Los_Angeles' },
            'KLAX': { name: 'Los Angeles International Airport', iata: 'LAX', icao: 'KLAX', city: 'Los Angeles', country: 'United States', tz: 'America/Los_Angeles' },
            'LHR': { name: 'London Heathrow Airport', iata: 'LHR', icao: 'EGLL', city: 'London', country: 'United Kingdom', tz: 'Europe/London' },
            'EGLL': { name: 'London Heathrow Airport', iata: 'LHR', icao: 'EGLL', city: 'London', country: 'United Kingdom', tz: 'Europe/London' },
            'CDG': { name: 'Paris Charles de Gaulle Airport', iata: 'CDG', icao: 'LFPG', city: 'Paris', country: 'France', tz: 'Europe/Paris' },
            'LFPG': { name: 'Paris Charles de Gaulle Airport', iata: 'CDG', icao: 'LFPG', city: 'Paris', country: 'France', tz: 'Europe/Paris' },
            'NRT': { name: 'Narita International Airport', iata: 'NRT', icao: 'RJAA', city: 'Tokyo', country: 'Japan', tz: 'Asia/Tokyo' },
            'RJAA': { name: 'Narita International Airport', iata: 'NRT', icao: 'RJAA', city: 'Tokyo', country: 'Japan', tz: 'Asia/Tokyo' },
            'SYD': { name: 'Sydney Kingsford Smith Airport', iata: 'SYD', icao: 'YSSY', city: 'Sydney', country: 'Australia', tz: 'Australia/Sydney' },
            'YSSY': { name: 'Sydney Kingsford Smith Airport', iata: 'SYD', icao: 'YSSY', city: 'Sydney', country: 'Australia', tz: 'Australia/Sydney' },
            'DXB': { name: 'Dubai International Airport', iata: 'DXB', icao: 'OMDB', city: 'Dubai', country: 'United Arab Emirates', tz: 'Asia/Dubai' },
            'OMDB': { name: 'Dubai International Airport', iata: 'DXB', icao: 'OMDB', city: 'Dubai', country: 'United Arab Emirates', tz: 'Asia/Dubai' }
        };
        
        const airport = airportDatabase[code];
        
        if (!airport) {
            showMessage('Airport not found. Please try another code.', 'error', messageEl);
            return;
        }
        
        // Display airport data
        document.getElementById('airport-name').textContent = airport.name;
        document.getElementById('airport-iata').textContent = airport.iata;
        document.getElementById('airport-icao').textContent = airport.icao;
        document.getElementById('airport-city').textContent = airport.city;
        document.getElementById('airport-country').textContent = airport.country;
        document.getElementById('airport-tz').textContent = airport.tz;
        
        document.getElementById('airport-data').style.display = 'block';
        showMessage(`✅ Airport information loaded: ${airport.name}`, 'success', messageEl);
        
    } catch (error) {
        console.error('Error:', error);
        showMessage('Error: ' + error.message, 'error', messageEl);
    }
}

// ============================================
// 3. FLIGHT STATUS CHECKER (Aviationstack)
// ============================================

document.getElementById('status-btn').addEventListener('click', checkFlightStatus);
document.getElementById('flight-number').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') checkFlightStatus();
});

async function checkFlightStatus() {
    const flightNumber = document.getElementById('flight-number').value.trim().toUpperCase();
    const messageEl = document.getElementById('status-message');
    
    if (!flightNumber || flightNumber.length < 3) {
        showMessage('Please enter a valid flight number (e.g., BA1234)', 'error', messageEl);
        return;
    }
    
    messageEl.innerHTML = '<div class="loading"></div> Checking flight status...';
    
    try {
        // Note: Requires API key from aviationstack.com
        // This is a demo implementation - replace with your actual API key
        const API_KEY = 'YOUR_AVIATIONSTACK_API_KEY';
        
        if (API_KEY === 'YOUR_AVIATIONSTACK_API_KEY') {
            throw new Error('API key not configured. Please register at aviationstack.com and add your key to the code.');
        }
        
        const response = await fetch(`https://api.aviationstack.com/v1/flights?access_key=${API_KEY}&flight_iata=${flightNumber}`);
        const data = await response.json();
        
        if (!data.data || data.data.length === 0) {
            showMessage('No flights found with that number. Please check the flight number.', 'error', messageEl);
            return;
        }
        
        const flight = data.data[0];
        
        document.getElementById('status-flight').textContent = flight.flight.iata || 'N/A';
        document.getElementById('status').textContent = flight.flight_status || 'N/A';
        document.getElementById('departure').textContent = flight.departure.airport + ' (' + (flight.departure.scheduled || 'N/A') + ')';
        document.getElementById('arrival').textContent = flight.arrival.airport + ' (' + (flight.arrival.scheduled || 'N/A') + ')';
        document.getElementById('airline').textContent = flight.airline.name || 'N/A';
        document.getElementById('aircraft').textContent = flight.aircraft ? flight.aircraft.registration : 'N/A';
        
        document.getElementById('status-data').style.display = 'block';
        showMessage('✅ Flight information retrieved successfully!', 'success', messageEl);
        
    } catch (error) {
        console.error('Error:', error);
        showMessage('Error: ' + error.message, 'error', messageEl);
    }
}

// ============================================
// 4. WEATHER BRIEFING (AVWX API)
// ============================================

document.getElementById('weather-btn').addEventListener('click', getWeatherBriefing);
document.getElementById('metar-code').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') getWeatherBriefing();
});

async function getWeatherBriefing() {
    const icaoCode = document.getElementById('metar-code').value.trim().toUpperCase();
    const messageEl = document.getElementById('weather-message');
    
    if (!icaoCode || icaoCode.length !== 4) {
        showMessage('Please enter a valid 4-character airport ICAO code (e.g., KJFK)', 'error', messageEl);
        return;
    }
    
    messageEl.innerHTML = '<div class="loading"></div> Fetching weather data...';
    
    try {
        // Fetch METAR
        const metarResponse = await fetch(`https://avwx.rest/api/station/${icaoCode}/metar`);
        const metarData = await metarResponse.json();
        
        if (!metarResponse.ok || metarData.error) {
            throw new Error('Unable to fetch METAR data. Check the airport code.');
        }
        
        // Display METAR
        document.getElementById('metar-raw').textContent = metarData.raw || 'N/A';
        document.getElementById('temp').textContent = metarData.temperature ? metarData.temperature.value + '°C' : 'N/A';
        document.getElementById('dewpoint').textContent = metarData.dewpoint ? metarData.dewpoint.value + '°C' : 'N/A';
        document.getElementById('wind').textContent = metarData.wind_speed ? metarData.wind_speed.value + ' ' + metarData.wind_speed.unit + ' from ' + metarData.wind_direction.value + '°' : 'N/A';
        document.getElementById('visibility').textContent = metarData.visibility ? metarData.visibility[0].value + ' ' + metarData.visibility[0].unit : 'N/A';
        document.getElementById('pressure').textContent = metarData.altimeter ? metarData.altimeter.value + ' ' + metarData.altimeter.unit : 'N/A';
        document.getElementById('flight-cat').textContent = metarData.flight_category || 'N/A';
        
        document.getElementById('metar-data').style.display = 'block';
        
        // Fetch TAF
        const tafResponse = await fetch(`https://avwx.rest/api/station/${icaoCode}/taf`);
        const tafData = await tafResponse.json();
        
        if (tafResponse.ok && !tafData.error) {
            document.getElementById('taf-raw').textContent = tafData.raw || 'N/A';
            document.getElementById('taf-data').style.display = 'block';
        }
        
        showMessage('✅ Weather briefing retrieved successfully!', 'success', messageEl);
        
    } catch (error) {
        console.error('Error:', error);
        showMessage('Error: ' + error.message, 'error', messageEl);
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function showMessage(message, type, element) {
    element.textContent = message;
    element.className = `message ${type}`;
    
    // Auto-hide after 5 seconds for info/success messages
    if (type === 'success' || type === 'info') {
        setTimeout(() => {
            element.className = 'message';
            element.textContent = '';
        }, 5000);
    }
}
