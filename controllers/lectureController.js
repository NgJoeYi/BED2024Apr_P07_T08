const Lectures = require("../models/Lectures");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sql = require("mssql");
const dbConfig = require('../dbConfig');

// Multer setup for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const getAllLectures = async (req, res) => {
    try {
        const getAllLectures = await Lectures.getAllLectures();
        res.json(getAllLectures);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving lectures');
    }
};

const getLectureByID = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const lecture = await Lectures.getLectureByID(id);
        if (!lecture) {
            return res.status(404).send('Lecture not found!');
        }
        res.json(lecture);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving lecture");
    }
};

const updateLecture = async (req, res) => {
    const id = parseInt(req.params.id);
    const newLectureData = req.body;
    try {
        const updateLecture = await Lectures.updateLecture(id, newLectureData);
        if (!updateLecture) {
            return res.status(404).send('Lecture not found!');
        }
        res.json(updateLecture);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error updating lecture");
    }
};

const createLecture = async (req, res) => {
    const { Title, Duration, Description, Position, ChapterName } = req.body;
    const video = req.files.Video[0].buffer;
    const lectureImage = req.files.LectureImage[0].buffer;
    const LecturerID = req.session.user?.LecturerID;

    console.log('Session user:', req.session.user); // Log session user details

    if (!LecturerID) {
        console.error("LecturerID not found in session");
        return res.status(400).send("LecturerID not found in session");
    }

    const CourseID = 1; // Placeholder for CourseID

    const sqlQuery = `
        INSERT INTO Lectures (CourseID, LecturerID, Title, Duration, Description, Position, ChapterName, Video, LectureImage)
        VALUES (@CourseID, @LecturerID, @Title, @Duration, @Description, @Position, @ChapterName, @Video, @LectureImage);
        SELECT SCOPE_IDENTITY() AS LectureID;
    `;

    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const request = connection.request();
        request.input('CourseID', sql.Int, CourseID);
        request.input('LecturerID', sql.Int, LecturerID);
        request.input('Title', sql.NVarChar, Title);
        request.input('Duration', sql.Int, Duration);
        request.input('Description', sql.NVarChar, Description);
        request.input('Position', sql.Int, Position);
        request.input('ChapterName', sql.NVarChar, ChapterName);
        request.input('Video', sql.VarBinary, video);
        request.input('LectureImage', sql.VarBinary, lectureImage);

        const result = await request.query(sqlQuery);
        const newLectureID = result.recordset[0].LectureID;

        res.status(201).json({ LectureID: newLectureID, CourseID, LecturerID, Title, Duration, Description, Position, ChapterName });
    } catch (error) {
        console.error('Error creating lecture:', error);
        res.status(500).send('Error creating lecture');
    } finally {
        if (connection) {
            await connection.close();
        }
    }
};

const deleteLecture = async (req, res) => {
    const lectureID = parseInt(req.params.id);
    try {
        const success = await Lectures.deleteLecture(lectureID);
        if (!success) {
            return res.status(404).send("Lecture not found");
        }
        res.status(204).send("Lecture successfully deleted");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error deleting lecture");
    }
};

const getLastChapterName = async (req, res) => {
    try {
        console.log("Received request for /lectures/last-chapter");
        const lastChapterName = await Lectures.getLastChapterName();
        if (!lastChapterName) {
            console.log("No last chapter name found");
            return res.status(404).send('No last chapter name found');
        }
        console.log("Last chapter name retrieved:", lastChapterName);
        res.status(200).json({ chapterName: lastChapterName });
    } catch (error) {
        console.error('Error fetching last chapter name:', error);
        res.status(500).send('Error fetching last chapter name');
    }
};

module.exports = {
    getAllLectures,
    getLectureByID,
    updateLecture,
    createLecture,
    deleteLecture,
    getLastChapterName,
    upload
};
