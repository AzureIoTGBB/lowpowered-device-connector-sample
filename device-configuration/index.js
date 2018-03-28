module.exports = function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    //hard coding for now but this will have to go into a db / redis at some point
    var results ={        
         decoder:'',
         twin:''
    };

    if (req.query.type == 'Cayenne') {
        results = {
            decoder:'https://mqconnector.azurewebsites.net/api/decoder-lpp?code=7yevPP3NtQInDuoZx29XeaC/drRo14ZVScDfPPHnagz73qSc8Qi6mQ==',
            twin:'',
            formatter:'https://mqconnector.azurewebsites.net/api/formatter-pcs?code=SShlw1sbZUOI8pKaa2nOadZ1fa8Izqs4lrVWwdk9PgrAcaRGACaYEg=='
        };
    }
    else if (req.query.type == 'elsys') {
        results = {            
            decoder:'https://mqconnector.azurewebsites.net/api/decoder-elsys?code=bviEpbiH6eHH15tsxd8c3iUi4teabo5TBJ7YlmaJa5/Q7svjEq/UgQ==',
            twin:'',
            formatter:''
        };
    }    

    context.res = {status:200, body:results };
    context.done();
};