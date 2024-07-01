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
    const lecturerID = parseInt(req.params.id);
    try {
        const chapterName = await Lectures.getLastChapterName(lecturerID);
        if (!chapterName) {
            return res.status(404).send('Chapter name not found');
        }
        res.status(200).json({ chapterName: chapterName });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error getting chapter name');
    }
};

const createLecture = async (req, res) => {
    const { Title, Duration, Description, ChapterName, UserID } = req.body;
    console.log('UserID from request body:', UserID); // Log the UserID from the request body

    if (!UserID) {
        console.error("UserID not provided");
        return res.status(400).send("UserID not provided");
    }

    const video = req.files.Video[0].buffer;
    const lectureImage = req.files.LectureImage[0].buffer;
    const CourseID = 1; // Placeholder for CourseID

    try {
        const Position = await Lectures.getCurrentPositionInChapter(ChapterName);

        const newLectureData = {
            CourseID,
            UserID,
            Title,
            Duration,
            Description,
            Position,
            ChapterName,
            Video: video,
            LectureImage: lectureImage
        };

        const newLectureID = await Lectures.createLecture(newLectureData);
        res.status(201).json({ LectureID: newLectureID, ...newLectureData });
    } catch (error) {
        console.error('Error creating lecture:', error);
        res.status(500).send('Error creating lecture');
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
