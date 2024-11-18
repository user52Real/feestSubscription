// src/emails/event-invitation.tsx
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface EventInvitationProps {
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  location: string;
  eventUrl: string;
  personalMessage?: string;
}

const EventInvitationEmail: React.FC<EventInvitationProps> = ({
  eventTitle,
  eventDate,
  eventTime,
  location,
  eventUrl,
  personalMessage,
}) => {
  const previewText = `You're invited to ${eventTitle}!`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>{eventTitle}</Heading>
          
          <Section style={section}>
            <Text style={text}>You've been invited to join this event!</Text>
            
            {personalMessage && (
              <>
                <Text style={messageBox}>{personalMessage}</Text>
                <Hr style={hr} />
              </>
            )}
            
            <Text style={detailsTitle}>Event Details:</Text>
            <Text style={details}>
              🗓️ Date: {eventDate}<br />
              ⏰ Time: {eventTime}<br />
              📍 Location: {location}
            </Text>

            <Button
              href={eventUrl}
              style={button}
            >
              View Event Details
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const section = {
  padding: "0 48px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0",
  textAlign: "center" as const,
};

const text = {
  color: "#333",
  fontSize: "16px",
  margin: "24px 0",
};

const messageBox = {
  backgroundColor: "#f9f9f9",
  border: "1px solid #ddd",
  borderRadius: "5px",
  color: "#555",
  fontSize: "16px",
  margin: "24px 0",
  padding: "16px",
};

const detailsTitle = {
  color: "#333",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "24px 0 8px",
};

const details = {
  color: "#555",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 24px",
};

const button = {
  backgroundColor: "#000",
  borderRadius: "5px",
  color: "#fff",
  display: "block",
  fontSize: "16px",
  fontWeight: "bold",
  textAlign: "center" as const,
  textDecoration: "none",
  padding: "12px 20px",
  margin: "32px auto",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

export default EventInvitationEmail;