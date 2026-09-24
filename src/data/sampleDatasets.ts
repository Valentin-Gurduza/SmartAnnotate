import { VisionItem, TextItem, RLHFItem, TaxonomyClass } from '../types/annotation';
import { urbanStreetSvg, warehouseLogisticsSvg, retailShelfSvg } from '../utils/svgScenes';

export const defaultVisionClasses: TaxonomyClass[] = [
  { id: 'c1', name: 'Car', color: '#3B82F6', hotkey: '1', description: 'Passenger cars, sedans, hatchbacks, and SUVs.' },
  { id: 'c2', name: 'Pedestrian', color: '#10B981', hotkey: '2', description: 'People walking or standing on sidewalk/crosswalk.' },
  { id: 'c3', name: 'Bicycle', color: '#F43F5E', hotkey: '3', description: 'Bicycles, e-bikes, and scooters.' },
  { id: 'c4', name: 'Traffic Sign', color: '#F59E0B', hotkey: '4', description: 'Regulatory traffic signs, speed limits, and traffic lights.' },
  { id: 'c5', name: 'Truck', color: '#8B5CF6', hotkey: '5', description: 'Heavy transport trucks, delivery vans, and haulers.' },
  { id: 'c6', name: 'Forklift', color: '#EAB308', hotkey: '6', description: 'Industrial motorized forklift machinery.' },
  { id: 'c7', name: 'Pallet / Box', color: '#D97706', hotkey: '7', description: 'Cardboard shipping containers and wooden cargo pallets.' },
  { id: 'c8', name: 'Bottle / Can', color: '#06B6D4', hotkey: '8', description: 'Retail beverage containers, aluminum cans, and bottles.' },
  { id: 'c9', name: 'Cereal / Food Box', color: '#EC4899', hotkey: '9', description: 'Packaged dry consumables, cereal boxes, and pasta.' },
  { id: 'c10', name: 'Canned Food', color: '#14B8A6', hotkey: '0', description: 'Canned soups, preserved goods, and aluminum food tins.' },
  { id: 'c11', name: 'Price Tag', color: '#A855F7', hotkey: 'P', description: 'Supermarket shelf edge retail price labels.' },
  { id: 'c12', name: 'Worker / Personnel', color: '#F97316', hotkey: 'W', description: 'Warehouse operators, logistics staff, and inspectors.' },
];

export const urbanVisionClasses: TaxonomyClass[] = [
  { id: 'c1', name: 'Car', color: '#3B82F6', hotkey: '1', description: 'Passenger cars, sedans, hatchbacks, and SUVs.' },
  { id: 'c2', name: 'Pedestrian', color: '#10B981', hotkey: '2', description: 'People walking or standing on sidewalk/crosswalk.' },
  { id: 'c3', name: 'Bicycle', color: '#F43F5E', hotkey: '3', description: 'Bicycles, e-bikes, and scooters.' },
  { id: 'c4', name: 'Traffic Sign', color: '#F59E0B', hotkey: '4', description: 'Regulatory traffic signs, speed limits, and traffic lights.' },
  { id: 'c5', name: 'Truck', color: '#8B5CF6', hotkey: '5', description: 'Heavy transport trucks, delivery vans, and haulers.' },
];

export const warehouseVisionClasses: TaxonomyClass[] = [
  { id: 'w1', name: 'Forklift', color: '#EAB308', hotkey: '1', description: 'Industrial motorized forklift machinery.' },
  { id: 'w2', name: 'Worker / Personnel', color: '#F97316', hotkey: '2', description: 'Warehouse personnel inspector with safety hardhat and vest.' },
  { id: 'w3', name: 'Pallet / Box', color: '#D97706', hotkey: '3', description: 'Stacked heavy shipping cartons and floor pallets.' },
  { id: 'w4', name: 'Traffic Sign', color: '#F59E0B', hotkey: '4', description: 'Industrial safety hazard warning sign.' },
  { id: 'w5', name: 'Truck', color: '#8B5CF6', hotkey: '5', description: 'Heavy transport trucks and dock vehicles.' },
];

export const retailVisionClasses: TaxonomyClass[] = [
  { id: 'r1', name: 'Bottle / Can', color: '#06B6D4', hotkey: '1', description: 'Retail beverage containers, aluminum cans, and bottles.' },
  { id: 'r2', name: 'Cereal / Food Box', color: '#EC4899', hotkey: '2', description: 'Packaged dry consumables, cereal boxes, and pasta.' },
  { id: 'r3', name: 'Canned Food', color: '#14B8A6', hotkey: '3', description: 'Canned soups, preserved goods, and aluminum food tins.' },
  { id: 'r4', name: 'Price Tag', color: '#A855F7', hotkey: '4', description: 'Supermarket shelf edge retail price labels.' },
  { id: 'r5', name: 'Pallet / Box', color: '#D97706', hotkey: '5', description: 'Bulk storage boxes and cartons.' },
];

export const defaultNERClasses: TaxonomyClass[] = [
  { id: 'n1', name: 'ORG', color: '#3B82F6', hotkey: '1', description: 'Companies, agencies, institutions, and team names.' },
  { id: 'n2', name: 'PERSON', color: '#10B981', hotkey: '2', description: 'Named individual people or executive figures.' },
  { id: 'n3', name: 'DATE', color: '#F59E0B', hotkey: '3', description: 'Calendar dates, quarters, execution timestamps, and periods.' },
  { id: 'n4', name: 'MONEY', color: '#84CC16', hotkey: '4', description: 'Monetary sums, compensation, values, and currencies.' },
  { id: 'n5', name: 'TECH', color: '#8B5CF6', hotkey: '5', description: 'Software architectures, protocols, databases, and APIs.' },
  { id: 'n6', name: 'PRODUCT', color: '#EC4899', hotkey: '6', description: 'Commercial product offerings, SKUs, and service tiers.' },
  { id: 'n7', name: 'LOCATION', color: '#06B6D4', hotkey: '7', description: 'Cities, countries, facilities, and physical venues.' },
];

export const initialVisionItems: VisionItem[] = [
  {
    id: 'vis-1',
    name: 'urban_intersection_day_042.svg',
    imageUrl: urbanStreetSvg,
    width: 1280,
    height: 720,
    status: 'annotated',
    boxes: [
      {
        id: 'b1',
        label: 'Car',
        // [ymin, xmin, ymax, xmax] in 0-1000 scale
        box_2d: [680, 203, 855, 422],
        confidence: 0.98,
        isAiSuggested: false,
        reviewed: true,
      },
      {
        id: 'b2',
        label: 'Car',
        box_2d: [722, 39, 875, 180],
        confidence: 0.97,
        isAiSuggested: false,
        reviewed: true,
      },
      {
        id: 'b3',
        label: 'Pedestrian',
        box_2d: [638, 680, 770, 715],
        confidence: 0.94,
        isAiSuggested: false,
        reviewed: true,
      },
      {
        id: 'b4',
        label: 'Traffic Sign',
        box_2d: [250, 584, 382, 617],
        confidence: 0.91,
        isAiSuggested: false,
        reviewed: true,
      },
      {
        id: 'b5',
        label: 'Bicycle',
        box_2d: [580, 476, 660, 523],
        confidence: 0.89,
        isAiSuggested: true,
        reviewed: false,
        rationale: 'Red frame two-wheeled bicycle parked by the curb',
      },
      {
        id: 'b6',
        label: 'Truck',
        box_2d: [652, 492, 800, 625],
        confidence: 0.95,
        isAiSuggested: true,
        reviewed: false,
        rationale: 'Commercial box delivery truck with yellow cab',
      },
    ],
    tags: ['urban', 'daylight', 'crosswalk', 'vehicles'],
  },
  {
    id: 'vis-2',
    name: 'warehouse_forklift_zone_089.svg',
    imageUrl: warehouseLogisticsSvg,
    width: 1280,
    height: 720,
    status: 'ai_suggested',
    boxes: [
      {
        id: 'wb1',
        label: 'Forklift',
        box_2d: [513, 390, 833, 613],
        confidence: 0.96,
        isAiSuggested: true,
        reviewed: false,
        rationale: 'Yellow counterbalance forklift with cabin cage and mast',
      },
      {
        id: 'wb2',
        label: 'Pedestrian',
        box_2d: [638, 656, 777, 680],
        confidence: 0.93,
        isAiSuggested: true,
        reviewed: false,
        rationale: 'Warehouse inspector with yellow hardhat and hi-vis vest',
      },
      {
        id: 'wb3',
        label: 'Pallet / Box',
        box_2d: [472, 734, 722, 875],
        confidence: 0.92,
        isAiSuggested: true,
        reviewed: false,
        rationale: 'Stacked shipping cartons on wooden pallet',
      },
      {
        id: 'wb4',
        label: 'Traffic Sign',
        box_2d: [333, 593, 430, 656],
        confidence: 0.88,
        isAiSuggested: true,
        reviewed: false,
        rationale: 'Yellow triangular safety hazard warning sign',
      },
    ],
    tags: ['logistics', 'forklift', 'safety', 'shelving'],
  },
  {
    id: 'vis-3',
    name: 'supermarket_beverage_shelf_014.svg',
    imageUrl: retailShelfSvg,
    width: 1280,
    height: 720,
    status: 'ai_suggested',
    boxes: [
      {
        id: 'sb1',
        label: 'Bottle / Can',
        box_2d: [125, 94, 306, 130],
        confidence: 0.98,
        isAiSuggested: true,
        reviewed: false,
        rationale: 'Matcha organic green tea beverage bottle',
      },
      {
        id: 'sb2',
        label: 'Bottle / Can',
        box_2d: [125, 137, 306, 173],
        confidence: 0.98,
        isAiSuggested: true,
        reviewed: false,
        rationale: 'Matcha organic green tea beverage bottle',
      },
      {
        id: 'sb3',
        label: 'Bottle / Can',
        box_2d: [111, 195, 306, 236],
        confidence: 0.97,
        isAiSuggested: true,
        reviewed: false,
        rationale: 'Organic citrus juice bottle with orange cap',
      },
      {
        id: 'sb4',
        label: 'Bottle / Can',
        box_2d: [111, 242, 306, 283],
        confidence: 0.97,
        isAiSuggested: true,
        reviewed: false,
        rationale: 'Organic citrus juice bottle with orange cap',
      },
      {
        id: 'sb5',
        label: 'Bottle / Can',
        box_2d: [174, 312, 306, 344],
        confidence: 0.96,
        isAiSuggested: true,
        reviewed: false,
        rationale: 'Classic sparkling cola aluminum beverage can',
      },
      {
        id: 'sb6',
        label: 'Cereal / Food Box',
        box_2d: [375, 94, 583, 164],
        confidence: 0.97,
        isAiSuggested: true,
        reviewed: false,
        rationale: 'Honey Oat Crunch breakfast cereal consumable box',
      },
      {
        id: 'sb7',
        label: 'Cereal / Food Box',
        box_2d: [375, 172, 583, 242],
        confidence: 0.97,
        isAiSuggested: true,
        reviewed: false,
        rationale: 'Honey Oat Crunch breakfast cereal consumable box',
      },
      {
        id: 'sb8',
        label: 'Cereal / Food Box',
        box_2d: [361, 258, 583, 332],
        confidence: 0.97,
        isAiSuggested: true,
        reviewed: false,
        rationale: 'Chocolate Flakes breakfast cereal consumable box',
      },
      {
        id: 'sb9',
        label: 'Cereal / Food Box',
        box_2d: [431, 430, 583, 531],
        confidence: 0.96,
        isAiSuggested: true,
        reviewed: false,
        rationale: 'Italian Spaghetti No.5 pasta consumable package',
      },
      {
        id: 'sb10',
        label: 'Bottle / Can',
        box_2d: [625, 109, 861, 152],
        confidence: 0.97,
        isAiSuggested: true,
        reviewed: false,
        rationale: 'Extra virgin olive oil tall glass bottle',
      },
      {
        id: 'sb11',
        label: 'Canned Food',
        box_2d: [722, 234, 861, 281],
        confidence: 0.96,
        isAiSuggested: true,
        reviewed: false,
        rationale: 'Canned tomato soup consumable tin',
      },
      {
        id: 'sb12',
        label: 'Price Tag',
        box_2d: [342, 101, 367, 129],
        confidence: 0.94,
        isAiSuggested: true,
        reviewed: false,
        rationale: 'Shelf edge price label tag ($3.49)',
      },
    ],
    tags: ['retail', 'beverages', 'shelf_audit', 'consumables', 'planogram'],
  },
];

export const initialTextItems: TextItem[] = [
  {
    id: 'ner-1',
    title: 'Enterprise Master Services Agreement',
    text: 'On October 14, 2026, CloudScale Technologies entered into a definitive $4,200,000 multi-year infrastructure agreement with Northern Health Alliance in Seattle, Washington. Under the terms, Sarah Chen will supervise the deployment of PostgreSQL clusters and Kubernetes nodes.',
    status: 'annotated',
    entities: [
      { id: 'e1', text: 'October 14, 2026', label: 'DATE', start: 3, end: 19, confidence: 0.99 },
      { id: 'e2', text: 'CloudScale Technologies', label: 'ORG', start: 21, end: 44, confidence: 0.98 },
      { id: 'e3', text: '$4,200,000', label: 'MONEY', start: 69, end: 79, confidence: 0.99 },
      { id: 'e4', text: 'Northern Health Alliance', label: 'ORG', start: 124, end: 148, confidence: 0.97 },
      { id: 'e5', text: 'Seattle', label: 'LOCATION', start: 152, end: 159, confidence: 0.96 },
      { id: 'e6', text: 'Washington', label: 'LOCATION', start: 161, end: 171, confidence: 0.96 },
      { id: 'e7', text: 'Sarah Chen', label: 'PERSON', start: 190, end: 200, confidence: 0.98 },
      { id: 'e8', text: 'PostgreSQL', label: 'TECH', start: 236, end: 246, confidence: 0.97 },
      { id: 'e9', text: 'Kubernetes', label: 'TECH', start: 260, end: 270, confidence: 0.97 },
    ],
    classification: {
      category: 'Contract Execution',
      confidence: 0.96,
      rationale: 'Binding enterprise B2B agreement outlining scope, milestones, and monetary commitments.',
    },
  },
  {
    id: 'ner-2',
    title: 'Biotech Clinical Trial Advisory',
    text: 'On August 3, 2026, Dr. Marcus Vance presented phase 3 trial metrics for BioNova Therapeutics at the Global Oncology Symposium in Zurich, Switzerland. The oncology pipeline project yielded a 78% response rate, backed by $18,500,000 in Series B financing.',
    status: 'ai_suggested',
    entities: [
      { id: 'e10', text: 'August 3, 2026', label: 'DATE', start: 3, end: 17, confidence: 0.98, isAiSuggested: true },
      { id: 'e11', text: 'Dr. Marcus Vance', label: 'PERSON', start: 19, end: 35, confidence: 0.97, isAiSuggested: true },
      { id: 'e12', text: 'BioNova Therapeutics', label: 'ORG', start: 72, end: 92, confidence: 0.96, isAiSuggested: true },
      { id: 'e13', text: 'Zurich', label: 'LOCATION', start: 130, end: 136, confidence: 0.96, isAiSuggested: true },
      { id: 'e14', text: 'Switzerland', label: 'LOCATION', start: 138, end: 149, confidence: 0.96, isAiSuggested: true },
      { id: 'e15', text: '$18,500,000', label: 'MONEY', start: 219, end: 230, confidence: 0.99, isAiSuggested: true },
    ],
    classification: {
      category: 'Clinical Trial / Life Sciences',
      confidence: 0.94,
    },
  },
  {
    id: 'ner-3',
    title: 'Customer Escalation - Billing Discrepancy',
    text: 'I was double charged $189.50 on September 12 by Apex Stream Pro after cancelling my annual subscription. Please initiate an immediate refund to my Visa ending in 4402 or escalate to your senior supervisor David Miller.',
    status: 'unannotated',
    entities: [],
  },
];

export const initialRLHFItems: RLHFItem[] = [
  {
    id: 'rlhf-1',
    prompt: 'Write an idempotent TypeScript function to synchronize a batch of normalized bounding box annotations into a backend PostgreSQL database, with error handling for partial failures.',
    responseA: {
      modelName: 'Model-Candidate-Alpha',
      text: `\`\`\`typescript
export async function syncBoundingBoxes(
  db: Client,
  imageId: string,
  boxes: Array<{ label: string; box_2d: [number, number, number, number] }>
): Promise<{ success: boolean; inserted: number; errors?: any[] }> {
  // Use a transactional upsert to guarantee idempotency
  await db.query('BEGIN');
  try {
    // Delete previous draft detections for this image to ensure fresh idempotent state
    await db.query('DELETE FROM annotations WHERE image_id = $1 AND is_draft = true', [imageId]);
    
    let count = 0;
    for (const b of boxes) {
      await db.query(
        \`INSERT INTO annotations (image_id, label, ymin, xmin, ymax, xmax, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())\`,
        [imageId, b.label, b.box_2d[0], b.box_2d[1], b.box_2d[2], b.box_2d[3]]
      );
      count++;
    }
    await db.query('COMMIT');
    return { success: true, inserted: count };
  } catch (err) {
    await db.query('ROLLBACK');
    return { success: false, inserted: 0, errors: [err] };
  }
}
\`\`\``,
      score: 8.5,
    },
    responseB: {
      modelName: 'Model-Candidate-Beta',
      text: `\`\`\`typescript
export function syncBoxes(db: any, id: string, list: any[]) {
  // Loops over list and inserts without transaction
  list.forEach(async (item) => {
    try {
      await db.query('INSERT INTO annotations VALUES ($1, $2)', [id, item]);
    } catch (e) {
      console.log('Failed', e);
    }
  });
  return true;
}
\`\`\``,
      score: 3.5,
    },
    preference: 'A',
    evaluatorNotes: 'Model A uses atomic transactions (BEGIN/ROLLBACK), typed parameters, and true idempotent deletion of prior drafts. Model B has unhandled floating async promises and missing coordinate schema.',
    aiCritique: {
      preferred: 'A',
      scoreA: 9.0,
      scoreB: 3.0,
      justification: 'Model A guarantees transactional atomicity and handles failure rollback cleanly. Model B uses un-awaited forEach async loops which leads to race conditions and unhandled rejection.',
      strengthsA: ['Proper transaction management', 'Type-safe parameters', 'Idempotent state cleanup'],
      strengthsB: ['Short code snippet'],
      suggestedGoldResponse: 'Combine Model A with bulk batch INSERT `UNNEST` query for O(1) roundtrip efficiency rather than iterative queries in a loop.',
    },
    status: 'reviewed',
  },
  {
    id: 'rlhf-2',
    prompt: 'Explain Active Learning in Computer Vision annotation and how confidence thresholds reduce human annotation hours.',
    responseA: {
      modelName: 'Model-Candidate-Alpha',
      text: 'Active learning selects the most informative unlabelled images for human annotation instead of labelling data randomly. High-confidence detections (>0.90) are auto-accepted, while low-margin predictions near the classification boundary (0.50-0.70) are routed to human annotators. This cuts manual effort by 60-80% by focusing human labor strictly where the model is uncertain.',
      score: 9.2,
    },
    responseB: {
      modelName: 'Model-Candidate-Beta',
      text: 'Active learning is when the AI learns actively while you work. You label everything, and the AI watches you do it and improves over time.',
      score: 4.0,
    },
    preference: 'A',
    status: 'annotated',
  },
];
