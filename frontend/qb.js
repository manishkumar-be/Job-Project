const questions = [
    { company: "Google", question: "What is a binary search tree?" },
    { company: "Google", question: "Explain the concept of polymorphism." },
    { company: "Google", question: "How does garbage collection work in Java?" },
    { company: "Google", question: "What is the time complexity of quicksort?" },
    { company: "Google", question: "Describe the process of normalization in databases." },
    { company: "Microsoft", question: "What is the difference between HTTP and HTTPS?" },
    { company: "Microsoft", question: "Explain the concept of cloud computing." },
    { company: "Microsoft", question: "What are microservices?" },
    { company: "Microsoft", question: "How does the .NET framework work?" },
    { company: "Microsoft", question: "What is Azure DevOps?" },
    { company: "Amazon", question: "What is AWS Lambda?" },
    { company: "Amazon", question: "Explain the CAP theorem." },
    { company: "Amazon", question: "What is DynamoDB?" },
    { company: "Amazon", question: "Describe the process of load balancing." },
    { company: "Amazon", question: "What is the difference between S3 and EBS?" },
    { company: "Facebook", question: "What is React?" },
    { company: "Facebook", question: "Explain the virtual DOM." },
    { company: "Facebook", question: "What is GraphQL?" },
    { company: "Facebook", question: "How does Facebook handle data privacy?" },
    { company: "Facebook", question: "What is the difference between Redux and Context API?" },
    { company: "Apple", question: "What is Swift?" },
    { company: "Apple", question: "Explain the MVC architecture." },
    { company: "Apple", question: "What is Core Data?" },
    { company: "Apple", question: "Describe the process of memory management in iOS." },
    { company: "Apple", question: "What is ARKit?" },
    { company: "IBM", question: "What is Watson?" },
    { company: "IBM", question: "Explain the concept of blockchain." },
    { company: "IBM", question: "What is quantum computing?" },
    { company: "IBM", question: "Describe the process of data mining." },
    { company: "IBM", question: "What is the difference between supervised and unsupervised learning?" },
    { company: "Intel", question: "What is Moore's Law?" },
    { company: "Intel", question: "Explain the concept of parallel computing." },
    { company: "Intel", question: "What is a microprocessor?" },
    { company: "Intel", question: "Describe the process of semiconductor fabrication." },
    { company: "Intel", question: "What is the difference between RISC and CISC?" },
    { company: "Tesla", question: "What is Autopilot?" },
    { company: "Tesla", question: "Explain the concept of electric vehicles." },
    { company: "Tesla", question: "What is the difference between AC and DC motors?" },
    { company: "Tesla", question: "Describe the process of battery management." },
    { company: "Tesla", question: "What is the role of AI in self-driving cars?" },
    { company: "Netflix", question: "What is the recommendation algorithm used by Netflix?" },
    { company: "Netflix", question: "Explain the concept of content delivery networks." },
    { company: "Netflix", question: "What is A/B testing?" },
    { company: "Netflix", question: "Describe the process of video streaming." },
    { company: "Netflix", question: "What is the difference between HLS and DASH?" },
    { company: "Adobe", question: "What is Photoshop?" },
    { company: "Adobe", question: "Explain the concept of vector graphics." },
    { company: "Adobe", question: "What is the difference between RGB and CMYK?" },
    { company: "Adobe", question: "Describe the process of digital image processing." },
    { company: "Adobe", question: "What is Adobe Creative Cloud?" }
];

const questionsContainer = document.getElementById('questionsContainer');
const searchInput = document.getElementById('searchInput');

function displayQuestions(filteredQuestions) {
    questionsContainer.innerHTML = '';
    filteredQuestions.forEach(q => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question';
        questionDiv.innerHTML = `<p class="company">${q.company}</p><p>${q.question}</p>`;
        questionsContainer.appendChild(questionDiv);
    });
}

searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredQuestions = questions.filter(q => q.company.toLowerCase().includes(searchTerm));
    displayQuestions(filteredQuestions);
});

// Display all questions initially
displayQuestions(questions);
