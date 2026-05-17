import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { Readable } from 'stream';

export async function POST(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: token });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // Convert Web File to Node ReadableStream
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    const fileMetadata = {
      name: `Monologue-${new Date().toISOString()}.webm`,
      mimeType: file.type || 'audio/webm',
    };

    const media = {
      mimeType: file.type || 'audio/webm',
      body: stream,
    };

    const res = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink',
    });

    return NextResponse.json({ id: res.data.id, link: res.data.webViewLink });
  } catch (error: any) {
    console.error('Audio upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
