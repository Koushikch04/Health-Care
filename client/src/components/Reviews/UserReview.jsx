import UsersTable from "../UsersTable/UsersTable";
import styles from "./UserReview.module.css";

const Review = () => {
  return (
    <div className={styles.main}>
      <UsersTable />
    </div>
  );
};

export default Review;
