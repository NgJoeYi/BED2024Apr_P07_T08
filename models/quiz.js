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
}

module.exports= Quiz;