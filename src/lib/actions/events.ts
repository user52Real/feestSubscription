'use server'

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/db/connection";
import { Event } from "@/lib/db/models/event";
import { redirect } from "next/navigation";
import { z } from "zod";

const eventSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  venue: z.string(),
  address: z.string(),
  capacity: z.number().min(1)
});

export async function createEvent(formData: FormData) {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    await dbConnect();
    
    const validatedFields = eventSchema.safeParse({
      title: formData.get('title'),
      description: formData.get('description'),
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate'),
      venue: formData.get('venue'),
      address: formData.get('address'),
      capacity: Number(formData.get('capacity'))
    });

    if (!validatedFields.success) {
      return {
        error: "Invalid form data"
      };
    }

    const event = await Event.create({
      ...validatedFields.data,
      location: {
        venue: validatedFields.data.venue,
        address: validatedFields.data.address,
      },
      organizerId: userId,
      status: 'draft',
      visibility: 'private'
    });

    revalidatePath('/events');
    redirect(`/events/${event._id}`);
  } catch (error) {
    return {
      error: "Failed to create event"
    };
  }
}