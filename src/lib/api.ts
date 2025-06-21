import axios from "axios";


const API_BASE = "http://localhost:8080";


const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
}


api.interceptors.request.use(config => {
    const token = getCookie('XSRF-TOKEN');
    if (token && config.headers) {
      config.headers['X-XSRF-TOKEN'] = token;
    }
    return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);


export async function register(user: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}) {
  return api.post("/register", user);
}

export async function login(credentials: { username: string; password: string }) {
  const params = new URLSearchParams();
  params.append("username", credentials.username);
  params.append("password", credentials.password);

  return api.post("/login", params, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
}

export async function logout() {
  return api.post("/logout");
}

export async function fetchEvents({
  timeframe = "UPCOMING",
  role,
  showCancelled = false,
}: {
  timeframe?: "UPCOMING" | "PAST";
  role?: "ORGANIZER" | "ATTENDEE";
  showCancelled?: boolean;
} = {}) {
  const params: any = { timeframe, showCancelled };
  if (role) params.role = role;
  return api.get("/events", { params });
}

export async function fetchNotifications() {
  return api.get("/notifications");
}

export async function markNotificationAsRead(notificationId: number) {
  return api.put(`/notifications/${notificationId}/mark-as-read`);
}

export async function markAllNotificationsAsRead() {
  return api.put("/notifications/mark-all-as-read");
}

export async function withdrawFromEvent(eventId: number) {
  return api.put("/attendances/withdraw", null, { params: { eventId } });
}

export async function editEvent(eventId: number, eventData: {
  title: string;
  description?: string;
  dateTime: string;
  location: string;
}, notifyParticipants: boolean) {
  return api.put(`/events/${eventId}/edit`, eventData, {
    params: {
      notifyParticipants,
    },
  });
}

export async function cancelEvent(eventId: number) {
  return api.put(`/events/${eventId}/cancel`);
}

export async function addAsOrganizer(eventId: number, newOrgUserId: number) {
  return api.put(`/events/${eventId}/add-organizer`, null, { params: { newOrgUserId } });
}

export async function removeAsOrganizer(eventId: number, removeUserId: number) {
  return api.put(`/events/${eventId}/remove-organizer`, null, { params: { removeUserId } });
}

export async function kickOutAttendee(eventId: number, removeUserId: number) {
  return api.put(`/events/${eventId}/kickout-attendee`, null, { params: { removeUserId } });
}

export async function getUserByEmail(email: string) {
  return api.get("/users/search", { params: { email } });
}

export async function getUsersByName(firstName: string, lastName: string) {
  return api.get("/users/search", { params: { firstName, lastName } });
}

export async function inviteUser(eventId: number, inviteeId: number) {
  return api.post("/invitations/invite", null, { params: { eventId, inviteeId } });
}

export async function getCurrentUser() {
  return api.get("/users/me");
}

export async function createEvent(eventData: {
  title: string;
  description?: string;
  dateTime: string;
  location: string;
}) {
  return api.post("/events/create", eventData);
}

export async function markAttended(eventId: number, attendeeUserId: number) {
  return api.put("/events/mark-attended", null, { params: { eventId, attendeeUserId } });
}

export async function markAllAttended(eventId: number) {
  return api.put("/events/mark-all-attended", null, { params: { eventId } });
}

export default api;
