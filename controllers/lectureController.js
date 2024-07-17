const { user } = require("../dbConfig");
const Lectures = require("../models/Lectures");
const multer = require("multer");

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

const deleteLecture = async (req, res) => {
    const lectureID = parseInt(req.params.id);
    const userID = req.user.id;
    try {
        const lecture = await Lectures.getLectureByID(lectureID);
        if (!lecture) {
          return res.status(404).json({ message: "Lecture not found" });
        }
        // Check if the user is the creator of the lecture
        if (lecture.userID !== userID) {
            return res.status(403).send({ message: "You do not have permission to delete this lecture teehee" });
        }

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

const deletingChapterName = async (req, res) => {
    const { courseID, chapterName } = req.params;
    const { lectureIDs } = req.body;
    const userID = req.user.id;

    if (!Array.isArray(lectureIDs) || lectureIDs.length === 0) {
        return res.status(400).json({ message: "Invalid lecture IDs provided" });
    }

    try {
        // Ensure all lectures belong to the same user
        for (const lectureID of lectureIDs) {
            const lecture = await Lectures.getLectureByID(lectureID);
            if (!lecture) {
                return res.status(404).json({ message: `Lecture with ID ${lectureID} not found` });
            }
            if (lecture.userID !== userID) {
                return res.status(403).send({ message: "You do not have permission to delete this chapter." });
            }
        }

        const success = await Lectures.deletingChapterName(courseID, chapterName, lectureIDs);
        if (!success) {
            return res.status(404).send("Chapter not found");
        }
        res.status(204).send("Chapter successfully deleted");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error deleting chapter");
    }
};


const updateLecture = async (req, res) => {
    const userID = req.user.id; // user id that logged on now 
    // lecture id 
    const id = req.params.id;
    const { title, description, chapterName, duration } = req.body;
    let video = req.file ? req.file.buffer : null;
    const existingLecture = await Lectures.getLectureByID(id);

    if (!video) {
        try {
            if (existingLecture && existingLecture.video) {
                video = existingLecture.video;
            }
        } catch (error) {
            console.error('Error fetching existing lecture video:', error);
            return res.status(500).send('Error fetching existing lecture video');
        }
    }

    const newLectureData = {
        Title: title,
        Description: description,
        ChapterName: chapterName,
        Duration: duration,
        Video: video
    };
    try {
        if(userID != existingLecture.userID){
            return res.status(403).send('You do not have permission to edit the lecture');
        }
        const updateResult = await Lectures.updateLecture(id, newLectureData);
        if (!updateResult) {
            return res.status(404).send('Lecture not found!');
        }
        res.json({ message: 'Lecture updated successfully', data: updateResult, userID : userID });
    } catch (error) {
        console.error('Error updating lecture:', error);
        res.status(500).send('Error updating lecture');
    }
};

const getLastChapterName = async (req, res) => {
    const userID = req.user.id;
    try {
        const chapterName = await Lectures.getLastChapterName(userID);
        if (!chapterName) {
            return res.status(404).send('Chapter name not found');
        }
        res.status(200).json({ chapterName: chapterName });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error getting chapter name');
    }
};
const getMaxCourseID = async (req, res) => {
    try {
        const maxCourseID = await Lectures.getMaxCourseID();
        res.status(200).json({ maxCourseID });
    } catch (error) {
        console.error('Error retrieving max CourseID:', error);
        res.status(500).send('Error retrieving max CourseID');
    }
};

const createLecture = async (req, res) => {
    const { Title, Duration, Description, ChapterName, CourseID } = req.body;
    const UserID = req.user.id;

    if (!UserID) {
        console.error("UserID not provided");
        return res.status(400).send("UserID not provided");
    }
    if (!CourseID) {
        console.error("CourseID not provided");
        return res.status(400).send("CourseID not provided");
    }

    const video = req.files.Video[0].buffer;

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
        }
        const newLectureID = await Lectures.createLecture(UserID, newLectureData);
        res.status(201).json({ LectureID: newLectureID, ...newLectureData });
    } catch (error) {
        console.error('Error creating lecture:', error);
        res.status(500).send('Error creating lecture');
    }
};

 
const getLectureVideoByID = async (req, res) => {
    const lectureID = parseInt(req.params.lectureID, 10);

    if (isNaN(lectureID)) {
        console.error('Invalid lectureID:', req.params.lectureID);
        return res.status(400).send('Invalid lecture ID');
    }

    try {
        const videoData = await Lectures.getLectureVideoByID(lectureID);
        if (videoData) {
            res.writeHead(200, {
                'Content-Type': 'video/mp4', // Adjust MIME type as needed
                'Content-Length': videoData.length
            });
            res.end(videoData);
        } else {
            res.status(404).send('Video not found');
        }
    } catch (error) {
        console.error('Error serving video:', error);
        res.status(500).send('Internal server error');
    }
};

const getLecturesByCourseID = async (req, res) => {
    const courseID = parseInt(req.params.courseID);
    console.log(`Received courseID: ${courseID}`);

    if (isNaN(courseID)) {
        console.error('Invalid courseID:', courseID);
        return res.status(400).send('Invalid course ID');
    }

    try {
        console.log(`Fetching lectures for course ID: ${courseID}`);
        const lectures = await Lectures.getLecturesByCourseID(courseID);
        res.json(lectures);
    } catch (error) {
        console.error('Error fetching lectures:', error);
        res.status(500).send('Internal server error');
    }
};

const checkingUserID = async (req, res) => {
    const userID = req.user.id;
    console.log('Current logged-in user ID:', userID);
    res.json({ userID });
};


module.exports = {
    getAllLectures,
    updateLecture,
    createLecture,
    deleteLecture,
    deletingChapterName,
    getLastChapterName,
    getLectureVideoByID,
    getLecturesByCourseID,
    getMaxCourseID,
    getLectureByID,
    checkingUserID
};
