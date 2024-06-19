const sql = require("mssql");
const path = require("path");
const dbConfig = require("./dbConfig");

// SQL data for seeding the database
const seedSQL = 
`
-- REMOVING FOREIGN KEYS
DECLARE @sqlf NVARCHAR(max) = (
    SELECT 
        'ALTER TABLE ' + QUOTENAME(SCHEMA_NAME(schema_id)) + '.' +
        QUOTENAME(OBJECT_NAME(parent_object_id)) +
        ' DROP CONSTRAINT ' + QUOTENAME(name) + ';'
    FROM sys.foreign_keys
    FOR XML PATH('')
);
EXEC sp_executesql @sqlf;

-- DROPPING ALL TABLES
DECLARE @sql NVARCHAR(max) = ''
SELECT @sql += ' DROP TABLE ' + QUOTENAME(TABLE_SCHEMA) + '.' + QUOTENAME(TABLE_NAME) + '; '
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE'
EXEC sp_executesql @sql;



-- CREATE AND INSERT TABLES  
CREATE TABLE Users(
    userId INT PRIMARY KEY IDENTITY,
    name VARCHAR(50) NOT NULL,
    dob DATE NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(8) NOT NULL
);

CREATE TABLE members (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    member_role VARCHAR(20) NOT NULL
);

CREATE TABLE member_comments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    member_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    parent_comment_id INT NULL,
    FOREIGN KEY (member_id) REFERENCES members(id),
    FOREIGN KEY (parent_comment_id) REFERENCES member_comments(id)
);

-- Inserting data into the members table
INSERT INTO members (username, member_role) VALUES 
('john_doe', 'student'),
('jane_smith', 'lecturer'),
('alice_jones', 'student'),
('bob_brown', 'lecturer'),
('carol_white', 'student');



-- Inserting the main discussion comment
INSERT INTO member_comments (member_id, content) VALUES
(2, 'Understanding advanced calculus can be challenging for many students. What strategies have you found most effective in mastering these concepts?');

-- Get the ID of the main comment
DECLARE @MainCommentId INT;
SET @MainCommentId = SCOPE_IDENTITY();

-- Inserting replies to the main comment
INSERT INTO member_comments (member_id, content, parent_comment_id) VALUES
(1, 'One strategy that has helped me is breaking down complex problems into smaller, more manageable parts. This makes it easier to understand the underlying concepts.', @MainCommentId),
(3, 'I find it helpful to visualize the problems graphically. Drawing diagrams or using graphing tools can provide a different perspective on the problem.', @MainCommentId),
(4, 'As a lecturer, I encourage students to form study groups. Discussing problems and solutions with peers can lead to a deeper understanding and uncover different approaches.', @MainCommentId),
(5, 'I also recommend using online resources like video tutorials and interactive problem solvers. These tools can offer additional explanations and practice opportunities.', @MainCommentId),
(3, 'Another approach is to seek help from instructors during office hours. Getting direct feedback and guidance can significantly improve your understanding.', @MainCommentId);

CREATE TABLE Lecturer (
    LecturerID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT FOREIGN KEY REFERENCES Users(userId),
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
    LectureID INT PRIMARY KEY IDENTITY(1,1),
    CourseID INT FOREIGN KEY REFERENCES Courses(CourseID),
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(2000),
    VideoURL NVARCHAR(256),
    Video VARBINARY(MAX),
    LectureImage VARBINARY(MAX),
    Duration INT, -- Duration in minutes
    Position INT, -- Position in the course sequence
    CreatedAt DATETIME DEFAULT GETDATE()
);
`;

// Load the SQL and run the seed process
async function run() {
    try {
        // make sure that any items are correctly URL encoded in the connection string
        const connection = await sql.connect(dbConfig);
        const request = connection.request();
        const result = await request.query(seedSQL);
        console.log(result);

        connection.close();
    } catch (err) {
        console.log(err);
    }
}

run();
console.log("Seeding completed");
