const Quiz = require('../models/quiz');

// Function to convert base64 image data to buffer
function base64ToBuffer(base64) {
    return Buffer.from(base64, 'base64');
}

const createQuiz = async (req, res) => {
    const newQuizData = req.body;
    try {
        // Convert img_url to buffer if it's a base64 string
        if (newQuizData.quizImg) {
            newQuizData.quizImg = base64ToBuffer(newQuizData.quizImg);
        }
        const quiz = await Quiz.createQuiz(newQuizData);
        if (!quiz) {
            return res.status(400).json({ message: 'Failed to create a new quiz' });
        }
        res.status(201).json(quiz);
    } catch (error) {
        console.error('Create Quiz - Server Error:', error); // Log error details
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

const getQuizById = async (req, res) => {
    const quizId = parseInt(req.params.id);
    try {
        const quiz = await Quiz.getQuizById(quizId);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz does not exist' });
        }
        res.status(200).json(quiz);
    } catch (error) {
        console.error('Get Single Quiz - Server Error:', error); // Log error details
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

// const getAllQuiz = async (req, res) => {
//     try {
//         const quiz = await Quiz.getAllQuiz();
//         if (!quiz) {
//             return res.status(404).json({ message: 'Quiz does not exist' });
//         }
//         res.status(200).json(quiz);
//     } catch (error) {
//         console.error('Get All Quiz - Server Error:', error); // Log error details
//         res.status(500).json({ message: 'Server error. Please try again later.' });
//     }
// };

const getAllQuizWithCreatorName = async (req, res) => {
    try {
        const quiz = await Quiz.getAllQuizWithCreatorName();
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz does not exist' });
        }
        res.status(200).json(quiz);
    } catch (error) {
        console.error('Get All Quiz - Server Error:', error); // Log error details
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

const updateQuiz = async (req, res) => {
    const quizId = parseInt(req.params.id);
    const newQuizData = req.body;
    try {
        const checkQuiz = await Quiz.getQuizById(quizId);
        if (!checkQuiz) {
            return res.status(404).json({ message: 'Quiz does not exist' });
        }
        // Convert img_url to buffer if it's a base64 string
        if (newQuizData.quizImg) {
            newQuizData.quizImg = base64ToBuffer(newQuizData.quizImg);
        }
        const quiz = await Quiz.updateQuiz(quizId, newQuizData);
        res.status(200).json(quiz);
    } catch (error) {
        console.error('Update Quiz - Server Error:', error); // Log error details
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

const deleteQuiz = async (req, res) => {
    const quizId = parseInt(req.params.id);
    try {
        const checkQuiz = await Quiz.getQuizById(quizId);
        if (!checkQuiz) {
            return res.status(404).json({ message: 'Quiz does not exist' });
        }
        const quiz = await Quiz.deleteQuiz(quizId);
        if (quiz) {
            res.status(200).json({ message: 'Quiz successfully deleted' });
        } else {
            res.status(400).json({ message: 'Failed to delete quiz' });
        }
    } catch (error) {
        console.error('Delete Quiz - Server Error:', error); // Log error details
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

const getQuizWithQuestions = async (req, res) => {
    const quizId = parseInt(req.params.id);
    try {
        const quiz = await Quiz.getQuizWithQuestions(quizId);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz does not exist' });
        }
        res.status(200).json(quiz);
    } catch (error) {
        console.error('Get Quiz With Questions - Server Error:', error); // Log error details
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

const getUserQuizResult = async (req, res) => {
    const userId = req.user.id;
    const attemptId = parseInt(req.params.attemptId);
    try {
        const result = await Quiz.getUserQuizResult(userId, attemptId);
        if (!result) {
            return res.status(400).json({ message: 'Failed to retrieve user\'s quiz result' });
        }
        res.status(200).json(result);
    } catch (error) {
        console.error('Get User\'s Quiz results - Server Error:', error); // Log error details
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

const getAttemptCount = async (req, res) => {
    const userId = req.user.id;
    try {
        const count = await Quiz.getAttemptCount(userId);
        res.status(200).json({ attemptCount: count });
    } catch (error) {
        console.error('Get Attempt Count - Server Error:', error); // Log error details
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

const submitQuiz = async (req, res) => {
    const { quizId, responses } = req.body;
    const userId = req.user.id;
    let totalScore = 0;
    let totalQuestions = responses.length;

    try {
        const attemptId = await Quiz.createQuizAttempt(userId, quizId, totalQuestions, totalQuestions, totalScore, false);

        for (const response of responses) {
            const { question_id, selected_option } = response;
            await Quiz.saveUserResponse(attemptId, question_id, selected_option);
            const isCorrect = await Quiz.isCorrectAnswer(question_id, selected_option);
            if (isCorrect) {
                totalScore++;
            }
        }

        const totalMarks = totalQuestions;
        const passingScore = totalMarks * 0.5;
        const passed = totalScore >= passingScore;

        // Update the attempt with the final score and pass status
        await Quiz.updateQuizAttempt(attemptId, totalQuestions, totalMarks, totalScore, passed);

        res.status(200).json({ attemptId });
    } catch (error) {
        console.error('Error submitting quiz:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};





module.exports = {
    createQuiz,
    getQuizById,
    getAllQuizWithCreatorName,
    updateQuiz,
    deleteQuiz,
    getQuizWithQuestions,
    getUserQuizResult,
    getAttemptCount,
    submitQuiz
}