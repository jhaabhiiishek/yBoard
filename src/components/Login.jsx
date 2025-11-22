import { useState } from "react"
import api from "./api";


export default function Login({ setIsLoggedIn,toastNotify }) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isSignUp, setIsSignUp] = useState(false);

	const dummyLogin = async(e) => {
		e.preventDefault();
		const response = await api('login','POST',{
			email:"user@test.com",
			password:"12345"
		})
		if(response.success===true){
			toastNotify.success("Login Successful");
			setIsLoggedIn(response.email);
		}else{
			alert(response.message);
		}
	}

	const loginOrSignUp = async(e) => {
		e.preventDefault();
		if(isSignUp){
			const response = await api('signup','POST',{
				email:email,
				password:password
			})
			if(response.success===true){
				toastNotify.success("Signup Successful");
				setIsSignUp(false);
			}else{
				alert(response.message);
			}
		}else{
			const response = await api('login','POST',{
					email:email,
					password:password
			})
			if(response.success===true){
				toastNotify.success("Login Successful");
				setIsLoggedIn(response.email);
			}else{
				alert(response.message);
			}
		}
	}

	return (
		<div className="border flex flex-row mt-2 py-[5%] items-center justify-center rounded-2xl">
			<div className="flex flex-col h-[80vh] min-w-[40%] rounded-3xl mx-[5%]">
				<div className="min-h-[50%] bg-blue-500 rounded-t-3xl flex flex-col justify-end text-left mt-auto pb-12 px-8">
					<h1 className="text-5xl ">Y-Boards</h1>
				</div>
				<div className="min-h-[50%] bg-amber-400 rounded-b-3xl flex flex-col justify-center text-left px-8">
					<h2 className="text-4xl ">Your Personal To do</h2>
					<p className="text-lg mt-4">With share access, boards and much more!</p>
				</div>
			</div>
			<div className="w-1 h-[80vh] border-[0.1px]">
			</div>
			<form className="flex flex-col h-[80vh] min-w-[40%] overflow-y-scroll rounded-3xl mx-[5%] py-[8%]" onSubmit={(e)=>loginOrSignUp(e)}>
				<h2 className="text-4xl text-left mb-8">Enter your Login Details</h2>
				<label className="text-2xl text-left mb-4">Email</label>
				<input required type="text" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" className="p-4 rounded-lg border border-gray-300 mb-8"/>
				<label className="text-2xl text-left mb-4">Password</label>
				<input required type="password" value={password} onChange={(e)=>setPassword(e.target.value)}placeholder="Password" className="p-4 rounded-lg border border-gray-300 mb-8"/>
				<button type="submit" className="mt-8 p-4 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition duration-300">{isSignUp?"Signup":"Login"}</button>
				<button type="button" onClick={(e)=>dummyLogin(e)} className="mt-8 p-4 rounded-lg bg-blue-400 text-white font-semibold hover:bg-blue-600 transition duration-300">Login with dummy credentials</button>
				<button type="button" onClick={()=>setIsSignUp(!isSignUp)} className="mt-8 p-4 rounded-lg bg-blue-400 text-white font-semibold hover:bg-blue-600 transition duration-300">{isSignUp?"Login":"Signup"}</button>
			</form>
		</div>
	)
};