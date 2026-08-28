const role = "editor";
const isActive = true;
const postCount = 5;

if (!isActive) {
    console.log("Your account is inactive.");
} else if (role === "admin") {
    console.log("You have full access.");
} else if (role === "editor" && postCount > 0) {
    console.log("You can edit content.");
} else if (role === "viewer") {
    console.log("You can view content.");
} else {
    console.log("Role not recognized or no posts available.");
}