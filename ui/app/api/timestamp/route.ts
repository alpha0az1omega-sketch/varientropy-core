import { DetachedTimestampFile, OpSHA256, makePending } from '@otskit/core';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

  const arrayBuffer = await file.arrayBuffer();
  const fileBytes = new Uint8Array(arrayBuffer);

  const dtf = DetachedTimestampFile.fromBytes(new OpSHA256(), fileBytes);
  dtf.timestamp.attestations.push(makePending('https://alice.btc.calendar.opentimestamps.org'));

  const otsBytes = dtf.serializeToBytes();
  return new NextResponse(otsBytes, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${file.name}.ots"`,
    },
  });
}
