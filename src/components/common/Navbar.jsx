const Navbar = () => {
    return (
        <nav className="navbar flex justify-between h-20 w-full bg-amber-500">
            <div className="brand">
                <span className="brand-icon"></span>
                <span>BrainXNext</span>
            </div>
            <a href="#">Home</a>
            <a href="#">Course</a>
            <a href="#">Tutorials</a>
            <a href="#">Blog</a>
            <a href="#">Notes</a>
            <a href="#">Contact</a>
            <div>
                <button>Login</button>
                <button>SignUp</button>
            </div>
        </nav>
    )
}

export default Navbar;