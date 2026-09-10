const posts = [
  {
    id: 1,
    title: "First Post",
    content: "This is the content of the first post.",
    views:120,
    status: "published"
  },
  {
    id: 2,
    title: "Second Post",
    content: "This is the content of the second post.",
    views: 80,
    status: "draft"
  },
  {
    id: 3,
    title: "Third Post",
    content: "This is the content of the third post.",
    views: 150,
    status: "published"
  }
];

const printTitle = (post) => {
  console.log(post.title);
};

posts.forEach(printTitle);

// transform with `map`

const labels = posts.map((post) => `${post.id}: ${post.title}`);
console.log(labels);

// transform objects without mutating the original array

const updatedPosts = posts.map((post) => {
  return {
    ...post,
    views: post.views + 10, // increment views by 10
  };
});

console.log(updatedPosts);
// console.log(posts); // original array remains unchanged

// select with filter

const publishedPosts = posts.filter((post) =>{
    return post.status === "published";
});
console.log(publishedPosts);

const popularPosts = posts.filter((post) => post.views >100);
console.log(popularPosts);

// combine condition

const publishedPopularPosts = posts.filter((post)=> {
    return post.status === "published" && post.views > 100;
})

console.log("Published and Popular Posts:", publishedPopularPosts);

//locate with find

const requestedId = 3;
const froundPost = posts.find((post) => post.id === requestedId);
console.log("requested post",froundPost);


const missingPost = posts.find((post) => post.id === 5);
console.log("missing post", missingPost); // undefined

if (missingPost) {
  console.log("Post found:", missingPost);
} else {
  console.log("Post not found.");
}




