import { Router } from 'express'
import { db } from '../lib/db'

const router = Router()

router.get('/', async (req, res) => {
  const transactions = await db.collection('transactions').find()
  res.json(transactions)
  return;
})

router.get('/:id', async (req, res) => {
  const transaction = await db.collection('transactions').findById(req.params.id!)
  if (!transaction) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(transaction)
  return;
})

router.post('/', async (req, res) => {
  const body = req.body as Record<string, unknown>
  const id = await db.collection('transactions').insertOne(body)
  const transaction = await db.collection('transactions').findById(id)
  res.status(201).json(transaction)
  return;
})

router.put('/:id', async (req, res) => {
  const body = req.body as Record<string, unknown>
  const ok = await db.collection('transactions').updateOne(req.params.id!, body)
  if (!ok) { res.status(404).json({ error: 'Not found' }); return; }
  const transaction = await db.collection('transactions').findById(req.params.id!)
  res.json(transaction)
  return;
})

router.delete('/:id', async (req, res) => {
  const ok = await db.collection('transactions').deleteOne(req.params.id!)
  if (!ok) { res.status(404).json({ error: 'Not found' }); return; }
  res.json({ success: true })
  return;
})

export default router