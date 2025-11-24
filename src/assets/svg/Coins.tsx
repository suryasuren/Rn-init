import * as React from "react";
import Svg, { Path, Rect } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
const SvgCoins = (props: SvgProps) => (
  <Svg
    width={22}
    height={22}
    fill="none"
  >
    <Path
      stroke={props.fill}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 13A6 6 0 1 0 7 1a6 6 0 0 0 0 12M17.09 9.37A6 6 0 1 1 9.34 17"
    />
    <Rect
      width={3.293}
      height={3.293}
      x={4.586}
      y={6.914}
      stroke={props.fill}
      strokeWidth={2}
      rx={1.05}
      transform="rotate(-45 4.586 6.914)"
    />
    <Rect
      width={3.293}
      height={3.293}
      x={12.586}
      y={14.914}
      stroke={props.fill}
      strokeWidth={2}
      rx={1.05}
      transform="rotate(-45 12.586 14.914)"
    />
  </Svg>
);
export default SvgCoins;
