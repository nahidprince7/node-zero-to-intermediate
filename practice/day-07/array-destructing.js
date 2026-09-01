const technologies = ["Node.js","PostgreSQL","Docker"];

const [runtime, database, deployment] = technologies;

console.log(runtime);
console.log(database);
console.log(deployment);

// skip item with empty position

const colors = ["red", "yellow","blue"]

const [firstColor, , thirdColor] = colors;

console.log(firstColor);
console.log(thirdColor);

// use default when an element is missing 

const roles = ["admin"];
const [primaryRole, secondaryRole = "reader"] = roles;

console.log(primaryRole, secondaryRole);

// swap two variables without 3rd variable

let first = "A";
let second = "B";

[first,second] = [second,first];

console.log(first,second);