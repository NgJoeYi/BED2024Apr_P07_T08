document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search); // Parse URL parameters
    const attemptId = urlParams.get('attemptId'); // Get the attempt ID from the URL
    fetchQuizResult(attemptId); // Fetch the quiz result for the given attempt ID
});

// Function to fetch quiz result
function fetchQuizResult(attemptId) {
    fetchWithAuth(`/quizResult/${attemptId}`) // ------------------------------------------------- headers in jwtutility.js
    .then(response => {
        if (!response) return; // ********************** jwt
        return response.json(); // Parse the JSON response
    })
    .then(result => {
        console.log('Quiz result:', result); // Log the result to debug
        if (result) {
            displayResult(result); // Display the result if available
        } else {
            console.error('Quiz result not found'); // Log error if result not found
            document.getElementById('result-container').innerText = 'Quiz result not available.'; // Display error message
        }
    })
    .catch(error => console.error('Error fetching quiz result:', error));  // Log any errors that occur
}

// Function to display quiz result
function displayResult(result) {
    const resultContainer = document.getElementById('result-container');  // Get the result container element

    const attemptDateStr = result.AttemptDate; // Get the attempt date

    // Split the date string into date and time parts
    const [datePart, timePart] = attemptDateStr.split('T');
    const [year, month, day] = datePart.split('-');
    const [hour, minute, second] = timePart.split(':');

    // Reformat the date and time parts
    const formattedDate = `${day}/${month}/${year} ${hour}:${minute}:${second.slice(0, 2)}`;


    // Set the inner HTML of the result container
    resultContainer.innerHTML = `
        <div class="result-card">
            <h2>Quiz Results</h2>
            <div class="result-title">${result.QuizTitle}</div>
            <div class="result-description">${result.QuizDescription}</div>
            <div class="result-details">
                <p><strong>User Name:</strong> ${result.UserName}</p>
                <p><strong>Attempt Date:</strong> ${formattedDate}</p>
                <p><strong>Score:</strong> ${result.Score}/${result.TotalMarks}</p>
                <p><strong>Time Taken:</strong> ${result.TimeTaken ? result.TimeTaken + ' seconds' : 'N/A'}</p>
                <p><strong>Total Questions:</strong> ${result.TotalQuestions}</p>
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
            <button id="retake-quiz" onclick="retakeQuiz()">Back to Quiz</button>
            <button id="back-to-home" onclick="backToQuizzes()">Back to home</button>
        </div>
    `;
}

// Function to retake the quiz
function retakeQuiz() {
    window.location.href = `quiz.html`;
}

// Function to go back to the quizzes
function backToQuizzes() {
    window.location.href = 'index.html';
}
