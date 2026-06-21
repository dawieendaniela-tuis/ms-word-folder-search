import { getImageBase64 } from './filesystem.js';

function getWidthPoints(widthSetting, pageWidth) {
  switch (widthSetting) {
    case '25%': return pageWidth * 0.25;
    case '50%': return pageWidth * 0.5;
    case '75%': return pageWidth * 0.75;
    case '100%': return pageWidth;
    case 'original': return null;
    default: return pageWidth * 0.5;
  }
}

export async function insertImage(entry, widthSetting) {
  const base64 = await getImageBase64(entry);
  if (!base64) return;

  await Word.run(async (context) => {
    const range = context.document.getSelection();
    const image = range.insertInlinePictureFromBase64(base64, Word.InsertLocation.replace);

    if (widthSetting !== 'original') {
      const body = context.document.body;
      const sections = context.document.sections;
      sections.load('items');
      await context.sync();

      const section = sections.items[0];
      section.load('pageSetup');
      await context.sync();

      const pageSetup = section.getNext ? section : sections.items[0];
      const pageWidth = 468; // default US Letter width in points minus margins

      const targetWidth = getWidthPoints(widthSetting, pageWidth);
      if (targetWidth) {
        image.load('width,height');
        await context.sync();
        const aspectRatio = image.height / image.width;
        image.width = targetWidth;
        image.height = targetWidth * aspectRatio;
      }
    }

    await context.sync();
  });
}

export async function insertAllImages(entries, widthSetting) {
  if (!entries || entries.length === 0) return;

  await Word.run(async (context) => {
    let range = context.document.getSelection();

    const pageWidth = 468;

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const base64 = await getImageBase64(entry);
      if (!base64) continue;

      const image = range.insertInlinePictureFromBase64(base64, Word.InsertLocation.after);

      if (widthSetting !== 'original') {
        const targetWidth = getWidthPoints(widthSetting, pageWidth);
        if (targetWidth) {
          image.load('width,height');
          await context.sync();
          const aspectRatio = image.height / image.width;
          image.width = targetWidth;
          image.height = targetWidth * aspectRatio;
        }
      }

      await context.sync();

      if (i < entries.length - 1) {
        range = image.getRange(Word.RangeLocation.after);
        range.insertBreak(Word.BreakType.line, Word.InsertLocation.after);
        range = range.getRange(Word.RangeLocation.after);
        await context.sync();
      }
    }
  });
}
