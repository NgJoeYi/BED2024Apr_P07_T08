// models/Discussion.js
const sql = require('mssql');
const dbConfig = require('../dbConfig');

class Discussion {
    constructor(id, title, description, category, posted_date) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.category = category;
        this.posted_date = posted_date;
    }

    static async create(discussionData) {
        try {
            const pool = await sql.connect(dbConfig);
            const result = await pool.request()
                .input('title', sql.NVarChar, discussionData.title)
                .input('description', sql.NVarChar, discussionData.description)
                .input('category', sql.NVarChar, discussionData.category)
                .input('posted_date', sql.DateTime, discussionData.posted_date)
                .query(`
                    INSERT INTO Discussions (title, description, category, posted_date)
                    VALUES (@title, @description, @category, @posted_date);
                    SELECT SCOPE_IDENTITY() AS id;
                `);
            return { id: result.recordset[0].id, ...discussionData };
        } catch (error) {
            console.error('Error creating discussion:', error);
            throw error;
        }
    }

    static async getAll() {
        try {
            const pool = await sql.connect(dbConfig);
            const result = await pool.request().query('SELECT * FROM Discussions');
            return result.recordset;
        } catch (error) {
            console.error('Error retrieving discussions:', error);
            throw error;
        }
    }

    static async getById(id) {
        try {
            const pool = await sql.connect(dbConfig);
            const result = await pool.request()
                .input('id', sql.Int, id)
                .query('SELECT * FROM Discussions WHERE id = @id');
            return result.recordset[0];
        } catch (error) {
            console.error('Error retrieving discussion:', error);
            throw error;
        }
    }

    static async update(id, updatedData) {
        try {
            const pool = await sql.connect(dbConfig);
            await pool.request()
                .input('id', sql.Int, id)
                .input('title', sql.NVarChar, updatedData.title)
                .input('description', sql.NVarChar, updatedData.description)
                .input('category', sql.NVarChar, updatedData.category)
                .input('posted_date', sql.DateTime, updatedData.posted_date)
                .query(`
                    UPDATE Discussions SET 
                    title = @title, 
                    description = @description, 
                    category = @category, 
                    posted_date = @posted_date 
                    WHERE id = @id
                `);
        } catch (error) {
            console.error('Error updating discussion:', error);
            throw error;
        }
    }

    static async delete(id) {
        try {
            const pool = await sql.connect(dbConfig);
            await pool.request()
                .input('id', sql.Int, id)
                .query('DELETE FROM Discussions WHERE id = @id');
        } catch (error) {
            console.error('Error deleting discussion:', error);
            throw error;
        }
    }
}

module.exports = Discussion;
