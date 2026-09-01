const posts = [
    { id: 1, title: "Node Basics", status: "published" },
    { id: 2, title: "Functions", status: "draft" },
    { id: 3, title: "Arrays", status: "published" },
  ];
  
  console.log(`Total posts: ${posts.length}`);
  
  for (const post of posts) {
    console.log(`${post.id}. ${post.title} [${post.status}]`);
  }
  