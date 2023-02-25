const express = require('express');
const router = express.Router();
const path = require('path');

// ^ - the beginning of string only $ - at the end of string only means this will only match if the route is /
// or the could request /index with or without .html
router.get('^/$|/index(.html)?',(req, res)=>{
    // send the file(pages/views) back by telling its location by going back .. then looking for views folder and finding the index.html 
    res.sendFile(path.join(__dirname, '..', 'views', 'index.html'));
});  

module.exports = router