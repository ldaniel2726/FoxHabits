import { z } from "zod";

export const entryUpdateSchema = z.object({
  habit_id: z.number().int().positive(),
  datetime: z.string().datetime().optional().default(new Date().toISOString()),
  time_of_entry: z.string().datetime(),
  type_of_entry: z.enum(["done", "skipped"]).default("done"),
});

// export const habitSchema

export const validateEntryId = (id: string | undefined) => {
  if (!id) {
    return { error: "INVALID_ID" };
  }
  if (isNaN(Number(id))) {
    return { error: "INVALID_ID_TYPE" };
  }
  return { id: Number(id) };
};
