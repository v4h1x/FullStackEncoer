import { Router } from 'express';
var router = Router();

router.get('/', function(req, res) {
  res.send('Video Transcoder 0.1');
});

export default router;
