import { useContext } from "react";
import alertContext from "../store/alert-context";

const useAlert = () => {
  return useContext(alertContext);
};

export default useAlert;
