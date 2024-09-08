import React, { useState } from "react";
import "./ProfileDetails.css";
const ProfileDetails = () => {
  const [profileImage, setProfileImage] = useState();
  ("https://bootdey.com/img/Content/avatar/avatar1.png");
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
    <div className="profile-form">
      <div className="tab-pane  show" id="account-general">
        <div className="card-body media align-items-center">
          <img src={profileImage} alt="Profile" className="d-block ui-w-80" />
          <div className="profile-image">
            <label className="upload-btn">
              Upload new photo
              <input
                type="file"
                className="image-upload"
                onChange={handleImageUpload}
              />
            </label>
            &nbsp;
            <button type="button" className="btn" onClick={handleReset}>
              Reset
            </button>
            <div className="text-light small mt-1">
              Allowed JPG, GIF, or PNG. Max size of 800K
            </div>
          </div>
        </div>

        <hr className="border-light m-0" />

        <div className="card-body">
          <div className="form-inputs">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-control mb-1"
              name="username"
              value={username}
              onChange={handleChange}
            />
          </div>

          <div className="form-inputs">
            <label className="form-label">Name</label>
            <input
              type="text"
              className="form-control"
              name="name"
              value={name}
              onChange={handleChange}
            />
          </div>

          <div className="form-inputs">
            <label className="form-label">E-mail</label>
            <input
              type="text"
              className="form-control mb-1"
              name="email"
              value={email}
              onChange={handleChange}
              disabled
            />
          </div>
        </div>

        <div className="text-right mt-3">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSaveChanges}
          >
            Save changes
          </button>
          &nbsp;
          <button type="button" className="btn btn-default">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetails;
