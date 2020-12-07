var util = {};

util.getPostQueryString = function(req, res, next){
  res.locals.getPostQueryString = function(isAppended=false, overwrites={}){    
    var queryString = '';
    var queryArray = [];
    var searchText = overwrites.searchText?overwrites.searchText:(req.query.searchText?req.query.searchText:''); // 1

    if(searchText) queryArray.push('searchText='+searchText); // 1

    if(queryArray.length>0) queryString = (isAppended?'&':'?') + queryArray.join('&');

    return queryString;
  }
  next();
}

module.exports = util;