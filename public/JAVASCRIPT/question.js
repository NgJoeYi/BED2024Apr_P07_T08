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
        const quizId = urlParams.get('quizId'); // Get the quiz ID from the URL
        fetchQuizWithQuestions(quizId); // Fetch the quiz questions
        startTimer(); // Start the timer
    }
});

let currentQuestionIndex = 0; // Index of the current question
let questions = []; // Array to store quiz questions
let userResponses = {}; // Object to store user responses
let timerInterval; // Timer interval variable
let totalSeconds = 0; // Total time elapsed in seconds

// Function to start the timer
function startTimer() {
    const timerElement = document.getElementById('timer'); // Get the timer element
    timerInterval = setInterval(() => {
        totalSeconds++; // Increment the total seconds
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        timerElement.innerText = `Time: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;  // Update the timer display
    }, 1000);
}

// Function to stop the timer
function stopTimer() {
    clearInterval(timerInterval); // Clear the timer interval
    console.log(`Total time taken: ${totalSeconds} seconds`); // Log the total time taken
}

// function getToken() {
//     return sessionStorage.getItem('token');
//   }

// Function to fetch the quiz with questions
function fetchQuizWithQuestions(quizId) {
    fetchWithAuth(`/quizzes/${quizId}/questions`) // ------------------------------------------------- headers in jwtutility.js
        .then(response => response.json())
        .then(quiz => {
            if (quiz) {
                questions = quiz.questions; // Store the quiz questions
                displayQuestion(currentQuestionIndex); // Display the first question
            } else {
                console.error('Quiz or questions not found');
                document.getElementById('questions-container').innerText = 'Quiz or questions not available.';
            }
        })
        .catch(error => console.error('Error fetching quiz with questions:', error));
}

// Function to display a question
function displayQuestion(index) {
    const questionsContainer = document.getElementById('questions-container'); // Get the questions container
    questionsContainer.innerHTML = ''; // Clear previous question

    const question = questions[index]; // Get the current question
    const questionCard = document.createElement('div');
    questionCard.className = 'question-card'; // Create a question card

    const questionTitle = document.createElement('h3');
    questionTitle.innerText = `Q${index + 1}: ${question.question_text}`; // Set the question text
    questionCard.appendChild(questionTitle);  // Add the question title to the card

    if (question.qnsImg && question.qnsImg.data) { // Check if the question has an image
        const base64String = arrayBufferToBase64(question.qnsImg.data); // Convert the image to base64
        const questionImage = document.createElement('img'); 
        questionImage.src = `data:image/jpeg;base64,${base64String}`; // Set the image source
        questionCard.appendChild(questionImage); // Add the image to the card
    }

    const options = [question.option_1, question.option_2, question.option_3, question.option_4];
    options.forEach((option, i) => { // Iterate over the options
        const optionId = `question_${question.question_id}_option_${i}`;
        const optionInput = document.createElement('input');
        optionInput.type = 'radio';
        optionInput.id = optionId;
        optionInput.name = `question_${question.question_id}`;
        optionInput.value = option;

        if (userResponses[question.question_id] === option) {
            optionInput.checked = true; // Check the option if it was previously selected
        }

        const optionLabel = document.createElement('label');
        optionLabel.htmlFor = optionId;
        optionLabel.appendChild(document.createTextNode(option));

        questionCard.appendChild(optionInput);
        questionCard.appendChild(optionLabel);
        questionCard.appendChild(document.createElement('br')); // Add a line break
    });

    questionsContainer.appendChild(questionCard); // Add the question card to the container

    // Update navigation buttons visibility
    document.getElementById('prev-button').style.visibility = index === 0 ? 'hidden' : 'visible';
    document.getElementById('next-button').style.display = index === questions.length - 1 ? 'none' : 'inline-block';
    document.getElementById('submit-quiz').style.display = index === questions.length - 1 ? 'inline-block' : 'none';
}

// Function to navigate to the next question
function nextQuestion() {
    saveCurrentResponse(); // Save the current response
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        displayQuestion(currentQuestionIndex); // Display the next question
    }
}

// Function to navigate to the previous question
function prevQuestion() {
    saveCurrentResponse(); // Save the current response
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion(currentQuestionIndex); // Display the previous question
    }
}

// Function to save the current response
function saveCurrentResponse() {
    const currentQuestion = questions[currentQuestionIndex];
    const selectedOption = document.querySelector(`input[name="question_${currentQuestion.question_id}"]:checked`);
    userResponses[currentQuestion.question_id] = selectedOption ? selectedOption.value : null; // Save the selected option
}

// Function to submit the quiz
function submitQuiz() {
    saveCurrentResponse(); // Save the current response
    stopTimer(); // Stop the timer when the quiz is submitted
    const urlParams = new URLSearchParams(window.location.search);
    const quizId = urlParams.get('quizId'); // Get the quiz ID from the URL

    // Prepare user responses for submission
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
            window.location.href = `/result.html?attemptId=${body.attemptId}`; // Redirect to result page on success
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

// Function to convert array buffer to base64 string
function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}
