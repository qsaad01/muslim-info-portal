function cleanText(str) {
  if (!str) return '';
  return str.replace(/\s+/g, ' ').trim();
}

function isValidScheme(scheme) {
  if (!scheme.name || scheme.name.length < 5) return false;
  if (!scheme.description || scheme.description.length < 10) return false;
  if (!scheme.category) return false;
  return true;
}

function cleanScheme(raw) {
  return {
    name:            cleanText(raw.name),
    description:     cleanText(raw.description),
    eligibility:     cleanText(raw.eligibility)    || 'See official website for eligibility details',
    category:        cleanText(raw.category)        || 'Government',
    location:        cleanText(raw.location)        || 'India',
    provider:        cleanText(raw.provider)        || '',
    link:            cleanText(raw.link)            || '',
    contact_name:    cleanText(raw.contact_name)    || '',
    contact_phone:   cleanText(raw.contact_phone)   || '',
    contact_email:   cleanText(raw.contact_email)   || '',
    contact_address: cleanText(raw.contact_address) || '',
    source_url:      cleanText(raw.source_url)      || '',
    deadline:        raw.deadline                   || null,
  };
}

module.exports = { cleanScheme, isValidScheme };