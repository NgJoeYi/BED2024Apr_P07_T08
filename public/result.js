document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const quizId = urlParams.get('quizId');
    fetchQuizResults(quizId);
});

function fetchQuizResults(quizId) {
    fetch(`/quizzes/${quizId}/results`)
        .then(response => response.json())
        .then(results => {
            if (results) {
                displayResults(results);
            } else {
                console.error('Results not found');
                document.getElementById('result-container').innerText = 'Results not available.';
            }
        })
        .catch(error => console.error('Error fetching results:', error));
}

function displayResults(results) {
    const resultContainer = document.getElementById('result-container');
    resultContainer.innerHTML = '';

    const resultTitle = document.createElement('h3');
    resultTitle.innerText = `Your Results for Quiz: ${results.quizTitle}`;
    resultContainer.appendChild(resultTitle);

    const scoreText = document.createElement('p');
    scoreText.innerText = `Score: ${results.score} / ${results.totalMarks}`;
    resultContainer.appendChild(scoreText);

    const timeText = document.createElement('p');
    timeText.innerText = `Time Taken: ${results.timeTaken} seconds`;
    resultContainer.appendChild(timeText);

    const passedText = document.createElement('p');
    passedText.innerText = `Passed: ${results.passed ? 'Yes' : 'No'}`;
    resultContainer.appendChild(passedText);

    // Display any other relevant result details here
}

function retakeQuiz() {
    const urlParams = new URLSearchParams(window.location.search);
    const quizId = urlParams.get('quizId');
    window.location.href = `/question.html?quizId=${quizId}`;
}

function backToQuizzes() {
    window.location.href = '/quiz.html';
}
