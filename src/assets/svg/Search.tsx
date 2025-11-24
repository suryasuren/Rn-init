import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
const SvgSearch = (props: SvgProps) => (
  <Svg
    width={17}
    height={17}
    fill="none"
    {...props}
  >
    <Path
      stroke="#8A8E91"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="m16 16-3.617-3.617M7.667 14.333A6.667 6.667 0 1 0 7.667 1a6.667 6.667 0 0 0 0 13.333"
    />
  </Svg>
);
export default SvgSearch;
