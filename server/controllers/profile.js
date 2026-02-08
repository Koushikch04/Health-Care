import Account from "../models/Account.js";
import UserProfile from "../models/UserProfile.js";

export const updateProfile = async (req, res) => {
  const { firstName, lastName, email } = req.body;

  console.log("Received profile update request:", {
    firstName,
    lastName,
    email,
    hasFile: !!req.file,
  });

  try {
    const account = await Account.findOne({ email: email.toLowerCase() });

    if (!account) {
      return res.status(404).json({ msg: "User not found" });
    }

    const user = await UserProfile.findOne({ accountId: account._id });
    if (!user) {
      return res.status(404).json({ msg: "User profile not found" });
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
