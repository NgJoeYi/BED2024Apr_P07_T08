const { user } = require("../dbConfig");
const Lectures = require("../models/Lectures");
const multer = require("multer");
const path = require('path');
const fs = require('fs'); 

// Multer setup for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Retrieve and display all lectures
const getAllLectures = async (req, res) => {
    try {
        const getAllLectures = await Lectures.getAllLectures();
        res.json(getAllLectures);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving lectures');
    }
};

const getLectureDetails = async (req, res) => {
    const id = req.params.id;
    try {
        const lectureDetails = await Lectures.getLectureDetails(id);
        if (!lectureDetails) {
            return res.status(404).send('Lecture not found');
        }
        res.json(lectureDetails);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving lecture');
    }
};

// Retrieve a specific lecture by ID
const getLectureByID = async (req, res) => {
    const id = req.params.id;
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

// Delete a specific lecture by ID, ensuring the user has permission
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

// Delete a chapter by its name, ensuring the user has permission
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

// Update a lecture's information, ensuring the user has permission
const updateLecture = async (req, res) => {
    const userID = req.user.id;
    const id = req.params.id;
    const { title, description, chapterName, duration } = req.body;
    
    let videoFilename = null;

    // Handle new video file if uploaded
    if (req.file) {
        // Check if req.file is correctly populated
        console.log('Uploaded file:', req.file);

        if (!req.file.buffer) {
            console.error('No video data found in req.file.buffer');
            return res.status(400).send('Invalid video file');
        }

        // Generate a unique filename for the video
        videoFilename = `${uuid.v4()}_${req.file.originalname}`;
        const videoPath = path.resolve(__dirname, '..', 'public', 'lectureVideos', videoFilename);

        try {
            // Write the file to the filesystem
            await fs.promises.writeFile(videoPath, req.file.buffer);
        } catch (err) {
            console.error('Error saving video file:', err);
            return res.status(500).send('Error saving video file');
        }
    }

    const existingLecture = await Lectures.getLectureByID(id);

    if (!videoFilename) {
        videoFilename = existingLecture ? existingLecture.video : null;
    }

    const newLectureData = {
        Title: title,
        Description: description,
        ChapterName: chapterName,
        Duration: duration,
        Video: videoFilename
    };

    try {
        if (userID !== existingLecture.userID) {
            return res.status(403).send('You do not have permission to edit the lecture');
        }

        const updateResult = await Lectures.updateLecture(id, newLectureData);
        if (!updateResult) {
            return res.status(404).send('Lecture not found!');
        }

        res.json({ message: 'Lecture updated successfully', data: updateResult, userID: userID });
    } catch (error) {
        console.error('Error updating lecture:', error);
        res.status(500).send('Error updating lecture');
    }
};




// Retrieve the name of the last chapter for the current user, so user can add multiple lecture under chapter
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

// Retrieve the maximum course ID from the database, so we can create new courseID 
const getMaxCourseID = async (req, res) => {
    try {
        const maxCourseID = await Lectures.getMaxCourseID();
        res.status(200).json({ maxCourseID });
    } catch (error) {
        console.error('Error retrieving max CourseID:', error);
        res.status(500).send('Error retrieving max CourseID');
    }
};

// Create a new lecture
const createLecture = async (req, res) => {
    const { title, duration, description, chapterName, courseID } = req.body;
    const userID = req.user.id;

    if (!userID) {
        console.error("UserID not provided");
        return res.status(400).send("UserID not provided");
    }
    if (!courseID) {
        console.error("CourseID not provided");
        return res.status(400).send("CourseID not provided");
    }

    if (!req.file) {
        console.error("Video not provided");
        return res.status(400).send("Video not provided");
    }

    const videoFilename = req.file.filename;

    try {
        const position = await Lectures.getCurrentPositionInChapter(chapterName);

        const newLectureData = {
            courseID: parseInt(courseID), // Ensure courseID is an integer
            userID,
            title,
            duration: parseInt(duration), // Ensure duration is an integer
            description,
            position,
            chapterName,
            video: videoFilename, // Only the filename is saved
        };

        console.log('NEW LECTURE DATA:', newLectureData);

        const newLectureID = await Lectures.createLecture(newLectureData);
        res.status(201).json({ LectureID: newLectureID, ...newLectureData });
    } catch (error) {
        console.error('Error creating lecture:', error);
        res.status(500).send('Error creating lecture');
    }
};

// So the right lecture video will play according to the lecture
const getLectureVideoByID = async (req, res) => {
    const lectureID = parseInt(req.params.lectureID, 10);

    if (isNaN(lectureID)) {
        console.error('Invalid lectureID:', req.params.lectureID);
        return res.status(400).send('Invalid lecture ID');
    }

    try {
        const videoFilename = await Lectures.getLectureVideoByID(lectureID);
        if (videoFilename) {
            // Construct the full path to the video file
            const videoPath = path.resolve(__dirname, '..', 'public', 'lectureVideos', videoFilename);

            fs.access(videoPath, fs.constants.F_OK, (err) => {
                if (err) {
                    console.error('File does not exist:', videoPath);
                    alert('file not found');
                    return res.status(404).send('Video not found');
                }

                res.sendFile(videoPath, (err) => {
                    if (err) {
                        console.error('Error sending video file:', err);
                        res.status(500).send('Error serving video');
                    }
                });
            });
        } else {
            res.status(404).send('Video not found');
        }
    } catch (error) {
        console.error('Error serving video:', error);
        res.status(500).send('Internal server error');
    }
};



// When user press into course the lectures under it will show
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
    getLectureDetails,
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
