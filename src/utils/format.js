export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
};

export const generateDocumentNumber = (prefix, existingDocs) => {
  const date = new Date();
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const datePrefix = `${yy}${mm}${dd}`;

  // Filter docs from today matching the prefix
  const todayDocs = existingDocs.filter(doc => {
    return doc.number && doc.number.startsWith(`${prefix}-${datePrefix}`);
  });

  // Determine the next sequence number
  const nextSeq = todayDocs.length + 1;
  const seqStr = String(nextSeq).padStart(3, '0');

  return `${prefix}-${datePrefix}${seqStr}`;
};
