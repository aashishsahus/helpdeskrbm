export interface HierarchyItem {
  id?: string;
  type: string;
  category: string;
  module: string;
  subCategory: string;
}

export const DEFAULT_TICKET_HIERARCHY_DATA: HierarchyItem[] = [
  // FMS Module mappings
  { type: 'Modification Request', category: 'FMS', module: 'Material', subCategory: 'Remove Material Name' },
  { type: 'Modification Request', category: 'FMS', module: 'Material', subCategory: 'Change Material Name' },
  { type: 'Modification Request', category: 'FMS', module: 'Material', subCategory: 'Change QTY' },
  { type: 'New Request', category: 'FMS', module: 'Material', subCategory: 'New Material Add' },
  { type: 'New Request', category: 'FMS', module: 'Entry', subCategory: 'New Entry' },
  { type: 'Modification Request', category: 'FMS', module: 'Item', subCategory: 'Replace Item Name' },
  { type: 'Modification Request', category: 'FMS', module: 'Status', subCategory: 'Status Change' },
  { type: 'Modification Request', category: 'FMS', module: 'FMS', subCategory: 'Step Check & Back' },
  { type: 'Support / How-To', category: 'FMS', module: 'FMS', subCategory: 'FMS Related Help' },

  // Orbit Module mappings
  { type: 'Modification Request', category: 'Orbit', module: 'Invoice', subCategory: 'Add Item' },
  { type: 'Modification Request', category: 'Orbit', module: 'Invoice', subCategory: 'Remove Item' },
  { type: 'Modification Request', category: 'Orbit', module: 'Invoice', subCategory: 'Change Material Name' },
  { type: 'Modification Request', category: 'Orbit', module: 'Invoice', subCategory: 'Change QTY' },
  { type: 'Modification Request', category: 'Orbit', module: 'Invoice', subCategory: 'Price Change' },
  { type: 'Modification Request', category: 'Orbit', module: 'Invoice', subCategory: 'Price Update' },
  { type: 'Modification Request', category: 'Orbit', module: 'Invoice', subCategory: 'Status Change' },
  { type: 'New Request', category: 'Orbit', module: 'Invoice', subCategory: 'New Invoice Entry' },
  { type: 'Modification Request', category: 'Orbit', module: 'Order', subCategory: 'Add Item' },
  { type: 'Modification Request', category: 'Orbit', module: 'Order', subCategory: 'Remove Item' },
  { type: 'Modification Request', category: 'Orbit', module: 'Order', subCategory: 'Change Material Name' },
  { type: 'Modification Request', category: 'Orbit', module: 'Order', subCategory: 'Change QTY' },
  { type: 'Modification Request', category: 'Orbit', module: 'Order', subCategory: 'Price Change' },
  { type: 'Modification Request', category: 'Orbit', module: 'Order', subCategory: 'Status Change' },
  { type: 'New Request', category: 'Orbit', module: 'Order', subCategory: 'New Order Entry' },
  { type: 'Modification Request', category: 'Orbit', module: 'Quotation', subCategory: 'Add Item' },
  { type: 'Modification Request', category: 'Orbit', module: 'Quotation', subCategory: 'Remove Item' },
  { type: 'Modification Request', category: 'Orbit', module: 'Quotation', subCategory: 'Change Material Name' },
  { type: 'Modification Request', category: 'Orbit', module: 'Quotation', subCategory: 'Change QTY' },
  { type: 'Modification Request', category: 'Orbit', module: 'Quotation', subCategory: 'Price Change' },
  { type: 'Modification Request', category: 'Orbit', module: 'Quotation', subCategory: 'Validity Date' },
  { type: 'New Request', category: 'Orbit', module: 'Quotation', subCategory: 'New Quotation Entry' },
  { type: 'New Request', category: 'Orbit', module: 'Lead', subCategory: 'New Lead Create' },
  { type: 'Approval Request', category: 'Orbit', module: 'Customer', subCategory: 'Customer Approve' },
  { type: 'Approval Request', category: 'Orbit', module: 'Customer', subCategory: 'Customer Hard Limit' },
  { type: 'Approval Request', category: 'Orbit', module: 'Vendor', subCategory: 'Vendor Approve' },
  { type: 'Verification Request', category: 'Orbit', module: 'Stock', subCategory: 'Physical Stock Verification' },
  { type: 'Modification Request', category: 'Orbit', module: 'Stock', subCategory: 'Stock Transfer' },
  { type: 'Issue / Bug', category: 'Orbit', module: 'Stock', subCategory: 'Damage Stock' },
  { type: 'New Request', category: 'Orbit', module: 'Receipt Voucher', subCategory: 'New Receipt Voucher' },
  { type: 'New Request', category: 'Orbit', module: 'Payment Voucher', subCategory: 'New Payment Voucher' },
  { type: 'New Request', category: 'Orbit', module: 'Journal Voucher', subCategory: 'New Journal Voucher' },
  { type: 'Approval Request', category: 'Orbit', module: 'Journal Voucher', subCategory: 'Journal Voucher Approve' },
  { type: 'Modification Request', category: 'Orbit', module: 'Credit Note', subCategory: 'Credit Note' },
  { type: 'New Request', category: 'Orbit', module: 'Professional', subCategory: 'Professional Name Add' },
  { type: 'New Request', category: 'Orbit', module: 'Consignment', subCategory: 'New Consignment' }
];

export const DEFAULT_TICKET_TYPES: string[] = [
  'Modification Request',
  'New Request',
  'Support / How-To',
  'Approval Request',
  'Verification Request',
  'Issue / Bug'
];

export const TICKET_HIERARCHY_DATA = DEFAULT_TICKET_HIERARCHY_DATA;
export const TICKET_TYPES = DEFAULT_TICKET_TYPES;

export function getStoredHierarchy(): HierarchyItem[] {
  try {
    const saved = localStorage.getItem('hd_ticket_hierarchy_v1');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse stored hierarchy:', e);
  }
  return DEFAULT_TICKET_HIERARCHY_DATA;
}

export function saveStoredHierarchy(items: HierarchyItem[]): void {
  try {
    localStorage.setItem('hd_ticket_hierarchy_v1', JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save hierarchy:', e);
  }
}

export function getStoredTicketTypes(): string[] {
  try {
    const saved = localStorage.getItem('hd_ticket_types_v1');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse stored ticket types:', e);
  }
  return DEFAULT_TICKET_TYPES;
}

export function saveStoredTicketTypes(types: string[]): void {
  try {
    localStorage.setItem('hd_ticket_types_v1', JSON.stringify(types));
  } catch (e) {
    console.error('Failed to save ticket types:', e);
  }
}

/**
 * Get distinct categories that match a specific type, or return all unique categories
 */
export function getCategoriesForType(selectedType?: string, allRegisteredCategoryNames: string[] = []): string[] {
  const data = getStoredHierarchy();
  const customCats = Array.from(new Set(
    data
      .filter(item => !selectedType || item.type === selectedType)
      .map(item => item.category)
  ));

  const merged = Array.from(new Set([...customCats, ...allRegisteredCategoryNames]));
  return merged.length > 0 ? merged : ['Orbit', 'FMS', 'Hardware', 'Software', 'Network & Internet'];
}

/**
 * Get distinct modules for a given Category and optional Type
 */
export function getModulesForCategory(category: string, selectedType?: string): string[] {
  const data = getStoredHierarchy();
  const filtered = data.filter(
    item => item.category.toLowerCase() === category.toLowerCase() &&
      (!selectedType || item.type === selectedType)
  );

  const modules = Array.from(new Set(filtered.map(i => i.module)));
  if (modules.length > 0) {
    return modules;
  }

  // Fallback modules for general IT/Corporate categories
  if (category.toLowerCase().includes('hardware')) {
    return ['Desktop/Laptop', 'Peripherals', 'Printers & Scanners', 'Server Hardware'];
  }
  if (category.toLowerCase().includes('software') || category.toLowerCase().includes('erp')) {
    return ['Application Access', 'Installation / Upgrade', 'Bug / Error', 'User License'];
  }
  if (category.toLowerCase().includes('network')) {
    return ['Wi-Fi / LAN', 'VPN Access', 'Internet Speed', 'Firewall'];
  }
  if (category.toLowerCase().includes('accounts') || category.toLowerCase().includes('fms')) {
    return ['Invoice & Billing', 'Ledger', 'GST / Tax', 'Vouchers'];
  }

  return ['General', 'Operations', 'Access & Permission'];
}

/**
 * Get sub-categories for a given Category, Module, and optional Type
 */
export function getSubCategoriesForModule(category: string, module: string, selectedType?: string, fallbackSubCategories: string[] = []): string[] {
  const data = getStoredHierarchy();
  const filtered = data.filter(
    item => item.category.toLowerCase() === category.toLowerCase() &&
      item.module.toLowerCase() === module.toLowerCase() &&
      (!selectedType || item.type === selectedType)
  );

  const subCategories = Array.from(new Set(filtered.map(i => i.subCategory)));
  if (subCategories.length > 0) {
    return subCategories;
  }

  // If no exact match with type, return any subCategory for this module
  const moduleOnly = data.filter(
    item => item.category.toLowerCase() === category.toLowerCase() &&
      item.module.toLowerCase() === module.toLowerCase()
  );
  if (moduleOnly.length > 0) {
    return Array.from(new Set(moduleOnly.map(i => i.subCategory)));
  }

  return fallbackSubCategories.length > 0 ? fallbackSubCategories : ['General Request', 'System Update', 'Issue Resolution'];
}
