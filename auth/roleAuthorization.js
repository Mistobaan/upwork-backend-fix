// middleware for doing role-based permissions
module.exports = function permit(...permittedRoles) {
    // return a middleware
    return (request, response, next) => {
        const { user } = request;
        console.log("user role", user.role);
        console.log("permitted roles", permittedRoles);
        if (user && permittedRoles.includes(user.role)) {
            next(); // role is allowed, so continue on the next middleware
        } else {
            response.status(401).json({ message: "Forbidden" }); // user is forbidden
        }
    }
}