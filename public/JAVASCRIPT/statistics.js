document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/quizzes/statistics');
        const statistics = await response.json();
        renderPassFailStatistics(statistics);
    } catch (error) {
        console.error('Error fetching pass/fail statistics:', error);
    }
});

function renderPassFailStatistics(statistics) {
    const ctx = document.getElementById('passFailChart').getContext('2d');
    const labels = statistics.map(stat => stat.title);
    const passCounts = statistics.map(stat => stat.PassCount);
    const failCounts = statistics.map(stat => stat.FailCount);

    new Chart(ctx, {
        type: 'pie',
        data: {
            labels,
            datasets: [{
                label: 'Pass/Fail Statistics',
                data: [...passCounts, ...failCounts],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(255, 99, 132, 0.2)',
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 99, 132, 1)',
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                },
            },
        }
    });
}
