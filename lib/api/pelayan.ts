import { apiClient } from "./client"
import type {
  PelayanRole,
  PelayanPerson,
  PelayanService,
  PelayanAssignment,
  PelayanRoleInput,
  PelayanServiceInput,
  PelayanAssignmentInput,
} from "@/lib/types"

// --- Roles ---

export async function getRoles(): Promise<PelayanRole[]> {
  return apiClient("/pelayan/roles")
}

export async function createRole(input: PelayanRoleInput): Promise<PelayanRole> {
  return apiClient("/pelayan/roles", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export async function updateRole(id: string, input: PelayanRoleInput): Promise<PelayanRole> {
  return apiClient(`/pelayan/roles/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  })
}

export async function deleteRole(id: string): Promise<void> {
  return apiClient(`/pelayan/roles/${id}`, { method: "DELETE" })
}

// --- Persons ---

export async function getPersons(): Promise<PelayanPerson[]> {
  return apiClient("/pelayan/persons")
}

export async function createPerson(name: string): Promise<PelayanPerson> {
  return apiClient("/pelayan/persons", {
    method: "POST",
    body: JSON.stringify({ name }),
  })
}

export async function deletePerson(id: string): Promise<void> {
  return apiClient(`/pelayan/persons/${id}`, { method: "DELETE" })
}

// --- Services ---

export async function getServices(month: string): Promise<PelayanService[]> {
  return apiClient("/pelayan/services", { params: { month } })
}

export async function createService(input: PelayanServiceInput): Promise<PelayanService> {
  return apiClient("/pelayan/services", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export async function updateService(id: string, input: PelayanServiceInput): Promise<PelayanService> {
  return apiClient(`/pelayan/services/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  })
}

export async function deleteService(id: string): Promise<void> {
  return apiClient(`/pelayan/services/${id}`, { method: "DELETE" })
}

// --- Assignments ---

export async function getAssignments(serviceId: string): Promise<PelayanAssignment[]> {
  return apiClient("/pelayan/assignments", { params: { serviceId } })
}

export async function upsertAssignment(input: PelayanAssignmentInput): Promise<PelayanAssignment> {
  return apiClient("/pelayan/assignments", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export async function deleteAssignment(id: string): Promise<void> {
  return apiClient(`/pelayan/assignments/${id}`, { method: "DELETE" })
}
