const user = {
    id : 7,
    name : "Nahid",
    role : "admin",
    isActive : true,
};

const {name,role} = user;

console.log(name);
console.log(role);

// rename and default

const {name : displayName , email="n@g.com"} = user;

console.log(displayName);
console.log(email);

//nested destructing

const posts = {
    title:"Nodejs",
    author : {
        name : "Nahid",
        country : "BD"
    },
};

const {
    title,
    author: { name: authorName },
  } = posts;
  
  console.log(title);
  console.log(authorName);

// function parameter destructruing

function printUser ({name, role="reader"}){
    console.log(`${name} is a ${role}.`);
}

printUser(user);
printUser({name: "Mina"});
