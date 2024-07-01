const Lecturers = require("../models/Lecturer");
const sql = require("mssql");

const getAllLecturers = async(req,res)=>{
    try{
        const lecturers = await Lecturers.getAllLecturers();
        res.json(lecturers);
    }catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving lecturer");
    }
};

const getLecturerByID = async(req,res)=>{
    const id = parseInt(req.params.id);
    try{
        const lecturer = await Lecturers.getLecturerByID(id);
        if (!lecturer){
            return res.status(404).send("Lecturer not found!");
        }
        res.json(lecturer);
    }catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving lecturer");
    }
}

const updateLecturer = async (req,res)=>{
    const id = parseInt(req.params.id);
    const newLecturerData = req.body;
    try{
        const success = await Lecturers.updateLecturer(id, newLecturerData);
        if(!success){
            return res.status(404).send('Lecturer not found');
        }
        res.json(success);
    }catch(error){
        console.error(error);
        res.status(500).send('Error updating lecturer');
    }
}

const deleteLecturer = async (req,res)=>{
    const id = parseInt(req.params.id);
    try {
        const success = await Lecturers.deleteLecturer(id);
        if (!success) {
          return res.status(404).send("Lecturer not found");
        }
        res.status(204).send();
      } catch (error) {
        console.error(error);
        res.status(500).send("Error deleting lecturer");
      }
}

module.exports = {
    getAllLecturers,
    getLecturerByID,
    updateLecturer,
    deleteLecturer
}