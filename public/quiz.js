document.addEventListener('DOMContentLoaded', () => {
    checkSessionToken();
    fetchQuizzes();

    // Check the role from session storage and show/hide the create quiz button
    const userRole = sessionStorage.getItem('role');
    const createQuizBtn = document.getElementById('create-quiz-btn');
    if (userRole !== 'lecturer') {
        createQuizBtn.style.display = 'none';
    }

    const quizModal = document.getElementById('quiz-modal');
    const questionModal = document.getElementById('question-modal'); // Question modal element
    const closeQuizModalBtn = document.querySelector('.close-quiz-modal-btn');
    const closeQuestionModalBtn = document.querySelector('.close-question-modal-btn');

    createQuizBtn.addEventListener('click', () => {
        quizModal.style.display = 'block';
    });

    closeQuizModalBtn.addEventListener('click', () => {
        quizModal.style.display = 'none';
    });

    closeQuestionModalBtn.addEventListener('click', () => {
        questionModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target == quizModal) {
            quizModal.style.display = 'none';
        } else if (event.target == questionModal) {
            questionModal.style.display = 'none';
        }
    });

    const quizForm = document.getElementById('quiz-form');
    if (quizForm) {
        quizForm.addEventListener('submit', createQuiz);
    }

    const questionForm = document.getElementById('question-form');
    if (questionForm) {
        questionForm.addEventListener('submit', createQuestion);
    }

    const doneButton = document.getElementById('done-btn');
    if (doneButton) {
        doneButton.addEventListener('click', () => {
            questionModal.style.display = 'none';
        });
    }
});

function checkSessionToken() {
    const token = sessionStorage.getItem('token');
    if (!token) {
        alert('You are not logged in. Please log in to continue.');
        window.location.href = '/login.html'; // Redirect to the login page
    }
}

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

    quizzes.forEach(quiz => {
        console.log('Quiz data:', quiz); // Log quiz data to check if quizImg is present

        const quizCard = document.createElement('div');
        quizCard.className = 'quiz-card';

        const quizImage = document.createElement('img');
        // Convert binary data to base64 string and set it as the image source
        if (quiz.quizImg && quiz.quizImg.data) {
            const base64String = arrayBufferToBase64(quiz.quizImg.data);
            quizImage.src = `data:image/jpeg;base64,${base64String}`;
            console.log('Base64 Image String:', base64String); // Log the base64 image string
        } else {
            console.log('Using default placeholder image');
            quizImage.src = 'default_placeholder_image.jpg'; // Path to default placeholder image
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
            <strong>Created By:</strong> ${quiz.created_by}`;
        quizCardContent.appendChild(quizDetails);

        const startButton = document.createElement('button');
        startButton.innerText = 'Start Quiz';
        startButton.onclick = () => window.location.href = `/question.html?quizId=${quiz.quiz_id}`;
        quizCardContent.appendChild(startButton);

        quizCard.appendChild(quizCardContent);
        quizContainer.appendChild(quizCard);
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

// ------------------------------- CREATE QUIZ & QUESTIONS -------------------------------

function createQuiz(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const quizData = Object.fromEntries(formData.entries());
    console.log('Quiz Data:', quizData);
    handleImageUpload(quizData, 'quizImg', '/quizzes', handleQuizCreationResponse);
}

function handleImageUpload(data, imgElementId, url, callback) {
    const imgFile = document.getElementById(imgElementId).files[0];
    if (imgFile) {
        const reader = new FileReader();
        reader.onloadend = () => {
            data[imgElementId] = reader.result.split(',')[1];
            console.log('Data with Image:', data);
            sendRequest(url, data, callback);
        };
        reader.readAsDataURL(imgFile);
    } else {
        console.log('Data without Image:', data);
        sendRequest(url, data, callback);
    }
}

function sendRequest(url, data, callback) {
    console.log('Sending Request to:', url);
    console.log('Request Data:', data);
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json().then(body => ({ status: response.status, body })))
    .then(({ status, body }) => {
        if (status >= 400) {
            callback({ success: false, message: body.message });
        } else {
            callback({ success: true, ...body });
        }
    })
    .catch(error => {
        console.error('Error processing request:', error);
        alert(`Error processing request: ${error.message}`);
    });
}

function handleQuizCreationResponse(data) {
    if (data.quiz_id) {
        alert('Quiz created successfully');
        document.getElementById('quiz_id').value = data.quiz_id;
        document.getElementById('quiz-modal').style.display = 'none';
        document.getElementById('question-modal').style.display = 'block';
        fetchQuizzes();
    } else {
        alert('Failed to create quiz');
    }
}

function createQuestion(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const questionData = Object.fromEntries(formData.entries());
    console.log('Question Data:', questionData);
    handleImageUpload(questionData, 'qnsImg', `/quizzes/${questionData.quiz_id}/questions`, handleQuestionCreationResponse);
}

function handleQuestionCreationResponse(response) {
    if (response.success) {
        alert('Question added successfully');
        // Reset the form for new question
        const questionForm = document.getElementById('question-form');
        questionForm.reset();
    } else {
        alert(`Failed to create question: ${response.message}`);
    }
}
