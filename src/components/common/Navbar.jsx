const Navbar = () => {
  return (
    <nav className="flex items-center justify-between h-20 w-full bg-amber-500 px-6">
      
      {/* Brand */}
      <div className="flex items-center gap-2 font-bold text-lg">
        <span className="brand-icon">🔥</span>
        <span>BrainXNext</span>
      </div>

      {/* Links */}
      <div className="hidden md:flex gap-6">
        <a href="#">Home</a>
        <a href="#">Course</a>
        <a href="#">Tutorials</a>
        <a href="#">Blog</a>
        <a href="#">Notes</a>
        <a href="#">Contact</a>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button className="px-4 py-1 bg-white rounded">Login</button>
        <button className="px-4 py-1 bg-black text-white rounded">Sign Up</button>
      </div>
    </nav>
  );
};

export default Navbar;