const studentName = "Nahid";
const courseName = "JavaScript";
const completedDays = 2;
const totalDays = 100;
const dailyStudyHours = 2;

const remainingDays = totalDays - completedDays;
const completedHours = completedDays * dailyStudyHours;
const isCourseCompleted = completedDays === totalDays;

console.log(`Student: ${studentName}`);
console.log(`Course: ${courseName}`);
console.log(`Total days: ${totalDays}`);
console.log(`Completed days: ${completedDays}`);
console.log(`Remaining days: ${remainingDays}`);
console.log(`Hours studied: ${completedHours}`);
console.log(`Course finished: ${isCourseCompleted}`);

console.log('name:', studentName);
console.log('course:', courseName);
console.log('completed days:', completedDays);
console.log('total days:', totalDays);
console.log('daily study hours:', dailyStudyHours);
console.log('remaining days:', remainingDays);
console.log('completed hours:', completedHours);
console.log('is course completed:', isCourseCompleted);


