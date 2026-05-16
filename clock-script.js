// Multi-Timezone Clock Script

const timezones = {
    'UTC': 'UTC',
    'America/New_York': 'EST - New York',
    'America/Chicago': 'CST - Chicago',
    'America/Denver': 'MST - Denver',
    'America/Los_Angeles': 'PST - Los Angeles',
    'Europe/London': 'GMT - London',
    'Europe/Paris': 'CET - Paris',
    'Europe/Moscow': 'MSK - Moscow',
    'Asia/Dubai': 'GST - Dubai',
    'Asia/Kolkata': 'IST - India',
    'Asia/Bangkok': 'ICT - Bangkok',
    'Asia/Shanghai': 'CST - Shanghai',
    'Asia/Tokyo': 'JST - Tokyo',
    'Asia/Hong_Kong': 'HKT - Hong Kong',
    'Asia/Singapore': 'SGT - Singapore',
    'Australia/Sydney': 'AEDT - Sydney',
    'Australia/Melbourne': 'AEDT - Melbourne',
    'Pacific/Auckland': 'NZDT - New Zealand',
    'America/Toronto': 'EST - Toronto',
    'America/Mexico_City': 'CST - Mexico City',
    'America/Sao_Paulo': 'BRT - São Paulo',
    'Africa/Johannesburg': 'SAST - Johannesburg',
    'Africa/Cairo': 'EET - Cairo'
};

const clocksContainer = document.getElementById('clocks-container');
const addBtn = document.getElementById('add-btn');
const addSelect = document.getElementById('add-timezone');
const defaultMessage = document.getElementById('default-message');

let activeClocks = new Set();

// Function to get GMT offset
function getGMTOffset(timezone) {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });

    const parts = formatter.formatToParts(now);
    const tzDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    const offset = (tzDate - now) / (1000 * 60 * 60);
    const sign = offset >= 0 ? '+' : '';
    return `GMT ${sign}${offset.toFixed(1)}`;
}

// Function to format time for a specific timezone
function getTimeInTimezone(timezone) {
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    return formatter.format(new Date());
}

// Function to format date for a specific timezone
function getDateInTimezone(timezone) {
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    return formatter.format(new Date());
}

// Function to create a clock card
function createClockCard(timezone) {
    const card = document.createElement('div');
    card.className = 'clock-card';
    card.id = `clock-${timezone}`;

    const time = getTimeInTimezone(timezone);
    const date = getDateInTimezone(timezone);
    const gmtOffset = getGMTOffset(timezone);
    const name = timezones[timezone];

    card.innerHTML = `
        <div class="timezone-info">
            <div class="timezone-name">${name}</div>
            <div class="gmt-offset">${gmtOffset}</div>
        </div>
        <div class="time-display" id="time-${timezone}">${time}</div>
        <div class="date-display">${date}</div>
        <button class="remove-btn" onclick="removeClock('${timezone}')">Remove</button>
    `;

    return card;
}

// Function to add a clock
function addClock(timezone) {
    if (!timezone) {
        alert('Please select a timezone');
        return;
    }

    if (activeClocks.has(timezone)) {
        alert('This timezone is already displayed');
        return;
    }

    activeClocks.add(timezone);
    const card = createClockCard(timezone);
    clocksContainer.appendChild(card);
    defaultMessage.classList.add('hidden');
    addSelect.value = '';

    // Update time immediately and then every second
    updateClockTime(timezone);
}

// Function to remove a clock
function removeClock(timezone) {
    activeClocks.delete(timezone);
    const card = document.getElementById(`clock-${timezone}`);
    if (card) {
        card.style.animation = 'slideUp 0.3s ease-out reverse';
        setTimeout(() => {
            card.remove();
            if (activeClocks.size === 0) {
                defaultMessage.classList.remove('hidden');
            }
        }, 300);
    }
}

// Function to update clock time
function updateClockTime(timezone) {
    const timeElement = document.getElementById(`time-${timezone}`);
    if (timeElement) {
        const time = getTimeInTimezone(timezone);
        timeElement.textContent = time;
    }
}

// Function to update all clocks
function updateAllClocks() {
    activeClocks.forEach(timezone => {
        updateClockTime(timezone);
    });
}

// Add event listener to add button
addBtn.addEventListener('click', () => {
    addClock(addSelect.value);
});

// Add event listener to select for Enter key
addSelect.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addClock(addSelect.value);
    }
});

// Update all clocks every second
setInterval(updateAllClocks, 1000);

// Initialize with UTC clock
window.addEventListener('load', () => {
    addClock('UTC');
});
