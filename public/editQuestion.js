function initializeEditQuestion() {
    const urlParams = new URLSearchParams(window.location.search);
    const quizId = urlParams.get('quizId');
    const isEditMode = urlParams.get('edit-mode') === 'true'; // Check if edit mode is enabled

    console.log(`quizId: ${quizId}, isEditMode: ${isEditMode}`);

    // Ensure the correct CSS file is loaded based on the mode
    const stylesheetLink = document.getElementById('mode-stylesheet');
    if (stylesheetLink) { // Check if the stylesheet link element exists
        if (isEditMode) {
            console.log('using edit css');
            stylesheetLink.href = 'editQuestion.css'; // Load the edit mode stylesheet
        } else {
            stylesheetLink.href = 'question.css'; // Load the regular mode stylesheet
        }
    }

    if (isEditMode) {
        fetchQuizWithQuestionsForEdit(quizId, isEditMode);
    }
}

let editQuestions = []; // Renamed variable to avoid conflicts

function getToken() {
    return sessionStorage.getItem('token');
}

function fetchQuizWithQuestionsForEdit(quizId, isEditMode) {
    const token = getToken();
    fetch(`/quizzes/${quizId}/questions`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(quiz => {
        if (quiz && quiz.questions) {
            editQuestions = quiz.questions;
            displayQuestionsForEdit(isEditMode);
        } else {
            console.error('Quiz or questions not found');
            document.getElementById('questions-container').innerText = 'Quiz or questions not available.';
        }
    })
    .catch(error => console.error('Error fetching quiz with questions:', error));
}

function displayQuestionsForEdit(isEditMode) {
    const questionsContainer = document.getElementById('questions-container');
    questionsContainer.innerHTML = '';

    editQuestions.forEach((question, index) => {
        const questionCard = document.createElement('div');
        questionCard.className = 'question-card';

        const questionTitle = document.createElement('h3');
        questionTitle.innerText = `Q${index + 1}:`;
        questionCard.appendChild(questionTitle);

        const questionInput = document.createElement('textarea');
        questionInput.value = question.question_text;
        questionInput.dataset.questionId = question.question_id; // Use correct ID field
        questionCard.appendChild(questionInput);

        if (question.qnsImg && question.qnsImg.data) {
            const base64String = arrayBufferToBase64(question.qnsImg.data);
            const questionImage = document.createElement('img');
            questionImage.src = `data:image/jpeg;base64,${base64String}`;
            questionCard.appendChild(questionImage);

            const imageInput = document.createElement('input');
            imageInput.type = 'file';
            imageInput.dataset.questionId = question.question_id; // Use correct ID field
            questionCard.appendChild(imageInput);
        }

        const options = [question.option_1, question.option_2, question.option_3, question.option_4];
        options.forEach((option, i) => {
            const optionInput = document.createElement('input');
            optionInput.type = 'text';
            optionInput.value = option;
            optionInput.dataset.questionId = question.question_id; // Use correct ID field
            optionInput.dataset.optionIndex = i;
            questionCard.appendChild(optionInput);
        });

        const correctOptionInput = document.createElement('input');
        correctOptionInput.type = 'text';
        correctOptionInput.value = question.correct_option;
        correctOptionInput.dataset.questionId = question.question_id; // Use correct ID field
        correctOptionInput.dataset.correctOption = true;
        questionCard.appendChild(correctOptionInput);

        // Add Delete button in edit mode
        const deleteButton = document.createElement('button');
        deleteButton.innerText = 'Delete';
        deleteButton.onclick = () => deleteQuestion(question.question_id); // Use correct ID field
        questionCard.appendChild(deleteButton);

        questionsContainer.appendChild(questionCard);
    });

    const saveButton = document.createElement('button');
    saveButton.id = 'save-changes'; // Make sure the button has this ID
    saveButton.innerText = 'Save Changes';
    saveButton.onclick = saveChanges;
    questionsContainer.appendChild(saveButton);

    // Hide or remove the submit quiz button in edit mode
    const submitQuizButton = document.getElementById('submit-quiz');
    if (submitQuizButton) {
        submitQuizButton.style.display = 'none';
    }

    // Hide or remove the timer element in edit mode
    const timerElement = document.getElementById('timer');
    if (timerElement) {
        timerElement.style.display = 'none';
    }

    // Hide or remove the next button
    const nextButton = document.getElementById('next-button');
    if (nextButton) {
        nextButton.style.display = 'none';
    }

    // Hide or remove the previous button
    const prevButton = document.getElementById('prev-button');
    if (prevButton) {
        prevButton.style.display = 'none';
    }
}

function deleteQuestion(questionId) {
    const token = getToken();
    const urlParams = new URLSearchParams(window.location.search);
    const quizId = urlParams.get('quizId');

    console.log(`Deleting question with id: ${questionId} from quiz: ${quizId}`);

    fetch(`/quizzes/${quizId}/questions/${questionId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        return response.json();
    })
    .then(data => {
        console.log('Delete response data:', data);
        if (data.message === 'Question deleted successfully') {
            alert('Question deleted successfully');
            // Remove the question from the UI
            const questionCard = document.querySelector(`textarea[data-question-id="${questionId}"]`).parentElement;
            questionCard.remove();
        } else if (data.confirmDeleteQuiz) { // CHANGED FOR QUIZ QUESTION DELETION
            const confirmDelete = confirm(data.message);
            if (confirmDelete) {
                deleteQuizById(quizId); // CHANGED FOR QUIZ QUESTION DELETION
            }
        } else {
            console.error('Error deleting question:', data.message);
        }
    })
    .catch(error => console.error('Error deleting question:', error));
}

function deleteQuizById(quizId) { // CHANGED FOR QUIZ QUESTION DELETION
    const token = getToken();
    fetch(`/quizzes/${quizId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Quiz successfully deleted') {
            alert('Quiz deleted successfully');
            window.location.href = '/quiz.html'; // Redirect to quizzes list or appropriate page
        } else {
            console.error('Error deleting quiz:', data.message);
        }
    })
    .catch(error => console.error('Error deleting quiz:', error));
}

async function saveChanges() {
    const updatedQuestions = [];
    const urlParams = new URLSearchParams(window.location.search);
    const quizId = urlParams.get('quizId');

    for (const question of editQuestions) {
        const questionId = question.question_id; // Use correct ID field
        const questionTextElement = document.querySelector(`textarea[data-question-id="${questionId}"]`);
        if (!questionTextElement) {
            continue;
        }
        const questionText = questionTextElement.value;
        const options = [];
        for (let i = 0; i < 4; i++) {
            options.push(document.querySelector(`input[data-question-id="${questionId}"][data-option-index="${i}"]`).value);
        }
        const correctOption = document.querySelector(`input[data-question-id="${questionId}"][data-correct-option="true"]`).value;

        const imgFile = document.querySelector(`input[data-question-id="${questionId}"][type="file"]`).files[0];
        let qnsImg = null;

        if (imgFile) {
            qnsImg = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    resolve(reader.result.split(',')[1]);
                };
                reader.onerror = reject;
                reader.readAsDataURL(imgFile);
            });
        } else {
            qnsImg = question.qnsImg ? arrayBufferToBase64(question.qnsImg.data) : null;
        }

        updatedQuestions.push({
            question_id: questionId,
            question_text: questionText,
            qnsImg: qnsImg,
            option_1: options[0],
            option_2: options[1],
            option_3: options[2],
            option_4: options[3],
            correct_option: correctOption
        });
    }

    try {
        for (const updatedQuestion of updatedQuestions) {
            const response = await fetch(`/quizzes/${quizId}/questions/${updatedQuestion.question_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify(updatedQuestion)
            });
            const data = await response.json();
            if (!data.success) {
                console.error(`Error updating question ${updatedQuestion.question_id}:`, data.message);
            } else {
                console.log(`Question ${updatedQuestion.question_id} updated successfully`);
            }
        }
        alert('Questions updated successfully');
        window.location.href = `/quiz.html?quizId=${quizId}`;
    } catch (error) {
        console.error('Error saving changes:', error);
    }
}
