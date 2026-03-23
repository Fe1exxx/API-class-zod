import { z } from "zod";

type ApiRes<T> = | { status: "accept"; value: T } | { status: "error"; value: Error | string };

class Fetch {
    constructor(public baseUrl: string) {
        this.baseUrl = baseUrl.replace(/\/$/, '');
    }

    async getFetch<T>(link: string, schema?: z.ZodType<T>): Promise<ApiRes<T>> {
        try {
            const cleanLink = link.replace(/^\//, '');
            const url = `${this.baseUrl}/${cleanLink}`;
            
            const response = await fetch(url);
            if (!response.ok) throw new Error("Error response: " + response.status);

            const data = await response.json();

            if (schema) {
                const parsed = schema.safeParse(data);
                if (!parsed.success) {
                    throw new Error(`Validation error: ${parsed.error.message}`);
                }
                return { status: "accept", value: parsed.data };
            }

            return { status: "accept", value: data };
        } catch (err) {
            console.error(err);
            return {
                status: "error",
                value: err instanceof Error ? err : String(err),
            };
        }
    }
}

// Схемы 
const UserSchema = z.object({
    id: z.number(),
    name: z.string(),
    age: z.number(),
});

const StorageSchema = z.object({
    id: z.number(),
    product: z.string(),
    status: z.string(),
});

type User = z.infer<typeof UserSchema>;
type Storage = z.infer<typeof StorageSchema>;

//  Использование 
const db = new Fetch("/api"); 

const users = await db.getFetch<User[]>("users", UserSchema.array());
const products = await db.getFetch<Storage[]>("products", StorageSchema.array());
const config = await db.getFetch<Record<string, any>>("config");
