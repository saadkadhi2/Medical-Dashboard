const btnList = document.querySelectorAll('.topMenuButton');
btnList.forEach(topMenuBtn => {
    topMenuBtn.addEventListener('click', () => {
        document.querySelector('.topMenuButtonVisited')?.classList.remove('topMenuButtonVisited');
        topMenuBtn.classList.add('topMenuButtonVisited');
    });
});
let myChartInstance;
const credentials = btoa('coalition:skills-test');
let patientData;

fetch('https://fedskillstest.coalitiontechnologies.workers.dev', {
    method: 'GET',
    headers: {
        'Authorization': `Basic ${credentials}`
    }
})
    .then(response => response.json())
    .then(data => {
        patientData = data;
        const container = document.querySelector('.custom-scrollbar-css');
        container.innerHTML = '';
        data.forEach(patient => {
            const profileCard = document.createElement('div');
            profileCard.classList.add('profileCard');

            profileCard.addEventListener('click', () => {
                document.querySelector('.profileCardVisited')?.classList.remove('profileCardVisited');
                profileCard.classList.add('profileCardVisited');
                selectPatient(patient);
            });

            const profileImage = document.createElement('img');
            profileImage.src = patient.profile_picture || './images/default.png';
            profileImage.height = 48;
            profileCard.appendChild(profileImage);

            const textContainer = document.createElement('div');
            textContainer.style.display = 'flex';
            textContainer.style.flexDirection = 'column';
            textContainer.style.marginLeft = '18px';
            textContainer.style.marginTop = '4px';

            const profileName = document.createElement('p');
            profileName.id = 'profileName';
            profileName.textContent = patient.name;
            profileName.style.fontWeight = 'bold';
            profileName.style.margin = '0';
            profileName.style.paddingBottom = '3px';
            textContainer.appendChild(profileName);

            const profileGenderAge = document.createElement('p');
            profileGenderAge.id = 'profileGenderAge';
            profileGenderAge.textContent = `${patient.gender}, ${patient.age}`;
            profileGenderAge.style.margin = '0';
            textContainer.appendChild(profileGenderAge);

            profileCard.appendChild(textContainer);

            const moreIcon = document.createElement('img');
            moreIcon.src = './images/more_horiz_FILL0_wght300_GRAD0_opsz24.png';
            moreIcon.style.marginLeft = 'auto';
            moreIcon.style.marginRight = '15px';
            moreIcon.width = 18;
            moreIcon.height = 4;
            profileCard.appendChild(moreIcon);

            container.appendChild(profileCard);
        });
        if (patientData.length > 0) {
            selectPatient(patientData[0]);
        }
    });


function selectPatient(patient) {
    document.querySelector('.profileCardVisited')?.classList.remove('profileCardVisited');
    const allProfileCards = document.querySelectorAll('.profileCard');
    allProfileCards.forEach(card => {
        const nameElement = card.querySelector('p');
        if (nameElement.textContent === patient.name) {
            card.classList.add('profileCardVisited');
        }
    });
    const sortedData = [...patient.diagnosis_history].sort((a, b) => {
        const dateA = new Date(`${a.year}-${getMonthNumber(a.month)}-01`);
        const dateB = new Date(`${b.year}-${getMonthNumber(b.month)}-01`);
        return dateB - dateA;
    });
    const filteredData = sortedData.slice(-6);
    const lastRecord = filteredData[filteredData.length - 1];
    const labels = filteredData.map(entry => entry.month.substring(0, 3) + ', ' + entry.year);
    const systolicBP = filteredData.map(entry => entry.blood_pressure.systolic.value);
    const diastolicBP = filteredData.map(entry => entry.blood_pressure.diastolic.value);

    updateBPInfo(systolicBP[systolicBP.length - 1], diastolicBP[diastolicBP.length - 1]);
    updateHealthParameters(lastRecord);
    document.querySelector('.selectedTime').textContent = "Last 6 months";
    createChart(labels, systolicBP, diastolicBP);
    updateChart(6, patient);

    const diagnosticContainer = document.querySelector('.diagnosticContainer .custom-scrollbar-css');
    diagnosticContainer.innerHTML = '';

    patient.diagnostic_list.forEach(diagnosis => {
        const diagnosisItem = document.createElement('div');
        diagnosisItem.classList.add('diagnosisItem');

        const problem = document.createElement('p');
        problem.textContent = diagnosis.name;

        const description = document.createElement('p');
        description.textContent = diagnosis.description;

        const status = document.createElement('p');
        status.textContent = diagnosis.status;

        diagnosisItem.appendChild(problem);
        diagnosisItem.appendChild(description);
        diagnosisItem.appendChild(status);

        diagnosticContainer.appendChild(diagnosisItem);
    });
    document.querySelector('.infoProfile h1').textContent = patient.name;
    document.querySelector('.infoProfile img').src = patient.profile_picture;
    document.querySelector('.infoHoriz:nth-child(1) .infoText').textContent = patient.date_of_birth;
    document.querySelector('.infoHoriz:nth-child(2) .infoText').textContent = patient.gender;
    document.querySelector('.infoHoriz:nth-child(3) .infoText').textContent = patient.phone_number;
    document.querySelector('.infoHoriz:nth-child(4) .infoText').textContent = patient.emergency_contact;
    document.querySelector('.infoHoriz:nth-child(5) .infoText').textContent = patient.insurance_type;

    const labContainer = document.querySelector('.labScroll');
    labContainer.innerHTML = '';
    patient.lab_results.forEach(result => {
        const resultsItem = document.createElement('div');
        resultsItem.classList.add('resultsItem');

        const resultText = document.createElement('p');
        resultText.textContent = result;

        const downloadIcon = document.createElement('img');
        downloadIcon.src = './images/download_FILL0_wght300_GRAD0_opsz24%20(1).png';
        downloadIcon.alt = 'Download';

        resultsItem.appendChild(resultText);
        resultsItem.appendChild(downloadIcon);

        labContainer.appendChild(resultsItem);
    });
}
function updateBPInfo(systolic, diastolic) {
    const systolicAmount = document.getElementById('systolicAmount');
    const diastolicAmount = document.getElementById('diastolicAmount');
    const averageSystolic = document.querySelector('.averageSystolic');
    const averageDiastolic = document.querySelector('.averageDiastolic');

    systolicAmount.textContent = systolic;
    diastolicAmount.textContent = diastolic;

    if (systolic > 120) {
        averageSystolic.textContent = '⮝ Higher than normal';
    } else {
        averageSystolic.textContent = '⮟ Lower than normal';
    }
    if (diastolic < 80) {
        averageDiastolic.textContent = '⮟ Lower than normal';
    } else {
        averageDiastolic.textContent = '⮝ Higher than normal';
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
    if (myChartInstance) {
        myChartInstance.destroy();
    }
    myChartInstance = new Chart(ctx, {
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
        const selectedTime = parseInt(event.target.getAttribute('timeSpan'), 10);
        document.querySelector('.selectedTime').textContent = "Last " + event.target.textContent;
        const currentPatient = document.querySelector('.profileCardVisited');
        if (currentPatient) {
            console.log(currentPatient)
            const patientName = currentPatient.querySelector('p').textContent;
            const selectedPatient = patientData.find(patient => patient.name === patientName);
            if (selectedPatient) {
                updateChart(selectedTime, selectedPatient);
            }
        }
    });
});
function updateChart(timePeriod, patient) {
    const sortedData = [...patient.diagnosis_history].sort((a, b) => {
        const dateA = new Date(`${a.year}-${getMonthNumber(a.month)}-01`);
        const dateB = new Date(`${b.year}-${getMonthNumber(b.month)}-01`);
        return dateB - dateA;
    });

    const filteredData = sortedData.slice(0, timePeriod);
    const labels = filteredData.map(entry => entry.month.substring(0, 3) + ', ' + entry.year);
    const systolicBP = filteredData.map(entry => entry.blood_pressure.systolic.value);
    const diastolicBP = filteredData.map(entry => entry.blood_pressure.diastolic.value);

    if (myChartInstance) {
        myChartInstance.destroy();
    }

    myChartInstance = new Chart(document.getElementById('myChart'), {
        type: 'line',
        data: {
            labels: labels.reverse(),
            datasets: [
                {
                    data: systolicBP.reverse(),
                    borderColor: '#E66FD2',
                    borderWidth: 2,
                    tension: 0.4,
                    pointStyle: 'circle',
                    pointRadius: 5,
                    pointBackgroundColor: '#E66FD2',
                    pointBorderColor: '#E66FD2'
                },
                {
                    data: diastolicBP.reverse(),
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

function getMonthNumber(monthName) {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return monthNames.indexOf(monthName) + 1;
}