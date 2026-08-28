// number-checker.js

function checkNumber(num) {
  if (num > 0) {
    console.log(`${num} is a positive number.`);
  } else if (num < 0) {
    console.log(`${num} is a negative number.`);
  } else {
    console.log("The number is zero.");
  }

  if (num % 2 === 0) {
    console.log(`${num} is an even number.`);
  } else {
    console.log(`${num} is an odd number.`);
  }
}

checkNumber(132);

// grade.js

function checkGrade(score) {
    if (score >100 || score < 0) {
        console.log("Invalid score. Please enter a score between 0 and 100.");
    } else if (score >= 90) {
        console.log("Grade: A");
    } else if (score >= 80) {
        console.log("Grade: B");
    } else if (score >= 70) {
        console.log("Grade: C");
    } else if (score >= 60) {
        console.log("Grade: D");
    } else {
        console.log("Grade: F");
    }
}

checkGrade(25);


// table.js 

function printMultiplicationTable(number) {
    console.log(`Multiplication Table for ${number}:`);
    for (let i = 1; i <= 10; i++) {
        console.log(`${number} x ${i} = ${number * i}`);
    }
}

printMultiplicationTable(5);

// permission.js

function checkPermission(role) {
    switch (role) {
    case "admin":
        console.log("You have full access.");
        break;
    case "author":
        console.log("You can create content.");
        break;
    case "reader":
        console.log("You can read content.");
        break;
    default:
        console.log("Role not recognized.");
    }
}

checkPermission("author");
checkPermission("reader");
checkPermission("admin");

// fizzbuzz.js

function fizzBuzz() {
    for (let i = 1; i <= 30; i++) {
        if (i % 3 === 0 && i % 5 === 0) {
            console.log("FizzBuzz");
        } else if (i % 3 === 0) {
            console.log("Fizz");
        } else if (i % 5 === 0) {
            console.log("Buzz");
        } else {
            console.log(i);
        }
    }
}           

fizzBuzz();
