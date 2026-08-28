// scope

const courseName = "JavaScript Bootcamp";

function showCourse() {
  const message = `Welcome to ${courseName}`;
  console.log(message);
}

showCourse();
// console.log(message); // This will throw an error because 'message' is not defined in this scope    

// block scope

if (true) {
  const blockMessage = "This is a block-scoped variable.";
  console.log(blockMessage); // Output: This is a block-scoped variable.
}

//console.log(blockMessage); // This will throw an error because 'blockMessage' is not defined in this scope

//shadowing

const topic = "JavaScript";

function discussTopic() {
  const topic = "Python"; // This 'topic' variable shadows the outer 'topic' variable
  console.log(`Let's discuss ${topic}.`); // Output: Let's discuss Python.
}

discussTopic();
console.log(`The outer topic is still ${topic}.`); // Output: The outer topic is still JavaScript.