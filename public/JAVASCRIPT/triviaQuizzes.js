let startTime; // Variable to hold the start time
let endTime; // Variable to hold the end time

document.addEventListener('DOMContentLoaded', () => {
    // Set active state based on the current page
    const quizButton = document.getElementById('quiz-button');
    const statisticsButton = document.getElementById('statistics-button');
    const triviaButton = document.getElementById('trivia-quiz-button');
    const buttonContainer = document.querySelector('.left-buttons-container');

    // Mark the trivia button as active and others as inactive
    quizButton.classList.remove('active');
    quizButton.classList.add('inactive');
    statisticsButton.classList.remove('active');
    statisticsButton.classList.add('inactive');
    triviaButton.classList.add('active');
    triviaButton.classList.remove('inactive');

    // Navigate to quiz.html when the quiz button is clicked
    quizButton.addEventListener('click', () => {
        window.location.href = 'quiz.html';
    });

    // Navigate to statistics.html when the statistics button is clicked
    statisticsButton.addEventListener('click', () => {
        window.location.href = 'statistics.html';
    });

    // Navigate to triviaQuiz.html when the trivia button is clicked
    triviaButton.addEventListener('click', () => {
        window.location.href = 'triviaQuiz.html';
    });

    fetchTriviaQuizzes(); // Fetch the list of trivia quizzes from the new route
});

// Fetch trivia quizzes from the new API route
function fetchTriviaQuizzes() {
    fetch('/quizzes/trivia?amount=10')
        .then(response => response.json())
        .then(data => {
            console.log("Fetched Trivia Quizzes Data:", data); // Log fetched data
            const quizzes = data;
            if (quizzes && quizzes.length > 0) {
                displayTriviaQuizzes(quizzes);
            } else {
                console.error('No trivia quizzes found');
                document.getElementById('trivia-quiz-container').innerHTML = '<div id="no-quizzes-message">No trivia quizzes available.</div>';
            }
        })
        .catch(error => console.error('Error fetching trivia quizzes:', error));
}

// Display trivia quizzes from the API
function displayTriviaQuizzes(quizzes) {
    console.log("Displaying Trivia Quizzes:", quizzes); // Log quizzes to be displayed
    const triviaQuizContainer = document.getElementById('trivia-quiz-container');
    triviaQuizContainer.innerHTML = '';

    quizzes.forEach((quiz, index) => {
        const quizCard = document.createElement('div');
        quizCard.className = 'quiz-card';

        // Create and append quiz card content
        const quizCardContent = document.createElement('div');
        quizCardContent.className = 'quiz-card-content';

        const quizTitle = document.createElement('h3');
        quizTitle.innerText = `Quiz ${index + 1}: ${quiz.category}`;
        quizCardContent.appendChild(quizTitle);

        const quizDescription = document.createElement('p');
        quizDescription.innerText = quiz.question;
        quizCardContent.appendChild(quizDescription);

        const quizDetails = document.createElement('p');
        quizDetails.className = 'quiz-details';
        quizDetails.innerHTML = `
            <strong>Type:</strong> ${quiz.type} | 
            <strong>Difficulty:</strong> ${quiz.difficulty}`;
        quizCardContent.appendChild(quizDetails);

        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container';

        // Create and append start quiz button
        const startButton = document.createElement('button');
        startButton.innerText = 'Start Quiz';
        startButton.onclick = () => {
            const token = sessionStorage.getItem('token'); // fetch token from localStorage
            if (token) {
                startTriviaQuiz(quiz);
            } else {
                alert('No token found. Please log in.'); // Alert the user to log in
                window.location.href = 'login.html'; // Redirect to login page
            }
        };
        buttonContainer.appendChild(startButton);

        quizCardContent.appendChild(buttonContainer);
        quizCard.appendChild(quizCardContent);
        triviaQuizContainer.appendChild(quizCard);
    });
}

function startTriviaQuiz(quiz) {
    // Save the selected quiz question to session storage
    console.log("Selected Quiz:", quiz); // Log selected quiz
    sessionStorage.setItem('currentTriviaQuiz', JSON.stringify(quiz));
    startTime = new Date(); // Start the timer
    startTimer(); // Start the timer
    // Directly start the quiz
    startQuiz();
}

function startQuiz() {
    document.querySelector('.left-buttons-container').classList.add('hidden-buttons');
    document.getElementById('quiz-list').classList.add('hidden');
    document.getElementById('quiz-questions').classList.remove('hidden');
    initializeQuiz(JSON.parse(sessionStorage.getItem('currentTriviaQuiz')));
}

function startTimer() {
    const timerElement = document.getElementById('timer');
    timerInterval = setInterval(() => {
        const currentTime = new Date();
        const elapsedTime = Math.floor((currentTime - startTime) / 1000);
        
        const minutes = Math.floor(elapsedTime / 60);
        const seconds = elapsedTime % 60;
        const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        
        timerElement.innerText = `Time: ${formattedTime}`;
    }, 1000);
}


function stopTimer() {
    clearInterval(timerInterval);
}


let currentQuestionIndex = 0;
let quizData = null;
let userAnswers = []; // Array to store user answers

function initializeQuiz(quiz) {
    quizData = [quiz]; // Wrap the single question in an array to handle uniformly
    console.log("Initializing Quiz with Data:", quizData); // Log initialized quiz data
    console.log("Total Questions in the Quiz:", quizData.length);
    displayQuestion();
}

function displayQuestion() {
    console.log("Displaying Question Index:", currentQuestionIndex); // Log current question index
    console.log("Displaying Question:", quizData[currentQuestionIndex]); // Log question to be displayed
    const questionContainer = document.getElementById('questions-container');
    questionContainer.innerHTML = '';

    const questionTitle = document.createElement('h2');
    questionTitle.innerText = quizData[currentQuestionIndex].question;
    questionContainer.appendChild(questionTitle);

    const answerOptions = [quizData[currentQuestionIndex].correct_answer, ...quizData[currentQuestionIndex].incorrect_answers];
    answerOptions.sort(() => Math.random() - 0.5); // Shuffle the answers

    answerOptions.forEach(answer => {
        const answerButton = document.createElement('button');
        answerButton.innerText = answer;
        answerButton.onclick = () => selectAnswer(answer, answerButton);
        questionContainer.appendChild(answerButton);
    });

    updateNavigationButtons();
}

function updateNavigationButtons() {
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');

    if (currentQuestionIndex === 0) {
        prevButton.style.display = 'none';
    } else {
        prevButton.style.display = 'inline-block';
    }

    if (currentQuestionIndex === quizData.length - 1) {
        nextButton.style.display = 'none';
    } else {
        nextButton.style.display = 'inline-block';
    }
}

function selectAnswer(answer, answerButton) {
    userAnswers[currentQuestionIndex] = answer; // Store the selected answer
    console.log("User Selected Answer:", answer); // Log the selected answer

    // Remove the 'selected-answer' class from all buttons
    const answerButtons = document.querySelectorAll('#questions-container button');
    answerButtons.forEach(btn => btn.classList.remove('selected-answer'));

    // Add the 'selected-answer' class to the clicked button
    answerButton.classList.add('selected-answer');
}

function nextQuestion() {
    if (currentQuestionIndex < quizData.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    } else {
        console.log("No more questions. Total Questions:", quizData.length);
        alert('You have completed the quiz!');
        // Optionally, you could redirect back to the quizzes page or show the results here
    }
}

function prevQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
    }
}

async function submitQuiz() {
    const endTime = Date.now(); // End the timer
    const timeTaken = Math.floor((endTime - startTime) / 1000); // Calculate time taken in seconds
    stopTimer(); // Stop the timer
    console.log("User Answers:", userAnswers); // Log user answers

    // Fetch user information
    const userResponse = await fetchWithAuth('/account', {});
    const userData = await userResponse.json();
    
    // Calculate the score
    let score = 0;
    quizData.forEach((question, index) => {
        if (userAnswers[index] === question.correct_answer) {
            score++;
        }
    });

    const result = {
        QuizTitle: quizData[0].category,
        QuizDescription: `Difficulty: ${quizData[0].difficulty} | Type: ${quizData[0].type}`,
        UserName: userData.name,
        AttemptDate: new Date().toLocaleString(),
        Score: score,
        TotalMarks: quizData.length,
        TimeTaken: timeTaken,
        TotalQuestions: quizData.length,
        Passed: score >= quizData.length / 2,
        UserResponses: quizData.map((question, index) => ({
            question_text: question.question,
            selected_option: userAnswers[index],
            correct_option: question.correct_answer
        }))
    };

    displayQuizResults(result);

    document.querySelector('.left-buttons-container').classList.add('hidden-buttons');
    document.getElementById('quiz-questions').classList.add('hidden');
    document.getElementById('quiz-results').classList.remove('hidden');
    alert('Quiz submitted!');
}

function displayQuizResults(result) {
    const resultContainer = document.getElementById('results-container');
    const formattedDate = result.AttemptDate; // You can format the date as needed

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

function retakeQuiz() {
    window.location.href = 'triviaQuiz.html';
}

function backToQuizzes() {
    window.location.href = 'index.html';
}

function createResultButtons() {
    const buttonContainerBelow = document.getElementById('button-container-below');
    buttonContainerBelow.innerHTML = ''; // Clear previous buttons if any

    const retakeButton = document.createElement('button');
    retakeButton.innerText = 'Retake Quiz';
    retakeButton.className = 'retake-button'; // Add a class for styling
    retakeButton.onclick = () => {
        window.location.href = 'triviaQuiz.html';
    };

    const homeButton = document.createElement('button');
    homeButton.innerText = 'Back to Home';
    homeButton.className = 'home-button'; // Add a class for styling
    homeButton.onclick = () => {
        window.location.href = 'index.html';
    };

    buttonContainerBelow.appendChild(retakeButton);
    buttonContainerBelow.appendChild(homeButton);
}
