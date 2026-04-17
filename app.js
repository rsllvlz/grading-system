const SUPABASE_URL = 'https://ssfcrcmikmatkuxirlcm.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_KEY_HERE';

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const form = document.getElementById("grade-form");
const tableBody = document.getElementById("final-body");

// SAVE TO DATABASE
async function saveGrades(record) {
  const { error } = await db.from('grades').insert([record]);
  if (error) throw error;
}

// MAIN FUNCTION
form.addEventListener("submit", async function(e){
  e.preventDefault();

  const name = document.getElementById("student-name").value;

  const quiz = parseFloat(document.getElementById("quiz").value);
  const lab = parseFloat(document.getElementById("lab").value);
  const assignment = parseFloat(document.getElementById("assignment").value);
  const attendance = parseFloat(document.getElementById("attendance").value);
  const exam = parseFloat(document.getElementById("exam").value);

  // VALIDATION
  if([quiz, lab, assignment, attendance, exam].some(v => isNaN(v))){
    alert("Please fill all fields");
    return;
  }

  if([quiz, lab, assignment, attendance, exam].some(v => v > 100)){
    alert("Maximum score is 100 only!");
    return;
  }

  // CALCULATION
  const final =
    (quiz * 0.20) +
    (lab * 0.30) +
    (assignment * 0.10) +
    (attendance * 0.10) +
    (exam * 0.30);

  const status = final >= 75 ? "Passed" : "Failed";
  const color = final >= 75 ? "text-green-600" : "text-red-600";

  // DISPLAY
  tableBody.innerHTML += `
    <tr class="border-b border-[#e7d7c9] hover:bg-[#f5ede3] transition">
      <td class="p-2">${name}</td>
      <td>${quiz}</td>
      <td>${lab}</td>
      <td>${assignment}</td>
      <td>${attendance}</td>
      <td>${exam}</td>
      <td class="font-bold ${color}">
        ${final.toFixed(2)} (${status})
      </td>
    </tr>
  `;

  // SAVE TO SUPABASE
  try {
    await saveGrades({
      student_name: name,
      quiz,
      lab,
      assignment,
      attendance,
      exam,
      final_grade: final
    });

    console.log("Saved to database");
  } catch (err) {
    console.error("Error saving:", err);
  }

  form.reset();
});