import { NextResponse } from 'next/server';
import { addSubscription } from '@/lib/googleSheets';
import { auth } from '@/auth';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { endpoint, keys } = await req.json();
    if (!endpoint || !keys) {
      return NextResponse.json({ error: 'Invalid subscription object' }, { status: 400 });
    }

    // P256dh and Auth are base64 strings used to encrypt the payload
    const p256dh = keys.p256dh;
    const authKey = keys.auth;
    const email = session.user.email;

    const success = await addSubscription({ email, endpoint, p256dh, auth: authKey });
    
    if (success) {
      return NextResponse.json({ message: 'Subscribed' }, { status: 201 });
    } else {
      return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Subscription Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
