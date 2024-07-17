document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const isEditMode = urlParams.get('edit-mode') === 'true'; // Check if edit mode is enabled
    const stylesheetLink = document.getElementById('mode-stylesheet');
    if (stylesheetLink) { // Check if the stylesheet link element exists
        if (isEditMode) {
            console.log('using edit css');
            stylesheetLink.href = 'CSS/editQuestion.css'; // Load the edit mode stylesheet
        } else {
            console.log('using normal css');
            stylesheetLink.href = 'CSS/question.css'; // Load the regular mode stylesheet
        }
    }

    if (!isEditMode) {
        const quizId = urlParams.get('quizId');
        fetchQuizWithQuestions(quizId);
        startTimer();
    }
});

let currentQuestionIndex = 0;
let questions = [];
let userResponses = {};
let timerInterval; // Timer interval variable
let totalSeconds = 0; // Total time elapsed in seconds

function startTimer() {
    const timerElement = document.getElementById('timer');
    timerInterval = setInterval(() => {
        totalSeconds++;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        timerElement.innerText = `Time: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    console.log(`Total time taken: ${totalSeconds} seconds`); // Log the total time taken
}

// function getToken() {
//     return sessionStorage.getItem('token');
//   }

function fetchQuizWithQuestions(quizId) {
    fetchWithAuth(`/quizzes/${quizId}/questions`) // ------------------------------------------------- headers in jwtutility.js
        .then(response => response.json())
        .then(quiz => {
            if (quiz) {
                questions = quiz.questions;
                displayQuestion(currentQuestionIndex);
            } else {
                console.error('Quiz or questions not found');
                document.getElementById('questions-container').innerText = 'Quiz or questions not available.';
            }
        })
        .catch(error => console.error('Error fetching quiz with questions:', error));
}

function displayQuestion(index) {
    const questionsContainer = document.getElementById('questions-container');
    questionsContainer.innerHTML = '';

    const question = questions[index];
    const questionCard = document.createElement('div');
    questionCard.className = 'question-card';

    const questionTitle = document.createElement('h3');
    questionTitle.innerText = `Q${index + 1}: ${question.question_text}`;
    questionCard.appendChild(questionTitle);

    if (question.qnsImg && question.qnsImg.data) {
        const base64String = arrayBufferToBase64(question.qnsImg.data);
        const questionImage = document.createElement('img');
        questionImage.src = `data:image/jpeg;base64,${base64String}`;
        questionCard.appendChild(questionImage);
    }

    const options = [question.option_1, question.option_2, question.option_3, question.option_4];
    options.forEach((option, i) => {
        const optionId = `question_${question.question_id}_option_${i}`;
        const optionInput = document.createElement('input');
        optionInput.type = 'radio';
        optionInput.id = optionId;
        optionInput.name = `question_${question.question_id}`;
        optionInput.value = option;

        if (userResponses[question.question_id] === option) {
            optionInput.checked = true;
        }

        const optionLabel = document.createElement('label');
        optionLabel.htmlFor = optionId;
        optionLabel.appendChild(document.createTextNode(option));

        questionCard.appendChild(optionInput);
        questionCard.appendChild(optionLabel);
        questionCard.appendChild(document.createElement('br'));
    });

    questionsContainer.appendChild(questionCard);

    document.getElementById('prev-button').style.visibility = index === 0 ? 'hidden' : 'visible';
    document.getElementById('next-button').style.display = index === questions.length - 1 ? 'none' : 'inline-block';
    document.getElementById('submit-quiz').style.display = index === questions.length - 1 ? 'inline-block' : 'none';
}

function nextQuestion() {
    saveCurrentResponse();
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        displayQuestion(currentQuestionIndex);
    }
}

function prevQuestion() {
    saveCurrentResponse();
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion(currentQuestionIndex);
    }
}

function saveCurrentResponse() {
    const currentQuestion = questions[currentQuestionIndex];
    const selectedOption = document.querySelector(`input[name="question_${currentQuestion.question_id}"]:checked`);
    userResponses[currentQuestion.question_id] = selectedOption ? selectedOption.value : null;
}

function submitQuiz() {
    saveCurrentResponse();
    stopTimer(); // Stop the timer when the quiz is submitted
    const urlParams = new URLSearchParams(window.location.search);
    const quizId = urlParams.get('quizId');

    const userResponsesArray = questions.map((question) => ({
        question_id: question.question_id,
        selected_option: userResponses[question.question_id]
    }));

    fetchWithAuth(`/submitQuiz`, { // ------------------------------------------------- headers in jwtutility.js
        method: 'POST',
        body: JSON.stringify({
            quizId,
            responses: userResponsesArray,
            timeTaken: totalSeconds // Include the total time taken
        })
    })
    .then(response => {
        return response.json().then(data => ({ status: response.status, body: data }));
    })
    .then(({ status, body }) => {
        if (status === 200) {
            window.location.href = `/result.html?attemptId=${body.attemptId}`;
        } else {
            console.error('Error submitting quiz:', body.message);
            alert(body.message); // Display the backend error message
        }
    })
    .catch(error => {
        console.error('Error submitting quiz:', error);
        alert('An error occurred while submitting the quiz. Please try again later.');
    });
}


function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}
