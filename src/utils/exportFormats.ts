import { VisionItem, TextItem, TaxonomyClass } from '../types/annotation';

export function exportToYOLO(item: VisionItem, classes: TaxonomyClass[]): string {
  const classMap = new Map<string, number>();
  classes.forEach((c, idx) => classMap.set(c.name.toLowerCase(), idx));

  return item.boxes
    .map((box) => {
      const classId = classMap.get(box.label.toLowerCase()) ?? 0;
      // [ymin, xmin, ymax, xmax] in 0-1000 scale
      const [ymin, xmin, ymax, xmax] = box.box_2d;
      const x_norm = xmin / 1000;
      const y_norm = ymin / 1000;
      const w_norm = (xmax - xmin) / 1000;
      const h_norm = (ymax - ymin) / 1000;

      const x_center = (x_norm + w_norm / 2).toFixed(6);
      const y_center = (y_norm + h_norm / 2).toFixed(6);
      const width = Math.max(0, w_norm).toFixed(6);
      const height = Math.max(0, h_norm).toFixed(6);

      return `${classId} ${x_center} ${y_center} ${width} ${height}`;
    })
    .join('\n');
}

export function exportToCOCO(items: VisionItem[], classes: TaxonomyClass[]): string {
  const categories = classes.map((c, idx) => ({
    id: idx + 1,
    name: c.name,
    supercategory: 'object',
  }));

  const classMap = new Map<string, number>();
  categories.forEach((c) => classMap.set(c.name.toLowerCase(), c.id));

  const images = items.map((item, idx) => ({
    id: idx + 1,
    file_name: item.name,
    width: item.width,
    height: item.height,
  }));

  let annotationIdCounter = 1;
  const annotations: any[] = [];

  items.forEach((item, itemIdx) => {
    const imageId = itemIdx + 1;
    item.boxes.forEach((box) => {
      const categoryId = classMap.get(box.label.toLowerCase()) ?? 1;
      const [ymin, xmin, ymax, xmax] = box.box_2d;
      const x = Math.round((xmin / 1000) * item.width);
      const y = Math.round((ymin / 1000) * item.height);
      const w = Math.round(((xmax - xmin) / 1000) * item.width);
      const h = Math.round(((ymax - ymin) / 1000) * item.height);
      const area = w * h;

      annotations.push({
        id: annotationIdCounter++,
        image_id: imageId,
        category_id: categoryId,
        bbox: [x, y, w, h],
        area,
        iscrowd: 0,
        score: box.confidence ?? 1.0,
      });
    });
  });

  return JSON.stringify(
    {
      info: {
        year: 2026,
        version: '1.0',
        description: 'Exported from AnnotateAI Studio',
      },
      images,
      annotations,
      categories,
    },
    null,
    2
  );
}

export function exportToPascalVOC(item: VisionItem): string {
  const objectsXml = item.boxes
    .map((box) => {
      const [ymin, xmin, ymax, xmax] = box.box_2d;
      const x1 = Math.round((xmin / 1000) * item.width);
      const y1 = Math.round((ymin / 1000) * item.height);
      const x2 = Math.round((xmax / 1000) * item.width);
      const y2 = Math.round((ymax / 1000) * item.height);

      return `  <object>
    <name>${box.label}</name>
    <pose>Unspecified</pose>
    <truncated>0</truncated>
    <difficult>0</difficult>
    <bndbox>
      <xmin>${x1}</xmin>
      <ymin>${y1}</ymin>
      <xmax>${x2}</xmax>
      <ymax>${y2}</ymax>
    </bndbox>
  </object>`;
    })
    .join('\n');

  return `<annotation>
  <folder>annotations</folder>
  <filename>${item.name}</filename>
  <size>
    <width>${item.width}</width>
    <height>${item.height}</height>
    <depth>3</depth>
  </size>
  <segmented>0</segmented>
${objectsXml}
</annotation>`;
}

export function exportToCoNLL(items: TextItem[]): string {
  return items
    .map((item) => {
      // Split into words
      const words = item.text.split(/(\s+|[.,!?;:"'()])/).filter((w) => w.length > 0 && !/^\s+$/.test(w));
      let charCursor = 0;

      const lines = words.map((word) => {
        const wordStart = item.text.indexOf(word, charCursor);
        const wordEnd = wordStart + word.length;
        charCursor = wordEnd;

        // Find if this word falls within an entity
        const matchedEntity = item.entities.find((e) => wordStart >= e.start && wordEnd <= e.end);
        let tag = 'O';

        if (matchedEntity) {
          const isBeginning = wordStart === matchedEntity.start;
          tag = `${isBeginning ? 'B' : 'I'}-${matchedEntity.label}`;
        }

        return `${word}\t${tag}`;
      });

      return lines.join('\n');
    })
    .join('\n\n');
}

export function exportToJSONL(items: TextItem[]): string {
  return items
    .map((item) =>
      JSON.stringify({
        text: item.text,
        label: item.classification?.category || null,
        entities: item.entities.map((e) => ({
          start: e.start,
          end: e.end,
          label: e.label,
          text: e.text,
        })),
      })
    )
    .join('\n');
}

export function exportToCSV(items: VisionItem[]): string {
  const rows = ['filename,width,height,class,xmin,ymin,xmax,ymax,confidence,is_ai_suggested'];
  items.forEach((item) => {
    item.boxes.forEach((b) => {
      const [ymin, xmin, ymax, xmax] = b.box_2d;
      const pxXmin = Math.round((xmin / 1000) * item.width);
      const pxYmin = Math.round((ymin / 1000) * item.height);
      const pxXmax = Math.round((xmax / 1000) * item.width);
      const pxYmax = Math.round((ymax / 1000) * item.height);
      rows.push(
        `"${item.name}",${item.width},${item.height},"${b.label}",${pxXmin},${pxYmin},${pxXmax},${pxYmax},${b.confidence ?? 1.0},${b.isAiSuggested ? 1 : 0}`
      );
    });
  });
  return rows.join('\n');
}
