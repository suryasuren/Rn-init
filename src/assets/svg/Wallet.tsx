import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
const SvgWallet = (props: SvgProps) => (
  <Svg
    width={20}
    height={19}
    fill="none"
    {...props}
  >
    <Path
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.5 4.5v-3a1 1 0 0 0-1-1h-13a2 2 0 1 0 0 4h15a1 1 0 0 1 1 1v4m0 0h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"
    />
    <Path
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M.5 2.5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"
    />
  </Svg>
);
export default SvgWallet;
