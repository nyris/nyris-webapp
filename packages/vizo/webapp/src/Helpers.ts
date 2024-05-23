export const groupFiltersByFirstLetter = (filters: string[]) => {
  if (!filters) {
    return {};
  }
  const groupedStrings: { [key: string]: string[] } = {};

  filters.sort((a, b) => a.localeCompare(b)).forEach((str) => {
    const firstLetter = str[0].toUpperCase();
    if (!groupedStrings[firstLetter]) {
      groupedStrings[firstLetter] = [];
    }
    groupedStrings[firstLetter].push(str);
  });

  return groupedStrings;
};
