function initializeEditQuestion() {
    const urlParams = new URLSearchParams(window.location.search); // Parse URL parameters
    const quizId = urlParams.get('quizId');  // Get quiz ID from URL
    const isEditMode = urlParams.get('edit-mode') === 'true'; // Check if edit mode is enabled

    console.log(`quizId: ${quizId}, isEditMode: ${isEditMode}`);

    // Ensure the correct CSS file is loaded based on the mode
    const stylesheetLink = document.getElementById('mode-stylesheet');
    if (stylesheetLink) { // Check if the stylesheet link element exists
        if (isEditMode) {
            console.log('using edit css');
            stylesheetLink.href = '/CSS/editQuestion.css'; // Load edit mode stylesheet
        } else {
            stylesheetLink.href = '/CSS/question.css';  // Load regular mode stylesheet
        }
    }

    if (isEditMode) {
        fetchQuizWithQuestionsForEdit(quizId, isEditMode);  // Fetch quiz questions for edit mode
    }
}

let editQuestions = []; // Array to store questions for editing

// Function to fetch quiz questions for editing
function fetchQuizWithQuestionsForEdit(quizId, isEditMode) {
    fetchWithAuth(`/quizzes/${quizId}/questions`) // ------------------------------------------------- headers in jwtutility.js
    .then(response => response.json())
    .then(quiz => {
        if (quiz && quiz.questions) {
            editQuestions = quiz.questions; // Store quiz questions
            displayQuestionsForEdit(isEditMode); // Display questions for editing
        } else {
            console.error('Quiz or questions not found');
            document.getElementById('questions-container').innerText = 'Quiz or questions not available.';
        }
    })
    .catch(error => console.error('Error fetching quiz with questions:', error));
}

// Function to display questions for editing
function displayQuestionsForEdit(isEditMode) {
    const questionsContainer = document.getElementById('questions-container'); // Get the questions container
    questionsContainer.innerHTML = ''; // Clear previous questions

    editQuestions.forEach((question, index) => { // Iterate over questions
        const questionCard = document.createElement('div');
        questionCard.className = 'question-card'; // Create question card

        const questionTitle = document.createElement('h3');
        questionTitle.innerText = `Q${index + 1}:`; // Set question title
        questionCard.appendChild(questionTitle); // Add title to card

        const questionInput = document.createElement('textarea');
        questionInput.value = question.question_text;  // Set question text
        questionInput.dataset.questionId = question.question_id; // Use correct ID field
        questionCard.appendChild(questionInput); // Add text input to card

        if (question.qnsImg && question.qnsImg.data) { // Check if question has an image
            const base64String = arrayBufferToBase64(question.qnsImg.data);  // Convert image to base64
            const questionImage = document.createElement('img');
            questionImage.src = `data:image/jpeg;base64,${base64String}`; // Set image source
            questionCard.appendChild(questionImage);  // Add image to card

            const imageInput = document.createElement('input');
            imageInput.type = 'file'; // Create file input for image
            imageInput.dataset.questionId = question.question_id; // Use correct ID field
            questionCard.appendChild(imageInput); // Add file input to card
        }

        const options = [question.option_1, question.option_2, question.option_3, question.option_4]; // Get options
        options.forEach((option, i) => {  // Iterate over options
            const optionInput = document.createElement('input');
            optionInput.type = 'text';
            optionInput.value = option;  // Set option value
            optionInput.dataset.questionId = question.question_id; // Use correct ID field
            optionInput.dataset.optionIndex = i; // Set option index
            questionCard.appendChild(optionInput); // Add option input to card
        });

        const correctOptionInput = document.createElement('input');
        correctOptionInput.type = 'text';
        correctOptionInput.value = question.correct_option; // Set correct option value
        correctOptionInput.dataset.questionId = question.question_id; // Use correct ID field
        correctOptionInput.dataset.correctOption = true; // Mark as correct option
        questionCard.appendChild(correctOptionInput); // Add correct option input to card

        // Add Delete button in edit mode
        const deleteButton = document.createElement('button');
        deleteButton.innerText = 'Delete';
        deleteButton.onclick = () => deleteQuestion(question.question_id); // Set delete action
        questionCard.appendChild(deleteButton); // Add delete button to card

        questionsContainer.appendChild(questionCard); // Add question card to container
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
    saveButton.onclick = saveChanges; // Set save action
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
    const questionsContainer = document.getElementById('questions-container'); // Get questions container
    const questionCard = document.createElement('div');
    questionCard.className = 'question-card'; // Create question card
    questionCard.style.position = 'relative'; // Ensure the card is positioned relative for the button to work

    // Add close button to remove question card
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
    questionTitle.innerText = `New Question:`; // Set new question title
    questionCard.appendChild(questionTitle);

    const questionInput = document.createElement('textarea');
    questionInput.placeholder = 'Enter question text here'; // Set placeholder for question text
    questionCard.appendChild(questionInput); // Add question input to card

    const imageInput = document.createElement('input');
    imageInput.type = 'file'; // Create file input for image
    questionCard.appendChild(imageInput);  // Add file input to card

    const optionInputs = [];
    for (let i = 0; i < 4; i++) { // Create inputs for options
        const optionInput = document.createElement('input');
        optionInput.type = 'text';
        optionInput.placeholder = `Option ${i + 1}`; // Set placeholder for option
        questionCard.appendChild(optionInput); // Add option input to card
        optionInputs.push(optionInput); // Collecting option inputs
    }

    const correctOptionInput = document.createElement('input');
    correctOptionInput.type = 'text';
    correctOptionInput.placeholder = 'Correct option'; // Set placeholder for correct option
    questionCard.appendChild(correctOptionInput); // Add correct option input to card

    // Add save button to save the new question
    const saveNewQuestionButton = document.createElement('button');
    saveNewQuestionButton.innerText = 'Save Question';
    saveNewQuestionButton.onclick = () => saveNewQuestion(questionCard, questionInput, imageInput, optionInputs, correctOptionInput);
    questionCard.appendChild(saveNewQuestionButton); // Add save button to card

    questionsContainer.appendChild(questionCard);  // Add question card to container
}

// Function to save a new question
async function saveNewQuestion(questionCard, questionInput, imageInput, optionInputs, correctOptionInput) {
    const urlParams = new URLSearchParams(window.location.search);
    const quizId = urlParams.get('quizId'); // Get quiz ID from URL

    // Collect new question data from form inputs
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
    if (imgFile) {  // If an image is uploaded, convert it to base64
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
            questionCard.remove(); // Remove the question card after saving
            newQuestionData.question_id = data.question_id;  // Add the new question ID to the data
            editQuestions.push(newQuestionData); // Add new question to the questions array
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
// Function to delete a question
function deleteQuestion(questionId) {
    const urlParams = new URLSearchParams(window.location.search);
    const quizId = urlParams.get('quizId'); // Get quiz ID from URL

    console.log(`Deleting question with id: ${questionId} from quiz: ${quizId}`);

    fetchWithAuth(`/quizzes/${quizId}/questions/${questionId}`, { // ------------------------------------------------- headers in jwtutility.js
        method: 'DELETE'
    })
    .then(response => {
        if (response.status === 204) { // -------- changes made here
            alert('Question deleted successfully');
            // Remove the question from the UI
            const questionCard = document.querySelector(`textarea[data-question-id="${questionId}"]`).parentElement;
            questionCard.remove();
        } else if (response.status === 200) {
            return response.json(); // Get the response as JSON for additional cases
        } else {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
    })
    .then(data => {
        if (data && data.confirmDeleteQuiz) { 
            const confirmDelete = confirm(data.message);
            if (confirmDelete) {
                deleteQuizById(quizId); // Call function to delete the quiz
            }
        } else if (data) {
            console.error('Error deleting question:', data.message);
        }
    })
    .catch(error => console.error('Error deleting question:', error));
}

// Function to delete a quiz
function deleteQuizById(quizId) {
    fetchWithAuth(`/quizzes/${quizId}`, { // ------------------------------------------------- headers in jwtutility.js
        method: 'DELETE'
    })
    .then(response => {
        if (response.status === 204) { // -------- changes made here
            return { message: 'Quiz successfully deleted' }; // Return a consistent message object
        } else {
            return response.json(); // Get the response as JSON for additional cases
        }
    })
    .then(data => {
        if (data.message === 'Quiz successfully deleted') { // -------- changes made here
            alert('Quiz deleted successfully');
            window.location.href = '/quiz.html'; // Redirect to quizzes list
        } else {
            console.error('Error deleting quiz:', data.message);
        }
    })
    .catch(error => console.error('Error deleting quiz:', error));
}

// Function to save changes to questions
async function saveChanges() {
    const updatedQuestions = [];
    const urlParams = new URLSearchParams(window.location.search);
    const quizId = urlParams.get('quizId'); // Get quiz ID from URL
    let hasErrors = false; // Flag to check for errors

    for (const question of editQuestions) {  // Iterate over questions
        const questionId = question.question_id; // Use correct ID field
        const questionTextElement = document.querySelector(`textarea[data-question-id="${questionId}"]`);
        if (!questionTextElement) { // Skip if question text element is not found
            continue;
        }
        const questionText = questionTextElement.value; // Get updated question text
        const options = []; // Array to store updated options
        for (let i = 0; i < 4; i++) { // Iterate over options
            options.push(document.querySelector(`input[data-question-id="${questionId}"][data-option-index="${i}"]`).value); // Get updated option value
        }
        const correctOption = document.querySelector(`input[data-question-id="${questionId}"][data-correct-option="true"]`).value; // Get updated correct option value

        const imageInput = document.querySelector(`input[data-question-id="${questionId}"][type="file"]`);  // Get image input element
        const imgFile = imageInput ? imageInput.files[0] : null;  // Get selected image file, if any
        let qnsImg = null; // Variable to store base64 image data

        if (imgFile) { // If an image is uploaded, convert it to base64
            qnsImg = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    resolve(reader.result.split(',')[1]); // Get base64 data
                };
                reader.onerror = reject; // Handle error
                reader.readAsDataURL(imgFile); // Read image file as data URL
            });
        } else { // If no new image is uploaded, use existing image data
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
        for (const updatedQuestion of updatedQuestions) { // Send updated question data to the server
            const response = await fetchWithAuth(`/quizzes/${quizId}/questions/${updatedQuestion.question_id}`, { // ------------------------------------------------- headers in jwtutility.js
                method: 'PUT',
                body: JSON.stringify(updatedQuestion) // Convert question data to JSON
            });
            const data = await response.json(); // Parse server response
            if (!response.ok) {   // If response is not OK, log and alert the error
                console.error(`Error updating question ${updatedQuestion.question_id}:`, data.message);
                alert(`Error updating question ${updatedQuestion.question_id}: ${data.message}`);   
                hasErrors = true;   
            } else { // If response is OK, log success message
                console.log(`Question ${updatedQuestion.question_id} updated successfully`);
            }
        }
        if (!hasErrors) {    // If no errors occurred, alert success and redirect to quiz page
            alert('Questions updated successfully');   
            window.location.href = `/quiz.html?quizId=${quizId}`; // Redirect to quiz page   
        }
    } catch (error) { // Handle any errors that occur during the process
        console.error('Error saving changes:', error);
        alert(`Error saving changes: ${error.message}`);
    }
}