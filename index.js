// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB database
mongoose.connect('mongodb://localhost:27017/mentor_student_db', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('Error connecting to MongoDB:', error));

// Mentor model schema
const Mentor = mongoose.model('Mentor', {
    name: String,
    email: String
});

// Student model schema
const Student = mongoose.model('Student', {
    name: String,
    email: String,
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor' }
});

// Middleware to parse JSON requests
app.use(bodyParser.json());

// API endpoint to create a Mentor
app.post('/mentors', async (req, res) => {
    try {
        const { name, email } = req.body;
        const mentor = new Mentor({ name, email });
        await mentor.save();
        res.status(201).json(mentor);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// API endpoint to create a Student
app.post('/students', async (req, res) => {
    try {
        const { name, email } = req.body;
        const student = new Student({ name, email });
        await student.save();
        res.status(201).json(student);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// API endpoint to assign a student to a mentor
app.post('/assign/:mentorId/student/:studentId', async (req, res) => {
    try {
        const { mentorId, studentId } = req.params;
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        // Check if the student already has a mentor
        if (student.mentor) {
            return res.status(400).json({ error: 'Student already has a mentor' });
        }
        // Assign the student to the mentor
        student.mentor = mentorId;
        await student.save();
        res.status(200).json({ message: 'Student assigned to mentor successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/students', async (req, res) => {
    try {
        const students = await Student.find();
        res.status(200).json(students);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/mentors', async (req, res) => {
    try {
        const mentors = await Mentor.find();
        res.status(200).json(mentors);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// API endpoint to show all students for a particular mentor
app.get('/mentors/:mentorId/students', async (req, res) => {
    try {
        const { mentorId } = req.params;
        const students = await Student.find({ mentor: mentorId });
        res.status(200).json(students);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// API endpoint to show the previously assigned mentor for a particular student
app.get('/students/:studentId/previous-mentor', async (req, res) => {
    try {
        const { studentId } = req.params;
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        const previousMentor = await Mentor.findById(student.mentor);
        res.status(200).json(previousMentor);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
