const sendResponse = (res, statusCode, statusMessage, data, ...results) => {
  res.status(statusCode).json({
    status: statusMessage,
    results: results[0],
    data: {
      data: data,
    },
  });
};

export default sendResponse;
