document.addEventListener('DOMContentLoaded', () => {
    // Set active state based on the current page
    const quizButton = document.getElementById('quiz-button');
    const statisticsButton = document.getElementById('statistics-button');
    const triviaButton = document.getElementById('trivia-quiz-button');

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

    fetchTriviaQuizzes(); // Fetch the list of trivia quizzes from the Open Trivia Database
});

// Fetch trivia quizzes from the Open Trivia Database API
function fetchTriviaQuizzes() {
    fetch('https://opentdb.com/api.php?amount=10')
        .then(response => response.json())
        .then(data => {
            console.log("Fetched Trivia Quizzes Data:", data); // Log fetched data
            const quizzes = data.results;
            if (quizzes && quizzes.length > 0) {
                displayTriviaQuizzes(quizzes);
            } else {
                console.error('No trivia quizzes found');
                document.getElementById('trivia-quiz-container').innerText = 'No trivia quizzes available.';
            }
        })
        .catch(error => console.error('Error fetching trivia quizzes:', error));
}

// Display trivia quizzes from Open Trivia Database
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
    document.getElementById('quiz-list').classList.add('hidden');
    document.getElementById('quiz-questions').classList.remove('hidden');
    initializeQuiz(JSON.parse(sessionStorage.getItem('currentTriviaQuiz')));
}

let currentQuestionIndex = 0;
let quizData = null;

function initializeQuiz(quiz) {
    quizData = quiz;
    console.log("Initializing Quiz with Data:", quizData); // Log initialized quiz data
    displayQuestion();
}

function displayQuestion() {
    console.log("Displaying Question:", quizData[currentQuestionIndex]); // Log question to be displayed
    const questionContainer = document.getElementById('questions-container');
    questionContainer.innerHTML = '';

    const questionTitle = document.createElement('h2');
    questionTitle.innerText = quizData.question;
    questionContainer.appendChild(questionTitle);

    const answerOptions = [quizData.correct_answer, ...quizData.incorrect_answers];
    answerOptions.sort(() => Math.random() - 0.5); // Shuffle the answers

    answerOptions.forEach(answer => {
        const answerButton = document.createElement('button');
        answerButton.innerText = answer;
        answerButton.onclick = () => checkAnswer(answer, quizData.correct_answer);
        questionContainer.appendChild(answerButton);
    });
}

function checkAnswer(selectedAnswer, correctAnswer) {
    console.log("Selected Answer:", selectedAnswer, "Correct Answer:", correctAnswer); // Log selected and correct answer
    if (selectedAnswer === correctAnswer) {
        alert('Correct!');
    } else {
        alert('Incorrect. The correct answer is: ' + correctAnswer);
    }
}

function nextQuestion() {
    if (currentQuestionIndex < quizData.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    } else {
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
    alert('Quiz submitted!');
    // Optionally, you could implement more logic here to handle the quiz submission
}
