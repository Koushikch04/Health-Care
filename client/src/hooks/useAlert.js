import { useContext } from "react";
import alertContext from "../store/context/alert-context";

const useAlert = () => {
  return useContext(alertContext);
};

export default useAlert;
