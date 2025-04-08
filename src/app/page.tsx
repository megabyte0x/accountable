import type { Metadata } from "next";
import App from "./app";


// frame preview metadata
const appName = process.env.NEXT_PUBLIC_FRAME_NAME;




export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: appName,
    openGraph: {
      title: appName,
      description: process.env.NEXT_PUBLIC_FRAME_DESCRIPTION,
    },
    other: {
      "fc:frame": JSON.stringify({
        "version": "next",
        "imageUrl": "https://accountable.megabyte0x.xyz/image.png",
        "button": {
          "title": "Get Me Accountable!",
          "action": {
            "type": "launch_frame",
            "name": "accountable",
            "url": "https://accountable.megabyte0x.xyz",
            "splashImageUrl": "https://accountable.megabyte0x.xyz/splash.png",
            "iconUrl": "https://accountable.megabyte0x.xyz/icon.png",
            "splashBackgroundColor": "#f7f7f7"
          }
        }
      }),
    },
  };
}

export default function Home() {
  return (<App />);
}
