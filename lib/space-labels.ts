/** Централни етикети вместо „пространства“ */
export const SPACE_LABEL = {
  one: "Секция",
  many: "Секции",
  oneLower: "секция",
  manyLower: "секции",
  oneAcc: "секцията",
  manyAcc: "секциите",
} as const;

export const SPACE_ACCESS_LABELS: Record<string, string> = {
  PUBLIC: "Публична",
  MEMBERS: "Само за мембъри",
  RESTRICTED: "Затворена (с покани)",
};
