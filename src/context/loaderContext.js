import {createContext} from "react";

export const LoaderContext = createContext({
  setIsLoadingState: (state) => {},
});
