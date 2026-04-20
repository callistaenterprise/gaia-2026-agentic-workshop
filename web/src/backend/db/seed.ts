import { db } from './dbClient'
import { snacks, participants, events, eventParticipants, orders, orderSnacks } from './schema'
import { sql } from 'drizzle-orm'

const seedSnacks = [
  {
    id: 'snack-1',
    name: 'Pizza',
    description: 'Classic margherita pizza slices',
    pricePerUnit: 99,
    internalDescription: 'Savory baked dough with tomato sauce and melted mozzarella. Warm and filling. Contains gluten and dairy. Vegetarian. Goes well with soda or sparkling water. Popular crowd-pleaser for longer workshops.',
  },
  {
    id: 'snack-2',
    name: 'Sushi',
    description: 'Assorted nigiri and maki rolls',
    pricePerUnit: 119,
    internalDescription: 'Light Japanese rice rolls with fish and vegetables. Fresh, low in fat, high in protein. Contains fish and gluten (soy sauce). Not vegetarian. Goes well with green tea. Premium option suited for conferences.',
  },
  {
    id: 'snack-3',
    name: 'Fruit platter',
    description: 'Seasonal fresh fruit',
    pricePerUnit: 89,
    internalDescription: 'Assorted fresh fruit including melon, grapes, berries, and citrus. Light, refreshing, and healthy. Vegan and gluten-free. No common allergens. Good energy boost without the sugar crash. Suitable for everyone.',
  },
  {
    id: 'snack-4',
    name: 'Chips & dip',
    description: 'Tortilla chips with guacamole and salsa',
    pricePerUnit: 45,
    internalDescription: 'Crunchy corn tortilla chips served with guacamole and tomato salsa. Savory and satisfying. Vegan and gluten-free. Salty snack good for sharing during breaks. Contains avocado.',
  },
  {
    id: 'snack-5',
    name: 'Chokladbollar',
    description: 'Classic Swedish chocolate balls rolled in coconut',
    pricePerUnit: 15,
    internalDescription: 'Rich Swedish treat made from oats, butter, cocoa, and sugar, rolled in desiccated coconut. Sweet, chocolatey, and indulgent. Contains gluten, dairy, and oats. Vegetarian. Goes exceptionally well with coffee. A workshop classic.',
  },
  {
    id: 'snack-6',
    name: 'Kanelbullar',
    description: 'Swedish cinnamon buns',
    pricePerUnit: 15,
    internalDescription: 'Soft Swedish cinnamon and cardamom buns with pearl sugar topping. Sweet, warm, and aromatic. Contains gluten, dairy, and egg. Vegetarian. Best enjoyed with coffee. Iconic Scandinavian baked good.',
  },
  {
    id: 'snack-7',
    name: 'Mixed nuts',
    description: 'Roasted and salted mixed nuts',
    pricePerUnit: 20,
    internalDescription: 'Blend of roasted cashews, almonds, walnuts, and hazelnuts with sea salt. Savory, crunchy, and high in protein and healthy fats. Vegan and gluten-free. Contains tree nuts. Long-lasting energy, ideal for afternoon sessions.',
  },
  {
    id: 'snack-8',
    name: 'Wraps',
    description: 'Assorted vegetarian and chicken wraps',
    pricePerUnit: 45,
    internalDescription: 'Soft flour tortilla wraps with fillings including grilled chicken, hummus and roasted vegetables. Filling and protein-rich. Contains gluten. Available in vegetarian and non-vegetarian options. Good lunch alternative for full-day workshops.',
  },
  {
    id: 'snack-9',
    name: 'Carrots & hummus',
    description: 'Fresh carrot sticks with creamy hummus',
    pricePerUnit: 30,
    internalDescription: 'Fresh crunchy carrot sticks served with smooth chickpea hummus. Light, healthy, and satisfying. Vegan and gluten-free. Contains sesame (tahini). Low calorie and refreshing. Great for health-conscious attendees.',
  },
  {
    id: 'snack-10',
    name: 'Cookies',
    description: 'Assorted baked cookies',
    pricePerUnit: 17,
    internalDescription: 'Assorted baked cookies including chocolate chip, oatmeal raisin, and shortbread. Sweet and crumbly. Contains gluten, dairy, and egg. Vegetarian. Goes well with coffee or tea. Comfort snack popular at afternoon breaks.',
  },
  {
    id: 'snack-11',
    name: 'Yogurt with granola',
    description: 'Greek yogurt with granola and berries',
    pricePerUnit: 22,
    internalDescription: 'Thick creamy Greek yogurt topped with crunchy oat granola and fresh berries. Tangy, sweet, and rich in protein. Contains dairy and gluten. Vegetarian. Light and nourishing, good morning or mid-morning option.',
  },
  {
    id: 'snack-12',
    name: 'Popcorn',
    description: 'Freshly popped lightly salted popcorn',
    pricePerUnit: 15,
    internalDescription: 'Light and airy popped corn with a hint of sea salt. Low calorie and very light. Vegan and gluten-free. No common allergens. Great for casual munching during presentations without being distracting.',
  },
]

const seedParticipants = [
  { id: 'p-1', firstName: 'Alice', lastName: 'Andersson', snackPreference: 'Något med choklad' },
  { id: 'p-2', firstName: 'Bob', lastName: 'Björk', snackPreference: 'Rejält med mat, jag är hungrig' },
  { id: 'p-3', firstName: 'Clara', lastName: 'Carlsson', snackPreference: 'En bulle av nått slag' },
  { id: 'p-4', firstName: 'David', lastName: 'Dahl', snackPreference: 'Något sött, speciellt choklad' },
  { id: 'p-5', firstName: 'Eva', lastName: 'Eriksson', snackPreference: 'Något nyttigt, sallad eller vegetariskt.' },
  { id: 'p-6', firstName: 'Filip', lastName: 'Forsberg', snackPreference: 'Jag vill vara hälsosam, älskar grönsaker' },
  { id: 'p-7', firstName: 'Greta', lastName: 'Gustafsson', snackPreference: 'Tårta med choklad.' },
]

const seedEvents = [
  {
    id: 'event-1',
    name: 'AI Agents Workshop',
    date: '2026-03-15',
    description: 'Hands-on workshop exploring AI agent frameworks and patterns.',
  },
  {
    id: 'event-2',
    name: 'Tech Conference 2026',
    date: '2026-05-22',
    description: 'Annual tech conference with talks on AI, cloud, and DevEx.',
  },
  {
    id: 'event-3',
    name: 'Hackathon Spring',
    date: '2026-04-10',
    description: '48-hour hackathon focused on AI-powered developer tools.',
  },
]

const seedEventParticipants = [
  // AI Agents Workshop: Alice, Bob, Clara, David
  { eventId: 'event-1', participantId: 'p-1' },
  { eventId: 'event-1', participantId: 'p-2' },
  { eventId: 'event-1', participantId: 'p-3' },
  { eventId: 'event-1', participantId: 'p-4' },
  // Tech Conference: Alice, Eva, Filip, Greta
  { eventId: 'event-2', participantId: 'p-1' },
  { eventId: 'event-2', participantId: 'p-5' },
  { eventId: 'event-2', participantId: 'p-6' },
  { eventId: 'event-2', participantId: 'p-7' },
  // Hackathon: Bob, Clara, Eva, Filip
  { eventId: 'event-3', participantId: 'p-2' },
  { eventId: 'event-3', participantId: 'p-3' },
  { eventId: 'event-3', participantId: 'p-5' },
  { eventId: 'event-3', participantId: 'p-6' },
]

const seedOrders = [
  {
    id: 'order-1',
    name: 'Snack order for AI Agents Workshop',
    createdAt: '2026-02-20T10:00:00.000Z',
  },
  {
    id: 'order-2',
    name: 'Snack order for Tech Conference 2026',
    createdAt: '2026-02-25T14:30:00.000Z',
  },
  {
    id: 'order-3',
    name: 'Snack order for Hackathon Spring',
    createdAt: '2026-02-27T09:00:00.000Z',
  },
]

const seedOrderSnacks = [
  { orderId: 'order-1', snackId: 'snack-1', quantity: 15 },
  { orderId: 'order-1', snackId: 'snack-2', quantity: 3 },
  { orderId: 'order-2', snackId: 'snack-4', quantity: 10 },
  { orderId: 'order-2', snackId: 'snack-3', quantity: 5 },
  { orderId: 'order-3', snackId: 'snack-1', quantity: 20 },
  { orderId: 'order-3', snackId: 'snack-2', quantity: 10 },
  { orderId: 'order-3', snackId: 'snack-3', quantity: 5 },
]

async function seed() {
  console.log('Seeding database...')

  console.log('  Clearing existing data...')
  await db.delete(orderSnacks)
  await db.delete(orders)
  await db.delete(eventParticipants)
  await db.delete(events)
  await db.delete(participants)
  await db.delete(snacks)
  console.log('  ✓ All data cleared')

  await db.insert(snacks).values(seedSnacks).onConflictDoUpdate({
    target: snacks.id,
    set: {
      name: sql`excluded.name`,
      description: sql`excluded.description`,
      pricePerUnit: sql`excluded.price_per_unit`,
      internalDescription: sql`excluded.internal_description`,
    },
  })
  console.log(`  ✓ ${seedSnacks.length} snacks`)

  await db.insert(participants).values(seedParticipants)
  console.log(`  ✓ ${seedParticipants.length} participants`)

  await db.insert(events).values(seedEvents)
  console.log(`  ✓ ${seedEvents.length} events`)

  await db.insert(eventParticipants).values(seedEventParticipants)
  console.log(`  ✓ ${seedEventParticipants.length} event-participant links`)

  await db.insert(orders).values(seedOrders)
  console.log(`  ✓ ${seedOrders.length} orders`)

  await db.insert(orderSnacks).values(seedOrderSnacks)
  console.log(`  ✓ ${seedOrderSnacks.length} order-snack links`)

  console.log('Done.')
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
