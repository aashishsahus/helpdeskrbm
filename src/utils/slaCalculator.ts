import { Ticket, User } from '../types';
import { isTicketRaisedByUser, isTicketAssignedToAgent } from './ticketSecurity';

export interface TicketDelayInfo {
  isDelayed: boolean;
  isDueSoon: boolean;
  isResolved: boolean;
  delayHours: number;
  delayMinutes: number;
  remainingHours: number;
  remainingMinutes: number;
  statusLabel: string;
  subLabel: string;
  badgeClass: string;
  dotColor: string;
  category: 'breached' | 'due-soon' | 'safe' | 'resolved';
}

export interface TicketRelationshipInfo {
  isRaisedByMe: boolean;
  isAssignedToMe: boolean;
  isMyDept: boolean;
  badgeLabel: string;
  badgeClass: string;
  iconType: 'raised' | 'assigned' | 'dept' | 'general';
  description: string;
}

/**
 * Calculates exact SLA delay or remaining time for a ticket.
 */
export function getTicketDelayInfo(ticket: Ticket): TicketDelayInfo {
  const isResolved = ticket.status === 'Resolved' || ticket.status === 'Closed';
  const now = new Date().getTime();
  const dueDate = ticket.slaDueDate ? new Date(ticket.slaDueDate).getTime() : now;
  const isOverdue = now > dueDate;
  const diffMs = dueDate - now;

  if (isResolved) {
    return {
      isDelayed: ticket.slaStatus === 'Breached',
      isDueSoon: false,
      isResolved: true,
      delayHours: 0,
      delayMinutes: 0,
      remainingHours: 0,
      remainingMinutes: 0,
      statusLabel: ticket.slaStatus === 'Breached' ? 'Resolved (Past SLA)' : 'Resolved On Time',
      subLabel: ticket.resolvedDate ? `Completed on ${new Date(ticket.resolvedDate).toLocaleDateString()}` : 'Completed',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dotColor: 'bg-emerald-500',
      category: 'resolved'
    };
  }

  // Active / Open ticket
  if (isOverdue || ticket.slaStatus === 'Breached') {
    const overdueMs = Math.abs(diffMs);
    const delayHours = Math.floor(overdueMs / (1000 * 60 * 60));
    const delayMinutes = Math.floor((overdueMs % (1000 * 60 * 60)) / (1000 * 60));

    const delayText = delayHours > 0 
      ? `Delayed by ${delayHours}h ${delayMinutes}m`
      : `Delayed by ${delayMinutes}m`;

    return {
      isDelayed: true,
      isDueSoon: false,
      isResolved: false,
      delayHours,
      delayMinutes,
      remainingHours: 0,
      remainingMinutes: 0,
      statusLabel: 'SLA Delayed (Breached)',
      subLabel: delayText,
      badgeClass: 'bg-red-50 text-red-700 border-red-300 animate-pulse',
      dotColor: 'bg-red-500',
      category: 'breached'
    };
  }

  // Safe or Due Soon
  const remainingHours = Math.floor(diffMs / (1000 * 60 * 60));
  const remainingMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  // If less than 4 hours remaining -> Due Soon
  if (remainingHours < 4) {
    const timeText = remainingHours > 0 
      ? `${remainingHours}h ${remainingMinutes}m left`
      : `${remainingMinutes}m left`;

    return {
      isDelayed: false,
      isDueSoon: true,
      isResolved: false,
      delayHours: 0,
      delayMinutes: 0,
      remainingHours,
      remainingMinutes,
      statusLabel: 'Delay Imminent (Due Soon)',
      subLabel: `Expires in ${timeText}`,
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-300 font-bold',
      dotColor: 'bg-amber-500',
      category: 'due-soon'
    };
  }

  // Normal / Healthy
  const timeText = remainingHours > 24
    ? `${Math.round(remainingHours / 24)} days left`
    : `${remainingHours}h left`;

  return {
    isDelayed: false,
    isDueSoon: false,
    isResolved: false,
    delayHours: 0,
    delayMinutes: 0,
    remainingHours,
    remainingMinutes,
    statusLabel: 'On Track (Within SLA)',
    subLabel: `${timeText} until target`,
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dotColor: 'bg-emerald-500',
    category: 'safe'
  };
}

/**
 * Determines whether a ticket was raised by the current user or assigned to them to resolve.
 */
export function getTicketRelationship(ticket: Ticket, user: User | null | undefined): TicketRelationshipInfo {
  if (!user) {
    return {
      isRaisedByMe: false,
      isAssignedToMe: false,
      isMyDept: false,
      badgeLabel: 'General Ticket',
      badgeClass: 'bg-gray-100 text-gray-700 border-gray-200',
      iconType: 'general',
      description: 'General organizational ticket'
    };
  }

  const raised = isTicketRaisedByUser(ticket, user);
  const assigned = isTicketAssignedToAgent(ticket, user);
  const deptMatch = user.department && ticket.department && (user.department.toLowerCase() === ticket.department.toLowerCase());

  if (raised && assigned) {
    return {
      isRaisedByMe: true,
      isAssignedToMe: true,
      isMyDept: true,
      badgeLabel: '📤 Raised & 📥 Assigned to You',
      badgeClass: 'bg-purple-50 text-purple-700 border-purple-300 font-bold',
      iconType: 'assigned',
      description: 'You raised this ticket and you are also assigned to resolve it'
    };
  }

  if (raised) {
    return {
      isRaisedByMe: true,
      isAssignedToMe: false,
      isMyDept: Boolean(deptMatch),
      badgeLabel: '📤 Raised by Me (My Request)',
      badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200 font-bold',
      iconType: 'raised',
      description: 'Ticket created by you seeking IT/operational support'
    };
  }

  if (assigned) {
    return {
      isRaisedByMe: false,
      isAssignedToMe: true,
      isMyDept: Boolean(deptMatch),
      badgeLabel: '📥 Assigned to Me (To Resolve)',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold',
      iconType: 'assigned',
      description: 'Support ticket assigned to you for resolution'
    };
  }

  if (deptMatch) {
    return {
      isRaisedByMe: false,
      isAssignedToMe: false,
      isMyDept: true,
      badgeLabel: `🏢 ${ticket.department} Queue`,
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 font-medium',
      iconType: 'dept',
      description: `Ticket belonging to your department (${ticket.department})`
    };
  }

  return {
    isRaisedByMe: false,
    isAssignedToMe: false,
    isMyDept: false,
    badgeLabel: '🌐 Org Ticket',
    badgeClass: 'bg-gray-100 text-gray-700 border-gray-200',
    iconType: 'general',
    description: 'General organizational ticket'
  };
}
