import { z } from 'zod';

export const createTournamentSchema = z
    .object({
        name: z.string({ required_error: 'Name is required' }).min(1, 'Name cannot be empty'),
        discipline: z.string({ required_error: 'Discipline is required' }).min(1, 'Discipline cannot be empty'),
        time: z.coerce
            .date({
                required_error: 'Tournament date is required',
                invalid_type_error: 'Invalid date format for tournament time',
            })
            .min(new Date(), 'You cannot set deadlines in the past'),
        location: z.string({ required_error: 'Location is required' }).min(1, 'Location cannot be empty'),
        maxParticipants: z.coerce
            .number({ required_error: 'Maximum participants is required' })
            .int('Maximum participants must be an integer')
            .min(2, 'Participant limit cannot be below 2'),
        applicationDeadline: z.coerce
            .date({
                required_error: 'Application deadline is required',
                invalid_type_error: 'Invalid date format for application deadline',
            })
            .min(new Date(), 'You cannot set deadlines in the past'),
    })
    .refine(
        (data) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return data.applicationDeadline >= today;
        },
        {
            message: 'Application deadline cannot be in the past',
            path: ['applicationDeadline'],
        },
    )
    .refine(
        (data) => {
            return data.time > data.applicationDeadline;
        },
        {
            message: 'Tournament time must be after the application deadline',
            path: ['time'],
        },
    );

export const updateTournamentSchema = z
    .object({
        name: z.string().min(1, 'Name cannot be empty').optional(),
        time: z.coerce.date({ invalid_type_error: 'Invalid date format for tournament time' }).optional(),
        location: z.string().min(1, 'Location cannot be empty').optional(),
        maxParticipants: z.coerce
            .number()
            .int('Maximum participants must be an integer')
            .min(2, 'Participant limit cannot be below 2')
            .optional(),
        applicationDeadline: z.coerce
            .date({ invalid_type_error: 'Invalid date format for application deadline' })
            .optional(),
    })
    .refine(
        (data) => {
            if (data.applicationDeadline === undefined) return true;
            if (data.time === undefined) return true;
            return data.time > data.applicationDeadline;
        },
        {
            message: 'Tournament time must be after the application deadline',
            path: ['time'],
        },
    );
