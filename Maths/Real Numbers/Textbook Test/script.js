document.addEventListener('DOMContentLoaded', function () {
    const questionsContainer = document.getElementById('questions-container');
    const submitButton = document.getElementById('submit-button');
    const summaryDiv = document.getElementById('summary');

    // Fetch questions and answers
    fetch('Questions/answers.json')
        .then(response => response.json())
        .then(data => {
            const questions = Object.keys(data);
            questions.forEach((questionId, index) => {
                const questionDiv = document.createElement('div');
                questionDiv.classList.add('question-form');

                const questionTitle = document.createElement('h3');
                questionTitle.textContent = `Question ${index + 1}`;
                questionDiv.appendChild(questionTitle);

                const questionImage = document.createElement('img');
                questionImage.src = `Questions/${questionId}.PNG`; // Ensure the extension is .PNG
                questionImage.onerror = () => questionDiv.removeChild(questionImage);
                questionDiv.appendChild(questionImage);

                const answerInput = document.createElement('input');
                answerInput.type = 'text';
                answerInput.name = questionId;
                questionDiv.appendChild(answerInput);

                questionsContainer.appendChild(questionDiv);
            });
        })
        .catch(error => console.error('Error loading questions:', error));

    // Submit event
    submitButton.addEventListener('click', () => {
        const answers = {};
        const inputs = document.querySelectorAll('.question-form input');
        inputs.forEach(input => {
            answers[input.name] = input.value.trim();
        });

        fetch('Questions/answers.json')
            .then(response => response.json())
            .then(correctAnswers => {
                let correctCount = 0;
                let incorrectCount = 0;
                let notAttemptedCount = 0;
                const totalQuestions = Object.keys(correctAnswers).length;

                Object.keys(correctAnswers).forEach(questionId => {
                    if (!answers[questionId]) {
                        notAttemptedCount++;
                    } else if (answers[questionId].toLowerCase() === correctAnswers[questionId].toLowerCase()) {
                        correctCount++;
                    } else {
                        incorrectCount++;
                    }
                });

                const attemptedCount = totalQuestions - notAttemptedCount;
                const score = Math.round((correctCount / totalQuestions) * 100);

                let summaryHtml = `
                    <h3>Summary</h3>
                    <p>Total Questions: ${totalQuestions}</p>
                    <p>Questions Attempted: ${attemptedCount}</p>
                    <p>Correct Answers: ${correctCount}</p>
                    <p>Incorrect Answers: ${incorrectCount}</p>
                    <p>Not Attempted: ${notAttemptedCount}</p>
                    <p>Score: ${score}%</p>
                `;

                // Display correct answers for incorrect questions
                if (incorrectCount > 0) {
                    summaryHtml += `<h3>Correct Answers for Incorrect Questions</h3>`;
                    Object.keys(correctAnswers).forEach(questionId => {
                        if (answers[questionId] && answers[questionId].toLowerCase() !== correctAnswers[questionId].toLowerCase()) {
                            summaryHtml += `<p>Question: ${questionId} - Correct Answer: ${correctAnswers[questionId]}</p>`;
                        }
                    });
                }

                summaryDiv.innerHTML = summaryHtml;
                summaryDiv.style.display = 'block';
            })
            .catch(error => console.error('Error checking answers:', error));
    });
});
