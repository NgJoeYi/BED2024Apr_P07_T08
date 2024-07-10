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


// ----------------------------------------------- also displays the correct answer
// function displayResult(result) {
//     const resultContainer = document.getElementById('result-container');
//     resultContainer.innerHTML = `
//         <p>Attempt ID: ${result.AttemptID}</p>
//         <p>User ID: ${result.UserID}</p>
//         <p>Attempt Date: ${new Date(result.AttemptDate).toLocaleString()}</p>
//         <p>Score: ${result.Score}</p>
//         <p>Time Taken: ${result.TimeTaken} seconds</p>
//         <p>Total Questions: ${result.TotalQuestions}</p>
//         <p>Total Marks: ${result.TotalMarks}</p>
//         <p>Passed: ${result.Passed ? 'Yes' : 'No'}</p>
//         <p>Quiz Title: ${result.QuizTitle}</p>
//         <p>Quiz Description: ${result.QuizDescription}</p>
//     `;

//     const responsesContainer = document.createElement('div');
//     responsesContainer.innerHTML = '<h3>Responses:</h3>';

//     result.UserResponses.forEach(response => {
//         const responseDiv = document.createElement('div');
//         responseDiv.className = 'response';

//         responseDiv.innerHTML = `
//             <p>Question: ${response.question_text}</p>
//             <p>Your Answer: ${response.selected_option}</p>
//             <p>Correct Answer: ${response.correct_option}</p>
//         `;

//         if (response.selected_option !== response.correct_option) {
//             responseDiv.classList.add('incorrect');
//         } else {
//             responseDiv.classList.add('correct');
//         }

//         responsesContainer.appendChild(responseDiv);
//     });

//     resultContainer.appendChild(responsesContainer);
// }

// ----------------------------------------------- displays only incorrect ans
function displayResult(result) {
    const resultContainer = document.getElementById('result-container');
    resultContainer.innerHTML = `
        <div class="result-card">
            <h2>Quiz Results</h2>
            <div class="result-title">${result.QuizTitle}</div>
            <div class="result-description">${result.QuizDescription}</div>
            <div class="result-details">
                <p><strong>Attempt ID:</strong> ${result.AttemptID}</p>
                <p><strong>User Name:</strong> ${result.UserName}</p> <!-- Updated line -->
                <p><strong>Attempt Date:</strong> ${new Date(result.AttemptDate).toLocaleString()}</p>
                <p><strong>Score:</strong> ${result.Score}</p>
                <p><strong>Time Taken:</strong> ${result.TimeTaken ? result.TimeTaken + ' seconds' : 'N/A'}</p>
                <p><strong>Total Questions:</strong> ${result.TotalQuestions}</p>
                <p><strong>Total Marks:</strong> ${result.TotalMarks}</p>
                <p><strong>Passed:</strong> ${result.Passed ? 'Yes' : 'No'}</p>
            </div>
            <div class="incorrect-questions">
                <h3>Incorrect Questions:</h3>
                ${result.UserResponses.filter(response => response.selected_option !== response.correct_option).length === 0 ? 
                    '<p>All your answers were correct!</p>' : 
                    result.UserResponses.filter(response => response.selected_option !== response.correct_option)
                    .map(response => `
                        <div class="question-card">
                            <p><strong>Question:</strong> ${response.question_text}</p>
                            <p><strong>Your Answer:</strong> ${response.selected_option}</p>
                            <p><strong>Correct Answer:</strong> ${response.correct_option}</p>
                        </div>
                    `).join('')}
            </div>
            <button id="retake-quiz" onclick="retakeQuiz(${result.QuizID})">Retake Quiz</button>
            <button id="back-to-home" onclick="backToQuizzes()">Back to home</button>
        </div>
    `;
}

function retakeQuiz(quizId) {
    // Redirect to the specific quiz for retaking
    window.location.href = `quiz.html?quizId=${quizId}`;
}

function backToQuizzes() {
    // Implement the function to go back to quizzes list
    window.location.href = 'index.html';
}
