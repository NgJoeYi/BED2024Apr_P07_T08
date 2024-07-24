const { user } = require("../dbConfig");
const Lectures = require("../models/Lectures");
const multer = require("multer");

// Multer setup for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/**
 * @swagger
 * /lectures:
 *   get:
 *     summary: Get all lectures
 *     tags: [Lectures]
 *     responses:
 *       200:
 *         description: A list of lectures
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Lecture'
 *       500:
 *         description: Error retrieving lectures
 */
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

/**
 * @swagger
 * /lectures/lecture-details/{id}:
 *   get:
 *     summary: Get lecture details by ID
 *     tags: [Lectures]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The lecture ID
 *     responses:
 *       200:
 *         description: Lecture details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lecture'
 *       404:
 *         description: Lecture not found
 *       500:
 *         description: Error retrieving lecture
 */
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

/**
 * @swagger
 * /lectures/{id}:
 *   get:
 *     summary: Get lecture by ID
 *     tags: [Lectures]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The lecture ID
 *     responses:
 *       200:
 *         description: Lecture data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lecture'
 *       404:
 *         description: Lecture not found
 *       500:
 *         description: Error retrieving lecture
 */
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

/**
 * @swagger
 * /lectures/{id}:
 *   delete:
 *     summary: Delete a lecture by ID
 *     tags: [Lectures]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The lecture ID
 *     responses:
 *       204:
 *         description: Lecture successfully deleted
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Lecture not found
 *       500:
 *         description: Error deleting lecture
 */
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

/**
 * @swagger
 * /lectures/{courseID}/{chapterName}:
 *   delete:
 *     summary: Delete a chapter by name
 *     tags: [Lectures]
 *     parameters:
 *       - in: path
 *         name: courseID
 *         schema:
 *           type: integer
 *         required: true
 *         description: The course ID
 *       - in: path
 *         name: chapterName
 *         schema:
 *           type: string
 *         required: true
 *         description: The chapter name
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               lectureIDs:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       204:
 *         description: Chapter successfully deleted
 *       400:
 *         description: Invalid lecture IDs provided
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Chapter not found
 *       500:
 *         description: Error deleting chapter
 */
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

/**
 * @swagger
 * /lectures/{id}:
 *   put:
 *     summary: Update a lecture by ID
 *     tags: [Lectures]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The lecture ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               chapterName:
 *                 type: string
 *               duration:
 *                 type: string
 *               video:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Lecture updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Lecture'
 *                 userID:
 *                   type: integer
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Lecture not found
 *       500:
 *         description: Error updating lecture
 */
// Update a lecture's information, ensuring the user has permission
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
        if (userID != existingLecture.userID) {
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

/**
 * @swagger
 * /lectures/last-chapter:
 *   get:
 *     summary: Get the last chapter name for the logged-in user
 *     tags: [Lectures]
 *     responses:
 *       200:
 *         description: Chapter name retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 chapterName:
 *                   type: string
 *       404:
 *         description: Chapter name not found
 *       500:
 *         description: Error getting chapter name
 */
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

/**
 * @swagger
 * /lectures/max-course-id:
 *   get:
 *     summary: Get the maximum course ID
 *     tags: [Lectures]
 *     responses:
 *       200:
 *         description: Max course ID retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 maxCourseID:
 *                   type: integer
 *       500:
 *         description: Error retrieving max course ID
 */
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

/**
 * @swagger
 * /lectures:
 *   post:
 *     summary: Create a new lecture
 *     tags: [Lectures]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               Title:
 *                 type: string
 *               Duration:
 *                 type: string
 *               Description:
 *                 type: string
 *               ChapterName:
 *                 type: string
 *               CourseID:
 *                 type: integer
 *               Video:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Lecture created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 LectureID:
 *                   type: integer
 *                 Title:
 *                   type: string
 *                 Duration:
 *                   type: string
 *                 Description:
 *                   type: string
 *                 Position:
 *                   type: integer
 *                 ChapterName:
 *                   type: string
 *                 Video:
 *                   type: string
 *       400:
 *         description: UserID or CourseID not provided
 *       500:
 *         description: Error creating lecture
 */
// Create a new lecture
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

/**
 * @swagger
 * /lectures/video/{lectureID}:
 *   get:
 *     summary: Get lecture video by ID
 *     tags: [Lectures]
 *     parameters:
 *       - in: path
 *         name: lectureID
 *         schema:
 *           type: integer
 *         required: true
 *         description: The lecture ID
 *     responses:
 *       200:
 *         description: Video data
 *         content:
 *           video/mp4:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Invalid lecture ID
 *       404:
 *         description: Video not found
 *       500:
 *         description: Internal server error
 */
// So the right lecture video will play according to the lecture
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

/**
 * @swagger
 * /lectures/course/{courseID}:
 *   get:
 *     summary: Get lectures by course ID
 *     tags: [Lectures]
 *     parameters:
 *       - in: path
 *         name: courseID
 *         schema:
 *           type: integer
 *         required: true
 *         description: The course ID
 *     responses:
 *       200:
 *         description: A list of lectures
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Lecture'
 *       400:
 *         description: Invalid course ID
 *       500:
 *         description: Internal server error
 */
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

/**
 * @swagger
 * /lectures/checking:
 *   get:
 *     summary: Check the current logged-in user ID
 *     tags: [Lectures]
 *     responses:
 *       200:
 *         description: Current logged-in user ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userID:
 *                   type: integer
 */
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
