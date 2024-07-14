document.addEventListener('DOMContentLoaded', async () => {
    const quizButton = document.getElementById('quiz-button');
    const statisticsButton = document.getElementById('statistics-button');

    // Set active state based on the current page
    if (window.location.pathname.includes('statistics.html')) {
        statisticsButton.classList.add('active');
        statisticsButton.classList.remove('inactive');
        quizButton.classList.remove('active');
        quizButton.classList.add('inactive');
    } else if (window.location.pathname.includes('quiz.html')) {
        quizButton.classList.add('active');
        quizButton.classList.remove('inactive');
        statisticsButton.classList.remove('active');
        statisticsButton.classList.add('inactive');
    }

    quizButton.addEventListener('click', () => {
        window.location.href = 'quiz.html'; // Navigate to quiz.html
    });

    statisticsButton.addEventListener('click', () => {
        window.location.href = 'statistics.html'; // Navigate to statistics.html
    });

    // Fetch and render statistics
    try {
        const response = await fetch('/quizzes/statistics');
        const statistics = await response.json();
        renderPassFailStatistics(statistics);
    } catch (error) {
        console.error('Error fetching pass/fail statistics:', error);
    }
});

function renderPassFailStatistics(statistics) {
    const chartContainer = document.querySelector('.chart-container');
    chartContainer.innerHTML = ''; // Clear previous charts if any

    statistics.forEach(stat => {
        const chartDiv = document.createElement('div');
        chartDiv.className = 'chart';
        const canvas = document.createElement('canvas');
        chartDiv.appendChild(canvas);
        chartContainer.appendChild(chartDiv);

        const ctx = canvas.getContext('2d');
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: [`${stat.title} Pass`, `${stat.title} Fail`],
                datasets: [{
                    label: `${stat.title} Pass/Fail Statistics`,
                    data: [stat.PassCount, stat.FailCount],
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
    });
}
