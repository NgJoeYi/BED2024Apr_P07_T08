document.addEventListener('DOMContentLoaded', () => {
    const quizButton = document.getElementById('quiz-button'); // Get the quiz button element
    const statisticsButton = document.getElementById('statistics-button'); // Get the statistics button element
    const triviaButton = document.getElementById('trivia-quiz-button'); // Get the trivia button element

    // Set active/inactive classes for navigation buttons
    quizButton.classList.add('active');
    quizButton.classList.remove('inactive');
    statisticsButton.classList.remove('active');
    statisticsButton.classList.add('inactive');
    triviaButton.classList.remove('active');
    triviaButton.classList.add('inactive');

    // Event listeners for navigation buttons
    quizButton.addEventListener('click', () => { // Add click event listener to the quiz button
        window.location.href = 'quiz.html'; // Redirect to quiz.html
    });

    statisticsButton.addEventListener('click', () => { // Add click event listener to the statistics button
        window.location.href = 'statistics.html'; // Redirect to statistics.html
    });

    triviaButton.addEventListener('click', () => { // Add click event listener to the trivia button
        window.location.href = 'triviaQuiz.html'; // Redirect to triviaQuiz.html
    });

    fetchQuizzes(); // Fetch the list of quizzes

    // Show/hide create quiz button based on user role
    const userRole = sessionStorage.getItem('role'); // Get the user role from session storage
    const createQuizBtn = document.getElementById('create-quiz-btn'); // Get the create quiz button element
    if (userRole !== 'lecturer') { // Check if the user is not a lecturer
        createQuizBtn.style.display = 'none'; // Hide the create quiz button if the user is not a lecturer
    }

    // Modal elements
    const quizModal = document.getElementById('quiz-modal'); // Get the quiz modal element
    const questionModal = document.getElementById('question-modal'); // Get the question modal element
    const closeQuizModalBtn = document.querySelector('.close-quiz-modal-btn'); // Get the close quiz modal button
    const closeUpdateModalBtn = document.querySelector('.close-update-modal-btn'); // Get the close update modal button

    // Event listener to show the quiz creation modal
    createQuizBtn.addEventListener('click', () => {
        // Clear session storage items
        sessionStorage.removeItem('quizData'); // Remove quiz data from session storage
        sessionStorage.removeItem('questions'); // Remove questions from session storage
        sessionStorage.removeItem('questionImages'); // Remove question images from session storage
        sessionStorage.removeItem('questionImageNames'); // Remove question image names from session storage

        // Clear the image input
        const qnsImgInput = document.getElementById('qnsImg'); // Get the question image input element
        if (qnsImgInput) { // Check if the image input element exists
            qnsImgInput.value = ''; // Clear the file input
        }

        quizModal.style.display = 'block'; // Show the quiz modal
    });

    // Event listener to close the quiz creation modal
    closeQuizModalBtn.addEventListener('click', () => { // Add click event listener to the close quiz modal button
        quizModal.style.display = 'none'; // Hide the quiz modal
    });

    // Form submission event listeners
    const quizForm = document.getElementById('quiz-form');  // Get the quiz form element
    if (quizForm) { // Check if the quiz form element exists
        quizForm.addEventListener('submit', handleQuizFormSubmit); // Add submit event listener to the quiz form
    }

    // Event listener to close the update quiz modal
    closeUpdateModalBtn.addEventListener('click', () => { // Add click event listener to the close update modal button
        closeUpdateModal(); // Call the function to close the update modal
    });

    // Event listener for the question form submission
    const questionForm = document.getElementById('question-form'); // Get the question form element
    if (questionForm) { // Check if the question form element exists
        questionForm.addEventListener('submit', handleQuestionFormSubmit); // Add submit event listener to the question form
    }

    // Event listener for the next question button
    const nextButton = document.getElementById('next-question');  // Get the next question button element
    if (nextButton) { // Check if the next question button element exists
        nextButton.addEventListener('click', showNextQuestion); // Add click event listener to the next question button
    }

    // Event listener for the submit questions button
    const submitButton = document.getElementById('submit-questions'); // Get the submit questions button element
    if (submitButton) { // Check if the submit questions button element exists
        submitButton.addEventListener('click', (event) => { // Add click event listener to the submit questions button
            event.preventDefault(); // Prevent the default form submission
            handleQuestionFormSubmit(event); // Handle the question form submission
        });
    }

    // Event listener for the previous question button
    const prevButton = document.getElementById('prev-question'); // Get the previous question button element
    if (prevButton) { // Check if the previous question button element exists
        prevButton.addEventListener('click', showPreviousQuestion); // Add click event listener to the previous question button
    }

    // Event listener for the delete quiz button
    const deleteQuizBtn = document.getElementById('delete-quiz-btn'); // Get the delete quiz button element
    if (deleteQuizBtn) { // Check if the delete quiz button element exists
        deleteQuizBtn.addEventListener('click', () => { // Add click event listener to the delete quiz button
            const quizId = document.getElementById('update_quiz_id').value; // Get the quiz ID from the hidden input field
            handleDeleteQuiz(quizId); // Handle the deletion of the quiz
        });
    }
});

let currentQuestionIndex = 0; // Initialize the current question index
let totalQuestions = 0; // Initialize the total number of questions
let questions = []; // Initialize the array to store questions
let questionImages = []; // Initialize the array to store base64 image data
let questionImageNames = []; // Initialize the array to store image file names

function fetchQuizzes() { // Function to fetch quizzes
    fetch('/quizzes') // Fetch request to get quizzes
        .then(response => response.json()) // Parse the response as JSON
        .then(quizzes => { // Handle the quizzes data
            if (quizzes && quizzes.length > 0) { // Check if quizzes are available
                displayQuizzes(quizzes); // Display the quizzes
            } else {
                console.error('No quizzes found'); // Log error if no quizzes found
                document.getElementById('quiz-container').innerText = 'No quizzes available.'; // Display message if no quizzes found
            }
        })
        .catch(error => console.error('Error fetching quizzes:', error)); // Catch and log any errors
}

function displayQuizzes(quizzes) { // Function to display quizzes
    const quizContainer = document.getElementById('quiz-container'); // Get the quiz container element
    quizContainer.innerHTML = ''; // Clear previous quizzes
    const userId = parseInt(sessionStorage.getItem('userId')); // Get current user's ID from session storage

    quizzes.forEach(quiz => { // Iterate through each quiz
        const quizCard = document.createElement('div'); // Create a div for each quiz card
        quizCard.className = 'quiz-card'; // Set class name for quiz card

        const quizImage = document.createElement('img'); // Create an img element for the quiz image
        if (quiz.quizImg && quiz.quizImg.data) { // Check if quiz image data is available
            const base64String = arrayBufferToBase64(quiz.quizImg.data); // Convert image data to base64 string
            quizImage.src = `data:image/jpeg;base64,${base64String}`; // Set the src attribute for the image
        }
        quizCard.appendChild(quizImage); // Append the image to the quiz card

        const quizCardContent = document.createElement('div'); // Create a div for quiz card content
        quizCardContent.className = 'quiz-card-content'; // Set class name for quiz card content

        const quizTitle = document.createElement('h3'); // Create an h3 element for the quiz title
        quizTitle.innerText = quiz.title; // Set the text for the quiz title
        quizCardContent.appendChild(quizTitle); // Append the quiz title to the quiz card content

        const quizDescription = document.createElement('p'); // Create a p element for the quiz description
        quizDescription.innerText = quiz.description; // Set the text for the quiz description
        quizCardContent.appendChild(quizDescription); // Append the quiz description to the quiz card content

        const quizDetails = document.createElement('p'); // Create a p element for quiz details
        quizDetails.className = 'quiz-details'; // Set class name for quiz details
        quizDetails.innerHTML = `
            <strong>Total Questions:</strong> ${quiz.total_questions} | 
            <strong>Total Marks:</strong> ${quiz.total_marks} | 
            <strong>Created By:</strong> ${quiz.creator_name}`; // Set the inner HTML for quiz details
        quizCardContent.appendChild(quizDetails); // Append quiz details to the quiz card content

        const buttonContainer = document.createElement('div'); // Create a div for the button container
        buttonContainer.className = 'button-container'; // Set class name for button container

        const startButton = document.createElement('button'); // Create a button element for starting the quiz
        startButton.innerText = 'Start Quiz'; // Set the text for the start button
        startButton.onclick = () => window.location.href = `/question.html?quizId=${quiz.quiz_id}`; // Redirect to question.html with quiz ID on click
        buttonContainer.appendChild(startButton); // Append the start button to the button container

        if (userId === quiz.created_by) { // Check if the current user created the quiz
            const dropdown = document.createElement('div'); // Create a div for the dropdown
            dropdown.className = 'dropdown'; // Set class name for the dropdown
            const dropdownToggle = document.createElement('span'); // Create a span for the dropdown toggle
            dropdownToggle.className = 'fa fa-ellipsis-v dropdown-toggle'; // Set class name for the dropdown toggle
            dropdownToggle.style.cursor = 'pointer'; // Set cursor style for the dropdown toggle
            dropdown.appendChild(dropdownToggle); // Append the dropdown toggle to the dropdown

            const dropdownMenu = document.createElement('div'); // Create a div for the dropdown menu
            dropdownMenu.className = 'dropdown-menu'; // Set class name for the dropdown menu
            const editDeleteQuizLink = document.createElement('a'); // Create an anchor element for edit/delete quiz
            editDeleteQuizLink.href = '#'; // Set href attribute for the edit/delete link
            editDeleteQuizLink.className = 'edit-delete-quiz'; // Set class name for the edit/delete link
            editDeleteQuizLink.innerText = 'Edit / Delete Quiz'; // Set the text for the edit/delete link
            editDeleteQuizLink.onclick = (event) => {
                event.preventDefault(); // Prevent default link behavior
                openUpdateModal(quiz); // Open the update modal with the quiz data
            };
            dropdownMenu.appendChild(editDeleteQuizLink); // Append the edit/delete link to the dropdown menu

            const editDeleteQuestionLink = document.createElement('a'); // Create an anchor element for edit/delete question
            editDeleteQuestionLink.href = '#'; // Set href attribute for the edit/delete link
            editDeleteQuestionLink.className = 'edit-delete-question'; // Set class name for the edit/delete link
            editDeleteQuestionLink.innerText = 'Edit / Delete Question'; // Set the text for the edit/delete link
            editDeleteQuestionLink.onclick = (event) => {
                event.preventDefault(); // Prevent default link behavior
                window.location.href = `Question.html?quizId=${quiz.quiz_id}&edit-mode=true`; // Navigate to Question.html with quizId and edit-mode
            };
            dropdownMenu.appendChild(editDeleteQuestionLink); // Append the edit/delete link to the dropdown menu

            dropdown.appendChild(dropdownMenu); // Append the dropdown menu to the dropdown
            buttonContainer.appendChild(dropdown); // Append the dropdown to the button container
        }

        quizCardContent.appendChild(buttonContainer); // Append the button container to the quiz card content
        quizCard.appendChild(quizCardContent); // Append the quiz card content to the quiz card
        quizContainer.appendChild(quizCard); // Append the quiz card to the quiz container
    });

    document.addEventListener('click', (event) => { // Add click event listener to the document
        const isDropdownToggle = event.target.matches('.dropdown-toggle'); // Check if the clicked element is a dropdown toggle
        if (!isDropdownToggle && event.target.closest('.dropdown-menu') == null) { // Check if the click is outside the dropdown menu
            document.querySelectorAll('.dropdown-menu').forEach(menu => menu.style.display = 'none'); // Hide all dropdown menus
        }
        if (isDropdownToggle) { // Check if the clicked element is a dropdown toggle
            const dropdownMenu = event.target.nextElementSibling; // Get the next sibling element (dropdown menu)
            dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block'; // Toggle dropdown menu visibility
        }
    });
}

function arrayBufferToBase64(buffer) { // Function to convert array buffer to base64 string
    let binary = ''; // Initialize a binary string
    const bytes = new Uint8Array(buffer); // Create a Uint8Array from the buffer
    const len = bytes.byteLength; // Get the length of the byte array
    for (let i = 0; i < len; i++) { // Iterate through each byte
        binary += String.fromCharCode(bytes[i]); // Append the character to the binary string
    }
    return window.btoa(binary); // Return the base64 encoded string
}

function handleQuizFormSubmit(event) { // Function to handle quiz form submission
    event.preventDefault(); // Prevent the default form submission
    const formData = new FormData(event.target); // Create a FormData object from the form
    const quizData = Object.fromEntries(formData.entries()); // Convert form data to an object

    const imgFile = document.getElementById('quizImg').files[0]; // Get the quiz image file
    if (imgFile) { // Check if the image file exists
        const reader = new FileReader(); // Create a FileReader object
        reader.onloadend = () => { // Add loadend event listener to the FileReader
            quizData.quizImg = reader.result.split(',')[1]; // Set the quiz image data in base64 format
            console.log('Quiz Data with Image:', quizData); // Log the quiz data with image
            storeQuizData(quizData); // Store the quiz data
        };
        reader.readAsDataURL(imgFile);  // Read the image file as a data URL
    } else {
        quizData.quizImg = null;  // Set quiz image to null if no image file
        console.log('Quiz Data without Image:', quizData);  // Log the quiz data without image
        storeQuizData(quizData); // Store the quiz data
    }
}

function storeQuizData(quizData) { // Function to store quiz data
    sessionStorage.setItem('quizData', JSON.stringify(quizData)); // Save quiz data to session storage
    document.getElementById('quiz-modal').style.display = 'none'; // Hide the quiz modal
    document.getElementById('question-modal').style.display = 'block'; // Show the question modal
    currentQuestionIndex = 0; // Reset current question index
    totalQuestions = parseInt(quizData.total_questions); // Set total questions
    questions = JSON.parse(sessionStorage.getItem('questions')) || new Array(totalQuestions).fill({}); // Get or initialize questions array
    questionImages = JSON.parse(sessionStorage.getItem('questionImages')) || new Array(totalQuestions).fill(null); // Get or initialize question images array
    questionImageNames = JSON.parse(sessionStorage.getItem('questionImageNames')) || new Array(totalQuestions).fill(null); // Get or initialize question image names array
    createQuestionForm(); // Create the question form
}

async function handleQuestionFormSubmit(event) { // Function to handle question form submission
    event.preventDefault(); // Prevent the default form submission
    saveCurrentQuestionData(); // Save current question data
    const questionData = questions[currentQuestionIndex]; // Get current question data
    if (questionImages[currentQuestionIndex]) { // Check if question image exists
        questionData.qnsImg = questionImages[currentQuestionIndex]; // Set question image data
    }
    questions[currentQuestionIndex] = questionData; // Save question data in questions array

    if (currentQuestionIndex < totalQuestions - 1) { // Check if there are more questions
        currentQuestionIndex++; // Increment current question index
        createQuestionForm(); // Create the question form
    } else {
        await submitQuizAndQuestions(); // Submit quiz and questions
    }
}

function saveCurrentQuestionData() { // Function to save current question data
    const questionData = {
        question_text: document.getElementById('question_text').value, // Get question text
        option_1: document.getElementById('option_1').value, // Get option 1 text
        option_2: document.getElementById('option_2').value, // Get option 2 text
        option_3: document.getElementById('option_3').value, // Get option 3 text
        option_4: document.getElementById('option_4').value, // Get option 4 text
        correct_option: document.getElementById('correct_option').value, // Get correct option
        qnsImg: questionImages[currentQuestionIndex] // Store the image data in base64 format
    };
    questions[currentQuestionIndex] = questionData; // Save question data in questions array
    sessionStorage.setItem('questions', JSON.stringify(questions)); // Save questions to session storage
    sessionStorage.setItem('questionImages', JSON.stringify(questionImages)); // Save the images in session storage
    sessionStorage.setItem('questionImageNames', JSON.stringify(questionImageNames)); // Save image names in session storage
    console.log('Current Question Data Saved:', questionData); // Log the current question data
}

async function submitQuizAndQuestions() { // Function to submit quiz and questions
    const quizData = JSON.parse(sessionStorage.getItem('quizData')); // Get quiz data from session storage
    quizData.questions = JSON.parse(sessionStorage.getItem('questions')); // Get questions from session storage

    try {
        const response = await fetchWithAuth('/quizzes', { // Fetch request to create quiz
            method: 'POST', // Set request method to POST
            body: JSON.stringify(quizData), // Set request body
        });
        const body = await response.json(); // Parse the response as JSON
        if (!response.ok) { // Check if response is not ok
            throw body; // Throw an error with the response message
        }
        alert(body.message);  // Display the message from the server
        sessionStorage.removeItem('quizData'); // Remove quiz data from session storage
        sessionStorage.removeItem('questions'); // Remove questions from session storage
        sessionStorage.removeItem('questionImages'); // Remove question images from session storage
        sessionStorage.removeItem('questionImageNames'); // Remove question image names from session storage
        document.getElementById('question-modal').style.display = 'none'; // Hide the question modal
        resetQuizForm(); // Reset the quiz form
        fetchQuizzes(); // Fetch the quizzes
    } catch (error) { // Catch any errors
        console.error('Error creating quiz and questions:', error);
        displayValidationErrors(error); // Display the validation errors
        document.getElementById('question-modal').style.display = 'block'; // Keep the question modal open for editing
    }
}

function resetQuizForm() { // Function to reset the quiz form
    const quizForm = document.getElementById('quiz-form'); // Get the quiz form element
    quizForm.reset(); // Reset the quiz form
}

function createQuestionForm() { // Function to create the question form
    const questionsContainer = document.getElementById('questions-container'); // Get the questions container element
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

    const questionNumberElement = document.getElementById('question-number'); // Get the question number element
    questionNumberElement.innerText = `Question ${currentQuestionIndex + 1}/${totalQuestions}`; // Set the question number text
    document.getElementById('next-question').style.display = currentQuestionIndex < totalQuestions - 1 ? 'inline-block' : 'none'; // Show/hide the next question button
    document.getElementById('prev-question').style.display = 'inline-block'; // Show the previous question button
    document.getElementById('submit-questions').style.display = currentQuestionIndex === totalQuestions - 1 ? 'inline-block' : 'none'; // Show/hide the submit questions button

    const qnsImgInput = document.getElementById('qnsImg');  // Get the question image input element
    qnsImgInput.addEventListener('change', () => { // Add change event listener to the image input
        const file = qnsImgInput.files[0]; // Get the selected file
        const reader = new FileReader(); // Create a FileReader object
        reader.onloadend = () => { // Add loadend event listener to the FileReader
            questionImages[currentQuestionIndex] = reader.result.split(',')[1]; // Save image data in base64
            questionImageNames[currentQuestionIndex] = file.name; // Save the filename
        };
        if (file) { // Check if a file is selected
            reader.readAsDataURL(file); // Read the file as a data URL
        } else {
            questionImages[currentQuestionIndex] = null; // Set question image to null if no file selected
            questionImageNames[currentQuestionIndex] = null; // Set question image name to null if no file selected
        }
    });

    if (questionImageNames[currentQuestionIndex]) { // Check if there is a saved image name
        const dataTransfer = new DataTransfer(); // Create a DataTransfer object
        const file = new File([""], questionImageNames[currentQuestionIndex]); // Create a new File object with the saved name
        dataTransfer.items.add(file); // Add the file to the DataTransfer object
        qnsImgInput.files = dataTransfer.files; // Set the files property of the image input
    }
}

function showNextQuestion() { // Function to show the next question
    saveCurrentQuestionData(); // Save the current question data
    if (currentQuestionIndex < totalQuestions - 1) { // Check if there are more questions
        currentQuestionIndex++; // Increment current question index
        createQuestionForm(); // Create the question form
    }
}

function showPreviousQuestion() { // Function to show the previous question
    saveCurrentQuestionData(); // Save the current question data
    if (currentQuestionIndex > 0) { // Check if the current question index is greater than 0
        currentQuestionIndex--; // Decrement the current question index
        createQuestionForm(); // Create the question form for the previous question
    } else { // If the current question index is 0
        document.getElementById('question-modal').style.display = 'none'; // Hide the question modal
        document.getElementById('quiz-modal').style.display = 'block'; // Show the quiz modal
    }
}

function openUpdateModal(quiz) { // Function to open the update quiz modal
    const updateQuizForm = document.getElementById('update-quiz-form');  // Get the update quiz form element
    updateQuizForm.reset(); // Reset the update quiz form
    document.getElementById('update_quiz_id').value = quiz.quiz_id; // Set the quiz ID in the hidden input field
    document.getElementById('update_title').value = quiz.title; // Set the title of the quiz
    document.getElementById('update_description').value = quiz.description; // Set the description of the quiz
    document.getElementById('update_total_questions').value = quiz.total_questions; // Set the total number of questions
    document.getElementById('update_total_marks').value = quiz.total_marks; // Set the total marks

    const currentImage = quiz.quizImg ? `data:image/jpeg;base64,${arrayBufferToBase64(quiz.quizImg.data)}` : ''; // Convert quiz image data to base64
    document.getElementById('update_quiz_img_preview').src = currentImage; // Set the source of the quiz image preview
    document.getElementById('update_quiz_img_preview').style.display = currentImage ? 'block' : 'none';  // Show or hide the quiz image preview

    document.getElementById('update-modal').style.display = 'block'; // Show the update modal
}

function closeUpdateModal() { // Function to close the update quiz modal
    document.getElementById('update-modal').style.display = 'none'; // Hide the update modal
}

document.getElementById('update-quiz-form').addEventListener('submit', handleUpdateQuizFormSubmit); // Add submit event listener to the update quiz form

async function handleUpdateQuizFormSubmit(event) { // Async function to handle the update quiz form submission
    event.preventDefault(); // Prevent the default form submission
    const formData = new FormData(event.target); // Create a FormData object from the form
    const quizData = Object.fromEntries(formData.entries()); // Convert form data to an object
    const imgFile = document.getElementById('update_quizImg').files[0]; // Get the quiz image file

    if (imgFile) { // Check if an image file is selected
        const reader = new FileReader(); // Create a FileReader object
        reader.onloadend = async () => { // Add loadend event listener to the FileReader
            quizData.quizImg = reader.result.split(',')[1]; // Set the quiz image data in base64 format
            await updateQuizRequest(quizData); // Send the update quiz request
        };
        reader.readAsDataURL(imgFile); // Read the image file as a data URL
    } else {
        quizData.quizImg = document.getElementById('current_quiz_img').value; // Use the current quiz image value
        await updateQuizRequest(quizData); // Send the update quiz request
    }
}

async function updateQuizRequest(data) { // Async function to send the update quiz request
    try {
        const response = await fetchWithAuth(`/quizzes/${data.quiz_id}`, { // Fetch request to update the quiz
            method: 'PUT', // Set the request method to PUT
            body: JSON.stringify(data), // Set the request body
        });
        const body = await response.json(); // Parse the response as JSON
        if (!response.ok) { // Check if the response is not ok
            throw body; // Throw an error with the response message
        }
        alert(body.message); // Display the message from the server
        closeUpdateModal(); // Close the update modal
        fetchQuizzes(); // Fetch the updated list of quizzes
        location.reload(); // Reload the page
    } catch (error) {
        console.error('Error updating quiz:', error);
        displayValidationErrors(error); // Display the validation errors
    }
}

async function handleDeleteQuiz(quizId) { // Async function to handle the delete quiz request
    try {
        const response = await fetchWithAuth(`/quizzes/${quizId}`, { // Fetch request to delete the quiz
            method: 'DELETE' // Set the request method to DELETE
        });

        // Check if the response body is empty before parsing it as JSON
        let body;
        try {
            body = await response.json(); // Parse the response as JSON
        } catch (err) {
            body = null; // Set body to null if parsing fails
        }

        if (!response.ok) { // Check if the response is not ok
            throw new Error(body ? body.message : 'Failed to delete quiz'); // Throw an error if failed to delete quiz
        }

        alert(body ? body.message : 'Quiz deleted successfully'); // Display the message from the server
        fetchQuizzes(); // Fetch the updated list of quizzes
        location.reload(); // Reload the page
    } catch (error) {
        console.error('Error deleting quiz:', error);
        alert(`Error deleting quiz: ${error.message}`); // Alert the user of the error
    }
}

function displayValidationErrors(error) {
    if (error.errors) {
      alert('Validation failed:\n' + error.errors.join('\n'));
    } else {
      alert(`Error creating quiz and questions: ${error.message}`);
    }
  }