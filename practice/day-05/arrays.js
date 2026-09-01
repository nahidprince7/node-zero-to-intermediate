//arrays

const topics = ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js'];
console.log(topics); // Output: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js']
console.log(topics[2]); // JavaScript
console.log(topics[4]); // Node.js
console.log(topics.length); // Output: 5

console.log(topics[topics.length - 1]); // Output: Node.js

console.log(topics[99]); // Output: undefined

// update and add elelments

topics[1] = 'Tailwind CSS';
topics.push('Express.js');
topics.unshift('Bootstrap');
console.log(topics); // Output: ['HTML', 'Tailwind CSS', 'JavaScript', 'React', 'Node.js']

// remove elements

const firstTopic = topics.pop();
const lastTopic = topics.shift();
console.log(firstTopic); // Output: Node.js
console.log(lastTopic); // Output: Bootstrap
console.log(topics); // Output: ['Tailwind CSS', 'JavaScript', 'React']


// loop through an array

const tools = ['VS Code', 'Git', 'GitHub', 'Postman', 'Figma'];

for (const tool of tools) {
  console.log(tool);
}