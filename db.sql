-- Create the Quizzes table
CREATE TABLE Quizzes (
  quiz_id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL
);

-- Create the Questions table
CREATE TABLE Questions (
  question_id INT PRIMARY KEY AUTO_INCREMENT,
  quiz_id INT NOT NULL,
  question_text TEXT NOT NULL,
  FOREIGN KEY (quiz_id) REFERENCES Quizzes(quiz_id)
);

-- Create the Answer Options table
CREATE TABLE Answer_Options (
  option_id INT PRIMARY KEY AUTO_INCREMENT,
  question_id INT NOT NULL,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  FOREIGN KEY (question_id) REFERENCES Questions(question_id)
);

-- Insert some sample data
INSERT INTO Quizzes (title, description) VALUES
  ('Math Quiz', 'Test your math skills');

INSERT INTO Questions (quiz_id, question_text) VALUES
  (1, 'What is 2 + 2?');

INSERT INTO Answer_Options (question_id, option_text, is_correct) VALUES
  (1, '4', TRUE),
  (1, '6', FALSE),
  (1, '8', FALSE);
