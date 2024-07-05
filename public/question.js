document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const quizId = urlParams.get('quizId');
    fetchQuizWithQuestions(quizId);
});

let currentQuestionIndex = 0;
let questions = [];

function fetchQuizWithQuestions(quizId) {
    fetch(`/quizzes/${quizId}/questions`)
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

        const optionLabel = document.createElement('label');
        optionLabel.htmlFor = optionId;
        optionLabel.appendChild(document.createTextNode(option));

        questionCard.appendChild(optionInput);
        questionCard.appendChild(optionLabel);
    });

    questionsContainer.appendChild(questionCard);

    document.getElementById('prev-button').style.visibility = index === 0 ? 'hidden' : 'visible';
    document.getElementById('next-button').style.display = index === questions.length - 1 ? 'none' : 'inline-block';
    document.getElementById('submit-quiz').style.display = index === questions.length - 1 ? 'inline-block' : 'none';
}

function nextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        displayQuestion(currentQuestionIndex);
    }
}

function prevQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion(currentQuestionIndex);
    }
}

function submitQuiz() {
    alert('Quiz submitted!'); // Placeholder action
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
