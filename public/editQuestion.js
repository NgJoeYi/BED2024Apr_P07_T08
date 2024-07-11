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
        // console.log('Quiz fetch response:', quiz);
        if (quiz && quiz.questions) {
            // console.log('Quiz fetched:', quiz);
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
        // console.log('Question:', question);
        const questionCard = document.createElement('div');
        questionCard.className = 'question-card';

        const questionTitle = document.createElement('h3');
        questionTitle.innerText = `Q${index + 1}:`;
        questionCard.appendChild(questionTitle);

        const questionInput = document.createElement('textarea');
        questionInput.value = question.question_text;
        questionInput.dataset.questionId = question._id; // Use correct ID field
        questionCard.appendChild(questionInput);

        if (question.qnsImg && question.qnsImg.data) {
            const base64String = arrayBufferToBase64(question.qnsImg.data);
            const questionImage = document.createElement('img');
            questionImage.src = `data:image/jpeg;base64,${base64String}`;
            questionCard.appendChild(questionImage);

            const imageInput = document.createElement('input');
            imageInput.type = 'file';
            imageInput.dataset.questionId = question._id; // Use correct ID field
            questionCard.appendChild(imageInput);
        }

        const options = [question.option_1, question.option_2, question.option_3, question.option_4];
        options.forEach((option, i) => {
            const optionInput = document.createElement('input');
            optionInput.type = 'text';
            optionInput.value = option;
            optionInput.dataset.questionId = question._id; // Use correct ID field
            optionInput.dataset.optionIndex = i;
            questionCard.appendChild(optionInput);
        });

        const correctOptionInput = document.createElement('input');
        correctOptionInput.type = 'text';
        correctOptionInput.value = question.correct_option;
        correctOptionInput.dataset.questionId = question._id; // Use correct ID field
        correctOptionInput.dataset.correctOption = true;
        questionCard.appendChild(correctOptionInput);

        // Add Delete button in edit mode
        const deleteButton = document.createElement('button');
        deleteButton.innerText = 'Delete';
        deleteButton.onclick = () => deleteQuestion(question._id); // Use correct ID field
        questionCard.appendChild(deleteButton);

        // console.log('Added Delete button');

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
    // Logic to delete a question
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
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Question deleted successfully');
            // Remove the question from the UI
            const questionCard = document.querySelector(`textarea[data-question-id="${questionId}"]`).parentElement;
            questionCard.remove();
        } else {
            console.error('Error deleting question:', data.message);
        }
    })
    .catch(error => console.error('Error deleting question:', error));
}

function saveChanges() {
    const updatedQuestions = [];
    const urlParams = new URLSearchParams(window.location.search);
    const quizId = urlParams.get('quizId');

    editQuestions.forEach(question => {
        const questionId = question._id; // Use correct ID field
        const questionText = document.querySelector(`textarea[data-question-id="${questionId}"]`).value;
        const options = [];
        for (let i = 0; i < 4; i++) {
            options.push(document.querySelector(`input[data-question-id="${questionId}"][data-option-index="${i}"]`).value);
        }
        const correctOption = document.querySelector(`input[data-question-id="${questionId}"][data-correct-option="true"]`).value;

        updatedQuestions.push({
            question_id: questionId,
            question_text: questionText,
            option_1: options[0],
            option_2: options[1],
            option_3: options[2],
            option_4: options[3],
            correct_option: correctOption
        });
    });

    // console.log('Updated Questions:', updatedQuestions);

    fetch(`/quizzes/${quizId}/questions`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ questions: updatedQuestions })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Questions updated successfully');
            window.location.href = `/quiz.html?quizId=${data.quizId}`;
        } else {
            console.error('Error updating questions:', data.message);
        }
    })
    .catch(error => console.error('Error updating questions:', error));
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
