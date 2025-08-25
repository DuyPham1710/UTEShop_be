const delay = (req, res, next) => {
    // Simulate network delay 
    setTimeout(next, 100);
};

module.exports = delay;
