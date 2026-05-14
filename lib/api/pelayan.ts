import { authenticatedApiClient } from "./client"
import { getAccessToken } from "@/lib/auth/server-utils"
import type {
  PelayanRole,
  PelayanPerson,
  PelayanService,
  PelayanAssignment,
  PelayanRoleInput,
  PelayanServiceInput,
  PelayanAssignmentInput,
} from "@/lib/types"

type RequestInitWithParams = RequestInit & {
  params?: Record<string, string | number | boolean | undefined>
}

async function authed<T>(path: string, init?: RequestInitWithParams): Promise<T> {
  const token = await getAccessToken()
  if (!token) throw { message: "Not authenticated", status: 401 }
  return authenticatedApiClient<T>(token, path, init)
}

// --- Roles ---

export async function getRoles(): Promise<PelayanRole[]> {
  return authed("/pelayan/roles")
}

export async function createRole(input: PelayanRoleInput): Promise<PelayanRole> {
  return authed("/pelayan/roles", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export async function updateRole(id: string, input: PelayanRoleInput): Promise<PelayanRole> {
  return authed(`/pelayan/roles/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  })
}

export async function deleteRole(id: string): Promise<void> {
  return authed(`/pelayan/roles/${id}`, { method: "DELETE" })
}

// --- Persons ---

export async function getPersons(): Promise<PelayanPerson[]> {
  return authed("/pelayan/persons")
}

export async function createPerson(name: string): Promise<PelayanPerson> {
  return authed("/pelayan/persons", {
    method: "POST",
    body: JSON.stringify({ name }),
  })
}

export async function deletePerson(id: string): Promise<void> {
  return authed(`/pelayan/persons/${id}`, { method: "DELETE" })
}

// --- Services ---

export async function getServices(month: string): Promise<PelayanService[]> {
  return authed("/pelayan/services", { params: { month } })
}

export async function createService(input: PelayanServiceInput): Promise<PelayanService> {
  return authed("/pelayan/services", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export async function updateService(id: string, input: PelayanServiceInput): Promise<PelayanService> {
  return authed(`/pelayan/services/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  })
}

export async function deleteService(id: string): Promise<void> {
  return authed(`/pelayan/services/${id}`, { method: "DELETE" })
}

// --- Assignments ---

export async function getAssignments(serviceId: string): Promise<PelayanAssignment[]> {
  return authed("/pelayan/assignments", { params: { serviceId } })
}

export async function upsertAssignment(input: PelayanAssignmentInput): Promise<PelayanAssignment> {
  return authed("/pelayan/assignments", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export async function deleteAssignment(id: string): Promise<void> {
  return authed(`/pelayan/assignments/${id}`, { method: "DELETE" })
}
