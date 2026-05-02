const BASE_URL = "http://localhost:8080/api/students";

export const getStudents = async () => {
  const res = await fetch(BASE_URL);
  return res.json();
};

export const addStudent = async (student) => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(student),
  });
  return res.json();
};