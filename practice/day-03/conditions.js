// if-else multiple conditions, multiple branches, combine conditions

const age = 35;

if (age < 18) {
  console.log("You are a minor.");
} else if (age >= 18 && age < 65) {
  console.log("You are an adult.");
} else {
  console.log("You are a senior citizen.");
}

// Truthiness

const displayName = "John Doe";

if (displayName) {
  console.log(`Hello, ${displayName}!`);
} else {
  console.log("Hello, guest!");
}

const commentCount = 0;

if (commentCount === 0) {
  console.log("No comments yet.");
}

// switch statement

const role = "editor";

switch (role) {
  case "admin":
    console.log("You have full access.");
    break;
  case "editor":
    console.log("You can edit content.");
    break;
  case "viewer":
    console.log("You can view content.");
    break;
  default:
    console.log("Role not recognized.");
}

// loops

for (let day = 1; day <= 7; day++) {
  console.log(`Day ${day}`);
}

for(let count = 5; count >= 1; count--) {
  console.log(`Countdown: ${count}`);
}
console.log("Start Learning!");

// while loop

let remainingTasks = 3;
while (remainingTasks > 0) {
  console.log(`You have ${remainingTasks} tasks remaining.`);
  remainingTasks--;
}
console.log("All tasks completed!"); 

// break and continue

for (let number = 1; number <= 10; number++) {
  if (number === 5) {
    console.log("Skipping number 5");
    continue; // Skip the rest of the loop for this iteration
  }
  if (number === 8) {
    console.log("Breaking the loop at number 8");
    break; // Exit the loop entirely
  }
  console.log(`Current number: ${number}`);
}