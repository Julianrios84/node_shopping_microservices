const ProductService = require('../services/product-service');
const { PublishCustomerEvent, PublishShoppingEvent } = require('../utils');
const UserAuth = require('./middlewares/auth')

module.exports = (app) => {

  const service = new ProductService();


  app.post('/product/create', async (req, res, next) => {

    try {
      const { name, desc, type, unit, price, available, suplier, banner } = req.body;
      // validation
      const { data } = await service.CreateProduct({ name, desc, type, unit, price, available, suplier, banner });
      return res.json(data);

    } catch (err) {
      next(err)
    }

  });

  app.get('/category/:type', async (req, res, next) => {

    const type = req.params.type;

    try {
      const { data } = await service.GetProductsByCategory(type)
      return res.status(200).json(data);

    } catch (err) {
      next(err)
    }

  });

  app.get('/:id', async (req, res, next) => {

    const productId = req.params.id;

    try {
      const { data } = await service.GetProductDescription(productId);
      return res.status(200).json(data);

    } catch (err) {
      next(err)
    }

  });

  app.post('/ids', async (req, res, next) => {

    try {
      const { ids } = req.body;
      const products = await service.GetSelectedProducts(ids);
      return res.status(200).json(products);

    } catch (err) {
      next(err)
    }

  });

  app.put('/wishlist', UserAuth, async (req, res, next) => {

    const { _id } = req.user;

    try {
      const product = await service.GetProductById(req.body._id);
      const wishList = await customerService.AddToWishlist(_id, product)
      return res.status(200).json(wishList);
    } catch (err) {

    }
  });

  app.delete('/wishlist/:id', UserAuth, async (req, res, next) => {

    const { _id } = req.user;
    const productId = req.params.id;

    try {
      const product = await service.GetProductById(productId);
      const wishlist = await customerService.AddToWishlist(_id, product)
      return res.status(200).json(wishlist);
    } catch (err) {
      next(err)
    }
  });


  app.put('/cart', UserAuth, async (req, res, next) => {

    const { _id, qty } = req.body;

    // get payload // to send to custemer service
    const { data } = await service.GetProductPayload(_id, { productId: req.body._id }, 'ADD_TO_WISHLIST');

    try {

      PublishCustomerEvent(data);
      return res.status(200).json(data.data.product);

    } catch (err) {
      next(err)
    }
  });

  app.delete('/cart/:id', UserAuth, async (req, res, next) => {

    const { _id } = req.user;

    try {
      const product = await service.GetProductById(req.params.id);
      const result = await customerService.ManageCart(_id, product, 0, true);
      return res.status(200).json(result);
    } catch (err) {
      next(err)
    }
  });

  //get Top products and category
  app.get('/', async (req, res, next) => {
    //check validation
    try {
      const { data } = await service.GetProducts();
      return res.status(200).json(data);
    } catch (error) {
      next(err)
    }

  });

}