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
    fetchWithAuth('/quizzes/trivia?amount=10') // Adjust the query parameters as needed
        .then(response => response.json())
        .then(data => {
            console.log("Fetched Trivia Quizzes Data:", data); // Log fetched data
            const quizzes = data;
            if (quizzes && quizzes.length > 0) {
                displayTriviaQuizzes(quizzes);
            } else {
                console.error('No trivia quizzes found');
                document.getElementById('trivia-quiz-container').innerText = 'No trivia quizzes available.';
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
        startButton.onclick = () => startTriviaQuiz(quiz);
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
    // Directly start the quiz
    startQuiz();
}

function startQuiz() {
    document.querySelector('.left-buttons-container').classList.add('hidden-buttons');
    document.getElementById('quiz-list').classList.add('hidden');
    document.getElementById('quiz-questions').classList.remove('hidden');
    initializeQuiz(JSON.parse(sessionStorage.getItem('currentTriviaQuiz')));
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

function submitQuiz() {
    console.log("User Answers:", userAnswers); // Log user answers
    const resultsContainer = document.getElementById('results-container');
    resultsContainer.innerHTML = '';

    quizData.forEach((question, index) => {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';

        const questionTitle = document.createElement('h3');
        questionTitle.innerText = `Question ${index + 1}: ${question.question}`;
        resultItem.appendChild(questionTitle);

        const userAnswer = document.createElement('p');
        userAnswer.innerHTML = `Your answer: ${userAnswers[index] || 'No answer selected'}`;
        resultItem.appendChild(userAnswer);

        const correctAnswer = document.createElement('p');
        correctAnswer.innerHTML = `Correct answer: ${question.correct_answer}`;
        resultItem.appendChild(correctAnswer);

        if (userAnswers[index] === question.correct_answer) {
            userAnswer.className = 'correct';
        } else {
            userAnswer.className = 'incorrect';
        }

        resultsContainer.appendChild(resultItem);
    });

    createResultButtons(resultsContainer); // Add buttons to the results container

    document.querySelector('.left-buttons-container').classList.add('hidden-buttons');
    document.getElementById('quiz-questions').classList.add('hidden');
    document.getElementById('quiz-results').classList.remove('hidden');
    alert('Quiz submitted!');
}

function createResultButtons(container) {
    const retakeButton = document.createElement('button');
    retakeButton.innerText = 'Retake Quiz';
    retakeButton.onclick = () => {
        window.location.href = 'triviaQuiz.html';
    };

    const homeButton = document.createElement('button');
    homeButton.innerText = 'Back to Home';
    homeButton.onclick = () => {
        window.location.href = 'index.html';
    };

    container.appendChild(retakeButton);
    container.appendChild(homeButton);
}
