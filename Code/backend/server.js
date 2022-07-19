//create express app
const exp = require("express");
const app = exp();
const mclient=require("mongodb").MongoClient;
const path=require('path');
const expressAsyncHandler = require("express-async-handler");
app.use(exp.json());

//connect build with nodejs
app.use(exp.static(path.join(__dirname,'./build')))

//DB connection URL
const DBurl="mongodb+srv://rinku:Rinku%402002@cluster0.u9rsl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"

//connect with mongoDB server
mclient.connect(DBurl)
.then((client)=>{

  //get DB object
  let dbObj=client.db("nikhil");

  //create collection objects
  let calculatorCollectionObject=dbObj.collection("calculator");

  //sharing collection objects to APIs
  app.set("calculatorCollectionObject",calculatorCollectionObject);

  console.log("DB connection success")
})
.catch(err=>console.log('Error in DB connection ',err))

app.post(
    "/postdata",
    expressAsyncHandler(async (request, response) => {
      let calculatorCollectionObject = request.app.get("calculatorCollectionObject");
      let calcObj=request.body;
      await calculatorCollectionObject.insertOne(calcObj);
      response.send({ message: "Data inserted" });
    })
);

app.get(
    "/getdata",
    expressAsyncHandler(async (request, response) => {
      let calculatorCollectionObject = request.app.get("calculatorCollectionObject");
      let data = await calculatorCollectionObject.find().toArray();
      //send res
      response.send({ message: "Data", payload: data });
    })
  );

//dealing with page refresh
app.use('*', (request, response)=>{
  response.sendFile(path.join(__dirname, './build/index.html'))
})

//handling invalid paths
app.use((request, response, next) => {
  response.send({ message: `path ${request.url} is invalid` });
});

//error handling middleware
app.use((error, request, response, next) => {
  response.send({ message: "Error occurred", reason: `${error.message}` });
});

//assign port number
app.listen(4000, () => console.log("server listening on port 4000.."));

