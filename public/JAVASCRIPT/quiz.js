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
    const closeUpdateModalBtn = document.querySelector('.close-update-modal-btn');

    // Show the quiz creation modal
    createQuizBtn.addEventListener('click', () => {
        // Clear session storage items
        sessionStorage.removeItem('quizData');
        sessionStorage.removeItem('questions');
        sessionStorage.removeItem('questionImages');
        sessionStorage.removeItem('questionImageNames');
        
        // Clear the image input
        const qnsImgInput = document.getElementById('qnsImg');
        if (qnsImgInput) {
            qnsImgInput.value = ''; // Clear the file input
        }
        
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

    // Close the quiz update modal
    closeUpdateModalBtn.addEventListener('click', () => {
        closeUpdateModal();
    });

    const questionForm = document.getElementById('question-form');
    if (questionForm) {
        questionForm.addEventListener('submit', handleQuestionFormSubmit);
    }

    // Next question button event listener
    const nextButton = document.getElementById('next-question');
    if (nextButton) {
        nextButton.addEventListener('click', showNextQuestion);
    }

    // Previous question button event listener
    const prevButton = document.getElementById('prev-question');
    if (prevButton) {
        prevButton.addEventListener('click', showPreviousQuestion);
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

let currentQuestionIndex = 0;
let totalQuestions = 0;
let questions = [];
let questionImages = []; // To store base64 image data
let questionImageNames = []; // To store image file names

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

function displayQuizzes(quizzes) {
    const quizContainer = document.getElementById('quiz-container');
    quizContainer.innerHTML = '';
    const userId = parseInt(sessionStorage.getItem('userId')); // current user's ID from session storage

    quizzes.forEach(quiz => {
        const quizCard = document.createElement('div');
        quizCard.className = 'quiz-card';

        const quizImage = document.createElement('img');
        if (quiz.quizImg && quiz.quizImg.data) {
            const base64String = arrayBufferToBase64(quiz.quizImg.data);
            quizImage.src = `data:image/jpeg;base64,${base64String}`;
        }
        quizCard.appendChild(quizImage);

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

        const startButton = document.createElement('button');
        startButton.innerText = 'Start Quiz';
        startButton.onclick = () => window.location.href = `/question.html?quizId=${quiz.quiz_id}`;
        buttonContainer.appendChild(startButton);

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

function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function handleQuizFormSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const quizData = Object.fromEntries(formData.entries());

    const imgFile = document.getElementById('quizImg').files[0];
    if (imgFile) {
        const reader = new FileReader();
        reader.onloadend = () => {
            quizData.quizImg = reader.result.split(',')[1];
            console.log('Quiz Data with Image:', quizData);
            storeQuizData(quizData);
        };
        reader.readAsDataURL(imgFile);
    } else {
        quizData.quizImg = null;
        console.log('Quiz Data without Image:', quizData);
        storeQuizData(quizData);
    }
}

function storeQuizData(quizData) {
    sessionStorage.setItem('quizData', JSON.stringify(quizData));
    document.getElementById('quiz-modal').style.display = 'none';
    document.getElementById('question-modal').style.display = 'block';
    currentQuestionIndex = 0;
    totalQuestions = parseInt(quizData.total_questions);
    questions = JSON.parse(sessionStorage.getItem('questions')) || new Array(totalQuestions).fill({});
    questionImages = JSON.parse(sessionStorage.getItem('questionImages')) || new Array(totalQuestions).fill(null);
    questionImageNames = JSON.parse(sessionStorage.getItem('questionImageNames')) || new Array(totalQuestions).fill(null);
    createQuestionForm();
}

async function handleQuestionFormSubmit(event) {
    event.preventDefault();
    saveCurrentQuestionData();
    const questionData = questions[currentQuestionIndex];
    if (questionImages[currentQuestionIndex]) {
        questionData.qnsImg = questionImages[currentQuestionIndex];
    }
    await storeQuestionData(questionData);
}

function saveCurrentQuestionData() {
    const questionData = {
        question_text: document.getElementById('question_text').value,
        option_1: document.getElementById('option_1').value,
        option_2: document.getElementById('option_2').value,
        option_3: document.getElementById('option_3').value,
        option_4: document.getElementById('option_4').value,
        correct_option: document.getElementById('correct_option').value,
        qnsImg: questionImages[currentQuestionIndex] // Store the image data in base64 format
    };
    questions[currentQuestionIndex] = questionData;
    sessionStorage.setItem('questions', JSON.stringify(questions));
    sessionStorage.setItem('questionImages', JSON.stringify(questionImages)); // Save the images in session storage
    sessionStorage.setItem('questionImageNames', JSON.stringify(questionImageNames)); // Save image names in session storage
    console.log('Current Question Data Saved:', questionData);
}

async function storeQuestionData(questionData) {
    questions[currentQuestionIndex] = questionData;
    sessionStorage.setItem('questions', JSON.stringify(questions));
    console.log('Stored Questions:', questions);

    if (currentQuestionIndex < totalQuestions - 1) {
        currentQuestionIndex++;
        createQuestionForm();
    } else {
        await submitQuizAndQuestions();
        alert('All questions have been created successfully.');
        document.getElementById('question-modal').style.display = 'none';
        resetQuizForm();
        fetchQuizzes();
    }
}

function resetQuizForm() {
    const quizForm = document.getElementById('quiz-form');
    quizForm.reset();
}

async function submitQuizAndQuestions() {
    const quizData = JSON.parse(sessionStorage.getItem('quizData'));
    const questions = JSON.parse(sessionStorage.getItem('questions'));

    if (!Array.isArray(questions)) {
        console.error('Questions are not an array:', questions);
        return;
    }

    const createdQuiz = await createQuizRequest(quizData);

    for (let question of questions) {
        question.quiz_id = createdQuiz.quiz_id;
        await createQuestionRequest(question);
    }

    sessionStorage.removeItem('quizData');
    sessionStorage.removeItem('questions');
    sessionStorage.removeItem('questionImages'); // Clear images from session storage
    sessionStorage.removeItem('questionImageNames'); // Clear image names from session storage
}

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

function createQuestionForm() {
    const questionsContainer = document.getElementById('questions-container');
    questionsContainer.innerHTML = `
        <div>
            <label for="question_text">Question:</label>
            <input type="text" id="question_text" name="question_text" value="${questions[currentQuestionIndex]?.question_text || ''}" required>
        </div>
        <div>
            <label for="option_1">Option 1:</label>
            <input type="text" id="option_1" name="option_1" value="${questions[currentQuestionIndex]?.option_1 || ''}" required>
        </div>
        <div>
            <label for="option_2">Option 2:</label>
            <input type="text" id="option_2" name="option_2" value="${questions[currentQuestionIndex]?.option_2 || ''}" required>
        </div>
        <div>
            <label for="option_3">Option 3:</label>
            <input type="text" id="option_3" name="option_3" value="${questions[currentQuestionIndex]?.option_3 || ''}" required>
        </div>
        <div>
            <label for="option_4">Option 4:</label>
            <input type="text" id="option_4" name="option_4" value="${questions[currentQuestionIndex]?.option_4 || ''}" required>
        </div>
        <div>
            <label for="correct_option">Correct Option:</label>
            <select id="correct_option" name="correct_option" required>
                <option value="1" ${questions[currentQuestionIndex]?.correct_option == 1 ? 'selected' : ''}>Option 1</option>
                <option value="2" ${questions[currentQuestionIndex]?.correct_option == 2 ? 'selected' : ''}>Option 2</option>
                <option value="3" ${questions[currentQuestionIndex]?.correct_option == 3 ? 'selected' : ''}>Option 3</option>
                <option value="4" ${questions[currentQuestionIndex]?.correct_option == 4 ? 'selected' : ''}>Option 4</option>
            </select>
        </div>
        <div>
            <label for="qnsImg">Question Image:</label>
            <input type="file" id="qnsImg" name="qnsImg" accept="image/*">
        </div>
    `;

    const questionNumberElement = document.getElementById('question-number');
    questionNumberElement.innerText = `Question ${currentQuestionIndex + 1}/${totalQuestions}`;
    document.getElementById('next-question').style.display = currentQuestionIndex < totalQuestions - 1 ? 'inline-block' : 'none';
    document.getElementById('prev-question').style.display = 'inline-block';
    document.getElementById('submit-questions').style.display = currentQuestionIndex === totalQuestions - 1 ? 'inline-block' : 'none';

    const qnsImgInput = document.getElementById('qnsImg');
    qnsImgInput.addEventListener('change', () => {
        const file = qnsImgInput.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            questionImages[currentQuestionIndex] = reader.result.split(',')[1]; // Save image data in base64
            questionImageNames[currentQuestionIndex] = file.name; // Save the filename
        };
        if (file) {
            reader.readAsDataURL(file);
        } else {
            questionImages[currentQuestionIndex] = null;
            questionImageNames[currentQuestionIndex] = null;
        }
    });

    // Prefill image filename if there is an image for the current question
    if (questionImageNames[currentQuestionIndex]) {
        const dataTransfer = new DataTransfer();
        const file = new File([""], questionImageNames[currentQuestionIndex]);
        dataTransfer.items.add(file);
        qnsImgInput.files = dataTransfer.files;
    }
}

function showNextQuestion() {
    saveCurrentQuestionData();
    if (currentQuestionIndex < totalQuestions - 1) {
        currentQuestionIndex++;
        createQuestionForm();
    }
}

function showPreviousQuestion() {
    saveCurrentQuestionData();
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        createQuestionForm();
    } else {
        document.getElementById('question-modal').style.display = 'none';
        document.getElementById('quiz-modal').style.display = 'block';
    }
}

// Update quiz modal handling functions
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
        quizData.quizImg = document.getElementById('current_quiz_img').value;
        await updateQuizRequest(quizData);
    }
}

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
