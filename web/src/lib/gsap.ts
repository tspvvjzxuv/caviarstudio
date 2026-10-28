import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Flip from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(useGSAP, ScrollTrigger, Flip, SplitText);

export { gsap, useGSAP, ScrollTrigger, Flip, SplitText };
