import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import useAlert from "../hooks/useAlert";
import styles from "./ProfileDetails.module.css";
import { baseURL } from "../api/api";
import { authActions } from "../store/auth/auth-slice";
import CircularSpinner from "../components/Spinners/CircularSpinner";

const ProfileDetails = () => {
  const userInfo = useSelector((state) => state.auth.userInfo);
  const token = useSelector((state) => state.auth.userToken);
  const { name, email, profileImage } = userInfo || {};
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const { alert } = useAlert();
  const profileLink = profileImage ? `${baseURL}/${profileImage}` : null;

  const [uploadedImage, setUploadedImage] = useState(
    profileLink || "https://bootdey.com/img/Content/avatar/avatar1.png"
  );
  const [firstName, setFirstName] = useState(name.firstName);
  const [lastName, setLastName] = useState(name.lastName);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    repeatNewPassword: "",
  });

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImageDataUrl = reader.result;

        if (profileLink === newImageDataUrl) {
          alert(
            "You've selected the same image. Please choose a different one."
          );
          return;
        }

        setUploadedImage(newImageDataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  console.log(loading);

  const handleChange = (event) => {
    const { name, value } = event.target;
    switch (name) {
      case "firstName":
        setFirstName(value);
        break;
      case "lastName":
        setLastName(value);
        break;
      case "currentPassword":
      case "newPassword":
      case "repeatNewPassword":
        setPasswords({ ...passwords, [name]: value });
        break;
      default:
        break;
    }
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("email", email);

    const fileInput = document.querySelector("input[type='file']");
    if (fileInput && fileInput.files[0]) {
      formData.append("profileImage", fileInput.files[0]);
    }

    try {
      const response = await fetch(`${baseURL}/profile/update`, {
        method: "PUT",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        alert.success({ message: data.msg, title: "Success" });
        dispatch(
          authActions.updateUserInfo({
            name: {
              firstName,
              lastName,
            },
            profileImage: data.updatedProfileImage || profileImage,
          })
        );
      } else {
        const error = await response.json();
        alert.error({ message: error.msg, title: "Error" });
      }
    } catch (error) {
      alert.error({ message: "Something went wrong!", title: "Error" });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setUploadedImage(
      profileLink || "https://bootdey.com/img/Content/avatar/avatar1.png"
    );
    const fileInput = document.querySelector("input[type='file']");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  return (
    <div className={styles.profile_form}>
      <div className={`${styles.tab_pane} ${styles.show}`}>
        <div className={`${styles.card_body} ${styles.media}`}>
          <img
            src={
              uploadedImage ||
              "https://bootdey.com/img/Content/avatar/avatar1.png"
            }
            alt="Profile"
            className={styles.ui_w_80}
          />
          <div className={styles.profile_image}>
            <label className={styles.upload_btn}>
              Upload new photo
              <input
                type="file"
                className={styles.image_upload}
                onChange={handleImageUpload}
                disabled={loading}
              />
            </label>
            &nbsp;
            <button
              type="button"
              className={`${styles.btn} ${styles.btn_primary}`}
              onClick={handleReset}
            >
              Reset
            </button>
            <div
              className={`${styles.text_light} ${styles.small} ${styles.mb_1}`}
            >
              Allowed JPG, GIF, or PNG. Max size of 800K
            </div>
          </div>
        </div>

        <hr className="border-light m-0" />

        <div className={styles.card_body}>
          <div className={styles.form_inputs}>
            <label className={styles.form_label}>First Name</label>
            <input
              type="text"
              className={`${styles.form_control} ${styles.mb_1}`}
              name="firstName"
              value={firstName}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className={styles.form_inputs}>
            <label className={styles.form_label}>Last Name</label>
            <input
              type="text"
              className={`${styles.form_control} ${styles.mb_1}`}
              name="lastName"
              value={lastName}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className={styles.form_inputs}>
            <label className={styles.form_label}>E-mail</label>
            <input
              type="text"
              className={`${styles.form_control} ${styles.mb_1}`}
              name="email"
              value={email}
              onChange={handleChange}
              disabled
            />
          </div>
        </div>

        <div className={styles.text_right}>
          <button
            type="button"
            className={`${styles.btn} ${styles.btn_primary} ${styles.saveBtn}`}
            onClick={handleSaveChanges}
            disabled={loading}
          >
            {loading ? <CircularSpinner /> : "Save changes"}
          </button>
          &nbsp;
          {/* <button
            type="button"
            className={`${styles.btn} ${styles.btn_default}`}
          >
            Cancel
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default ProfileDetails;
