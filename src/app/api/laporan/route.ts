import { NextResponse } from 'next/server';
import { addLaporanRow, getAllLaporan, getSubscriptions, getAllAkses } from '@/lib/googleSheets';
import { auth } from '@/auth';
import webpush from 'web-push';

if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:admin@rsdgunungjati.id',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized', fallback: true }, { status: 401 });
    }

    let data = await getAllLaporan();
    if (!data || data.length === 0) {
      return NextResponse.json({ fallback: true, data: [] });
    }

    // Role-Based Filtering
    const userRole = session.user.role;
    const userUnits = session.user.unit ? session.user.unit.split(',').map((u: string) => u.trim()) : [];

    if (userRole === 'VERIFIKATOR') {
      data = data.filter((report: any) => userUnits.includes(report.unitPelapor) || userUnits.includes(report.lokasi));
    } else if (userRole === 'PELAPOR') {
      data = data.filter((report: any) => report.namaPelapor === session.user.name);
    }
    // ADMIN_IT & KOMITE_MUTU see all

    return NextResponse.json({ fallback: false, data });
  } catch (error: any) {
    console.error("GSheet Get Error:", error);
    return NextResponse.json({ error: error.message, fallback: true }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Simpan ke Google Sheets
    const success = await addLaporanRow(body);
    
    if (success) {
      try {
        const users = await getAllAkses();
        const targetEmails = new Set();
        const targetTelegramIds = new Set();
        
        for (const u of users) {
          const role = u.Role || u.ROLE || u.role;
          const email = u.Email || u.EMAIL || u.email;
          const units = (u.Unit || u.UNIT || u.unit || '').split(',').map((s: string)=>s.trim());
          const telegramId = u.TELEGRAM_CHAT_ID || u.Telegram_Chat_ID || u.telegram_chat_id;
          
          if (role === 'KOMITE_MUTU' || role === 'ADMIN_IT') {
            targetEmails.add(email);
            if (telegramId) targetTelegramIds.add(telegramId);
          } else if (role === 'VERIFIKATOR' && (units.includes(body.unitPelapor) || units.includes(body.lokasi))) {
            targetEmails.add(email);
            if (telegramId) targetTelegramIds.add(telegramId);
          }
        }

        const subscriptions = await getSubscriptions();
        if (subscriptions.length > 0) {

          const payload = JSON.stringify({
            title: 'Insiden Keselamatan Pasien Baru',
            body: `Dilaporkan dari: ${body.unitPelapor || 'Tidak diketahui'}`,
            url: '/dashboard/laporan'
          });

          const notifyPromises = subscriptions
            .filter((sub: any) => targetEmails.has(sub.email))
            .map((sub: any) => {
              return webpush.sendNotification({
                endpoint: sub.endpoint,
                keys: { p256dh: sub.p256dh, auth: sub.auth }
              }, payload).catch(e => console.error("Push Error", e));
            });
          
          // Fire and forget web push
          Promise.allSettled(notifyPromises);
        }

        // Telegram Notifications
        const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
        if (telegramBotToken && targetTelegramIds.size > 0) {
          const teleMessage = `🚨 *Insiden Baru Terlaporkan!* 🚨\n\n*Lokasi/Unit:* ${body.unitPelapor || 'Tidak diketahui'}\n*Waktu Insiden:* ${body.waktuInsiden || '-'}\n\nSilakan cek IKP Dashboard untuk detail lebih lanjut.`;
          
          const telegramPromises = Array.from(targetTelegramIds).map((chatId) => {
            return fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: chatId,
                text: teleMessage,
                parse_mode: 'Markdown'
              })
            }).catch(e => console.error("Telegram Push Error", e));
          });
          
          Promise.allSettled(telegramPromises);
        }
      } catch (pushErr) {
        console.error("Failed to send push notifications", pushErr);
      }

      return NextResponse.json({ message: 'Berhasil disimpan ke Google Sheets' });
    } else {
      return NextResponse.json({ message: 'Google Sheets belum dikonfigurasi, beralih ke Local Storage.' }, { status: 202 });
    }
  } catch (error: any) {
    console.error("GSheet Post Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || (session.user.role !== 'VERIFIKATOR' && session.user.role !== 'KOMITE_MUTU' && session.user.role !== 'ADMIN_IT')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, grading, status } = await req.json();
    
    if (!id || !grading || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { updateLaporanGrading } = await import('@/lib/googleSheets');
    const success = await updateLaporanGrading(id, grading, status);
    
    if (success) {
      return NextResponse.json({ message: 'Grading berhasil diupdate' });
    } else {
      return NextResponse.json({ error: 'Laporan tidak ditemukan atau gagal diupdate' }, { status: 404 });
    }
  } catch (error: any) {
    console.error("GSheet Put Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
