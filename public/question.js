document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const quizId = urlParams.get('quizId');
    fetchQuizWithQuestions(quizId);
});

let currentQuestionIndex = 0;
let questions = [];
let userResponses = {};

function getToken() {
    return sessionStorage.getItem('token');
  }

function fetchQuizWithQuestions(quizId) {
    const token = getToken()
    fetch(`/quizzes/${quizId}/questions`, {
        headers: 
        {
            'Authorization': `Bearer ${token}`
        }
    })
        .then(response => response.json())
        .then(quiz => {
            if (quiz) {
                questions = quiz.questions;
                displayQuestion(currentQuestionIndex);
            } else {
                console.error('Quiz or questions not found');
                document.getElementById('questions-container').innerText = 'Quiz or questions not available.';
            }
        })
        .catch(error => console.error('Error fetching quiz with questions:', error));
}

function displayQuestion(index) {
    const questionsContainer = document.getElementById('questions-container');
    questionsContainer.innerHTML = '';

    const question = questions[index];
    const questionCard = document.createElement('div');
    questionCard.className = 'question-card';

    const questionTitle = document.createElement('h3');
    questionTitle.innerText = `Q${index + 1}: ${question.question_text}`;
    questionCard.appendChild(questionTitle);

    if (question.qnsImg && question.qnsImg.data) {
        const base64String = arrayBufferToBase64(question.qnsImg.data);
        const questionImage = document.createElement('img');
        questionImage.src = `data:image/jpeg;base64,${base64String}`;
        questionCard.appendChild(questionImage);
    }

    const options = [question.option_1, question.option_2, question.option_3, question.option_4];
    options.forEach((option, i) => {
        const optionId = `question_${question.question_id}_option_${i}`;
        const optionInput = document.createElement('input');
        optionInput.type = 'radio';
        optionInput.id = optionId;
        optionInput.name = `question_${question.question_id}`;
        optionInput.value = option;

        if (userResponses[question.question_id] === option) {
            optionInput.checked = true;
        }

        const optionLabel = document.createElement('label');
        optionLabel.htmlFor = optionId;
        optionLabel.appendChild(document.createTextNode(option));

        questionCard.appendChild(optionInput);
        questionCard.appendChild(optionLabel);
        questionCard.appendChild(document.createElement('br'));
    });

    questionsContainer.appendChild(questionCard);

    document.getElementById('prev-button').style.visibility = index === 0 ? 'hidden' : 'visible';
    document.getElementById('next-button').style.display = index === questions.length - 1 ? 'none' : 'inline-block';
    document.getElementById('submit-quiz').style.display = index === questions.length - 1 ? 'inline-block' : 'none';
}

function nextQuestion() {
    saveCurrentResponse();
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        displayQuestion(currentQuestionIndex);
    }
}

function prevQuestion() {
    saveCurrentResponse();
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion(currentQuestionIndex);
    }
}

function saveCurrentResponse() {
    const currentQuestion = questions[currentQuestionIndex];
    const selectedOption = document.querySelector(`input[name="question_${currentQuestion.question_id}"]:checked`);
    userResponses[currentQuestion.question_id] = selectedOption ? selectedOption.value : null;
}

function submitQuiz() {
    saveCurrentResponse();
    const urlParams = new URLSearchParams(window.location.search);
    const quizId = urlParams.get('quizId');

    const userResponsesArray = questions.map((question) => ({
        question_id: question.question_id,
        selected_option: userResponses[question.question_id] || null
    }));

    fetch(`/submitQuiz`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
        body: JSON.stringify({
            quizId,
            responses: userResponsesArray
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.attemptId) {
            window.location.href = `/result.html?attemptId=${data.attemptId}`;
        } else {
            console.error('Error submitting quiz:', data.message);
        }
    })
    .catch(error => console.error('Error submitting quiz:', error));
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
