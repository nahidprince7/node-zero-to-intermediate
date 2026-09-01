// Nested data

const blogPost = {
    id: 1,
    title: 'Understanding JavaScript Closures',
    author: {
        name: 'Jane Doe',
        email: 'jane@example.com'
    },
    tags: ['JavaScript', 'Closures', 'Programming'],
    comments: [
        {
            id: 1,
            user: 'John Smith',
            content: 'Great article! Very informative.',
            likes: 10
        },
        {
            id: 2,
            user: 'Alice Johnson',      
            content: 'I found this really helpful, thanks!',
            likes: 5
        }
    ],
    publish() {
        this.status = 'published';
    }
};

console.log(blogPost.title); // Output: Understanding JavaScript Closures
console.log(blogPost.author.name); // Output: Jane Doe
console.log(blogPost.tags[1]); // Output: Closures
console.log(blogPost.comments[0].content); // Output: Great article! Very informative.

blogPost.publish();
console.log(blogPost.status); // Output: published

// loop over comments

for (const comment of blogPost.comments) {
    console.log(`Comment by ${comment.user}: ${comment.content} (Likes: ${comment.likes})`);
}

