//Personal Profile

const name = "Nahid";
const age = 25;
const likeJavaScript = true;
const learnSkills = ["HTML", "CSS", "JavaScript", "React", "Node.js"];

console.log(typeof name);
console.log(typeof age);
console.log(typeof likeJavaScript);
console.log(typeof learnSkills);


console.log(`Name: ${name}`);
console.log(`Age: ${age}`);
console.log(`Likes JavaScript: ${likeJavaScript}`);
console.log(`Skills to learn: ${learnSkills.join(", ")}`);



// Rectangle calculator

const length = 10;
const width = 5;

const area = length * width;
const perimeter = 2 * (length + width);

console.log("Area of rectangle:", area);
console.log("Perimeter of rectangle:", perimeter);

// Evennumber checker

const number = 8;
const isEven = number % 2 === 0;
console.log("Is the number even?", isEven);


// Access checker

const hasAccount = true;
const hasCorrectedPassword = true;
const isBlocked = false;
const canLogin = hasAccount && hasCorrectedPassword && !isBlocked;

console.log("Can login:", canLogin);