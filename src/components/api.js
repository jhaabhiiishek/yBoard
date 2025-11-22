export default async (endpoint,type,params)=>{
	let link = 'https://yboardbackend.onrender.com'+endpoint;
	const response = await fetch(link,{
          method: type,
          headers: {
            "Content-Type": "application/json",            
          },
          credentials: 'include',
          body: JSON.stringify(params)
    })
    const data = await response.json();
    return data;
}