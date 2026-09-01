// Shopping list

const shoppingList = [];

shoppingList.push("Milk", "Bread");
shoppingList.splice(1, 1);
shoppingList[0] = "Almond milk";

for (const item of shoppingList) {
	console.log(item);
}

// Student record 

const studentRecord = {
	id:1,
	name: "Nahid",
	Subjects : ["English", "Japanese"],
	Publish (){
		this.status = true;
	}
}

console.log(studentRecord.name);
console.log(studentRecord.Subjects[0]);
studentRecord.Publish();

console.log(studentRecord.status);