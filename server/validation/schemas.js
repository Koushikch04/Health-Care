import { Joi } from "../middleware/requestValidation.js";

const objectId = Joi.string().hex().length(24);
const isoDate = Joi.date().iso();
const hhmm = Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/);
const email = Joi.string().email().trim().lowercase();
const nonEmptyString = Joi.string().trim().min(1);
const flexibleDate = Joi.alternatives().try(Joi.date().iso(), Joi.date());
const adminPermissions = Joi.array().items(Joi.string().trim().min(1));

export const authSchemas = {
  registerUser: {
    body: Joi.object({
      firstName: nonEmptyString.required(),
      lastName: nonEmptyString.required(),
      email: email.required(),
      phone: nonEmptyString.required(),
      emergency: Joi.string().trim().allow("").optional(),
      password: nonEmptyString.required(),
      dob: flexibleDate.required(),
      gender: nonEmptyString.required(),
    }),
    query: Joi.object({}),
    params: Joi.object({}),
  },
  login: {
    body: Joi.object({
      email: email.required(),
      password: nonEmptyString.required(),
    }),
    query: Joi.object({}),
    params: Joi.object({}),
  },
  forgotPassword: {
    body: Joi.object({
      email: email.required(),
    }),
    query: Joi.object({}),
    params: Joi.object({}),
  },
  validateOtp: {
    body: Joi.object({
      email: email.required(),
      otpNumber: Joi.string().trim().pattern(/^\d{4,8}$/).required(),
    }),
    query: Joi.object({}),
    params: Joi.object({}),
  },
  changePassword: {
    body: Joi.object({
      newPassword: nonEmptyString.required(),
    }),
    query: Joi.object({}),
    params: Joi.object({}),
  },
};

export const appointmentSchemas = {
  createAppointment: {
    body: Joi.object({
      patientName: nonEmptyString.required(),
      reasonForVisit: Joi.string().allow("").optional(),
      additionalNotes: Joi.string().allow("").optional(),
      date: flexibleDate.required(),
      time: hhmm.required(),
      doctorId: objectId.required(),
    }),
    query: Joi.object({}),
    params: Joi.object({}),
  },
  getUserAppointments: {
    body: Joi.object({}),
    query: Joi.object({
      status: Joi.string().valid("scheduled", "completed", "canceled").optional(),
    }),
    params: Joi.object({}),
  },
  getAvailableTimeSlots: {
    body: Joi.object({}),
    query: Joi.object({}),
    params: Joi.object({
      doctorId: objectId.required(),
      date: flexibleDate.required(),
    }),
  },
  appointmentIdParam: {
    body: Joi.object({}),
    query: Joi.object({}),
    params: Joi.object({
      appointmentId: objectId.required(),
    }),
  },
  doctorAppointmentsByDoctorId: {
    body: Joi.object({}),
    query: Joi.object({
      filter: Joi.string().valid("week", "month", "year").optional(),
      date: isoDate.optional(),
    }),
    params: Joi.object({
      doctorId: objectId.required(),
    }),
  },
};

export const doctorSchemas = {
  noInput: {
    body: Joi.object({}),
    query: Joi.object({}),
    params: Joi.object({}),
  },
  getDoctorsBySpecialty: {
    body: Joi.object({}),
    query: Joi.object({}),
    params: Joi.object({
      id: objectId.required(),
    }),
  },
  getDoctorAppointments: {
    body: Joi.object({}),
    query: Joi.object({
      date: isoDate.optional(),
    }),
    params: Joi.object({}),
  },
  getDoctorAppointmentStatistics: {
    body: Joi.object({}),
    query: Joi.object({
      doctorId: objectId.optional(),
    }),
    params: Joi.object({}),
  },
  createDoctor: {
    body: Joi.object({
      firstName: nonEmptyString.required(),
      lastName: nonEmptyString.required(),
      gender: nonEmptyString.required(),
      email: email.required(),
      experience: Joi.alternatives().try(Joi.number().min(0), nonEmptyString).required(),
      rating: Joi.any().optional(),
      profile: Joi.string().allow("").required(),
      cost: Joi.alternatives().try(Joi.number().min(0), nonEmptyString).required(),
      specialty: objectId.required(),
      image: Joi.string().allow("").optional(),
      phone: Joi.alternatives().try(Joi.string().trim(), Joi.number()).required(),
      password: nonEmptyString.required(),
    }),
    query: Joi.object({}),
    params: Joi.object({}),
  },
  updateDoctor: {
    body: Joi.object({
      firstName: nonEmptyString.optional(),
      lastName: nonEmptyString.optional(),
      email: email.optional(),
      gender: nonEmptyString.optional(),
    }),
    query: Joi.object({}),
    params: Joi.object({
      id: objectId.required(),
    }),
  },
  doctorIdParam: {
    body: Joi.object({}),
    query: Joi.object({}),
    params: Joi.object({
      id: objectId.required(),
    }),
  },
};

export const reviewSchemas = {
  appointmentReviewParam: {
    body: Joi.object({}),
    query: Joi.object({}),
    params: Joi.object({
      appointmentId: objectId.required(),
    }),
  },
  createReview: {
    body: Joi.object({
      doctorId: objectId.required(),
      userId: objectId.required(),
      appointmentId: objectId.required(),
      rating: Joi.number().min(1).max(5).required(),
      comment: Joi.string().allow("").optional(),
    }),
    query: Joi.object({}),
    params: Joi.object({}),
  },
  doctorReviewParam: {
    body: Joi.object({}),
    query: Joi.object({}),
    params: Joi.object({
      doctorId: objectId.required(),
    }),
  },
  userReviewParam: {
    body: Joi.object({}),
    query: Joi.object({}),
    params: Joi.object({
      userId: objectId.required(),
    }),
  },
};

export const profileSchemas = {
  updateProfile: {
    body: Joi.object({
      firstName: nonEmptyString.required(),
      lastName: nonEmptyString.required(),
    }),
    query: Joi.object({}),
    params: Joi.object({}),
  },
};

export const findSpecialtySchemas = {
  locationParam: {
    body: Joi.object({}),
    query: Joi.object({}),
    params: Joi.object({
      locationId: Joi.alternatives()
        .try(Joi.number().integer().positive(), Joi.string().pattern(/^\d+$/))
        .required(),
    }),
  },
  symptomsParams: {
    body: Joi.object({}),
    query: Joi.object({}),
    params: Joi.object({
      locationId: Joi.alternatives()
        .try(Joi.number().integer().positive(), Joi.string().pattern(/^\d+$/))
        .required(),
      selectorStatus: Joi.string().valid("man", "woman", "boy", "girl").required(),
    }),
  },
  specializationsQuery: {
    body: Joi.object({}),
    query: Joi.object({
      symptoms: Joi.string().required(),
      gender: Joi.string().valid("male", "female").optional(),
      yearOfBirth: Joi.number().integer().min(1900).max(2100).optional(),
    }),
    params: Joi.object({}),
  },
  noInput: {
    body: Joi.object({}),
    query: Joi.object({}),
    params: Joi.object({}),
  },
};

export const specialtySchemas = {
  noInput: {
    body: Joi.object({}),
    query: Joi.object({}),
    params: Joi.object({}),
  },
};

export const adminSchemas = {
  createUser: {
    body: Joi.object({
      firstName: nonEmptyString.optional(),
      lastName: nonEmptyString.optional(),
      email: email.required(),
      password: nonEmptyString.required(),
      gender: nonEmptyString.optional(),
      dob: flexibleDate.optional(),
      phone: Joi.alternatives().try(Joi.string().trim(), Joi.number()).optional(),
    }),
    query: Joi.object({}),
    params: Joi.object({}),
  },
  userIdParam: {
    body: Joi.object({}),
    query: Joi.object({}),
    params: Joi.object({
      id: objectId.required(),
    }),
  },
  editUserProfile: {
    body: Joi.object({
      firstName: nonEmptyString.optional(),
      lastName: nonEmptyString.optional(),
      email: email.optional(),
      gender: nonEmptyString.optional(),
      dob: flexibleDate.optional(),
    }),
    query: Joi.object({}),
    params: Joi.object({
      id: objectId.required(),
    }),
  },
  manageDoctorRegistration: {
    body: Joi.object({
      status: Joi.string().valid("approved", "rejected", "pending").required(),
    }),
    query: Joi.object({}),
    params: Joi.object({
      id: objectId.required(),
    }),
  },
  manageAppointments: {
    body: Joi.object({}),
    query: Joi.object({
      filter: Joi.string().valid("week", "month", "year").optional(),
      date: isoDate.optional(),
    }),
    params: Joi.object({}),
  },
  rescheduleOrCancelAppointment: {
    body: Joi.object({
      status: Joi.string().valid("canceled", "rescheduled").required(),
      newDate: flexibleDate.when("status", {
        is: "rescheduled",
        then: Joi.required(),
        otherwise: Joi.optional(),
      }),
    }),
    query: Joi.object({}),
    params: Joi.object({
      id: objectId.required(),
    }),
  },
  createAdmin: {
    body: Joi.object({
      firstName: nonEmptyString.required(),
      lastName: nonEmptyString.required(),
      email: email.required(),
      password: nonEmptyString.required(),
      permissions: adminPermissions.optional(),
    }),
    query: Joi.object({}),
    params: Joi.object({}),
  },
  updateAdminPermissions: {
    body: Joi.object({
      firstName: nonEmptyString.optional(),
      lastName: nonEmptyString.optional(),
      email: email.optional(),
      permissions: adminPermissions.required(),
    }),
    query: Joi.object({}),
    params: Joi.object({
      id: objectId.required(),
    }),
  },
  noInput: {
    body: Joi.object({}),
    query: Joi.object({}),
    params: Joi.object({}),
  },
};
