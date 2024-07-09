const Lectures = require("../models/Lectures");

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

const deletingChapterName = async (req, res) => {
    const { courseID, chapterName } = req.params;
    try {
        const success = await Lectures.deletingChapterName(courseID, chapterName);
        if (!success) {
            return res.status(404).send("Chapter not found");
        }
        res.status(204).send("Lectures successfully deleted");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error deleting lectures");
    }
}

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
    const { Title, Duration, Description, ChapterName, UserID, CourseID } = req.body;
    const userID = req.user.id;
    console.log('USER ID :',userID);
    console.log('UserID from request body:', UserID); 
    console.log('CourseID from request body:', CourseID); 

    if (!UserID) {
        console.error("UserID not provided");
        return res.status(400).send("UserID not provided");
    }

    if (!CourseID) {
        console.error("CourseID not provided");
        return res.status(400).send("CourseID not provided");
    }

    const video = req.files.Video[0].buffer;
    const lectureImage = req.files.LectureImage[0].buffer;

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
 
const getLectureVideoByID = async (req, res) => {
    const lectureID = parseInt(req.params.lectureID, 10);
    console.log(`Received lectureID: ${req.params.lectureID}`);
    console.log(`Parsed lectureID: ${lectureID}`);

    if (isNaN(lectureID)) {
        console.error('Invalid lectureID:', req.params.lectureID);
        return res.status(400).send('Invalid lecture ID');
    }

    try {
        console.log(`Fetching video for lecture ID: ${lectureID}`);
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
    getLectureByID
};
