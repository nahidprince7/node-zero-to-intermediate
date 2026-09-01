const user = {
  name: "John Doe",
  age: 30,
  roles: "admin",
  isActive: true,
}

console.log(user) // { name: 'John Doe', age: 30, roles: 'admin', isActive: true }

console.log(user.name) // John Doe
console.log(user.age) // 30
console.log(user.roles) // admin
console.log(user.isActive) // true

// dot and bracket notation

console.log(user['name']) // John Doe
console.log(user['age']) // 30
console.log(user['roles']) // admin
console.log(user['isActive']) // true

// update add and delete 

user.roles = 'superadmin';
user.email = 'nahid@example.com';
delete user.age;

console.log(user) // { name: 'John Doe', roles: 'superadmin', isActive: true, email: 'nahid@example.com' }          

// check for a property

console.log('name' in user) // true
console.log('age' in user) // false
console.log('roles' in user) // true
console.log('isActive' in user) // true
console.log('email' in user) // true
console.log(Object.hasOwn(user, 'name')) // true
console.log(Object.hasOwn(user, 'age')) // false
console.log(Object.hasOwn(user, 'roles')) // true
console.log(Object.hasOwn(user, 'isActive')) // true
console.log(Object.hasOwn(user, 'email')) // true

// Object methods

const post = {
  title: 'JavaScript Basics',
  content: 'This is a post about JavaScript basics.',
  publish() {
    this.status = 'published';
  }
};

console.log(post.title); // Output: JavaScript Basics
console.log(post.content);
post.publish();
console.log(post.status); // Output: published



