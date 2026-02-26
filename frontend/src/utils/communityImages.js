export const buildImageSlotsPayload = ({
  coverSlot,
  gallerySlots = [],
  appendFile,
}) => {
  const manifest = [];
  let fileIndex = 0;

  const addFile = (file) => {
    if (typeof appendFile === 'function') {
      appendFile(file);
    }
    const placeholder = `__file__${fileIndex}`;
    fileIndex += 1;
    return placeholder;
  };

  const processSlot = (slot) => {
    if (!slot) {
      return '';
    }
    if (slot.file) {
      return addFile(slot.file);
    }
    if (slot.existingUrl) {
      return slot.existingUrl;
    }
    return '';
  };

  manifest.push(processSlot(coverSlot));
  gallerySlots.forEach((slot) => {
    manifest.push(processSlot(slot));
  });

  while (manifest.length < 5) {
    manifest.push('');
  }

  return manifest;
};
