document.addEventListener('DOMContentLoaded', () => {
    // Set active state based on the current page
    const quizButton = document.getElementById('quiz-button');
    const statisticsButton = document.getElementById('statistics-button');
    const triviaButton = document.getElementById('trivia-quiz-button');

    // Mark the quiz button as active and statistics button as inactive
    quizButton.classList.add('active');
    quizButton.classList.remove('inactive');
    statisticsButton.classList.remove('active');
    statisticsButton.classList.add('inactive');
    triviaButton.classList.remove('active');
    triviaButton.classList.add('inactive');

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

    fetchQuizzes(); // Fetch the list of quizzes

    // Check the role from session storage and show/hide the create quiz button
    const userRole = sessionStorage.getItem('role');
    const createQuizBtn = document.getElementById('create-quiz-btn');
    if (userRole !== 'lecturer') {
        createQuizBtn.style.display = 'none'; // Hide the create quiz button if the user is not a lecturer
    }

    // Modal elements
    const quizModal = document.getElementById('quiz-modal');
    const questionModal = document.getElementById('question-modal');
    const closeQuizModalBtn = document.querySelector('.close-quiz-modal-btn');
    const closeUpdateModalBtn = document.querySelector('.close-update-modal-btn'); // @@@@


    // Show the quiz creation modal
    createQuizBtn.addEventListener('click', () => {
        quizModal.style.display = 'block';
    });

    // Close the quiz creation modal
    closeQuizModalBtn.addEventListener('click', () => {
        quizModal.style.display = 'none';
    });

    // Form submission event listeners
    const quizForm = document.getElementById('quiz-form');
    if (quizForm) {
        quizForm.addEventListener('submit', handleQuizFormSubmit);
    }

    // Close the quiz update modal // @@@@
    closeUpdateModalBtn.addEventListener('click', () => { // @@@@
        closeUpdateModal(); // @@@@
    }); // @@@@

    const questionForm = document.getElementById('question-form');
    if (questionForm) {
        questionForm.addEventListener('submit', handleQuestionFormSubmit);
    }

    // Next question button event listener
    const nextButton = document.getElementById('next-question');
    if (nextButton) {
        nextButton.addEventListener('click', showNextQuestion);
    }

    // Delete quiz button event listener 
    const deleteQuizBtn = document.getElementById('delete-quiz-btn'); 
    if (deleteQuizBtn) { 
        deleteQuizBtn.addEventListener('click', () => { 
            const quizId = document.getElementById('update_quiz_id').value; 
            handleDeleteQuiz(quizId); 
        }); 
    } 
});

// Fetch quizzes from the server
function fetchQuizzes() {
    fetch('/quizzes')
        .then(response => response.json())
        .then(quizzes => {
            if (quizzes && quizzes.length > 0) {
                displayQuizzes(quizzes);
            } else {
                console.error('No quizzes found');
                document.getElementById('quiz-container').innerText = 'No quizzes available.';
            }
        })
        .catch(error => console.error('Error fetching quizzes:', error));
}

// Display quizzes on the page
function displayQuizzes(quizzes) {
    const quizContainer = document.getElementById('quiz-container');
    quizContainer.innerHTML = '';
    const userId = parseInt(sessionStorage.getItem('userId')); // current user's ID from session storage

    quizzes.forEach(quiz => {
        const quizCard = document.createElement('div');
        quizCard.className = 'quiz-card';

        // Create and append quiz image
        const quizImage = document.createElement('img');
        if (quiz.quizImg && quiz.quizImg.data) {
            const base64String = arrayBufferToBase64(quiz.quizImg.data);
            quizImage.src = `data:image/jpeg;base64,${base64String}`;
        }
        quizCard.appendChild(quizImage);

        // Create and append quiz card content
        const quizCardContent = document.createElement('div');
        quizCardContent.className = 'quiz-card-content';

        const quizTitle = document.createElement('h3');
        quizTitle.innerText = quiz.title;
        quizCardContent.appendChild(quizTitle);

        const quizDescription = document.createElement('p');
        quizDescription.innerText = quiz.description;
        quizCardContent.appendChild(quizDescription);

        const quizDetails = document.createElement('p');
        quizDetails.className = 'quiz-details';
        quizDetails.innerHTML = `
            <strong>Total Questions:</strong> ${quiz.total_questions} | 
            <strong>Total Marks:</strong> ${quiz.total_marks} | 
            <strong>Created By:</strong> ${quiz.creator_name}`;
        quizCardContent.appendChild(quizDetails);

        const buttonContainer = document.createElement('div');  
        buttonContainer.className = 'button-container';  

        // Create and append start quiz button
        const startButton = document.createElement('button');
        startButton.innerText = 'Start Quiz';
        startButton.onclick = () => window.location.href = `/question.html?quizId=${quiz.quiz_id}`;
        buttonContainer.appendChild(startButton);  

        // Add dropdown menu only if the current user is the creator of the quiz
        if (userId === quiz.created_by) {
            const dropdown = document.createElement('div');
            dropdown.className = 'dropdown';
            const dropdownToggle = document.createElement('span');
            dropdownToggle.className = 'fa fa-ellipsis-v dropdown-toggle';
            dropdownToggle.style.cursor = 'pointer';
            dropdown.appendChild(dropdownToggle);

            const dropdownMenu = document.createElement('div');
            dropdownMenu.className = 'dropdown-menu';
            const editDeleteQuizLink = document.createElement('a');
            editDeleteQuizLink.href = '#';
            editDeleteQuizLink.className = 'edit-delete-quiz';
            editDeleteQuizLink.innerText = 'Edit / Delete Quiz';
            editDeleteQuizLink.onclick = (event) => {
                event.preventDefault();
                openUpdateModal(quiz);
            };
            dropdownMenu.appendChild(editDeleteQuizLink);

            const editDeleteQuestionLink = document.createElement('a');
            editDeleteQuestionLink.href = '#';
            editDeleteQuestionLink.className = 'edit-delete-question';
            editDeleteQuestionLink.innerText = 'Edit / Delete Question';   

            editDeleteQuestionLink.onclick = (event) => {
                event.preventDefault();
                window.location.href = `Question.html?quizId=${quiz.quiz_id}&edit-mode=true`; // Navigate to Question.html with quizId and edit-mode
            };
            dropdownMenu.appendChild(editDeleteQuestionLink);

            dropdown.appendChild(dropdownMenu);
            buttonContainer.appendChild(dropdown);
        }

        quizCardContent.appendChild(buttonContainer);
        quizCard.appendChild(quizCardContent);
        quizContainer.appendChild(quizCard);
    });

    // Event delegation for dropdown toggles
    document.addEventListener('click', (event) => {
        const isDropdownToggle = event.target.matches('.dropdown-toggle');
        if (!isDropdownToggle && event.target.closest('.dropdown-menu') == null) {
            document.querySelectorAll('.dropdown-menu').forEach(menu => menu.style.display = 'none');
        }
        if (isDropdownToggle) {
            const dropdownMenu = event.target.nextElementSibling;
            dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
        }
    });
}

// Convert ArrayBuffer to base64 string
function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

// ------------------------------- HANDLE FORMS -------------------------------
// Handle quiz form submission
function handleQuizFormSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const quizData = Object.fromEntries(formData.entries());

    // Handle image upload for quiz creation
    const imgFile = document.getElementById('quizImg').files[0];
    if (imgFile) {
        const reader = new FileReader();
        reader.onloadend = () => {
            quizData.quizImg = reader.result.split(',')[1]; // Convert image to base64 string
            console.log('Quiz Data with Image:', quizData);
            storeQuizData(quizData);
        };
        reader.readAsDataURL(imgFile);
    } else {
        quizData.quizImg = null; // No image provided
        console.log('Quiz Data without Image:', quizData);
        storeQuizData(quizData);
    }
}

// Store quiz data temporarily and show the question modal
function storeQuizData(quizData) {
    sessionStorage.setItem('quizData', JSON.stringify(quizData));
    document.getElementById('quiz-modal').style.display = 'none';
    document.getElementById('question-modal').style.display = 'block';
    currentQuestionIndex = 0; // Initialize the current question index
    totalQuestions = parseInt(quizData.total_questions); // Get the total questions
    createQuestionForm();
}

// Handle question form submission
async function handleQuestionFormSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const questionData = Object.fromEntries(formData.entries());

    // Handle image upload for question creation
    const imgFile = document.getElementById('qnsImg').files[0];
    if (imgFile) {
        const reader = new FileReader();
        reader.onloadend = async () => {
            questionData.qnsImg = reader.result.split(',')[1]; // Convert image to base64 string
            console.log('Question Data with Image:', questionData);
            await storeQuestionData(questionData);
        };
        reader.readAsDataURL(imgFile);
    } else {
        questionData.qnsImg = null; // No image provided
        console.log('Question Data without Image:', questionData);
        await storeQuestionData(questionData);
    }
}

// Store question data and move to the next question or submit
async function storeQuestionData(questionData) {
    let questions = JSON.parse(sessionStorage.getItem('questions')) || [];
    questions.push(questionData);
    sessionStorage.setItem('questions', JSON.stringify(questions));
    console.log('Stored Questions:', questions); // Add logging here

    if (currentQuestionIndex < totalQuestions - 1) {
        currentQuestionIndex++;
        createQuestionForm(); // Create form for the next question
    } else {
        await submitQuizAndQuestions();
        alert('All questions have been created successfully.');
        document.getElementById('question-modal').style.display = 'none';
        resetQuizForm(); // Reset quiz form fields
        fetchQuizzes();
    }
}

// Reset quiz form fields
function resetQuizForm() {
    const quizForm = document.getElementById('quiz-form');
    quizForm.reset();
}

// Submit quiz and questions to the server
async function submitQuizAndQuestions() {
    const quizData = JSON.parse(sessionStorage.getItem('quizData'));
    const questions = JSON.parse(sessionStorage.getItem('questions'));

    // Check that questions are stored as an array
    if (!Array.isArray(questions)) {
        console.error('Questions are not an array:', questions);
        return;
    }

    // Send quiz data to the server and get the created quiz ID
    const createdQuiz = await createQuizRequest(quizData);

    // Send each question to the server
    for (let question of questions) {
        question.quiz_id = createdQuiz.quiz_id;
        await createQuestionRequest(question);
    }

    // Clear the temporary data
    sessionStorage.removeItem('quizData');
    sessionStorage.removeItem('questions');
}

// Send request to create quiz
async function createQuizRequest(data) {
    try {
        const response = await fetchWithAuth('/quizzes', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        const body = await response.json();
        if (!response.ok) {
            if (body.errors && body.errors.length > 0) {
                const error = new Error(body.message);
                error.errors = body.errors;
                throw error;
            }
            throw new Error(body.message);
        }

        return body.quiz;
    } catch (error) {
        console.error('Error creating quiz:', error);
        if (error.errors && error.errors.length > 0) {
            alert(`Error creating quiz: ${error.errors.join(', ')}`);
        } else {
            alert(`Error creating quiz: ${error.message}`);
        }
    }
}

// Send request to create question
async function createQuestionRequest(data) {
    try {
        const response = await fetchWithAuth(`/quizzes/${data.quiz_id}/questions`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
        const body = await response.json();
        if (!response.ok) {
            if (body.errors && body.errors.length > 0) {
                const error = new Error(body.message);
                error.errors = body.errors;
                throw error;
            }
            throw new Error(body.message);
        }

        return body;
    } catch (error) {
        console.error('Error creating question:', error);
        if (error.errors && error.errors.length > 0) {
            alert(`Error creating question: ${error.errors.join(', ')}`);
        } else {
            alert(`Error creating question: ${error.message}`);
        }
    }
}

// Create form for new question
function createQuestionForm() {
    const questionsContainer = document.getElementById('questions-container');
    questionsContainer.innerHTML = `
        <div>
            <label for="question_text">Question:</label>
            <input type="text" id="question_text" name="question_text" required>
        </div>
        <div>
            <label for="option_1">Option 1:</label>
            <input type="text" id="option_1" name="option_1" required>
        </div>
        <div>
            <label for="option_2">Option 2:</label>
            <input type="text" id="option_2" name="option_2" required>
        </div>
        <div>
            <label for="option_3">Option 3:</label>
            <input type="text" id="option_3" name="option_3" required>
        </div>
        <div>
            <label for="option_4">Option 4:</label>
            <input type="text" id="option_4" name="option_4" required>
        </div>
        <div>
            <label for="correct_option">Correct Option:</label>
            <select id="correct_option" name="correct_option" required>
                <option value="1">Option 1</option>
                <option value="2">Option 2</option>
                <option value="3">Option 3</option>
                <option value="4">Option 4</option>
            </select>
        </div>
        <div>
            <label for="qnsImg">Question Image:</label>
            <input type="file" id="qnsImg" name="qnsImg" accept="image/*">
        </div>
    `;

    // Display the current question number
    const questionNumberElement = document.getElementById('question-number');
    questionNumberElement.innerText = `Question ${currentQuestionIndex + 1}/${totalQuestions}`;
    document.getElementById('next-question').style.display = currentQuestionIndex < totalQuestions - 1 ? 'inline-block' : 'none';
    document.getElementById('submit-questions').style.display = currentQuestionIndex === totalQuestions - 1 ? 'inline-block' : 'none';
}

// Show the next question form
function showNextQuestion() {
    const questionForm = document.getElementById('question-form');
    questionForm.dispatchEvent(new Event('submit'));
}
















// %%%%%%%% Add missing functions for update and delete operations

// Open the update quiz modal and prefill the fields
function openUpdateModal(quiz) { 
    const updateQuizForm = document.getElementById('update-quiz-form'); 
    updateQuizForm.reset(); 
    document.getElementById('update_quiz_id').value = quiz.quiz_id; 
    document.getElementById('update_title').value = quiz.title; 
    document.getElementById('update_description').value = quiz.description; 
    document.getElementById('update_total_questions').value = quiz.total_questions; 
    document.getElementById('update_total_marks').value = quiz.total_marks; 

    const currentImage = quiz.quizImg ? `data:image/jpeg;base64,${arrayBufferToBase64(quiz.quizImg.data)}` : ''; 
    document.getElementById('update_quiz_img_preview').src = currentImage; 
    document.getElementById('update_quiz_img_preview').style.display = currentImage ? 'block' : 'none'; 

    document.getElementById('update-modal').style.display = 'block'; 
} 

// Close the update quiz modal
function closeUpdateModal() { 
    document.getElementById('update-modal').style.display = 'none'; 
} 


document.getElementById('update-quiz-form').addEventListener('submit', handleUpdateQuizFormSubmit);

async function handleUpdateQuizFormSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const quizData = Object.fromEntries(formData.entries());
    const imgFile = document.getElementById('update_quizImg').files[0];

    if (imgFile) {
        const reader = new FileReader();
        reader.onloadend = async () => {
            quizData.quizImg = reader.result.split(',')[1];
            await updateQuizRequest(quizData);
        };
        reader.readAsDataURL(imgFile);
    } else {
        quizData.quizImg = document.getElementById('current_quiz_img').value; // Use the stored current image
        await updateQuizRequest(quizData);
    }
}

// Send request to update quiz
async function updateQuizRequest(data) { 
    try { 
        const response = await fetchWithAuth(`/quizzes/${data.quiz_id}`, { 
            method: 'PUT', 
            body: JSON.stringify(data), 
        }); 
        const body = await response.json(); 
        if (!response.ok) { 
            throw new Error(body.message); 
        } 
        alert('Quiz updated successfully'); 
        closeUpdateModal(); 
        fetchQuizzes(); 
        location.reload(); 
    } catch (error) { 
        console.error('Error updating quiz:', error); 
        alert(`Error updating quiz: ${error.message}`); 
    } 
} 

// Handle delete quiz
async function handleDeleteQuiz(quizId) { 
    try { 
        const response = await fetchWithAuth(`/quizzes/${quizId}`, { 
            method: 'DELETE' 
        }); 
        if (!response.ok) { 
            throw new Error('Failed to delete quiz'); 
        } 
        alert('Quiz deleted successfully'); 
        fetchQuizzes(); 
        location.reload(); 
    } catch (error) { 
        console.error('Error deleting quiz:', error); 
        alert(`Error deleting quiz: ${error.message}`); 
    } 
} 