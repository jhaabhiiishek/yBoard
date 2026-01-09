import { useState } from "react";
import api from "./api";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { User, Lock, Mail, ArrowRight, Layout } from "lucide-react";

export default function Login({ setIsLoggedIn, toastNotify }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSignUp, setIsSignUp] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const dummyLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await api('login', 'POST', {
                email: "user@test.com",
                password: "12345"
            });
            if (response.success === true) {
                toastNotify.success("Login Successful");
                setIsLoggedIn(response.email);
            } else {
                toastNotify.error(response.message || "Login Failed");
            }
        } catch (err) {
            toastNotify.error("Server Error");
        }
        setIsLoading(false);
    };

    const loginOrSignUp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (isSignUp) {
                const response = await api('signup', 'POST', {
                    email: email,
                    password: password
                });
                if (response.success === true) {
                    toastNotify.success("Signup Successful! Please Login.");
                    setIsSignUp(false);
                } else {
                    toastNotify.error(response.message || "Signup Failed");
                }
            } else {
                const response = await api('login', 'POST', {
                    email: email,
                    password: password
                });
                if (response.success === true) {
                    toastNotify.success("Login Successful");
                    setIsLoggedIn(response.email);
                } else {
                    toastNotify.error(response.message || "Login Failed");
                }
            }
        } catch (err) {
            console.error(err);
            toastNotify.error("Something went wrong");
        }
        setIsLoading(false);
    };

    return (
        <div className="flex min-h-screen w-full bg-neutral-950 text-white overflow-hidden font-sans">
            {/* Left Side - Branding & Art */}
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="hidden lg:flex w-1/2 relative bg-neutral-900 flex-col justify-between p-12 overflow-hidden"
            >
                <div className="z-10 bg-neutral-950/50 backdrop-blur-md border border-neutral-800 p-6 rounded-2xl w-fit">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-600 rounded-lg">
                            <Layout className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tighter">Y-Boards</h1>
                    </div>
                </div>

                <div className="z-10">
                    <h2 className="text-5xl font-bold leading-tight mb-6">
                        Organize your work <br />
                        <span className="text-red-600">masterfully.</span>
                    </h2>
                    <p className="text-neutral-400 text-lg max-w-md">
                        Experience the premium way to manage tasks, collaborate with teams, and achieve your goals.
                    </p>
                </div>

                {/* Abstract Background Elements */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-neutral-800/20 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
            </motion.div>

            {/* Right Side - Form */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex-1 flex flex-col justify-center items-center p-8 bg-neutral-950 relative"
            >
                {/* Mobile Branding */}
                <div className="lg:hidden absolute top-8 left-8 flex items-center gap-2">
                    <div className="p-2 bg-red-600 rounded-lg">
                        <Layout className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold">Y-Boards</h1>
                </div>

                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold">{isSignUp ? "Create Account" : "Welcome Back"}</h2>
                        <p className="text-neutral-400 mt-2">
                            {isSignUp ? "Join us and start organizing" : "Enter your details to access your workspace"}
                        </p>
                    </div>

                    <form onSubmit={loginOrSignUp} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-300">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-neutral-500 group-focus-within:text-red-500 transition-colors" />
                                <input
                                    required
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all placeholder:text-neutral-600"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-300">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-neutral-500 group-focus-within:text-red-500 transition-colors" />
                                <input
                                    required
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all placeholder:text-neutral-600"
                                />
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2 group"
                        >
                            {isLoading ? "Processing..." : (isSignUp ? "Sign Up" : "Sign In")}
                            {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                        </motion.button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-neutral-800" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-neutral-950 px-2 text-neutral-500">Or continue with</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={dummyLogin}
                            className="flex items-center justify-center py-2.5 border border-neutral-800 rounded-lg hover:bg-neutral-900 hover:border-neutral-700 transition-all text-sm font-medium text-neutral-300"
                        >
                            <User className="w-4 h-4 mr-2" />
                            Guest / Demo
                        </button>
                        <button
                            type="button"
                            className="flex items-center justify-center py-2.5 border border-neutral-800 rounded-lg hover:bg-neutral-900 hover:border-neutral-700 transition-all text-sm font-medium text-neutral-300 cursor-not-allowed opacity-50"
                        >
                            Google (Soon)
                        </button>
                    </div>

                    <p className="text-center text-neutral-400 text-sm">
                        {isSignUp ? "Already have an account?" : "Don't have an account?"}
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="ml-2 text-red-500 hover:text-red-400 font-medium transition-colors hover:underline underline-offset-4"
                        >
                            {isSignUp ? "Log In" : "Sign Up"}
                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    )
}