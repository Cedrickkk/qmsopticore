export const getActionTitle = (action: string) => {
  switch (action) {
    case 'created':
      return 'Document Created';
    case 'updated':
      return 'Document Updated';
    case 'status_changed':
      return 'Status Changed';
    default:
      return action.charAt(0).toUpperCase() + action.slice(1).replace('_', ' ');
  }
};
