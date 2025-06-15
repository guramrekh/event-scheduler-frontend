
export const mockUsers = {
  alice: { id: 'alice', name: 'Alice', fullName: 'Alice Wonderland', email: 'alice@example.com', avatar: '/placeholder.svg' },
  bob: { id: 'bob', name: 'Bob', fullName: 'Bob Builder', email: 'bob@example.com', avatar: '/placeholder.svg' },
  charlie: { id: 'charlie', name: 'Charlie', fullName: 'Charlie Chocolate', email: 'charlie@example.com', avatar: '/placeholder.svg' },
  dave: { id: 'dave', name: 'Dave', fullName: 'Dave Davis', email: 'dave@example.com', avatar: '/placeholder.svg' },
  eve: { id: 'eve', name: 'Eve', fullName: 'Eve Every', email: 'eve@example.com', avatar: '/placeholder.svg' },
  alex: { id: 'alex', name: 'Alex', fullName: 'Alex Alert', email: 'alex@example.com', avatar: '/placeholder.svg' },
};

const attendeesList1 = [mockUsers.bob, mockUsers.charlie, mockUsers.dave, mockUsers.eve];
const attendeesList2 = [mockUsers.alice, mockUsers.charlie, mockUsers.dave];
const attendeesList3 = [mockUsers.alice, mockUsers.bob];

export const mockEvents = [
  { id: 1, name: "Project Kick-off", description: "Initial meeting for the new project.", location: "Online", dateTime: "2025-07-01T10:00:00", organizers: [mockUsers.alice], attendees: attendeesList1, isOrganizer: true, status: "upcoming" },
  { id: 2, name: "Design Sprint", description: "Week-long design sprint.", location: "Office 301", dateTime: "2025-07-05T09:00:00", organizers: [mockUsers.bob], attendees: attendeesList2, isOrganizer: false, status: "upcoming" },
  { id: 3, name: "Quarterly Review", description: "Review of Q2 performance.", location: "Conference Hall", dateTime: "2025-06-10T14:00:00", organizers: [mockUsers.charlie], attendees: attendeesList3, isOrganizer: false, status: "occurred" },
  { id: 4, name: "Team Lunch", description: "Cancelled due to weather.", location: "The Grand Cafe", dateTime: "2025-06-14T12:30:00", organizers: [mockUsers.alice], attendees: [], isOrganizer: true, status: "cancelled" },
];

export const mockInvitations = [
  { id: 1, inviter: mockUsers.dave, eventName: "Board Game Night", dateTime: "2025-07-15T19:00:00", location: "Dave's Place" },
  { id: 2, inviter: mockUsers.eve, eventName: "Community Hackathon", dateTime: "2025-08-01T09:00:00", location: "Tech Hub" },
];

export const mockNotifications = [
    { id: 1, user: mockUsers.alex, message: 'sent you an event invitation.', time: '5m ago', read: false },
    { id: 2, eventName: 'Team Lunch', message: 'starts in 1 hour.', time: '55m ago', read: true },
];
