export const cn = (...classes) => classes.filter(Boolean).join(' ');

export const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num?.toString() || '0';
};

export const getTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

export const randomColor = () => {
  const colors = ['#6C63FF', '#EC4899', '#06B6D4', '#10B981', '#F97316', '#8B5CF6'];
  return colors[Math.floor(Math.random() * colors.length)];
};
