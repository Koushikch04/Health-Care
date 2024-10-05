import React, { useState } from "react";
import styles from "./ProfileDetails.module.css";
const ProfileDetails = () => {
  const [profileImage, setProfileImage] = useState(
    "https://bootdey.com/img/Content/avatar/avatar1.png"
  );
  const [username, setUsername] = useState("nmaxwell");
  const [name, setName] = useState("Nelle Maxwell");
  const [email, setEmail] = useState("nmaxwell@mail.com");
  const [company, setCompany] = useState("Company Ltd.");
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
      <div className={`${styles.tab_pane} ${styles.show}`} id="account-general">
        <div
          className={`${styles.card_body} ${styles.media} align-items-center`}
        >
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
            <label className={styles.form_label}>Username</label>
            <input
              type="text"
              className={`${styles.form_control} ${styles.mb_1}`}
              name="username"
              value={username}
              onChange={handleChange}
            />
          </div>

          <div className={styles.form_inputs}>
            <label className={styles.form_label}>Name</label>
            <input
              type="text"
              className={`${styles.form_control} ${styles.mb_1}`}
              name="name"
              value={name}
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
              onChange={handleChange} // Optional, if editable
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
