import "./Profile.css";
import Sidebar from "../SideBar/Sidebar";
import MainDash from "../MainDash/MainDash";
import RightSide from "../RigtSide/RightSide";
import ProfileForm from "../../Pages/ProfileForm";

function Profile() {
  return (
    <div className="Profile">
      <div className="ProfileClass">
        <Sidebar />
        {/* <MainDash /> */}
        <ProfileForm />
        <RightSide />
      </div>
    </div>
  );
}

export default Profile;
