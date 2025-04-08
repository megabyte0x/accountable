import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json(
      {
        "accountAssociation": {
          "header": "eyJmaWQiOjE0NTgyLCJ0eXBlIjoiY3VzdG9keSIsImtleSI6IjB4RTc0NzUyQTZlQTgyOWJmMEY0N0Q4ODMzRjVjMEY5MDMwYWIyMTU1MyJ9",
          "payload": "eyJkb21haW4iOiJhY2NvdW50YWJsZS5tZWdhYnl0ZTB4Lnh5eiJ9",
          "signature": "MHgxNTA2ZTAzZTUzYWY1YTIxZWQ5Y2ZlNGQ3YjFmNzQzNWJkZDA2OWE2M2Y0Y2U5NjEyYWZmZTUyY2UzMDU1Yzk2MGYzNGVhY2YxMmU3NTM5ZTEyZDQ4MjBjYmY3NjI3YTkxYWQ4ZTE0Yjg1OTdiODM0OWIwYWM0MGU5NGZhNjBlZjFi"
        },
        "frame": {
          "version": "1",
          "name": "accountable",
          "iconUrl": "https://accountable.megabyte0x.xyz/icon.png",
          "homeUrl": "https://accountable.megabyte0x.xyz",
          "imageUrl": "https://accountable.megabyte0x.xyz/image.png",
          "buttonTitle": "Get Me Accountable!",
          "splashImageUrl": "https://accountable.megabyte0x.xyz/splash.png",
          "splashBackgroundColor": "#f7f7f7",
          "webhookUrl": "https://api.neynar.com/f/app/b0ec2c3a-d598-497c-899c-6791c1ebc70d/event"
        }
      }
    );
  } catch (error) {
    console.error('Error generating metadata:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
