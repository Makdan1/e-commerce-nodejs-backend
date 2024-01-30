

function errorHandler(err, req, res, next){
    if(err.name === 'UnauthorizedError'){
        res.status(401).json({message:"The user is not authorized"})
    }
    if (err.name === 'ValidationError'){
        return res.status(401).json({message: err})
    }
    return res.status(500).json({message: err})
    // err,req,res, next => {
    //     if(err){
    //       res.status(500).json({message:"error in the server"})
    //     }
    //   })
}

module.exports = errorHandler;