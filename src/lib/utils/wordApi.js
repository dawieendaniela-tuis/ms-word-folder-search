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

const PAGE_WIDTH = 468; // US Letter width in points minus default 1" margins

function resizeImage(image, targetWidth) {
  const aspectRatio = image.height / image.width;
  image.width = targetWidth;
  image.height = targetWidth * aspectRatio;
}

export async function insertImage(entry, widthSetting) {
  const base64 = await getImageBase64(entry);
  if (!base64) return;

  const targetWidth = getWidthPoints(widthSetting, PAGE_WIDTH);

  await Word.run(async (context) => {
    const selection = context.document.getSelection();
    const image = selection.insertInlinePictureFromBase64(base64, Word.InsertLocation.end);

    if (targetWidth) {
      image.load('width,height');
      await context.sync();
      resizeImage(image, targetWidth);
    }

    image.getRange(Word.RangeLocation.after).select();
    await context.sync();
  });
}

export async function insertAllImages(entries, widthSetting, onProgress) {
  if (!entries || entries.length === 0) return;

  const targetWidth = getWidthPoints(widthSetting, PAGE_WIDTH);
  const total = entries.length;

  for (let i = 0; i < total; i++) {
    const entry = entries[i];
    const base64 = await getImageBase64(entry);

    if (base64) {
      const isLast = i === total - 1;
      await Word.run(async (context) => {
        const selection = context.document.getSelection();
        const image = selection.insertInlinePictureFromBase64(base64, Word.InsertLocation.end);

        if (targetWidth) {
          image.load('width,height');
          await context.sync();
          resizeImage(image, targetWidth);
        }

        if (isLast) {
          image.getRange(Word.RangeLocation.after).select();
        } else {
          const paragraph = image
            .getRange(Word.RangeLocation.after)
            .insertParagraph('', Word.InsertLocation.after);
          paragraph.getRange(Word.RangeLocation.start).select();
        }

        await context.sync();
      });
    }

    if (onProgress) onProgress(i + 1, total);
  }
}
