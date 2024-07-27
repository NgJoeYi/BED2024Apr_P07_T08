let startTime; // Variable to hold the start time
let endTime; // Variable to hold the end time

document.addEventListener('DOMContentLoaded', () => {
    // Set active state based on the current page
    const quizButton = document.getElementById('quiz-button'); // Get the quiz button element
    const statisticsButton = document.getElementById('statistics-button'); // Get the statistics button element
    const triviaButton = document.getElementById('trivia-quiz-button');  // Get the trivia quiz button element
    const buttonContainer = document.querySelector('.left-buttons-container'); // Get the button container element

    // Mark the trivia button as active and others as inactive
    quizButton.classList.remove('active');  // Remove active class from quiz button
    quizButton.classList.add('inactive'); // Add inactive class to quiz button
    statisticsButton.classList.remove('active'); // Remove active class from statistics button
    statisticsButton.classList.add('inactive'); // Add inactive class to statistics button
    triviaButton.classList.add('active'); // Add active class to trivia button
    triviaButton.classList.remove('inactive'); // Remove inactive class from trivia button

    // Navigate to quiz.html when the quiz button is clicked
    quizButton.addEventListener('click', () => { // Add click event listener to quiz button
        window.location.href = 'quiz.html';  // Redirect to quiz.html
    });

    // Navigate to statistics.html when the statistics button is clicked
    statisticsButton.addEventListener('click', () => { // Add click event listener to statistics button
        window.location.href = 'statistics.html'; // Redirect to statistics.html
    });

    // Navigate to triviaQuiz.html when the trivia button is clicked
    triviaButton.addEventListener('click', () => { // Add click event listener to trivia button
        window.location.href = 'triviaQuiz.html'; // Redirect to triviaQuiz.html
    });

    fetchTriviaQuizzes(); // Fetch the list of trivia quizzes from the new route
});

// Fetch trivia quizzes from the new API route
function fetchTriviaQuizzes() {
    fetch('/quizzes/trivia?amount=10') // Fetch request to trivia quizzes API, 10 qns
        .then(response => {
            if (!response.ok) {  // Check if response is not ok
                throw new Error(`HTTP error! status: ${response.status}`); // Throw error if not ok
            }
            return response.json();  // Return response as JSON
        })
        .then(data => {
            console.log("Fetched Trivia Quizzes Data:", data); // Log fetched data
            if (data && Object.keys(data).length > 0 && !data.message) { // Check if data is valid
                displayTriviaQuizzes(data); // Display trivia quizzes
            } else {
                console.error('No trivia quizzes found or error message received:', data.message);
                alert('No trivia quizzes found. Please try again later.');  // Alert user if no quizzes found
            }
        })
        .catch(error => { // Catch any errors
            console.error('Error fetching trivia quizzes:', error);
            alert('Error fetching trivia quizzes. Please try reloading the page.'); // Alert user of error
        });
}


// Display trivia quizzes from the API
function displayTriviaQuizzes(groupedQuizzes) {
    console.log("Displaying Trivia Quizzes:", groupedQuizzes); // Log quizzes to be displayed
    const triviaQuizContainer = document.getElementById('trivia-quiz-container'); // Get trivia quiz container element
    triviaQuizContainer.innerHTML = ''; // Clear previous content

    Object.keys(groupedQuizzes).forEach(category => { // Iterate through each category of quizzes
        const categoryContainer = document.createElement('div'); // Create a div for each category
        categoryContainer.className = 'category-container'; // Set class name

        const quizCard = document.createElement('div'); // Create a div for each quiz card
        quizCard.className = 'quiz-card'; // Set class name

        // Create and append quiz card content
        const quizCardContent = document.createElement('div'); // Create a div for quiz card content
        quizCardContent.className = 'quiz-card-content'; // Set class name

        const quizTitle = document.createElement('h3');  // Create an h3 element for quiz title
        quizTitle.innerText = category;  // Set text to category
        quizCardContent.appendChild(quizTitle); // Append quiz title to quiz card content

        const quizDetails = document.createElement('p'); // Create a p element for quiz details
        quizDetails.className = 'quiz-details'; // Set class name

        // Safely access the difficulty property and provide a default value if undefined
        const difficulty = groupedQuizzes[category][0]?.difficulty || 'Not specified'; // Get difficulty or default value
        console.log(`Category: ${category}, Difficulty: ${difficulty}`);

        quizDetails.innerHTML = `
            <strong>Questions:</strong> ${groupedQuizzes[category].length} | 
            <strong>Difficulty:</strong> ${difficulty}`; // Set inner HTML for quiz details
        quizCardContent.appendChild(quizDetails);  // Append quiz details to quiz card content

        const buttonContainer = document.createElement('div'); // Create a div for button container
        buttonContainer.className = 'button-container';  // Set class name

        // Create and append start quiz button
        const startButton = document.createElement('button'); // Create a button element for start quiz
        startButton.innerText = 'Start Quiz'; // Set button text
        startButton.onclick = () => { // Add click event listener to start button
            const token = sessionStorage.getItem('token'); // fetch token from sessionStorage
            if (token) {
                startTriviaQuiz(groupedQuizzes[category], 0); // Start with the first question
            } else {
                alert('No token found. Please log in.'); // Alert the user to log in
                window.location.href = 'login.html'; // Redirect to login page
            }
        };
        buttonContainer.appendChild(startButton); // Append start button to button container

        quizCardContent.appendChild(buttonContainer); // Append button container to quiz card content
        quizCard.appendChild(quizCardContent); // Append quiz card content to quiz card
        categoryContainer.appendChild(quizCard); // Append quiz card to category container

        triviaQuizContainer.appendChild(categoryContainer); // Append category container to trivia quiz container
    });
}



function startTriviaQuiz(quizList, questionIndex) {
    // Save the selected quiz question to session storage
    console.log("Starting Quiz:", quizList); // Log selected quiz list
    sessionStorage.setItem('currentTriviaQuiz', JSON.stringify(quizList));
    sessionStorage.setItem('currentQuestionIndex', questionIndex);
    startTime = new Date(); // Start the timer
    startTimer(); // Start the timer
    // Directly start the quiz
    startQuiz();
}

function startQuiz() {
    document.querySelector('.left-buttons-container').classList.add('hidden-buttons');  // Hide left buttons
    document.getElementById('quiz-list').classList.add('hidden'); // Hide quiz list
    document.getElementById('quiz-questions').classList.remove('hidden'); // Show quiz questions
    const quizList = JSON.parse(sessionStorage.getItem('currentTriviaQuiz')); // Get quiz list from session storage
    const questionIndex = parseInt(sessionStorage.getItem('currentQuestionIndex')); // Get question index from session storage
    initializeQuiz(quizList, questionIndex);  // Initialize quiz with quiz list and question index
}


function startTimer() {
    const timerElement = document.getElementById('timer');  // Get timer element
    timerInterval = setInterval(() => { // Set interval to update timer every second
        const currentTime = new Date();  // Get current time
        const elapsedTime = Math.floor((currentTime - startTime) / 1000); // Calculate elapsed time in seconds
        
        const minutes = Math.floor(elapsedTime / 60); // Calculate minutes
        const seconds = elapsedTime % 60; // Calculate seconds
        const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`; // Format time
        
        timerElement.innerText = `Time: ${formattedTime}`; // Set timer text
    }, 1000); // Interval of 1 second
}


function stopTimer() {
    clearInterval(timerInterval); // Clear timer interval
}


let currentQuestionIndex = 0; // Initialize current question index
let quizData = null; // Initialize quiz data
let userAnswers = []; // Array to store user answers

function initializeQuiz(quizList, questionIndex) {
    // If quizList is nested in another array, extract it
    quizData = Array.isArray(quizList[0]) ? quizList[0] : quizList; // Extract quiz data if nested
    currentQuestionIndex = questionIndex; // Store the current question index
    console.log("Initializing Quiz with Data:", quizData); // Log initialized quiz data
    console.log("Total Questions in the Quiz:", quizData.length);
    displayQuestion(); // Display question
    updateNavigationButtons();  // Update navigation buttons
}

function displayQuestion() {
    console.log("Displaying Question Index:", currentQuestionIndex); // Log current question index
    console.log("Displaying Question:", quizData[currentQuestionIndex]); // Log question to be displayed
    const questionContainer = document.getElementById('questions-container'); // Get questions container element
    questionContainer.innerHTML = '';  // Clear previous question

    const currentQuestion = quizData[currentQuestionIndex]; // Get current questio

    // Check if currentQuestion and its properties exist
    if (currentQuestion && currentQuestion.question && currentQuestion.correct_answer && Array.isArray(currentQuestion.incorrect_answers)) {
        const questionTitle = document.createElement('h2'); // Create h2 element for question title
        questionTitle.innerText = currentQuestion.question; // Access the question text properly
        questionContainer.appendChild(questionTitle); // Append question title to question container

        const answerOptions = [currentQuestion.correct_answer, ...currentQuestion.incorrect_answers]; // Combine correct and incorrect answers
        answerOptions.sort(() => Math.random() - 0.5); // Shuffle the answers

        answerOptions.forEach(answer => { // Iterate through each answer option
            const answerButton = document.createElement('button'); // Create button for each answer
            answerButton.innerText = answer; // Set button text to answer
            answerButton.onclick = () => selectAnswer(answer, answerButton);  // Add click event listener to button
            questionContainer.appendChild(answerButton);  // Append answer button to question container
        });

        updateNavigationButtons(); // Update navigation buttons
    } else {
        console.error('Invalid question data:', currentQuestion);
        questionContainer.innerHTML = '<p>Unable to load question. Please try again later.</p>';  // Show error message if question data is invalid
    }
}


function updateNavigationButtons() {
    const prevButton = document.getElementById('prev-button');  // Get previous button element
    const nextButton = document.getElementById('next-button');  // Get next button element
    const submitQuizContainer = document.getElementById('submit-quiz-container'); // Get submit quiz container element

    // Show the previous button only if not on the first question
    if (currentQuestionIndex === 0) {
        prevButton.style.visibility = 'hidden'; // Hide previous button if on first question
    } else {
        prevButton.style.visibility = 'visible'; // Show previous button if not on first question
    }

    // Show the next button only if not on the last question
    if (currentQuestionIndex === quizData.length - 1) {
        nextButton.style.visibility = 'hidden'; // Hide next button if on last question
        submitQuizContainer.classList.remove('hidden'); // Show submit quiz container if on last question
    } else {
        nextButton.style.visibility = 'visible'; // Show next button if not on last question
        submitQuizContainer.classList.add('hidden'); // Hide submit quiz container if not on last question
    }
}

function selectAnswer(answer, answerButton) {
    userAnswers[currentQuestionIndex] = answer; // Store the selected answer
    console.log("User Selected Answer:", answer); // Log the selected answer

    // Remove the 'selected-answer' class from all buttons
    const answerButtons = document.querySelectorAll('#questions-container button');  // Get all answer buttons
    answerButtons.forEach(btn => btn.classList.remove('selected-answer'));  // Remove 'selected-answer' class from all buttons

    // Add the 'selected-answer' class to the clicked button
    answerButton.classList.add('selected-answer');
}

function nextQuestion() {
    if (currentQuestionIndex < quizData.length - 1) {
        currentQuestionIndex++; // Increment question index
        displayQuestion(); // Display next question
    } else {
        console.log("No more questions. Total Questions:", quizData.length);
        alert('You have completed the quiz!');
    }
}

function prevQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;  // Decrement question index
        displayQuestion();  // Display previous question
    }
}

async function submitQuiz() {
    const endTime = Date.now(); // End the timer
    const timeTaken = Math.floor((endTime - startTime) / 1000); // Calculate time taken in seconds
    stopTimer(); // Stop the timer
    console.log("User Answers:", userAnswers); // Log user answers

    // Fetch user information
    const userResponse = await fetchWithAuth('/account', {}); // Fetch user information with authentication
    const userData = await userResponse.json(); // Get user data from response
    
    // Calculate the score
    let score = 0;
    quizData.forEach((question, index) => {  // Iterate through quiz data
        if (userAnswers[index] === question.correct_answer) {
            score++;  // Increment score if answer is correct
        }
    });

    const result = { // Create result object
        QuizTitle: quizData[0].category,
        QuizDescription: `Difficulty: ${quizData[0].difficulty} | Type: ${quizData[0].type}`, // Set quiz description
        UserName: userData.name, // Set user name
        AttemptDate: new Date().toLocaleString(),  // Set attempt date
        Score: score,  // Set score
        TotalMarks: quizData.length,  // Set total marks
        TimeTaken: timeTaken, // Set time taken
        TotalQuestions: quizData.length,  // Set total questions
        Passed: score >= quizData.length / 2, // Set passed status
        UserResponses: quizData.map((question, index) => ({ // Set user responses
            question_text: question.question,  // Set question text
            selected_option: userAnswers[index],  // Set selected option
            correct_option: question.correct_answer // Set correct option
        }))
    };

    displayQuizResults(result);  // Display quiz results

    document.querySelector('.left-buttons-container').classList.add('hidden-buttons'); // Hide left buttons
    document.getElementById('quiz-questions').classList.add('hidden'); // Hide quiz questions
    document.getElementById('results-quiz').classList.remove('hidden');  // Show quiz results
    alert('Quiz submitted!'); // Alert user that quiz is submitted
}

function displayQuizResults(result) {
    const resultContainer = document.getElementById('results-container'); // Get results container element
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
    window.location.href = 'triviaQuiz.html'; // Redirect to triviaQuiz.html
}

function backToQuizzes() {
    window.location.href = 'index.html'; // Redirect to index.html
}

function createResultButtons() {
    const buttonContainerBelow = document.getElementById('button-container-below'); // Get button container below element
    buttonContainerBelow.innerHTML = ''; // Clear previous buttons if any

    const retakeButton = document.createElement('button'); // Create retake button
    retakeButton.innerText = 'Retake Quiz'; // Set button text
    retakeButton.className = 'retake-button'; // Add a class for styling
    retakeButton.onclick = () => { // Add click event listener
        window.location.href = 'triviaQuiz.html';  // Redirect to triviaQuiz.html
    };

    const homeButton = document.createElement('button');  // Create home button
    homeButton.innerText = 'Back to Home'; // Set button text
    homeButton.className = 'home-button'; // Add a class for styling
    homeButton.onclick = () => { // Add click event listener
        window.location.href = 'index.html'; // Redirect to index.html
    };

    buttonContainerBelow.appendChild(retakeButton);  // Append retake button to button container below
    buttonContainerBelow.appendChild(homeButton);// Append home button to button container below
}