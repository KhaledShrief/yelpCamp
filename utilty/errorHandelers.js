class ErrorHandelers extends Error{
    constructor(message,statsCode){
        super();
        this.message =message;
        this.statusCode = statsCode;
    }
}

module.exports= ErrorHandelers;