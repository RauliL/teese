import { createStorage } from '@varasto/storage';
import { Router, json } from 'express';
import path from 'path';
import { v4 as uuid } from 'uuid';

import { ITEM_SCHEMA } from './schema';

const storage = createStorage({
  dir: process.env.TEESE_DATA ?? path.resolve(__dirname, '..', 'data'),
});
const router = Router();

router.use(json());

export default router;

router.get('/', (req, res) => {
  storage
    .entries('items')
    .then((mapping) => {
      res.status(200).json(
        mapping.reduce(
          (previous, current) => ({
            ...previous,
            [current[0]]: current[1],
          }),
          {}
        )
      );
    })
    .catch(() => {
      res.status(500).json({ error: 'Unable to retrieve items.' });
    });
});

router.get('/:key', (req, res) => {
  storage
    .get('items', req.params.key)
    .then((value) => {
      if (value == null) {
        res.status(404).json({ error: 'Item not found.' });
      } else {
        res.status(200).json(value);
      }
    })
    .catch(() => {
      res.status(500).json({ error: 'Unable to retrieve item.' });
    });
});

router.post('/', (req, res) => {
  ITEM_SCHEMA.validate(req.body)
    .then((value) => {
      const id = uuid();

      storage
        .set('items', id, value)
        .then(() => {
          res.status(201).json({ id, ...value });
        })
        .catch(() => {
          res.status(500).json({ error: 'Unable to create item.' });
        });
    })
    .catch(() => {
      res.status(400).json({ error: 'Given data did not pass validation.' });
    });
});

router.patch('/:key', (req, res) => {
  storage
    .get('items', req.params.key)
    .then((value) => {
      if (value == null) {
        res.status(404).json({ error: 'Item not found.' });
      } else {
        const patchedValue = { ...value, ...req.body };

        ITEM_SCHEMA.validate(patchedValue)
          .then((validatedValue) => {
            storage
              .set('items', req.params.key, validatedValue)
              .then(() => {
                res.status(201).json(validatedValue);
              })
              .catch(() => {
                res.status(500).json({ error: 'Unable to patch item.' });
              });
          })
          .catch(() => {
            res
              .status(400)
              .json({ error: 'Given data did not pass validation.' });
          });
      }
    })
    .catch(() => {
      res.status(500).json({ error: 'Unable to retrieve item.' });
    });
});

router.delete('/:key', (req, res) => {
  storage
    .delete('items', req.params.key)
    .then((found) => {
      if (found) {
        res.status(201).json({ message: 'Item deleted.' });
      } else {
        res.status(404).json({ error: 'Item not found.' });
      }
    })
    .catch(() => {
      res.status(500).json({ error: 'Unable to delete item.' });
    });
});
