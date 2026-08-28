function createSlug(title) {
  return title.toLowerCase().replaceAll(" ", "-");
}

const canEditPost = (userRole, isOwner) => {
  if(userRole === "admin") {
    return true;
  }
  return userRole === "author" && isOwner;
};

console.log(createSlug("My First Blog Post")); // Output: my-first-blog-post
console.log(canEditPost("admin", false));
console.log(canEditPost("author", true)); 
console.log(canEditPost("author", false));