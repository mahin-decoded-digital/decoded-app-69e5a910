import { Router } from 'express'
import { db } from '../lib/db.js'

const router = Router()

router.get('/', async (req, res) => {
  const docs = await db.collection('settings').find()
  if (docs.length === 0) {
    const defaultSettings = {
        bookAdvanceHours: 72,
        freeCancelHours: 12,
        instantCharge: true,
    }
    const id = await db.collection('settings').insertOne(defaultSettings)
    const settings = await db.collection('settings').findById(id)
    res.json(settings)
    return
  }
  res.json(docs[0])
  return;
})

router.put('/', async (req, res) => {
  const body = req.body as Record<string, unknown>
  const docs = await db.collection('settings').find()
  if (docs.length === 0) {
    const id = await db.collection('settings').insertOne(body)
    const settings = await db.collection('settings').findById(id)
    res.json(settings)
    return
  }
  await db.collection('settings').updateOne(docs[0]!._id, body)
  const updated = await db.collection('settings').findById(docs[0]!._id)
  res.json(updated)
  return;
})

export default router