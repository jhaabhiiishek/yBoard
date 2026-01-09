export default async (endpoint, type, params) => {
  let link = 'http://localhost:3000/' + endpoint;
  try {
    const response = await fetch(link, {
      method: type,
      headers: {
        "Content-Type": "application/json",
      },
      credentials: 'include',
      body: JSON.stringify(params)
    })
    const data = await response.json();
    return data;
  } catch (e) {
    console.error("API Error:", e);
    return { success: false, message: "Network or Server Error" };
  }
}