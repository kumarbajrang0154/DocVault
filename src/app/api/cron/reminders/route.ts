import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logActivity } from '@/lib/activityLog';

export async function GET(req: NextRequest) {
  // Verify Vercel Cron Secret
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized Cron request' }, { status: 401 });
  }

  try {
    const now = new Date();
    // Default max threshold 90 days for background scanning
    const maxThresholdDate = new Date();
    maxThresholdDate.setDate(now.getDate() + 90);

    // Find documents expiring on or before maxThresholdDate that haven't had reminders sent recently
    const expiringDocuments = await db.document.findMany({
      where: {
        expiryDate: {
          not: null,
          lte: maxThresholdDate,
        },
        reminderSent: false,
      },
    });

    const sentReminders = [];

    for (const doc of expiringDocuments) {
      if (!doc.expiryDate) continue;

      const diffTime = doc.expiryDate.getTime() - now.getTime();
      const daysBefore = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Fetch user settings for this document owner to verify if daysBefore matches user threshold
      const userSettings = await db.userSettings.findUnique({
        where: { userId: doc.userId },
      });
      const userThresholds = userSettings?.reminderThresholds || [30, 60, 90];
      const maxUserThreshold = Math.max(...userThresholds, 30);

      if (daysBefore <= maxUserThreshold) {
        // Create ReminderLog
        await db.reminderLog.create({
          data: {
            documentId: doc.id,
            daysBefore,
          },
        });

        // Update document status
        await db.document.update({
          where: { id: doc.id },
          data: { reminderSent: true },
        });

        // Log activity
        await logActivity('REMINDER_SENT', 'Document', doc.id, {
          title: doc.title,
          category: doc.category,
          daysBefore,
          expiryDate: doc.expiryDate.toISOString(),
        });

        sentReminders.push({
          documentId: doc.id,
          title: doc.title,
          daysBefore,
          expiryDate: doc.expiryDate,
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed: sentReminders.length,
      reminders: sentReminders,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Cron execution failed';
    console.error('Expiry reminder cron error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
