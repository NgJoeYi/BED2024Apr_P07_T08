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
            stylesheetLink.href = '/CSS/editQuestion.css';
        } else {
            stylesheetLink.href = '/CSS/question.css';
        }
    }

    if (isEditMode) {
        fetchQuizWithQuestionsForEdit(quizId, isEditMode);
    }
}

let editQuestions = []; // Renamed variable to avoid conflicts

function fetchQuizWithQuestionsForEdit(quizId, isEditMode) {
    fetchWithAuth(`/quizzes/${quizId}/questions`) // ------------------------------------------------- headers in jwtutility.js
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

    // Add button container
    const buttonContainer = document.createElement('div');   
    buttonContainer.style.display = 'flex';   
    buttonContainer.style.gap = '10px';   
    questionsContainer.appendChild(buttonContainer);   

    // Add Create Question button
    const createQuestionButton = document.createElement('button');   
    createQuestionButton.id = 'create-question';   
    createQuestionButton.innerText = 'Create Question';   
    createQuestionButton.onclick = createNewQuestionForm;   
    buttonContainer.appendChild(createQuestionButton);   

    const saveButton = document.createElement('button');
    saveButton.id = 'save-changes'; // Make sure the button has this ID
    saveButton.innerText = 'Save Changes';
    saveButton.onclick = saveChanges;
    buttonContainer.appendChild(saveButton);   

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

// --------------------------------------------------------- CREATE QUESTION ---------------------------------------------------------

function createNewQuestionForm() {
    const questionsContainer = document.getElementById('questions-container');
    const questionCard = document.createElement('div');
    questionCard.className = 'question-card';
    questionCard.style.position = 'relative'; // Ensure the card is positioned relative for the button to work

    const closeButton = document.createElement('button');  
    closeButton.innerText = 'X'; 
    closeButton.style.position = 'absolute';  
    closeButton.style.top = '5px';  
    closeButton.style.right = '5px';  
    closeButton.onclick = () => {  
        questionCard.remove();  
    };  
    questionCard.appendChild(closeButton);

    const questionTitle = document.createElement('h3');
    questionTitle.innerText = `New Question:`;
    questionCard.appendChild(questionTitle);

    const questionInput = document.createElement('textarea');
    questionInput.placeholder = 'Enter question text here';
    questionCard.appendChild(questionInput);

    const imageInput = document.createElement('input');
    imageInput.type = 'file';
    questionCard.appendChild(imageInput);

    const optionInputs = [];
    for (let i = 0; i < 4; i++) {
        const optionInput = document.createElement('input');
        optionInput.type = 'text';
        optionInput.placeholder = `Option ${i + 1}`;
        questionCard.appendChild(optionInput);
        optionInputs.push(optionInput); // Collecting option inputs
    }

    const correctOptionInput = document.createElement('input');
    correctOptionInput.type = 'text';
    correctOptionInput.placeholder = 'Correct option';
    questionCard.appendChild(correctOptionInput);

    // Add save button to save the new question
    const saveNewQuestionButton = document.createElement('button');
    saveNewQuestionButton.innerText = 'Save Question';
    saveNewQuestionButton.onclick = () => saveNewQuestion(questionCard, questionInput, imageInput, optionInputs, correctOptionInput);
    questionCard.appendChild(saveNewQuestionButton);

    questionsContainer.appendChild(questionCard);
}

async function saveNewQuestion(questionCard, questionInput, imageInput, optionInputs, correctOptionInput) {
    const urlParams = new URLSearchParams(window.location.search);
    const quizId = urlParams.get('quizId');

    const newQuestionData = {
        quiz_id: quizId,
        question_text: questionInput.value,
        option_1: optionInputs[0].value,
        option_2: optionInputs[1].value,
        option_3: optionInputs[2].value,
        option_4: optionInputs[3].value,
        correct_option: correctOptionInput.value,
        qnsImg: null
    };

    const imgFile = imageInput.files[0];
    if (imgFile) {
        newQuestionData.qnsImg = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                resolve(reader.result.split(',')[1]);
            };
            reader.onerror = reject;
            reader.readAsDataURL(imgFile);
        });
    }

    try {
        const response = await fetchWithAuth(`/quizzes/${quizId}/questions/update`, { // ------------------------------------------------- headers in jwtutility.js
            method: 'POST',
            body: JSON.stringify(newQuestionData)
        });

        const data = await response.json();
        if (response.ok) {
            alert('Question created successfully');
            questionCard.remove();
            newQuestionData.question_id = data.question_id; 
            editQuestions.push(newQuestionData); 
            displayQuestionsForEdit(true); // Refresh the questions list in edit mode
            window.location.reload(); // Refresh the page to reload the data
        } else {
            console.error('Failed to create question:', data.message);
            alert(`Failed to create question: ${data.message}`);
        }
    } catch (error) {
        console.error('Error creating question:', error);
        alert('Error creating question');
    }
}



// --------------------------------------------------------- DELETE QUESTION ---------------------------------------------------------

function deleteQuestion(questionId) {
    const urlParams = new URLSearchParams(window.location.search);
    const quizId = urlParams.get('quizId');

    console.log(`Deleting question with id: ${questionId} from quiz: ${quizId}`);

    fetchWithAuth(`/quizzes/${quizId}/questions/${questionId}`, { // ------------------------------------------------- headers in jwtutility.js
        method: 'DELETE'
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
        } else if (data.confirmDeleteQuiz) { 
            const confirmDelete = confirm(data.message);
            if (confirmDelete) {
                deleteQuizById(quizId);
            }
        } else {
            console.error('Error deleting question:', data.message);
        }
    })
    .catch(error => console.error('Error deleting question:', error));
}

function deleteQuizById(quizId) {
    fetchWithAuth(`/quizzes/${quizId}`, { // ------------------------------------------------- headers in jwtutility.js
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Quiz successfully deleted') {
            alert('Quiz deleted successfully');
            window.location.href = '/quiz.html'; // Redirect to quizzes list
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
    let hasErrors = false; 

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

        const imageInput = document.querySelector(`input[data-question-id="${questionId}"][type="file"]`); 
        const imgFile = imageInput ? imageInput.files[0] : null; 
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
            const response = await fetchWithAuth(`/quizzes/${quizId}/questions/${updatedQuestion.question_id}`, { // ------------------------------------------------- headers in jwtutility.js
                method: 'PUT',
                body: JSON.stringify(updatedQuestion)
            });
            const data = await response.json();
            if (!response.ok) {   
                console.error(`Error updating question ${updatedQuestion.question_id}:`, data.message);
                alert(`Error updating question ${updatedQuestion.question_id}: ${data.message}`);   
                hasErrors = true;   
            } else {
                console.log(`Question ${updatedQuestion.question_id} updated successfully`);
            }
        }
        if (!hasErrors) {   
            alert('Questions updated successfully');   
            window.location.href = `/quiz.html?quizId=${quizId}`;   
        }
    } catch (error) {
        console.error('Error saving changes:', error);
        alert(`Error saving changes: ${error.message}`);
    }
}