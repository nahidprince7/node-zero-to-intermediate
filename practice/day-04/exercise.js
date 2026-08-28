// calculateArea

const calculateArea = (width, height) => {
  return width * height;
};

console.log(calculateArea(5, 10)); // Output: 50

const calculatePerimeter = (width, height) => {
  return 2 * (width + height);
};

console.log(calculatePerimeter(5, 10)); // Output: 30

//getGrade

const getGrade = (score) => {
  if(score >100 || score < 0) {
    return "Invalid score";
  } else if (score >= 90) {
    return "A";
  } else if (score >= 80) {
    return "B";
  } else if (score >= 70) {
    return "C";
  } else if (score >= 60) {
    return "D";
  } else {
    return "F";
  }
}
console.log(getGrade(95)); // Output: A
console.log(getGrade(85)); // Output: B
console.log(getGrade(75)); // Output: C
console.log(getGrade(65)); // Output: D
console.log(getGrade(55)); // Output: F
console.log(getGrade(105)); // Output: Invalid score


//format user

const formatUser = (user, role='reader') => {
    return `${user} is a ${role}.`;     
};

console.log(formatUser("Alice")); // Output: Alice is a reader.
console.log(formatUser("Bob", "admin")); // Output: Bob is a admin.


// celciusToFahrenheit

const celciusToFahrenheit = (celsius) => {
    return (celsius * 9/5) + 32;
};

console.log(celciusToFahrenheit(0));

const isAdult = (age) => {
    return age >= 18;
};

console.log(isAdult(20)); // Output: true
console.log(isAdult(15)); // Output: false

const getRemainder = (dividend, divisor) => {
    if(divisor === 0) {
        return "Error: Division by zero is not allowed.";
    }
    return dividend % divisor;
};

console.log(getRemainder(10, 3)); // Output: 1
console.log(getRemainder(10, 0)); // Output: Error: Division by zero is not allowed.


// create Multiplier

const createMultiplier = (multiplier) => {
    return (number) => {
        return number * multiplier;
    };
};

const double = createMultiplier(2);
const triple = createMultiplier(3);

console.log(double(5)); // Output: 10
console.log(triple(5)); // Output: 15