export const sendMessage = async (text: string) => {
  const res = await fetch("http://localhost:8000/api/v1/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: text }),
  });
  return res.json();
};