// ==========================
// app.js – Ready to Deploy
// ==========================

// 1️⃣ Supabase connection
const SUPABASE_URL = 'https://ajpaltznurpwenetnqdr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqcGFsdHpudXJwd2VuZXRucWRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNDE3NzksImV4cCI6MjA4ODYxNzc3OX0.KNZjt2sSgGd-d6NOGLLOjKbJbgbmsiwyHNbsLFMmMAs';

const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2️⃣ DOM Elements
const gradeForm = document.getElementById('grade-form');
const averageDisplay = document.getElementById('average-display');
const statusMessage = document.getElementById('status-message');
const submitButton = document.getElementById('submit-button');
const saveSubjectsButton = document.getElementById('save-subjects-button');
const phase1Subjects = document.getElementById('phase1-subjects');
const phase2Grades = document.getElementById('phase2-grades');

let savedSubjectNames = [];

// 3️⃣ Utility for status messages
function setStatus(message, type = 'info') {
  statusMessage.textContent = message;
  const baseClasses = 'text-center text-sm';
  statusMessage.className = baseClasses;
  if (type === 'success') statusMessage.classList.add('text-emerald-300');
  else if (type === 'error') statusMessage.classList.add('text-rose-400');
  else statusMessage.classList.add('text-slate-300');
}

// 4️⃣ Parse grade input
function parseGradeInput(id) {
  const input = document.getElementById(id);
  const value = parseFloat(input.value);
  if (isNaN(value) || value < 1 || value > 5) return { value: null, input };
  return { value, input };
}

// 5️⃣ Save record to Supabase
async function saveGrades(record) {
  const { data, error } = await db.from('grades').insert([record]); // <-- Ensure 'grades' matches your Supabase table
  if (error) throw error;
  return data;
}

// 6️⃣ Save Subjects button
saveSubjectsButton.addEventListener('click', (event) => {
  event.preventDefault();
  setStatus('', 'info');

  const studentName = document.getElementById('student-name').value.trim();
  if (!studentName) {
    setStatus('Please enter a student name.', 'error');
    document.getElementById('student-name').focus();
    return;
  }

  const subjectIds = ['subject1-name', 'subject2-name', 'subject3-name', 'subject4-name', 'subject5-name'];
  savedSubjectNames = subjectIds.map((id, index) => {
    const el = document.getElementById(id);
    return el?.value.trim() || `Subject ${index + 1}`;
  });

  savedSubjectNames.forEach((name, i) => {
    document.getElementById(`subject${i + 1}-display`).textContent = name;
  });

  // Show grades, hide subjects
  phase1Subjects.classList.add('hidden');
  phase2Grades.classList.remove('hidden');
  saveSubjectsButton.classList.add('hidden');
  submitButton.classList.remove('hidden');

  setStatus('Subjects saved. Now enter grades.', 'success');
});

// 7️⃣ Handle form submit
gradeForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  setStatus('', 'info');

  const studentName = document.getElementById('student-name').value.trim();
  if (!studentName) {
    setStatus('Student name missing.', 'error');
    return;
  }

  const gradeIds = ['grade1', 'grade2', 'grade3', 'grade4', 'grade5'];
  const grades = [];
  for (const id of gradeIds) {
    const { value, input } = parseGradeInput(id);
    if (value === null) {
      setStatus('Please enter valid grades between 1.0 and 5.0.', 'error');
      input.focus();
      return;
    }
    grades.push(value);
  }

  const average = (grades.reduce((a, b) => a + b, 0) / grades.length).toFixed(2);
  averageDisplay.textContent = `GWA: ${average}`;
  averageDisplay.classList.remove('hidden');

  // Prepare record matching your Supabase table columns
  const record = {
    student_name: studentName,
    subject_1_name: savedSubjectNames[0],
    subject_2_name: savedSubjectNames[1],
    subject_3_name: savedSubjectNames[2],
    subject_4_name: savedSubjectNames[3],
    subject_5_name: savedSubjectNames[4],
    subject_1: grades[0],
    subject_2: grades[1],
    subject_3: grades[2],
    subject_4: grades[3],
    subject_5: grades[4],
    average: parseFloat(average),
  };

  submitButton.disabled = true;
  setStatus('Saving to database...', 'info');

  try {
    await saveGrades(record);
    setStatus('Grades saved successfully to Supabase.', 'success');

    // Reset form for next entry
    gradeForm.reset();
    phase2Grades.classList.add('hidden');
    submitButton.classList.add('hidden');
    phase1Subjects.classList.remove('hidden');
    savedSubjectNames = [];
  } catch (error) {
    console.error('Supabase insert error:', error);
    setStatus('Failed to save to Supabase. Check console.', 'error');
  } finally {
    submitButton.disabled = false;
  }
});