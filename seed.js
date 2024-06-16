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
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(8) NOT NULL
);

CREATE TABLE Profile_Pictures (
    pic_id INT PRIMARY KEY IDENTITY,
    user_id INT NOT NULL UNIQUE,
    FOREIGN KEY (user_id) REFERENCES Users(id),
    img VARCHAR(MAX) NOT NULL
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