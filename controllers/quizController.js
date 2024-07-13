const Quiz = require('../models/quiz');

// Function to convert base64 image data to buffer
function base64ToBuffer(base64String) {
    if (!base64String) {
        return null;
    }
    return Buffer.from(base64String, 'base64');
}

const createQuiz = async (req, res) => {
    const newQuizData = req.body;
    const userId = req.user.id;
    try {

        // ----------------------------- DONE USING JOI INSTEAD -----------------------------
        /* VALIDATED TO MAKE SURE:
        1. all required fields are filled 
        */

        newQuizData.created_by = userId;

        // Convert img_url to buffer if it's a base64 string
        if (newQuizData.quizImg) {
            newQuizData.quizImg = base64ToBuffer(newQuizData.quizImg);
        }
        const quiz = await Quiz.createQuiz(newQuizData);
        if (!quiz) {
            return res.status(400).json({ message: 'Failed to create a new quiz' });
        }
        res.status(201).json({ message: 'Quiz created successfully', quiz });
    } catch (error) {
        console.error('Create Quiz - Server Error:', error); // Log error details
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

// users can add new questions in the edit mode too so i must make sure the total question is correct
const createQuestion = async (req, res) => {
    const newQuestionData = req.body;
    try {
        const checkQuiz = await Quiz.getQuizById(newQuestionData.quiz_id);
        if (!checkQuiz) {
            return res.status(404).json({ message: 'Quiz does not exist' });
        }

        if (newQuestionData.qnsImg) {
            newQuestionData.qnsImg = base64ToBuffer(newQuestionData.qnsImg);
        }
        
        const question = await Quiz.createQuestion(newQuestionData);
        if (!question) {
            return res.status(400).json({ message: "Failed to create question" });
        }

        // ------------------------ update the total question here --------------------
        const updatedQuizData = {
            title: checkQuiz.title,
            description: checkQuiz.description,
            total_questions: checkQuiz.total_questions + 1,
            total_marks: checkQuiz.total_marks,
            created_by: checkQuiz.created_by,
            quizImg: checkQuiz.quizImg
        };
        const updateTotalQuestion = await Quiz.updateQuiz(newQuestionData.quiz_id, updatedQuizData);
        if (!updateTotalQuestion) {
            return res.status(400).json({ message: 'Could not update total questions in the quiz' });
        }

        return res.status(201).json({ message: "Question created successfully", question });
    } catch (error) {
        console.error('Error creating question:', error);
        return res.status(500).json({ message: "Internal Server Error" });
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
    const userId = req.user.id;
    try {
        const checkQuiz = await Quiz.getQuizById(quizId);
        if (!checkQuiz) {
            return res.status(404).json({ message: 'Quiz does not exist' });
        }

        // only users that created the quiz can delete the quiz
        if (checkQuiz.created_by !== userId){
            return res.status(403).json({ message: 'You are not authorized to update this quiz' });
        }
        // Convert img_url to buffer if it's a base64 string
        if (newQuizData.quizImg) {
            newQuizData.quizImg = base64ToBuffer(newQuizData.quizImg);
        } else {
            // If no new image is provided, retain the existing image buffer
            newQuizData.quizImg = checkQuiz.quizImg;
        }
        const quiz = await Quiz.updateQuiz(quizId, newQuizData);
        res.status(200).json({ message: 'successfully updated', quiz});
    } catch (error) {
        console.error('Update Quiz - Server Error:', error); // Log error details
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

const deleteQuiz = async (req, res) => {
    const quizId = parseInt(req.params.id);
    const userId = req.user.id;
    try {
        const checkQuiz = await Quiz.getQuizById(quizId);
        if (!checkQuiz) {
            return res.status(404).json({ message: 'Quiz does not exist' });
        }

        // only users that created the quiz can delete the quiz
        if (checkQuiz.created_by !== userId) {
            return res.status(403).json({ message: 'You are not authorized to delete this quiz' });
        }

        /* ----------------------------------- DELETING FKs ----------------------------------- */
        /*
        Delete user responses related to the quiz.
        Delete incorrect answers related to the quiz.
        Delete user attempts related to the quiz.
        Delete questions related to the quiz.
        Finally, delete the quiz itself.
        */ 
        // changed it because users may not have attempts or may not have response
        // const deleteUserResponses = await Quiz.deleteUserResponses(quizId);
        // if (!deleteUserResponses) {
        //     return res.status(400).json({ message: 'Failed to delete user responses related to the quiz' });
        // }
        await Quiz.deleteUserResponsesByQuizId(quizId);
        await Quiz.deleteIncorrectAnswersByQuizId(quizId);
        await Quiz.deleteUserAttempts(quizId);

        // const deleteIncorrectAnswers = await Quiz.deleteIncorrectAnswers(quizId);
        // if (!deleteIncorrectAnswers) {
        //     return res.status(400).json({ message: 'Failed to delete incorrect answers related to the quiz' });
        // }

        // const deleteUserAttempts = await Quiz.deleteUserAttempts(quizId);
        // if (!deleteUserAttempts) {
        //     return res.status(400).json({ message: 'Failed to delete user attempts related to the quiz' });
        // }

        const deleteQns = await Quiz.deleteQuestionByQuizId(quizId);
        if (!deleteQns) {
            return res.status(400).json({ message: 'Failed to delete questions related to the quiz' });
        }
        /* ----------------------------------- DELETING FKs ----------------------------------- */

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

const updateQuestion = async (req, res) => { // get back to here
    const qnsId = req.params.questionId;
    const quizId = req.params.quizId;
    const newQuestionData = req.body;
    try {

        // Check if the quiz exists
        const checkQuiz = await Quiz.getQuizById(quizId);
        if (!checkQuiz) {
            return res.status(404).json({ message: 'Quiz does not exist' });
        }

        // Check if the question exists
        const checkQns = await Quiz.getQuestionById(qnsId);
        if (!checkQns) {
            return res.status(404).json({ message: 'Question does not exist' });
        }

        if (newQuestionData.qnsImg) {
            newQuestionData.qnsImg = base64ToBuffer(newQuestionData.qnsImg);
        } else {
            // if no new image is provided, use the existing image from the database
            newQuestionData.qnsImg = checkQns.qnsImg;
        }

        const updateQns = await Quiz.updateQuestion(quizId, qnsId, newQuestionData);
        if (!updateQns) {
            return res.status(400).json({ message: 'Could not update question' });
        }
        res.status(200).json({ message: 'Question updated successfully' });
    } catch (error) {
        console.error('Update Question - Server Error:', error); // Log error details
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

// FOR DELETE QUESTION, WHEN I DELETE QUESTION I MUST ALSO UPDATE THE TOTAL QUESTION IN QUIZZES
// if user wants to delete one last question, also prompt them if they want to delete the quiz -------------------------------------
const deleteQuestion = async (req, res) => {
    const qnsId = req.params.questionId;
    const quizId = req.params.quizId;
    try {

        // Check if the quiz exists
        const checkQuiz = await Quiz.getQuizById(quizId);
        if (!checkQuiz) {
            return res.status(404).json({ message: 'Quiz does not exist' });
        }

        // ------------ check whether the quiz has atleast 1 question ------------
        if (checkQuiz.total_questions <= 1) {
            // Prompt the user for confirmation to delete the quiz
            return res.status(200).json({ 
                message: 'This is the last question. Do you want to delete the entire quiz?', 
                confirmDeleteQuiz: true 
            });
        }
        
        // Check if the question exists
        const checkQns = await Quiz.getQuestionById(qnsId);
        if (!checkQns) {
            return res.status(404).json({ message: 'Question does not exist' });
        }

        /* ----------------------------------- DELETING FKs ----------------------------------- */

        // Delete related user responses
        // const deleteUserResponses = await Quiz.deleteUserResponsesByQuestionId(qnsId);
        // if (!deleteUserResponses) {
        //     return res.status(400).json({ message: 'Could not delete user responses related to the question' });
        // }

        await Quiz.deleteUserResponsesByQuestionId(qnsId);
        await Quiz.deleteIncorrectAnswersByQuestionId(qnsId);
        // Delete related incorrect answers
        // const deleteIncorrectAnswers = await Quiz.deleteIncorrectAnswersByQuestionId(qnsId);
        // if (!deleteIncorrectAnswers) {
        //     return res.status(400).json({ message: 'Could not delete incorrect answers related to the question' });
        // }

        /* ----------------------------------- DELETING FKs ----------------------------------- */

        // Delete the question
        const deleteQns = await Quiz.deleteQuestionByQuestionId(qnsId);
        if (!deleteQns) {
            return res.status(400).json({ message: 'Could not delete question' });
        }

        // ------------------------ update the total question here --------------------
        const updatedQuizData = {
            title: checkQuiz.title,
            description: checkQuiz.description,
            total_questions: checkQuiz.total_questions - 1,
            total_marks: checkQuiz.total_marks,
            created_by: checkQuiz.created_by,
            quizImg: checkQuiz.quizImg
        };

        const updateTotalQuestion = await Quiz.updateQuiz(quizId, updatedQuizData);
        if (!updateTotalQuestion) {
            return res.status(400).json({ message: 'Could not update total questions in the quiz' });
        }

        res.status(200).json({ message: 'Question deleted successfully' });
    } catch (error) {
        console.error('Delete Questions - Server Error:', error); // Log error details
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};




// flow of content for below so i dont get confused
// 1. user submit quiz
// 2. when user submit quiz count how many attempt the user has 
// 3. display the result to the user
// 4. also display it in the user's profile page




// check if all qns r attempted
const submitQuiz = async (req, res) => {
    const { quizId, responses, timeTaken } = req.body;
    const userId = req.user.id;
    let totalScore = 0;

    try {
        // Fetch the quiz details including total marks and total questions
        const quizDetails = await Quiz.getQuizById(quizId);
        if (!quizDetails) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        const totalMarks = quizDetails.total_marks; // need total marks to determine whether pass or fail 
        const totalQuestions = quizDetails.total_questions;

        // Check if all questions have responses
        if (responses.length < totalQuestions || responses.some(response => response.selected_option === null)) {
            return res.status(400).json({ message: 'All questions must be answered.' });
        }

        // Create the quiz attempt record before saving responses
        const attemptId = await Quiz.createQuizAttempt(userId, quizId, totalScore, false, timeTaken);

        // Save each user response
        for (const response of responses) {
            const { question_id, selected_option } = response;
            await Quiz.saveUserResponse(attemptId, question_id, selected_option);

            // Check each answer and calculate the total score
            const isCorrect = await Quiz.isCorrectAnswer(question_id, selected_option);
            if (isCorrect) {
                totalScore++;
            }
        }

        // Calculate score percentage
        const scorePercentage = (totalScore / totalQuestions) * 100;

        const passingScore = totalMarks * 0.5; // need to get at least half of the total marks to pass
        const passed = totalScore >= passingScore; // if total score is more than half of the total marks = pass

        // Update the quiz attempt record with the calculated score and passing status
        await Quiz.updateQuizAttempt(attemptId, scorePercentage, passed);

        res.status(200).json({ attemptId });
    } catch (error) {
        console.error('Error submitting quiz:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};


const getAttemptCount = async (req, res) => { // so i can display number of attempts to user
    const userId = req.user.id;
    try {
        const count = await Quiz.getAttemptCount(userId);
        res.status(200).json({ attemptCount: count });
    } catch (error) {
        console.error('Get Attempt Count - Server Error:', error); // Log error details
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

const getAllQuizResultsForUser = async (req, res) => { // for account page
    const userId = req.user.id;
    try {
        const results = await Quiz.getAllQuizResultsForUser(userId);
        if (!results) {
            return res.status(400).json({ message: 'No quiz completed' });
        }
        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching quiz results:', error);
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
    createQuestion,
    getAllQuizResultsForUser,
    getUserQuizResult,
    getAttemptCount,
    submitQuiz,
    updateQuestion,
    deleteQuestion
}