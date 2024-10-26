import User from "../models/User.js";

export const updateProfile = async (req, res) => {
  const { firstName, lastName, email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    user.name.firstName = firstName;
    user.name.lastName = lastName;

    if (req.file) {
      user.profileImage = req.file.path;
    }

    await user.save();

    res.status(200).json({ msg: "Profile updated successfully", user });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ msg: "Error updating profile" });
  }
};
