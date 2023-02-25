const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");

const app = express();

// Configure the database connection
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "quiz_db",
});

// Middleware for parsing JSON request body
app.use(bodyParser.json());

// Define error codes
const ERROR_CODES = {
  INVALID_REQUEST_BODY: {
    code: "INVALID_REQUEST_BODY",
    message: "The request body is invalid",
  },
  DATABASE_ERROR: {
    code: "DATABASE_ERROR",
    message: "There was an error with the database",
  },
  RESOURCE_NOT_FOUND: {
    code: "RESOURCE_NOT_FOUND",
    message: "The requested resource was not found",
  },
};

// Endpoint for creating a new quiz with questions
app.post("/quizzes", (req, res) => {
  const { title, description, questions } = req.body;

  // Validate the request body
  if (
    !title ||
    !description ||
    !Array.isArray(questions) ||
    questions.length === 0
  ) {
    res.status(400).json({
      success: false,
      error: ERROR_CODES.INVALID_REQUEST_BODY,
    });
    return;
  }

  // Insert the new quiz into the database
  const quizQuery = "INSERT INTO Quizzes (title, description) VALUES (?, ?)";
  connection.query(quizQuery, [title, description], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        error: ERROR_CODES.DATABASE_ERROR,
      });
      return;
    }

    const quizId = result.insertId;

    // Insert each question and its answer options into the database
    questions.forEach((question) => {
      const { questionText, answerOptions } = question;

      // Insert the new question into the database
      const questionQuery =
        "INSERT INTO Questions (quiz_id, question_text) VALUES (?, ?)";
      connection.query(questionQuery, [quizId, questionText], (err, result) => {
        if (err) {
          console.error(err);
          res.status(500).json({
            success: false,
            error: ERROR_CODES.DATABASE_ERROR,
          });
          return;
        }

        const questionId = result.insertId;

        // Insert each answer option for the question into the database
        answerOptions.forEach((answerOption) => {
          const { optionText, isCorrect } = answerOption;

          const optionQuery =
            "INSERT INTO Answer_Options (question_id, option_text, is_correct) VALUES (?, ?, ?)";
          connection.query(
            optionQuery,
            [questionId, optionText, isCorrect],
            (err, result) => {
              if (err) {
                console.error(err);
                res.status(500).json({
                  success: false,
                  error: ERROR_CODES.DATABASE_ERROR,
                });
                return;
              }
            }
          );
        });
      });
    });

    res.status(201).json({
      success: true,
      data: {
        quizId,
      },
    });
  });
});

// Endpoint for getting questions for a particular quiz
app.get("/quizzes/:quizId/questions", (req, res) => {
  const quizId = req.params.quizId;
  const query =
    "SELECT Questions.question_id, Questions.question_text, Answer_Options.option_id, Answer_Options.option_text, Answer_Options.is_correct FROM Questions INNER JOIN Answer_Options ON Questions.question_id = Answer_Options.question_id WHERE Questions.quiz_id = ?";
  connection.query(query, [quizId], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        error: ERROR_CODES.DATABASE_ERROR,
      });
      return;
    }

    if (result.length === 0) {
      res.status(404).json({
        success: false,
        error: ERROR_CODES.RESOURCE_NOT_FOUND,
      });
      return;
    }

    const questions = {};

    // Group the answer options by question
    result.forEach((row) => {
      const { question_id, question_text, option_id, option_text, is_correct } =
        row;

      if (!questions[question_id]) {
        questions[question_id] = {
          questionText: question_text,
          answerOptions: [],
        };
      }

      questions[question_id].answerOptions.push({
        optionId: option_id,
        optionText: option_text,
        isCorrect: !!is_correct,
      });
    });

    res.json({
      success: true,
      data: {
        questions: Object.values(questions),
      },
    });
  });
});

app.listen(3000, () => {
  console.log("Server Running");
  // Connect to the database
  connection.connect((err) => {
    if (err) throw err;
    console.log("Connected to the database");
  });
});
