'use server';
import { auth } from '@/auth';
import { AppointmentSchema } from '@/schemas/appointment-definition';
import {
	PrismaClient,
	type appointment_status,
	type appointment_type,
} from '@prisma/client';
import type { z } from 'zod';
import { getPet } from './pets';

const getUserAppointments = async () => {
	const session = await auth();
	if (!session || !session.user || !session.user.email) {
		throw new Error('User not found');
	}
	const prisma = new PrismaClient();
	const appointments = await prisma.appointments.findMany({
		where: {
			pets: {
				user_id: Number(session.user.id),
			},
		},
		include: {
			pets: true,
			veterinarians: {
				include: {
					users: true,
				},
			},
		},
	});

	return Promise.resolve(appointments);
};

const createUserAppointment = async (
	values: z.infer<typeof AppointmentSchema>,
) => {
	const session = await auth();
	if (!session || !session.user || !session.user.email) {
		throw new Error('User not found');
	}
	const prisma = new PrismaClient();
	const pet = await getPet(values.pet_uuid);
	if (!pet) {
		throw await Promise.reject('Pet not found');
	}
	const appointment = await prisma.appointments.create({
		data: {
			appointment_date: values.appointment_date,
			appointment_type: values.appointment_type as appointment_type,
			status: values.status as appointment_status,
			notes: values.notes,
			pet_id: pet?.pet_id,
			vet_id: Number(values.vet_id),
		},
	});

	return Promise.resolve(appointment);
};

export { getUserAppointments, createUserAppointment };
