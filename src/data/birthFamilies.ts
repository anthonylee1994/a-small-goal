import type {BirthFamilyDef, BirthFamilyId} from "../types/game";

/**
 * Equal weight. Low class keeps a real poverty start but enough cash to trade
 * through early bad events and aim at the first shop / warehouse upgrade.
 */
export const BIRTH_FAMILIES: readonly BirthFamilyDef[] = [
    {id: "low_class", name: "死窮撚", startingCash: 45_000, weight: 1},
    {id: "middle_class", name: "死中產", startingCash: 100_000, weight: 1},
    {id: "high_class", name: "二世祖", startingCash: 1_000_000, weight: 1},
] as const;

export const BIRTH_FAMILY_MAP: Record<BirthFamilyId, BirthFamilyDef> = Object.fromEntries(BIRTH_FAMILIES.map(f => [f.id, f])) as Record<BirthFamilyId, BirthFamilyDef>;
