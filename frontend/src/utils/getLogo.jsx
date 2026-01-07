export const getLogo = (community) => {
  if (community.abbreviation) {
    return community.abbreviation.toUpperCase();
  }
  if (community.name_en) {
    const initials = community.name_en
      .trim()
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();

    return initials.slice(0, 3);
  }
  if (community.slug) {
    const initials = community.slug
      .split('-')
      .filter(part => isNaN(part))
      .map(part => part[0])
      .join('')
      .toUpperCase();

    return initials.slice(0, 3);
  }
};