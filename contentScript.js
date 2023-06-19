// contentScript.js
// Function to generate .ics calendar file
function generateICS(events) {
    var calendarEvents = events.map(function(event) {
        return 'BEGIN:VEVENT\n' +
            'DTSTART:' + event.start.slice(0,8) + 'T' + event.start.slice(8) + '\n' +
            'DTEND:' + event.end.slice(0,8) + 'T' + event.end.slice(8) + '\n' +
            'SUMMARY:' + event.summary + '\n' +
            'END:VEVENT';
    }).join('\n');
    return 'BEGIN:VCALENDAR\nVERSION:2.0\n' + calendarEvents + '\nEND:VCALENDAR';
}

// Function to parse table data into events
function parseScheduleTable() {
    const events = [];
    const rows = document.querySelectorAll('#shift-list tr');
    rows.forEach(function(row) {
        const columns = row.querySelectorAll('td');
        if (columns.length >= 4) {
            const dateStr = columns[0].innerText;
            const startStr = columns[2].innerText;
            const endStr = columns[3].innerText;
            if (startStr !== '-' && endStr !== '-') {


                const dateParts = dateStr.split('/');
                const month = dateParts[0];  // Extract month
                const day = dateParts[1].split('(')[0];
                const year = new Date().getFullYear();

                console.log('dateStr:', dateStr);
                console.log('startStr:', startStr);
                console.log('endStr:', endStr);

                const startDate = new Date(year, month - 1, day, startStr.substr(0, 2), startStr.substr(3, 2));
                const endDate = new Date(year, month - 1, day, endStr.substr(0, 2), endStr.substr(3, 2));

                console.log('startDate:', startDate);
                console.log('endDate:', endDate);

                const event = {
                    start: startDate.toISOString().replace(/[-:]|(\.\d{3})|T|Z/g, ''),
                    end: endDate.toISOString().replace(/[-:]|(\.\d{3})|T|Z/g, ''),
                    summary: '勤務:' + startStr + ' - ' + endStr
                };
                events.push(event);
            }
        }
    });
    return events;
}

// Add button to generate .ics file from table data
var button = document.createElement('button');
button.innerText = 'カレンダーに追加';
button.style.position = 'fixed';
button.style.bottom = '10px';
button.style.right = '10px';

// Add styles
button.style.padding = '15px 30px';
button.style.fontSize = '1em';
button.style.backgroundColor = '#4CAF50';
button.style.color = 'white';
button.style.border = 'none';
button.style.borderRadius = '5px';
button.style.cursor = 'pointer';
button.style.transition = 'background-color 0.3s ease';


// Hover effect
button.onmouseover = function() {
    this.style.backgroundColor = '#45a049';
}
button.onmouseout = function() {
    this.style.backgroundColor = '#4CAF50';
}

button.onclick = function() {
    const events = parseScheduleTable();
    const calendar = generateICS(events);
    const blob = new Blob([calendar], {type: 'text/calendar;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'schedule.ics';
    link.click();
};
document.body.appendChild(button);


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "downloadSchedule") {
        var events = parseScheduleTable();
        var calendar = generateICS(events);
        var blob = new Blob([calendar], {type: 'text/calendar;charset=utf-8;'});
        var url = URL.createObjectURL(blob);
        var link = document.createElement('a');
        link.href = url;
        link.download = 'schedule.ics';
        link.click();
    }
});
