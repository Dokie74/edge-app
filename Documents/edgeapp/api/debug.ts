module.exports = async function handler(req, res) {
  try {
    console.log('🐛 Debug function called');
    
    // Test basic response
    res.status(200).json({
      success: true,
      message: 'Debug function works',
      method: req.method,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('Debug function error:', error);
    res.status(500).json({
      error: 'Debug function failed',
      detail: error.message
    });
  }
}