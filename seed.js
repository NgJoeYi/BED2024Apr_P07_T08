// Import necessary modules
const sql = require("mssql");
const path = require("path");
const dbConfig = require("./dbConfig");

// SQL data for seeding the database
const seedSQL = 
`
-- REMOVING FOREIGN KEYS
declare @sqlf nvarchar(max) = (
    select 
        'alter table ' + quotename(schema_name(schema_id)) + '.' +
        quotename(object_name(parent_object_id)) +
        ' drop constraint '+quotename(name) + ';'
    from sys.foreign_keys
    for xml path('')
);
exec sp_executesql @sqlf;

-- DROPPING ALL TABLES
DECLARE @sql NVARCHAR(max)=''

SELECT @sql += ' Drop table ' + QUOTENAME(TABLE_SCHEMA) + '.'+ QUOTENAME(TABLE_NAME) + '; '
FROM   INFORMATION_SCHEMA.TABLES
WHERE  TABLE_TYPE = 'BASE TABLE'

Exec Sp_executesql @sql

-- CREATE AND INSERT TABLES  
CREATE TABLE Users(
    id INT PRIMARY KEY IDENTITY,
    name VARCHAR(50) NOT NULL,
    dob DATE NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(8) NOT NULL
);

CREATE TABLE ProfilePic (
    pic_id INT PRIMARY KEY IDENTITY,
    user_id INT NOT NULL UNIQUE,
    FOREIGN KEY (user_id) REFERENCES Users(id),
    img VARCHAR(MAX) NOT NULL
);

CREATE TABLE Discussions (
    id INT PRIMARY KEY IDENTITY(1,1),
    title NVARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category NVARCHAR(50) NOT NULL,
    posted_date DATETIME DEFAULT GETDATE()
);

CREATE TABLE member_comments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    parent_comment_id INT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (parent_comment_id) REFERENCES member_comments(id)
);

-- Inserting data into the Users table
INSERT INTO Users (name, dob, email, password, role) VALUES 
('John Doe', '1990-01-01', 'john_doe@example.com', 'hashed_password', 'student'),
('Jane Smith', '1985-02-02', 'jane_smith@example.com', 'hashed_password', 'lecturer'),
('Alice Jones', '1992-03-03', 'alice_jones@example.com', 'hashed_password', 'student'),
('Bob Brown', '1988-04-04', 'bob_brown@example.com', 'hashed_password', 'lecturer'),
('Carol White', '1995-05-05', 'carol_white@example.com', 'hashed_password', 'student');

-- Inserting the main discussion comment
INSERT INTO member_comments (user_id, content) VALUES
(2, 'Understanding advanced calculus can be challenging for many students. What strategies have you found most effective in mastering these concepts?');

-- Get the ID of the main comment
DECLARE @MainCommentId INT;
SET @MainCommentId = SCOPE_IDENTITY();

-- Inserting replies to the main comment
INSERT INTO member_comments (user_id, content, parent_comment_id) VALUES
(1, 'One strategy that has helped me is breaking down complex problems into smaller, more manageable parts. This makes it easier to understand the underlying concepts.', @MainCommentId),
(3, 'I find it helpful to visualize the problems graphically. Drawing diagrams or using graphing tools can provide a different perspective on the problem.', @MainCommentId),
(4, 'As a lecturer, I encourage students to form study groups. Discussing problems and solutions with peers can lead to a deeper understanding and uncover different approaches.', @MainCommentId),
(5, 'I also recommend using online resources like video tutorials and interactive problem solvers. These tools can offer additional explanations and practice opportunities.', @MainCommentId),
(3, 'Another approach is to seek help from instructors during office hours. Getting direct feedback and guidance can significantly improve your understanding.', @MainCommentId);
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
