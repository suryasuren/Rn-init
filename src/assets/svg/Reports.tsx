import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
const SvgReports = (props: SvgProps) => (
  <Svg
    width={17}
    height={20}
    fill="none"
  >
    <Path
      stroke={props.fill}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10.9 1H5.5a.9.9 0 0 0-.9.9v1.8a.9.9 0 0 0 .9.9h5.4a.9.9 0 0 0 .9-.9V1.9a.9.9 0 0 0-.9-.9"
    />
    <Path
      stroke={props.fill}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11.8 2.8h1.8a1.8 1.8 0 0 1 1.8 1.8v12.6a1.8 1.8 0 0 1-1.8 1.8H2.8A1.8 1.8 0 0 1 1 17.2V4.6a1.8 1.8 0 0 1 1.8-1.8h1.8M5.5 11.8h5.4"
    />
  </Svg>
);
export default SvgReports;
