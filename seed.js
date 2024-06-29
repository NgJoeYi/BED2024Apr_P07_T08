const sql = require("mssql");
const dbConfig = require("./dbConfig");
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
async function run() {
    try {
        // Connect to the database
        const connection = await sql.connect(dbConfig);

        // Remove foreign keys
        const removeForeignKeys = `
        DECLARE @sqlf NVARCHAR(MAX) = (
            SELECT 'ALTER TABLE ' + QUOTENAME(SCHEMA_NAME(schema_id)) + '.' +
                   QUOTENAME(OBJECT_NAME(parent_object_id)) +
                   ' DROP CONSTRAINT ' + QUOTENAME(name) + ';'
            FROM sys.foreign_keys
            FOR XML PATH('')
        );
        EXEC sp_executesql @sqlf;
        `;
        await connection.request().query(removeForeignKeys);

        // Drop all tables
        const dropTables = `
        DECLARE @sql NVARCHAR(MAX) = '';
        SELECT @sql += ' DROP TABLE ' + QUOTENAME(TABLE_SCHEMA) + '.' + QUOTENAME(TABLE_NAME) + ';'
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_TYPE = 'BASE TABLE';
        EXEC sp_executesql @sql;
        `;
        await connection.request().query(dropTables);

        // Create Users table
        const createUsersTable = `
        CREATE TABLE Users (
            id INT PRIMARY KEY IDENTITY,
            name VARCHAR(50) NOT NULL,
            dob DATE NOT NULL,
            email VARCHAR(100) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(8) CHECK (role IN ('student', 'lecturer'))
        );
        `;
        await connection.request().query(createUsersTable);
        
        // Create other tables
        const createTables = `
        CREATE TABLE ProfilePic (
            pic_id INT PRIMARY KEY IDENTITY,
            user_id INT NOT NULL UNIQUE,
            img VARCHAR(MAX) NOT NULL,
            FOREIGN KEY (user_id) REFERENCES Users(id)
        );

        CREATE TABLE Discussions (
            id INT PRIMARY KEY IDENTITY(1,1),
            title NVARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            category NVARCHAR(50) NOT NULL,
            posted_date DATETIME DEFAULT GETDATE(),
            user_id INT NOT NULL,
            likes INT DEFAULT 0,
            dislikes INT DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES Users(id)
        );

        CREATE TABLE user_comments (
            id INT IDENTITY(1,1) PRIMARY KEY,
            user_id INT NOT NULL,
            content TEXT NOT NULL,
            created_at DATETIME DEFAULT GETDATE(),
            discussion_id INT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES Users(id),
            FOREIGN KEY (discussion_id) REFERENCES Discussions(id)
        );

        CREATE TABLE Lecturer (
            LecturerID INT PRIMARY KEY IDENTITY(1,1),
            UserID INT FOREIGN KEY REFERENCES Users(id),
            ProfilePicture VARBINARY(MAX),
            CreatedAt DATETIME DEFAULT GETDATE()
        );

        CREATE TABLE Courses (
            CourseID INT PRIMARY KEY IDENTITY(1,1),
            LecturerID INT FOREIGN KEY REFERENCES Lecturer(LecturerID),
            Title NVARCHAR(200) NOT NULL,
            Description NVARCHAR(2000),
            Category NVARCHAR(100),
            Level NVARCHAR(50),
            Duration INT, -- Duration in minutes
            CreatedAt DATETIME DEFAULT GETDATE(),
            CourseImage VARBINARY(MAX)
        );

        CREATE TABLE Lectures (
            CourseID INT FOREIGN KEY REFERENCES Courses(CourseID),
            LecturerID INT FOREIGN KEY REFERENCES Lecturer(LecturerID),
            Title NVARCHAR(200) NOT NULL,
            Description NVARCHAR(2000),
            VideoURL NVARCHAR(256),
            Video VARBINARY(MAX),
            LectureImage VARBINARY(MAX),
            Duration INT, -- Duration in minutes
            Position INT, -- Position in the course sequence
            CreatedAt DATETIME DEFAULT GETDATE(),
            ChapterName NVARCHAR(256)
        );

        CREATE TABLE user_reviews (
            review_id INT PRIMARY KEY IDENTITY,
            user_id INT NOT NULL,
            review_text TEXT NOT NULL,
            rating INT CHECK (rating >= 1 AND rating <= 5),
            review_date DATETIME DEFAULT GETDATE(),
            FOREIGN KEY (user_id) REFERENCES Users(id)
        );
        `;
        await connection.request().query(createTables);

        // Insert data into Users table with hashed passwords
        const users = [
            { name: 'John Doe', dob: '1990-01-01', email: 'john_doe@example.com', password: 'password123', role: 'student' },
            { name: 'Jane Smith', dob: '1985-02-02', email: 'jane_smith@example.com', password: 'password456', role: 'lecturer' },
            { name: 'Alice Jones', dob: '1992-03-03', email: 'alice_jones@example.com', password: 'password789', role: 'student' },
            { name: 'Bob Brown', dob: '1988-04-04', email: 'bob_brown@example.com', password: 'password000', role: 'lecturer' },
            { name: 'Carol White', dob: '1995-05-05', email: 'carol_white@example.com', password: 'password111', role: 'student' },
            { name: 'Alison Johnson', dob: '1990-01-15', email: 'alice.johnson@example.com', password: 'password222', role: 'student' },
            { name: 'Bob Pink', dob: '1985-03-22', email: 'bob.pink@example.com', password: 'password333', role: 'student' },
            { name: 'Charlie Grey', dob: '1992-07-30', email: 'charlie.grey@example.com', password: 'password444', role: 'student' },
            { name: 'Diana Prince', dob: '1988-11-08', email: 'diana.prince@example.com', password: 'password555', role: 'student' },
        ];

        for (let user of users) {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            await connection.request().query(`
                INSERT INTO Users (name, dob, email, password, role) 
                VALUES ('${user.name}', '${user.dob}', '${user.email}', '${hashedPassword}', '${user.role}')
            `);
        }
        // Insert data into Lecturer table
        const insertLecturers = `
        INSERT INTO Lecturer (UserID, ProfilePicture) VALUES
        ((SELECT id FROM Users WHERE email = 'jane_smith@example.com'), NULL),
        ((SELECT id FROM Users WHERE email = 'bob_brown@example.com'), NULL);
        `;
        await connection.request().query(insertLecturers);

        // Path to courseImage file

        // WY, RAEANN, JOEYI's
        const courseImagePath = path.join(__dirname,'../BED2024Apr_P07_T08/public/courseImage/course1.jpeg');

        // AMELIA'S
        // const courseImagePath = path.join(__dirname,'../BED2024Apr_P07_T08-1/public/courseImage/course1.jpeg');

        // Read courseImage file 
        const courseImageBuffer = fs.readFileSync(courseImagePath);

        // Insert data into Courses table
        const insertCourses = `
        INSERT INTO Courses (LecturerID, Title, Description, Category, Level, Duration, CourseImage) VALUES 
        (1,'Introduction to Python', 'Learn the basics of Python programming, including syntax, data types, and functions.', 'Programming', 'Beginner', 360, @image),
        (2,'Advanced Algebra', 'Dive deep into algebraic concepts and techniques used in advanced mathematics.', 'Mathematics', 'Advanced', 480, @image),
        (2,'Digital Marketing', 'Explore the strategies and tools used in digital marketing to reach and engage audiences.', 'Marketing', 'Intermediate', 300, @image);
        `;
        await connection.request()
        .input('image',courseImageBuffer)
        .query(insertCourses);
        
        // Path to external files 
        // WY, RAEANN, JOEYI'S
        const videoFilePath = path.join(__dirname, '../BED2024Apr_P07_T08/public/lectureVideos/video1.mp4');
        const lectureImage = path.join(__dirname, '../BED2024Apr_P07_T08/public/lectureImage/lecture1.jpeg');
        
        //AMELIA'S
        // const videoFilePath = path.join(__dirname, '../BED2024Apr_P07_T08-1/public/lectureVideos/video1.mp4');
        // const lectureImage = path.join(__dirname, '../BED2024Apr_P07_T08-1/public/lectureImage/lecture1.jpeg');
        
        // Read external file
        const videoBuffer = fs.readFileSync(videoFilePath);
        const imageBuffer = fs.readFileSync(lectureImage);

        // Insert data into Lectures table
        const insertLectures = `
        INSERT INTO Lectures (CourseID, LecturerID, Title, Description, VideoURL, Video, LectureImage, Duration, Position, ChapterName) VALUES
        ((SELECT CourseID FROM Courses WHERE Title = 'Introduction to Python'), 
        (SELECT LecturerID FROM Lecturer WHERE UserID = (SELECT id FROM Users WHERE email = 'jane_smith@example.com')), 
        'Python Basics', 'Introduction to Python programming basics.', 'http://example.com/python_basics', @video, @lectureImage, 60, 1, 'Introduction'),

        ((SELECT CourseID FROM Courses WHERE Title = 'Introduction to Python'), 
        (SELECT LecturerID FROM Lecturer WHERE UserID = (SELECT id FROM Users WHERE email = 'jane_smith@example.com')), 
        'Data Types in Python', 'Understanding different data types in Python.', 'http://example.com/data_types', @video, @lectureImage, 90, 2, 'Chapter Two'),
        ((SELECT CourseID FROM Courses WHERE Title = 'Advanced Algebra'), 
        (SELECT LecturerID FROM Lecturer WHERE UserID = (SELECT id FROM Users WHERE email = 'bob_brown@example.com')), 
        'Algebraic Structures', 'Exploring advanced algebraic structures.', 'http://example.com/algebraic_structures', @video, @lectureImage, 120, 1, 'Introduction'),
        ((SELECT CourseID FROM Courses WHERE Title = 'Advanced Algebra'), 
        (SELECT LecturerID FROM Lecturer WHERE UserID = (SELECT id FROM Users WHERE email = 'bob_brown@example.com')), 
        'Polynomial Equations', 'Solving polynomial equations in algebra.', 'http://example.com/polynomial_equations', @video, @lectureImage, 100, 2, 'Chapter Two'),
        ((SELECT CourseID FROM Courses WHERE Title = 'Digital Marketing'), 
        (SELECT LecturerID FROM Lecturer WHERE UserID = (SELECT id FROM Users WHERE email = 'jane_smith@example.com')), 
        'SEO Basics', 'Introduction to Search Engine Optimization.', 'http://example.com/seo_basics', @video, @lectureImage, 75, 1, 'Introduction'),
        ((SELECT CourseID FROM Courses WHERE Title = 'Digital Marketing'), 
        (SELECT LecturerID FROM Lecturer WHERE UserID = (SELECT id FROM Users WHERE email = 'jane_smith@example.com')), 
        'Content Marketing', 'Strategies for effective content marketing.', 'http://example.com/content_marketing', @video, @lectureImage, 85, 2, 'Chapter Two');
        `;
        await connection.request()
        .input('video', sql.VarBinary, videoBuffer)
        .input('lectureImage', sql.VarBinary, imageBuffer)
        .query(insertLectures);
        // Insert data into user_reviews table
        const insertUserReviews = `
        INSERT INTO user_reviews (user_id, review_text, rating, review_date) VALUES 
        (6, 'Great course content, very informative!', 5, GETDATE()),
        (7, 'Needs improvement in course materials.', 3, GETDATE()),
        (8, 'Well-structured lectures and helpful professor.', 4, GETDATE()),
        (9, 'Lecture pace was too fast to follow.', 2, GETDATE());
        `;
        await connection.request().query(insertUserReviews);

        // Insert data into Discussions table
        const insertDiscussions = `
        INSERT INTO Discussions (title, description, category, posted_date, user_id) VALUES
        ('Coding for python', 'Python design philosophy emphasizes code readability and syntax that allows programmers to express concepts in fewer lines of code compared to languages such as C++ or Java.', 'coding', GETDATE(), (SELECT id FROM Users WHERE email = 'john_doe@example.com')),
        ('Advanced Algebra', 'Advanced algebra is a branch of mathematics that extends the principles and concepts of elementary algebra into more complex and abstract areas.', 'math', GETDATE(), (SELECT id FROM Users WHERE email = 'jane_smith@example.com'));
        `;
        await connection.request().query(insertDiscussions);

        // Insert main discussion comment and replies
        const insertDiscussionComments = `
        INSERT INTO user_comments (user_id, content, discussion_id) VALUES
        (1, 'This is a great discussion. Thanks for sharing!', 1),
        (2, 'I totally agree with your point.', 1),
        (3, 'Can you provide more details on this topic?', 2),
        (4, 'Interesting perspective. I never thought about it that way.', 2),
        (2, 'Could you share some sources for your claims?', 2);
        `;
        await connection.request().query(insertDiscussionComments);

        connection.close();
        console.log("Seeding completed");
    } catch (err) {
        console.error("Error during seeding:", err);
    }
}

run();