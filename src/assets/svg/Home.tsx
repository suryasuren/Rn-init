import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";

const SvgHome = (props: SvgProps) => (
  <Svg width={20} height={20} fill="none" >
    <Path
     stroke={props.fill}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12.369 19v-7.58a.947.947 0 0 0-.948-.947h-3.79a.947.947 0 0 0-.947.948V19"
    />
    <Path
      stroke={props.fill}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M1 8.579a1.9 1.9 0 0 1 .672-1.448l6.631-5.683a1.895 1.895 0 0 1 2.447 0L17.38 7.13a1.9 1.9 0 0 1 .672 1.448v8.526A1.895 1.895 0 0 1 16.158 19H2.895A1.895 1.895 0 0 1 1 17.105z"
    />
  </Svg>
);

export default SvgHome;
