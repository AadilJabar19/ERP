const express = require('express');

const createFallbackRouter = (moduleName) => {
  const router = express.Router();
  
  router.get('*', (req, res) => {
    res.json({
      message: `${moduleName} module is not fully configured yet`,
      status: 'coming_soon',
      data: []
    });
  });
  
  router.post('*', (req, res) => {
    res.status(501).json({
      message: `${moduleName} module is not fully configured yet`,
      status: 'not_implemented'
    });
  });
  
  return router;
};

module.exports = { createFallbackRouter };