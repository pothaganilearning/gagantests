let startTime = Date.now();

async function loadAnswers() {
    try {
        const response = await fetch('Questions/answers.json');
        if (!response.ok) {
            throw new Error('Failed to load answers.json');
        }
        return await response.json();
    } catch (error) {
        console.error('Error loading answers:', error);
        return {}; // Return an empty object if answers cannot be loaded
    }
}

function submitTest() {
    loadAnswers().then(answers => {
        const forms = document.querySelectorAll('.question-form');
        let correctAnswers = 0;
        let incorrectAnswers = 0;
        let notAttempted = 0;
        let attemptedQuestions = 0;
        let totalQuestions = forms.length;
        let incorrectQuestions = [];

        forms.forEach(form => {
            const questionId = form.dataset.questionId;
            const userAnswers = getUserAnswers(form);
            const correctAnswer = answers[questionId] || ''; // Default to empty string if no correct answer is found

            if (userAnswers.length > 0) {
                attemptedQuestions++;
                if (userAnswers[0] === correctAnswer) {
                    correctAnswers++;
                } else {
                    incorrectAnswers++;
                    incorrectQuestions.push({
                        questionId: questionId,
                        userAnswers: userAnswers,
                        correctAnswer: correctAnswer
                    });
                }
            } else {
                notAttempted++;
            }
        });

        const endTime = Date.now();
        const timeTaken = ((endTime - startTime) / 1000).toFixed(2);
        const percentage = ((correctAnswers / totalQuestions) * 100).toFixed(2);

        displaySummary(correctAnswers, incorrectAnswers, notAttempted, attemptedQuestions, totalQuestions, percentage, timeTaken, incorrectQuestions);
    }).catch(error => {
        console.error('Error:', error);
        displaySummary(0, 0, totalQuestions, 0, totalQuestions, 0, ((Date.now() - startTime) / 1000).toFixed(2), []); // Show summary even if there's an error
    });
}

function getUserAnswers(form) {
    const userAnswers = [];

    form.querySelectorAll('input').forEach(input => {
        if (input.type === 'radio' || input.type === 'checkbox') {
            if (input.checked) {
                userAnswers.push(input.value);
            }
        } else if (input.type === 'text' || input.type === 'number') {
            if (input.value.trim() !== '') {
                userAnswers.push(input.value.trim());
            }
        }
    });

    return userAnswers;
}

function displaySummary(correctAnswers, incorrectAnswers, notAttempted, attemptedQuestions, totalQuestions, percentage, timeTaken, incorrectQuestions) {
    const summaryDiv = document.getElementById('summary');
    let incorrectQuestionsHTML = '';

    if (incorrectQuestions.length > 0) {
        incorrectQuestionsHTML = '<h3>Incorrect Questions</h3><ul>';
        incorrectQuestions.forEach(q => {
            incorrectQuestionsHTML += `
                <li>
                    <p><strong>Question ID:</strong> ${q.questionId}</p>
                    <p><strong>Your Answer:</strong> ${q.userAnswers.join(', ')}</p>
                    <p><strong>Correct Answer:</strong> ${q.correctAnswer}</p>
                </li>
            `;
        });
        incorrectQuestionsHTML += '</ul>';
    }

    summaryDiv.innerHTML = `
        <h2>Test Summary</h2>
        <p>Total Questions: ${totalQuestions}</p>
        <p>Questions Attempted: ${attemptedQuestions}</p>
        <p>Questions Not Attempted: ${notAttempted}</p>
        <p>Correct Answers: ${correctAnswers}</p>
        <p>Incorrect Answers: ${incorrectAnswers}</p>
        <p>Score: ${correctAnswers}</p>
        <p>Percentage: ${percentage}%</p>
        <p>Time Taken: ${timeTaken} seconds</p>
        ${incorrectQuestionsHTML}
    `;
}

document.querySelector('button').addEventListener('click', submitTest);

// Handle missing images
function handleMissingImages() {
    const images = document.querySelectorAll('.question-image');
    images.forEach(img => {
        img.onerror = () => {
            img.src = 'Questions/default.png'; // Provide a default image if the original is missing
            img.alt = 'Image not found';
        };
    });
}

// Call this function on page load to handle missing images
document.addEventListener('DOMContentLoaded', handleMissingImages);
