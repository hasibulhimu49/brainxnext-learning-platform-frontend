const Login = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
                
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-blue-600">
                        BrainXNext
                    </h1>
                    <p className="text-gray-500 mt-2">
                        Sign in to continue learning
                    </p>
                </div>

                <form className="space-y-5">
                    <div>
                        <label className="block text-gray-700 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex justify-between items-center">
                        <label className="flex items-center gap-2">
                            <input type="checkbox" />
                            <span className="text-sm text-gray-600">
                                Remember me
                            </span>
                        </label>

                        <a
                            href="#"
                            className="text-sm text-blue-600 hover:underline"
                        >
                            Forgot Password?
                        </a>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
                    >
                        Login
                    </button>
                </form>

                <p className="text-center text-gray-600 mt-6">
                    Don't have an account?{" "}
                    <a
                        href="#"
                        className="text-blue-600 font-medium hover:underline"
                    >
                        Sign Up
                    </a>
                </p>
            </div>
        </div>
    );
};

export default Login;