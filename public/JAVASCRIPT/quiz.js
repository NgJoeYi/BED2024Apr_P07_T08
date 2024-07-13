document.addEventListener('DOMContentLoaded', () => {

    // Set active state based on the current page
    const quizButton = document.getElementById('quiz-button');
    const statisticsButton = document.getElementById('statistics-button');

    quizButton.classList.add('active');
    quizButton.classList.remove('inactive');
    statisticsButton.classList.remove('active');
    statisticsButton.classList.add('inactive');

    quizButton.addEventListener('click', () => {
        window.location.href = 'quiz.html'; // Navigate to quiz.html
    });

    statisticsButton.addEventListener('click', () => {
        window.location.href = 'statistics.html'; // Navigate to statistics.html
    });

    // checkSessionToken();
    fetchQuizzes();

    // Check the role from session storage and show/hide the create quiz button
    const userRole = sessionStorage.getItem('role');
    const createQuizBtn = document.getElementById('create-quiz-btn');
    if (userRole !== 'lecturer') {
        createQuizBtn.style.display = 'none';
        updateButton.style.display = 'none';

    }

    const quizModal = document.getElementById('quiz-modal');
    const updateModal = document.getElementById('update-modal');
    const questionModal = document.getElementById('question-modal');
    const closeQuizModalBtn = document.querySelector('.close-quiz-modal-btn');
    const closeUpdateModalBtn = document.querySelector('.close-update-modal-btn');
    const closeQuestionModalBtn = document.querySelector('.close-question-modal-btn');

    createQuizBtn.addEventListener('click', () => {
        quizModal.style.display = 'block';
    });

    closeQuizModalBtn.addEventListener('click', () => {
        quizModal.style.display = 'none';
    });

    closeUpdateModalBtn.addEventListener('click', () => {  
        updateModal.style.display = 'none';  
    });  

    closeQuestionModalBtn.addEventListener('click', () => {
        questionModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target == quizModal) {
            quizModal.style.display = 'none';
        } else if (event.target == updateModal) {  
            updateModal.style.display = 'none';  
        } else if (event.target == questionModal) {
            questionModal.style.display = 'none';
        }
    });

    const quizForm = document.getElementById('quiz-form');
    if (quizForm) {
        quizForm.addEventListener('submit', createQuiz);
    }

    const updateQuizForm = document.getElementById('update-quiz-form');  
    if (updateQuizForm) {  
        updateQuizForm.addEventListener('submit', updateQuiz);  
    }  

    const questionForm = document.getElementById('question-form');
    if (questionForm) {
        questionForm.addEventListener('submit', createQuestion);
    }

    const prevButton = document.getElementById('prev-question');
    if (prevButton) {
        prevButton.addEventListener('click', showPreviousQuestion);
    }

    const nextButton = document.getElementById('next-question');
    if (nextButton) {
        nextButton.addEventListener('click', showNextQuestion);
    }

    const deleteQuizBtn = document.getElementById('delete-quiz-btn');
    if (deleteQuizBtn) {
        deleteQuizBtn.addEventListener('click', (event) => deleteQuiz(event));
    }
});

// function checkSessionToken() {
//     const token = sessionStorage.getItem('token');
//     if (!token) {
//         alert('You are not logged in. Please log in to continue.');
//         window.location.href = '/login.html'; // Redirect to the login page
//     }
// }

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
    // console.log('userId:', userId);


    quizzes.forEach(quiz => {
        // console.log('Quiz data:', quiz); // Log quiz data to check if quizImg is present

        const quizCard = document.createElement('div');
        quizCard.className = 'quiz-card';

        const quizImage = document.createElement('img');
        // Convert binary data to base64 string and set it as the image source
        if (quiz.quizImg && quiz.quizImg.data) {
            const base64String = arrayBufferToBase64(quiz.quizImg.data);
            quizImage.src = `data:image/jpeg;base64,${base64String}`;
            // console.log('Base64 Image String:', base64String); // Log the base64 image string
        } else {
            console.log('cannot get image.....');
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
    
        // Add dropdown menu only if the current user is the creator of the quiz
        console.log('Comparing userId:', userId, 'with quiz.created_by:', quiz.created_by);
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

    // CHANGED FOR DROP DOWN: Event delegation for dropdown toggles
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

// ------------------------------- CREATE QUIZ -------------------------------

async function createQuiz(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const quizData = Object.fromEntries(formData.entries());
    console.log('Quiz Data:', quizData);
    await handleImageUploadForCreate(quizData);
}

async function handleImageUploadForCreate(data) {
    const imgFile = document.getElementById('quizImg').files[0];
    if (imgFile) {
        const reader = new FileReader();
        reader.onloadend = async () => {
            data['quizImg'] = reader.result.split(',')[1];
            // console.log('Data with Image:', data);
            await createQuizRequest(data);
        };
        reader.readAsDataURL(imgFile);
    } else {
        console.log('Data without Image:', data);
        await createQuizRequest(data);
    }
}

async function createQuizRequest(data) {
    const token = sessionStorage.getItem('token');
    try {
        const response = await fetch('/quizzes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        const body = await response.json();
        if (!response.ok) throw new Error(body.message);

        handleQuizCreationResponse(body);
    } catch (error) {
        console.error('Error creating quiz:', error);
        alert(`Error creating quiz: ${error.message}`);
    }
}

function handleQuizCreationResponse(data) {
    if (data.quiz && data.quiz.quiz_id) {
        alert(`${data.message}`);
        document.getElementById('quiz_id').value = data.quiz.quiz_id;
        document.getElementById('quiz-modal').style.display = 'none';
        document.getElementById('question-modal').style.display = 'block';
        currentQuestionIndex = 0; // Initialize the current question index
        totalQuestions = parseInt(data.quiz.total_questions); // Get the total questions
        createQuestionForm();
    } else {
        alert('Failed to create quiz');
    }
}

// ------------------------------- CREATE QUESTION -------------------------------

let currentQuestionIndex = 0;
let totalQuestions = 0;

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
            <input type="text" id="correct_option" name="correct_option" required>
        </div>
        <div>
            <label for="qnsImg">Question Image:</label>
            <input type="file" id="qnsImg" name="qnsImg" accept="image/*">
        </div>
    `;
    document.getElementById('prev-question').disabled = currentQuestionIndex === 0;
    document.getElementById('next-question').style.display = currentQuestionIndex < totalQuestions - 1 ? 'inline-block' : 'none';
    document.getElementById('submit-questions').style.display = currentQuestionIndex === totalQuestions - 1 ? 'inline-block' : 'none';
}


async function createQuestion(event) { // CHANGED FOR CREATION: Modify to handle "Next" button click
    event.preventDefault();
    const formData = new FormData(event.target);
    const questionData = Object.fromEntries(formData.entries());
    const quizId = document.getElementById('quiz_id').value;
    console.log('************** QUIZ ID:', quizId);
    questionData.quiz_id = quizId;

    // // Validate correct option
    // const options = [questionData.option_1, questionData.option_2, questionData.option_3, questionData.option_4];
    // if (!options.includes(questionData.correct_option)) {
    //     alert("Correct option must be one of the provided options.");
    //     return;
    // }

    // // Validate uniqueness of options
    // const uniqueOptions = new Set(options);
    // if (uniqueOptions.size !== options.length) {
    //     alert("All options must be unique.");
    //     return;
    // }

    await handleImageUploadForQuestion(questionData);
}

async function handleImageUploadForQuestion(data) {
    const imgFile = document.getElementById('qnsImg').files[0];
    if (imgFile) {
        const reader = new FileReader();
        reader.onloadend = async () => {
            data['qnsImg'] = reader.result.split(',')[1];
            // console.log('Data with Image:', data);
            await createQuestionRequest(data);
        };
        reader.readAsDataURL(imgFile);
    } else {
        console.log('Data without Image:', data);
        data['qnsImg'] = null;
        await createQuestionRequest(data);
    }
}

async function createQuestionRequest(data) {
    const token = sessionStorage.getItem('token');
    try {
        const response = await fetch(`/quizzes/${data.quiz_id}/questions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        const body = await response.json();
        if (!response.ok) throw new Error(body.message);

        handleQuestionCreationResponse(response, body);
    } catch (error) {
        console.error('Error creating question:', error);
        alert(`Error creating question: ${error.message}`);
    }
}

function handleQuestionCreationResponse(response, body) {
    if (response.ok) {
        if (currentQuestionIndex < totalQuestions - 1) {
            currentQuestionIndex++;
            createQuestionForm();
        } else {
            alert('All questions have been created successfully.');
            document.getElementById('question-modal').style.display = 'none';
            fetchQuizzes();
        }
    } else {
        alert(`Failed to create question: ${body.message}`);
    }
}

function showPreviousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        createQuestionForm();
    }
}

function showNextQuestion() {
    const questionForm = document.getElementById('question-form');
    questionForm.dispatchEvent(new Event('submit'));
}

// ------------------------------- UPDATE QUIZ -------------------------------

function openUpdateModal(quiz) {  // prefill the modal fields
    document.getElementById('update_quiz_id').value = quiz.quiz_id;  
    document.getElementById('update_title').value = quiz.title;  
    document.getElementById('update_description').value = quiz.description;  
    document.getElementById('update_total_questions').value = quiz.total_questions;  
    document.getElementById('update_total_marks').value = quiz.total_marks;  
    // Store the current image data in a hidden input
    if (quiz.quizImage && quiz.quizImage.data) {
        const base64String = arrayBufferToBase64(quiz.quizImage.data);
        document.getElementById('current_quiz_img').value = base64String;
        const quizImgPreview = document.getElementById('update_quiz_img_preview');
        quizImgPreview.src = `data:image/jpeg;base64,${base64String}`;
        quizImgPreview.style.display = 'block'; // Show the image preview
    } else {
        document.getElementById('update_quiz_img_preview').style.display = 'none';
    }

    // Open the modal
    document.getElementById('update-modal').style.display = 'block';
} 

async function updateQuiz(event) {  
    event.preventDefault();  
    const formData = new FormData(event.target);  
    const quizData = Object.fromEntries(formData.entries());  
    delete quizData.created_by; // don't need to send this to back end
    console.log('********************* quiz data:',quizData);

    // Check if a new image file is selected
    const imgFile = document.getElementById('update_quizImg').files[0];
    if (imgFile) {
        // If a new image is provided, read it
        const reader = new FileReader();
        reader.onloadend = async () => {
            quizData['quizImg'] = reader.result.split(',')[1];
            await updateQuizRequest(quizData);
        };
        reader.readAsDataURL(imgFile);
    } else {
        // If no new image is provided, use the existing image data
        quizData['quizImg'] = document.getElementById('current_quiz_img').value;
        await updateQuizRequest(quizData);
    }
}

async function updateQuizRequest(data) {
    const token = sessionStorage.getItem('token');
    try {
        const response = await fetch(`/quizzes/${data.quiz_id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        const body = await response.json();
        if (!response.ok) throw new Error(body.message);

        handleUpdateQuizResponse(response, body);
    } catch (error) {
        console.error('Error updating quiz:', error);
        alert(`Error updating quiz: ${error.message}`);
    }
}

function handleUpdateQuizResponse(response, body) {  
    if (response.status === 200) {  
        alert(`${body.message}`);  
        document.getElementById('update-modal').style.display = 'none';  
        fetchQuizzes();  
    } else {  
        alert(`Failed to update quiz: ${body.message}`);  
    }  
}

// ------------------------------- DELETE QUIZ -------------------------------

async function deleteQuiz(event) {
    event.preventDefault();
    const quizId = document.getElementById('update_quiz_id').value;
    const token = sessionStorage.getItem('token');
    try {
        const response = await fetch(`/quizzes/${quizId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const body = await response.json();
        if (!response.ok) throw new Error(body.message);

        alert('Quiz successfully deleted');
        document.getElementById('update-modal').style.display = 'none';
        fetchQuizzes(); // Refresh the quizzes list
    } catch (error) {
        console.error('Error deleting quiz:', error);
        alert(`Error deleting quiz: ${error.message}`);
    }
}