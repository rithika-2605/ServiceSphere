import express from 'express';
import {
  showAllServices,
  filterServices,
  searchByName,
  postSearch,
  filterServicesAPI,
  searchByNameAPI
} from '../controllers/serviceController.js';

const router = express.Router();

router.get('/search', showAllServices);
router.get('/search/filter', filterServices);
router.get('/search/search', searchByName);
router.post('/search', postSearch);

//After changes - dhtml 
router.get('/api/services/filter', filterServicesAPI);
router.get('/api/services/search', searchByNameAPI);

export default router;
