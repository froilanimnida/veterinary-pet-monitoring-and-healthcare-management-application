import { z } from 'zod'
import { Breeds } from './types/breed-types'

const breedsStringArray: string[] = []

for (const breed in Breeds) {
    breedsStringArray.push(breed)
}

export const PetSchema = z.object({
    name: z.string().min(1).max(50),
    sex: z.enum(['male', 'female', 'prefer-not-to-say']),
    species: z.string().min(1).max(50),
    breed: z.string(),
    date_of_birth: z.date(),
    weight_kg: z.number(),
    medical_history: z.string(),
    vaccination_status: z.string()
})
