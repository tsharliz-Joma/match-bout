import { z } from "zod";

export const signUpSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  email: z.string().email(),
  password: z.string().min(8, "Minimum 8 characters"),
  profileImageUrl: z.string().optional().or(z.literal(""))
});

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required")
});

export const createGymSchema = z.object({
  name: z.string().min(2),
  address: z.string().min(2),
  suburb: z.string().min(1),
  state: z.string().min(1),
  country: z.string().min(1),
  phone: z.string().optional(),
  heroImageUrl: z.string().optional().or(z.literal(""))
});

export const joinGymSchema = z.object({
  gymId: z.string().min(1)
});

export const eventSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(10),
  dateTimeStart: z.string().min(1),
  dateTimeEnd: z.string().min(1),
  skillLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "PRO"]),
  weightClassMinKg: z.coerce.number().min(40),
  weightClassMaxKg: z.coerce.number().min(40),
  stancePreference: z.enum(["ANY", "ORTHODOX", "SOUTHPAW", "SWITCH"]),
  maxParticipants: z.coerce.number().min(2)
});

export const fighterSchema = z.object({
  fullName: z.string().min(2),
  age: z.coerce.number().min(12),
  heightCm: z.coerce.number().min(120),
  weightKg: z.coerce.number().min(40),
  stance: z.enum(["ORTHODOX", "SOUTHPAW", "SWITCH"]),
  totalFights: z.coerce.number().min(0),
  wins: z.coerce.number().min(0),
  losses: z.coerce.number().min(0),
  profileImageUrl: z.string().optional().or(z.literal(""))
});

export const eventJoinSchema = z.object({
  eventId: z.string().min(1),
  fighterId: z.string().min(1)
});

export const sparRequestSchema = z.object({
  toCoachId: z.string().min(1),
  proposedGymId: z.string().min(1, "Select a proposed location"),
  proposedDateTime: z.string().min(1),
  message: z.string().min(4),
  fighterIds: z.array(z.string().min(1)).min(1, "Select at least one fighter")
});
