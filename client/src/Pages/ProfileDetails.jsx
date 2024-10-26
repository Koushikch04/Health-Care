import React, { useState } from "react";
import { useSelector } from "react-redux";

import styles from "./ProfileDetails.module.css";

const ProfileDetails = () => {
  const userInfo = useSelector((state) => state.auth.userInfo);

  const { name, email, phone } = userInfo;

  const [profileImage, setProfileImage] = useState(
    "https://bootdey.com/img/Content/avatar/avatar1.png"
  );

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
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name in passwords) {
      setPasswords({ ...passwords, [name]: value });
    } else {
      switch (name) {
        case "username":
          setUsername(value);
          break;
        case "name":
          setName(value);
          break;
        default:
          break;
      }
    }
  };

  const handleSaveChanges = () => {
    console.log("Saved changes");
  };

  const handleReset = () => {
    setProfileImage("https://bootdey.com/img/Content/avatar/avatar1.png");
  };

  return (
    <div className={styles.profile_form}>
      <div className={`${styles.tab_pane} ${styles.show}`}>
        <div className={`${styles.card_body} ${styles.media}`}>
          <img src={profileImage} alt="Profile" className={styles.ui_w_80} />
          <div className={styles.profile_image}>
            <label className={styles.upload_btn}>
              Upload new photo
              <input
                type="file"
                className={styles.image_upload}
                onChange={handleImageUpload}
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
              value={name.firstName}
              onChange={handleChange}
            />
          </div>

          <div className={styles.form_inputs}>
            <label className={styles.form_label}>last Name</label>
            <input
              type="text"
              className={`${styles.form_control} ${styles.mb_1}`}
              name="lastName"
              value={name.lastName}
              onChange={handleChange}
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
            className={`${styles.btn} ${styles.btn_primary}`}
            onClick={handleSaveChanges}
          >
            Save changes
          </button>
          &nbsp;
          <button
            type="button"
            className={`${styles.btn} ${styles.btn_default}`}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetails;
