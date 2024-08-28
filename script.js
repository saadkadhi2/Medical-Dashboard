const btnList = document.querySelectorAll('.topMenuButton');
btnList.forEach(topMenuBtn => {
    topMenuBtn.addEventListener('click', () => {
        document.querySelector('.topMenuButtonVisited')?.classList.remove('topMenuButtonVisited');
        topMenuBtn.classList.add('topMenuButtonVisited');
    });
});
const credentials = btoa('coalition:skills-test');
let jessica;
fetch('https://fedskillstest.coalitiontechnologies.workers.dev', {
    method: 'GET',
    headers: {
        'Authorization': `Basic ${credentials}`
    }
})
    .then(response => response.json())
    .then(data => {
        jessica = data.find(patient => patient.name === 'Jessica Taylor');
        if (jessica) {
            const sortedData = [...jessica.diagnosis_history].sort((a, b) => {
                const dateA = new Date(`${a.year}-${getMonthNumber(a.month)}-01`);
                const dateB = new Date(`${b.year}-${getMonthNumber(b.month)}-01`);
                return dateB - dateA;
            });
            const filteredData = sortedData.slice(-6);
            const lastRecord = filteredData[filteredData.length - 1];
            const labels = filteredData.map(entry => entry.month.substring(0,3) + ', ' + entry.year);
            const systolicBP = filteredData.map(entry => entry.blood_pressure.systolic.value);
            const diastolicBP = filteredData.map(entry => entry.blood_pressure.diastolic.value);
            updateBPInfo(systolicBP[systolicBP.length - 1], diastolicBP[diastolicBP.length - 1]);
            updateHealthParameters(lastRecord);
            document.querySelector('.selectedTime').textContent = "Last 6 months";
            createChart(labels, systolicBP, diastolicBP);
            updateChart(6);
        }
    });
function updateBPInfo(systolic, diastolic) {
    const systolicIndicator = document.getElementById('sysIndicator');
    const diastolicIndicator = document.getElementById('diaIndicator');
    const systolicAmount = document.getElementById('systolicAmount');
    const diastolicAmount = document.getElementById('diastolicAmount');
    const averageSystolic = document.querySelector('.averageSystolic');
    const averageDiastolic = document.querySelector('.averageDiastolic');

    systolicAmount.textContent = systolic;
    diastolicAmount.textContent = diastolic;

    if (systolic > 120) {
        averageSystolic.textContent = 'Higher than average';
        systolicIndicator.src = "./images/ArrowUp.png";
    } else {
        averageSystolic.textContent = 'Lower than average';
        systolicIndicator.src = "./images/ArrowDown.png";
    }
    if (diastolic < 80) {
        averageDiastolic.textContent = 'Lower than average';
        diastolicIndicator.src = "./images/ArrowDown.png";
    } else {
        averageDiastolic.textContent = 'Higher than average';
        diastolicIndicator.src = "./images/ArrowUp.png";
    }
}
function updateHealthParameters(lastRecord) {
    console.log('Updating health parameters with lastRecord:', lastRecord);

    const respiratoryRate = lastRecord.respiratory_rate.value;
    const temperature = lastRecord.temperature.value;
    const heartRate = lastRecord.heart_rate.value;

    console.log('Respiratory Rate:', respiratoryRate);
    console.log('Temperature:', temperature);
    console.log('Heart Rate:', heartRate);

    document.querySelector('.respiratoryAmount').textContent = `${respiratoryRate} bpm`;
    if (respiratoryRate > 18) {
        document.querySelector('.averageRespiratory').textContent = '⮝ Higher than normal';
    } else if (respiratoryRate > 12) {
        document.querySelector('.averageRespiratory').textContent = 'Normal';
    } else {
        document.querySelector('.averageRespiratory').textContent = '⮟ Lower than normal';
    }

    document.querySelector('.temperatureAmount').textContent = `${temperature}°F`;
    if (temperature > 98.6) {
        document.querySelector('.averageTemp').textContent = '⮝ Higher than normal';
    } else if (heartRate > 97){
        document.querySelector('.averageTemp').textContent = 'Normal';
    } else {
        document.querySelector('.averageTemp').textContent = '⮟ Lower than normal';
    }

    document.querySelector('.heartAmount').textContent = `${heartRate} bpm`;
    if (heartRate > 100) {
        document.querySelector('.averageHeart').textContent = '⮝ Higher than normal';
    } else if (heartRate > 60) {
        document.querySelector('.averageHeart').textContent = 'Normal';
    } else {
        document.querySelector('.averageHeart').textContent = '⮟ Lower than normal';
    }
}
function createChart(labels, systolicBP, diastolicBP) {
    const ctx = document.getElementById('myChart');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    data: systolicBP,
                    borderColor: '#E66FD2',
                    borderWidth: 2,
                    tension: 0.4,
                    pointStyle: 'circle',
                    pointRadius: 5,
                    pointBackgroundColor: '#E66FD2',
                    pointBorderColor: '#E66FD2'
                },
                {
                    data: diastolicBP,
                    borderColor: '#8C6FE6',
                    borderWidth: 2,
                    tension: 0.4,
                    pointStyle: 'circle',
                    pointRadius: 5,
                    pointBackgroundColor: '#8C6FE6',
                    pointBorderColor: '#8C6FE6'
                }
            ]
        },
        options: {
            maintainAspectRatio: false,
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            family: "'Manrope', sans-serif",
                            size: 12
                        },
                        maxRotation: 0,
                        minRotation: 0
                    },
                    title: {
                        font: {
                            family: "'Manrope', sans-serif",
                            size: 12
                        }
                    }
                },
                y: {
                    beginAtZero: false,
                    suggestedMin: 60,
                    suggestedMax: 180,
                    ticks: {
                        font: {
                            family: "'Manrope', sans-serif",
                            size: 12,
                        }
                    },
                    title: {
                        font: {
                            family: "'Manrope', sans-serif",
                            size: 12
                        }
                    }

                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}
document.querySelectorAll('.dropdownContent p').forEach(item => {
    item.addEventListener('click', event => {
        const selectedTime = event.target.getAttribute('timeSpan');
        document.querySelector('.selectedTime').textContent = "Last " + event.target.textContent;
        updateChart(selectedTime);
    });
});
function updateChart(timePeriod) {
    const sortedData = [...jessica.diagnosis_history].sort((a, b) => {
        const dateA = new Date(`${a.year}-${getMonthNumber(a.month)}-01`);
        const dateB = new Date(`${b.year}-${getMonthNumber(b.month)}-01`);
        return dateB - dateA;
    });

    const filteredData = sortedData.slice(0, timePeriod); // Slice the first `timePeriod` elements
    const labels = filteredData.map(entry => entry.month.substring(0, 3) + ', ' + entry.year);
    const systolicBP = filteredData.map(entry => entry.blood_pressure.systolic.value);
    const diastolicBP = filteredData.map(entry => entry.blood_pressure.diastolic.value);

    const chart = Chart.getChart("myChart");
    chart.data.labels = labels.reverse();
    chart.data.datasets[0].data = systolicBP.reverse();
    chart.data.datasets[1].data = diastolicBP.reverse();
    chart.update();
}

function getMonthNumber(monthName) {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return monthNames.indexOf(monthName) + 1;
}