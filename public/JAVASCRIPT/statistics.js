document.addEventListener('DOMContentLoaded', async () => {
    // Get references to the quiz and statistics buttons
    const quizButton = document.getElementById('quiz-button');
    const statisticsButton = document.getElementById('statistics-button');

    // Set active state based on the current page
    if (window.location.pathname.includes('statistics.html')) {
        // If on statistics page, set statistics button as active and quiz button as inactive
        statisticsButton.classList.add('active');
        statisticsButton.classList.remove('inactive');
        quizButton.classList.remove('active');
        quizButton.classList.add('inactive');
    } else if (window.location.pathname.includes('quiz.html')) {
        // If on quiz page, set quiz button as active and statistics button as inactive
        quizButton.classList.add('active');
        quizButton.classList.remove('inactive');
        statisticsButton.classList.remove('active');
        statisticsButton.classList.add('inactive');
    }

    // Add click event listener to quiz button to navigate to quiz.html
    quizButton.addEventListener('click', () => {
        window.location.href = 'quiz.html'; // Navigate to quiz.html
    });

    // Add click event listener to statistics button to navigate to statistics.html
    statisticsButton.addEventListener('click', () => {
        window.location.href = 'statistics.html'; // Navigate to statistics.html
    });

    // Fetch and render statistics
    try {
        // Fetch pass/fail statistics from the server
        const response = await fetch('/quizzes/statistics');
        const statistics = await response.json(); // Parse the JSON response
        renderPassFailStatistics(statistics); // Render the statistics
    } catch (error) {
        console.error('Error fetching pass/fail statistics:', error); // Log any errors
    }
});

function renderPassFailStatistics(statistics) {
    // Get the chart container element
    const chartContainer = document.querySelector('.chart-container');
    chartContainer.innerHTML = ''; // Clear previous charts if any

    // Loop through each statistic and create a chart for it
    statistics.forEach(stat => {
        const chartDiv = document.createElement('div'); // Create a div for the chart
        chartDiv.className = 'chart'; // Add class for styling
        const canvas = document.createElement('canvas'); // Create a canvas for the chart
        chartDiv.appendChild(canvas); // Append the canvas to the chart div
        chartContainer.appendChild(chartDiv); // Append the chart div to the chart container

        const ctx = canvas.getContext('2d'); // Get the 2D context of the canvas
        new Chart(ctx, {
            type: 'pie', // Set chart type to pie
            data: {
                labels: [`${stat.title} Pass`, `${stat.title} Fail`], // Set labels for the chart
                datasets: [{
                    label: `${stat.title} Pass/Fail Statistics`, // Set dataset label
                    data: [stat.PassCount, stat.FailCount], // Set data for the chart
                    backgroundColor: [ // Set background colors for the chart segments
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(255, 99, 132, 0.2)',
                    ],
                    borderColor: [ // Set border colors for the chart segments
                        'rgba(75, 192, 192, 1)',
                        'rgba(255, 99, 132, 1)',
                    ],
                    borderWidth: 1 // Set border width
                }]
            },
            options: {
                responsive: true, // Make chart responsive
                maintainAspectRatio: false, // Do not maintain aspect ratio
                plugins: {
                    legend: {
                        display: true, // Display legend
                        position: 'top',  // Position legend at the top
                    },
                },
            }
        });
    });
}
