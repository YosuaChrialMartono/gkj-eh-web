export interface PelayanRole   { id: string; name: string; order: number }
export interface PelayanPerson { id: string; name: string }
export interface PelayanService {
  id: string; date: string          // "YYYY-MM-DD"
  label?: string; isExtra: boolean
}
export interface PelayanAssignment {
  id: string; serviceId: string; roleId: string; pelayanName: string
}
export interface PelayanRoleInput    { name: string; order?: number }
export interface PelayanServiceInput { date: string; label?: string; isExtra?: boolean }
export interface PelayanAssignmentInput { serviceId: string; roleId: string; pelayanName: string }
