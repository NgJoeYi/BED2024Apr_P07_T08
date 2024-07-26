const Quiz = require('../models/quiz');
const fetch = require('node-fetch'); // Import node-fetch to make API requests

// Function to convert base64 image data to buffer
function base64ToBuffer(base64String) {
    if (!base64String) {
        return null; // ------------------------------------------------------------------------ Return null if the base64 string is not provided
    }
    return Buffer.from(base64String, 'base64'); // --------------------------------------------- Convert base64 string to buffer
}

// Function to create a new quiz
const createQuiz = async (req, res) => {
    const newQuizData = req.body; // ----------------------------------------------------------- Extract new quiz data from the request body
    const userId = req.user.id; // ------------------------------------------------------------- Extract user ID
    try {

        const getAllTitles = await Quiz.getAllQuizWithCreatorName(); // ----------------------- Retrieve all quiz titles with creator names
        // ------------------------------------------------------------------------------------ Check for duplicate titles
        const newTitle = newQuizData.title.trim().toLowerCase(); // --------------------------- Trim and convert new title to lower case
        for (const quiz of getAllTitles) {
            const existingTitle = quiz.title.trim().toLowerCase(); // ------------------------- Trim and convert existing title to lower case
            if (newTitle === existingTitle) { // ---------------------------------------------- Compare titles
                return res.status(400).json({ message: 'Title already exists' }); // ---------- Return error if title already exists
            }
        }

        // ----------------------------- DONE USING JOI INSTEAD -----------------------------
        /* VALIDATED TO MAKE SURE:
        1. all required fields are filled 
        */
        newQuizData.title = newQuizData.title.charAt(0).toUpperCase() + newQuizData.title.slice(1); // make all quiz title start with upper case
        newQuizData.description = newQuizData.title.charAt(0).toUpperCase() + newQuizData.title.slice(1); // make all quiz title start with upper case

        newQuizData.created_by = userId;  // ------------------------------------------------ Assign the user ID to the new quiz data

        if (newQuizData.quizImg) { // ------------------------------------------------------- Convert img_url to buffer if it's a base64 string
            newQuizData.quizImg = base64ToBuffer(newQuizData.quizImg);
        }
        const quiz = await Quiz.createQuiz(newQuizData); // --------------------------------- Create a new quiz
        if (!quiz) {
            return res.status(500).json({ message: 'Failed to create a new quiz' }); // ----- Return error if quiz creation fails
        }
        res.status(201).json({ message: 'Quiz created successfully', quiz }); // ------------ Return success message and created quiz
    } catch (error) {
        console.error('Create Quiz - Server Error:', error); // ----------------------------- Log error details
        res.status(500).json({ message: 'Server error. Please try again later.' }); // ------ Return server error
    }
};

// Function to create a question after quiz creation
const createQuestionAfterQuizCreation = async (req, res) => {
    const newQuestionData = req.body;  // --------------------------------------------------- Extract new question data from the request body
    const quizId = parseInt(req.params.id); // ---------------------------------------------- Extract quiz ID from the request parameters
    try {
        const checkQuiz = await Quiz.getQuizById(quizId); // -------------------------------- Check if the quiz exists
        if (!checkQuiz) {
            return res.status(404).json({ message: 'Quiz does not exist' }); // ------------- Return error if quiz does not exist
        }

        if (newQuestionData.qnsImg) { // ---------------------------------------------------- Convert question image to buffer if it's a base64 string
            newQuestionData.qnsImg = base64ToBuffer(newQuestionData.qnsImg);
        }


        // Define options from newQuestionData
        const options = [
            newQuestionData.option_1,
            newQuestionData.option_2,
            newQuestionData.option_3,
            newQuestionData.option_4
        ];

        // Validate that all options are unique
        const uniqueOptions = new Set(options);
        if (uniqueOptions.size !== options.length) {
            return res.status(400).json({ message: "Options must have unique content" });
        }
        
        // Convert correct_option to a zero-based index
        const correctOptionIndex = parseInt(newQuestionData.correct_option, 10) - 1;
        // Check if the index is valid and within the bounds of the options array
        if (correctOptionIndex >= 0 && correctOptionIndex < options.length) {
            // Map correct_option to its content
            newQuestionData.correct_option = options[correctOptionIndex];
        }
        console.log(newQuestionData);


        const question = await Quiz.createQuestion(newQuestionData); // --------------------- Create a new question
        if (!question) {
            return res.status(500).json({ message: "Failed to create question" }); // ------- Return error if question creation fails
        }
        res.status(201).json({ message: 'Question created successfully', question }); // ---- Return success message and created question
    } catch (error) {
        console.error('Error creating question:', error); // -------------------------------- Log error details
        return res.status(500).json({ message: "Internal Server Error" }); // --------------- Return server error
    }
};

// Function to create a question when updating the quiz
const createQuestionOnUpdate = async (req, res) => { // utilise this in editQuestion.js 
    const newQuestionData = req.body; // --------------------------------------------------- Extract new question data from the request body
    try {
        const checkQuiz = await Quiz.getQuizById(newQuestionData.quiz_id); // -------------- Check if the quiz exists
        if (!checkQuiz) {
            return res.status(404).json({ message: 'Quiz does not exist' }); // ------------ Return error if quiz does not exist
        }

        if (newQuestionData.qnsImg) { // --------------------------------------------------- Convert question image to buffer if it's a base64 string
            newQuestionData.qnsImg = base64ToBuffer(newQuestionData.qnsImg);
        }
        
        // Define options from newQuestionData
        const options = [
            newQuestionData.option_1,
            newQuestionData.option_2,
            newQuestionData.option_3,
            newQuestionData.option_4
        ];

        // Validate that all options are unique
        const uniqueOptions = new Set(options);
        if (uniqueOptions.size !== options.length) {
            return res.status(400).json({ message: "Options must have unique content" });
        }
        
        // Convert correct_option to a zero-based index
        const correctOptionIndex = parseInt(newQuestionData.correct_option, 10) - 1;
        // Check if the index is valid and within the bounds of the options array
        if (correctOptionIndex >= 0 && correctOptionIndex < options.length) {
            // Map correct_option to its content
            newQuestionData.correct_option = options[correctOptionIndex];
        }
        console.log(newQuestionData);

        const question = await Quiz.createQuestion(newQuestionData); // -------------------- Create a new question
        if (!question) {
            return res.status(500).json({ message: "Failed to create question" });  // ----- Return error if question creation fails
        }

        // ------------------------ update the total question here --------------------
        const updatedQuizData = {
            title: checkQuiz.title,
            description: checkQuiz.description,
            total_questions: checkQuiz.total_questions + 1,  // ---------------------------- Increment total questions
            total_marks: checkQuiz.total_marks,
            created_by: checkQuiz.created_by,
            quizImg: checkQuiz.quizImg
        };
        const updateTotalQuestion = await Quiz.updateQuiz(newQuestionData.quiz_id, updatedQuizData);
        if (!updateTotalQuestion) {
            return res.status(500).json({ message: 'Could not update total questions in the quiz' });
        }

        // ------------------------ retrieiving the users response to recalc the score to be displayed to the user ------------------------

        /* example: user got 100% when the quiz initially had 5 questions.
           But if lecturer decides to update the question to make the quiz have 6 question, the score should update, and would be adjusted to 83%.
           MY REASONING: i want to make it so that the quiz questions are synced. Imagine Lecturers keep adding question to the quiz,
           and each time the lecturer adds a new question, the user take the quiz again, then the quiz history for that particular quiz 
           would have total questions of 5,6,7,8,9.... which is very messy because all students would have different number of questions in their quiz history
           which user would probably find it messy, and confusing.
           hence, i will update the user score, passing rate and total question each time the lecturer adds a new question to the quiz.
           There are no limits to the number of attempts for the quiz, so if users want to have quiz with 100% they are free to retake the quiz
           because questions may be added/deleted hence score and passing rate will adjust accordingly. time taken would not change.

           same applies for the deletion of question
        */

        // ----------------------------------------------------------------------------------------------------- Retrieve all quiz attempts for the quiz
        const userAttempts = await Quiz.getAllQuizResultsByQuizId(newQuestionData.quiz_id);
        if (userAttempts) {
            for (const attempt of userAttempts) {
                // --------------------------------------------------------------------------------------------- Retrieve the user's responses for the current attempt
                const userResponses = await Quiz.getUserResponsesByAttemptId(attempt.attempt_id); // ----------- Retrieve user responses

                // Recalculate the score
                let newScore = 0;
                for (const response of userResponses) {
                    const correctOption = await Quiz.isCorrectAnswer(response.question_id); // ----------------- Check if the answer is correct
                    if (response.selected_option === correctOption) {
                        newScore += 1; // ---------------------------------------------------------------------- Increment score for correct answers
                    }
                }
                const totalQuestions = checkQuiz.total_questions + 1; // --------------------------------------- Including the newly added question
                const newPercentage = (newScore / totalQuestions) * 100; // ------------------------------------ Calculate new percentage

                await Quiz.updateQuizAttempt(attempt.attempt_id, newPercentage, newPercentage >= 50); // ------- Update the user's quiz attempt with the new score
            }
        }

        return res.status(201).json({ message: "Question created successfully", question }); // ---------------- Return success message and created question
    } catch (error) {
        console.error('Error creating question:', error); // --------------------------------------------------- Log error details
        return res.status(500).json({ message: "Internal Server Error" }); // ---------------------------------- Return server error
    }
};

// Function to get a quiz by ID
const getQuizById = async (req, res) => {
    const quizId = parseInt(req.params.id); // ---------------------------------------------------------------- Extract quiz ID from the request parameters
    try {
        const quiz = await Quiz.getQuizById(quizId); // ------------------------------------------------------- Retrieve quiz by ID
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz does not exist' }); // ------------------------------- Return error if quiz does not exist
        }
        res.status(200).json(quiz); // ------------------------------------------------------------------------ Return retrieved quiz
    } catch (error) {
        console.error('Get Single Quiz - Server Error:', error); // ------------------------------------------- Log error details
        res.status(500).json({ message: 'Server error. Please try again later.' }); // ------------------------ Return server error
    }
};

// Function to get all quizzes with creator name
const getAllQuizWithCreatorName = async (req, res) => {
    try {
        const quiz = await Quiz.getAllQuizWithCreatorName(); // ---------------------------------------------- Retrieve all quizzes with creator names
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz does not exist' }); // ------------------------------ Return error if no quizzes found
        }
        res.status(200).json(quiz); // ----------------------------------------------------------------------- Return retrieved quizzes
    } catch (error) {
        console.error('Get All Quiz - Server Error:', error); // --------------------------------------------- Log error details
        res.status(500).json({ message: 'Server error. Please try again later.' }); // ----------------------- Return server error
    }
};

// Function to update a quiz
const updateQuiz = async (req, res) => {
    const quizId = parseInt(req.params.id); // -------------------------------------------------------------- Extract quiz ID from the request parameters
    const newQuizData = req.body; // ------------------------------------------------------------------------ Extract new quiz data from the request body
    const userId = req.user.id; // -------------------------------------------------------------------------- Extract user ID
    try {

        const getAllTitles = await Quiz.getAllQuizWithCreatorName(); // ------------------------------------- Retrieve all quiz titles with creator names

        // Debug logging
        console.log('getAllTitles:', getAllTitles);
        console.log('newQuizData:', newQuizData);
        console.log('quizId:', quizId);

        // -------------------------------------------------------------------------------------------------- Check for duplicate titles, excluding the current quiz being updated
        const newTitle = newQuizData.title.trim().toLowerCase(); // ----------------------------------------- Trim and convert new title to lower case
        for (const quiz of getAllTitles) {
            const existingTitle = quiz.title.trim().toLowerCase(); // --------------------------------------- Trim and convert existing title to lower case
            if (newTitle === existingTitle && parseInt(quiz.quiz_id) !== quizId) { // -------------------------------------- Exclude the current quiz from duplicate check
                return res.status(400).json({ message: 'Title already exists' }); // ------------------------ Return error if title already exists
            }
        }

        const checkQuiz = await Quiz.getQuizById(quizId); // ------------------------------------------------ Check if the quiz exists
        if (!checkQuiz) {
            return res.status(404).json({ message: 'Quiz does not exist' }); // ----------------------------- Return error if quiz does not exist
        }

        if (checkQuiz.created_by !== userId){ // ------------------------------------------------------------ only users that created the quiz can delete the quiz
            return res.status(403).json({ message: 'You are not authorized to update this quiz' });  // ----- Return error if not authorized
        }

        if (newQuizData.quizImg) { // ---------------------------------------------------------------------- Convert img_url to buffer if it's a base64 string
            newQuizData.quizImg = base64ToBuffer(newQuizData.quizImg);
        } else { // ---------------------------------------------------------------------------------------- If no new image is provided, retain the existing image buffer
            newQuizData.quizImg = checkQuiz.quizImg;
        }

        // Check if any changes were made
        const changesMade = Object.keys(newQuizData).some(
            key => newQuizData[key] !== checkQuiz[key]
        );

        if (!changesMade) {
            return res.status(400).json({ message: 'No changes were made.' });
        }

        newQuizData.title = newQuizData.title.charAt(0).toUpperCase() + newQuizData.title.slice(1); // start w upper case

        const quiz = await Quiz.updateQuiz(quizId, newQuizData); // ---------------------------------------- Update the quiz
        res.status(200).json({ message: 'successfully updated', quiz}); // --------------------------------- Return success message and updated quiz
    } catch (error) {
        console.error('Update Quiz - Server Error:', error); // -------------------------------------------- Log error details
        res.status(500).json({ message: 'Server error. Please try again later.' }); // --------------------- Return server error
    }
};

// Function to delete a quiz
const deleteQuiz = async (req, res) => {
    const quizId = parseInt(req.params.id); // ------------------------------------------------------------ Extract quiz ID from the request parameters
    const userId = req.user.id; // ------------------------------------------------------------------------ Extract user ID
    try {
        const checkQuiz = await Quiz.getQuizById(quizId); // ---------------------------------------------- Check if the quiz exists
        if (!checkQuiz) {
            return res.status(404).json({ message: 'Quiz does not exist' }); // --------------------------- Return error if quiz does not exist
        }

        if (checkQuiz.created_by !== userId) { // --------------------------------------------------------- only users that created the quiz can delete the quiz
            return res.status(403).json({ message: 'You are not authorized to delete this quiz' }); // ---- Return error if not authorized
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
        await Quiz.deleteUserResponsesByQuizId(quizId); // ------------------------------------------------- Delete related user responses
        await Quiz.deleteIncorrectAnswersByQuizId(quizId); // ---------------------------------------------- Delete related incorrect answers
        await Quiz.deleteUserAttempts(quizId); // ---------------------------------------------------------- Delete related user attempts

        // const deleteIncorrectAnswers = await Quiz.deleteIncorrectAnswers(quizId);
        // if (!deleteIncorrectAnswers) {
        //     return res.status(400).json({ message: 'Failed to delete incorrect answers related to the quiz' });
        // }

        // const deleteUserAttempts = await Quiz.deleteUserAttempts(quizId);
        // if (!deleteUserAttempts) {
        //     return res.status(400).json({ message: 'Failed to delete user attempts related to the quiz' });
        // }

        const deleteQns = await Quiz.deleteQuestionByQuizId(quizId); // ------------------------------------ Delete related questions
        if (!deleteQns) {
            return res.status(400).json({ message: 'Failed to delete questions related to the quiz' }); // - Return error if question deletion fails
        }
        /* ----------------------------------- DELETING FKs ----------------------------------- */

        const quiz = await Quiz.deleteQuiz(quizId); // ----------------------------------------------------- Delete the quiz
        if (quiz) {
            res.status(204).send(); // --------------------------------------------------------------------- Return success message if quiz deletion is successful
        } else {
            res.status(500).json({ message: 'Failed to delete quiz' }); // --------------------------------- Return error if quiz deletion fails
        }
    } catch (error) {
        console.error('Delete Quiz - Server Error:', error); // -------------------------------------------- Log error details
        res.status(500).json({ message: 'Server error. Please try again later.' }); // --------------------- Return server error
    }
};

// Function to get a quiz with its questions by quiz ID
const getQuizWithQuestions = async (req, res) => {
    const quizId = parseInt(req.params.id); // ------------------------------------------------------------- Extract quiz ID from the request parameters
    try {
        const quiz = await Quiz.getQuizWithQuestions(quizId); // ------------------------------------------- Retrieve quiz with questions by quiz ID
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz does not exist' }); // ---------------------------- Return error if quiz does not exist
        }
        // Iterate over each question in the quiz
        quiz.questions.forEach(question => {
            // Check which option matches the correct_option
            for (let i = 1; i <= 4; i++) {
                if (question[`option_${i}`] === question.correct_option) {
                    question.correct_option = i; // Set correct_option to the corresponding option number
                    console.log(question.correct_option);
                    break; // Exit the loop once the correct_option is found
                }
            }
        });
        res.status(200).json(quiz); // --------------------------------------------------------------------- Return retrieved quiz with questions
    } catch (error) {
        console.error('Get Quiz With Questions - Server Error:', error); // -------------------------------- Log error details
        res.status(500).json({ message: 'Server error. Please try again later.' }); // --------------------- Return server error
    }
};

// Function to update a question
// need to check if the correct option updated is the same with one of the options given (edit: done))
const updateQuestion = async (req, res) => {
    const qnsId = parseInt(req.params.questionId); // ----------------------------------------------------- Extract question ID from the request parameters
    const quizId = parseInt(req.params.quizId); // -------------------------------------------------------- Extract quiz ID from the request parameters
    const newQuestionData = req.body; // ------------------------------------------------------------------ Extract new question data from the request body
    try {
        const checkQuiz = await Quiz.getQuizById(quizId); // ---------------------------------------------- Check if the quiz exists
        if (!checkQuiz) {
            return res.status(404).json({ message: 'Quiz does not exist' }); // --------------------------- Return error if quiz does not exist
        }

        const checkQns = await Quiz.getQuestionById(qnsId); // -------------------------------------------- Check if the question exists
        if (!checkQns) {
            return res.status(404).json({ message: 'Question does not exist' }); // ----------------------- Return error if question does not exist
        }

        // ------------------------------------------------------------------------------------------------ Validate that the correct option is one of the provided options
        // Validate that the correct option is one of the provided options
        const options = [
            newQuestionData.option_1,
            newQuestionData.option_2,
            newQuestionData.option_3,
            newQuestionData.option_4
        ];

        // Check for duplicate options
        const uniqueOptions = new Set(options);
        if (uniqueOptions.size !== options.length) {
            return res.status(400).json({ message: 'Options must be unique' }); // Return error if options are not unique
        }

        // Convert correct_option to a zero-based index
        const correctOptionIndex = parseInt(newQuestionData.correct_option, 10) - 1;

        // Check if the index is valid and within the bounds of the options array
        if (correctOptionIndex >= 0 && correctOptionIndex < options.length) {
            // Map correct_option to its content
            newQuestionData.correct_option = options[correctOptionIndex];
        } else {
            return res.status(400).json({ message: 'Correct option must be between 1 and 4' });
        }

        // Debugging log
        console.log('New question data:', newQuestionData);

        // const correctOptionExists = options.includes(newQuestionData.correct_option.toLowerCase()); // ------ compare options in lower case
        // if (!correctOptionExists) {
        //     return res.status(400).json({ message: 'Correct option must be one of the given options' }); // - Return error if correct option is not valid
        // } now using spinner no longer need this

        if (newQuestionData.question_text) { // ------------------------------------------------------------- Make sure sentences starts with caps 
            newQuestionData.question_text = newQuestionData.question_text.charAt(0).toUpperCase() + newQuestionData.question_text.slice(1);
        }

        if (newQuestionData.qnsImg) { // -------------------------------------------------------------------- if image is provided
            newQuestionData.qnsImg = base64ToBuffer(newQuestionData.qnsImg);
        } else { // ----------------------------------------------------------------------------------------- if image is not provided get the initial image
            newQuestionData.qnsImg = checkQns.qnsImg;
        }

        const updateQns = await Quiz.updateQuestion(quizId, qnsId, newQuestionData); // --------------------- Update the question
        if (!updateQns) {
            return res.status(400).json({ message: 'Could not update question' }); // ----------------------- Return error if question update fails
        }
        res.status(200).json({ message: 'Question updated successfully' }); // ------------------------------ Return success message if question update is successful
    } catch (error) {
        console.error('Update Question - Server Error:', error); // ----------------------------------------- Log error details
        res.status(500).json({ message: 'Server error. Please try again later.' }); // ---------------------- Return server error
    }
};

// Function to delete a question
// FOR DELETE QUESTION, WHEN I DELETE QUESTION I MUST ALSO UPDATE THE TOTAL QUESTION IN QUIZZES (edit: done)
// if user wants to delete one last question, also prompt them if they want to delete the quiz (edit: done)
const deleteQuestion = async (req, res) => {
    const qnsId = req.params.questionId; // ----------------------------------------------------------------- Extract question ID from the request parameters
    const quizId = req.params.quizId; // -------------------------------------------------------------------- Extract quiz ID from the request parameters
    try {
        const checkQuiz = await Quiz.getQuizById(quizId); // ------------------------------------------------ Check if the quiz exists
        if (!checkQuiz) {
            return res.status(404).json({ message: 'Quiz does not exist' }); // ----------------------------- Return error if quiz does not exist
        }

        // ------------ check whether the quiz has atleast 1 question ------------
        if (checkQuiz.total_questions <= 1) {
            return res.status(200).json({  // --------------------------------------------------------------- Return message prompting to delete the entire quiz if it's the last question
                message: 'This is the last question. Do you want to delete the entire quiz?', 
                confirmDeleteQuiz: true 
            });
        }
        
        const checkQns = await Quiz.getQuestionById(qnsId); // ---------------------------------------------- Check if the question exists
        if (!checkQns) {
            return res.status(404).json({ message: 'Question does not exist' }); // ------------------------- Return error if question does not exist
        }

        /* ----------------------------------- DELETING FKs ----------------------------------- */

        // Delete related user responses
        // const deleteUserResponses = await Quiz.deleteUserResponsesByQuestionId(qnsId);
        // if (!deleteUserResponses) {
        //     return res.status(400).json({ message: 'Could not delete user responses related to the question' });
        // }

        await Quiz.deleteUserResponsesByQuestionId(qnsId); // ----------------------------------------------- Delete related user responses
        await Quiz.deleteIncorrectAnswersByQuestionId(qnsId); // -------------------------------------------- Delete related incorrect answers
        // Delete related incorrect answers
        // const deleteIncorrectAnswers = await Quiz.deleteIncorrectAnswersByQuestionId(qnsId);
        // if (!deleteIncorrectAnswers) {
        //     return res.status(400).json({ message: 'Could not delete incorrect answers related to the question' });
        // }

        /* ----------------------------------- DELETING FKs ----------------------------------- */

        const deleteQns = await Quiz.deleteQuestionByQuestionId(qnsId); // ---------------------------------- Delete the question
        if (!deleteQns) {
            return res.status(500).json({ message: 'Could not delete question' }); // ----------------------- Return error if question deletion fails
        }

        // ------------------------ update the total question here --------------------
        const updatedQuizData = {
            title: checkQuiz.title,
            description: checkQuiz.description,
            total_questions: checkQuiz.total_questions - 1, // ---------------------------------------------- Decrement total questions
            total_marks: checkQuiz.total_marks,
            created_by: checkQuiz.created_by,
            quizImg: checkQuiz.quizImg
        };

        const updateTotalQuestion = await Quiz.updateQuiz(quizId, updatedQuizData); // --------------------- Update the quiz with new total questions
        if (!updateTotalQuestion) {
            return res.status(500).json({ message: 'Could not update total questions in the quiz' }); // --- Return error if quiz update fails
        }

        // ------------------------ retrieiving the users response to recalc the score to be displayed to the user ------------------------

        /* if user got 1st question correct and the other 4 questions wrong 
        the percentage score would be 20% but if all the other 4 questions were deleted, 
        the total percentage should become 100% since there is only one question left in 
        the quiz and the question left was the one that the user got it right */

        const userAttempts = await Quiz.getAllQuizResultsByQuizId(quizId); // ------------------------------ Retrieve all quiz attempts for the quiz
        if (userAttempts) {
            for (const attempt of userAttempts) {
                // Retrieve the user's responses for the current attempt
                const userResponses = await Quiz.getUserResponsesByAttemptId(attempt.attempt_id); // ------- Retrieve user responses

                // Recalculate the score
                let newScore = 0;
                for (const response of userResponses) {
                    const correctOption = await Quiz.isCorrectAnswer(response.question_id); // -------------- Check if the answer is correct
                    if (response.selected_option === correctOption) {
                        newScore += 1;  // ------------------------------------------------------------------ Increment score for correct answers
                    }
                }
                const totalQuestions = userResponses.length; // --------------------------------------------- Calculate total questions after deletion
                const newPercentage = (newScore / totalQuestions) * 100; // --------------------------------- Calculate new percentage

                await Quiz.updateQuizAttempt(attempt.attempt_id, newPercentage, newPercentage >= 50); // ---- Update the user's quiz attempt with the new score
            }
        }
        res.status(204).send(); // ------------------------------ Return success message if question deletion is successful
    } catch (error) {
        console.error('Delete Questions - Server Error:', error); // ---------------------------------------- Log error details
        res.status(500).json({ message: 'Server error. Please try again later.' }); // ---------------------- Return server error
    }
};

// note to self:
// flow of content for below so i dont get confused
// 1. user submit quiz
// 2. when user submit quiz count how many attempt the user has 
// 3. display the result to the user
// 4. also display it in the user's profile page
// maybe for incorrect answers table, can use it to create pie chart to represent statistics of ppl's score

// Function to submit a quiz
// check if all qns r attempted
const submitQuiz = async (req, res) => {
    const { quizId, responses, timeTaken } = req.body; // ---------------------------------------------------- Extract quiz ID, responses, and time taken from the request body
    const userId = req.user.id; // --------------------------------------------------------------------------- Extract user ID
    let correctAnswersCount = 0; // -------------------------------------------------------------------------- Initialize count of correct answers

    try {
        const quizDetails = await Quiz.getQuizById(quizId); // ----------------------------------------------- Fetch the quiz details including total marks and total questions
        if (!quizDetails) {
            return res.status(404).json({ message: 'Quiz not found' }); // ----------------------------------- Return error if quiz not found
        }
        const totalMarks = quizDetails.total_marks; // ------------------------------------------------------- need total marks to determine whether pass or fail 
        const totalQuestions = quizDetails.total_questions; // ----------------------------------------------- Get total questions from quiz details

        // --------------------------------------------------------------------------------------------------- Check if all questions have responses
        if (responses.length < totalQuestions || responses.some(response => response.selected_option === null)) {
            return res.status(400).json({ message: 'All questions must be answered.' });
        }

        const attemptId = await Quiz.createQuizAttempt(userId, quizId, 0, false, timeTaken); // -------------- Create the quiz attempt record before saving responses

        // ----------------------------------------------------------------------------------------------------Save each user response
        for (const response of responses) {
            const { question_id, selected_option } = response;
            await Quiz.saveUserResponse(attemptId, question_id, selected_option);

            // ----------------------------------------------------------------------------------------------- Check each answer and calculate the total score
            const correctOption = await Quiz.isCorrectAnswer(question_id); // -------------------------------- getting the correct option
            if (correctOption.toLowerCase() === selected_option.toLowerCase()) {
                // console.log('each time i get correct');
                correctAnswersCount++; // -------------------------------------------------------------------- Increment score for correct answers
            } else {
                await Quiz.saveIncorrectAnswer(attemptId, question_id, selected_option, correctOption); // --- Save incorrect answer
            }
        }

        const score = (correctAnswersCount / totalQuestions) * totalMarks; // ------------------------------- Calc the score
        console.log('Score percentage:', score);
        const passed = (score / totalMarks) * 100 >= 50; // ------------------------------------------------- Determine if the user passed
        console.log('Passed:', passed);

        await Quiz.updateQuizAttempt(attemptId, score, passed); // ------------------------------------------ Update the quiz attempt record with the calculated score and passing status

        res.status(200).json({ attemptId }); // ------------------------------------------------------------- Return the attempt ID
    } catch (error) {
        console.error('Error submitting quiz:', error); // -------------------------------------------------- Log error details
        res.status(500).json({ message: 'Server error. Please try again later.' }); // ---------------------- Return server error
    }
};

// Function to get the attempt count by quiz ID
const getAttemptCountByQuizId = async (req, res) => { // --------------------------------------------------- so i can display number of attempts to user
    const userId = req.user.id; // ------------------------------------------------------------------------- Extract user ID
    try {
        const count = await Quiz.getAttemptCountByQuizId(userId); // --------------------------------------- Get attempt count by quiz ID
        res.status(200).json(count); // -------------------------------------------------------------------- Return attempt count
    } catch (error) {
        console.error('Get Attempt Count By Quiz Id - Server Error:', error); // --------------------------- Log error details
        res.status(500).json({ message: 'Server error. Please try again later.' }); // --------------------- Return server error
    }
};

// Function to get all attempt counts for a user
const getAllAttemptCount = async (req, res) => { // ------------------------------------------------------- so i can display number of attempts to user
    const userId = req.user.id; // ------------------------------------------------------------------------ Extract user ID
    try {
        const count = await Quiz.getAllAttemptCount(userId); // ------------------------------------------- Get all attempt counts for the user
        res.status(200).json(count); // ------------------------------------------------------------------- Return attempt count
    } catch (error) {
        console.error('Get All Attempt Count - Server Error:', error); // --------------------------------- Log error details
        res.status(500).json({ message: 'Server error. Please try again later.' }); // -------------------- Return server error
    }
};

// Function to get a user's quiz result by attempt ID
const getUserQuizResult = async (req, res) => {
    const userId = req.user.id; // ----------------------------------------------------------------------- Extract user ID
    const attemptId = parseInt(req.params.attemptId); // ------------------------------------------------- Extract attempt ID from the request parameters
    try {
        const result = await Quiz.getUserQuizResult(userId, attemptId); // ------------------------------- Get user's quiz result by attempt ID
        if (!result) {
            return res.status(404).json({ message: 'Failed to retrieve user\'s quiz result' }); // ------- Return error if quiz result not found
        }
        res.status(200).json(result); // ----------------------------------------------------------------- Return user's quiz result
    } catch (error) {
        console.error('Get User\'s Quiz results - Server Error:', error); // ----------------------------- Log error details
        res.status(500).json({ message: 'Server error. Please try again later.' }); // ------------------- Return server error
    }
};

// Function to get all quiz results for a user
const getAllQuizResultsForUser = async (req, res) => { // ------------------------------------------------ for account page
    const userId = req.user.id; // ----------------------------------------------------------------------- Extract user ID
    try {
        const results = await Quiz.getAllQuizResultsForUser(userId); // ---------------------------------- Get all quiz results for the user
        if (!results) {
            return res.status(404).json({ message: 'No quiz completed' }); // ---------------------------- Return error if no quiz results found
        }
        res.status(200).json(results); // ---------------------------------------------------------------- Return quiz results
    } catch (error) {
        console.error('Error fetching quiz results:', error); // ----------------------------------------- Log error details
        res.status(500).json({ message: 'Server error. Please try again later.' }); // ------------------- Return server error
    }
};

// Function to get quiz pass/fail statistics
const getQuizPassFailStatistics = async (req, res) => {
    try {
        const stats = await Quiz.getQuizPassFailStatistics(); // ---------------------------------------- Get quiz pass/fail statistics
        res.status(200).json(stats); // ----------------------------------------------------------------- Return statistics
    } catch (error) {
        console.error('Error fetching pass/fail statistics:', error); // -------------------------------- Log error details
        res.status(500).json({ message: 'Internal server error' }); // ---------------------------------- Return server error
    }
};


// Fetch trivia quizzes from the Open Trivia Database API
const fetchTriviaQuizzes = async (req, res) => {
    const amount = req.query.amount || 10; // Get the amount of quizzes to fetch, default to 10
    const difficulty = req.query.difficulty || ''; // Get the difficulty level if provided

    const url = `https://opentdb.com/api.php?amount=${amount}&difficulty=${difficulty}`;
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!data || !data.results || data.results.length === 0) {
            return res.status(404).json({ message: 'No trivia quizzes found' });
        }

        res.status(200).json(data.results); // Return the trivia quizzes
    } catch (error) {
        console.error('Error fetching trivia quizzes:', error);
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
    createQuestionAfterQuizCreation,
    createQuestionOnUpdate,
    getAllQuizResultsForUser,
    getUserQuizResult,
    getAttemptCountByQuizId,
    getAllAttemptCount,
    submitQuiz,
    updateQuestion,
    deleteQuestion,
    getQuizPassFailStatistics,
    fetchTriviaQuizzes
};
