import React from "react";

const Login = () => {
  return (
    <div className="flex">
      <div>
        <h1>welcome to login page</h1>
        <form action="post" className="bg-red-100 flex flex-col">
          <label htmlFor="username"></label>
          <input className="h-5  p-4 border-2" type="text" placeholder="enter username" name="username" />
          <input type="submit" className="p-4 border" value="submit form" />
        </form>
      </div>
      {/* <img
        src="https://images.unsplash.com/photo-1709813610121-e2a51545e212?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lb3BhdGh5JTIwZG9jdG9yfGVufDF8fHx8MTc2MDAyMzQ1MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
        alt="login images"
        className=" w-[40%]"
      /> */}
    </div>
  );
};

export default Login;
