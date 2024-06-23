const Lectures = require("../models/Lectures");
const sql = require("mssql");

const getAllLectures = async(req,res) =>{
    try{
        const getAllLectures = await Lectures.getAllLectures();
        res.json(getAllLectures);
    }catch(error){
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

const updateLecture = async(req,res)=>{
    const id = parseInt(req.params.id);
    const newLectureData = req.body;
    try{
        const updateLecture = await Lectures.updateLecture(id,newLectureData);
        if(!updateLecture){
            return res.status(404).send('Lecture not found !');
        }
        res.json(updateLecture);
    }catch (error) {
        console.error(error);
        res.status(500).send("Error updating lecture");
    }
};
const createLecture = async(req,res)=>{
    const newLectureData = req.body;
    try{
        const createLecture = await Lectures.CreateLecture(newLectureData);
        res.status(201).json(createLecture);
    }catch (error) {
        console.error(error);
        res.status(500).send("Error creating lecture");
    }
};

const deleteLecture = async(req,res)=>{
    const lectureID = parseInt(req.params.id);
    try{
        const success = await Lectures.deleteLecture(lectureID);
        if (!success){
            return res.status(404).send("Lecture not found");
        }
        res.status(204).send("Lecture successfully deleted");
    }catch (error) {
        console.error(error);
        res.status(500).send("Error creating lecture");
    }
};
module.exports ={
    getAllLectures,
    getLectureByID,
    updateLecture,
    createLecture,
    deleteLecture
}