const axios=require("axios")

const launchesDatabase=require('./launches.mongo')

const planets=require('./planets.mongo'
)

// const launches=new Map();
latestFlightNumber=100;


const SPACEX_API_URL="https://api.spacexdata.com/v4/launches/query";

async function populateLaunches(){
    console.log("Downloading Data from SpaceX api")
    const response=await axios.post(SPACEX_API_URL,{
        query:{},
        options:{
            pagination:false,
            populate:
            [
                {
                    path:'rocket',
                    select:{
                        name:1
                    }
                },
                {
                    path:'payloads',
                    select:{
                        customers:1
                    }
                }
            ]
        }
    })

    const launchDocs=response.data.docs;

    if(response.status!=200){
        console.log('Problem downloading launch data')
        throw new Error('Launch data download failed')
    }
    for(const launchDoc of launchDocs)
    {
        const payloads=launchDoc['payloads'];
        const customers=payloads.flatMap((payload)=>{
            return payload['customers']
        })
        const launch={
            flightNumber:launchDoc['flight_number'],
            mission: launchDoc['name'],
            rocket: launchDoc['rocket']['name'],
            launchDate:launchDoc['date_local'],
            // target: 'Kepler-442 b',//not applicable
            customers,
            upcoming:launchDoc['upcoming'],
            success:launchDoc['success']
        }
        // console.log(`Recieved Data :${launch.mission}`)

        await saveLaunch(launch);
    }
}

async function loadLaunchesData(){

    const firstLaunch=await findLaunch({
        flightNumber:1,
        rocket:'Falcon 1',
        mission:'FalconSat',
    })
    if(firstLaunch){
        console.log('Launch data was loaded');
        return;
    }
    else
    {
        await populateLaunches();
    }
    
    

}

async function findLaunch(filter){
    return await launchesDatabase.findOne(filter);
}

async function existsLaunchWithId(launchId){
    return await launchesDatabase.findOne({
        flightNumber:launchId
    });
}


async function getLatestFlightNumber(){
    const latestLaunch=await launchesDatabase.findOne().sort('-flightNumber');

    if(!latestLaunch)
    return 100;

    return latestLaunch.flightNumber
}
async function getAllLaunches(skip,limit){
    return await launchesDatabase
    .find({},{
        '_id':0,'__v':0,
    })
    .sort({flightNumber:1})
    .skip(skip)
    .limit(limit)

}

async function saveLaunch(launch){
await launchesDatabase.updateOne({
    flightNumber:launch.flightNumber

},launch,{
    upsert:true,
})
}

async function scheduleNewLaunch(launch)
{
    const planet=await planets.findOne({keplerName: launch.target})

    if(!planet){
        throw new Error('No matching planet')
    }

    const newFlightNumber=await getLatestFlightNumber()+1;

    const newLaunch=Object.assign(launch,{
        success:true,
        upcoming:true,
        customers:['ZTM','NASA'],
        flightNumber:newFlightNumber
    });

    await saveLaunch(newLaunch);


}
// function addNewLaunch(launch)
// {
    
//     latestFlightNumber++;
//     launches.set(
//         latestFlightNumber,
//         Object.assign(launch,{
//             success:true,
//             upcoming:true,
//             customers:['ZTM','NASA'],
//             flightNumber:latestFlightNumber}))
// }

async function abortLaunchById(launchId){
// const aborted=launchesDaaget(launchId);
// aborted.upcoming=false;
// aborted.success=false;
// return aborted;

 const aborted= await launchesDatabase.updateOne({
    flightNumber:launchId
 },
 {
    upcoming:false,
    success:false
 })

 return aborted.modifiedCount === 1;
};

// launches.set(launch.flightNumber,launch);
module.exports={
    loadLaunchesData,
    getAllLaunches,
    scheduleNewLaunch,
    existsLaunchWithId,
    abortLaunchById,
}