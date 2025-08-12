import express from 'express';
import { 
  getProducts, 
  getProduct, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  getLowStockProducts,
  updateStock,
  getProductMovements
} from '../controllers/productController';
import { protect, authorize } from '../../../middleware/auth';

const router = express.Router();

// Product routes
router.route('/')
  .get(protect, getProducts)
  .post(protect, authorize('admin', 'manager'), createProduct);

router.route('/low-stock')
  .get(protect, getLowStockProducts);

router.route('/:id')
  .get(protect, getProduct)
  .put(protect, authorize('admin', 'manager'), updateProduct)
  .delete(protect, authorize('admin'), deleteProduct);

router.route('/:id/stock')
  .put(protect, authorize('admin', 'manager'), updateStock);

router.route('/:id/movements')
  .get(protect, getProductMovements);

export default router;
