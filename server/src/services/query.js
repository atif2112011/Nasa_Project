
function getPagination(query){
const DEFAULT_PAGE_LIMIT=0;//if zero then mongoDB will return all documents from the collection
    const limit=Math.abs(query.limit) || DEFAULT_PAGE_LIMIT;//convert string into a number;

    const page=Math.abs(query.page) || 1;
    const skip=(page-1)*limit;
    return {
        skip:skip,
        limit:limit
    }
}

module.exports={
    getPagination
}