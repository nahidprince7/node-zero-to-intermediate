// function with parameter and argument

function greet(name) {
  console.log(`Hello, ${name}!`);
}

greet("Nahid"); // Output: Hello, Nahid
greet("Alice"); // Output: Hello, Alice 
greet("Bob"); // Output: Hello, Bob


function printSummary(title, author, year) {
 console.log(`${title} was written by ${author} in ${year}.`);
}
printSummary("The Great Gatsby", "F. Scott Fitzgerald", 1925);
printSummary("To Kill a Mockingbird", "Harper Lee", 1960);
printSummary("1984", "George Orwell", 1949);

// default parameter value

function greetUser(name = "Guest") {
  console.log(`Hello, ${name}!`);
}

greetUser(); // Output: Hello, Guest!
greetUser("John"); // Output: Hello, John!

// function with return value

function add(a, b) {
  return a + b;
}

const sum = add(5, 3);
console.log(`The sum is: ${sum}`); // Output: The sum is: 8 
console.log(`The sum is: ${add(10, 15)}`); // Output: The sum is: 25

// printing is not returning, so we cannot assign it to a variable

function printTotal(a, b) {
    console.log(`The total is: ${a + b}`);
}
function calculateTotal(a, b) {
    return a + b;
}

const total = calculateTotal(7, 8);
console.log(`The total is: ${total}`); // Output: The total is: 15  

const printedTotal = printTotal(7, 8); // This will print the total but not return it
console.log(`The printed total is: ${printedTotal}`); // Output: The printed total is: undefined 

// guard clause

function divide(a, b) {
    if (b === 0) {
        return "Error: Division by zero is not allowed."; // Guard clause to exit the function early
    }   
    return a / b;
}

console.log(divide(10, 2)); // Output: 5
console.log(divide(10, 0)); // Output: Error: Division by zero is not allowed.

// arrow functions

const multiply = (a, b) => a * b;
console.log(multiply(4, 5)); // Output: 20

const greetArrow = name => {
    return `Hello, ${name}!`;
};
console.log(greetArrow("Charlie")); // Output: Hello, Charlie!
