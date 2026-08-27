// Arithmetic Operators

const fNum = 10;
const sNum = 5;

console.log(fNum + sNum);  // 10+5 = 15
console.log(fNum - sNum);  // 10-5 = 5
console.log(fNum * sNum);  // 10*5 = 50
console.log(fNum / sNum);  // 10/5 = 2
console.log(fNum % sNum);  // 10%5 = 0
console.log(fNum ** sNum); // 10^5 = 100000

console.log("10%2 = ", 10 % 2); // 10%2 = 0
console.log("11%2 = ", 11 % 2); // 11%2 = 1

// Operator Precedence
console.log(10 + 5 * 2); // 10 + (5*2) = 20
console.log((10 + 5) * 2); // (10+5)*2 = 30

// Assignment Operators
let x = 10;
x += 5; // x = x + 5
console.log(x); // 15

x -= 3; // x = x - 3
console.log(x); // 12

x *= 2; // x = x * 2
console.log(x); // 24

x /= 4; // x = x / 4
console.log(x); // 6

x %= 4; // x = x % 4
console.log(x); // 2

x **= 3; // x = x ** 3
console.log(x); // 8    


// Comparison Operators
console.log("10 > 5:",10 > 5); // true
console.log("10 < 5:",10 < 5); // false
console.log("10 >= 5:",10 >= 5); // true
console.log("10 <= 5:",10 <= 5); // false
console.log("10 == 5:",10 == 5); // false
console.log("10 != 5:",10 != 5); // true

// Strict Comparison Operators
console.log("10 === 10:",10 === 10); // true
console.log("10 !== 10:",10 !== 10); // false

// Logical Operators
const hasAccount = true;
const hasCorrectedPassword = true ;
const isBlocked = false;

console.log(hasAccount && hasCorrectedPassword); // true
console.log(hasAccount || hasCorrectedPassword); // true
console.log(!isBlocked); // true


// Build readable messages using template literals
const userName = "John";
const userAge = 30;

console.log(`Hello, my name is ${userName} and I am ${userAge} years old.`);


const price = 100;
const quantity = 5;
console.log(`The total cost is $${price * quantity}.`);