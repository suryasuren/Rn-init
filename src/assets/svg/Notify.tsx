import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
const SvgNotify = (props: SvgProps) => (
  <Svg
    width={props.width ?? 16}
    height={props.height ?? 17}
    fill="none"
    {...props}
  >
    <Path
      stroke="#8A8E91"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6.451 15.25a1.5 1.5 0 0 0 2.598 0M9.187 1.236A4.5 4.5 0 0 0 3.25 5.5c0 3.374-1.058 4.467-2.055 5.495a.75.75 0 0 0 .555 1.255h12a.75.75 0 0 0 .555-1.255 7 7 0 0 1-.438-.498"
    />
    <Path
      fill="#E43E3E"
      d="M12.25 7.75a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5"
    />
  </Svg>
);
export default SvgNotify;
