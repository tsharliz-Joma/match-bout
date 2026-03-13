import { PrismaClient, CoachPlan, CoachRole, CoachStatus, GymPlan, SkillLevel, Stance, StancePreference, EventJoinStatus, SparRequestStatus, NotificationType, JoinRequestStatus } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const daysFromNow = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);
const hoursAfter = (date: Date, hours: number) => new Date(date.getTime() + hours * 60 * 60 * 1000);

async function main() {
  await prisma.notification.deleteMany();
  await prisma.eventJoin.deleteMany();
  await prisma.sparRequestFighter.deleteMany();
  await prisma.sparRequest.deleteMany();
  await prisma.sparringEvent.deleteMany();
  await prisma.coachFighter.deleteMany();
  await prisma.fighter.deleteMany();
  await prisma.gymJoinRequest.deleteMany();
  await prisma.coachDevice.deleteMany();
  await prisma.gym.deleteMany();
  await prisma.coach.deleteMany();

  const passwordHash = await hash("password123", 10);

  const adminA = await prisma.coach.create({
    data: {
      fullName: "Ava Torres",
      email: "ava@ironharbor.com",
      passwordHash,
      role: CoachRole.GYM_ADMIN,
      status: CoachStatus.ONBOARDING,
      plan: CoachPlan.PRO,
      cancellationRate: 2.5,
      noShowRate: 1.2,
      responsivenessScore: 92,
      approvalRate: 88
    }
  });

  const adminB = await prisma.coach.create({
    data: {
      fullName: "Lena Park",
      email: "lena@northside.com",
      passwordHash,
      role: CoachRole.GYM_ADMIN,
      status: CoachStatus.ONBOARDING,
      plan: CoachPlan.FREE,
      cancellationRate: 4.1,
      noShowRate: 3.2,
      responsivenessScore: 78,
      approvalRate: 74
    }
  });

  const adminC = await prisma.coach.create({
    data: {
      fullName: "Kiara Brooks",
      email: "kiara@redline.com",
      passwordHash,
      role: CoachRole.GYM_ADMIN,
      status: CoachStatus.ONBOARDING,
      plan: CoachPlan.PRO,
      cancellationRate: 1.8,
      noShowRate: 0.9,
      responsivenessScore: 96,
      approvalRate: 91
    }
  });

  const gymA = await prisma.gym.create({
    data: {
      name: "Iron Harbor Boxing",
      createdByCoachId: adminA.id,
      address: "58 Dockside Ave",
      suburb: "Harbor District",
      state: "CA",
      country: "USA",
      phone: "+1 415 555 0199",
      heroImageUrl: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=1200&q=80",
      plan: GymPlan.FREE
    }
  });

  const gymB = await prisma.gym.create({
    data: {
      name: "Northside Fight Lab",
      createdByCoachId: adminB.id,
      address: "2210 Ridgeway Blvd",
      suburb: "Northside",
      state: "IL",
      country: "USA",
      phone: "+1 312 555 0117",
      heroImageUrl: "https://images.unsplash.com/photo-1517438322307-e67111335449?auto=format&fit=crop&w=1200&q=80",
      plan: GymPlan.FREE
    }
  });

  const gymC = await prisma.gym.create({
    data: {
      name: "Redline Combat Club",
      createdByCoachId: adminC.id,
      address: "901 Atlas Street",
      suburb: "East End",
      state: "NY",
      country: "USA",
      phone: "+1 646 555 0148",
      heroImageUrl: "https://images.unsplash.com/photo-1517964603305-721c7d6d19aa?auto=format&fit=crop&w=1200&q=80",
      plan: GymPlan.GYM_PRO
    }
  });

  await prisma.coach.update({
    where: { id: adminA.id },
    data: { gymId: gymA.id, status: CoachStatus.ACTIVE }
  });

  await prisma.coach.update({
    where: { id: adminB.id },
    data: { gymId: gymB.id, status: CoachStatus.ACTIVE }
  });

  await prisma.coach.update({
    where: { id: adminC.id },
    data: { gymId: gymC.id, status: CoachStatus.ACTIVE }
  });

  const coachA2 = await prisma.coach.create({
    data: {
      fullName: "Marcus Reed",
      email: "marcus@ironharbor.com",
      passwordHash,
      role: CoachRole.COACH,
      status: CoachStatus.ACTIVE,
      plan: CoachPlan.FREE,
      gymId: gymA.id,
      cancellationRate: 3.3,
      noShowRate: 2.1,
      responsivenessScore: 84,
      approvalRate: 79
    }
  });

  const coachB2 = await prisma.coach.create({
    data: {
      fullName: "Diego Santos",
      email: "diego@northside.com",
      passwordHash,
      role: CoachRole.COACH,
      status: CoachStatus.ACTIVE,
      plan: CoachPlan.FREE,
      gymId: gymB.id,
      cancellationRate: 5.4,
      noShowRate: 4.6,
      responsivenessScore: 72,
      approvalRate: 68
    }
  });

  const coachC2 = await prisma.coach.create({
    data: {
      fullName: "Harper Quinn",
      email: "harper@redline.com",
      passwordHash,
      role: CoachRole.COACH,
      status: CoachStatus.ACTIVE,
      plan: CoachPlan.PRO,
      gymId: gymC.id,
      cancellationRate: 2.2,
      noShowRate: 1.5,
      responsivenessScore: 90,
      approvalRate: 83
    }
  });

  const coachPending = await prisma.coach.create({
    data: {
      fullName: "Noah Patel",
      email: "noah@prospects.com",
      passwordHash,
      role: CoachRole.COACH,
      status: CoachStatus.PENDING_APPROVAL,
      plan: CoachPlan.FREE,
      cancellationRate: 0,
      noShowRate: 0,
      responsivenessScore: 0,
      approvalRate: 0
    }
  });

  await prisma.gymJoinRequest.create({
    data: {
      coachId: coachPending.id,
      gymId: gymC.id,
      status: JoinRequestStatus.PENDING
    }
  });

  await prisma.fighter.createMany({
    data: [
      { gymId: gymA.id, fullName: "Eli Navarro", age: 21, heightCm: 175, weightKg: 70, stance: Stance.ORTHODOX, totalFights: 12, wins: 9, losses: 3 },
      { gymId: gymA.id, fullName: "Jayden Cole", age: 24, heightCm: 182, weightKg: 77, stance: Stance.SOUTHPAW, totalFights: 18, wins: 14, losses: 4 },
      { gymId: gymA.id, fullName: "Miles Grant", age: 19, heightCm: 170, weightKg: 63, stance: Stance.SWITCH, totalFights: 6, wins: 4, losses: 2 },
      { gymId: gymA.id, fullName: "Omar Ruiz", age: 27, heightCm: 185, weightKg: 85, stance: Stance.ORTHODOX, totalFights: 22, wins: 16, losses: 6 },
      { gymId: gymB.id, fullName: "Seth Lin", age: 23, heightCm: 178, weightKg: 72, stance: Stance.SOUTHPAW, totalFights: 10, wins: 7, losses: 3 },
      { gymId: gymB.id, fullName: "Isaiah Brooks", age: 26, heightCm: 188, weightKg: 90, stance: Stance.ORTHODOX, totalFights: 20, wins: 13, losses: 7 },
      { gymId: gymB.id, fullName: "Caleb King", age: 20, heightCm: 173, weightKg: 66, stance: Stance.SWITCH, totalFights: 8, wins: 5, losses: 3 },
      { gymId: gymB.id, fullName: "Andre Voss", age: 25, heightCm: 180, weightKg: 79, stance: Stance.ORTHODOX, totalFights: 16, wins: 11, losses: 5 },
      { gymId: gymB.id, fullName: "Nico Alvarez", age: 22, heightCm: 177, weightKg: 74, stance: Stance.ORTHODOX, totalFights: 11, wins: 8, losses: 3 },
      { gymId: gymC.id, fullName: "Tariq Moss", age: 22, heightCm: 176, weightKg: 68, stance: Stance.SOUTHPAW, totalFights: 9, wins: 6, losses: 3 },
      { gymId: gymC.id, fullName: "Victor Hayes", age: 28, heightCm: 190, weightKg: 92, stance: Stance.ORTHODOX, totalFights: 24, wins: 17, losses: 7 },
      { gymId: gymC.id, fullName: "Rico Mendes", age: 19, heightCm: 168, weightKg: 60, stance: Stance.SWITCH, totalFights: 5, wins: 3, losses: 2 },
      { gymId: gymC.id, fullName: "Malik Rhodes", age: 27, heightCm: 183, weightKg: 80, stance: Stance.ORTHODOX, totalFights: 14, wins: 10, losses: 4 },
      { gymId: gymC.id, fullName: "Jordan Ellis", age: 24, heightCm: 181, weightKg: 76, stance: Stance.SOUTHPAW, totalFights: 13, wins: 9, losses: 4 }
    ]
  });

  const gymAFighters = await prisma.fighter.findMany({ where: { gymId: gymA.id } });
  const gymBFighters = await prisma.fighter.findMany({ where: { gymId: gymB.id } });
  const gymCFighters = await prisma.fighter.findMany({ where: { gymId: gymC.id } });

  await prisma.coachFighter.createMany({
    data: [
      ...gymAFighters.map((fighter) => ({ coachId: adminA.id, fighterId: fighter.id })),
      ...gymAFighters.map((fighter) => ({ coachId: coachA2.id, fighterId: fighter.id })),
      ...gymBFighters.map((fighter) => ({ coachId: adminB.id, fighterId: fighter.id })),
      ...gymBFighters.map((fighter) => ({ coachId: coachB2.id, fighterId: fighter.id })),
      ...gymCFighters.map((fighter) => ({ coachId: adminC.id, fighterId: fighter.id })),
      ...gymCFighters.map((fighter) => ({ coachId: coachC2.id, fighterId: fighter.id }))
    ]
  });

  const eventA1Start = daysFromNow(3);
  const eventA1 = await prisma.sparringEvent.create({
    data: {
      gymId: gymA.id,
      createdByCoachId: adminA.id,
      title: "Technical Sparring Night",
      description: "Controlled technical rounds focused on distance management and timing.",
      dateTimeStart: eventA1Start,
      dateTimeEnd: hoursAfter(eventA1Start, 2),
      skillLevel: SkillLevel.INTERMEDIATE,
      weightClassMinKg: 65,
      weightClassMaxKg: 78,
      stancePreference: StancePreference.ANY,
      maxParticipants: 10
    }
  });

  const eventA2Start = daysFromNow(6);
  const eventA2 = await prisma.sparringEvent.create({
    data: {
      gymId: gymA.id,
      createdByCoachId: coachA2.id,
      title: "Southpaw Specialists",
      description: "Southpaw-focused sparring blocks with tactical feedback.",
      dateTimeStart: eventA2Start,
      dateTimeEnd: hoursAfter(eventA2Start, 2),
      skillLevel: SkillLevel.ADVANCED,
      weightClassMinKg: 60,
      weightClassMaxKg: 72,
      stancePreference: StancePreference.SOUTHPAW,
      maxParticipants: 8
    }
  });

  const eventA3Start = daysFromNow(10);
  const eventA3 = await prisma.sparringEvent.create({
    data: {
      gymId: gymA.id,
      createdByCoachId: adminA.id,
      title: "Heavyweight Clash",
      description: "Heavyweight rounds with experienced partners.",
      dateTimeStart: eventA3Start,
      dateTimeEnd: hoursAfter(eventA3Start, 2),
      skillLevel: SkillLevel.PRO,
      weightClassMinKg: 85,
      weightClassMaxKg: 105,
      stancePreference: StancePreference.ANY,
      maxParticipants: 6
    }
  });

  const eventB1Start = daysFromNow(2);
  const eventB1 = await prisma.sparringEvent.create({
    data: {
      gymId: gymB.id,
      createdByCoachId: adminB.id,
      title: "Beginner Rhythm Rounds",
      description: "Structured beginner rounds with extra rest and coaching cues.",
      dateTimeStart: eventB1Start,
      dateTimeEnd: hoursAfter(eventB1Start, 2),
      skillLevel: SkillLevel.BEGINNER,
      weightClassMinKg: 55,
      weightClassMaxKg: 70,
      stancePreference: StancePreference.ANY,
      maxParticipants: 12
    }
  });

  const eventB2Start = daysFromNow(5);
  const eventB2 = await prisma.sparringEvent.create({
    data: {
      gymId: gymB.id,
      createdByCoachId: coachB2.id,
      title: "Switch Stance Clinic",
      description: "Partner drills and live rounds for switch stance athletes.",
      dateTimeStart: eventB2Start,
      dateTimeEnd: hoursAfter(eventB2Start, 2),
      skillLevel: SkillLevel.INTERMEDIATE,
      weightClassMinKg: 62,
      weightClassMaxKg: 76,
      stancePreference: StancePreference.SWITCH,
      maxParticipants: 8
    }
  });

  const eventB3Start = daysFromNow(9);
  const eventB3 = await prisma.sparringEvent.create({
    data: {
      gymId: gymB.id,
      createdByCoachId: adminB.id,
      title: "Pressure Fighters Night",
      description: "Short rounds tailored for pressure fighters and counters.",
      dateTimeStart: eventB3Start,
      dateTimeEnd: hoursAfter(eventB3Start, 2),
      skillLevel: SkillLevel.ADVANCED,
      weightClassMinKg: 70,
      weightClassMaxKg: 82,
      stancePreference: StancePreference.ANY,
      maxParticipants: 10
    }
  });

  const eventC1Start = daysFromNow(4);
  const eventC1 = await prisma.sparringEvent.create({
    data: {
      gymId: gymC.id,
      createdByCoachId: adminC.id,
      title: "Redline Pro Camp",
      description: "High-intensity pro rounds with limited slots.",
      dateTimeStart: eventC1Start,
      dateTimeEnd: hoursAfter(eventC1Start, 2),
      skillLevel: SkillLevel.PRO,
      weightClassMinKg: 68,
      weightClassMaxKg: 90,
      stancePreference: StancePreference.ANY,
      maxParticipants: 6
    }
  });

  const eventC2Start = daysFromNow(7);
  const eventC2 = await prisma.sparringEvent.create({
    data: {
      gymId: gymC.id,
      createdByCoachId: adminC.id,
      title: "Precision Counter Day",
      description: "Counter-punching emphasis with video review.",
      dateTimeStart: eventC2Start,
      dateTimeEnd: hoursAfter(eventC2Start, 2),
      skillLevel: SkillLevel.INTERMEDIATE,
      weightClassMinKg: 60,
      weightClassMaxKg: 75,
      stancePreference: StancePreference.ANY,
      maxParticipants: 8
    }
  });

  await prisma.eventJoin.createMany({
    data: [
      { eventId: eventA1.id, coachId: coachB2.id, fighterId: gymBFighters[0].id, status: EventJoinStatus.PENDING },
      { eventId: eventB1.id, coachId: coachA2.id, fighterId: gymAFighters[1].id, status: EventJoinStatus.APPROVED },
      { eventId: eventC1.id, coachId: adminA.id, fighterId: gymAFighters[3].id, status: EventJoinStatus.PENDING },
      { eventId: eventB3.id, coachId: adminC.id, fighterId: gymCFighters[1].id, status: EventJoinStatus.APPROVED }
    ]
  });

  await prisma.sparRequest.create({
    data: {
      fromCoachId: coachA2.id,
      toCoachId: coachB2.id,
      proposedGymId: gymA.id,
      proposedDateTime: daysFromNow(12),
      message: "Looking for midweight rounds with solid ring IQ.",
      status: SparRequestStatus.PENDING,
      fighters: {
        createMany: {
          data: [
            { fighterId: gymAFighters[0].id },
            { fighterId: gymAFighters[1].id }
          ]
        }
      }
    }
  });

  await prisma.sparRequest.create({
    data: {
      fromCoachId: adminB.id,
      toCoachId: adminA.id,
      proposedGymId: gymB.id,
      proposedDateTime: daysFromNow(14),
      message: "We can host a technical session next week.",
      status: SparRequestStatus.ACCEPTED,
      fighters: {
        createMany: {
          data: [
            { fighterId: gymBFighters[0].id }
          ]
        }
      }
    }
  });

  await prisma.sparRequest.create({
    data: {
      fromCoachId: adminC.id,
      toCoachId: coachA2.id,
      proposedGymId: gymC.id,
      proposedDateTime: daysFromNow(8),
      message: "Interested in a southpaw matchup for Tariq.",
      status: SparRequestStatus.PENDING,
      fighters: {
        createMany: {
          data: [
            { fighterId: gymCFighters[0].id }
          ]
        }
      }
    }
  });

  await prisma.sparRequest.create({
    data: {
      fromCoachId: coachB2.id,
      toCoachId: adminC.id,
      proposedGymId: gymB.id,
      proposedDateTime: daysFromNow(15),
      message: "We have a heavyweight looking for rounds.",
      status: SparRequestStatus.DECLINED,
      fighters: {
        createMany: {
          data: [
            { fighterId: gymBFighters[1].id }
          ]
        }
      }
    }
  });

  await prisma.notification.createMany({
    data: [
      {
        toCoachId: adminA.id,
        type: NotificationType.EVENT_JOINED,
        title: "New event join request",
        body: "Northside Fight Lab requested to join Technical Sparring Night.",
        linkUrl: "/app/requests"
      },
      {
        toCoachId: coachB2.id,
        type: NotificationType.REQUEST_RECEIVED,
        title: "New spar request",
        body: "Marcus Reed sent a spar request proposal.",
        linkUrl: "/app/requests"
      },
      {
        toCoachId: coachA2.id,
        type: NotificationType.REQUEST_ACCEPTED,
        title: "Request accepted",
        body: "Northside Fight Lab accepted your spar request.",
        linkUrl: "/app/requests"
      },
      {
        toCoachId: adminC.id,
        type: NotificationType.EVENT_JOINED,
        title: "Event join approved",
        body: "A coach has been approved for Pressure Fighters Night.",
        linkUrl: "/app/events"
      },
      {
        toCoachId: adminC.id,
        type: NotificationType.REQUEST_DECLINED,
        title: "Request declined",
        body: "A spar request was declined.",
        linkUrl: "/app/requests"
      },
      {
        toCoachId: coachPending.id,
        type: NotificationType.REQUEST_RECEIVED,
        title: "Join request received",
        body: "Your request to join Redline Combat Club is pending approval.",
        linkUrl: "/auth/onboarding"
      }
    ]
  });

  console.log("Seed data inserted");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
