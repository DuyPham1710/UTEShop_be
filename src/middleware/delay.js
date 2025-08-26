const delay = (req, res, next) => {
    // Simulate network delay 
    setTimeout(next, 100);
};

export default delay;
