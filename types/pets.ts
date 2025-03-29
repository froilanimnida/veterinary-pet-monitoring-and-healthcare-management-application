import type { pets } from "@prisma/client";

export type Pets = Omit<pets, "weight_kg"> & {
    weight_kg: string;
};
