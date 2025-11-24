import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
const SvgPencil = (props: SvgProps) => (
  <Svg

    width={11}
    height={11}
    fill="none"
    {...props}
  >
    <Path
      fill="#D5003C"
      stroke="#fff"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.087 2.906A1.41 1.41 0 0 0 8.094.913L1.421 7.587a1 1 0 0 0-.25.415l-.66 2.176a.25.25 0 0 0 .311.311l2.176-.66a1 1 0 0 0 .415-.248z"
    />
    <Path fill="#D5003C" d="m7 2 2 2z" />
    <Path
      stroke="#fff"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m7 2 2 2"
    />
  </Svg>
);
export default SvgPencil;
