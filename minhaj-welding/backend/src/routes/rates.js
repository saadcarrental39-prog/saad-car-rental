const express = require('express');
const router = express.Router();
const ratesService = require('../services/rates');
const { requireAuth } = require('../middleware/auth');

router.get('/', (req, res) => {
  res.json(ratesService.listRates(req.query));
});

router.post('/', requireAuth, (req, res) => {
  const userId = req.user.id;
  const rate = ratesService.createRate(req.body, userId);
  res.status(201).json(rate);
});

router.put('/:id/value', requireAuth, (req, res) => {
  const { new_rate, reason } = req.body;
  const userId = req.user.id;
  if (new_rate === undefined) return res.status(400).json({ error: 'new_rate is required' });
  try {
    const updated = ratesService.updateRateValue(req.params.id, Number(new_rate), reason, userId);
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.get('/:id/history', (req, res) => {
  res.json(ratesService.getRateHistory(req.params.id));
});

router.delete('/:id', requireAuth, (req, res) => {
  ratesService.deleteRate(req.params.id);
  res.json({ success: true, note: 'Rate marked inactive (soft delete) to preserve history integrity.' });
});

module.exports = router;
