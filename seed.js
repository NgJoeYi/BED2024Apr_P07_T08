const sql = require("mssql");
const dbConfig = require("./dbConfig");

// SQL data for seeding the database
const seedSQL = `
-- Remove foreign keys
DECLARE @sqlf NVARCHAR(MAX) = (
    SELECT 'ALTER TABLE ' + QUOTENAME(SCHEMA_NAME(schema_id)) + '.' +
           QUOTENAME(OBJECT_NAME(parent_object_id)) +
           ' DROP CONSTRAINT ' + QUOTENAME(name) + ';'
    FROM sys.foreign_keys
    FOR XML PATH('')
);
EXEC sp_executesql @sqlf;

-- Drop all tables
DECLARE @sql NVARCHAR(MAX) = '';
SELECT @sql += ' DROP TABLE ' + QUOTENAME(TABLE_SCHEMA) + '.' + QUOTENAME(TABLE_NAME) + ';'
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE';
EXEC sp_executesql @sql;

-- Create Users table
CREATE TABLE Users (
    id INT PRIMARY KEY IDENTITY,
    name VARCHAR(50) NOT NULL,
    dob DATE NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(8) NOT NULL
);

-- Create ProfilePic table
CREATE TABLE ProfilePic (
    pic_id INT PRIMARY KEY IDENTITY,
    user_id INT NOT NULL UNIQUE,
    FOREIGN KEY (user_id) REFERENCES Users(id),
    img VARCHAR(MAX) NOT NULL
);

-- Create Discussions table
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

-- Create user_comments table
CREATE TABLE user_comments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    parent_comment_id INT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (parent_comment_id) REFERENCES user_comments(id)
);

CREATE TABLE Lecturer (
    LecturerID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT FOREIGN KEY REFERENCES Users(id),
    ProfilePicture VARBINARY(MAX),
    CreatedAt DATETIME DEFAULT GETDATE()
);

CREATE TABLE Courses (
    CourseID INT PRIMARY KEY IDENTITY(1,1),
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
    LecturerID INT FOREIGN KEY REFERENCES Lecturer(LecturerID),
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(2000),
    VideoURL NVARCHAR(256),
    Video VARBINARY(MAX),
    LectureImage VARBINARY(MAX),
    Duration INT, -- Duration in minutes
    Position INT, -- Position in the course sequence
    CreatedAt DATETIME DEFAULT GETDATE()
);
-- Create user_reviews table
CREATE TABLE user_reviews (
    review_id INT PRIMARY KEY IDENTITY,
    user_id INT NOT NULL,
    review_text TEXT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    review_date DATE DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(id)
);

-- Inserting data into the Users table
INSERT INTO Users (name, dob, email, password, role) VALUES 
('John Doe', '1990-01-01', 'john_doe@example.com', 'hashed_password', 'student'),
('Jane Smith', '1985-02-02', 'jane_smith@example.com', 'hashed_password', 'lecturer'),
('Alice Jones', '1992-03-03', 'alice_jones@example.com', 'hashed_password', 'student'),
('Bob Brown', '1988-04-04', 'bob_brown@example.com', 'hashed_password', 'lecturer'),
('Carol White', '1995-05-05', 'carol_white@example.com', 'hashed_password', 'student'),
('Alison Johnson', '1990-01-15', 'alice.johnson@example.com', 'password123', 'student'),
('Bob Pink', '1985-03-22', 'bob.pink@example.com', 'password456', 'student'),
('Charlie Grey', '1992-07-30', 'charlie.grey@example.com', 'password789', 'student'),
('Diana Prince', '1988-11-08', 'diana.prince@example.com', 'password321', 'student');

-- Insert sample discussions
INSERT INTO Discussions (title, description, category, posted_date, user_id) VALUES
('Coding for python', 'Python design philosophy emphasizes code readability and syntax that allows programmers to express concepts in fewer lines of code compared to languages such as C++ or Java.', 'coding', GETDATE(), 1),
('Advanced Algebra', 'Advanced algebra is a branch of mathematics that extends the principles and concepts of elementary algebra into more complex and abstract areas.', 'math', GETDATE(), 2);

-- Inserting the main discussion comment
INSERT INTO user_comments (user_id, content) VALUES
(2, 'Understanding advanced calculus can be challenging for many students. What strategies have you found most effective in mastering these concepts?');

-- Get the ID of the main comment
DECLARE @MainCommentId INT;
SET @MainCommentId = SCOPE_IDENTITY();

-- Inserting replies to the main comment
INSERT INTO user_comments (user_id, content, parent_comment_id) VALUES
(1, 'One strategy that has helped me is breaking down complex problems into smaller, more manageable parts. This makes it easier to understand the underlying concepts.', @MainCommentId),
(3, 'I find it helpful to visualize the problems graphically. Drawing diagrams or using graphing tools can provide a different perspective on the problem.', @MainCommentId),
(4, 'As a lecturer, I encourage students to form study groups. Discussing problems and solutions with peers can lead to a deeper understanding and uncover different approaches.', @MainCommentId),
(5, 'I also recommend using online resources like video tutorials and interactive problem solvers. These tools can offer additional explanations and practice opportunities.', @MainCommentId),
(3, 'Another approach is to seek help from instructors during office hours. Getting direct feedback and guidance can significantly improve your understanding.', @MainCommentId);

INSERT INTO user_reviews (user_id, review_text, rating)
VALUES 
(6, 'Great course content, very informative!', 5),
(7, 'Needs improvement in course materials.', 3),
(8, 'Well-structured lectures and helpful professor.', 4),
(9, 'Lecture pace was too fast to follow.', 2);
`;

// Load the SQL and run the seed process
async function run() {
    try {
        // Make sure that any items are correctly URL encoded in the connection string
        const connection = await sql.connect(dbConfig);
        const request = connection.request();
        const result = await request.query(seedSQL);
        console.log(result);

        connection.close();
    } catch (err) {
        console.error(err);
    }
}

run();
console.log("Seeding completed");




