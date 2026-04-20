import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { db } from './lib/db'

import authRoutes from './routes/auth'
import usersRoutes from './routes/users'
import classesRoutes from './routes/classes'
import bookingsRoutes from './routes/bookings'
import membershipPlansRoutes from './routes/membershipPlans'
import userMembershipsRoutes from './routes/userMemberships'
import transactionsRoutes from './routes/transactions'
import settingsRoutes from './routes/settings'

// [1m[31mRemoved .js extensions from local imports because TypeScript build fails due to them[0m

// [1m[34mEnvironment validation[0m
const isProd = process.env.PROD === 'true'
const hasMongoUri = !!process.env.MONGODB_URI
console.log('[server] Environment:')
console.log('  PROD (deployment tier):', isProd ? '[32m[1m[22m[39m true' : '[31m[1m[22m[39m false (dev/preview)')
console.log('  MONGODB_URI:', hasMongoUri ? '[32m[1m[22m[39m configured' : '[31m[1m[22m[39m not set (in-memory DB)')
if (isProd && !hasMongoUri) {
  console.warn('[server] [33m[1m[22m[39m PROD=true but MONGODB_URI is not set [0m[33m[1m[22m[39m[0m [33musing in-memory storage[0m')
}

const app = express()
const PORT = process.env.PORT ? parseInt(String(process.env.PORT), 10) : 3001

app.use(cors({ origin: '*' }))
app.use(express.json())

// [1m[34mRequest logging[0m
app.use((req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    console.log(`[api] ${req.method} ${req.path} [0m[32m[1m[22m[39m[0m[39m[0m[39m[0m[39m[0m[39m[32m[1m(${Date.now() - start}ms)`)
  })
  next()
})

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', db: db.isProduction() ? 'mongodb' : 'in-memory' })
  return;
})

// --- Seed Data function ---
async function seedData() {
  const users = await db.collection('users').find()
  if (users.length === 0) {
    const MOCK_USERS = [
      { email: 'admin@studioflow.com', name: 'Alice Admin', role: 'admin', joinedAt: new Date().toISOString() },
      { email: 'staff@studioflow.com', name: 'Sam Staff', role: 'staff', joinedAt: new Date().toISOString() },
      { email: 'instructor@studioflow.com', name: 'Ivy Instructor', role: 'instructor', joinedAt: new Date().toISOString() },
      { email: 'member@studioflow.com', name: 'Mike Member', role: 'member', joinedAt: new Date().toISOString() },
      { email: 'finance@studioflow.com', name: 'Fiona Finance', role: 'finance', joinedAt: new Date().toISOString() },
    ];
    for (const u of MOCK_USERS) await db.collection('users').insertOne(u)
  }

  const plans = await db.collection('membershipPlans').find()
  if (plans.length === 0) {
    const INITIAL_MEMBERSHIP_PLANS = [
      { name: 'Drop-in Class', type: 'drop-in', price: 20, credits: 1, validityDays: 30 },
      { name: '10 Class Pass', type: 'pass', price: 150, credits: 10, validityDays: 180 },
      { name: 'Monthly Unlimited', type: 'unlimited', price: 120, credits: null, validityDays: 30 },
    ];
    for (const p of INITIAL_MEMBERSHIP_PLANS) await db.collection('membershipPlans').insertOne(p)
  }

  const classes = await db.collection('classes').find()
  if (classes.length === 0) {
    const instructors = await db.collection('users').find({ role: 'instructor' })
    const instId = instructors[0]?._id
    if (instId) {
        const INITIAL_CLASSES = [
          {
            title: 'Morning Vinyasa Flow',
            description: 'Start your day with an energizing flow.',
            instructorId: instId,
            capacity: 20,
            startTime: new Date(Date.now() + 86400000).toISOString(),
            endTime: new Date(Date.now() + 86400000 + 3600000).toISOString(),
            price: 20,
            isRecurring: false,
          },
          {
            title: 'Evening Restorative',
            description: 'Wind down your day.',
            instructorId: instId,
            capacity: 15,
            startTime: new Date(Date.now() + 172800000).toISOString(),
            endTime: new Date(Date.now() + 172800000 + 3600000).toISOString(),
            price: 20,
            isRecurring: true,
            recurringGroupId: 'rg1',
          }
        ];
        for (const c of INITIAL_CLASSES) await db.collection('classes').insertOne(c)
    }
  }
}

// --- Routes ---
app.use('/api/auth', authRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/classes', classesRoutes)
app.use('/api/bookings', bookingsRoutes)
app.use('/api/membershipPlans', membershipPlansRoutes)
app.use('/api/userMemberships', userMembershipsRoutes)
app.use('/api/transactions', transactionsRoutes)
app.use('/api/settings', settingsRoutes)

// [1m[34mError handler[0m
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[server] Error:', err.message)
  res.status(500).json({ error: 'Internal server error' })
  return;
})

// Initialize DB then start server
seedData().then(() => {
  app.listen(PORT, () => {
    console.log(`[server] API server running on http://localhost:${PORT}`)
    console.log(`[server] DB mode: ${db.isProduction() ? 'MongoDB' : 'In-memory'}`)
  })
}).catch(err => {
  console.error('[server] Failed to initialize DB:', err)
  process.exit(1)
})

export { app, db }