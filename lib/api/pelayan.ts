import { authenticatedApiClient } from "./client"
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

export async function getRoles(token: string): Promise<PelayanRole[]> {
  return authenticatedApiClient(token, "/pelayan/roles")
}

export async function createRole(token: string, input: PelayanRoleInput): Promise<PelayanRole> {
  return authenticatedApiClient(token, "/pelayan/roles", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export async function updateRole(token: string, id: string, input: PelayanRoleInput): Promise<PelayanRole> {
  return authenticatedApiClient(token, `/pelayan/roles/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  })
}

export async function deleteRole(token: string, id: string): Promise<void> {
  return authenticatedApiClient(token, `/pelayan/roles/${id}`, { method: "DELETE" })
}

// --- Persons ---

export async function getPersons(token: string): Promise<PelayanPerson[]> {
  return authenticatedApiClient(token, "/pelayan/persons")
}

export async function createPerson(token: string, name: string): Promise<PelayanPerson> {
  return authenticatedApiClient(token, "/pelayan/persons", {
    method: "POST",
    body: JSON.stringify({ name }),
  })
}

export async function deletePerson(token: string, id: string): Promise<void> {
  return authenticatedApiClient(token, `/pelayan/persons/${id}`, { method: "DELETE" })
}

// --- Services ---

export async function getServices(token: string, month: string): Promise<PelayanService[]> {
  return authenticatedApiClient(token, "/pelayan/services", { params: { month } })
}

export async function createService(token: string, input: PelayanServiceInput): Promise<PelayanService> {
  return authenticatedApiClient(token, "/pelayan/services", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export async function updateService(token: string, id: string, input: PelayanServiceInput): Promise<PelayanService> {
  return authenticatedApiClient(token, `/pelayan/services/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  })
}

export async function deleteService(token: string, id: string): Promise<void> {
  return authenticatedApiClient(token, `/pelayan/services/${id}`, { method: "DELETE" })
}

// --- Assignments ---

export async function getAssignments(token: string, serviceId: string): Promise<PelayanAssignment[]> {
  return authenticatedApiClient(token, "/pelayan/assignments", { params: { serviceId } })
}

export async function upsertAssignment(token: string, input: PelayanAssignmentInput): Promise<PelayanAssignment> {
  return authenticatedApiClient(token, "/pelayan/assignments", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export async function deleteAssignment(token: string, id: string): Promise<void> {
  return authenticatedApiClient(token, `/pelayan/assignments/${id}`, { method: "DELETE" })
}
