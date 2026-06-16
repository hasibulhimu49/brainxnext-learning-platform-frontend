const Register = () => {
  return (
    <div>
      <h1>Register Page</h1>

      <form>
        <div>
          <label>Username:</label>
          <input type="text" placeholder="Enter username" />
        </div>

        <div>
          <label>Email:</label>
          <input type="email" placeholder="Enter email" />
        </div>

        <div>
          <label>Password:</label>
          <input type="password" placeholder="Enter password" />
        </div>

        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;