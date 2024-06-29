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
    const { ChapterName, Title, Duration, Description } = req.body;
    console.log('Request Body:', req.body); // Log the request body
    console.log('Files:', req.files); // Log the files to debug

    // Ensure videoFile and lectureImage are being extracted correctly
    const videoFile = req.files['Video'] ? req.files['Video'][0] : null;
    const lectureImage = req.files['LectureImage'] ? req.files['LectureImage'][0] : null;

    let videoBuffer = null;
    let imageBuffer = null;

    if (videoFile) {
        const videoFilePath = path.join(__dirname, '../uploads', videoFile.originalname);
        fs.writeFileSync(videoFilePath, videoFile.buffer);
        videoBuffer = fs.readFileSync(videoFilePath);
    }

    if (lectureImage) {
        const lectureImagePath = path.join(__dirname, '../uploads', lectureImage.originalname);
        fs.writeFileSync(lectureImagePath, lectureImage.buffer);
        imageBuffer = fs.readFileSync(lectureImagePath);
    }

    console.log('Video Buffer:', videoBuffer); // Log the video buffer to debug
    console.log('Image Buffer:', imageBuffer); // Log the image buffer to debug

    try {
        // Validate required fields
        if (!Title) {
            throw new Error('Title is required');
        }

        // Get the current position in the chapter, using the last chapter name if necessary
        let chapterNameToUse = ChapterName;
        if (!ChapterName) {
            chapterNameToUse = await Lectures.getLastChapterName();
        }
        const position = await Lectures.getCurrentPositionInChapter(chapterNameToUse);

        // Get the LecturerID from the session
        const lecturerID = req.session.lecturerID;
        if (!lecturerID) {
            throw new Error('Lecturer not logged in');
        }
  
        const newLectureData = {
            CourseID: 1, // Default value for demonstration
            LecturerID: lecturerID,
            ChapterName: chapterNameToUse,
            Title,
            Duration: parseInt(Duration),
            Description,
            VideoURL: '', // Assuming this is part of your logic to add video URL
            Video: videoBuffer,
            LectureImage: imageBuffer,
            Position: position
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
