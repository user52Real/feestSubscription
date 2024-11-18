import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export async function addToGoogleCalendar(event: any, accessToken: string) {
  try {
    oauth2Client.setCredentials({ access_token: accessToken });
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const calendarEvent = {
      summary: event.title,
      description: event.description,
      start: {
        dateTime: event.startDate,
        timeZone: 'UTC',
      },
      end: {
        dateTime: event.endDate,
        timeZone: 'UTC',
      },
      location: `${event.location.venue}, ${event.location.address}`,
      attendees: event.guests.map((guest: any) => ({
        email: guest.email,
      })),
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 30 },
        ],
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: calendarEvent,
      sendUpdates: 'all',
    });

    return response.data;
  } catch (error) {
    console.error('Error adding event to Google Calendar:', error);
    throw error;
  }
}