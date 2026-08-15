import { Ticket, User } from '../types';

/**
 * Checks if a ticket was raised by the given user (case-insensitive check across Employee ID, Email, User ID, and Name).
 */
export function isTicketRaisedByUser(ticket: Ticket, user: User | null | undefined): boolean {
  if (!user || !ticket) return false;

  const empId = (user.employeeId || '').trim().toLowerCase();
  const userId = (user.id || '').trim().toLowerCase();
  const userEmail = (user.email || '').trim().toLowerCase();
  const userName = (user.name || '').trim().toLowerCase();

  const ticketEmpId = (ticket.employeeId || '').trim().toLowerCase();
  const ticketEmail = (ticket.employeeEmail || '').trim().toLowerCase();
  const ticketName = (ticket.employeeName || '').trim().toLowerCase();

  if (empId && ticketEmpId && empId === ticketEmpId) return true;
  if (userId && ticketEmpId && userId === ticketEmpId) return true;
  if (userEmail && ticketEmail && userEmail === ticketEmail) return true;
  if (userName && ticketName && userName === ticketName) return true;

  return false;
}

/**
 * Checks if a ticket is assigned to the given support agent.
 */
export function isTicketAssignedToAgent(ticket: Ticket, user: User | null | undefined): boolean {
  if (!user || !ticket) return false;

  const userId = (user.id || '').trim().toLowerCase();
  const empId = (user.employeeId || '').trim().toLowerCase();
  const userName = (user.name || '').trim().toLowerCase();

  const assignedId = (ticket.assignedAgentId || '').trim().toLowerCase();
  const assignedName = (ticket.assignedAgentName || '').trim().toLowerCase();

  if (userId && assignedId && userId === assignedId) return true;
  if (empId && assignedId && empId === assignedId) return true;
  if (userName && assignedName && userName === assignedName) return true;

  return false;
}

/**
 * Gets list of tickets viewable by a specific user according to their role:
 * - Employee: ONLY their own tickets raised with their ID / Email.
 * - Support Agent / Manager: Can view queue or assigned tickets.
 * - Admin / Super Admin: All company tickets.
 */
export function getVisibleTicketsForUser(tickets: Ticket[], user: User | null | undefined): Ticket[] {
  if (!user) return [];
  if (user.role === 'Employee') {
    return tickets.filter(t => isTicketRaisedByUser(t, user));
  }
  return tickets;
}
