const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export const VEHICLE_TYPES = ["sedan", "hatchback", "estate", "suv", "minivan", "van", "coupe", "convertible", "pickup"] as const;
export const FUEL_TYPES = ["petrol", "diesel", "hybrid", "plugin_hybrid", "electric", "gas", "other"] as const;
export const VEHICLE_COLORS = ["white", "black", "grey", "silver", "blue", "red", "green", "yellow", "orange", "brown", "beige", "other"] as const;

export interface Vehicle {
  id: number;
  brand: string;
  model: string;
  vehicle_type: string;
  color: string;
  doors: number;
  seats: number;
  year?: number | null;
  fuel_type?: string | null;
}

export type VehicleInput = Omit<Vehicle, "id">;

async function parseError(res: Response, fallback: string): Promise<never> {
  let message = fallback;
  try {
    const data = await res.json();
    message = data.errors?.join(", ") || data.error || message;
  } catch {
    // keep fallback
  }
  throw new Error(message);
}

export async function getMyVehicles(): Promise<Vehicle[]> {
  const res = await fetch(`${API_BASE}/api/v1/vehicles`, { credentials: "include" });
  if (!res.ok) return parseError(res, "Error fetching vehicles");
  return res.json();
}

export async function createVehicle(vehicle: VehicleInput): Promise<Vehicle> {
  const res = await fetch(`${API_BASE}/api/v1/vehicles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ vehicle }),
  });
  if (!res.ok) return parseError(res, "Error creating vehicle");
  return res.json();
}

export async function deleteVehicle(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/vehicles/${id}`, { method: "DELETE", credentials: "include" });
  if (!res.ok) return parseError(res, "Error deleting vehicle");
}
