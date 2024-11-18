export const EVENT_CATEGORIES = [
    "Conference",
    "Workshop",
    "Webinar",
    "Meetup",
    "Training",
    "Social",
    "Networking",
    "Other"
] as const;
  
export const EVENT_TAGS = [
    "Technology",
    "Business",
    "Education",
    "Entertainment",
    "Health",
    "Sports",
    "Art",
    "Music",
    "Science",
    "Professional Development"
] as const;
  
export type EventCategory = typeof EVENT_CATEGORIES[number];
export type EventTag = typeof EVENT_TAGS[number];