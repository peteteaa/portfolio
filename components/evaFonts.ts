import { Barlow_Condensed, Noto_Serif_JP, Share_Tech_Mono } from "next/font/google";

// Fonts shared by the Evangelion boot intro, the NERV terminal and its launch sequence.
// Exposed as CSS variables: --eb-serif, --eb-mono, --eb-cond.
export const evaSerif = Noto_Serif_JP({ weight: "900", subsets: ["latin"], variable: "--eb-serif", preload: false });
export const evaMono = Share_Tech_Mono({ weight: "400", subsets: ["latin"], variable: "--eb-mono" });
export const evaCond = Barlow_Condensed({ weight: ["600", "700"], subsets: ["latin"], variable: "--eb-cond" });

export const evaFontVars = `${evaSerif.variable} ${evaMono.variable} ${evaCond.variable}`;
