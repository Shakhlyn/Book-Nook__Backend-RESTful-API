const sendResponse = (res, statusCode, status, data, ...results) => {
  res.status(statusCode).json({
    status: status,
    results: results[0],
    data: {
      data: data,
    },
  });
};

export default sendResponse;
