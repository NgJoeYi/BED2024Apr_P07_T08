const Lectures = require("../models/Lectures");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

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
    const { ChapterName, Title, Duration, Description } = req.body;
    console.log('Request Body:', req.body); // Log the request body
    const videoFile = req.files.find(file => file.fieldname === 'videoFiles');
    const lectureImage = req.files.find(file => file.fieldname === 'lectureImage');

    try {
        // Validate required fields
        if (!Title) {
            throw new Error('Title is required');
        }

        const newLectureData = {
            ChapterName,
            Title,
            Duration: parseInt(Duration),
            Description,
            VideoURL: '',
            Video: videoFile ? videoFile.buffer : null,
            LectureImage: lectureImage ? lectureImage.buffer : null,
            Position: 1
        };

        console.log('New Lecture Data:', newLectureData); // Log the new lecture data

        const newLectureID = await Lectures.createLecture(newLectureData);
        res.status(201).json({ newLectureID, ...newLectureData });
    } catch (error) {
        console.error("Error creating lecture:", error);
        res.status(500).send("Error creating lecture");
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

module.exports = {
    getAllLectures,
    getLectureByID,
    updateLecture,
    createLecture,
    deleteLecture,
    upload
};
