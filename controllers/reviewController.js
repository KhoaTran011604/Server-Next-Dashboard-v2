const reviewModel = require("../models/reviewModel");
const BaseResponse = require("./BaseResponse");

module.exports.GetAllReview = async (req, res) => {
  const response = new BaseResponse();
  try {
    const { keySearch, page = 1, pageSize = 10, sortField = "createdAt", sortOrder = "desc" } = req.body;

    const filter = {};
    if (keySearch) {
      filter.$or = [
        { comment: { $regex: keySearch, $options: "i" } },
        // nếu cần tìm theo userId hoặc productId string
        { userId: { $regex: keySearch, $options: "i" } },
        { productId: { $regex: keySearch, $options: "i" } },
      ];
    }

    const sortDirection = sortOrder.toLowerCase() === "asc" ? 1 : -1;
    const sortOptions = { [sortField]: sortDirection };

    const totalRecords = await reviewModel.countDocuments(filter);

    const data = await reviewModel.find(filter)
      .populate("userId", "fullName")
      .populate("productId")
      .sort(sortOptions)
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize));

    response.success = true;
    response.data = data;
    response.metaData = {
      totalRecords,
      totalPages: Math.ceil(totalRecords / pageSize),
      currentPage: parseInt(page),
      pageSize: parseInt(pageSize),
    };

    res.json(response);
  } catch (error) {
    response.success = false;
    response.message = error.toString();
    res.status(500).json(response);
  }
};

module.exports.GetAllReviewFK = async (req, res) => {
  const response = new BaseResponse();
  try {
    const data = await reviewModel.find()
      .populate("userId")
      .populate("productId")
      .sort({ createdAt: -1 });

    response.success = true;
    response.data = data;

    res.json(response);
  } catch (error) {
    response.success = false;
    response.message = error.toString();
    res.status(500).json(response);
  }
};

module.exports.SeachReview = async (req, res) => {
  const response = new BaseResponse();
  try {
    const { id } = req.params;

    if (!id) {
      response.success = false;
      response.message = "id is required";
      return res.status(400).json(response);
    }

    const result = await reviewModel.findById(id)
      .populate("userId")
      .populate("productId");

    if (!result) {
      response.success = false;
      response.message = "Data not found";
      return res.status(404).json(response);
    }

    response.success = true;
    response.data = result;
    res.json(response);
  } catch (error) {
    response.success = false;
    response.message = error.toString();
    res.status(500).json(response);
  }
};

module.exports.CreateReview = async (req, res) => {
  const response = new BaseResponse();
  try {
    const newReview = req.body;

    const result = await reviewModel.create(newReview);
    if (!result) {
      response.success = false;
      response.message = "Failed to create review";
      return res.json(response);
    }

    response.success = true;
    response.data = result._id;
    res.json(response);
  } catch (error) {
    response.success = false;
    response.message = error.toString();
    res.status(500).json(response);
  }
};

module.exports.UpdateReview = async (req, res) => {
  const response = new BaseResponse();
  try {
    const { id } = req.params;
    const updateData = req.body;

    const result = await reviewModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!result) {
      response.success = false;
      response.message = "Review not found";
      return res.json(response);
    }

    response.success = true;
    response.data = result._id;
    res.json(response);
  } catch (error) {
    response.success = false;
    response.message = error.toString();
    res.status(500).json(response);
  }
};

module.exports.DeleteReview = async (req, res) => {
  const response = new BaseResponse();
  try {
    const { id } = req.params;

    const result = await reviewModel.findByIdAndDelete(id);
    if (!result) {
      response.success = false;
      response.message = "Review not found";
      return res.json(response);
    }

    response.success = true;
    response.message = "Deleted successfully!";
    res.json(response);
  } catch (error) {
    response.success = false;
    response.message = error.toString();
    res.status(500).json(response);
  }
};
