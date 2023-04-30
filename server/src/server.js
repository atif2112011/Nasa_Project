
const http=require('http')
const mongoose=require('mongoose')
const app=require('./app')
const { loadPlanetsData }=require('./models/planets.model')
const { loadLaunchesData }=require('./models/launches.model')
const PORT=process.env.PORT || 8000;
const MONGO_URL='mongodb+srv://nasa-api:6ybvrxwT4vmnuCkV@cluster0.pdd585k.mongodb.net/?retryWrites=true&w=majority'
mongoose.connection.once('open',()=>{
    console.log('MongoDb connection ready')
})
mongoose.connection.on('error',(err)=>{
    console.error(err)
})
const server=http.createServer(app)
async function startServer(){
   await mongoose.connect(MONGO_URL,
//     {
//     useNewUrlParser:true,
//     useFindAndModify:false,
//     useCreateIndex:true,
//     useUnifiedTopology:true,
//    }
)
await loadPlanetsData();
await loadLaunchesData();
server.listen(PORT,()=>{
    console.log(`Listening on port ${PORT}....`)
})
}
startServer();


// app.listen();
// console.log(PORT);