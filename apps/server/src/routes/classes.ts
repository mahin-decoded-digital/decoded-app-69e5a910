import { Router } from 'express'
import { db } from '../lib/db'

const router = Router()

router.get('/', async (req, res) => {
  const classes = await db.collection('classes').find()
  res.json(classes)
  return;
})

router.get('/:id', async (req, res) => {
  const classSession = await db.collection('classes').findById(req.params.id!)
  if (!classSession) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(classSession)
  return;
})

router.post('/', async (req, res) => {
  const body = req.body as Record<string, unknown>
  const id = await db.collection('classes').insertOne(body)
  const classSession = await db.collection('classes').findById(id)
  res.status(201).json(classSession)
  return;
})

router.put('/:id', async (req, res) => {
  const body = req.body as Record<string, unknown>
  const ok = await db.collection('classes').updateOne(req.params.id!, body)
  if (!ok) { res.status(404).json({ error: 'Not found' }); return; }
  const classSession = await db.collection('classes').findById(req.params.id!)
  res.json(classSession)
  return;
})

router.delete('/:id', async (req, res) => {
  const ok = await db.collection('classes').deleteOne(req.params.id!)
  if (!ok) { res.status(404).json({ error: 'Not found' }); return; }
  res.json({ success: true })
  return;
})

export default router