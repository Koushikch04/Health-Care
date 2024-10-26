import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import User from "./models/User"; // Adjust the path as needed
import path from "path";

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect("your_mongodb_connection_string", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Directory where files will be stored
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Unique file name
  },
});

const upload = multer({ storage });

// Middleware to handle JSON requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Serve uploaded files

// Route to handle profile updates
app.post("/api/profile", upload.single("profileImage"), async (req, res) => {
  const { firstName, lastName, email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user information
    user.name.firstName = firstName;
    user.name.lastName = lastName;

    // If a new profile image is uploaded, save the file path
    if (req.file) {
      user.profileImage = req.file.path; // Assuming you want to store the image path in your model
    }

    await user.save();

    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Error updating profile" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
