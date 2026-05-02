const BASE_URL = "http://localhost:8080/api/users";

// 🔹 GET ALL USERS
export const getUsers = async () => {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
};

// 🔹 CREATE USER
export const createUser = async (user) => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });

  if (!res.ok) throw new Error("Failed to create user");
  return res.json();
};

// 🔹 UPDATE USER
export const updateUser = async (id, user) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });

  if (!res.ok) throw new Error("Failed to update user");
  return res.json();
};

// 🔹 DELETE USER
export const deleteUser = async (id) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Failed to delete user");
};