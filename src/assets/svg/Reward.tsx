import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
const SvgReward = (props: SvgProps) => (
  <Svg
    width={21}
    height={20}
    fill="none"
    {...props}
  >
    <Path
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m9 .5-2.5 6 4 13 4-13-2.5-6"
    />
    <Path
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.5.5a2 2 0 0 1 1.6.8l3 4a2 2 0 0 1 .013 2.382l-7.99 10.986a2 2 0 0 1-3.247 0L.886 7.682A2 2 0 0 1 .9 5.3l2.998-3.997A2 2 0 0 1 5.5.5zM.5 6.5h20"
    />
  </Svg>
);
export default SvgReward;
