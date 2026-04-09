const hotelFilter = (query) => {
    let mongoQuery = {};

    if (query.province) {
        const provinces = query.province.split(',');
        mongoQuery.province = { $in: provinces };
    }

    if (query.priceRange) {
        const p = query.priceRange;
        if (p === '1') mongoQuery.price = { $lt: 30 };
        else if (p === '2') mongoQuery.price = { $gte: 30, $lt: 80 };
        else if (p === '3') mongoQuery.price = { $gte: 80, $lt: 200 };
        else if (p === '4') mongoQuery.price = { $gte: 200 };
    }

    if (query.review) {
        const types = query.accommodationType.split(',');
        mongoQuery.accommodationType = { $in: types };
    }

    if (query.accommodationType) {
        mongoQuery.accommodationType = query.accommodationType;
    }

    if (query.facility) {
        const facilities = query.facility.split(',');
        mongoQuery["specializations.facility"] = { $all: facilities };
    }

    return mongoQuery;
};

module.exports = hotelFilter;