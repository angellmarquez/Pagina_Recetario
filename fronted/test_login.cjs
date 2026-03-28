async function testLogin() {
  try {
    const res = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario: 'test@gmail.com', password: 'password123' })
    });
    console.log("STATUS:", res.status);
    const data = await res.json();
    console.log("RESPONSE:", data);
  } catch (err) {
    console.error("FETCH ERROR:", err);
  }
}
testLogin();
