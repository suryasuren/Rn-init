import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
const SvgGifts = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={19}
    height={19}
    fill="none"
    {...props}
  >
    <Path
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17.5 5.5h-16a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1M9.5 5.5v13"
    />
    <Path
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.5 9.5v7a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2v-7M5 5.5a2.5 2.5 0 1 1 0-5c.965-.016 1.91.452 2.713 1.344C8.515 2.736 9.138 4.01 9.5 5.5c.362-1.49.985-2.764 1.787-3.656C12.09.952 13.035.484 14 .5a2.5 2.5 0 0 1 0 5"
    />
  </Svg>
);
export default SvgGifts;
