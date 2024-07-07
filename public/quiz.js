document.addEventListener('DOMContentLoaded', () => {
    checkSessionToken();
    fetchQuizzes();
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
        console.log('Quiz data:', quiz); // Log quiz data to check if quizImg is present // CHANGED

        const quizCard = document.createElement('div');
        quizCard.className = 'quiz-card';

        const quizImage = document.createElement('img');
        // Convert binary data to base64 string and set it as the image source
        if (quiz.quizImg && quiz.quizImg.data) { // CHANGED
            const base64String = arrayBufferToBase64(quiz.quizImg.data); // CHANGED
            quizImage.src = `data:image/jpeg;base64,${base64String}`; // CHANGED
            console.log('Base64 Image String:', base64String); // Log the base64 image string // CHANGED
        } else {
            console.log('Using default placeholder image'); // CHANGED
            quizImage.src = 'default_placeholder_image.jpg'; // Path to default placeholder image // CHANGED
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
        startButton.onclick = () => window.location.href = `/question.html?quizId=${quiz.quiz_id}`; // CHANGED
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
