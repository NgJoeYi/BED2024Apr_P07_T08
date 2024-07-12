const sql = require('mssql');
const dbConfig = require('../dbConfig');

class Quiz {
    constructor(quiz_id, title, description, total_questions, total_marks, created_by, quizImg) {
        this.quiz_id = quiz_id;
        this.title = title;
        this.description = description;
        this.total_questions = total_questions;
        this.total_marks = total_marks;
        this.created_by = created_by;
        this.quizImg = quizImg;
    }

    static async createQuiz(newQuizData) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `
            INSERT INTO Quizzes (title, description, total_questions, total_marks, created_by, quizImg)
            VALUES (@inputTitle, @inputDescription, @inputTotal_questions, @inputTotal_marks, @inputCreated_by, @inputQuizImg);
            SELECT SCOPE_IDENTITY() AS quiz_id
            `;
            const request = connection.request();
            request.input('inputTitle', newQuizData.title);
            request.input('inputDescription', newQuizData.description);
            request.input('inputTotal_questions', newQuizData.total_questions);
            request.input('inputTotal_marks', newQuizData.total_marks);
            request.input('inputCreated_by', newQuizData.created_by);
            request.input('inputQuizImg', sql.VarBinary, newQuizData.quizImg);
            const result = await request.query(sqlQuery);
            if (result.rowsAffected[0] === 0) {
                return null;
            }
            return await this.getQuizById(result.recordset[0].quiz_id);
        } catch (error) {
            console.error('Error creating quiz:', error);
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    static async getQuizById(quizId) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `
            SELECT * FROM Quizzes WHERE quiz_id=@inputQuiz_id
            `;
            const request = connection.request();
            request.input('inputQuiz_id', quizId);
            const result = await request.query(sqlQuery);
            if (result.recordset.length === 0) {
                return null;
            }
            const quiz = result.recordset[0];
            return new Quiz(quizId , quiz.title, quiz.description, quiz.total_questions, quiz.total_marks, quiz.created_by, quiz.quizImg);
        } catch (error) {
            console.error('Error retrieving a single quiz:', error);
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    static async getAllQuizWithCreatorName() {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `
            SELECT Quizzes.quiz_id, Quizzes.title, Quizzes.description, Quizzes.total_questions, Quizzes.total_marks, Quizzes.quizImg, Users.name AS 'creator_name' 
            FROM Quizzes INNER JOIN Users ON Quizzes.created_by = Users.id
            `;
            const request = connection.request();
            const result = await request.query(sqlQuery);
            if (result.recordset.length === 0) {
                return null;
            }
            return result.recordset.map(quiz => new Quiz(quiz.quiz_id , quiz.title, quiz.description, quiz.total_questions, quiz.total_marks, quiz.creator_name, quiz.quizImg));
        } catch (error) {
            console.error('Error retrieving quizzes:', error);
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    static async updateQuiz(quizId, newQuizData) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `
            UPDATE Quizzes 
            SET title=@inputTitle, description=@inputDescription, total_questions=@inputTotal_questions, 
            total_marks=@inputTotal_marks, quizImg=@inputQuizImg
            WHERE quiz_id=@inputQuiz_id;
            `;
            const request = connection.request();
            request.input('inputTitle', newQuizData.title);
            request.input('inputDescription', newQuizData.description);
            request.input('inputTotal_questions', newQuizData.total_questions);
            request.input('inputTotal_marks', newQuizData.total_marks);
            request.input('inputCreated_by', newQuizData.created_by);
            request.input('inputQuizImg', sql.VarBinary, newQuizData.quizImg);
            request.input('inputQuiz_id', quizId);
            const result = await request.query(sqlQuery);
            if (result.rowsAffected[0] === 0) {
                return null;
            }
            return await this.getQuizById(quizId);
        } catch (error) {
            console.error('Error updating a single quiz:', error);
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    static async deleteQuiz(quizId) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `
            DELETE FROM Quizzes WHERE quiz_id=@inputQuiz_id
            `;
            const request = connection.request();
            request.input('inputQuiz_id', quizId);
            const result = await request.query(sqlQuery);
            if (result.rowsAffected[0] === 0) {
                return null;
            }
            return result.rowsAffected[0] > 0; // returns true
        } catch (error) {
            console.error('Error updating a single quiz:', error);
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    static async getQuizWithQuestions(quizId) { // so the question associated with the quiz will be shown when user clicks 'start quiz'
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `
            SELECT Quizzes.*, Questions.question_id, Questions.question_text, Questions.qnsImg, 
                   Questions.option_1, Questions.option_2, Questions.option_3, Questions.option_4, Questions.correct_option 
            FROM Quizzes 
            INNER JOIN Questions ON Quizzes.quiz_id = Questions.quiz_id 
            WHERE Quizzes.quiz_id = @inputQuiz_id
            `;
            const request = connection.request();
            request.input('inputQuiz_id', quizId);
            const result = await request.query(sqlQuery);

            const quizQnsList = {};
            for (const row of result.recordset) {
                const quizId = row.quiz_id;
                const qnsId = row.question_id;
                if (!quizQnsList[quizId]) {
                    quizQnsList[quizId] = {
                        quiz_id: row.quiz_id,
                        title: row.title,
                        description: row.description,
                        total_questions: row.total_questions,
                        total_marks: row.total_marks,
                        created_by: row.created_by,
                        quizImg: row.quizImg,
                        questions: []
                    };
                } 
                quizQnsList[quizId].questions.push({
                    question_id: qnsId,
                    question_text: row.question_text,
                    qnsImg: row.qnsImg,
                    option_1: row.option_1,
                    option_2: row.option_2,
                    option_3: row.option_3,
                    option_4: row.option_4,
                    correct_option: row.correct_option
                });
            }
            if (Object.keys(quizQnsList).length === 0) {
                return { message: "No quizzes with questions found" };
            }
            return Object.values(quizQnsList)[0];
        } catch (error) {
            console.error(error);
            throw new Error("Error fetching quiz with questions");
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    // ----------------------------------- QUESTIONS -----------------------------------

    static async createQuestion(newQuestionData) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `
            INSERT INTO Questions 
            (quiz_id, question_text, qnsImg, option_1, option_2, option_3, option_4, correct_option) 
            VALUES (@quiz_id, @question_text, @qnsImg, @option_1, @option_2, @option_3, @option_4, @correct_option);
            SELECT SCOPE_IDENTITY() AS question_id
            `;
            const request = connection.request();
            request.input('quiz_id', newQuestionData.quiz_id);
            request.input('question_text', newQuestionData.question_text);
            request.input('qnsImg', sql.VarBinary, newQuestionData.qnsImg || null);
            request.input('option_1', newQuestionData.option_1);
            request.input('option_2',newQuestionData.option_2);
            request.input('option_3', newQuestionData.option_3);
            request.input('option_4', newQuestionData.option_4);
            request.input('correct_option', newQuestionData.correct_option);
    
            const result = await request.query(sqlQuery);
            if (result.rowsAffected[0] === 0) {
                console.log('No rows affected');
                return null;
            }
            return result.recordset[0].question_id; // returning the created question_id
        } catch (error) {
            console.error('Error creating question:', error);
            throw new Error("Error creating questions");
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }  

    static async getQuestionById(qnsId) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `
            SELECT * FROM Questions WHERE question_id=@inputQnsId
            `;
            const request = connection.request();
            request.input('inputQnsId', qnsId);
            const result = await request.query(sqlQuery);
            if (result.recordset.length === 0) {
                return null;
            }
            const questionData = result.recordset[0];

            // returning structured object
            return {
                questionId: questionData.question_id,
                quizId: questionData.quiz_id,
                questionText: questionData.question_text,
                qnsImg: questionData.qnsImg,
                option1: questionData.option_1,
                option2: questionData.option_2,
                option3: questionData.option_3,
                option4: questionData.option_4,
                correctOption: questionData.correct_option
            };
        } catch (error) {
            console.error(error);
            throw new Error("Error fetching question by ID");
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }      

    static async updateQuestion(quizId, qnsId, newQuestionData) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `
            UPDATE Questions
            SET
                question_text = @question_text,
                qnsImg = @qnsImg,
                option_1 = @option_1,
                option_2 = @option_2,
                option_3 = @option_3,
                option_4 = @option_4,
                correct_option = @correct_option
            WHERE question_id = @question_id AND quiz_id = @quiz_id;
            `;
            const request = connection.request();
            request.input('question_text', newQuestionData.question_text);
            request.input('qnsImg', newQuestionData.qnsImg);
            request.input('option_1', newQuestionData.option_1);
            request.input('option_2', newQuestionData.option_2);
            request.input('option_3', newQuestionData.option_3);
            request.input('option_4', newQuestionData.option_4);
            request.input('correct_option', newQuestionData.correct_option);
            request.input('question_id', qnsId);
            request.input('quiz_id', quizId);
            const result = await request.query(sqlQuery);
        
            if (result.rowsAffected[0] === 0) {  
                return null;
            }
            return result.recordset > 0;
        } catch (error) {
            console.error('Error updating question:', error);
            throw new Error("Error updating question");
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }     
    
    static async deleteQuestionByQuizId(quizId){
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `
            DELETE FROM Questions WHERE quiz_id=@inputQuizId
            `;
            const request = connection.request();
            request.input('inputQuizId', quizId);
            const result = await request.query(sqlQuery);
            return result.rowsAffected[0] > 0; // returns true if any rows were deleted
        } catch (error) {
            console.error('Error deleting question:', error);
            throw new Error("Error deleting question");
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }  


    static async deleteQuestionByQuestionId(qnsId){
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `
            DELETE FROM Questions WHERE question_id=@inputQuestionId
            `;
            const request = connection.request();
            request.input('inputQuestionId', qnsId);
            const result = await request.query(sqlQuery);
            return result.rowsAffected[0] > 0; // returns true if any rows were deleted
        } catch (error) {
            console.error('Error deleting question:', error);
            throw new Error("Error deleting question");
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }  

    static async deleteUserResponsesByQuestionId(qnsId) {
        let connection;
        try{
            connection = await sql.connect(dbConfig);
            const sqlQuery = `
            DELETE FROM UserResponses WHERE question_id=@inputQuestionId
            `;
            const request = connection.request();
            request.input('inputQuestionId', qnsId);
            const result = await request.query(sqlQuery);
            // if (result.rowsAffected[0] === 0) {           IF NO RESPONSE DONT NEED TO RETURN NULL SINCE WE JUST WANT TO GET RID OF IT
            //     return null;
            // }
            return result.rowsAffected[0] > 0;
        } catch (error) {
            console.error('Error deleting user response by question ID:', error);
            throw new Error("Error deleting user response");
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    static async deleteIncorrectAnswersByQuestionId(qnsId) {
        let connection;
        try{
            connection = await sql.connect(dbConfig);
            const sqlQuery = `
            DELETE FROM IncorrectAnswers WHERE question_id=@inputQuestionId
            `;
            const request = connection.request();
            request.input('inputQuestionId', qnsId);
            const result = await request.query(sqlQuery);
            // if (result.rowsAffected[0] === 0) {                 SAME FOR THIS ^^^
            //     return null;
            // }
            return result.rowsAffected[0] > 0;
        } catch (error) {
            console.error('Error deleting incorrect answer by question ID:', error);
            throw new Error("Error deleting incorrect answer");
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }


        
    // ----------------------------------- START OF MY CODE FOR USER QUIZ RESULTS RELATED -----------------------------------

    static async getAllQuizResultsForUser(userId) { // TO BE DISPLAYED AT ACCOUNT PAGE 
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `
            SELECT U.attempt_id AS AttemptID, U.user_id AS UserID, U.attempt_date AS AttemptDate, U.score AS Score,
            U.time_taken AS TimeTaken, U.passed AS Passed, Q.title AS QuizTitle, Q.description AS QuizDescription,
            Q.total_questions AS TotalQuestions, Q.total_marks AS TotalMarks
            FROM UserQuizAttempts U 
            INNER JOIN Quizzes Q ON U.quiz_id = Q.quiz_id
            WHERE U.user_id = @inputUserId;
            `;
            const request = connection.request();
            request.input('inputUserId', userId);
            const result = await request.query(sqlQuery);
            if (result.recordset.length === 0) {
                return null;
            }
            return result.recordset;
        } catch (error) {
            console.error('Error fetching quiz results:', error);
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    // difference between above and below method is that 
    // top one retrieve 'quiz history'
    // bottom one retrieve the quiz result that was just attempted by user

    static async getUserQuizResult(userId, attemptId) { // TO BE DISPLAYED AT THE END OF THE QUIZ
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `
            SELECT U.attempt_id AS AttemptID, U.user_id AS UserID, U.attempt_date AS AttemptDate, U.score AS Score, 
                   U.time_taken AS TimeTaken, U.passed AS Passed, Q.title AS QuizTitle, Q.description AS QuizDescription, 
                   Q.total_marks AS TotalMarks, Q.total_questions AS TotalQuestions,
                   QR.question_id AS QuestionID, QR.selected_option AS SelectedOption, QNS.correct_option AS CorrectOption, 
                   QNS.question_text AS QuestionText, Users.name AS UserName
            FROM UserQuizAttempts U 
            INNER JOIN Quizzes Q ON U.quiz_id = Q.quiz_id
            INNER JOIN UserResponses QR ON U.attempt_id = QR.attempt_id
            INNER JOIN Questions QNS ON QR.question_id = QNS.question_id
            INNER JOIN Users ON U.user_id = Users.id
            WHERE U.user_id = @inputUserId AND U.attempt_id = @inputAttemptId;
        `;        
            const request = connection.request();
            request.input('inputUserId', userId);
            request.input('inputAttemptId', attemptId);
            const result = await request.query(sqlQuery);
            if (result.recordset.length === 0) {
                return null;
            }
            
            const attemptData = result.recordset[0];
            const userResponses = result.recordset.map(record => ({
                question_id: record.QuestionID,
                question_text: record.QuestionText,
                selected_option: record.SelectedOption,
                correct_option: record.CorrectOption
            }));
                
            return {
                AttemptID: attemptData.AttemptID,
                UserName: attemptData.UserName,
                AttemptDate: attemptData.AttemptDate,
                Score: attemptData.Score,
                TimeTaken: attemptData.TimeTaken,
                TotalQuestions: attemptData.TotalQuestions,
                TotalMarks: attemptData.TotalMarks,
                Passed: attemptData.Passed,
                QuizTitle: attemptData.QuizTitle,
                QuizDescription: attemptData.QuizDescription,
                UserResponses: userResponses
            };
        } catch (error) {
            console.error(error);
            throw new Error("Error fetching user's quiz result");
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }    
   
    static async getAttemptCount(userId) { // show number of attempt to user
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `
            SELECT COUNT(*) AS AttemptCount
            FROM UserQuizAttempts
            WHERE user_id = @userId;
            `;
            const request = connection.request();
            request.input('userId', userId);
            const result = await request.query(sqlQuery);
            if (result.recordset.length === 0) {
                return null;
            }
            return result.recordset[0];
        } catch (error) {
            console.error(error);
            throw new Error("Error fetching quiz with questions");
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    static async saveUserResponse(attemptId, questionId, selectedOption) { // saves the options when user submits the quiz
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `
            INSERT INTO UserResponses (attempt_id, question_id, selected_option)
            VALUES (@attemptId, @questionId, @selectedOption)
            `;
            const request = connection.request();
            request.input('attemptId', attemptId)
            request.input('questionId', questionId)
            request.input('selectedOption', selectedOption);
            const result = await request.query(sqlQuery);
            if (result.rowsAffected[0] === 0) {
                return null;
            }
            return result.rowsAffected[0] > 0;
        } catch (error) {
            console.error('Error saving user response:', error);
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }
    
    static async isCorrectAnswer(questionId, selectedOption) { // when user submits the quiz, checks if the response === to the correct ans
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `                
            SELECT correct_option
            FROM Questions
            WHERE question_id = @questionId`
            ;
            const request = connection.request();
            request.input('questionId', questionId);  
            const result = await request.query(sqlQuery);  
            if (result.recordset.length === 0) {
                return null;
            }
            return result.recordset[0].correct_option === selectedOption;
        } catch (error) {
            console.error('Error checking correct answer:', error);
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }
    
    static async createQuizAttempt(userId, quizId, score, passed, timeTaken) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `
            INSERT INTO UserQuizAttempts
            (user_id, quiz_id, attempt_date, score, passed, time_taken)
            OUTPUT INSERTED.attempt_id
            VALUES (@userId, @quizId, GETDATE(), @score, @passed, @timeTaken)
            `;
            const request = connection.request();
            request.input('userId', userId);
            request.input('quizId', quizId);
            request.input('score', score);
            request.input('passed', passed);
            request.input('timeTaken', timeTaken); // Include timeTaken
            const result = await request.query(sqlQuery);
            return result.recordset[0].attempt_id;
        } catch (error) {
            console.error('Error creating quiz attempt:', error);
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    static async updateQuizAttempt(attemptId, score, passed) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `
            UPDATE UserQuizAttempts
            SET score = @score, passed = @passed
            WHERE attempt_id = @attemptId
            `;
            const request = connection.request();
            request.input('attemptId', attemptId);
            request.input('score', score);
            request.input('passed', passed);
            await request.query(sqlQuery);
        } catch (error) {
            console.error('Error updating quiz attempt:', error);
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    static async deleteUserAttempts (quizId) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `
            DELETE FROM UserQuizAttempts WHERE quiz_id=@inputQuizId
            `;
            const request = connection.request();
            request.input('inputQuizId', quizId);
            const result = await request.query(sqlQuery);
            // if (result.rowsAffected[0] === 0){
            //     return null;
            // }
            return result.rowsAffected[0] > 0; // returns true
        } catch (error) {
            console.error('Error deleting user quiz attempts:', error);
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    static async deleteUserResponsesByQuizId (quizId) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `
            DELETE FROM UserResponses
            WHERE question_id IN (SELECT question_id FROM Questions WHERE quiz_id = @inputQuizId)            
            `;
            const request = connection.request();
            request.input('inputQuizId', quizId);
            const result = await request.query(sqlQuery);
            // if (result.rowsAffected[0] === 0){
            //     return null;
            // }
            return result.rowsAffected[0] > 0; // returns true
        } catch (error) {
            console.error('Error deleting user response:', error);
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    static async deleteIncorrectAnswersByQuizId (quizId) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `
            DELETE FROM IncorrectAnswers
            WHERE question_id IN (SELECT question_id FROM Questions WHERE quiz_id = @inputQuizId)           
            `;
            const request = connection.request();
            request.input('inputQuizId', quizId);
            const result = await request.query(sqlQuery);
            if (result.rowsAffected[0] === 0){
                return null;
            }
            return result.rowsAffected[0] > 0; // returns true
        } catch (error) {
            console.error('Error deleting incorrect answers:', error);
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }
}

module.exports= Quiz;