document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const attemptId = urlParams.get('attemptId');
    fetchQuizResult(attemptId);
});

function fetchQuizResult(attemptId) {
    fetch(`/quizResult/${attemptId}`, {
        headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
    })
    .then(response => response.json())
    .then(result => {
        console.log('Quiz result:', result); // Add this line to log the result
        if (result) {
            displayResult(result);
        } else {
            console.error('Quiz result not found');
            document.getElementById('result-container').innerText = 'Quiz result not available.';
        }
    })
    .catch(error => console.error('Error fetching quiz result:', error));
}

function displayResult(result) {
    const resultContainer = document.getElementById('result-container');
    resultContainer.innerHTML = `
        <p>Attempt ID: ${result.AttemptID}</p>
        <p>User ID: ${result.UserID}</p>
        <p>Attempt Date: ${new Date(result.AttemptDate).toLocaleString()}</p>
        <p>Score: ${result.Score}</p>
        <p>Time Taken: ${result.TimeTaken} seconds</p>
        <p>Total Questions: ${result.TotalQuestions}</p>
        <p>Total Marks: ${result.TotalMarks}</p>
        <p>Passed: ${result.Passed ? 'Yes' : 'No'}</p>
        <p>Quiz Title: ${result.QuizTitle}</p>
        <p>Quiz Description: ${result.QuizDescription}</p>
    `;
}
