document.addEventListener('DOMContentLoaded', () => {
    // checkSessionToken();
    fetchQuizzes();

    // Check the role from session storage and show/hide the create quiz button
    const userRole = sessionStorage.getItem('role');
    const createQuizBtn = document.getElementById('create-quiz-btn');
    if (userRole !== 'lecturer') {
        createQuizBtn.style.display = 'none';
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

    const doneButton = document.getElementById('done-btn');
    if (doneButton) {
        doneButton.addEventListener('click', () => {
            questionModal.style.display = 'none';
        });
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

            const buttonContainer = document.createElement('div');  
            buttonContainer.className = 'button-container';  
    
            const startButton = document.createElement('button');
            startButton.innerText = 'Start Quiz';
            startButton.onclick = () => window.location.href = `/question.html?quizId=${quiz.quiz_id}`;
            buttonContainer.appendChild(startButton);  
    
            const updateButton = document.createElement('span');  
            updateButton.className = 'fa fa-ellipsis-v';  
            updateButton.style.cursor = 'pointer';
            updateButton.onclick = () => openUpdateModal(quiz);
            buttonContainer.appendChild(updateButton);  
    
            quizCardContent.appendChild(buttonContainer);  
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
        fetchQuizzes();
        const quizForm = document.getElementById('quiz-form');
        quizForm.reset();
    } else {
        alert('Failed to create quiz');
    }
}

// ------------------------------- CREATE QUESTION -------------------------------

async function createQuestion(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const questionData = Object.fromEntries(formData.entries());
    const quizId = document.getElementById('quiz_id').value;
    console.log('************** QUIZ ID:',quizId);
    questionData.quiz_id = quizId;


    // Validate correct option
    const options = [questionData.option_1, questionData.option_2, questionData.option_3, questionData.option_4];
    if (!options.includes(questionData.correct_option)) {
        alert("Correct option must be one of the provided options.");
        return;
    }

    // Validate uniqueness of options
    const uniqueOptions = new Set(options);
    if (uniqueOptions.size !== options.length) {
        alert("All options must be unique.");
        return;
    }


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
        alert(`${body.message}`);
        // Reset the form for new question
        const questionForm = document.getElementById('question-form');
        questionForm.reset();
    } else {
        alert(`Failed to create question: ${body.message}`);
    }
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

    // CHANGED FOR IMAGE: Check if a new image file is selected
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


async function handleImageUploadForUpdate(data) {
    const imgFile = document.getElementById('update_quizImg').files[0];
    if (imgFile) {
        const reader = new FileReader();
        reader.onloadend = async () => {
            data['quizImg'] = reader.result.split(',')[1]; 
            // console.log('Data with Image:', data);
            await updateQuizRequest(data);
        };
        reader.readAsDataURL(imgFile);
    } else {
        console.log('Data without Image:', data);
        await updateQuizRequest(data);
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