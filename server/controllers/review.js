import Review from "../models/Review.js";
import Appointment from "../models/Appointment.js";
import DoctorProfile from "../models/DoctorProfile.js";
import UserProfile from "../models/UserProfile.js";
import Specialty from "../models/Specialty.js";
import mongoose from "mongoose";

const getUserProfileId = async (req) => {
  if (req.user?.profileId) return req.user.profileId;
  if (req.user?.accountId) {
    const profile = await UserProfile.findOne({
      accountId: req.user.accountId,
    });
    return profile?._id;
  }
  return null;
};

const getReviewByAppointmentId = async (req, res) => {
  const { appointmentId } = req.params;

  try {
    // Find the review by the appointment ID
    const review = await Review.findOne({ appointment: appointmentId })
      .populate("user", "name")
      .populate("doctor", "name");

    if (!review) {
      return res
        .status(404)
        .json({ message: "Review not found for this appointment." });
    }

    res.status(200).json(review);
  } catch (error) {
    console.error("Error fetching review:", error);
    res.status(500).json({ message: "Server error while fetching review." });
  }
};

const createReview = async (req, res) => {
  const session = await mongoose.startSession();
  const { doctorId, userId, appointmentId, rating, comment } = req.body;
  console.log(req.body);

  try {
    if (!doctorId || !userId || !appointmentId || !rating) {
      return res
        .status(400)
        .json({ error: "Please provide doctor ID, appointment ID, and rating." });
    }

    await session.startTransaction();

    const appointment = await Appointment.findById(appointmentId).session(session);
    if (!appointment) {
      await session.abortTransaction();
      return res.status(404).json({ error: "Appointment not found." });
    }

    // Ensure the appointment belongs to the current user and is completed
    const userProfileId = await getUserProfileId(req);
    if (appointment.user.toString() !== userProfileId?.toString()) {
      await session.abortTransaction();
      return res
        .status(401)
        .json({ error: "You can only review your own appointments." });
    }
    if (appointment.status !== "completed") {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ error: "Only completed appointments can be reviewed." });
    }

    // Check if the user has already reviewed this appointment
    const alreadyReviewed = await Review.findOne({
      appointment: appointmentId,
    }).session(session);
    if (alreadyReviewed) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ error: "You have already reviewed this appointment." });
    }

    // Create the review
    await Review.create(
      [
        {
          doctor: doctorId,
          user: userProfileId,
          appointment: appointmentId,
          rating,
          comment,
        },
      ],
      { session }
    );
    appointment.reviewed = true;

    // Update doctor's average rating
    const doctor = await DoctorProfile.findById(doctorId).session(session);
    if (doctor) {
      const reviews = await Review.find({ doctor: doctorId }).session(session);
      const total = reviews.reduce((acc, item) => acc + item.rating, 0);
      const averageRating = reviews.length ? total / reviews.length : 0;
      doctor.rating = { average: averageRating, count: reviews.length };
      await doctor.save({ session });
      await appointment.save({ session });
    }

    await session.commitTransaction();
    return res.status(201).json({ message: "Review added successfully.", appointment });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    console.error("Error creating review:", error);
    return res.status(500).json({ error: "Failed to create review." });
  } finally {
    session.endSession();
  }
};

const getReviewsByDoctor = async (req, res) => {
  console.log("Hello");

  const { doctorId } = req.params;
  console.log(doctorId);

  if (!doctorId) {
    return res.status(400).json({ error: "Doctor ID is required" });
  }

  try {
    const reviews = await Review.find({ doctor: doctorId })
      .populate({
        path: "user",
        select: "name",
      })
      .sort({ createdAt: -1 });
    console.log(reviews);
    res.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: "Failed to retrieve reviews" });
  }
};

const getReviewsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const userProfileId = await getUserProfileId(req);
    if (userProfileId?.toString() !== userId.toString()) {
      return res
        .status(401)
        .json({ error: "Not authorized to view these reviews." });
    }

    const reviews = await Review.find({ user: userId })
      .populate("doctor", "name")
      .populate("user", "name email")
      .populate("appointment", "date time reviewed")
      .populate("specialty", "name")
      .sort({ createdAt: -1 });

    const transformedReviews = reviews.map((review) => {
      const reviewObj = review.toObject();

      reviewObj.reviewed = review.appointment
        ? review.appointment.reviewed
        : false;

      return reviewObj;
    });

    return res.json(transformedReviews);
  } catch (error) {
    console.error("Error fetching reviews by user:", error);
    return res.status(500).json({ error: "Failed to retrieve reviews" });
  }
};

export {
  createReview,
  getReviewsByDoctor,
  getReviewsByUser,
  getReviewByAppointmentId,
};
