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
            SELECT SCOPE_IDENTITY AS quiz_id
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
            return await getQuizById(result.recordset[0].quiz_id);
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

    // static async getAllQuiz() {
    //     let connection;
    //     try {
    //         connection = await sql.connect(dbConfig);
    //         const sqlQuery = `
    //         SELECT * FROM Quizzes
    //         `;
    //         const request = connection.request();
    //         const result = await request.query(sqlQuery);
    //         if (result.recordset.length === 0) {
    //             return null;
    //         }
    //         return result.recordset.map(quiz => new Quiz(quiz.quiz_id , quiz.title, quiz.description, quiz.total_questions, quiz.total_marks, quiz.created_by));
    //     } catch (error) {
    //         console.error('Error retrieving quizzes:', error);
    //         throw error;
    //     } finally {
    //         if (connection) {
    //             await connection.close();
    //         }
    //     }
    // }

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
            total_marks=@inputTotal_marks, created_by=@inputCreated_by, quizImg=@inputQuizImg
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

    static async getQuizWithQuestions(quizId) {
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
                    question_id: row.question_id,
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


    // ----------------------------------- START OF MY CODE FOR USER QUIZ RESULTS RELATED


    // static async getUserQuizResult(userId, attemptId) {
    //     let connection;
    //     try {
    //         connection = await sql.connect(dbConfig);
    //         const sqlQuery = `
    //         SELECT U.attempt_id AS AttemptID, U.user_id AS UserID, U.attempt_date AS AttemptDate, U.score AS Score, U.time_taken AS TimeTaken, U.total_questions AS TotalQuestions, 
    //         U.total_marks AS TotalMarks, U.passed AS Passed, Q.title AS QuizTitle, Q.description AS QuizDescription
    //         FROM UserQuizAttempts U INNER JOIN quizzes Q ON U.quiz_id = Q.quiz_id
    //         WHERE U.user_id=@inputUserId AND U.attempt_id=@inputAttemptId;
    //         `;
    //         const request = connection.request();
    //         request.input('inputUserId', userId);
    //         request.input('inputAttemptId', attemptId);
    //         const result = await request.query(sqlQuery);
    //         if (result.recordset.length === 0) {
    //             return null;
    //         }
    //         return result.recordset.map(record => ({
    //             AttemptID: record.AttemptID,
    //             UserID: record.UserID,
    //             AttemptDate: record.AttemptDate,
    //             Score: record.Score,
    //             TimeTaken: record.TimeTaken,
    //             TotalQuestions: record.TotalQuestions,
    //             TotalMarks: record.TotalMarks,
    //             Passed: record.Passed,
    //             QuizTitle: record.QuizTitle,
    //             QuizDescription: record.QuizDescription
    //         }));
    //     } catch (error) {
    //         console.error(error);
    //         throw new Error("Error fetching quiz with questions");
    //     } finally {
    //         if (connection) {
    //             await connection.close();
    //         }
    //     }
    // }

// this block doesnt show the incorrect ans js the results
    // static async getUserQuizResult(userId, attemptId) {
    //     let connection;
    //     try {
    //         connection = await sql.connect(dbConfig);
    //         const sqlQuery = `
    //         SELECT U.attempt_id AS AttemptID, U.user_id AS UserID, U.attempt_date AS AttemptDate, U.score AS Score, 
    //                U.time_taken AS TimeTaken, U.total_questions AS TotalQuestions, U.total_marks AS TotalMarks, 
    //                U.passed AS Passed, Q.title AS QuizTitle, Q.description AS QuizDescription
    //         FROM UserQuizAttempts U 
    //         INNER JOIN Quizzes Q ON U.quiz_id = Q.quiz_id
    //         WHERE U.user_id = @inputUserId AND U.attempt_id = @inputAttemptId;
    //         `;
    //         const request = connection.request();
    //         request.input('inputUserId', userId);
    //         request.input('inputAttemptId', attemptId);
    //         const result = await request.query(sqlQuery);
    //         if (result.recordset.length === 0) {
    //             return null;
    //         }
    //         return result.recordset[0]; // returning the first record instead of mapping
    //     } catch (error) {
    //         console.error(error);
    //         throw new Error("Error fetching user's quiz result");
    //     } finally {
    //         if (connection) {
    //             await connection.close();
    //         }
    //     }
    // }

    static async getUserQuizResult(userId, attemptId) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `
            SELECT U.attempt_id AS AttemptID, U.user_id AS UserID, U.attempt_date AS AttemptDate, U.score AS Score, 
                   U.time_taken AS TimeTaken, U.total_questions AS TotalQuestions, U.total_marks AS TotalMarks, 
                   U.passed AS Passed, Q.title AS QuizTitle, Q.description AS QuizDescription,
                   QR.question_id AS QuestionID, QR.selected_option AS SelectedOption, 
                   QNS.correct_option AS CorrectOption, QNS.question_text AS QuestionText
            FROM UserQuizAttempts U 
            INNER JOIN Quizzes Q ON U.quiz_id = Q.quiz_id
            INNER JOIN UserResponses QR ON U.attempt_id = QR.attempt_id
            INNER JOIN Questions QNS ON QR.question_id = QNS.question_id
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
                UserID: attemptData.UserID,
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
   
    static async getAttemptCount(userId) {
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





    static async saveUserResponse(attemptId, questionId, selectedOption) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const request = connection.request();
            request.input('attemptId', sql.Int, attemptId)
                   .input('questionId', sql.Int, questionId)
                   .input('selectedOption', sql.NVarChar, selectedOption);
    
            await request.query(`
                INSERT INTO UserResponses (attempt_id, question_id, selected_option)
                VALUES (@attemptId, @questionId, @selectedOption)
            `);
        } catch (error) {
            console.error('Error saving user response:', error);
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }
    
    
    static async isCorrectAnswer(questionId, selectedOption) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const request = connection.request();
            request.input('questionId', sql.Int, questionId);
    
            const result = await request.query(`
                SELECT correct_option
                FROM Questions
                WHERE question_id = @questionId
            `);
    
            if (result.recordset.length > 0) {
                return result.recordset[0].correct_option === selectedOption;
            }
            return false;
        } catch (error) {
            console.error('Error checking correct answer:', error);
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }
    
    static async createQuizAttempt(userId, quizId, totalQuestions, totalMarks, score, passed) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const request = connection.request();
            request.input('userId', sql.Int, userId)
                   .input('quizId', sql.Int, quizId)
                   .input('totalQuestions', sql.Int, totalQuestions)
                   .input('totalMarks', sql.Int, totalMarks)
                   .input('score', sql.Int, score)
                   .input('passed', sql.Bit, passed);
    
            const result = await request.query(`
                INSERT INTO UserQuizAttempts (user_id, quiz_id, attempt_date, total_questions, total_marks, score, passed)
                OUTPUT INSERTED.attempt_id
                VALUES (@userId, @quizId, GETDATE(), @totalQuestions, @totalMarks, @score, @passed)
            `);
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
    
    static async updateQuizAttempt(attemptId, totalQuestions, totalMarks, score, passed) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const request = connection.request();
            request.input('attemptId', sql.Int, attemptId)
                   .input('totalQuestions', sql.Int, totalQuestions)
                   .input('totalMarks', sql.Int, totalMarks)
                   .input('score', sql.Int, score)
                   .input('passed', sql.Bit, passed);
    
            await request.query(`
                UPDATE UserQuizAttempts
                SET total_questions = @totalQuestions, total_marks = @totalMarks, score = @score, passed = @passed
                WHERE attempt_id = @attemptId
            `);
        } catch (error) {
            console.error('Error updating quiz attempt:', error);
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }
    
    
    



    // static async createQuizAttempt(userId, quizId, responses) {
    //     let connection;
    //     try {
    //         connection = await sql.connect(dbConfig);
    //         const transaction = new sql.Transaction(connection);

    //         await transaction.begin();

    //         const request = new sql.Request(transaction);
    //         request.input('userId', userId);
    //         request.input('quizId', quizId);

    //         // Insert into UserQuizAttempts
    //         const result = await request.query(`
    //             INSERT INTO UserQuizAttempts (user_id, quiz_id, attempt_date, total_questions, total_marks, score, time_taken, passed)
    //             OUTPUT INSERTED.attempt_id
    //             VALUES (@userId, @quizId, GETDATE(), 0, 0, 0, 0, 0);
    //         `);
    //         const attemptId = result.recordset[0].attempt_id;

    //         // Insert into UserResponses
    //         for (const response of responses) {
    //             await request.input('attemptId', attemptId);
    //             await request.input('questionId', response.question_id);
    //             await request.input('selectedOption', response.selected_option);
    //             await request.query(`
    //                 INSERT INTO UserResponses (attempt_id, question_id, selected_option)
    //                 VALUES (@attemptId, @questionId, @selectedOption);
    //             `);
    //         }

    //         await transaction.commit();
    //         return attemptId;
    //     } catch (error) {
    //         if (transaction) await transaction.rollback();
    //         console.error('Error creating quiz attempt:', error);
    //         throw error;
    //     } finally {
    //         if (connection) {
    //             await connection.close();
    //         }
    //     }
    // }





}

module.exports= Quiz;