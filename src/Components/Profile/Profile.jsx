import "./Profile.css";
import Sidebar from "../SideBar/Sidebar";
import MainDash from "../MainDash/MainDash";
import RightSide from "../RigtSide/RightSide";
import ProfileDetails from "../../Pages/ProfileDetails";

function Profile() {
  return (
    <div className="Profile">
      <div className="ProfileClass">
        <Sidebar />
        {/* <MainDash /> */}
        <ProfileDetails />
        <RightSide />
      </div>
    </div>
  );
}

export default Profile;
