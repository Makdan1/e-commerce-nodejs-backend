const { Order } = require("../models/order");
const express = require("express");
const { OrderItem } = require("../models/order-item");
const router = express.Router();


router.get(`/`, async (req, res) => {
  const orderList = await Order.find()
    .populate("user", "name phone")
    .sort({ dateOrdered: -1 });

  if (!orderList) {
    res.status(500).json({ success: false });
  }
  res.send(orderList);
});

router.get(`/:id`, async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name phone")
    .populate({
      path: "orderItems",
      populate: { path: "product", populate: "category" },
    });

  if (!order) {
    res.status(500).json({ success: false });
  }
  res.send(order);
});

router.put("/:id", async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
    },
    { new: true }
  );

  if (!order) return res.status(400).send("the order cannot be updated!");

  res.send(order);
});

router.delete("/:id", async (req, res) => {
  Order.findByIdAndRemove(req.params.id)
    .then(async (order) => {
      if (order) {
        await order.orderItems.map(async (orderItem) => {
          await OrderItem.findByIdAndRemove(orderItem)
        });
        return res.status(200).json({
          success: true,
          message: "the order is successfully deleted",
        });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "order not found" });
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: false, error: err });
    });
});

// {
//     "orderItems": [
//    {
//        "quantity": 10,
//        "product":"65b7e02158090924e94565a7"
//    },

//    {
//        "quantity": 5,
//        "product":"65b7eca6da1b274237e56761"
//    }

//     ],
//     "shippingAddress1": "Ondo Cresent",
//     "shippingAddress2": "Ondo",
//     "city": "Ondo city",
//     "zip": "102333",
//     "country": "Nigeria",
//     "phone": "08169545791",
//     "user": "65b90ac52822eb13d6a80f04"
// }
router.post("/", async (req, res) => {
  console.log(req.body);
  if (req.body != null) {
    const orderItemsIds = Promise.all(
      req.body.orderItems.map(async (orderItem) => {
        let newOrderItem = new OrderItem({
          quantity: orderItem.quantity,
          product: orderItem.product,
        });
        newOrderItem = await newOrderItem.save();
        return newOrderItem._id;
      })
    );
    const orderItemsIdsResolved = await orderItemsIds;

    const totalPrices = await Promise.all(orderItemsIdsResolved.map(async orderItemsIds =>{
        const orderItem = await OrderItem.findById(orderItemsIds).populate('product')
        const totalPrice = orderItem.product.price * orderItem.quantity;
        return totalPrice
    }))
    const totalPrice = totalPrices.reduce((a,b) => a + b, 0);

    console.log(totalPrices)
    console.log(totalPrice)

    let order = new Order({
      orderItems: orderItemsIdsResolved,
      shippingAddress1: req.body.shippingAddress1,
      shippingAddress2: req.body.shippingAddress2,
      city: req.body.city,
      zip: req.body.zip,
      country: req.body.country,
      phone: req.body.phone,
      status: req.body.status,
      totalPrice: totalPrice ,
      user: req.body.user,
    });

    order = await order.save();

    if (!order) return res.status(400).send("the order cannot be created!");

    res.send(order);
  } else {
    return res.status(400).send({
      success: false,
      message: "Cannot be empty",
    });
  }
});

// Get total sales
router.get(`/get/totalsales`, async (req, res) => {
    const totalSales = await Order.aggregate([
        {
            $group:{ _id: null, totalsales : {$sum : '$totalPrice'}}
        }
    ])
    if(!totalSales){
        return res.status(400).send('The order sales cannot be generated')
    }
    res.send({totalsales:totalSales.pop().totalsales})
  });

  // Get count
  router.get("/get/count", async (req, res) => {
    const orderCount = await Order.countDocuments((count) => count);
  
    if (!orderCount) {
      res.status(500).json({ success: false });
    }
    res.send({
      count: orderCount,
    });
  });

  // Get cart order per user

  router.get(`/get/userorders/:userId`, async (req, res) => {
    const userOrderList = await Order.find({user:req.params.userId})
      .populate({
        path: "orderItems",
        populate: { path: "product", populate: "category" },
      }).sort({"dateOrdered": -1});
  
    if (!userOrderList) {
      res.status(500).json({ success: false });
    }
    res.send(userOrderList);
  });
module.exports = router;
