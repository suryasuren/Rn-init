import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
const SvgMyContest = (props: SvgProps) => (
  <Svg
    width={20}
    height={20}
  >
    <Path
      stroke={props.fill}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12.5 15.5 1 4V1h3l11.5 11.5M11 17l6-6M14 14l4 4M17 19l2-2M12.5 4.5 16 1h3v3l-3.5 3.5M3 12l4 4M5 15l-3 3M1 17l2 2"
    />
  </Svg>
);
export default SvgMyContest;
