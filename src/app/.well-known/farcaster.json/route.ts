import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json(
      {
        "accountAssociation": {
          "header": "eyJ0eXBlIjoiY3VzdG9keSIsImtleSI6IjB4RTc0NzUyQTZlQTgyOWJmMEY0N0Q4ODMzRjVjMEY5MDMwYWIyMTU1MyIsImZpZCI6MTQ1ODJ9",
          "payload": "eyJkb21haW4iOiJhY2NvdW50YWJsZS1tZWdhYnl0ZTB4LW1lZ2FieXRlcy1wcm9qZWN0cy52ZXJjZWwuYXBwIn0",
          "signature": "MHhkODg4OTMyNDEzZTFhYTZhOWU1M2EyMjNlZWYyYWU2OTUwOWU4YWZjOGUxYzdhZjNlODJmODRlNjIyOTg0NmMxNTljNDliOTlmNjI1NGNkMDRlMTUzOWFlYzQxNDgwNmY1YzJjZmE4YmI2ZmVkNDgxMWQxNDlhZDRmZjZjMmIxZjFi"
        },
        "frame": {
          "version": "1",
          "name": "accountable",
          "iconUrl": "https://accountable.megabyte0x.xyz/icon.png",
          "homeUrl": "https://accountable.megabyte0x.xyz",
          "imageUrl": "https://accountable.megabyte0x.xyz/opengraph-image",
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
