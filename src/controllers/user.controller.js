const registerUser = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Register endpoint is wired. Implement user creation next.",
  });
};

export { registerUser };