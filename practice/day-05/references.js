const orginalUser = {
    name: "Nahid",
    role: "reader"
};

const sameUser = orginalUser;;

sameUser.role = "author";

console.log(orginalUser.role);
console.log(sameUser.role);
console.log(orginalUser === sameUser);

// compare two seprate objects

console.log({ name: "Nahid" } === { name: "Nahid" });
