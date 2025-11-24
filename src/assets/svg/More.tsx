import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
const SvgMore = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={21}
    height={21}
    fill="none"
    {...props}
  >
    <Path
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M14.032 9.789a1 1 0 0 0 0 1.414l2.376 2.377a1 1 0 0 0 1.414 0l2.377-2.377a1 1 0 0 0 0-1.414l-2.377-2.377a1 1 0 0 0-1.414 0zM.793 9.789a1 1 0 0 0 0 1.414L3.17 13.58a1 1 0 0 0 1.414 0l2.377-2.377a1 1 0 0 0 0-1.414L4.584 7.412a1 1 0 0 0-1.414 0zM7.411 16.408a1 1 0 0 0 0 1.415l2.377 2.376a1 1 0 0 0 1.415 0l2.377-2.376a1 1 0 0 0 0-1.415l-2.377-2.376a1 1 0 0 0-1.415 0zM7.411 3.17a1 1 0 0 0 0 1.414L9.788 6.96a1 1 0 0 0 1.414 0l2.377-2.376a1 1 0 0 0 0-1.414L11.202.793a1 1 0 0 0-1.414 0z"
    />
  </Svg>
);
export default SvgMore;
