import { useContext } from "react";
import alertContext from "../store/context/alert-context.js";

const useAlert = () => {
  return useContext(alertContext);
};

export default useAlert;
