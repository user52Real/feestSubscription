// src/lib/email/notifications.ts
import { Resend } from 'resend';
import EventInvitation  from '@/emails/event-invitation';
import { render } from '@react-email/render';
import React from 'react';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface InvitationParams {
    recipientEmail: string;
    eventTitle: string;
    eventDate: string;
    eventTime: string;
    location: string;
    eventUrl: string;
    personalMessage?: string;
}

export async function sendEventInvitation({
    recipientEmail,
    eventTitle,
    eventDate,
    eventTime,
    location,
    eventUrl,
    personalMessage,
  }: InvitationParams) {
    try {
      // Create the email component
      const emailComponent = React.createElement(EventInvitation, {
        eventTitle,
        eventDate,
        eventTime,
        location,
        eventUrl,
        personalMessage,
      });
  
      // Render the email
      const emailHtml = render(emailComponent);
  
      const { data, error } = await resend.emails.send({
        from: 'Event Platform <events@yourdomain.com>',
        to: recipientEmail,
        subject: `You're invited to ${eventTitle}!`,
        html: (await emailHtml).toString(),
      });
  
      if (error) {
        console.error('Error sending invitation email:', error);
        throw new Error('Failed to send invitation email');
      }
  
      return data;
    } catch (error) {
      console.error('Error in sendEventInvitation:', error);
      throw error;
    }
  }

// Utility function to format date and time
export function formatDateTime(date: Date) {
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return { formattedDate, formattedTime };
}

// Updated interfaces for other email functions
interface ReminderParams {
  recipientEmail: string;
  eventId: string;
  eventTitle: string;
  startDate: Date;
  location: string;
}

interface UpdateParams {
  recipientEmail: string;
  eventId: string;
  eventTitle: string;
  changes: string[];
}

export async function sendEventReminder({
  recipientEmail,
  eventId,
  eventTitle,
  startDate,
  location,
}: ReminderParams) {
  const { formattedDate, formattedTime } = formatDateTime(startDate);
  const eventUrl = `${process.env.NEXT_PUBLIC_APP_URL}/events/${eventId}`;

  try {
    const emailHtml = `
      <h1>Reminder: ${eventTitle} is coming up!</h1>
      <p>This is a reminder that you have an upcoming event:</p>
      <ul>
        <li>Event: ${eventTitle}</li>
        <li>Date: ${formattedDate}</li>
        <li>Time: ${formattedTime}</li>
        <li>Location: ${location}</li>
      </ul>
      <p>View event details: <a href="${eventUrl}">${eventUrl}</a></p>
    `;

    const { data, error } = await resend.emails.send({
      from: 'Event Platform <events@yourdomain.com>',
      to: recipientEmail,
      subject: `Reminder: ${eventTitle}`,
      html: emailHtml,
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error in sendEventReminder:', error);
    throw error;
  }
}

export async function sendEventUpdate({
  recipientEmail,
  eventId,
  eventTitle,
  changes,
}: UpdateParams) {
  const eventUrl = `${process.env.NEXT_PUBLIC_APP_URL}/events/${eventId}`;

  try {
    const emailHtml = `
      <h1>Event Update: ${eventTitle}</h1>
      <p>The following changes have been made to the event:</p>
      <ul>
        ${changes.map(change => `<li>${change}</li>`).join('')}
      </ul>
      <p>View updated event details: <a href="${eventUrl}">${eventUrl}</a></p>
    `;

    const { data, error } = await resend.emails.send({
      from: 'Event Platform <events@yourdomain.com>',
      to: recipientEmail,
      subject: `Event Update: ${eventTitle}`,
      html: emailHtml,
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error in sendEventUpdate:', error);
    throw error;
  }
}