const BASE_URL = "http://localhost:8080/api/fees";

export const addFee = async (fee) => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(fee),
  });
  return res.json();
};

export const getFees = async () => {
  const res = await fetch(BASE_URL);
  return res.json();
};